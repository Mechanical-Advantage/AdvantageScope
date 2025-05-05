export enum Distribution {
  FRC6328,
  WPILib,
  Lite
}

// @ts-ignore
export const DISTRIBUTION: Distribution = Distribution.__distribution__;
export const LITE_VERSION: string = "__version__"; // Only use for Lite since we can't check if the app is packaged
export const BUILD_DATE: string = "__build_date__";
export const COPYRIGHT: string = "__copyright__";
