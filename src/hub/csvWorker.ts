import Log from "../shared/log/Log";
import LogFieldTree from "../shared/log/LogFieldTree";

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

  try {
    let log = Log.fromSerialized(payload);

    // Get list of fields
    let fields: string[] = [];
    let processTree = (data: { [id: string]: LogFieldTree }) => {
      Object.keys(data)
        .sort()
        .forEach((key) => {
          if (data[key].fullKey != null) {
            fields.push(data[key].fullKey as string);
          }
          if (Object.keys(data[key].children).length > 0) {
            processTree(data[key].children);
          }
        });
    };
    processTree(log.getFieldTree(false));

    // Record timestamps
    let data: string[][] = [["Timestamp"]];
    let timestamps = log.getTimestamps(log.getFieldKeys());
    timestamps.forEach((timestamp) => {
      data.push([timestamp.toString()]);
    });

    // Retrieve data
    fields.forEach((field) => {
      data[0].push(field);
      let fieldData = log.getRange(field, -Infinity, Infinity);

      timestamps.forEach((timestamp, index) => {
        if (!fieldData) return;
        let nextIndex = fieldData.timestamps.findIndex((value) => value > timestamp);
        if (nextIndex == -1) nextIndex = fieldData.timestamps.length;
        let value: any = null;
        if (nextIndex != 0) {
          value = fieldData.values[nextIndex - 1];
        }
        data[index + 1].push(JSON.stringify(value).replaceAll(",", ";"));
      });
    });

    // Convert to string
    resolve(data.map((x) => x.join(",")).join("\n"));
  } catch {
    // Something went wrong
    reject();
  }
};
