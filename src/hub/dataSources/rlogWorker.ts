import Log from "../../shared/log/Log";
import RLOGDecoder from "./RLOGDecoder";

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
  let decoder = new RLOGDecoder();
  let success = decoder.decode(log, payload.raw);
  if (success) {
    resolve(log.toSerialized());
  } else {
    reject();
  }
};
