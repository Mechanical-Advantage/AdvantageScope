// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export type Severity = "ok" | "warn" | "critical";

export interface DBCFaultDefinition {
  name: string;
  values?: Record<string, string>;
  comment?: string;
}
/** Only call for signals with DBC provenance. Ordinary aiding/status flags are not faults. */
export function classifyDBCFault(
  def: DBCFaultDefinition,
  value: unknown
): { severity: Severity | "unknown"; label: string } | null {
  const bitmask = /fault.*(?:bits?|bytes?|mask|flags)|(?:fault|error|timeout)flags|^FAULT_Bitmask$/i.test(def.name);
  const labels = Object.values(def.values ?? {});
  if (!bitmask && !labels.some((label) => /fault|error|fail|warning|degraded/i.test(label))) return null;
  const label = def.values?.[String(value)] ?? String(value);
  if (value === undefined || (typeof value === "number" && !Number.isFinite(value)))
    return { severity: "unknown", label: "NO DATA" };
  if (bitmask) {
    const active = Number(value);
    const bits = [...(def.comment ?? "").matchAll(/(?:bit\s*)?(\d+)\s*[:=]\s*([^,;\n]+)/gi)]
      .filter((match) => Math.floor(active / 2 ** Number(match[1])) % 2 === 1)
      .map((match) => match[2].trim());
    return {
      severity: active === 0 ? "ok" : "critical",
      label: bits.length ? bits.join(", ") : `0x${active.toString(16)}`
    };
  }
  if (/invalid|init|unknown/i.test(label) || !labels.includes(label)) return { severity: "unknown", label };
  // Warning takes precedence for labels such as "Ground Fault Warning".
  return {
    severity: /warning|degraded/i.test(label) ? "warn" : /fault|error|fail/i.test(label) ? "critical" : "ok",
    label
  };
}
