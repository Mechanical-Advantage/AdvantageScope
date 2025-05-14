export type MessageSchema = StructSchema | PrimitiveSchema | EnumSchema;
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

export type RRMessage = boolean | number | bigint | string | Map<string, RRMessage>;
