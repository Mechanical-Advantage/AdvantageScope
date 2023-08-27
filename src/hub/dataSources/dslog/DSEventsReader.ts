import { convertLVTime } from "./DSUtil";

/** Represents a single entry from a DSEvents file */
export interface DSEventsEntry {
  timestamp: number; // Local unix time in seconds (not LabView time)
  text: string;
}

/** Decodes a DSEvents file. Based on the following reference:
 *
 * - https://github.com/orangelight/DSLOG-Reader/blob/master/DSLOG-Reader%202/DSLOG-Reader-Library/DSLOGReader.cs
 */
export class DSEventsReader {
  private data: Uint8Array;
  private dataView: DataView;
  private textDecoder = new TextDecoder("UTF-8");

  constructor(data: Uint8Array) {
    this.data = data;
    this.dataView = new DataView(data.buffer);
  }

  /** Returns the log version number. */
  getVersion(): number {
    return this.dataView.getInt32(0);
  }

  /** Returns whether this log uses a supported version. */
  isSupportedVersion(): boolean {
    return this.getVersion() === 4;
  }

  /** Returns the initial timestamp of the log, using unix time in seconds. */
  getTimestamp(): number {
    return convertLVTime(this.dataView.getBigInt64(4), this.dataView.getBigUint64(12));
  }

  /** Runs the specified function for each record in the log. */
  forEach(callback: (record: DSEventsEntry) => void) {
    if (!this.isSupportedVersion()) throw "Log is not a supported version";
    let position = 4 + 8 + 8; // Header size
    let startTime = this.getTimestamp();

    while (true) {
      // Get data
      let timestamp = convertLVTime(this.dataView.getBigInt64(position), this.dataView.getBigUint64(position + 8));
      position += 8 + 8;
      let length = this.dataView.getInt32(position);
      position += 4;
      let text = this.textDecoder.decode(this.data.subarray(position, position + length));
      position += length;

      // Calculate adjusted timestamp
      let adjustedTimestamp = timestamp - startTime;

      // Filter text
      ["<TagVersion>", "<time>", "<count>", "<flags>", "<Code>", "<location>", "<stack>"].forEach((tag) => {
        while (text.includes(tag)) {
          let tagIndex = text.indexOf(tag);
          let nextIndex = text.indexOf("<", tagIndex + 1);
          text = text.slice(0, tagIndex) + text.slice(nextIndex);
        }
      });
      text = text.replaceAll("<message> ", "");
      text = text.replaceAll("<details> ", "");
      text = text.trim();

      // Return data
      callback({
        timestamp: adjustedTimestamp,
        text: text
      });

      // Check for end of log
      if (position >= this.data.length) {
        break;
      }
    }
  }
}
