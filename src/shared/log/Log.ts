import { Decoder } from "@msgpack/msgpack";
import { Pose2d, Translation2d } from "../geometry";
import { arraysEqual, checkArrayType } from "../util";
import LogField from "./LogField";
import LogFieldTree from "./LogFieldTree";
import { PHOTON_PREFIX, STRUCT_PREFIX, TYPE_KEY, applyKeyPrefix, getEnabledData, splitLogKey } from "./LogUtil";
import {
  LogValueSetAny,
  LogValueSetBoolean,
  LogValueSetBooleanArray,
  LogValueSetNumber,
  LogValueSetNumberArray,
  LogValueSetRaw,
  LogValueSetString,
  LogValueSetStringArray
} from "./LogValueSets";
import LoggableType from "./LoggableType";
import PhotonStructDecoder from "./PhotonStructDecoder";
import ProtoDecoder from "./ProtoDecoder";
import StructDecoder from "./StructDecoder";

/** Represents a collection of log fields. */
export default class Log {
  private DEFAULT_TIMESTAMP_RANGE: [number, number] = [0, 10];
  private msgpackDecoder = new Decoder();
  private structDecoder = new StructDecoder();
  private protoDecoder = new ProtoDecoder();
  private photonDecoder = new PhotonStructDecoder();

  private fields: { [id: string]: LogField } = {};
  private generatedParents: Set<string> = new Set(); // Children of these fields are generated
  private timestampRange: [number, number] | null = null;
  private enableTimestampSetCache: boolean;
  private timestampSetCache: { [id: string]: { keys: string[]; timestamps: number[]; sourceCounts: number[] } } = {};
  private changedFields: Set<string> = new Set();

  private queuedStructs: QueuedStructure[] = [];
  private queuedStructArrays: QueuedStructure[] = [];
  private queuedProtos: QueuedStructure[] = [];

  constructor(enableTimestampSetCache = true) {
    this.enableTimestampSetCache = enableTimestampSetCache;
  }

  /** Checks if the field exists and registers it if necessary. */
  createBlankField(key: string, type: LoggableType) {
    if (key in this.fields) return;
    this.fields[key] = new LogField(type);
    this.changedFields.add(key);
  }

  /** Removes all data for a field. */
  deleteField(key: string) {
    if (key in this.fields) {
      delete this.fields[key];
      this.generatedParents.delete(key);
      this.changedFields.delete(key);

      // Update timestamp cache
      Object.entries(this.timestampSetCache).forEach(([uuid, cacheValues]) => {
        if (cacheValues.keys.includes(key)) {
          cacheValues.keys = cacheValues.keys.filter((x) => x !== key);
          let newTimestamps = [...new Set(cacheValues.keys.map((key) => this.fields[key].getTimestamps()).flat())];
          newTimestamps.sort((a, b) => a - b);
          this.timestampSetCache[uuid].timestamps = newTimestamps;
          this.timestampSetCache[uuid].sourceCounts = cacheValues.keys.map(
            (key) => this.fields[key].getTimestamps().length
          );
        }
      });
    }
  }

  /** Clears all data before the provided timestamp. */
  clearBeforeTime(timestamp: number) {
    if (this.timestampRange === null) {
      this.timestampRange = [timestamp, timestamp];
    } else if (this.timestampRange[0] < timestamp) {
      this.timestampRange[0] = timestamp;
      if (this.timestampRange[1] < this.timestampRange[0]) {
        this.timestampRange[1] = this.timestampRange[0];
      }
    }
    Object.values(this.timestampSetCache).forEach((cache) => {
      while (cache.timestamps.length >= 2 && cache.timestamps[1] <= timestamp) {
        cache.timestamps.shift();
      }
      if (cache.timestamps.length > 0 && cache.timestamps[0] < timestamp) {
        cache.timestamps[0] = timestamp;
      }
    });
    Object.values(this.fields).forEach((field) => {
      field.clearBeforeTime(timestamp);
    });
  }

  /** Adjusts the timestamp range based on a known timestamp. */
  updateRangeWithTimestamp(timestamp: number) {
    if (this.timestampRange === null) {
      this.timestampRange = [timestamp, timestamp];
    } else if (timestamp < this.timestampRange[0]) {
      this.timestampRange[0] = timestamp;
    } else if (timestamp > this.timestampRange[1]) {
      this.timestampRange[1] = timestamp;
    }
  }

  /** Updates the timestamp range and set caches if necessary. */
  private processTimestamp(key: string, timestamp: number) {
    // Update timestamp range
    this.updateRangeWithTimestamp(timestamp);

    // Update timestamp set caches
    if (this.enableTimestampSetCache) {
      Object.values(this.timestampSetCache).forEach((cache) => {
        if (cache.keys.includes(key) && !cache.timestamps.includes(timestamp)) {
          let insertIndex = cache.timestamps.findIndex((x) => x > timestamp);
          if (insertIndex === -1) {
            insertIndex = cache.timestamps.length;
          }
          cache.timestamps.splice(insertIndex, 0, timestamp);
        }
      });
    }
  }

  /** Returns the set of fields that have changed since the last call. */
  getChangedFields(): Set<string> {
    let output = this.changedFields;
    this.changedFields = new Set();
    return output;
  }

  /** Returns an array of registered field keys. */
  getFieldKeys(): string[] {
    return Object.keys(this.fields);
  }

  /** Returns the count of fields (excluding array item fields). */
  getFieldCount(): number {
    return Object.keys(this.fields).filter((field) => !this.isGenerated(field)).length;
  }

  /** Returns the internal field object for a key. Prefer other methods when possible. */
  getField(key: string): LogField | null {
    if (key in this.fields) {
      return this.fields[key];
    } else {
      return null;
    }
  }

  /** Adds an existing log field to this log. */
  setField(key: string, field: LogField) {
    this.fields[key] = field;
    this.changedFields.add(key);
  }

  /** Returns the constant field type. */
  getType(key: string): LoggableType | null {
    if (key in this.fields) {
      return this.fields[key].getType();
    } else {
      return null;
    }
  }

  /** Returns a boolean that toggles when a value is removed from the field. */
  getStripingReference(key: string): boolean {
    if (key in this.fields) {
      return this.fields[key].getStripingReference();
    } else {
      return false;
    }
  }

  /** Returns the structured type string for a field. */
  getStructuredType(key: string): string | null {
    if (key in this.fields) {
      return this.fields[key].structuredType;
    } else {
      return null;
    }
  }

  /** Sets the structured type string for a field. */
  setStructuredType(key: string, type: string | null) {
    if (key in this.fields) {
      this.fields[key].structuredType = type;
      this.changedFields.add(key);
    }
  }

  /** Returns the WPILib type string for a field. */
  getWpilibType(key: string): string | null {
    if (key in this.fields) {
      return this.fields[key].wpilibType;
    } else {
      return null;
    }
  }

  /** Sets the WPILib type string for a field. */
  setWpilibType(key: string, type: string) {
    if (key in this.fields) {
      this.fields[key].wpilibType = type;
      this.changedFields.add(key);
    }
  }

  /** Returns the metadata string for a field. */
  getMetadataString(key: string): string {
    if (key in this.fields) {
      return this.fields[key].metadataString;
    } else {
      return "";
    }
  }

  /** Sets the WPILib metadata string for a field. */
  setMetadataString(key: string, type: string) {
    if (key in this.fields) {
      this.fields[key].metadataString = type;
      this.changedFields.add(key);
    }
  }

  /** Returns whether there was an attempt to write a conflicting type to a field. */
  getTypeWarning(key: string): boolean {
    if (key in this.fields) {
      return this.fields[key].typeWarning;
    } else {
      return false;
    }
  }

  /** Returns whether the key is generated. */
  isGenerated(key: string): boolean {
    return this.getGeneratedParent(key) !== null;
  }

  /** If the key is generated, returns its parent. */
  getGeneratedParent(key: string): string | null {
    let parentKeys = Array.from(this.generatedParents);
    for (let i = 0; i < parentKeys.length; i++) {
      let parentKey = parentKeys[i];
      if (key.length > parentKey.length + 1 && key.startsWith(parentKey + "/")) return parentKey;
    }
    return null;
  }

  /** Returns whether this key causes its children to be marked generated. */
  isGeneratedParent(key: string) {
    return this.generatedParents.has(key);
  }

  /** Sets the key to cause its children to be marked generated. */
  setGeneratedParent(key: string) {
    this.generatedParents.add(key);
  }

  /** Returns the combined timestamps from a set of fields.
   *
   * If a UUID is provided, the last set of keys will be cached so
   * that data can be retrieved more quickly for subsequent calls. */
  getTimestamps(keys: string[], uuid: string | null = null): number[] {
    let output: number[] = [];
    keys = keys.filter((key) => key in this.fields);
    if (keys.length > 1) {
      // Multiple fields, read from cache if possible
      let saveCache = false;
      if (uuid !== null && this.enableTimestampSetCache) {
        if (
          uuid in this.timestampSetCache &&
          arraysEqual(this.timestampSetCache[uuid].keys, keys) &&
          arraysEqual(
            this.timestampSetCache[uuid].sourceCounts,
            keys.map((key) => this.fields[key].getTimestamps().length)
          )
        ) {
          return [...this.timestampSetCache[uuid].timestamps];
        }
        this.timestampSetCache[uuid] = {
          keys: keys,
          timestamps: [],
          sourceCounts: keys.map(() => 0)
        };
        saveCache = true;
      }

      // Get new data
      output = [...new Set(keys.map((key) => this.fields[key].getTimestamps()).flat())];
      output.sort((a, b) => a - b);
      if (saveCache && uuid) {
        this.timestampSetCache[uuid].timestamps = output;
        this.timestampSetCache[uuid].sourceCounts = keys.map((key) => this.fields[key].getTimestamps().length);
      }
    } else if (keys.length === 1) {
      // Single field
      output = [...this.fields[keys[0]].getTimestamps()];
    }
    return output;
  }

  /** Returns the range of timestamps across all fields. */
  getTimestampRange(): [number, number] {
    if (this.timestampRange === null) {
      return [...this.DEFAULT_TIMESTAMP_RANGE];
    } else {
      return [...this.timestampRange];
    }
  }

  /** Returns the most recent timestamp across all fields. */
  getLastTimestamp(): number {
    let timestamps = this.getTimestamps(this.getFieldKeys());
    return timestamps[timestamps.length - 1];
  }

  /** Organizes the fields into a tree structure. */
  getFieldTree(includeGenerated: boolean = true, prefix: string = ""): { [id: string]: LogFieldTree } {
    let root: { [id: string]: LogFieldTree } = {};
    Object.keys(this.fields).forEach((key) => {
      if (!key.startsWith(prefix)) return;
      if (!includeGenerated && this.isGenerated(key)) return;
      let position: LogFieldTree = { fullKey: null, children: root };
      key = key.slice(prefix.length);
      splitLogKey(key.slice(key.startsWith("/") ? 1 : 0)).forEach((table) => {
        if (table === "") return;
        if (!(table in position.children)) {
          position.children[table] = { fullKey: null, children: {} };
        }
        position = position.children[table];
      });
      position.fullKey = key;
    });
    return root;
  }

  /** Try to write all of the queued structures. */
  private attemptQueuedStructures() {
    let queuedStructs = [...this.queuedStructs];
    let queuedStructArrays = [...this.queuedStructArrays];
    let queuedProtos = [...this.queuedProtos];
    this.queuedStructs = [];
    this.queuedStructArrays = [];
    this.queuedProtos = [];
    queuedStructs.forEach((item) => {
      this.putStruct(item.key, item.timestamp, item.value, item.schemaType, false);
    });
    queuedStructArrays.forEach((item) => {
      this.putStruct(item.key, item.timestamp, item.value, item.schemaType, true);
    });
    queuedProtos.forEach((item) => {
      this.putProto(item.key, item.timestamp, item.value, item.schemaType);
    });
  }

  /** Reads a set of generic values from the field. */
  getRange(key: string, start: number, end: number, uuid?: string): LogValueSetAny | undefined {
    if (key in this.fields) return this.fields[key].getRange(start, end, uuid);
  }

  /** Reads a set of Raw values from the field. */
  getRaw(key: string, start: number, end: number, uuid?: string): LogValueSetRaw | undefined {
    if (key in this.fields) return this.fields[key].getRaw(start, end, uuid);
  }

  /** Reads a set of Boolean values from the field. */
  getBoolean(key: string, start: number, end: number, uuid?: string): LogValueSetBoolean | undefined {
    if (key in this.fields) return this.fields[key].getBoolean(start, end, uuid);
  }

  /** Reads a set of Number values from the field. */
  getNumber(key: string, start: number, end: number, uuid?: string): LogValueSetNumber | undefined {
    if (key in this.fields) return this.fields[key].getNumber(start, end, uuid);
  }

  /** Reads a set of String values from the field. */
  getString(key: string, start: number, end: number, uuid?: string): LogValueSetString | undefined {
    if (key in this.fields) return this.fields[key].getString(start, end, uuid);
  }

  /** Reads a set of BooleanArray values from the field. */
  getBooleanArray(key: string, start: number, end: number, uuid?: string): LogValueSetBooleanArray | undefined {
    if (key in this.fields) return this.fields[key].getBooleanArray(start, end, uuid);
  }

  /** Reads a set of NumberArray values from the field. */
  getNumberArray(key: string, start: number, end: number, uuid?: string): LogValueSetNumberArray | undefined {
    if (key in this.fields) return this.fields[key].getNumberArray(start, end, uuid);
  }

  /** Reads a set of StringArray values from the field. */
  getStringArray(key: string, start: number, end: number, uuid?: string): LogValueSetStringArray | undefined {
    if (key in this.fields) return this.fields[key].getStringArray(start, end, uuid);
  }

  /** Writes a new Raw value to the field. */
  putRaw(key: string, timestamp: number, value: Uint8Array) {
    this.createBlankField(key, LoggableType.Raw);
    this.fields[key].putRaw(timestamp, value);
    this.changedFields.add(key);
    if (this.fields[key].getType() === LoggableType.Raw) {
      this.processTimestamp(key, timestamp); // Only update timestamp if type is correct
    }

    // Check for struct schema
    if (key.includes("/.schema/" + STRUCT_PREFIX)) {
      this.structDecoder.addSchema(key.split(STRUCT_PREFIX)[1], value);
      this.photonDecoder.addSchema(key.split(STRUCT_PREFIX)[1], value);
      this.attemptQueuedStructures();
    }
    if (key.includes("/.schema/" + PHOTON_PREFIX)) {
      this.photonDecoder.addSchema(key.split(PHOTON_PREFIX)[1], value);
      this.attemptQueuedStructures();
    }
  }

  /** Writes a new Boolean value to the field. */
  putBoolean(key: string, timestamp: number, value: boolean) {
    this.createBlankField(key, LoggableType.Boolean);
    this.fields[key].putBoolean(timestamp, value);
    this.changedFields.add(key);
    if (this.fields[key].getType() === LoggableType.Boolean) {
      this.processTimestamp(key, timestamp); // Only update timestamp if type is correct
    }
  }

  /** Writes a new Number value to the field. */
  putNumber(key: string, timestamp: number, value: number) {
    this.createBlankField(key, LoggableType.Number);
    this.fields[key].putNumber(timestamp, value);
    this.changedFields.add(key);
    if (this.fields[key].getType() === LoggableType.Number) {
      this.processTimestamp(key, timestamp); // Only update timestamp if type is correct
    }
  }

  /** Writes a new String value to the field. */
  putString(key: string, timestamp: number, value: string) {
    this.createBlankField(key, LoggableType.String);
    this.fields[key].putString(timestamp, value);
    this.changedFields.add(key);
    if (this.fields[key].getType() === LoggableType.String) {
      this.processTimestamp(key, timestamp); // Only update timestamp if type is correct
    }

    // Check for type key
    if (key.endsWith("/" + TYPE_KEY)) {
      let parentKey = key.slice(0, -("/" + TYPE_KEY).length);
      this.createBlankField(parentKey, LoggableType.Empty);
      this.changedFields.add(parentKey);
      this.processTimestamp(parentKey, timestamp);
      this.setStructuredType(parentKey, value);
    }
  }

  /** Writes a new BooleanArray value to the field. */
  putBooleanArray(key: string, timestamp: number, value: boolean[]) {
    this.createBlankField(key, LoggableType.BooleanArray);
    this.fields[key].putBooleanArray(timestamp, value);
    this.changedFields.add(key);
    if (this.fields[key].getType() === LoggableType.BooleanArray) {
      this.processTimestamp(key, timestamp);
      this.setGeneratedParent(key);
      {
        let lengthKey = key + "/length";
        this.createBlankField(lengthKey, LoggableType.Number);
        this.processTimestamp(lengthKey, timestamp);
        this.fields[lengthKey].putNumber(timestamp, value.length);
        this.changedFields.add(lengthKey);
      }
      for (let i = 0; i < value.length; i++) {
        if (this.enableTimestampSetCache) {
          // Only useful for timestamp set cache
          this.processTimestamp(key + "/" + i.toString(), timestamp);
        }
        let itemKey = key + "/" + i.toString();
        this.createBlankField(itemKey, LoggableType.Boolean);
        this.fields[itemKey].putBoolean(timestamp, value[i]);
        this.changedFields.add(itemKey);
      }
    }
  }

  /** Writes a new NumberArray value to the field. */
  putNumberArray(key: string, timestamp: number, value: number[]) {
    this.createBlankField(key, LoggableType.NumberArray);
    this.fields[key].putNumberArray(timestamp, value);
    this.changedFields.add(key);
    if (this.fields[key].getType() === LoggableType.NumberArray) {
      this.processTimestamp(key, timestamp);
      this.setGeneratedParent(key);
      {
        let lengthKey = key + "/length";
        this.createBlankField(lengthKey, LoggableType.Number);
        this.processTimestamp(lengthKey, timestamp);
        this.fields[lengthKey].putNumber(timestamp, value.length);
        this.changedFields.add(lengthKey);
      }
      for (let i = 0; i < value.length; i++) {
        if (this.enableTimestampSetCache) {
          // Only useful for timestamp set cache
          this.processTimestamp(key + "/" + i.toString(), timestamp);
        }
        let itemKey = key + "/" + i.toString();
        this.createBlankField(itemKey, LoggableType.Number);
        this.fields[itemKey].putNumber(timestamp, value[i]);
        this.changedFields.add(itemKey);
      }
    }
  }

  /** Writes a new StringArray value to the field. */
  putStringArray(key: string, timestamp: number, value: string[]) {
    this.createBlankField(key, LoggableType.StringArray);
    this.fields[key].putStringArray(timestamp, value);
    this.changedFields.add(key);
    if (this.fields[key].getType() === LoggableType.StringArray) {
      this.processTimestamp(key, timestamp);
      this.setGeneratedParent(key);
      {
        let lengthKey = key + "/length";
        this.createBlankField(lengthKey, LoggableType.Number);
        this.processTimestamp(lengthKey, timestamp);
        this.fields[lengthKey].putNumber(timestamp, value.length);
        this.changedFields.add(lengthKey);
      }
      for (let i = 0; i < value.length; i++) {
        if (this.enableTimestampSetCache) {
          // Only useful for timestamp set cache
          this.processTimestamp(key + "/" + i.toString(), timestamp);
        }
        let itemKey = key + "/" + i.toString();
        this.createBlankField(itemKey, LoggableType.String);
        this.fields[itemKey].putString(timestamp, value[i]);
        this.changedFields.add(itemKey);
      }
    }
  }

  /** Writes an unknown array or object to the children of the field. */
  private putUnknownStruct(key: string, timestamp: number, value: unknown, allowRootWrite = false) {
    if (value === null) return;

    // Check for primitive types first (if first call, writing to the root is not allowed)
    switch (typeof value) {
      case "boolean":
        if (!allowRootWrite) return;
        this.putBoolean(key, timestamp, value);
        return;
      case "number":
        if (!allowRootWrite) return;
        this.putNumber(key, timestamp, value);
        return;
      case "string":
        if (!allowRootWrite) return;
        this.putString(key, timestamp, value);
        return;
    }
    if (value instanceof Uint8Array) {
      if (!allowRootWrite) return;
      this.putRaw(key, timestamp, value);
      return;
    }

    // Not a primitive, call recursively
    if (Array.isArray(value)) {
      // If all items are the same type, add whole array
      if (allowRootWrite && checkArrayType(value, "boolean")) {
        this.putBooleanArray(key, timestamp, value);
      } else if (allowRootWrite && checkArrayType(value, "number")) {
        this.putNumberArray(key, timestamp, value);
      } else if (allowRootWrite && checkArrayType(value, "string")) {
        this.putStringArray(key, timestamp, value);
      } else {
        // Add array items as unknown structs
        {
          let lengthKey = key + "/length";
          this.createBlankField(lengthKey, LoggableType.Number);
          this.processTimestamp(lengthKey, timestamp);
          this.fields[lengthKey].putNumber(timestamp, value.length);
        }
        for (let i = 0; i < value.length; i++) {
          this.putUnknownStruct(key + "/" + i.toString(), timestamp, value[i], true);
        }
      }
    } else if (typeof value === "object") {
      // Add object entries
      for (const [objectKey, objectValue] of Object.entries(value)) {
        this.putUnknownStruct(key + "/" + objectKey, timestamp, objectValue, true);
      }
    }
  }

  /** Writes a JSON-encoded string value to the field. */
  putJSON(key: string, timestamp: number, value: string) {
    this.putString(key, timestamp, value);
    if (this.fields[key].getType() === LoggableType.String) {
      this.setGeneratedParent(key);
      this.setStructuredType(key, "JSON");
      let decodedValue: unknown = null;
      try {
        decodedValue = JSON.parse(value) as unknown;
      } catch {}
      if (decodedValue !== null) {
        this.putUnknownStruct(key, timestamp, decodedValue);
      }
    }
  }

  /** Writes a msgpack-encoded raw value to the field. */
  putMsgpack(key: string, timestamp: number, value: Uint8Array) {
    this.putRaw(key, timestamp, value);
    if (this.fields[key].getType() === LoggableType.Raw) {
      this.setGeneratedParent(key);
      this.setStructuredType(key, "MessagePack");
      let decodedValue: unknown = null;
      try {
        decodedValue = this.msgpackDecoder.decode(value);
      } catch {}
      if (decodedValue !== null) {
        this.putUnknownStruct(key, timestamp, decodedValue);
      }
    }
  }

  /** Writes a photonstruct-encoded raw value to the field.
   *
   * The schema type should not include "photonstruct:"
   */
  putPhotonStruct(key: string, timestamp: number, value: Uint8Array, schemaType: string) {
    this.putRaw(key, timestamp, value);
    if (this.fields[key].getType() === LoggableType.Raw) {
      this.setGeneratedParent(key);
      this.setStructuredType(key, schemaType);
      let decodedData: { data: unknown; schemaTypes: { [key: string]: string } } | null = null;
      try {
        decodedData = this.photonDecoder.decode(schemaType, value);
      } catch {}
      if (decodedData !== null) {
        this.putUnknownStruct(key, timestamp, decodedData.data);
        Object.entries(decodedData.schemaTypes).forEach(([childKey, schemaType]) => {
          // Create the key so it can be dragged even though it doesn't have data
          let fullChildKey = key + "/" + childKey;
          this.createBlankField(fullChildKey, LoggableType.Empty);
          this.processTimestamp(fullChildKey, timestamp);
          this.setStructuredType(fullChildKey, schemaType);
        });
      } else {
        this.queuedStructs.push({
          key: key,
          timestamp: timestamp,
          value: value,
          schemaType: schemaType
        });
      }
    }
  }

  /** Writes a struct-encoded raw value to the field.
   *
   * The schema type should not include "struct:" or "[]"
   */
  putStruct(key: string, timestamp: number, value: Uint8Array, schemaType: string, isArray: boolean) {
    this.putRaw(key, timestamp, value);
    if (this.fields[key].getType() === LoggableType.Raw) {
      this.setGeneratedParent(key);
      this.setStructuredType(key, schemaType + (isArray ? "[]" : ""));
      let decodedData: { data: unknown; schemaTypes: { [key: string]: string } } | null = null;
      try {
        decodedData = isArray
          ? this.structDecoder.decodeArray(schemaType, value)
          : this.structDecoder.decode(schemaType, value);
      } catch {}
      if (decodedData !== null) {
        this.putUnknownStruct(key, timestamp, decodedData.data);
        Object.entries(decodedData.schemaTypes).forEach(([childKey, schemaType]) => {
          // Create the key so it can be dragged even though it doesn't have data
          let fullChildKey = key + "/" + childKey;
          this.createBlankField(fullChildKey, LoggableType.Empty);
          this.processTimestamp(fullChildKey, timestamp);
          this.setStructuredType(fullChildKey, schemaType);
        });
      } else {
        (isArray ? this.queuedStructArrays : this.queuedStructs).push({
          key: key,
          timestamp: timestamp,
          value: value,
          schemaType: schemaType
        });
      }
    }
  }

  /** Writes a protobuf-encoded raw value to the field.
   *
   * The schema type should not include "proto:" but should include
   * the full package (e.g. "wpi.proto.ProtobufPose2d")
   */
  putProto(key: string, timestamp: number, value: Uint8Array, schemaType: string) {
    // Check for schema
    if (schemaType === "FileDescriptorProto") {
      this.protoDecoder.addDescriptor(value);
      this.putRaw(key, timestamp, value);
      this.attemptQueuedStructures();
      return;
    }

    // Not a schema, continue normally
    this.putRaw(key, timestamp, value);
    if (this.fields[key].getType() === LoggableType.Raw) {
      this.setGeneratedParent(key);
      this.setStructuredType(key, ProtoDecoder.getFriendlySchemaType(schemaType));
      let decodedData: { data: unknown; schemaTypes: { [key: string]: string } } | null = null;
      try {
        decodedData = this.protoDecoder.decode(schemaType, value);
      } catch {}
      if (decodedData !== null) {
        this.putUnknownStruct(key, timestamp, decodedData.data);
        Object.entries(decodedData.schemaTypes).forEach(([childKey, schemaType]) => {
          // Create the key so it can be dragged even though it doesn't have data
          let fullChildKey = key + "/" + childKey;
          this.createBlankField(fullChildKey, LoggableType.Empty);
          this.processTimestamp(fullChildKey, timestamp);
          this.setStructuredType(fullChildKey, schemaType);
        });
      } else {
        this.queuedProtos.push({
          key: key,
          timestamp: timestamp,
          value: value,
          schemaType: schemaType
        });
      }
    }
  }

  /** Writes a pose with the "Pose2d" structured type. */
  putPose(key: string, timestamp: number, pose: Pose2d) {
    const translationKey = key + "/translation";
    const rotationKey = key + "/rotation";
    this.putNumber(translationKey + "/x", timestamp, pose.translation[0]);
    this.putNumber(translationKey + "/y", timestamp, pose.translation[1]);
    this.putNumber(rotationKey + "/value", timestamp, pose.rotation);
    if (!(key in this.fields)) {
      this.createBlankField(key, LoggableType.Empty);
      this.setStructuredType(key, "Pose2d");
      this.setGeneratedParent(key);
      this.processTimestamp(key, timestamp);
    }
    if (!(translationKey in this.fields)) {
      this.createBlankField(translationKey, LoggableType.Empty);
      this.setStructuredType(translationKey, "Translation2d");
      this.processTimestamp(translationKey, timestamp);
    }
    if (!(rotationKey in this.fields)) {
      this.createBlankField(rotationKey, LoggableType.Empty);
      this.setStructuredType(rotationKey, "Rotation2d");
      this.processTimestamp(rotationKey, timestamp);
    }
  }

  /** Writes a translation array with the "Translation2d[]" structured type. */
  putTranslationArray(key: string, timestamp: number, translations: Translation2d[]) {
    if (!(key in this.fields)) {
      this.createBlankField(key, LoggableType.Empty);
      this.setStructuredType(key, "Translation2d[]");
      this.setGeneratedParent(key);
      this.processTimestamp(key, timestamp);
    }
    this.putNumber(key + "/length", timestamp, translations.length);
    for (let i = 0; i < translations.length; i++) {
      const itemKey = key + "/" + i.toString();
      if (!(itemKey in this.fields)) {
        this.createBlankField(itemKey, LoggableType.Empty);
        this.setStructuredType(itemKey, "Translation2d");
        this.processTimestamp(itemKey, timestamp);
      }
      this.putNumber(itemKey + "/x", timestamp, translations[i][0]);
      this.putNumber(itemKey + "/y", timestamp, translations[i][1]);
    }
  }

  /** Writes a coordinate with the "ZebraTranslation" structured type. */
  putZebraTranslation(key: string, timestamp: number, x: number, y: number, alliance: string) {
    this.putNumber(key + "/x", timestamp, x);
    this.putNumber(key + "/y", timestamp, y);
    this.putString(key + "/alliance", timestamp, alliance);
    if (!(key in this.fields)) {
      this.createBlankField(key, LoggableType.Empty);
      this.setStructuredType(key, "ZebraTranslation");
      this.setGeneratedParent(key);
      this.processTimestamp(key, timestamp);
    }
  }

  /** Merges a new log into this log. Returns the timestamp offset. */
  mergeWith(source: Log, prefix = ""): number {
    // Serialize source and adjust timestamps
    let offset = 0;
    let targetEnabledData = getEnabledData(this);
    let sourceEnabledData = getEnabledData(source);
    if (
      targetEnabledData &&
      sourceEnabledData &&
      targetEnabledData.values.includes(true) &&
      sourceEnabledData.values.includes(true)
    ) {
      offset =
        targetEnabledData.timestamps[targetEnabledData.values.indexOf(true)] -
        sourceEnabledData.timestamps[sourceEnabledData.values.indexOf(true)];
    }
    let sourceSerialized = source.toSerialized();
    Object.values(sourceSerialized.fields).forEach((field) => {
      let typedField = field as { timestamps: number[]; values: number[] };
      typedField.timestamps = typedField.timestamps.map((timestamp) => timestamp + offset);
    });
    if (sourceSerialized.timestampRange !== null) {
      sourceSerialized.timestampRange = (sourceSerialized.timestampRange as number[]).map(
        (timestamp) => timestamp + offset
      );
    }

    // Merge fields
    Object.entries(sourceSerialized.fields).forEach(([key, value]) => {
      this.fields[applyKeyPrefix(prefix, key)] = LogField.fromSerialized(value);
    });

    // Merge generated parents
    sourceSerialized.generatedParents.map((key: string) => {
      this.generatedParents.add(applyKeyPrefix(prefix, key));
    });

    // Adjust timestamp range
    if (sourceSerialized.timestampRange !== null) {
      if (this.timestampRange === null) {
        this.timestampRange = [sourceSerialized.timestampRange[0], sourceSerialized.timestampRange[1]];
      } else {
        this.timestampRange = [
          Math.min(this.timestampRange[0], sourceSerialized.timestampRange[0]),
          Math.max(this.timestampRange[1], sourceSerialized.timestampRange[1])
        ];
      }
    }

    // Merge struct & proto data
    this.structDecoder = StructDecoder.fromSerialized({
      schemaStrings: {
        ...this.structDecoder.toSerialized().schemaStrings,
        ...sourceSerialized.structDecoder.schemaStrings
      },
      schemas: {
        ...this.structDecoder.toSerialized().schemas,
        ...sourceSerialized.structDecoder.schemas
      }
    });
    let protoDescriptors: any[] = [];
    sourceSerialized.protoDecoder.forEach((descriptor: any) => {
      protoDescriptors.push(descriptor);
    });
    this.protoDecoder = ProtoDecoder.fromSerialized(protoDescriptors);
    return offset;
  }

  /** Returns a serialized version of the data from this log. */
  toSerialized(): any {
    let result: any = {
      fields: {},
      generatedParents: Array.from(this.generatedParents),
      timestampRange: this.timestampRange,
      structDecoder: this.structDecoder.toSerialized(),
      protoDecoder: this.protoDecoder.toSerialized(),
      queuedStructs: this.queuedStructs,
      queuedStructArrays: this.queuedStructArrays,
      queuedProtos: this.queuedProtos
    };
    Object.entries(this.fields).forEach(([key, value]) => {
      result.fields[key] = value.toSerialized();
    });
    return result;
  }

  /** Creates a new log based on the data from `toSerialized()` */
  static fromSerialized(serializedData: any): Log {
    let log = new Log();
    Object.entries(serializedData.fields).forEach(([key, value]) => {
      log.fields[key] = LogField.fromSerialized(value);
    });
    log.generatedParents = new Set(serializedData.generatedParents);
    log.timestampRange = serializedData.timestampRange;
    log.structDecoder = StructDecoder.fromSerialized(serializedData.structDecoder);
    log.protoDecoder = ProtoDecoder.fromSerialized(serializedData.protoDecoder);
    log.queuedStructs = serializedData.queuedStructs;
    log.queuedStructArrays = serializedData.queuedStructArrays;
    log.queuedProtos = serializedData.queuedProtos;
    return log;
  }
}

type QueuedStructure = {
  key: string;
  timestamp: number;
  value: Uint8Array;
  schemaType: string;
};
