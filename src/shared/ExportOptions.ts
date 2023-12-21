export default interface ExportOptions {
  format: "csv-table" | "csv-list" | "wpilog" | "mcap";
  samplingMode: "all" | "fixed";
  samplingPeriod: number;
  prefixes: string;
}
