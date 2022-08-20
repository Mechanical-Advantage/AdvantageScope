export interface LogValueSetAny {
  timestamps: number[];
  values: any[];
}

export interface LogValueSetRaw {
  timestamps: number[];
  values: Uint8Array[];
}

export interface LogValueSetBoolean {
  timestamps: number[];
  values: boolean[];
}

export interface LogValueSetNumber {
  timestamps: number[];
  values: number[];
}

export interface LogValueSetString {
  timestamps: number[];
  values: string[];
}

export interface LogValueSetBooleanArray {
  timestamps: number[];
  values: boolean[][];
}

export interface LogValueSetNumberArray {
  timestamps: number[];
  values: number[][];
}

export interface LogValueSetStringArray {
  timestamps: number[];
  values: string[][];
}
