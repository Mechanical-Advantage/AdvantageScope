// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "./Log";
import { RobotMode, getAutonomousData, getRobotStateRanges, getUtilityData } from "./RobotState";

type NormalizedStateRange = {
  start: number;
  end: number;
  mode: RobotMode;
};

type StateTransition = {
  timestamp: number;
  fromMode: RobotMode;
  toMode: RobotMode;
};

type CandidateOffset = {
  offset: number;
  preferRising: boolean;
};

type ResidualSample = {
  offset: number;
  isRising: boolean;
};

// Minimum delay (seconds) from log start to first enabled sample to treat it as a rising transition rather than starting mid-enable
const START_ENABLED_GAP_THRESHOLD = 0.1;
// Floating-point tolerance when comparing coarse alignment scores for tie-breaking
const SCORE_EPSILON = 1e-6;
// Maximum time error (seconds) from the coarse offset for a transition pair to be considered an inlier
const INLIER_TOLERANCE = 1.0;
// Maximum disagreement (seconds) between two matched transitions before preferring the rising edge over their mean
const TWO_EDGE_MAX_SPAN = 0.25;
// Maximum span (seconds) for grouping transition offsets into a tight consensus cluster
const CLUSTER_SPAN_LIMIT = 0.1;
// Minimum radius (seconds) around the core cluster mean for including final inlier transitions
const MIN_INLIER_RADIUS = 0.08;
// Maximum radius (seconds) around the core cluster mean for including final inlier transitions
const MAX_INLIER_RADIUS = 0.2;
// Multiplier applied to the core cluster span to determine the adaptive inlier radius
const INLIER_SPAN_MULTIPLIER = 2.5;

// Score reward per second when both logs are enabled in the same mode (or when one lacks mode info)
const WEIGHT_MODE_MATCH = 1.0;
// Score reward per second when both logs are enabled but in different modes (e.g. auto vs teleop)
const WEIGHT_MODE_MISMATCH = 0.25;
// Score penalty per second when one log is enabled and the other is disabled within the shared window
const PENALTY_STATE_MISMATCH = 0.25;
// Score penalty per second for enabled time that falls outside the other log's timestamp range
const PENALTY_OUTSIDE_WINDOW = 0.1;

/**
 * Calculates the best-fit timestamp offset to align `source` into `target`.
 *
 * Uses a two-stage approach:
 * 1. Coarse alignment via mode-aware interval cross-correlation across candidate offsets.
 * 2. Fine alignment by matching inlier state transitions and computing a robust consensus mean.
 */
export function getMergeOffset(target: Log, source: Log): number {
  const targetRange = target.getTimestampRange();
  const sourceRange = source.getTimestampRange();
  const fallbackOffset = targetRange[0] - sourceRange[0];

  const targetRanges = getNormalizedRanges(target, targetRange);
  const sourceRanges = getNormalizedRanges(source, sourceRange);
  if (targetRanges.length === 0 || sourceRanges.length === 0) {
    return fallbackOffset;
  }

  const bothHaveModeInfo = hasModeInfo(target) && hasModeInfo(source);
  const targetTransitions = getTransitions(targetRanges);
  const sourceTransitions = getTransitions(sourceRanges);

  const coarseOffset = findCoarseOffset(
    targetRange,
    sourceRange,
    targetRanges,
    sourceRanges,
    targetTransitions,
    sourceTransitions,
    bothHaveModeInfo
  );
  if (coarseOffset === null) {
    return fallbackOffset;
  }

  return refineOffsetWithTransitions(coarseOffset, targetTransitions, sourceTransitions, bothHaveModeInfo);
}

/** Checks whether a log contains autonomous or utility mode data in addition to enabled state. */
function hasModeInfo(log: Log): boolean {
  return getAutonomousData(log) !== null || getUtilityData(log) !== null;
}

/**
 * Normalizes the output of `getRobotStateRanges` into a contiguous partition of `[logRange[0], logRange[1]]`.
 * Returns an empty array if the log never enters an enabled state.
 */
function getNormalizedRanges(log: Log, logRange: [number, number]): NormalizedStateRange[] {
  const rawRanges = getRobotStateRanges(log);
  if (!rawRanges.some((range) => range.mode !== "disabled")) {
    return [];
  }

  const ranges: NormalizedStateRange[] = rawRanges.map((range) => ({
    start: range.start,
    end: range.end ?? Math.max(range.start, logRange[1]),
    mode: range.mode
  }));

  if (ranges[0].start > logRange[0]) {
    if (ranges[0].mode === "disabled") {
      ranges[0].start = logRange[0];
    } else if (ranges[0].start - logRange[0] > START_ENABLED_GAP_THRESHOLD) {
      ranges.unshift({
        start: logRange[0],
        end: ranges[0].start,
        mode: "disabled"
      });
    } else {
      ranges[0].start = logRange[0];
    }
  }

  const lastRange = ranges[ranges.length - 1];
  if (lastRange.end < logRange[1]) {
    lastRange.end = logRange[1];
  }

  return ranges;
}

/** Extracts state transitions from the internal boundaries between normalized state ranges. */
function getTransitions(ranges: NormalizedStateRange[]): StateTransition[] {
  const transitions: StateTransition[] = [];
  for (let i = 0; i < ranges.length - 1; i++) {
    const fromMode = ranges[i].mode;
    const toMode = ranges[i + 1].mode;
    if (fromMode !== toMode) {
      transitions.push({
        timestamp: ranges[i].end,
        fromMode,
        toMode
      });
    }
  }
  return transitions;
}

/** Determines whether two state transitions have compatible directions and modes. */
function transitionsCompatible(a: StateTransition, b: StateTransition, bothHaveModeInfo: boolean): boolean {
  const bothRising = a.fromMode === "disabled" && b.fromMode === "disabled";
  const bothFalling = a.toMode === "disabled" && b.toMode === "disabled";
  if (bothRising || bothFalling) return true;

  if (a.fromMode !== "disabled" && a.toMode !== "disabled" && b.fromMode !== "disabled" && b.toMode !== "disabled") {
    return !bothHaveModeInfo || (a.fromMode === b.fromMode && a.toMode === b.toMode);
  }
  return false;
}

/**
 * Generates candidate offsets from transitions and enabled interval boundaries,
 * returning the candidate with the highest interval cross-correlation score.
 */
function findCoarseOffset(
  targetRange: [number, number],
  sourceRange: [number, number],
  targetRanges: NormalizedStateRange[],
  sourceRanges: NormalizedStateRange[],
  targetTransitions: StateTransition[],
  sourceTransitions: StateTransition[],
  bothHaveModeInfo: boolean
): number | null {
  const candidates: CandidateOffset[] = [];

  targetTransitions.forEach((tTrans) => {
    sourceTransitions.forEach((sTrans) => {
      if (transitionsCompatible(tTrans, sTrans, bothHaveModeInfo)) {
        candidates.push({
          offset: tTrans.timestamp - sTrans.timestamp,
          preferRising: tTrans.fromMode === "disabled" && sTrans.fromMode === "disabled"
        });
      }
    });
  });

  // Include enabled interval boundaries in case a log started or ended while already enabled
  targetRanges.forEach((tRange) => {
    if (tRange.mode === "disabled") return;
    sourceRanges.forEach((sRange) => {
      if (sRange.mode === "disabled") return;
      candidates.push({ offset: tRange.start - sRange.start, preferRising: false });
      candidates.push({ offset: tRange.end - sRange.end, preferRising: false });
    });
  });

  if (candidates.length === 0) {
    return null;
  }

  const totalTargetEnabled = getTotalEnabledDuration(targetRanges);
  const totalSourceEnabled = getTotalEnabledDuration(sourceRanges);

  let bestOffset = candidates[0].offset;
  let bestScore = -Infinity;
  let bestEnabledOverlap = 0;
  let bestPreferRising = false;

  candidates.forEach((candidate) => {
    const { score, enabledOverlap } = scoreCandidateOffset(
      candidate.offset,
      targetRange,
      sourceRange,
      targetRanges,
      sourceRanges,
      totalTargetEnabled,
      totalSourceEnabled,
      bothHaveModeInfo
    );
    const isBetterScore = score > bestScore + SCORE_EPSILON;
    const isTieBreakingRising =
      Math.abs(score - bestScore) <= SCORE_EPSILON && candidate.preferRising && !bestPreferRising;

    if (isBetterScore || isTieBreakingRising) {
      bestScore = score;
      bestOffset = candidate.offset;
      bestEnabledOverlap = enabledOverlap;
      bestPreferRising = candidate.preferRising;
    }
  });

  if (bestEnabledOverlap <= 0 && totalTargetEnabled > 0 && totalSourceEnabled > 0) {
    return null;
  }

  return bestOffset;
}

/** Computes the total duration of all non-disabled ranges. */
function getTotalEnabledDuration(ranges: NormalizedStateRange[]): number {
  return ranges.reduce((sum, r) => sum + (r.mode !== "disabled" ? r.end - r.start : 0), 0);
}

/** Scores a candidate offset by sweeping through the overlapping time window of both logs. */
function scoreCandidateOffset(
  offset: number,
  targetRange: [number, number],
  sourceRange: [number, number],
  targetRanges: NormalizedStateRange[],
  sourceRanges: NormalizedStateRange[],
  totalTargetEnabled: number,
  totalSourceEnabled: number,
  bothHaveModeInfo: boolean
): { score: number; enabledOverlap: number } {
  const windowStart = Math.max(targetRange[0], sourceRange[0] + offset);
  const windowEnd = Math.min(targetRange[1], sourceRange[1] + offset);
  if (windowEnd < windowStart) {
    return { score: -Infinity, enabledOverlap: 0 };
  }

  let enabledOverlap = 0;
  let modeMatchedOverlap = 0;
  let modeMismatchedOverlap = 0;
  let mismatchDuration = 0;

  let i = 0;
  let j = 0;
  while (i < targetRanges.length && j < sourceRanges.length) {
    const tRange = targetRanges[i];
    const sRange = sourceRanges[j];
    const sStart = sRange.start + offset;
    const sEnd = sRange.end + offset;

    const overlapStart = Math.max(windowStart, tRange.start, sStart);
    const overlapEnd = Math.min(windowEnd, tRange.end, sEnd);
    if (overlapEnd > overlapStart) {
      const duration = overlapEnd - overlapStart;
      const tEnabled = tRange.mode !== "disabled";
      const sEnabled = sRange.mode !== "disabled";
      if (tEnabled && sEnabled) {
        enabledOverlap += duration;
        if (!bothHaveModeInfo || tRange.mode === sRange.mode) {
          modeMatchedOverlap += duration;
        } else {
          modeMismatchedOverlap += duration;
        }
      } else if (tEnabled !== sEnabled) {
        mismatchDuration += duration;
      }
    }

    if (tRange.end < sEnd) {
      i++;
    } else {
      j++;
    }
  }

  const outsideEnabled = Math.max(0, totalTargetEnabled + totalSourceEnabled - 2 * enabledOverlap - mismatchDuration);
  const score =
    modeMatchedOverlap * WEIGHT_MODE_MATCH +
    modeMismatchedOverlap * WEIGHT_MODE_MISMATCH -
    mismatchDuration * PENALTY_STATE_MISMATCH -
    outsideEnabled * PENALTY_OUTSIDE_WINDOW;

  return { score, enabledOverlap };
}

/**
 * Pairs inlier transitions near the coarse offset and computes a refined offset
 * using consensus clustering / Shortest Half + reweighted inlier mean.
 */
function refineOffsetWithTransitions(
  coarseOffset: number,
  targetTransitions: StateTransition[],
  sourceTransitions: StateTransition[],
  bothHaveModeInfo: boolean
): number {
  const residuals = matchInlierTransitions(coarseOffset, targetTransitions, sourceTransitions, bothHaveModeInfo);

  if (residuals.length === 0) {
    return coarseOffset;
  }
  if (residuals.length === 1) {
    return residuals[0].offset;
  }

  residuals.sort((a, b) => a.offset - b.offset);

  if (residuals.length === 2) {
    const span = residuals[1].offset - residuals[0].offset;
    if (span <= TWO_EDGE_MAX_SPAN || residuals[0].isRising === residuals[1].isRising) {
      return (residuals[0].offset + residuals[1].offset) / 2;
    }
    return residuals[0].isRising ? residuals[0].offset : residuals[1].offset;
  }

  const { cluster, span } = findCoreCluster(residuals);
  const coreMean = meanOffset(cluster);
  const inlierRadius = Math.max(MIN_INLIER_RADIUS, Math.min(MAX_INLIER_RADIUS, span * INLIER_SPAN_MULTIPLIER));
  const inliers = residuals.filter((item) => Math.abs(item.offset - coreMean) <= inlierRadius);
  return meanOffset(inliers);
}

/** Greedily pairs 1-to-1 compatible transitions within `INLIER_TOLERANCE` of `coarseOffset`. */
function matchInlierTransitions(
  coarseOffset: number,
  targetTransitions: StateTransition[],
  sourceTransitions: StateTransition[],
  bothHaveModeInfo: boolean
): ResidualSample[] {
  const candidatePairs: {
    tIndex: number;
    sIndex: number;
    offset: number;
    error: number;
    exactModeMatch: boolean;
    isRising: boolean;
  }[] = [];

  targetTransitions.forEach((tTrans, tIndex) => {
    sourceTransitions.forEach((sTrans, sIndex) => {
      if (!transitionsCompatible(tTrans, sTrans, bothHaveModeInfo)) return;
      const offset = tTrans.timestamp - sTrans.timestamp;
      const error = Math.abs(offset - coarseOffset);
      if (error <= INLIER_TOLERANCE) {
        candidatePairs.push({
          tIndex,
          sIndex,
          offset,
          error,
          exactModeMatch: !bothHaveModeInfo || (tTrans.fromMode === sTrans.fromMode && tTrans.toMode === sTrans.toMode),
          isRising: tTrans.fromMode === "disabled" && sTrans.fromMode === "disabled"
        });
      }
    });
  });

  candidatePairs.sort((a, b) => {
    if (a.exactModeMatch !== b.exactModeMatch) {
      return a.exactModeMatch ? -1 : 1;
    }
    return a.error - b.error;
  });

  const usedTarget = new Set<number>();
  const usedSource = new Set<number>();
  const matchedResiduals: ResidualSample[] = [];

  candidatePairs.forEach((pair) => {
    if (!usedTarget.has(pair.tIndex) && !usedSource.has(pair.sIndex)) {
      usedTarget.add(pair.tIndex);
      usedSource.add(pair.sIndex);
      matchedResiduals.push({ offset: pair.offset, isRising: pair.isRising });
    }
  });

  return matchedResiduals;
}

/**
 * Finds the largest consensus cluster of transition offsets within `CLUSTER_SPAN_LIMIT`,
 * falling back to the Shortest Half (Least Median of Squares) window if no tight cluster exists.
 */
function findCoreCluster(residuals: ResidualSample[]): { cluster: ResidualSample[]; span: number } {
  let cluster: ResidualSample[] = [];
  let bestSpan = Infinity;

  for (let i = 0; i < residuals.length; i++) {
    for (let j = i; j < residuals.length; j++) {
      const span = residuals[j].offset - residuals[i].offset;
      if (span > CLUSTER_SPAN_LIMIT) break;
      const count = j - i + 1;
      if (count > cluster.length || (count === cluster.length && span < bestSpan)) {
        cluster = residuals.slice(i, j + 1);
        bestSpan = span;
      }
    }
  }

  if (cluster.length >= 2) {
    return { cluster, span: bestSpan };
  }

  const halfSize = Math.floor(residuals.length / 2) + 1;
  bestSpan = Infinity;
  for (let i = 0; i <= residuals.length - halfSize; i++) {
    const span = residuals[i + halfSize - 1].offset - residuals[i].offset;
    if (span < bestSpan) {
      bestSpan = span;
      cluster = residuals.slice(i, i + halfSize);
    }
  }

  return { cluster, span: bestSpan };
}

/** Computes the arithmetic mean of residual offsets. */
function meanOffset(samples: ResidualSample[]): number {
  return samples.reduce((sum, item) => sum + item.offset, 0) / samples.length;
}
