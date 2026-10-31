// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "../../../shared/log/Log";
import LoggableType from "../../../shared/log/LoggableType";
import { setMetadata } from "../ImporterUtil";
import { CandumpIndex, DATA_STRIDE, FLAG_EXTENDED } from "../can/Candump";
import { createCandumpImporter } from "../can/CandumpImporter";
import { Channel, Group, MDF, rawValue, sample, timestamp } from "./MDF";

/** Discover records once; engineering values and DBC signals are decoded on request. */
export function createMDFImporter() {
  let log = new Log(false);
  const fields = new Map<string, { group: Group; channel: Channel }>();
  const decoded = new Set<string>();
  const can = createCandumpImporter();
  let hasCAN = false;
  function start(files: (Uint8Array | null)[]): Log {
    const mdf = new MDF(files[0]!);
    const busGroups = mdf.groups.filter((g) => g.channels.some((c) => c.name === "CAN_DataFrame.ID"));
    if (busGroups.length) {
      const count = busGroups.reduce((n, g) => n + g.records.length, 0);
      if (count) {
        const index: CandumpIndex = {
          count,
          timestamps: new Float64Array(count),
          ids: new Uint32Array(count),
          ifaceIndex: new Uint8Array(count),
          ifaces: [],
          flags: new Uint8Array(count),
          dataLength: new Uint8Array(count),
          data: new Uint8Array(count * DATA_STRIDE),
          malformedLines: 0
        };
        let i = 0;
        for (const group of busGroups) {
          const channel = (name: string) => group.channels.find((c) => c.name === "CAN_DataFrame." + name);
          const id = channel("ID")!,
            bytes = channel("DataBytes")!,
            dlc = channel("DLC")!,
            length = channel("DataLength"),
            ide = channel("IDE"),
            bus = channel("BusChannel");
          for (const record of group.records) {
            const value = (c: Channel) => Number(rawValue(group.data, record, c));
            const frameId = value(id);
            const extended = ide ? value(ide) !== 0 : frameId > 0x7ff;
            index.ids[i] = frameId & 0x1fffffff;
            index.flags[i] = extended ? FLAG_EXTENDED : 0;
            index.timestamps[i] = timestamp(group, record);
            const iface = "can" + (bus ? value(bus) : 0);
            let busIndex = index.ifaces.indexOf(iface);
            if (busIndex < 0) {
              busIndex = index.ifaces.length;
              index.ifaces.push(iface);
            }
            index.ifaceIndex[i] = busIndex;
            const payload = rawValue(group.data, record, bytes) as Uint8Array;
            const frameLength = length
              ? value(length)
              : [0, 1, 2, 3, 4, 5, 6, 7, 8, 12, 16, 20, 24, 32, 48, 64][value(dlc)] ?? 8;
            index.dataLength[i] = Math.min(frameLength, payload.length, 64);
            index.data.set(payload.subarray(0, index.dataLength[i]), i * DATA_STRIDE);
            i++;
          }
        }
        log = can.start([null, null, null, files[3] ?? null], index);
        hasCAN = true;
      }
    }
    for (const group of mdf.groups) {
      if (group.records.length) {
        log.updateRangeWithTimestamp(timestamp(group, group.records[0]));
        log.updateRangeWithTimestamp(timestamp(group, group.records[group.records.length - 1]));
      }
      if (group.channels.some((c) => c.name.startsWith("CAN_"))) continue;
      for (const channel of group.channels) {
        if (channel.kind === 2 || channel.kind === 3) continue;
        let key = group.name + "/" + channel.name;
        let suffix = 2;
        while (fields.has(key)) key = group.name + "/" + channel.name + "_" + suffix++;
        fields.set(key, { group, channel });
        const type =
          channel.type === 10
            ? LoggableType.Raw
            : channel.type >= 6 || [7, 8].includes(channel.conversion.type)
            ? LoggableType.String
            : LoggableType.Number;
        log.createBlankField(key, type);
        setMetadata(log, key, { unit: channel.unit, source: "ASAM MDF4", channel: channel.name, group: group.name });
        if ([7, 8].includes(channel.conversion.type)) {
          fields.set(key + "/raw", { group, channel });
          log.createBlankField(key + "/raw", LoggableType.Number);
        }
      }
    }
    return log;
  }
  function decode(keys: string[]): string[] {
    const changed = hasCAN ? can.decode(keys.filter((k) => !fields.has(k))) : [];
    for (const key of keys) {
      const target = fields.get(key);
      if (!target || decoded.has(key)) continue;
      const { group, channel } = target;
      for (const record of group.records) {
        const t = timestamp(group, record);
        const value =
          key.endsWith("/raw") && [7, 8].includes(channel.conversion.type)
            ? rawValue(group.data, record, channel)
            : sample(group, channel, record);
        if (typeof value === "number") log.putNumber(key, t, value);
        else if (typeof value === "string") log.putString(key, t, value);
        else log.putRaw(key, t, value.slice());
      }
      decoded.add(key);
      changed.push(key);
    }
    return changed;
  }
  return { start, decode, getLog: () => log };
}
