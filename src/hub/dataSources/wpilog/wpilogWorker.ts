import Log from "../../../shared/log/Log";
import { PROTO_PREFIX, STRUCT_PREFIX } from "../../../shared/log/LogUtil";
import LoggableType from "../../../shared/log/LoggableType";
import CustomSchemas from "../schema/CustomSchemas";
import { WPILOGDecoder } from "./WPILOGDecoder";
// import * as fs from "fs";
// var self = {
//   onmessage: function (tmp: any) {},
//   postMessage: function (data: any) {
//     return;
//     console.log(data.id + " " + data.progress);
//   }
// };

// function torun() {
//   //"D:\\FRC_20240302_141552_VAASH_P1.wpilog"
//   var file = "";
//   // file = "D:\\Robotics\\robotics logs\\FRC_20240302_141552_VAASH_P1.wpilog";
//   file = "D:\\Robotics\\robotics logs\\FRC_20240303_205029_VAASH_E10.wpilog";
//   // file = "D:\\Robotics\\robotics logs\\MIMIL_Q63_C8A241B2394C4853202020500E3318FF_2024-03-02_10-38-03.hoot.wpilog";
//   const buffer = fs.readFileSync(file);
//   console.profile();
//   // for (let i = 0; i < 5; i++) {
//   console.time("slow-big");
//   self.onmessage({ data: { id: 0, payload: [buffer] } });
//   console.timeEnd("slow-big");
//   // }

//   console.profileEnd();
//   console.log("Done");
// }
self.onmessage = (event) => {
  // WORKER SETUP
  let { id, payload } = event.data;
  function resolve(result: any) {
    self.postMessage({ id: id, payload: result });
  }
  function progress(percent: number) {
    self.postMessage({ id: id, progress: percent });
  }
  function reject() {
    self.postMessage({ id: id });
  }

  // MAIN LOGIC

  // Run worker
  let log = new Log(false, false); // No timestamp set cache for efficiency
  let reader = new WPILOGDecoder(payload[0]);
  let totalBytes = (payload[0] as Uint8Array).byteLength;
  let entryIds: { [id: number]: string } = {};
  let entryTypes: { [id: number]: string } = {};
  let lastProgressTimestamp = new Date().getTime();
  try {
    reader.forEach((record, byteCount) => {
      if (record.isControl()) {
        if (record.isStart()) {
          let startData = record.getStartData();
          entryIds[startData.entry] = startData.name;
          entryTypes[startData.entry] = startData.type;
          switch (startData.type) {
            case "boolean":
              log.createBlankField(startData.name, LoggableType.Boolean);
              break;
            case "int":
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
            case "int[]":
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
          log.setWpilibType(startData.name, startData.type);
          log.setMetadataString(startData.name, startData.metadata);
        } else if (record.isSetMetadata()) {
          let setMetadataData = record.getSetMetadataData();
          if (setMetadataData.entry in entryIds) {
            log.setMetadataString(entryIds[setMetadataData.entry], setMetadataData.metadata);
          }
        }
      } else {
        let key = entryIds[record.getEntry()];
        let type = entryTypes[record.getEntry()];
        let timestamp = Math.max(0, record.getTimestamp() / 1000000.0);
        if (key && type) {
          try {
            switch (type) {
              case "boolean":
                log.putBoolean(key, timestamp, record.getBoolean());
                break;
              case "int":
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
                log.putString(key, timestamp, record.getString());
                break;
              case "boolean[]":
                log.putBooleanArray(key, timestamp, record.getBooleanArray());
                break;
              case "int[]":
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
              case "json":
                log.putJSON(key, timestamp, record.getString());
                break;
              case "msgpack":
                log.putMsgpack(key, timestamp, record.getRaw());
                break;
              default: // Default to raw
                if (type.startsWith(STRUCT_PREFIX)) {
                  let schemaType = type.split(STRUCT_PREFIX)[1];
                  if (schemaType.endsWith("[]")) {
                    log.putStruct(key, timestamp, record.getRaw(), schemaType.slice(0, -2), true);
                  } else {
                    log.putStruct(key, timestamp, record.getRaw(), schemaType, false);
                  }
                } else if (type.startsWith(PROTO_PREFIX)) {
                  let schemaType = type.split(PROTO_PREFIX)[1];
                  log.putProto(key, timestamp, record.getRaw(), schemaType);
                } else {
                  log.putRaw(key, timestamp, record.getRaw());
                  if (CustomSchemas.has(type)) {
                    try {
                      CustomSchemas.get(type)!(log, key, timestamp, record.getRaw());
                    } catch {
                      console.error('Failed to decode custom schema "' + type + '"');
                    }
                    log.setGeneratedParent(key);
                  }
                }
                break;
            }
          } catch (error) {
            console.error("Failed to decode WPILOG record:", error);
          }
        }
      }

      // Send progress update
      let now = new Date().getTime();
      if (now - lastProgressTimestamp > 1000 / 60) {
        lastProgressTimestamp = now;
        progress((byteCount / totalBytes) * 0.2);
      }
    });
  } catch (exception) {
    console.error(exception);
    reject();
    return;
  }
  // progress(1);
  setTimeout(() => {
    // Allow progress message to get through first
    resolve(
      log.toSerialized((x) => {
        progress(0.2 + x * 0.8);
      })
    );
    progress(1);
  }, 0);
};

// torun();
