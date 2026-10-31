// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// A time-indexed transform tree (the tf2 model): each child frame has one parent, and each edge holds a
// time series of child-in-parent transforms (static edges hold one). Lookups interpolate between samples
// and report *why* a frame could not be resolved, so the 3D tab can show it instead of dropping the object.

import { Transform, compose, identity, interpolate, invert, isFiniteTransform } from "./Transform";

/** Transforms more than this far past the newest (or before the oldest) sample count as extrapolated. */
export const DEFAULT_EXTRAPOLATION_TOLERANCE_S = 0.25;

export type TFLookup =
  | {
      status: "ok" | "extrapolated";
      /** Pose of the source frame in the target frame (target ← source). */
      transform: Transform;
      /** Largest gap between the lookup time and the nearest sample on the chain (0 for static chains). */
      extrapolationS: number;
    }
  | { status: "unknown-frame"; frame: string }
  | { status: "disconnected"; sourceRoot: string; targetRoot: string };

interface EdgeSamples {
  parent: string;
  isStatic: boolean;
  times: number[];
  transforms: Transform[];
}

/** Strips the leading slash some publishers put on frame ids ("/map" and "map" are the same frame). */
export function normalizeFrameId(frame: string): string {
  return frame.startsWith("/") ? frame.slice(1) : frame;
}

export class TFTree {
  private edges = new Map<string, EdgeSamples>(); // child -> edge
  private extrapolationToleranceS: number;

  constructor(extrapolationToleranceS = DEFAULT_EXTRAPOLATION_TOLERANCE_S) {
    this.extrapolationToleranceS = extrapolationToleranceS;
  }

  /** Adds a child-in-parent transform. Samples should arrive roughly in time order; others are inserted. */
  addTransform(parent: string, child: string, time: number, transform: Transform, isStatic = false) {
    parent = normalizeFrameId(parent);
    child = normalizeFrameId(child);
    if (parent === "" || child === "" || parent === child || !Number.isFinite(time) || !isFiniteTransform(transform))
      return;
    let ancestor: string | null = parent;
    const seen = new Set<string>();
    while (ancestor !== null) {
      if (ancestor === child || seen.has(ancestor)) return;
      seen.add(ancestor);
      ancestor = this.getParent(ancestor);
    }
    let edge = this.edges.get(child);
    if (edge === undefined || edge.parent !== parent || edge.isStatic !== isStatic) {
      // A re-parented frame (or static/dynamic switch) replaces the old edge, as in tf2
      if (edge !== undefined && !isStatic && edge.isStatic) return; // Static wins over dynamic for the same child
      edge = { parent: parent, isStatic: isStatic, times: [], transforms: [] };
      this.edges.set(child, edge);
    }
    if (isStatic) {
      edge.times = [time];
      edge.transforms = [transform];
      return;
    }
    const n = edge.times.length;
    if (n === 0 || time > edge.times[n - 1]) {
      edge.times.push(time);
      edge.transforms.push(transform);
    } else if (time === edge.times[n - 1]) {
      edge.transforms[n - 1] = transform;
    } else {
      const index = lowerBound(edge.times, time);
      if (edge.times[index] === time) {
        edge.transforms[index] = transform;
      } else {
        edge.times.splice(index, 0, time);
        edge.transforms.splice(index, 0, transform);
      }
    }
  }

  clear(): void {
    this.edges.clear();
  }

  /** All frames known to the tree, sorted. */
  getFrames(): string[] {
    const frames = new Set<string>();
    this.edges.forEach((edge, child) => {
      frames.add(child);
      frames.add(edge.parent);
    });
    return [...frames].sort();
  }

  hasFrame(frame: string): boolean {
    frame = normalizeFrameId(frame);
    if (this.edges.has(frame)) return true;
    for (const edge of this.edges.values()) {
      if (edge.parent === frame) return true;
    }
    return false;
  }

  getParent(frame: string): string | null {
    return this.edges.get(normalizeFrameId(frame))?.parent ?? null;
  }

  /** The root frame of the tree that contains `frame`. */
  getRoot(frame: string): string {
    let current = normalizeFrameId(frame);
    const seen = new Set<string>();
    while (this.edges.has(current) && !seen.has(current)) {
      seen.add(current);
      current = this.edges.get(current)!.parent;
    }
    return current;
  }

  /** Root frames, largest tree first (a good default fixed frame). */
  getRoots(): string[] {
    const sizes = new Map<string, number>();
    this.getFrames().forEach((frame) => {
      const root = this.getRoot(frame);
      sizes.set(root, (sizes.get(root) ?? 0) + 1);
    });
    return [...sizes.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map(([root]) => root);
  }

  /** Time range covered by the dynamic edges, or null if there are none. */
  getTimeRange(): [number, number] | null {
    let range: [number, number] | null = null;
    this.edges.forEach((edge) => {
      if (edge.isStatic || edge.times.length === 0) return;
      const first = edge.times[0],
        last = edge.times[edge.times.length - 1];
      range = range === null ? [first, last] : [Math.min(range[0], first), Math.max(range[1], last)];
    });
    return range;
  }

  /** Pose of `source` in `target` at `time`. */
  lookup(target: string, source: string, time: number): TFLookup {
    target = normalizeFrameId(target);
    source = normalizeFrameId(source);
    if (target === "" || source === "") return { status: "unknown-frame", frame: "" };
    if (target === source) return { status: "ok", transform: identity(), extrapolationS: 0 };
    if (!this.hasFrame(source)) return { status: "unknown-frame", frame: source };
    if (!this.hasFrame(target)) return { status: "unknown-frame", frame: target };

    // Chains to the root, as lists of frames
    const sourceChain = this.chainToRoot(source);
    const targetChain = this.chainToRoot(target);
    const targetIndex = new Map(targetChain.map((frame, index) => [frame, index]));
    let common: string | null = null;
    let sourceDepth = 0;
    for (let i = 0; i < sourceChain.length; i++) {
      if (targetIndex.has(sourceChain[i])) {
        common = sourceChain[i];
        sourceDepth = i;
        break;
      }
    }
    if (common === null) {
      return {
        status: "disconnected",
        sourceRoot: sourceChain[sourceChain.length - 1],
        targetRoot: targetChain[targetChain.length - 1]
      };
    }
    const targetDepth = targetIndex.get(common)!;

    let extrapolationS = 0;
    const edgeAt = (child: string): Transform => {
      const sample = this.sampleEdge(this.edges.get(child)!, time);
      extrapolationS = Math.max(extrapolationS, sample.gap);
      return sample.transform;
    };
    // common ← source
    let commonFromSource = identity();
    for (let i = sourceDepth - 1; i >= 0; i--) {
      commonFromSource = compose(commonFromSource, edgeAt(sourceChain[i]));
    }
    // common ← target
    let commonFromTarget = identity();
    for (let i = targetDepth - 1; i >= 0; i--) {
      commonFromTarget = compose(commonFromTarget, edgeAt(targetChain[i]));
    }
    return {
      status: extrapolationS > this.extrapolationToleranceS ? "extrapolated" : "ok",
      transform: compose(invert(commonFromTarget), commonFromSource),
      extrapolationS: extrapolationS
    };
  }

  private chainToRoot(frame: string): string[] {
    const chain = [frame];
    const seen = new Set([frame]);
    let current = frame;
    while (this.edges.has(current)) {
      current = this.edges.get(current)!.parent;
      if (seen.has(current)) break; // Cycle (bad data): stop
      seen.add(current);
      chain.push(current);
    }
    return chain;
  }

  private sampleEdge(edge: EdgeSamples, time: number): { transform: Transform; gap: number } {
    const times = edge.times;
    if (edge.isStatic || times.length === 1) {
      return { transform: edge.transforms[0], gap: edge.isStatic ? 0 : Math.abs(time - times[0]) };
    }
    if (time <= times[0]) return { transform: edge.transforms[0], gap: times[0] - time };
    const last = times.length - 1;
    if (time >= times[last]) return { transform: edge.transforms[last], gap: time - times[last] };
    const upper = lowerBound(times, time);
    const lower = upper - 1;
    const t = (time - times[lower]) / (times[upper] - times[lower]);
    return { transform: interpolate(edge.transforms[lower], edge.transforms[upper], t), gap: 0 };
  }
}

/** First index with array[index] >= value. */
function lowerBound(array: number[], value: number): number {
  let low = 0,
    high = array.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (array[mid] < value) low = mid + 1;
    else high = mid;
  }
  return low;
}
