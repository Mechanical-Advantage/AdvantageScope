export default interface ExportOptions {
  format: "csv-table" | "csv-list" | "wpilog" | "mcap";
  samplingMode: "changes" | "fixed" | "akit";
  samplingPeriod: number;
  prefixes: string;
  includeGenerated: boolean;
}
