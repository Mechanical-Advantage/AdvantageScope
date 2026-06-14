// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "../../../shared/log/Log";

export default class CSVDecoder {
  private parseEntry(log: Log, timestamp: number, key: string, valueRaw: string) {
    // Try to parse empty raw
    if (valueRaw == "(empty)") {
      log.putRaw(key, timestamp, new Uint8Array());
      return;
    }

    // Try to parse populated raw
    // Note that this will only match if there are at least two bytes - we will just
    // parse it as a normal number if there is only one byte (and it that fails,
    // we will try to parse a single byte)
    if (/^([0123456789abcdef]{2}-)+[0123456789abcdef]{2}(-\.\.\.)?$/.test(valueRaw)) {
      try {
        const valueSplit = valueRaw.split("-");

        // Remove "..." added if raw is too long
        if (valueSplit.at(-1) === "...") {
          valueSplit.pop();
        }

        for (const byte of valueSplit) {
          if (byte.length != 2) {
            throw "Invalid byte: " + byte;
          }
        }

        const value = valueSplit.map((value) => Number.parseInt(value, 16));

        for (const byte of value) {
          if (!Number.isInteger(byte) || byte < 0 || byte > 255) {
            throw "Invalid byte: " + byte;
          }
        }

        log.putRaw(key, timestamp, Uint8Array.from(value));
        return;
      } catch (e) {
        console.error("Failed to parse raw: " + valueRaw, e);
      }
    }

    // Try to parse an array
    if (valueRaw.startsWith("[") && valueRaw.endsWith("]")) {
      try {
        let value = valueRaw.slice(1, -1).split("; ");

        // If there is a single empty element, clear it
        if (value.length === 1 && value[0].length === 0) {
          value = [];
        }

        // Remove "..." added if array is too long
        if (value.at(-1) === "...") {
          value.pop();
        }

        // Now we can parse each value
        value = value.map((value) => JSON.parse(value));

        log.putUnknownStruct(key, timestamp, value, true);
        return;
      } catch (e) {
        console.error("Failed to parse array: " + valueRaw, e);
      }
    }

    // Otherwise, try to parse via JSON
    try {
      const value = JSON.parse(valueRaw);
      log.putUnknownStruct(key, timestamp, value, true);
    } catch (e) {
      // If JSON fails, it's possible that we have a single byte
      if (/^[0123456789abcdef]{2}$/.test(valueRaw)) {
        const value = Number.parseInt(valueRaw, 16);
        if (Number.isInteger(value) && value >= 0 && value <= 255) {
          log.putRaw(key, timestamp, Uint8Array.from([value]));
          return;
        }
      }
      // Otherwise, throw the previous error
      throw e;
    }
  }

  decode(log: Log, data: string, progressCallback?: (progress: number) => void) {
    const rows = data.split("\n");

    if (rows[0] == ["Timestamp", "Key", "Value"].join(",")) {
      rows.forEach((row, rowIndex) => {
        if (rowIndex == 0 || row.length == 0) return;

        const columns = row.split(",");
        if (columns.length != 3) {
          throw `Invalid number of columns (expected 3): ${columns.length}`;
        }

        const [timestampRaw, key, valueRaw] = columns;
        const timestamp = Number.parseFloat(timestampRaw);

        this.parseEntry(log, timestamp, key, valueRaw);

        if (progressCallback !== undefined) {
          progressCallback(rowIndex / rows.length);
        }
      });
    } else if (rows[0].startsWith("Timestamp")) {
      let keys = rows[0].split(",");
      rows.forEach((row, rowIndex) => {
        if (rowIndex == 0 || row.length == 0) return;

        const columns = row.split(",");
        if (columns.length != keys.length) {
          throw `Invalid number of columns (expected ${keys.length}): ${columns.length}`;
        }

        const timestamp = Number.parseFloat(columns[0]);

        columns.forEach((column, columnIndex) => {
          if (columnIndex == 0) return;

          this.parseEntry(log, timestamp, keys[columnIndex], column);
        });

        if (progressCallback !== undefined) {
          progressCallback(rowIndex / rows.length);
        }
      });
    } else {
      throw `Could not recognize columns: ${rows[0]}`;
    }
  }
}
