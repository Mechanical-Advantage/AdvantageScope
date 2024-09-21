import Log from "../../../shared/log/Log";
import { HistoricalDataSource_WorkerRequest, HistoricalDataSource_WorkerResponse } from "../HistoricalDataSource";
import RLOGDecoder from "./RLOGDecoder";

function sendResponse(response: HistoricalDataSource_WorkerResponse) {
  self.postMessage(response);
}

self.onmessage = async (event) => {
  let request: HistoricalDataSource_WorkerRequest = event.data;
  if (request.type !== "start") return;

  let progress = (value: number) => {
    sendResponse({
      type: "progress",
      value: value
    });
  };

  let log = new Log(false); // No timestamp set cache for efficiency
  let decoder = new RLOGDecoder(true);
  let success = decoder.decode(log, request.data[0], progress);
  if (success) {
    progress(1);
    sendResponse({
      type: "initial",
      log: log.toSerialized(),
      isPartial: false
    });
  } else {
    sendResponse({
      type: "failed"
    });
  }
};
