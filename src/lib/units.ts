const METERS_PER_INCH = 0.0254;
const RADIANS_PER_DEGREE = Math.PI / 180;

export function metersToInches(meters: number): number {
  return meters / METERS_PER_INCH;
}

export function inchesToMeters(inches: number): number {
  return inches * METERS_PER_INCH;
}

export function radiansToDegrees(radians: number): number {
  return radians / RADIANS_PER_DEGREE;
}

export function degreesToRadians(degrees: number): number {
  return degrees * RADIANS_PER_DEGREE;
}
