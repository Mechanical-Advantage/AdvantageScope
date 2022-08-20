import LogField from "./LogField";
import LogFieldArrayItem from "./LogFieldArrayItem";
import LogFieldBase from "./LogFieldBase";
import LogFieldTree from "./LogFieldTree";
import LoggableType from "./LoggableType";

/** Represents a collection of log fields. */
export default class Log {
  private fields: { [id: string]: LogField } = {};

  /** Registers a new root field. */
  register(key: string, field: LogFieldBase) {
    this.fields[key] = field;
    if (
      field.getType() == LoggableType.BooleanArray ||
      field.getType() == LoggableType.NumberArray ||
      field.getType() == LoggableType.StringArray
    ) {
      field.registerArrayLengthCallback((oldLength: number, newLength: number) => {
        for (let i = oldLength; i < newLength; i++) {
          this.fields[key + "/" + i.toString()] = new LogFieldArrayItem(field, i);
        }
      });
    }
  }

  /** Returns an array of registered field keys. */
  getFieldKeys(): string[] {
    return Object.keys(this.fields);
  }

  /** Returns a single field. */
  getField(key: string): LogField {
    return this.fields[key];
  }

  /** Returns the combined timestamps from a set of fields. */
  getTimestamps(keys: string[]): number[] {
    const output: number[] = [];
    keys.forEach((key) => {
      this.fields[key].getTimestamps().forEach((timestamp) => {
        if (!output.includes(timestamp)) {
          output.push(timestamp);
        }
      });
    });
    output.sort();
    return output;
  }

  /** Organizes the fields into a tree structure/ */
  getFieldTree(): { [id: string]: LogFieldTree } {
    let root: { [id: string]: LogFieldTree } = {};
    Object.keys(this.fields).forEach((key) => {
      let position: LogFieldTree = { fullKey: null, children: root };
      key
        .slice(1)
        .split("/")
        .forEach((table) => {
          if (!(table in position.children)) {
            position.children[table] = { fullKey: null, children: {} };
          }
          position = position.children[table];
        });
      position.fullKey = key;
    });
    return root;
  }
}
