export const HEADER_STRING = "WPILOG";
export const HEADER_VERSION = 0x0100;
export const CONTROL_ENTRY = 0;
export const CONTROL_START = 0;
export const CONTROL_FINISH = 1;
export const CONTROL_SET_METADATA = 2;
export const TEXT_DECODER = new TextDecoder("UTF-8");
export const TEXT_ENCODER = new TextEncoder();

/**
 * Data contained in a start control record as created by DataLog.start() when
 * writing the log. This can be read by calling DataLogRecord.getStartData().
 *
 * entry: Entry ID; this will be used for this entry in future records.
 * name: Entry name.
 * type: Type of the stored data for this entry, as a string, e.g. "double".
 * metadata: Initial metadata.
 */
export interface StartRecordData {
  entry: number;
  name: string;
  type: string;
  metadata: string;
}

/**
 * Data contained in a set metadata control record as created by
 * DataLog.setMetadata(). This can be read by calling
 * DataLogRecord.getSetMetadataData().
 *
 * entry: Entry ID.
 * metadata: New metadata for the entry.
 */
export interface MetadataRecordData {
  entry: number;
  metadata: string;
}
