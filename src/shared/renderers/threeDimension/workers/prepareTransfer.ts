const TYPED_ARRAYS: { [key: string]: new (value: any) => any } = {
  Int8Array: Int8Array,
  Uint8Array: Uint8Array,
  Uint8ClampedArray: Uint8ClampedArray,
  Int16Array: Int16Array,
  Uint16Array: Uint16Array,
  Int32Array: Int32Array,
  Uint32Array: Uint32Array,
  Float32Array: Float32Array,
  Float64Array: Float64Array
};

/** Prepare object descriptor for transfer.
 *
 * Converts all internal arrays to buffered types, and returns
 * a list of all such arrays to be marked for transfer. */
export function prepareTransfer(source: any): ArrayBuffer[] {
  if (Array.isArray(source)) {
    if (source.length < 10) {
      return ([] as ArrayBuffer[]).concat(...source.map(prepareTransfer));
    }
  } else if (typeof source === "object") {
    if ("type" in source && typeof source.type === "string" && source.type.endsWith("Array")) {
      source.array = new TYPED_ARRAYS[source.type](source.array);
      return [source.array.buffer];
    } else {
      return ([] as ArrayBuffer[]).concat(...Object.values(source).map(prepareTransfer));
    }
  }
  return [];
}
