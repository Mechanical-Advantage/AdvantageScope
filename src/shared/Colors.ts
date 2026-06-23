// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { hex, hsl } from "color-convert";
export const GraphColors: string[] = [
  "#2b66a2",
  "#e5b31b",
  "#af2437",
  "#80588e",
  "#e48b32",
  "#c0b487",
  "#858584",
  "#3b875a",
  "#d993aa",
  "#5f4528"
];

export const NeonColors: string[] = ["#00ff00", "#ff0000", "#0000ff", "#ff8c00", "#00ffff", "#ffff00", "#ff00ff"];

export const NeonColors_RedStart: string[] = [
  "#ff0000",
  "#0000ff",
  "#00ff00",
  "#ff8c00",
  "#00ffff",
  "#ffff00",
  "#ff00ff"
];

const DARK_MIN_LIGHTNESS = 65;
const LIGHT_MAX_LIGHTNESS = 45;

/**
 * Adjusts color brightness to ensure contrast with the background based on the application theme.
 *
 * @param color The hex color in the format "#??????"
 * @param darkMode Whether the application is in dark mode (optional)
 * @returns The adjusted hex color in the same format
 */
export function ensureThemeContrast(color: string, darkMode?: boolean): string {
  if (darkMode === undefined) {
    darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  let hslVal = hex.hsl(color.slice(1));
  if (darkMode) {
    hslVal[2] = Math.max(hslVal[2], DARK_MIN_LIGHTNESS);
  } else {
    hslVal[2] = Math.min(hslVal[2], LIGHT_MAX_LIGHTNESS);
  }
  return "#" + hsl.hex(hslVal);
}
