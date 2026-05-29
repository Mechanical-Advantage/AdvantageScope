
/**
 * svgPath.ts
 *
 * Utilities for working with SVG path `d` data:
 *   - parsePath        – parse a `d` string into PathCommand[]
 *   - serialisePath    – serialise PathCommand[] back to a `d` string
 *   - stripBezierCurves – remove all curve commands from a parsed path
 *   - pathsIntersect   – test whether two parsed paths intersect
 */
 
// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
 
export type CommandType =
  | "M" | "m"
  | "L" | "l"
  | "H" | "h"
  | "V" | "v"
  | "C" | "c"
  | "S" | "s"
  | "Q" | "q"
  | "T" | "t"
  | "A" | "a"
  | "Z" | "z";
 
export interface PathCommand {
  type: CommandType;
  params: number[];
}
 
/** An absolute-coordinate line segment between two points. */
export interface Segment {
  x1: number; y1: number;
  x2: number; y2: number;
}
 
/** Detailed result returned by pathsIntersect. */
export interface IntersectionResult {
  /** True if any segment pair intersects (including touching endpoints). */
  intersects: boolean;
  /**
   * All intersection points found.
   * Empty when intersects is false.
   */
  points: Array<{ x: number; y: number }>;
}
 
// ─────────────────────────────────────────────────────────────────────────────
// Internal constants
// ─────────────────────────────────────────────────────────────────────────────
 
const PARAM_COUNT: Readonly<Record<string, number>> = {
  M: 2, m: 2,
  L: 2, l: 2,
  H: 1, h: 1,
  V: 1, v: 1,
  C: 6, c: 6,
  S: 4, s: 4,
  Q: 4, q: 4,
  T: 2, t: 2,
  A: 7, a: 7,
  Z: 0, z: 0,
};
 
const CURVE_COMMANDS = new Set<CommandType>(["C","c","S","s","Q","q","T","t","A","a"]);
 
const CMD_RE = /[MmLlHhVvCcSsQqTtAaZz]/;
 
// ─────────────────────────────────────────────────────────────────────────────
// 1. Parser
// ─────────────────────────────────────────────────────────────────────────────
 
/**
 * Parse an SVG path `d` string into a flat list of PathCommand objects.
 *
 * Handles:
 *   - Comma and/or whitespace separators between parameters
 *   - Implicit repetition ("L 10 20 30 40" → two L commands)
 *   - SVG spec: implicit M repetitions become L (m → l)
 */
export function deserializePath(d: string): PathCommand[] {
  const tokens = d.match(
    /[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g,
  );
  if (!tokens) return [];
 
  const commands: PathCommand[] = [];
  let i = 0;
 
  while (i < tokens.length) {
    const token = tokens[i];
 
    if (!CMD_RE.test(token)) { i++; continue; } // orphaned number — skip
 
    const type = token as CommandType;
    i++;
 
    const paramsPerCmd = PARAM_COUNT[type];
 
    if (paramsPerCmd === 0) {
      commands.push({ type, params: [] });
      continue;
    }
 
    let firstOfGroup = true;
 
    while (i < tokens.length && !CMD_RE.test(tokens[i])) {
      const params: number[] = [];
      for (let p = 0; p < paramsPerCmd; p++) {
        if (i >= tokens.length || CMD_RE.test(tokens[i])) break;
        params.push(parseFloat(tokens[i++]));
      }
      if (params.length !== paramsPerCmd) break; // malformed — stop
 
      let effectiveType: CommandType = type;
      if (!firstOfGroup) {
        if (type === "M") effectiveType = "L";
        if (type === "m") effectiveType = "l";
      }
      commands.push({ type: effectiveType, params });
      firstOfGroup = false;
    }
 
    // Command letter with no params at all (shouldn't happen for non-Z, but be safe)
    if (firstOfGroup) commands.push({ type, params: [] });
  }
 
  return commands;
}
 
// ─────────────────────────────────────────────────────────────────────────────
// 2. Serialiser
// ─────────────────────────────────────────────────────────────────────────────
 
/**
 * Serialise a PathCommand[] back into an SVG path `d` string.
 */
export function serialisePath(commands: PathCommand[]): string {
  return commands
    .map((cmd) =>
      cmd.params.length === 0 ? cmd.type : `${cmd.type} ${cmd.params.join(" ")}`,
    )
    .join(" ");
}
 
// ─────────────────────────────────────────────────────────────────────────────
// 3. stripBezierCurves  (operates on PathCommand[], caller serialises)
// ─────────────────────────────────────────────────────────────────────────────
 
/**
 * Replace every Bézier / arc curve command with a straight LineTo that ends
 * at the curve's original destination point.  All other commands are returned
 * unchanged.
 *
 * Operates on a parsed PathCommand[] so the caller controls (de)serialisation.
 */
export function stripBezierCurves(commands: PathCommand[]): PathCommand[] {
  return commands.map((cmd): PathCommand => {
    if (!CURVE_COMMANDS.has(cmd.type)) return cmd;
    const p = cmd.params;
    switch (cmd.type) {
      case "C": return { type: "L", params: [p[4], p[5]] };
      case "c": return { type: "l", params: [p[4], p[5]] };
      case "S": return { type: "L", params: [p[2], p[3]] };
      case "s": return { type: "l", params: [p[2], p[3]] };
      case "Q": return { type: "L", params: [p[2], p[3]] };
      case "q": return { type: "l", params: [p[2], p[3]] };
      case "T": return { type: "L", params: [p[0], p[1]] };
      case "t": return { type: "l", params: [p[0], p[1]] };
      case "A": return { type: "L", params: [p[5], p[6]] };
      case "a": return { type: "l", params: [p[5], p[6]] };
      default:  return cmd;
    }
  });
}
 
// ─────────────────────────────────────────────────────────────────────────────
// 4. toSegments  (shared internal helper)
// ─────────────────────────────────────────────────────────────────────────────
 
/**
 * Convert a PathCommand[] into an array of absolute-coordinate line Segments.
 *
 * Every command is walked
 * with a cursor to resolve relative and shorthand commands into absolute (x,y)
 * pairs.  Each consecutive pair of absolute points becomes one Segment.
 *
 * H, V, Z are expanded into L-equivalent moves before segmentation.
 */
export function toSegments(commands: PathCommand[]): Segment[] {
  const segments: Segment[] = [];
 
  let cx = 0; // current x
  let cy = 0; // current y
  let mx = 0; // subpath start x (for Z)
  let my = 0; // subpath start y (for Z)
 
  for (const cmd of commands) {
    const p = cmd.params;
    switch (cmd.type) {
      case "M": cx = p[0]; cy = p[1]; mx = cx; my = cy; break;
      case "m": cx += p[0]; cy += p[1]; mx = cx; my = cy; break;
 
      case "L": {
        segments.push({ x1: cx, y1: cy, x2: p[0], y2: p[1] });
        cx = p[0]; cy = p[1];
        break;
      }
      case "l": {
        const nx = cx + p[0], ny = cy + p[1];
        segments.push({ x1: cx, y1: cy, x2: nx, y2: ny });
        cx = nx; cy = ny;
        break;
      }
      case "H": {
        segments.push({ x1: cx, y1: cy, x2: p[0], y2: cy });
        cx = p[0];
        break;
      }
      case "h": {
        const nx = cx + p[0];
        segments.push({ x1: cx, y1: cy, x2: nx, y2: cy });
        cx = nx;
        break;
      }
      case "V": {
        segments.push({ x1: cx, y1: cy, x2: cx, y2: p[0] });
        cy = p[0];
        break;
      }
      case "v": {
        const ny = cy + p[0];
        segments.push({ x1: cx, y1: cy, x2: cx, y2: ny });
        cy = ny;
        break;
      }
      case "Z":
      case "z": {
        if (cx !== mx || cy !== my) {
          segments.push({ x1: cx, y1: cy, x2: mx, y2: my });
        }
        cx = mx; cy = my;
        break;
      }
    }
  }
 
  return segments;
}
 
// ─────────────────────────────────────────────────────────────────────────────
// 5. Segment intersection math
// ─────────────────────────────────────────────────────────────────────────────
 
const EPSILON = 1e-10;
 
/**
 * Test whether two finite line segments AB and CD intersect.
 *
 * Uses the parametric / cross-product method:
 *   P(t) = A + t·(B−A),  t ∈ [0,1]
 *   Q(u) = C + u·(D−C),  u ∈ [0,1]
 *
 * Returns the intersection point when the segments meet (including endpoints),
 * or null when they do not.
 *
 * Collinear / overlapping segments are treated as non-intersecting for
 * simplicity (they share infinitely many points; callers can handle this
 * edge-case separately if needed).
 */
function segmentIntersection(
  s1: Segment,
  s2: Segment,
): { x: number; y: number } | null {
  const dx1 = s1.x2 - s1.x1;
  const dy1 = s1.y2 - s1.y1;
  const dx2 = s2.x2 - s2.x1;
  const dy2 = s2.y2 - s2.y1;
 
  // cross(r, s)
  const denom = dx1 * dy2 - dy1 * dx2;
 
  if (Math.abs(denom) < EPSILON) {
    // Parallel (or collinear) — treat as non-intersecting
    return null;
  }
 
  const dx3 = s2.x1 - s1.x1;
  const dy3 = s2.y1 - s1.y1;
 
  const t = (dx3 * dy2 - dy3 * dx2) / denom;
  const u = (dx3 * dy1 - dy3 * dx1) / denom;
 
  if (t >= -EPSILON && t <= 1 + EPSILON && u >= -EPSILON && u <= 1 + EPSILON) {
    return {
      x: s1.x1 + t * dx1,
      y: s1.y1 + t * dy1,
    };
  }
 
  return null;
}
 
// ─────────────────────────────────────────────────────────────────────────────
// 6. pathsIntersect  (main public API)
// ─────────────────────────────────────────────────────────────────────────────
 
/**
 * Determine whether two SVG paths (given as parsed PathCommand arrays)
 * intersect each other.
 *
 * Algorithm:
 *   1. Linearise both paths (curves → straight lines via stripBezierCurves).
 *   2. Resolve all commands to absolute-coordinate line Segments.
 *   3. Test every segment from path A against every segment from path B.
 *
 * Complexity: O(m·n) where m and n are the segment counts of each path.
 * For typical UI paths this is fast enough; for very dense paths (thousands
 * of segments) consider a sweep-line algorithm.
 *
 * @param segA  Parsed commands for the first path.
 * @param segB  Parsed commands for the second path.
 * @returns  IntersectionResult with a boolean flag and all intersection points.
 */
export function pathsIntersect(segA: Segment[], segB: Segment[]): IntersectionResult {
  const points: Array<{ x: number; y: number }> = [];
 
  for (const sa of segA) {
    for (const sb of segB) {
      const pt = segmentIntersection(sa, sb);
      if (pt !== null) {
        points.push(pt);
      }
    }
  }
 
  return {
    intersects: points.length > 0,
    points,
  };
}
