// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "../../../shared/log/Log";
import { HistoricalDataSource_WorkerRequest, HistoricalDataSource_WorkerResponse } from "../HistoricalDataSource";
import CSVDecoder from "./CSVDecoder";

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

  try {
    let decodedData = new TextDecoder().decode(request.data[0]);
    let log = new Log(false); // No timestamp set cache for efficiency

    let decoder = new CSVDecoder();
    decoder.decode(log, decodedData, progress);

    log.getChangedFields(); // Reset changed fields
    progress(1);
    sendResponse({
      type: "initial",
      log: log.toSerialized(),
      isPartial: false
    });
  } catch (e) {
    console.error(e);
    sendResponse({
      type: "failed"
    });
    return;
  }
};
