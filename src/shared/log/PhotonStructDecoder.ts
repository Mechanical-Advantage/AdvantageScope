// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/** Class to manage decoding Photon structs. Like WPIlib structs, but without enums/bitfields for now
 *
 * Specification: https://github.com/mcm001/photonvision/blob/serde-hashes/photon-serde/README.md#dynamic-decoding
 */
export default class PhotonStructDecoder {
  private schemaStrings: { [key: string]: string } = {};
  private schemas: { [key: string]: Schema } = {};
  private static textDecoder = new TextDecoder();

  getSchemas() {
    return this.schemas;
  }

  addSchema(name: string, schema: Uint8Array): void {
    let schemaStr = PhotonStructDecoder.textDecoder.decode(schema);
    if (name in this.schemaStrings) return;
    this.schemaStrings[name] = schemaStr;

    // Try to compile any missing schemas
    while (true) {
      let compileSuccess = false;
      Object.keys(this.schemaStrings).forEach((schemaName) => {
        if (!(schemaName in this.schemas)) {
          let success = this.compileSchema(schemaName, this.schemaStrings[schemaName]);
          compileSuccess = compileSuccess || success;
        }
      });
      if (!compileSuccess) {
        // Nothing was compiled (either everything was already
        // compiled or a schema dependency is missing)
        break;
      }
    }
  }

  private compileSchema(name: string, schema: string): boolean {
    let valueSchemaStrs: string[] = schema.split(";").filter((schemaStr) => schemaStr.length > 0);
    let valueSchemas: ValueSchema[] = [];
    for (let i = 0; i < valueSchemaStrs.length; i++) {
      let schemaStr = valueSchemaStrs[i];

      // check if optional
      let isOptional: boolean = false;
      const OPTIONAL = "optional ";
      if (schemaStr.startsWith(OPTIONAL)) {
        isOptional = true;
        schemaStr = schemaStr.substring(OPTIONAL.length);
      }

      // Remove type from schema string
      let schemaStrSplit = schemaStr.split(" ").filter((str) => str.length > 0);
      let type = schemaStrSplit.shift() as string;
      if (!VALID_TYPE_STRINGS.includes(type) && !(type in this.schemas)) {
        // Missing struct, can't finish compiling
        return false;
      }
      let nameStr = schemaStrSplit.join("");

      // Get name and (bit length or array)
      let name: string;
      let isArray = false;
      if (nameStr.includes("[")) {
        // Array
        let split = nameStr.split("[");
        name = split[0];
        const arrayLengthStr = split[1].split("]")[0];
        if (arrayLengthStr === "?") {
          isArray = true; // VLA
        } else {
          console.warn("Fixed length arrays are unimplemented");
          return false;
        }
      } else {
        // Normal value
        name = nameStr;
      }

      if (isOptional && isArray) {
        console.warn("Can't be optional AND array?");
        return false;
      }

      // Create schema
      valueSchemas.push({
        name: name,
        type: type,
        isVLA: isArray,
        isOptional: isOptional
      });
    }

    // Save schema
    this.schemas[name] = {
      valueSchemas: valueSchemas
    };
    return true;
  }

  /** Converts struct-encoded data with a known schema to an object. */
  decode(name: string, value: Uint8Array | DataView): { data: unknown; schemaTypes: { [key: string]: string } } {
    const ret = this.decodeImpl(name, value);
    return {
      data: ret.data,
      schemaTypes: ret.schemaTypes
    };
  }

  /** Converts struct-encoded data with a known schema to an object. */
  decodeImpl(name: string, value: Uint8Array | DataView): DecodeResult {
    if (!(name in this.schemas)) {
      throw new Error("Schema not defined");
    }

    let outputData: { [key: string]: unknown | unknown[] } = {};
    let outputSchemaTypes: { [key: string]: string } = {};
    let schema = this.schemas[name];

    let dataView = new DataView(value.buffer, value.byteOffset, value.byteLength);
    let offset = 0;

    for (let i = 0; i < schema.valueSchemas.length; i++) {
      let valueSchema = schema.valueSchemas[i];

      let isPresent: boolean = true;
      let vlaLength: number | null = null;

      if (valueSchema.isOptional) {
        isPresent = PhotonStructDecoder.decodeValue(dataView, offset, ValueType.Bool);
        offset += VALUE_TYPE_MAX_BITS.get(ValueType.Bool)! / 8;
        outputData[valueSchema.name] = null;
      }
      if (valueSchema.isVLA) {
        vlaLength = PhotonStructDecoder.decodeValue(dataView, offset, ValueType.Int8);
        offset += VALUE_TYPE_MAX_BITS.get(ValueType.Int8)! / 8;
      }

      if (!isPresent) {
        continue;
      }

      if (VALID_TYPE_STRINGS.includes(valueSchema.type)) {
        // base wpilib-defined struct

        let type = valueSchema.type as ValueType;

        if (vlaLength !== null) {
          outputSchemaTypes[valueSchema.name] = type + "[]";

          let inner: unknown[] = [];
          for (let i = 0; i < vlaLength; i++) {
            inner.push(PhotonStructDecoder.decodeValue(dataView, offset, type));
            offset += VALUE_TYPE_MAX_BITS.get(type)! / 8;
          }
          outputData[valueSchema.name] = inner;
          outputData[valueSchema.name + "/length"] = vlaLength;
        } else {
          outputSchemaTypes[valueSchema.name] = type;
          outputData[valueSchema.name] = PhotonStructDecoder.decodeValue(dataView, offset, type);
          offset += VALUE_TYPE_MAX_BITS.get(type)! / 8;
        }
      } else {
        // Child struct
        if (vlaLength !== null) {
          outputSchemaTypes[valueSchema.name] = valueSchema.type + "[]";
          let inner: unknown[] = [];
          for (let i = 0; i < vlaLength; i++) {
            let child = this.decodeImpl(
              valueSchema.type,
              new DataView(dataView.buffer, dataView.byteOffset + offset, dataView.byteLength - offset)
            );
            inner.push(child.data);

            offset += child.bytesConsumed;

            Object.keys(child.schemaTypes).forEach((field) => {
              outputSchemaTypes[valueSchema.name + "/" + i + "/" + field] = child.schemaTypes[field];
            });
          }
          outputData[valueSchema.name] = inner;
          outputData[valueSchema.name + "/length"] = vlaLength;
        } else {
          outputSchemaTypes[valueSchema.name] = valueSchema.type;
          let child = this.decodeImpl(
            valueSchema.type,
            new DataView(dataView.buffer, dataView.byteOffset + offset, dataView.byteLength - offset)
          );

          // Write down how many bytes we consumed
          offset += child.bytesConsumed;
          outputData[valueSchema.name] = child.data;

          Object.keys(child.schemaTypes).forEach((field) => {
            outputSchemaTypes[valueSchema.name + "/" + field] = child.schemaTypes[field];
          });
        }
      }
    }

    return {
      data: outputData,
      schemaTypes: outputSchemaTypes,
      bytesConsumed: offset
    };
  }

  /** Decode a uint8 array as a single value based on the known type. */
  private static decodeValue(dataView: DataView, offset: number, type: ValueType): any {
    let output: any;
    switch (type) {
      case ValueType.Bool:
        output = dataView.getUint8(offset) > 0;
        break;
      case ValueType.Char:
        output = this.textDecoder.decode(
          new DataView(dataView.buffer, dataView.byteOffset + offset, dataView.byteLength - offset)
        );
        break;
      case ValueType.Int8:
        output = dataView.getInt8(offset);
        break;
      case ValueType.Int16:
        output = dataView.getInt16(offset, true);
        break;
      case ValueType.Int32:
        output = dataView.getInt32(offset, true);
        break;
      case ValueType.Int64:
        // JS doesn't support int64, get as close as possible
        output = Number(dataView.getBigInt64(offset, true));
        break;
      case ValueType.Uint8:
        output = dataView.getUint8(offset);
        break;
      case ValueType.Uint16:
        output = dataView.getUint16(offset, true);
        break;
      case ValueType.Uint32:
        output = dataView.getUint32(offset, true);
        break;
      case ValueType.Uint64:
        // JS doesn't support uint64, get as close as possible
        output = Number(dataView.getBigUint64(offset, true));
        break;
      case ValueType.Float:
      case ValueType.Float32:
        output = dataView.getFloat32(offset, true);
        break;
      case ValueType.Double:
      case ValueType.Float64:
        output = dataView.getFloat64(offset, true);
        break;
    }
    return output;
  }

  /** Returns a serialized version of the data from this decoder. */
  toSerialized(): any {
    return {
      schemaStrings: this.schemaStrings,
      schemas: this.schemas
    };
  }

  /** Creates a new decoder based on the data from `toSerialized()` */
  static fromSerialized(serializedData: any) {
    let decoder = new PhotonStructDecoder();
    decoder.schemaStrings = serializedData.schemaStrings;
    decoder.schemas = serializedData.schemas;
    return decoder;
  }
}

interface DecodeResult {
  data: unknown;
  schemaTypes: { [key: string]: string };
  bytesConsumed: number;
}

interface Schema {
  valueSchemas: ValueSchema[];
}

interface ValueSchema {
  // Field name (eg "yaw")
  name: string;
  // Type string (eg "bool", or something custom like "TrackedTarget:123456abcd")
  type: ValueType | string;
  // If this is a VLA type
  isVLA: boolean;
  // If the type is optional
  isOptional: boolean;
}

enum ValueType {
  Bool = "bool",
  Char = "char",
  Int8 = "int8",
  Int16 = "int16",
  Int32 = "int32",
  Int64 = "int64",
  Uint8 = "uint8",
  Uint16 = "uint16",
  Uint32 = "uint32",
  Uint64 = "uint64",
  Float = "float",
  Float32 = "float32",
  Double = "double",
  Float64 = "float64"
}

const VALID_TYPE_STRINGS = Object.values(ValueType) as string[];

const BITFIELD_VALID_TYPES = [
  ValueType.Bool,
  ValueType.Int8,
  ValueType.Int16,
  ValueType.Int32,
  ValueType.Int64,
  ValueType.Uint8,
  ValueType.Uint16,
  ValueType.Uint32,
  ValueType.Uint64
];

const VALUE_TYPE_MAX_BITS = new Map([
  [ValueType.Bool, 8],
  [ValueType.Char, 8],
  [ValueType.Int8, 8],
  [ValueType.Int16, 16],
  [ValueType.Int32, 32],
  [ValueType.Int64, 64],
  [ValueType.Uint8, 8],
  [ValueType.Uint16, 16],
  [ValueType.Uint32, 32],
  [ValueType.Uint64, 64],
  [ValueType.Float, 32],
  [ValueType.Float32, 32],
  [ValueType.Double, 64],
  [ValueType.Float64, 64]
]);
