// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/** A bounded disk cache. Offsets refer to bytes, including any BOM. */
export class CSVFile {
  private buffer = new Uint8Array(0);
  private bufferStart = -1;
  private width = 1;
  private asciiText: string | null = null;
  private bigEndian = false;
  private decoder = new TextDecoder();
  bom = 0;

  constructor(
    readonly size: number,
    private read: (offset: number, length: number) => Promise<Uint8Array>,
    private chunkSize = 4 * 1024 * 1024
  ) {}

  async init() {
    await this.load(0);
    const bytes = this.buffer;
    if ((bytes[0] === 255 && bytes[1] === 254) || (bytes[0] === 254 && bytes[1] === 255)) {
      this.width = 2;
      this.bigEndian = bytes[0] === 254;
      this.decoder = new TextDecoder(this.bigEndian ? "utf-16be" : "utf-16le");
      this.bom = 2;
    } else if (bytes[0] === 239 && bytes[1] === 187 && bytes[2] === 191) {
      this.bom = 3;
    }
  }

  async prefix(): Promise<string> {
    return this.decoder.decode(await this.read(this.bom, Math.min(64 * 1024, this.size - this.bom)));
  }

  private async load(offset: number) {
    this.bufferStart = Math.floor(offset / this.chunkSize) * this.chunkSize;
    this.buffer = await this.read(this.bufferStart, Math.min(this.chunkSize, this.size - this.bufferStart));
    const text = new TextDecoder("utf-8", { ignoreBOM: true }).decode(this.buffer);
    this.asciiText = /[^\x00-\x7f]/.test(text) ? null : text;
    if (this.buffer.length !== Math.min(this.chunkSize, this.size - this.bufferStart))
      throw new Error("Unexpected end of CSV file");
  }

  /** Reads one logical row, including embedded newlines and escaped quotes. */
  row(start: number, delimiter: string): { text: string; next: number } | Promise<{ text: string; next: number }> {
    return this.cachedRow(start) ?? this.readRow(start, delimiter);
  }

  private cachedRow(start: number): { text: string; next: number } | undefined {
    if (start < this.bufferStart || start >= this.bufferStart + this.buffer.length) return undefined;
    if (this.width === 1) {
      const index = start - this.bufferStart;
      let end = this.buffer.indexOf(10, index);
      if (end === -1 && this.bufferStart + this.buffer.length === this.size) end = this.buffer.length - 1;
      if (end !== -1) {
        const bytes = this.buffer.subarray(index, end + 1);
        if (!bytes.includes(34))
          return {
            text: this.asciiText === null ? this.decoder.decode(bytes) : this.asciiText.slice(index, end + 1),
            next: this.bufferStart + end + 1
          };
      }
    }
    return undefined;
  }

  private async readRow(start: number, delimiter: string): Promise<{ text: string; next: number }> {
    if (start < this.bufferStart || start >= this.bufferStart + this.buffer.length) await this.load(start);
    const cached = this.cachedRow(start);
    if (cached) return cached;
    const parts: Uint8Array[] = [];
    let pos = start;
    let quoted = false;
    let fieldStart = true;
    let quotePending = false;
    while (pos < this.size) {
      if (pos < this.bufferStart || pos >= this.bufferStart + this.buffer.length) await this.load(pos);
      const partStart = pos;
      const end = this.bufferStart + this.buffer.length;
      while (pos < end) {
        const i = pos - this.bufferStart;
        const char =
          this.width === 1
            ? this.buffer[i]
            : this.bigEndian
            ? this.buffer[i] * 256 + this.buffer[i + 1]
            : this.buffer[i] + this.buffer[i + 1] * 256;
        pos += this.width;
        if (char === 34 && (quoted || fieldStart || quotePending)) {
          quoted = !quoted;
          quotePending = !quoted;
          fieldStart = false;
        } else if (!quoted) {
          quotePending = false;
          if (char === 10) break;
          fieldStart = char === delimiter.charCodeAt(0);
        }
      }
      parts.push(this.buffer.subarray(partStart - this.bufferStart, pos - this.bufferStart));
      if (pos - start > 16 * 1024 * 1024) throw new Error("CSV row exceeds the supported limit of 16 MiB");
      const last = pos - this.bufferStart - this.width;
      const lastChar = this.width === 1 ? this.buffer[last] : this.buffer[last + (this.bigEndian ? 1 : 0)];
      if (!quoted && lastChar === 10) break;
    }
    if (quoted) throw new Error("Malformed CSV: unterminated quoted field");
    if (parts.length === 1) return { text: this.decoder.decode(parts[0]), next: pos };
    const bytes = new Uint8Array(pos - start);
    let offset = 0;
    for (const part of parts) {
      bytes.set(part, offset);
      offset += part.length;
    }
    return { text: this.decoder.decode(bytes), next: pos };
  }
}

/** Grow without retaining boxed numbers or copying a whole index at completion. */
export class CSVIndex {
  private blocks: Float64Array[] = [];
  length = 0;
  constructor(private blockSize = 65536) {}
  push(value: number) {
    if (this.length % this.blockSize === 0) this.blocks.push(new Float64Array(this.blockSize));
    this.blocks[Math.floor(this.length / this.blockSize)][this.length++ % this.blockSize] = value;
  }
  get(index: number) {
    return this.blocks[Math.floor(index / this.blockSize)][index % this.blockSize];
  }
}
