export enum Distribution {
  FRC6328,
  WPILib,
  Lite
}

// @ts-ignore
export const DISTRIBUTION: Distribution = Distribution.__distribution__;
export const VERSION: string = "__version__";
export const BUILD_DATE: string = "__build_date__";
export const COPYRIGHT: string = "__copyright__";
