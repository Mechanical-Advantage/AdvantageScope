// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import fs from "node:fs/promises";

export interface LineFollowerOptions {
  path: string;
  /** Read existing content first. Default: start at the current end of the file. */
  fromStart?: boolean;
  pollMs?: number;
  onLine: (line: string) => void;
  /** The file disappeared, was truncated or was replaced; reading restarts at its beginning. */
  onReset?: (reason: "missing" | "truncated" | "replaced" | "appeared") => void;
}

/**
 * `tail -f` for a growing JSONL file. Polls rather than using fs.watch, which is unreliable for
 * files being appended to by another process. Only complete (newline-terminated) lines are
 * emitted; a partial last line is held until the rest arrives.
 */
export class LineFollower {
  private offset = 0;
  private ino: number | null = null;
  private pending = Buffer.alloc(0);
  private skipToNewline = false;
  private first = true;
  private timer: NodeJS.Timeout | null = null;
  private busy = false;

  constructor(private options: LineFollowerOptions) {}

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => void this.poll(), this.options.pollMs ?? 100);
    void this.poll();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  async poll(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    try {
      await this.step();
    } catch {
      // Transient filesystem error (e.g. file replaced mid-read): retry on the next poll.
    } finally {
      this.busy = false;
    }
  }

  private reset(reason: "missing" | "truncated" | "replaced" | "appeared") {
    this.offset = 0;
    this.pending = Buffer.alloc(0);
    this.skipToNewline = false;
    this.options.onReset?.(reason);
  }

  private async step() {
    let handle;
    try {
      handle = await fs.open(this.options.path, "r");
    } catch {
      if (this.ino !== null) {
        this.ino = null;
        this.reset("missing");
      }
      this.first = false;
      return;
    }
    try {
      const stat = await handle.stat();
      if (this.first) {
        this.first = false;
        if (!this.options.fromStart && stat.size > 0) {
          this.offset = stat.size;
          // If the writer is mid-line, drop the fragment that remains.
          const last = Buffer.alloc(1);
          await handle.read(last, 0, 1, stat.size - 1);
          this.skipToNewline = last[0] !== 0x0a;
        }
      } else if (this.ino === null) {
        this.reset("appeared"); // File created after startup: read all of it.
      } else if (stat.ino !== this.ino) {
        this.reset("replaced");
      } else if (stat.size < this.offset) {
        this.reset("truncated");
      }
      this.ino = stat.ino;
      while (this.offset < stat.size) {
        const chunk = Buffer.alloc(Math.min(1 << 20, stat.size - this.offset));
        const { bytesRead } = await handle.read(chunk, 0, chunk.length, this.offset);
        if (bytesRead === 0) break;
        this.offset += bytesRead;
        this.consume(chunk.subarray(0, bytesRead));
      }
    } finally {
      await handle.close();
    }
  }

  private consume(chunk: Buffer) {
    let data = Buffer.concat([this.pending, chunk]);
    if (this.skipToNewline) {
      const nl = data.indexOf(0x0a);
      if (nl === -1) {
        this.pending = Buffer.alloc(0);
        return;
      }
      data = data.subarray(nl + 1);
      this.skipToNewline = false;
    }
    let start = 0;
    for (;;) {
      const nl = data.indexOf(0x0a, start);
      if (nl === -1) break;
      const line = data.toString("utf8", start, nl).trim();
      start = nl + 1;
      if (line.length > 0) this.options.onLine(line);
    }
    this.pending = Buffer.from(data.subarray(start));
  }
}
