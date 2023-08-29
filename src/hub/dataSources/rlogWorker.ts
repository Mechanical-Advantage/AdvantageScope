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
  let log = new Log(false); // No timestamp set cache for efficiency
  let decoder = new RLOGDecoder();
  let success = decoder.decode(log, payload[0], progress);
  if (success) {
    progress(1);
    setTimeout(() => {
      // Allow progress message to get through first
      resolve(log.toSerialized());
    }, 0);
  } else {
    reject();
  }
};
