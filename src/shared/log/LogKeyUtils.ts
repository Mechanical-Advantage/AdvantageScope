// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "./Log";
import ProtoDecoder from "./ProtoDecoder";

export const STRUCT_PREFIX = "struct:";
export const PROTO_PREFIX = "proto:";
export const PHOTON_PREFIX = "photonstruct:";
export const MERGE_PREFIX = "Log";
export const SCHEMA_REGEX = /(?:^|\/)\.schema\/(.*)/;
export const SEPARATOR_REGEX = new RegExp(/\/|:/);
export const SEPARATOR_REGEX_PHOENIX = new RegExp(/\/|:|_/);
export const PHOENIX_PREFIX = "Phoenix6";

/** Checks if a given log key represents a schema definition. */
export function isSchema(key: string): boolean {
  return SCHEMA_REGEX.test(key);
}

/** Extracts the schema type name from a log key, or returns null if not a schema. */
export function getSchemaType(key: string): string | null {
  const match = key.match(SCHEMA_REGEX);
  return match ? match[1] : null;
}

/** Checks if a field contains an embedded child log. */
export function isChildLog(wpilibType: string | null | undefined, structuredType: string | null | undefined): boolean {
  return wpilibType?.startsWith("log:") === true || structuredType?.startsWith("log:") === true;
}

/** Returns the file extension for a child log based on its type. */
export function getChildLogExtension(
  wpilibType: string | null | undefined,
  structuredType: string | null | undefined
): string | null {
  let logType = wpilibType?.startsWith("log:")
    ? wpilibType
    : structuredType?.startsWith("log:")
    ? structuredType
    : null;
  return logType ? logType.slice(4).toLowerCase() : null;
}

export const MERGE_PREFIX_REGEX = new RegExp(/^\/?Log\d+/);

/** Checks if a key represents a merged log prefix (e.g. /Log1). */
export function isMergePrefix(key: string): boolean {
  return MERGE_PREFIX_REGEX.test(key);
}

/** Extracts the merge prefix from a key, returning an empty string if none exists. */
export function extractMergePrefix(key: string): string {
  let match = key.match(MERGE_PREFIX_REGEX);
  return match === null ? "" : match[0];
}

/** Normalizes a raw structured type string to a standard internal representation. */
export function getStructuredTypeFromRaw(rawType: string): string | null {
  if (rawType.startsWith(STRUCT_PREFIX)) {
    let schemaType = rawType.split(STRUCT_PREFIX)[1];
    if (schemaType.endsWith("[]")) {
      schemaType = schemaType.slice(0, -2);
    }
    return schemaType;
  } else if (rawType.startsWith(PHOTON_PREFIX)) {
    return rawType.split(PHOTON_PREFIX)[1];
  } else if (rawType.startsWith(PROTO_PREFIX)) {
    return ProtoDecoder.getFriendlySchemaType(rawType.split(PROTO_PREFIX)[1]);
  } else if (rawType === "msgpack" || rawType === "MessagePack") {
    return "MessagePack";
  } else if (rawType === "json" || rawType === "JSON") {
    return "JSON";
  } else if (rawType.startsWith("log:")) {
    let extension = rawType.split("log:")[1];
    return "." + extension.toLowerCase();
  }
  return null;
}

/** Returns the version of the key without the merge prefix. */
export function removeMergePrefix(key: string): string {
  let prefix = extractMergePrefix(key);
  if (prefix.length > 0) {
    return key.slice(prefix.length);
  }
  return key;
}

/** Searches for a log key that matches any of the provided search queries. */
export function findKey(log: Log, search: string[]): string | undefined {
  let fieldKeys = log.getFieldKeys();
  let bestKey: string | undefined = undefined;
  let bestKeySearchIndex = Infinity;
  for (let i = 0; i < fieldKeys.length; i++) {
    let unmerged = removeMergePrefix(fieldKeys[i]);
    let searchIndex: number;
    if ((searchIndex = search.indexOf(unmerged)) !== -1) {
      if (searchIndex < bestKeySearchIndex) bestKey = fieldKeys[i];
    } else if (unmerged.startsWith("/") && (searchIndex = search.indexOf(unmerged.slice(1))) !== -1) {
      if (searchIndex < bestKeySearchIndex) bestKey = fieldKeys[i];
    }
  }
  return bestKey;
}

/** Adds a prefix to a log key. */
export function applyKeyPrefix(prefix: string, key: string): string {
  if (prefix.length === 0) {
    return key;
  } else if (key.length === 0 || key === "/") {
    return prefix;
  } else if (key.startsWith("/")) {
    return prefix + key;
  } else {
    return prefix + "/" + key;
  }
}

/** Splits a log key into its component parts. */
export function splitLogKey(key: string): string[] {
  let unmergedKey = removeMergePrefix(key);
  if (unmergedKey.startsWith(PHOENIX_PREFIX) || unmergedKey.startsWith("/" + PHOENIX_PREFIX)) {
    return key.split(SEPARATOR_REGEX_PHOENIX);
  } else {
    return key.split(SEPARATOR_REGEX);
  }
}

/** Filters an array of log fields based on a comma-separated list of prefixes. */
export function filterFieldByPrefixes(
  fields: string[],
  prefixes: string,
  alwaysIncludeSchemas = false,
  ntOnly = false
) {
  let filteredFields: Set<string> = new Set();
  prefixes.split(",").forEach((prefix) => {
    let prefixSeries = splitLogKey(prefix).filter((item) => item.length > 0);
    if (ntOnly) prefixSeries.splice(0, 0, "NT");
    fields.forEach((field) => {
      let fieldSeries = splitLogKey(field).filter((item) => item.length > 0);
      if (fieldSeries.length < prefixSeries.length) return;
      if (
        prefixSeries.every((prefix, index) => fieldSeries[index].toLowerCase() === prefix.toLowerCase()) ||
        (alwaysIncludeSchemas && isSchema(field))
      ) {
        filteredFields.add(field);
      }
    });
  });
  return [...filteredFields];
}
