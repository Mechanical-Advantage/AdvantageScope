import { Log } from "./modules/log.mjs";

// Encodes the data from a Log to an array savable as a CSV.
onmessage = function (event) {
  var log = new Log();
  log.rawData = event.data;

  // Get list of fields
  var fields = [];
  var processTree = (data) => {
    Object.keys(data)
      .sort()
      .forEach((key) => {
        if (data[key].field != null) {
          fields.push(data[key].field);
        }
        if (Object.keys(data[key].children).length > 0) {
          processTree(data[key].children);
        }
      });
  };
  processTree(log.getFieldTree(false));

  // Record timestamps
  var data = [["Timestamp"]];
  log.getTimestamps().forEach((timestamp) => {
    data.push([[timestamp]]);
  });

  // Retrieve data
  fields.forEach((id) => {
    data[0].push(log.getFieldInfo(id).displayKey);
    var fieldData = log.getDataInRange(id, -Infinity, Infinity);
    log.getTimestamps().forEach((_, index) => {
      var nextIndex = fieldData.timestampIndexes.findIndex((value) => value > index);
      if (nextIndex == -1) nextIndex = fieldData.timestampIndexes.length;
      if (nextIndex == 0) {
        var value = null;
      } else {
        var value = fieldData.values[nextIndex - 1];
      }
      data[index + 1].push(JSON.stringify(value).replaceAll(",", "_"));
    });
  });

  // Convert to string
  this.postMessage(data.map((x) => x.join(",")).join("\n"));
};
