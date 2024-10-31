/*
 * Copyright 2024 REV Robotics
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import BigNumber from "bignumber.js";
import { Simplify } from "type-fest";
import {
  BitString,
  bitStringToBuffer,
  bitStringToUint,
  bufferToBitString,
  doubleToBitString,
  floatToBitString,
  getSubBitString,
  intToBitString,
  uintToBitString
} from "./bitstring.js";

export function getCanSignalValue(signal: BooleanSignal, frameBitString: BitString): boolean;
export function getCanSignalValue(signal: IntegerSignal | FloatingPointSignal, frameBitString: BitString): BigNumber;
export function getCanSignalValue(signal: Signal, frameBitString: BitString): BigNumber | boolean;
export function getCanSignalValue(signal: Signal, frameBitString: BitString): BigNumber | boolean {
  // TODO: Add support for big-endian signals
  const signalBitString = getSubBitString(frameBitString, signal.bitPosition, signal.lengthBits);
  const signalAsUint = bitStringToUint(signalBitString);

  if (signal.type === "boolean") {
    if (signal.lengthBits != 1) {
      throw new Error(`boolean signal ${signal.name} does not have a length of 1 bit`);
    }
    return signalAsUint === 1n;
  }

  let unadjustedValue: number | bigint;
  if (signal.type === "uint" || signal.type === "int") {
    unadjustedValue = signalAsUint;
    if (signal.type === "int" && signalBitString[signalBitString.length - 1] === "1") {
      // This is a negative number, adjust accordingly for the twos-complement format
      unadjustedValue -= 1n << BigInt(signalBitString.length);
    }

    // We don't need to check encodedMin and encodedMax, as those exist purely to
    // filter out values that cannot be represented over-the-wire, and by definition,
    // a signal that we have received has already been represented over-the wire.
  } else if (signal.type === "float") {
    if (signal.lengthBits !== 32) {
      throw new Error("Float signals must be 32 bits");
    }
    const buffer = Buffer.allocUnsafe(4);
    buffer.writeUInt32LE(Number(signalAsUint));
    unadjustedValue = buffer.readFloatLE();
  } else if (signal.type === "double") {
    if (signal.lengthBits !== 64) {
      throw new Error("Double signals must be 32 bits");
    }
    const buffer = Buffer.allocUnsafe(8);
    buffer.writeBigUInt64LE(signalAsUint);
    unadjustedValue = buffer.readDoubleLE();
  } else {
    throw new UnreachableError(signal.type);
  }

  const unadjustedValueAsBigNumber =
    typeof unadjustedValue === "number" ? BigNumber(unadjustedValue) : BigNumber(unadjustedValue.toString());
  let result = unadjustedValueAsBigNumber.times(signal.decodeScaleFactor).plus(signal.offset);

  if (signal.decodedMin != undefined && result.lt(signal.decodedMin)) {
    console.warn(
      `Received "${signal.name}" signal with a decoded value of ${result}, which is lower than the minimum of ${signal.decodedMin}`
    );
    result = signal.decodedMin;
  }
  if (signal.decodedMax != undefined && result.gt(signal.decodedMax)) {
    console.warn(
      `Received "${signal.name}" signal with a decoded value of ${result}, which is higher than the maximum of ${signal.decodedMax}`
    );
    result = signal.decodedMax;
  }

  return result;
}

/**
 * Parse a received CAN frame according to a given specification. To only decode a subset
 * of the frame's signals, pass in a list of the signal keys you want to decode to the
 * optional {@link signalsToDecode} parameter.
 */
export function parseCanFrame<
  FrameType extends BaseFrame,
  SignalKeysToDecode extends SignalKey<FrameType>[] = SignalKey<FrameType>[]
>(
  frameSpec: FrameType,
  frame: { data: Uint8Array },
  signalsToDecode?: NoInfer<SignalKeysToDecode>
): ParsedCanFrame<FrameType, SignalKeysToDecode> {
  signalsToDecode = signalsToDecode ?? (Object.keys(frameSpec.signals) as SignalKeysToDecode);
  const frameLength = frame.data.length;

  if (frameLength < frameSpec.lengthBytes) {
    throw new Error(`Tried to decode a ${frameLength}-byte frame as a "${frameSpec.name}" frame`);
  }

  const result = {} as ParsedCanFrame<FrameType>;
  const bitString = bufferToBitString(Buffer.from(frame.data));
  for (const key of signalsToDecode) {
    // getCanSignalValue() will return the correct type, but the compiler doesn't
    // realize that, so we cast to any
    result[key] = getCanSignalValue(frameSpec.signals[key], bitString) as any;
  }
  return result;
}

export function buildCanFramePayload<Frame extends NonPeriodicFrame>(
  frameSpec: Frame,
  signalValues: ParsedCanFrame<Frame>
): number[] {
  let frameBitString = "" as BitString;

  // CAN specs have their signals sorted by their position in the frame
  for (const signalKey in frameSpec.signals) {
    const signalSpec = frameSpec.signals[signalKey];

    if (signalSpec.type === "boolean") {
      const value = signalValues[signalKey] as boolean;
      frameBitString = (frameBitString + (value ? "1" : "0")) as BitString;
      continue;
    }

    let decodedValue = signalValues[signalKey] as BigNumber;
    const decodedMin = signalSpec.decodedMin;
    const decodedMax = signalSpec.decodedMax;
    if (decodedMin != undefined && decodedValue.lt(decodedMin)) {
      decodedValue = decodedMin;
      console.warn(
        `Signal "${signalSpec.name}" from frame "${
          frameSpec.name
        }" was given a value of ${decodedValue.toFixed()} when the min is ${decodedMin.toFixed()}. Setting to ${decodedMin.toFixed()}`
      );
    }
    if (decodedMax != undefined && decodedValue.gt(decodedMax)) {
      decodedValue = decodedMax;
      console.warn(
        `Signal "${signalSpec.name}" from frame "${
          frameSpec.name
        }" was given a value of ${decodedValue.toFixed()} when the max is ${decodedMax.toFixed()}. Setting to ${decodedMax.toFixed()}`
      );
    }

    // We store adjustedValue separately in case we want to re-perform rounding
    // in a different rounding mode
    const adjustedValue = decodedValue.minus(signalSpec.offset).div(signalSpec.decodeScaleFactor);
    let encodedValue = adjustedValue;

    if (signalSpec.type === "uint" || signalSpec.type === "int") {
      // Start out by rounding to the nearest integer (but down / towards zero if it's halfway in between)
      encodedValue = adjustedValue.integerValue(BigNumber.ROUND_HALF_DOWN);

      const encodedMin = signalSpec.encodedMin;
      const encodedMax = signalSpec.encodedMax;
      if (encodedValue.lt(encodedMin) || encodedValue.gt(encodedMax)) {
        // There's a small chance that if we had rounded down / towards zero instead of the nearest integer,
        // we'd have been within range, in which case we shouldn't log a warning
        encodedValue = adjustedValue.integerValue(BigNumber.ROUND_DOWN);

        if (encodedValue.lt(encodedMin)) {
          encodedValue = encodedMin;
          console.warn(
            `Signal "${signalSpec.name}" from frame "${
              frameSpec.name
            }" was given a value that encoded to ${encodedValue}, which cannot be represented over the wire. Setting to ${encodedMin.toFixed()}`
          );
        }
        if (encodedValue.gt(encodedMax)) {
          encodedValue = encodedMax;
          console.warn(
            `Signal "${signalSpec.name}" from frame "${
              frameSpec.name
            }" was given a value that encoded to ${encodedValue}, which cannot be represented over the wire. Setting to ${encodedMax.toFixed()}`
          );
        }
      }
    }

    let signalBitString: BitString;
    try {
      if (signalSpec.type === "uint") {
        signalBitString = uintToBitString(BigInt(encodedValue.toFixed()), signalSpec.lengthBits);
      } else if (signalSpec.type === "float") {
        signalBitString = floatToBitString(encodedValue.toNumber());
      } else if (signalSpec.type === "int") {
        signalBitString = intToBitString(BigInt(encodedValue.toFixed()), signalSpec.lengthBits);
      } else if (signalSpec.type === "double") {
        signalBitString = doubleToBitString(encodedValue.toNumber());
      } else {
        // noinspection ExceptionCaughtLocallyJS
        throw new UnreachableError(signalSpec.type);
      }
    } catch (e: any) {
      console.log(`decodedValue=${decodedValue.toNumber()} encodedValue=${encodedValue.toNumber()}`);
      const message = `Failed to encode signal "${signalSpec.name}" on frame "${frameSpec.name}"`;
      console.error(message, e);
      throw new Error(message);
    }
    frameBitString = (frameBitString + signalBitString) as BitString;
  }

  const buffer = bitStringToBuffer(frameBitString);
  if (buffer.length !== frameSpec.lengthBytes) {
    throw new Error(
      `The assembled CAN frame payload was ${buffer.length} bytes when it should have been ${frameSpec.lengthBytes} bytes`
    );
  }
  return Array.from(buffer);
}

export type BooleanSignalType = "boolean";
export type IntegerSignalType = "uint" | "int";
export type FloatingPointSignalType = "float" | "double";
export type SignalType = BooleanSignalType | IntegerSignalType | FloatingPointSignalType;

interface BaseSignal {
  type: SignalType;
  name: string;
  bitPosition: number;
  lengthBits: number;
  isBigEndian: boolean;
  description?: string;
  unit?: string;
  decodeScaleFactor: BigNumber;
  offset: BigNumber;
  decodedMin?: BigNumber;
  decodedMax?: BigNumber;
}

/**
 * Integer and boolean signals have always-defined min/max values for their encoded form,
 * not just maybe-defined min and max values for their decoded forms.
 */
interface IntegerOrBooleanSignal extends BaseSignal {
  type: IntegerSignalType | BooleanSignalType;
  encodedMin: BigNumber;
  encodedMax: BigNumber;
}

export interface BooleanSignal extends IntegerOrBooleanSignal {
  type: BooleanSignalType;
}

export interface IntegerSignal extends IntegerOrBooleanSignal {
  type: IntegerSignalType;
}

export interface FloatingPointSignal extends BaseSignal {
  type: FloatingPointSignalType;
}

export type Signal = BooleanSignal | IntegerSignal | FloatingPointSignal;

export type SignalsRecord = Record<string, Signal>;

export interface BaseFrame {
  name: string;
  description?: string;
  apiClass: number;
  apiIndex: number;
  arbId: number;
  lengthBytes: number;
  signals: SignalsRecord;
  /**
   * Indicates that the frame should be handled by all SPARKs on the bus,
   * even if it is not addressed to their device number / CAN ID
   */
  broadcast: boolean;
  /**
   * Contains either the value of {@link NO_VERSION_IMPLEMENTED} or 3 integers of any length separated by decimal
   * points
   */
  versionImplemented: string;
  /**
   * If present, contains 3 integers of any length separated by decimal points
   */
  versionDeprecated?: string;
  /**
   * If present, contains 3 integers of any length separated by decimal points
   */
  versionRemoved?: string;
  frameRangeName?: string;
}

export interface PeriodicFrame extends BaseFrame {
  defaultPeriodMs: number;
  enabledByDefault: boolean;
}

export interface NonPeriodicFrame extends BaseFrame {
  rtr: boolean;
}

export type PeriodicFramesRecord = Record<string, PeriodicFrame>;
export type NonPeriodicFramesRecord = Record<string, NonPeriodicFrame>;

type _ParsedCanFrame<
  FrameType extends BaseFrame,
  SignalKeysToDecode extends (keyof FrameType["signals"])[] = (keyof FrameType["signals"])[]
> = {
  [K in SignalKeysToDecode[number]]: FrameType["signals"][K]["type"] extends "boolean" ? boolean : BigNumber;
};

// We apply NoInfer here because a CAN frame's payload should always be type-checked against a CAN frame spec,
// and NOT used to help determine what the frame spec actually is
export type ParsedCanFrame<
  FrameType extends BaseFrame,
  SignalKeysToDecode extends (keyof FrameType["signals"])[] = (keyof FrameType["signals"])[]
> = NoInfer<Simplify<_ParsedCanFrame<FrameType, SignalKeysToDecode>>>;

export type SignalKey<FrameType extends BaseFrame> = keyof FrameType["signals"];

/**
 * An Error that the Typescript compiler will consider a compile-time error if throwing it is possible
 */
export class UnreachableError extends Error {
  // Doesn't need to be handled in a special way, so there's no isInstance() static method
  constructor(value: never) {
    super(`Unexpected value: ${JSON.stringify(value, null, 4)}`);
  }
}
