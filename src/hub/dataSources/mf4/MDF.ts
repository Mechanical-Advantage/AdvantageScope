// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { unzlibSync } from "fflate";

export interface Block {
  type: string;
  links: number[];
  data: Uint8Array;
}
export interface Conversion {
  type: number;
  values: number[];
  labels: string[];
  unit: string;
}
export interface Channel {
  name: string;
  source?: string;
  unit: string;
  kind: number;
  sync: number;
  type: number;
  bit: number;
  offset: number;
  bits: number;
  flags: number;
  invalidBit: number;
  conversion: Conversion;
}
export interface Group {
  name: string;
  id: number;
  count: number;
  size: number;
  invalidSize: number;
  channels: Channel[];
  records: number[];
  data: Uint8Array;
}
const text = (bytes: Uint8Array) => new TextDecoder().decode(bytes).replace(/\0.*$/s, "");
const view = (bytes: Uint8Array) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
function uint64(v: DataView, offset: number) {
  const n = v.getBigUint64(offset, true);
  if (n > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("MDF offset/count exceeds safe integer range");
  return Number(n);
}

/** Bounds checked MDF4 block reader. No channel samples are decoded during discovery. */
export class MDF {
  groups: Group[] = [];
  constructor(readonly bytes: Uint8Array) {
    if (text(bytes.subarray(0, 8)).trim() !== "MDF") throw new Error("Not an ASAM MDF file");
    if (!text(bytes.subarray(8, 16)).trim().startsWith("4.")) {
      throw new Error("MDF 3.x is unsupported; export as MDF 4.x (.mf4)");
    }
    const hd = this.block(64);
    if (hd.type !== "HD") throw new Error("Missing MDF header");
    for (const dg of this.chain(hd.links[0], "DG")) {
      const groups: Group[] = [];
      for (const cg of this.chain(dg.links[1], "CG")) {
        const v = view(cg.data);
        const source = cg.links[3] ? this.block(cg.links[3]) : null;
        let name =
          this.text(cg.links[2]) ||
          (source?.type === "SI" ? this.text(source.links[0]) : "") ||
          "Group" + (this.groups.length + groups.length + 1);
        const channels: Channel[] = [];
        const seen = new Set<number>();
        const readChannels = (address: number) => {
          for (const cn of this.chain(address, "CN")) {
            // Composition channels also appear in the linked channel list in some producers.
            const identity = cn.data.byteOffset;
            if (seen.has(identity)) continue;
            seen.add(identity);
            const c = view(cn.data);
            const conversion = this.conversion(cn.links[4]);
            channels.push({
              name: this.text(cn.links[2]),
              source: cn.links[3] ? this.text(this.block(cn.links[3]).links[0]) : "",
              unit: conversion.unit || this.text(cn.links[6]),
              kind: c.getUint8(0),
              sync: c.getUint8(1),
              type: c.getUint8(2),
              bit: c.getUint8(3),
              offset: c.getUint32(4, true),
              bits: c.getUint32(8, true),
              flags: c.getUint32(12, true),
              invalidBit: c.getUint32(16, true),
              conversion
            });
            if (cn.links[1] && this.block(cn.links[1]).type === "CN") readChannels(cn.links[1]);
          }
        };
        readChannels(cg.links[1]);
        if (!this.text(cg.links[2]) && !source && channels.some((c) => c.source))
          name = channels.find((c) => c.source)!.source!;
        const recordSize = v.getUint32(24, true);
        for (const c of channels) {
          if (c.kind !== 3 && c.offset + Math.ceil((c.bit + c.bits) / 8) > recordSize)
            throw new Error("MDF channel outside record: " + c.name);
          if (![0, 1, 2, 4, 5, 6, 7, 8].includes(c.conversion.type))
            throw new Error("Unsupported MDF conversion " + c.conversion.type);
        }
        const flags = v.getUint16(16, true);
        if (flags & 1) throw new Error("MDF variable length record groups are unsupported");
        groups.push({
          name,
          id: uint64(v, 0),
          count: uint64(v, 8),
          size: v.getUint32(24, true),
          invalidSize: v.getUint32(28, true),
          channels,
          records: [],
          data: new Uint8Array()
        });
      }
      if (groups.length) {
        const data = this.data(dg.links[2]);
        const idSize = dg.data[0];
        if (![0, 1, 2, 4, 8].includes(idSize)) throw new Error("Invalid MDF record ID size");
        const ids = new Map(groups.map((g) => [g.id, g]));
        for (const g of groups) g.data = data;
        let offset = 0;
        while (offset < data.length) {
          let id = 0;
          for (let i = 0; i < idSize; i++) id += data[offset + i] * 2 ** (8 * i);
          const group = idSize ? ids.get(id) : groups[0];
          if (!group) throw new Error("Unknown MDF record ID " + id);
          offset += idSize;
          const stride = group.size + group.invalidSize;
          if (!stride || offset + stride > data.length) throw new Error("Truncated MDF record");
          group.records.push(offset);
          offset += stride;
        }
        this.groups.push(...groups);
      }
    }
  }
  block(address: number): Block {
    if (!Number.isSafeInteger(address) || address < 64 || address + 24 > this.bytes.length)
      throw new Error("Invalid MDF block address " + address);
    const v = view(this.bytes.subarray(address));
    const size = uint64(v, 8),
      count = uint64(v, 16);
    if (size < 24 + 8 * count || address + size > this.bytes.length) throw new Error("Truncated MDF block");
    if (this.bytes[address] !== 35 || this.bytes[address + 1] !== 35) throw new Error("Invalid MDF block signature");
    return {
      type: text(this.bytes.subarray(address + 2, address + 4)),
      links: Array.from({ length: count }, (_, i) => uint64(v, 24 + i * 8)),
      data: this.bytes.subarray(address + 24 + count * 8, address + size)
    };
  }
  *chain(address: number, type: string): Generator<Block> {
    const seen = new Set<number>();
    while (address) {
      if (seen.has(address)) throw new Error("Cyclic MDF " + type + " list");
      seen.add(address);
      const block = this.block(address);
      if (block.type !== type) throw new Error("Expected MDF " + type + ", found " + block.type);
      yield block;
      address = block.links[0];
    }
  }
  text(address: number): string {
    if (!address) return "";
    const b = this.block(address);
    const value = text(b.data);
    if (b.type === "MD") {
      const unit = value.match(/<unit[^>]*>([\s\S]*?)<\/unit>/)?.[1];
      return (unit ?? "")
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
    }
    return value;
  }
  conversion(address: number): Conversion {
    if (!address) return { type: 0, values: [], labels: [], unit: "" };
    const cc = this.block(address),
      v = view(cc.data);
    if (cc.type !== "CC") throw new Error("Invalid MDF conversion");
    return {
      type: cc.data[0],
      unit: this.text(cc.links[1]),
      values: Array.from({ length: v.getUint16(6, true) }, (_, i) => v.getFloat64(24 + i * 8, true)),
      labels: cc.links.slice(4).map((link) => this.text(link))
    };
  }
  data(address: number, seen = new Set<number>()): Uint8Array {
    if (!address) return new Uint8Array();
    if (seen.has(address)) throw new Error("Cyclic MDF data list");
    seen.add(address);
    const b = this.block(address);
    if (b.type === "DT" || b.type === "SD") return b.data;
    if (b.type === "HL") return this.data(b.links[0], seen);
    if (b.type === "DL") {
      const parts = b.links.slice(1).map((link) => this.data(link, seen));
      if (b.links[0]) parts.push(this.data(b.links[0], seen));
      const output = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
      let offset = 0;
      for (const p of parts) {
        output.set(p, offset);
        offset += p.length;
      }
      return output;
    }
    if (b.type !== "DZ") throw new Error("Unsupported MDF data block " + b.type);
    const v = view(b.data),
      type = b.data[2],
      param = v.getUint32(4, true);
    if (type > 1) throw new Error("Unsupported MDF compression " + type);
    const expected = uint64(v, 8),
      length = uint64(v, 16);
    const raw = unzlibSync(b.data.subarray(24, 24 + length));
    if (raw.length !== expected) throw new Error("MDF decompressed size mismatch");
    if (type === 0) return raw;
    if (!param) throw new Error("Invalid MDF transpose width");
    const rows = Math.floor(raw.length / param),
      output = new Uint8Array(raw.length);
    for (let c = 0; c < param; c++) for (let r = 0; r < rows; r++) output[r * param + c] = raw[c * rows + r];
    output.set(raw.subarray(rows * param), rows * param);
    return output;
  }
}

/** MDF bit offsets are LSB offsets in the endian-specific integer storage. */
export function rawValue(data: Uint8Array, offset: number, channel: Channel): number | string | Uint8Array {
  const start = offset + channel.offset,
    length = Math.ceil((channel.bit + channel.bits) / 8);
  if (start + length > data.length) throw new Error("MDF channel outside record");
  const bytes = data.subarray(start, start + length);
  if (channel.type >= 6 && channel.type <= 9) {
    return new TextDecoder(["windows-1252", "utf-8", "utf-16le", "utf-16be"][channel.type - 6])
      .decode(bytes)
      .replace(/\0.*$/s, "");
  }
  if (channel.type === 10) return bytes;
  if (channel.type === 4 || channel.type === 5) {
    if (channel.bit || ![32, 64].includes(channel.bits)) throw new Error("Unsupported MDF float width/offset");
    const v = view(bytes);
    return channel.bits === 32 ? v.getFloat32(0, channel.type === 4) : v.getFloat64(0, channel.type === 4);
  }
  if (channel.type > 5) throw new Error("Unsupported MDF channel type " + channel.type);
  let value = 0n;
  if (channel.type % 2 === 0) for (let i = bytes.length - 1; i >= 0; i--) value = (value << 8n) | BigInt(bytes[i]);
  else for (const byte of bytes) value = (value << 8n) | BigInt(byte);
  value = (value >> BigInt(channel.bit)) & ((1n << BigInt(channel.bits)) - 1n);
  if (channel.type >= 2 && channel.bits && value & (1n << BigInt(channel.bits - 1)))
    value -= 1n << BigInt(channel.bits);
  return Number(value);
}

export function convert(x: number, c: Conversion): number | string {
  const p = c.values;
  switch (c.type) {
    case 0:
      return x;
    case 1:
      return p[0] + p[1] * x;
    case 2:
      return (p[0] * x * x + p[1] * x + p[2]) / (p[3] * x * x + p[4] * x + p[5]);
    case 4:
    case 5: {
      if (x <= p[0]) return p[1];
      for (let i = 2; i < p.length; i += 2)
        if (x <= p[i]) {
          if (c.type === 5) return x - p[i - 2] <= p[i] - x ? p[i - 1] : p[i + 1];
          return p[i - 1] + ((p[i + 1] - p[i - 1]) * (x - p[i - 2])) / (p[i] - p[i - 2]);
        }
      return p[p.length - 1];
    }
    case 6:
      for (let i = 0; i + 2 < p.length; i += 3) if (x >= p[i] && x <= p[i + 1]) return p[i + 2];
      return p[p.length - 1];
    case 7: {
      const i = p.indexOf(x);
      return c.labels[i < 0 ? p.length : i] ?? x.toString();
    }
    case 8:
      for (let i = 0; i + 1 < p.length; i += 2) if (x >= p[i] && x <= p[i + 1]) return c.labels[i / 2];
      return c.labels[c.labels.length - 1] ?? x.toString();
    default:
      throw new Error("Unsupported MDF conversion " + c.type);
  }
}

export function sample(group: Group, channel: Channel, record: number): number | string | Uint8Array {
  if (channel.flags & 1) return NaN;
  if (channel.kind === 3) return convert(group.records.indexOf(record), channel.conversion);
  if (channel.flags & 2 && group.invalidSize) {
    const byte = group.data[record + group.size + (channel.invalidBit >> 3)];
    if (byte & (1 << channel.invalidBit % 8)) return NaN;
  }
  const raw = rawValue(group.data, record, channel);
  return typeof raw === "number" ? convert(raw, channel.conversion) : raw;
}
export function timestamp(group: Group, record: number): number {
  const master = group.channels.find((c) => (c.kind === 2 || c.kind === 3) && c.sync === 1);
  if (!master) throw new Error("MDF group has no master time channel: " + group.name);
  return Number(sample(group, master, record));
}
