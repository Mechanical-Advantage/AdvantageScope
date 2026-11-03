// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { DBCDatabase, DBCSignal } from "../can/DBC";

/** Match qualified message/signal names, falling back to unambiguous signal names. */
export function matchDBCChannel(name: string, databases: DBCDatabase[]): DBCSignal | undefined {
  const parts = name.split(/[./]/);
  const matches = databases.flatMap((db) =>
    db.messages.flatMap((message) =>
      message.signals.filter((signal) => signal.name === parts.at(-1)).map((signal) => ({ message, signal }))
    )
  );
  const qualified = matches.filter(({ message }) => message.name === parts.at(-2));
  if (qualified.length === 1) return qualified[0].signal;
  return matches.length === 1 ? matches[0].signal : undefined;
}
export function csvChannelMetadata(
  name: string,
  unit: string | null | undefined,
  databases: DBCDatabase[],
  sidecar: Record<string, Record<string, string>> = {}
) {
  const signal = matchDBCChannel(name, databases);
  const suffix = name.split(/[./]/).slice(-2).join(".");
  const leaf = name.split(/[./]/).at(-1)!;
  const enumLabels =
    sidecar[name] ??
    sidecar[suffix] ??
    sidecar[leaf] ??
    (signal?.valueTable ? Object.fromEntries(signal.valueTable) : undefined);
  return {
    dbcSignal: signal?.name,
    comment: signal?.comment,
    unit: unit || signal?.unit,
    min: signal?.min,
    max: signal?.max,
    scale: signal?.factor,
    enumLabels,
    column: name
  };
}
