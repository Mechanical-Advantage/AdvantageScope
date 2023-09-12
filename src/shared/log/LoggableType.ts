/** A type of log data that can be stored. */
enum LoggableType {
  Raw,
  Boolean,
  Number,
  String,
  BooleanArray,
  NumberArray,
  StringArray,
  Empty // Used as a placeholder for child fields of structured data
}

export default LoggableType;
