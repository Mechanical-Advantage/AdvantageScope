// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/** Unicode bidirectional formatting characters. */
const LTR_ISOLATE = "⁦";
const RTL_ISOLATE = "⁧";
const FIRST_STRONG_ISOLATE = "⁨";
const POP_DIRECTIONAL_ISOLATE = "⁩";

/** Separators used by the locales between the components of a list. */
const LIST_SEPARATORS = [", ", "، ", "，"]; // Comma, Arabic comma, fullwidth comma

/** Returns whether the interface is currently laid out right-to-left. */
export function isRtl(): boolean {
  return typeof document !== "undefined" && document.documentElement.dir === "rtl";
}

/**
 * Forces a value to read left-to-right, isolated from the surrounding text. Has no
 * effect when the interface is left-to-right.
 */
export function isolateLtr(text: string): string {
  return isRtl() ? LTR_ISOLATE + text + POP_DIRECTIONAL_ISOLATE : text;
}

/**
 * Isolates the numeric part of a localized value, leaving a space-separated unit outside
 * the isolate. Has no effect when the interface is left-to-right.
 */
export function isolateValue(text: string): string {
  if (!isRtl()) return text;
  let unitIndex = text.indexOf(" ");
  if (unitIndex === -1) return isolateLtr(text);
  return isolateLtr(text.slice(0, unitIndex)) + text.slice(unitIndex);
}

/**
 * Isolates a value while letting it keep its own direction, so that the text around it
 * cannot reorder its contents. Has no effect when the interface is left-to-right.
 */
export function isolateAuto(text: string): string {
  return isRtl() ? FIRST_STRONG_ISOLATE + text + POP_DIRECTIONAL_ISOLATE : text;
}

/**
 * Forces a list to flow right-to-left, so that its first item appears at the right edge
 * where reading begins. Has no effect when the interface is left-to-right.
 */
export function isolateRtl(text: string): string {
  return isRtl() ? RTL_ISOLATE + text + POP_DIRECTIONAL_ISOLATE : text;
}

/**
 * Isolates each component of a separated list so that bidi reordering cannot split a
 * label away from its value. Has no effect when the interface is left-to-right.
 */
export function isolateListComponents(text: string): string {
  if (!isRtl()) return text;
  let output = "";
  let component = "";
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    if (char === LTR_ISOLATE || char === RTL_ISOLATE || char === FIRST_STRONG_ISOLATE) {
      depth++;
    } else if (char === POP_DIRECTIONAL_ISOLATE) {
      depth--;
    }
    let separator = depth === 0 ? LIST_SEPARATORS.find((separator) => text.startsWith(separator, i)) : undefined;
    if (separator === undefined) {
      component += char;
    } else {
      output += isolateRtl(component) + separator;
      component = "";
      i += separator.length - 1;
    }
  }
  return output + isolateRtl(component);
}
