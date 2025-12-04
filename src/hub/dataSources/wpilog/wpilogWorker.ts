// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Log from "../../../shared/log/Log";
import { HistoricalDataSource_WorkerRequest, HistoricalDataSource_WorkerResponse } from "../HistoricalDataSource";
import { WPILOGDecoder } from "./WPILOGDecoder";
import WPILOGLoader from "./WPILOGFileLoader";

let decoder: WPILOGDecoder | null = null;
const log = new Log(false);
const entryIds: { [id: number]: string } = {};
const entryTypes: { [id: string]: string } = {};
const entryStartTimes: { [id: number]: number } = {};
const dataRecordPositions: { [id: string]: number[] } = {};

function sendResponse(response: HistoricalDataSource_WorkerResponse) {
  self.postMessage(response);
}
let loader = new WPILOGLoader(sendResponse);
self.onmessage = async (event) => {
  let request: HistoricalDataSource_WorkerRequest = event.data;
  switch (request.type) {
    case "start":
      await start(request.data[0]);
      break;

    case "parseField":
      loader.parseField(request.key);
      break;
  }
};

async function start(data: Uint8Array) {
  await loader.loadFile(data);
  let lastProgressValue = 0;
  let shortLivedFieldNames: Set<string> = new Set();
  // decoder = new WPILOGDecoder(data);
}
