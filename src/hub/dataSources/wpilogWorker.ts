import Log from "../../lib/log/Log";
import { WPILOGReader } from "./WPILOGDecoder";

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
  if (!payload.success) reject();

  let log = new Log();
  let reader = new WPILOGReader(payload.raw);
  let entryIds: { [id: number]: string } = {};
  let entryTypes: { [id: number]: string } = {};
  try {
    reader.forEach((record) => {
      if (record.isControl()) {
        if (record.isStart()) {
          let startData = record.getStartData();
          entryIds[startData.entry] = startData.name;
          entryTypes[startData.entry] = startData.type;
        }
      } else {
        let id = entryIds[record.getEntry()];
        let timestamp = record.getTimestamp() / 1000000.0;
        switch (entryTypes[record.getEntry()]) {
          case "raw":
            log.putRaw(id, timestamp, record.getRaw());
            break;
          case "boolean":
            log.putBoolean(id, timestamp, record.getBoolean());
            break;
          case "int64":
            log.putNumber(id, timestamp, record.getInteger());
            break;
          case "float":
            log.putNumber(id, timestamp, record.getFloat());
            break;
          case "double":
            log.putNumber(id, timestamp, record.getDouble());
            break;
          case "string":
            log.putString(id, timestamp, record.getString());
            break;
          case "boolean[]":
            log.putBooleanArray(id, timestamp, record.getBooleanArray());
            break;
          case "int64[]":
            log.putNumberArray(id, timestamp, record.getIntegerArray());
            break;
          case "float[]":
            log.putNumberArray(id, timestamp, record.getFloatArray());
            break;
          case "double[]":
            log.putNumberArray(id, timestamp, record.getDoubleArray());
            break;
          case "string[]":
            log.putStringArray(id, timestamp, record.getStringArray());
            break;
        }
      }
    });
  } catch (exception) {
    console.error(exception);
    reject();
  }
  resolve(log.toSerialized());
};
