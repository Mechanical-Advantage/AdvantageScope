import Log from "../../shared/log/Log";
import RLOGDecoder from "./RLOGDecoder";

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
  let log = new Log();
  let decoder = new RLOGDecoder();
  let success = decoder.decode(log, payload[0], progress);
  if (success) {
    resolve(log.toSerialized());
  } else {
    reject();
  }
};
