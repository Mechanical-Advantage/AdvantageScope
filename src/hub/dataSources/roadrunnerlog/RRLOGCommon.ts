// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export type MessageSchema = StructSchema | PrimitiveSchema | EnumSchema | ArraySchema | MapSchema | OptionalSchema;
export class StructSchema {
  fields = new Map<string, MessageSchema>();
}

export enum PrimitiveSchema {
  INT,
  LONG,
  DOUBLE,
  STRING,
  BOOLEAN
}

export class EnumSchema {
  constants: string[] = [];
}

export class ArraySchema {
  schema: MessageSchema;
  constructor(schema: MessageSchema) {
    this.schema = schema;
  }
}

export class MapSchema {
  key: MessageSchema;
  value: MessageSchema;
  constructor(key: MessageSchema, value: MessageSchema) {
    this.key = key;
    this.value = value;
  }
}

export class OptionalSchema {
  schema: MessageSchema;
  constructor(schema: MessageSchema) {
    this.schema = schema;
  }
}

/** An absent optional is represented as null, which is skipped when writing to the log. */
export type RRMessage = boolean | number | bigint | string | null | Map<string, RRMessage> | RRMessage[];

/**
 * Converts a decoded map key to the string used as its field name. Map keys are not restricted to
 * strings, but log field names are.
 */
export function mapKeyToString(key: RRMessage): string {
  if (typeof key === "string") return key;
  if (key === null) return "null";
  if (key instanceof Map) {
    return "{" + Array.from(key.entries(), ([name, value]) => name + "=" + mapKeyToString(value)).join(",") + "}";
  }
  if (Array.isArray(key)) {
    return "[" + key.map((item) => mapKeyToString(item)).join(",") + "]";
  }
  return key.toString();
}
