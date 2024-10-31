// This code was inspired by this MIT-licensed library (but directly ports next to no actual code from it)
// https://github.com/eerimoq/bitstruct

/*
 * Copyright 2024 REV Robotics
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 *The least-significant bit is listed first, so that bit position 0 corresponds to character 0 in the string
 */
export type BitString = string & { _brand: "bitstring" }; // _brand exists only within the type system, not at runtime

export function bufferToBitString(buffer: Buffer): BitString {
  if (buffer.length > 8) {
    throw new Error(
      `bufferToBitString() called with ${buffer.length}-byte buffer (only buffers up to 8 bytes are currently supported)`
    );
  }

  const paddedBuffer =
    buffer.length === 8
      ? buffer
      : // We must use the safe version of alloc() here, as some bits may not be overwritten
        Buffer.concat([buffer, Buffer.alloc(8 - buffer.length)]);

  const bufferAsUint = paddedBuffer.readBigUInt64LE();
  const lengthBits = buffer.length * 8;
  return uintToBitString(bufferAsUint, lengthBits);
}

export function bitStringToBuffer(bitString: BitString): Buffer {
  if (bitString.length > 64) {
    throw new Error(
      `bitStringToBuffer() called with ${bitString.length}-bit BitString (only BitStrings up to 64 bits are currently supported)`
    );
  }
  if (bitString.length % 8 !== 0) {
    throw new Error(
      `bitStringToBuffer() called with ${bitString.length}-bit BitString (only BitStrings with a length divisible by 8 are currently supported)`
    );
  }

  const paddedBuffer = Buffer.alloc(8);
  paddedBuffer.writeBigUInt64LE(bitStringToUint(bitString));

  const lengthBytes = bitString.length / 8;
  return paddedBuffer.slice(0, lengthBytes);
}

export function uintToBitString(val: bigint, lengthBits: number): BitString {
  // To maintain leading zeros in the string, we set the bit just beyond the last bit
  // needed to represent the full buffer to 1, and then cut it off
  const valWithExtraBitSet = val + (1n << BigInt(lengthBits));
  const result = valWithExtraBitSet
    .toString(2) // Convert to binary string
    .slice(1) // Get rid of the extra bit
    .split("") // Convert to an array of characters
    .reverse() // Reverse the order to match the BitString contract
    .join("") as BitString; // Combine the characters back together
  if (result.length !== lengthBits) {
    throw new Error(
      `uintToBitString() was called with a value (${val}) too large for the specified number of bits (${lengthBits})`
    );
  }
  return result;
}

export function intToBitString(val: bigint, lengthBits: number): BitString {
  const maxRepresentableUint = 1n << BigInt(lengthBits);
  const intAsUint = modPos(val, maxRepresentableUint);
  return uintToBitString(intAsUint, lengthBits);
}

export function floatToBitString(value: number): BitString {
  const buffer = Buffer.allocUnsafe(4);
  buffer.writeFloatLE(value);
  return uintToBitString(BigInt(buffer.readUInt32LE()), 32);
}

export function doubleToBitString(value: number): BitString {
  const buffer = Buffer.allocUnsafe(8);
  buffer.writeDoubleLE(value);
  return uintToBitString(buffer.readBigUInt64LE(), 64);
}

export function bitStringToUint(bitString: BitString): bigint {
  if (bitString.length === 0) {
    return 0n;
  }
  // Put the BitString back in the order of a normal binary number string,
  // and parse it to a BigNumber
  return BigInt("0b" + bitString.split("").reverse().join(""));
}

export function getSubBitString(bitString: BitString, startBit: number, lengthBits: number): BitString {
  return bitString.slice(startBit, startBit + lengthBits) as BitString;
}

/**
 * Modulus with a never-negative result
 */
function modPos(a: bigint, b: bigint): bigint {
  const c = a % b;
  if (c >= 0) {
    return c;
  } else {
    return c + b;
  }
}
