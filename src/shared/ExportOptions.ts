export default interface ExportOptions {
  format: "csv-table" | "csv-list" | "wpilog";
  samplingMode: "all" | "fixed";
  samplingPeriod: number;
  prefixes: string;
}
