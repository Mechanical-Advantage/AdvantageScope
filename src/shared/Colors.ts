import { hex, hsl } from "color-convert";
import { SourceListOptionValueConfig } from "./SourceListConfig";

export const GraphColors: SourceListOptionValueConfig[] = [
  { key: "#2b66a2", display: "Blue" },
  { key: "#e5b31b", display: "Gold" },
  { key: "#af2437", display: "Red" },
  { key: "#80588e", display: "Purple" },
  { key: "#e48b32", display: "Orange" },
  { key: "#c0b487", display: "Tan" },
  { key: "#858584", display: "Gray" },
  { key: "#3b875a", display: "Green" },
  { key: "#d993aa", display: "Pink" },
  { key: "#5f4528", display: "Brown" }
];

export const NeonColors: SourceListOptionValueConfig[] = [
  { key: "#00ff00", display: "Green" },
  { key: "#ff0000", display: "Red" },
  { key: "#0000ff", display: "Blue" },
  { key: "#ff8c00", display: "Orange" },
  { key: "#00ffff", display: "Cyan" },
  { key: "#ffff00", display: "Yellow" },
  { key: "#ff00ff", display: "Magenta" }
];

export const NeonColors_RedStart: SourceListOptionValueConfig[] = [
  { key: "#ff0000", display: "Red" },
  { key: "#0000ff", display: "Blue" },
  { key: "#00ff00", display: "Green" },
  { key: "#ff8c00", display: "Orange" },
  { key: "#00ffff", display: "Cyan" },
  { key: "#ffff00", display: "Yellow" },
  { key: "#ff00ff", display: "Magenta" }
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
