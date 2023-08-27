/** Converts from a LabView timestamp to a normal unix time. */
export function convertLVTime(seconds: bigint, fractional: bigint): number {
  let time = -2082826800; // 1904/1/1
  time += Number(seconds);
  time += Number(fractional) / Math.pow(2, 64);
  return time;
}

/** Converts an ID to a power distribution type. */
export function getPDType(id: number): PowerDistributionType {
  if (id === 33) return PowerDistributionType.REV;
  if (id === 25) return PowerDistributionType.CTRE;
  return PowerDistributionType.None;
}

export enum PowerDistributionType {
  REV,
  CTRE,
  None
}
