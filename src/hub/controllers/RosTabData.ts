// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { parse } from "@foxglove/rosmsg";
import { MessageReader } from "@foxglove/rosmsg2-serialization";

import Log from "../../shared/log/Log";
import LoggableType from "../../shared/log/LoggableType";
import { getOrDefault } from "../../shared/log/LogUtil";

export function decodeRosPayload(bytes: Uint8Array, meta: { encoding?: string; definition?: string }) {
  if (meta.encoding === "json") return JSON.parse(new TextDecoder().decode(bytes));
  if (meta.encoding === "cdr" && meta.definition)
    return new MessageReader(parse(meta.definition, { ros2: true })).readMessage(bytes);
  throw new Error("No ROS message definition");
}

/** Resolve held fields at each message time: Log compresses unchanged node names and levels. */
export function rosLogRows(log: Log, time: number, minLevel: number) {
  const messages = log.getString("/rosout/msg", -Infinity, time);
  const rows: { stamp: number; level: number; node: string; message: string }[] = [];
  const levels: Record<string, number> = { DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40, FATAL: 50 };
  for (let i = (messages?.timestamps.length ?? 0) - 1; i >= 0 && rows.length < 500; i--) {
    const stamp = messages!.timestamps[i];
    if (stamp > time) continue;
    const levelType = log.getType("/rosout/level");
    const raw = levelType === null ? 20 : getOrDefault(log, "/rosout/level", levelType, stamp, 20);
    const level = typeof raw === "string" ? levels[raw.toUpperCase()] ?? Number(raw) : Number(raw);
    if (level < minLevel) continue;
    rows.push({
      stamp,
      level,
      node: getOrDefault(log, "/rosout/name", LoggableType.String, stamp, ""),
      message: messages!.values[i]
    });
  }
  return rows;
}

/** Convert ROS 8-bit image encodings, respecting row padding (`step`). */
export function imageRGBA(msg: {
  width: number;
  height: number;
  encoding: string;
  step: number;
  data: Uint8Array;
}): Uint8ClampedArray {
  const { width, height, encoding, data } = msg;
  if (!/^(rgb8|bgr8|rgba8|bgra8|mono8)$/.test(encoding)) throw new Error("Unsupported image encoding " + encoding);
  const channels = encoding === "mono8" ? 1 : encoding.includes("a8") ? 4 : 3;
  const step = msg.step || width * channels;
  if (step < width * channels || data.length < (height - 1) * step + width * channels)
    throw new Error("Truncated image data");
  const image = new Uint8ClampedArray(width * height * 4);
  const swap = encoding.startsWith("bgr");
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const o = y * step + x * channels,
        i = (y * width + x) * 4;
      image[i] = channels === 1 ? data[o] : data[o + (swap ? 2 : 0)];
      image[i + 1] = channels === 1 ? data[o] : data[o + 1];
      image[i + 2] = channels === 1 ? data[o] : data[o + (swap ? 0 : 2)];
      image[i + 3] = channels === 4 ? data[o + 3] : 255;
    }
  return image;
}

/** Topics whose name or type contains every whitespace-separated term of the query (case-insensitive). */
export function filterTopics(topics: string[], query: string, typeOf: (topic: string) => string | null): string[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return topics;
  return topics.filter((topic) => {
    const text = (topic + " " + (typeOf(topic) ?? "")).toLowerCase();
    return terms.every((term) => text.includes(term));
  });
}

/** Message rate in Hz over the `span` seconds ending at `time`, or null with fewer than two messages. */
export function topicRateHz(timestamps: number[], time: number, span = 2): number | null {
  let count = 0;
  let first = Infinity;
  let last = -Infinity;
  for (const t of timestamps) {
    if (t > time || t < time - span) continue;
    count++;
    first = Math.min(first, t);
    last = Math.max(last, t);
  }
  if (count < 2 || last <= first) return null;
  return (count - 1) / (last - first);
}

export function formatHz(hz: number | null): string {
  if (hz === null) return "—";
  return (hz >= 10 ? hz.toFixed(0) : hz.toFixed(1)) + " Hz";
}

/** Log filter: severity, free text over message and node, and node name. Empty node means all nodes. */
export function filterLogRows<T extends { level: number; node: string; message: string }>(
  rows: T[],
  text: string,
  node: string
): T[] {
  const needle = text.trim().toLowerCase();
  return rows.filter(
    (row) =>
      (node === "" || row.node === node) &&
      (needle === "" || (row.message + " " + row.node).toLowerCase().includes(needle))
  );
}

/** Scale an image to fit a panel without upscaling beyond `maxScale`. */
export function fitScale(width: number, height: number, panelW: number, panelH: number, maxScale = Infinity): number {
  if (width <= 0 || height <= 0 || panelW <= 0 || panelH <= 0) return 1;
  return Math.min(panelW / width, panelH / height, maxScale);
}
