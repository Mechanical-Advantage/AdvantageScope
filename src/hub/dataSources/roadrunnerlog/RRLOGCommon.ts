// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export type MessageSchema = StructSchema | PrimitiveSchema | EnumSchema | ArraySchema;
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

export type RRMessage = boolean | number | bigint | string | Map<string, RRMessage> | RRMessage[];
