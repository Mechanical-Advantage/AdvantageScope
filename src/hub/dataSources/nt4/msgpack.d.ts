export function serialize(
  data: any,
  options?: { multiple?: boolean; typeHint?: string; invalidTypeReplacement?: (data: any) => any }
): Uint8Array;

export function deserialize(array: ArrayBuffer | Uint8Array, options?: { multiple?: boolean }): any;
