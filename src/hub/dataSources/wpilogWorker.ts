import Log from "../../shared/log/Log";
import LoggableType from "../../shared/log/LoggableType";
import Schemas from "./schema/Schemas";
import { WPILOGDecoder } from "./wpilog/WPILOGDecoder";

self.onmessage = (event) => {
  // WORKER SETUP
  let { id, payload } = event.data;
  function resolve(result: any) {
    self.postMessage({ id: id, payload: result });
  }
  function reject() {
    self.postMessage({ id: id });
  }

  // MAIN LOGIC

  // Run worker
  let log = new Log();
  let reader = new WPILOGDecoder(payload[0]);
  let entryIds: { [id: number]: string } = {};
  let entryTypes: { [id: number]: string } = {};
  try {
    reader.forEach((record) => {
      if (record.isControl()) {
        if (record.isStart()) {
          let startData = record.getStartData();
          entryIds[startData.entry] = startData.name;
          entryTypes[startData.entry] = startData.type;
          switch (startData.type) {
            case "boolean":
              log.createBlankField(startData.name, LoggableType.Boolean);
              break;
            case "int64":
            case "float":
            case "double":
              log.createBlankField(startData.name, LoggableType.Number);
              break;
            case "string":
            case "json":
              log.createBlankField(startData.name, LoggableType.String);
              break;
            case "boolean[]":
              log.createBlankField(startData.name, LoggableType.BooleanArray);
              break;
            case "int64[]":
            case "float[]":
            case "double[]":
              log.createBlankField(startData.name, LoggableType.NumberArray);
              break;
            case "string[]":
              log.createBlankField(startData.name, LoggableType.StringArray);
              break;
            default: // Default to raw
              log.createBlankField(startData.name, LoggableType.Raw);
              break;
          }
        }
      } else {
        let key = entryIds[record.getEntry()];
        let type = entryTypes[record.getEntry()];
        let timestamp = record.getTimestamp() / 1000000.0;
        switch (type) {
          case "boolean":
            log.putBoolean(key, timestamp, record.getBoolean());
            break;
          case "int64":
            log.putNumber(key, timestamp, record.getInteger());
            break;
          case "float":
            log.putNumber(key, timestamp, record.getFloat());
            break;
          case "double":
            log.putNumber(key, timestamp, record.getDouble());
            break;
          case "string":
          case "json":
            log.putString(key, timestamp, record.getString());
            break;
          case "boolean[]":
            log.putBooleanArray(key, timestamp, record.getBooleanArray());
            break;
          case "int64[]":
            log.putNumberArray(key, timestamp, record.getIntegerArray());
            break;
          case "float[]":
            log.putNumberArray(key, timestamp, record.getFloatArray());
            break;
          case "double[]":
            log.putNumberArray(key, timestamp, record.getDoubleArray());
            break;
          case "string[]":
            log.putStringArray(key, timestamp, record.getStringArray());
            break;
          default: // Default to raw
            log.putRaw(key, timestamp, record.getRaw());
            if (Schemas.has(type)) {
              Schemas.get(type)!(log, key, timestamp, record.getRaw());
            }
            break;
        }
      }
    });
  } catch (exception) {
    console.error(exception);
    reject();
    return;
  }
  resolve(log.toSerialized());
};
