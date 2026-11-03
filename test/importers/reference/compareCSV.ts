// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";

export async function compareCSV(csv: string) {
  const bytes = new TextEncoder().encode(csv);
  async function run(reference: boolean) {
    const messages: any[] = [];
    const listeners = new Set<(event: any) => void>();
    const worker = {
      onmessage: undefined as any,
      addEventListener: (_type: string, listener: any) => listeners.add(listener),
      removeEventListener: (_type: string, listener: any) => listeners.delete(listener),
      postMessage: (message: any) => {
        if (message.type === "csvRead") {
          setTimeout(
            () =>
              listeners.forEach((listener) =>
                listener({
                  data: {
                    type: "csvRead",
                    id: message.id,
                    data: bytes.slice(message.offset, message.offset + message.length)
                  }
                })
              ),
            0
          );
        } else messages.push(message);
      }
    };
    Object.defineProperty(globalThis, "self", { value: worker, configurable: true });
    if (reference) await import("./csvWorker");
    else await import("../../../src/hub/dataSources/csv/csvWorker");
    await worker.onmessage({
      data: {
        type: "start",
        data: [reference ? bytes : new Uint8Array(0)],
        csvSize: reference ? undefined : bytes.length
      }
    });
    const initial = messages.find((m) => m.type === "initial");
    assert.ok(initial, JSON.stringify(messages));
    for (const key of Object.keys(initial.log.fields)) await worker.onmessage({ data: { type: "parseField", key } });
    for (let i = 0; i < 100 && !messages.some((m) => m.type === "fields"); i++)
      await new Promise((r) => setTimeout(r, 10));
    return { initial: initial.log, fields: messages.filter((m) => m.type === "fields").flatMap((m) => m.fields) };
  }
  try {
    assert.deepEqual(await run(false), await run(true));
  } finally {
    Reflect.deleteProperty(globalThis, "self");
  }
}
