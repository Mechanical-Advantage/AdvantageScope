// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { TFunction } from "i18next";
import { MatchType } from "./MatchInfo";

export interface ParsedLogTimestamp {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
  second: number; // 0-59
  isUtc: boolean;
}

export interface ParsedLogMatch {
  type: MatchType;
  number: number;
}

export interface ParsedLogFilename {
  timestamp?: ParsedLogTimestamp;
  event?: string;
  match?: ParsedLogMatch;
}

// FIRST Driver Station:
// - Plain (current & pre-alpha-7 with microseconds): FIRST_DS_YYYYMMDD_HHMMSS[.ffffff].wpilog[xz]
// - Current beta timed/match: FIRST_DS_TIMED_<event>_<type>_<num>[(<replay>)]_YYYYMMDD_HHMMSS[.ffffff].wpilog[xz]
// - Forward-compatible reordered timed/match: FIRST_DS_[TIMED_]YYYYMMDD_HHMMSS[.ffffff]_<event>_<type>[_]<num>[(<replay>)].wpilog[xz]
const FIRST_DS_PLAIN_REGEX = /^FIRST_DS_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})(?:\.\d+)?\.(?:wpilog|wpilogxz)$/;
const FIRST_DS_TIMED_LEGACY_REGEX =
  /^FIRST_DS_TIMED_(.*?)_([NPQE])_(\d+)(?:\(\d+\))?_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})(?:\.\d+)?\.(?:wpilog|wpilogxz)$/;
const FIRST_DS_TIMED_REORDERED_REGEX =
  /^FIRST_DS_(?:TIMED_)?(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})(?:\.\d+)?_(.*?)_([NPQE])_?(\d+)(?:\(\d+\))?\.(?:wpilog|wpilogxz)$/;

// WPILib DataLogManager (2027 WPILIB_ and legacy FRC_, with optional rotated segment suffix):
// (WPILIB|FRC)_YYYYMMDD_HHMMSS[_<event>_<type><num>][.<segment>].wpilog[xz]
const WPILIB_REGEX =
  /^(?:WPILIB|FRC)_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})(?:_(.*?)_([PQET])(\d+))?(?:\.\d+)?\.(?:wpilog|wpilogxz)$/;

// AdvantageKit (akit_ and legacy Log_, local time, arbitrary user-customizable suffix):
// (akit|Log)_YY-MM-DD_HH-MM-SS[_<event>_<type><num>][<custom suffix>].(wpilog|wpilogxz|rlog)
const AKIT_REGEX =
  /^(?:akit|Log)_(\d{2})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})(?:_([^_]*)_([pqe])(\d+)(?=$|[^0-9a-zA-Z]))?.*?\.(?:wpilog|wpilogxz|rlog)$/;

function parseMatchType(char: string): MatchType | null {
  switch (char.toUpperCase()) {
    case "P":
      return MatchType.Practice;
    case "Q":
      return MatchType.Qualification;
    case "E":
      return MatchType.Elimination;
    default:
      return null;
  }
}

function buildTimestamp(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  isUtc: boolean
): ParsedLogTimestamp | null {
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    return null;
  }
  return { year, month, day, hour, minute, second, isUtc };
}

/**
 * Parses a known FRC log filename into structured timestamp, event, and match metadata.
 * Returns null if the filename does not match a recognized convention.
 */
export function parseLogFilename(filename: string): ParsedLogFilename | null {
  // FIRST Driver Station (plain)
  let match = FIRST_DS_PLAIN_REGEX.exec(filename);
  if (match) {
    const timestamp = buildTimestamp(
      parseInt(match[1], 10),
      parseInt(match[2], 10),
      parseInt(match[3], 10),
      parseInt(match[4], 10),
      parseInt(match[5], 10),
      parseInt(match[6], 10),
      true
    );
    return timestamp ? { timestamp } : null;
  }

  // FIRST Driver Station (current beta timed/match order)
  match = FIRST_DS_TIMED_LEGACY_REGEX.exec(filename);
  if (match) {
    const timestamp = buildTimestamp(
      parseInt(match[4], 10),
      parseInt(match[5], 10),
      parseInt(match[6], 10),
      parseInt(match[7], 10),
      parseInt(match[8], 10),
      parseInt(match[9], 10),
      true
    );
    if (!timestamp) return null;
    const result: ParsedLogFilename = { timestamp };
    if (match[1].length > 0) result.event = match[1];
    const matchType = parseMatchType(match[2]);
    if (matchType !== null) {
      result.match = { type: matchType, number: parseInt(match[3], 10) };
    }
    return result;
  }

  // FIRST Driver Station (forward-compatible timestamp-first timed/match order)
  match = FIRST_DS_TIMED_REORDERED_REGEX.exec(filename);
  if (match) {
    const timestamp = buildTimestamp(
      parseInt(match[1], 10),
      parseInt(match[2], 10),
      parseInt(match[3], 10),
      parseInt(match[4], 10),
      parseInt(match[5], 10),
      parseInt(match[6], 10),
      true
    );
    if (!timestamp) return null;
    const result: ParsedLogFilename = { timestamp };
    if (match[7].length > 0) result.event = match[7];
    const matchType = parseMatchType(match[8]);
    if (matchType !== null) {
      result.match = { type: matchType, number: parseInt(match[9], 10) };
    }
    return result;
  }

  // WPILib DataLogManager
  match = WPILIB_REGEX.exec(filename);
  if (match) {
    const timestamp = buildTimestamp(
      parseInt(match[1], 10),
      parseInt(match[2], 10),
      parseInt(match[3], 10),
      parseInt(match[4], 10),
      parseInt(match[5], 10),
      parseInt(match[6], 10),
      true
    );
    if (!timestamp) return null;
    const result: ParsedLogFilename = { timestamp };
    if (match[7] !== undefined && match[7].length > 0) result.event = match[7];
    if (match[8] !== undefined && match[9] !== undefined) {
      const matchType = parseMatchType(match[8]);
      if (matchType !== null) {
        result.match = { type: matchType, number: parseInt(match[9], 10) };
      }
    }
    return result;
  }

  // AdvantageKit
  match = AKIT_REGEX.exec(filename);
  if (match) {
    const timestamp = buildTimestamp(
      2000 + parseInt(match[1], 10),
      parseInt(match[2], 10),
      parseInt(match[3], 10),
      parseInt(match[4], 10),
      parseInt(match[5], 10),
      parseInt(match[6], 10),
      false
    );
    if (!timestamp) return null;
    const result: ParsedLogFilename = { timestamp };
    if (match[7] !== undefined && match[7].length > 0) result.event = match[7];
    if (match[8] !== undefined && match[9] !== undefined) {
      const matchType = parseMatchType(match[8]);
      if (matchType !== null) {
        result.match = { type: matchType, number: parseInt(match[9], 10) };
      }
    }
    return result;
  }

  return null;
}

/**
 * Formats a parsed log timestamp with weekday, short month, date, and 12/24-hour time.
 * UTC timestamps are converted to local time with the short timezone name appended;
 * local-time timestamps are formatted as-is without timezone conversion.
 */
export function formatParsedTimestamp(
  timestamp: ParsedLogTimestamp,
  appLocale?: string,
  systemLocale?: string
): string {
  // Use the OS locale when it matches the app's language (e.g. en-GB with en-US app)
  // so regional date ordering is preserved; otherwise use the app's language.
  const sameLanguage =
    appLocale !== undefined &&
    systemLocale !== undefined &&
    appLocale.split("-")[0].toLowerCase() === systemLocale.split("-")[0].toLowerCase();
  const locale = sameLanguage ? systemLocale : (appLocale ?? systemLocale);

  // Detect 12h vs 24h from the OS/browser locale
  let hour12: boolean | undefined;
  try {
    hour12 = new Intl.DateTimeFormat(systemLocale, { hour: "numeric" }).resolvedOptions().hour12;
  } catch {}

  const date = new Date(
    Date.UTC(timestamp.year, timestamp.month - 1, timestamp.day, timestamp.hour, timestamp.minute, timestamp.second)
  );
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12,
    ...(timestamp.isUtc ? { timeZoneName: "short" } : { timeZone: "UTC" })
  };

  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return new Intl.DateTimeFormat(undefined, options).format(date);
  }
}

/** Formats a parsed match type and number using localized labels. */
export function formatParsedMatch(match: ParsedLogMatch, t: TFunction): string {
  switch (match.type) {
    case MatchType.Practice:
      return t("download.matchPractice", { number: match.number });
    case MatchType.Qualification:
      return t("download.matchQualification", { number: match.number });
    case MatchType.Elimination:
      return t("download.matchPlayoff", { number: match.number });
  }
}

/** Formats a plain-text single-line summary of parsed log metadata (suitable for tooltips). */
export function formatParsedLogSummary(
  parsed: ParsedLogFilename,
  t: TFunction,
  appLocale?: string,
  systemLocale?: string
): string {
  const parts: string[] = [];
  if (parsed.timestamp) parts.push(formatParsedTimestamp(parsed.timestamp, appLocale, systemLocale));
  if (parsed.event) parts.push(parsed.event);
  if (parsed.match) parts.push(formatParsedMatch(parsed.match, t));
  return parts.join(" · ");
}
