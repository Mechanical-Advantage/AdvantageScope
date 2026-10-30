// Small seeded PRNG (mulberry32) with gaussian helper. Deterministic across platforms.

export function hashString(s: string): number {
  // FNV-1a 32-bit
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function hexId(s: string, len = 8): string {
  let out = "";
  let h = hashString(s);
  while (out.length < len) {
    out += h.toString(16).padStart(8, "0");
    h = hashString(out + s);
  }
  return out.slice(0, len);
}

export class Rng {
  private state: number;
  private spare: number | null = null;

  constructor(seed: number | string) {
    this.state = typeof seed === "string" ? hashString(seed) : seed >>> 0;
  }

  /** Uniform [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(lo: number, hi: number): number {
    return lo + (hi - lo) * this.next();
  }

  /** Standard normal via Box-Muller (caches the second value). */
  gauss(sigma = 1): number {
    if (this.spare !== null) {
      const v = this.spare;
      this.spare = null;
      return v * sigma;
    }
    let u = 0;
    while (u === 0) u = this.next();
    const v = this.next();
    const r = Math.sqrt(-2 * Math.log(u));
    this.spare = r * Math.sin(2 * Math.PI * v);
    return r * Math.cos(2 * Math.PI * v) * sigma;
  }
}
