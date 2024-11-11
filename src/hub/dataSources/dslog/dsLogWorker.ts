import Log from "../../../shared/log/Log";
import { HistoricalDataSource_WorkerRequest, HistoricalDataSource_WorkerResponse } from "../HistoricalDataSource";
import { DSEventsReader } from "./DSEventsReader";
import { DSLogReader } from "./DSLogReader";

function sendResponse(response: HistoricalDataSource_WorkerResponse) {
  self.postMessage(response);
}

self.onmessage = async (event) => {
  let request: HistoricalDataSource_WorkerRequest = event.data;
  if (request.type !== "start") return;

  // Loading is fast and we don't know how long dslog vs dsevents will take
  sendResponse({
    type: "progress",
    value: 1
  });

  // Decode logs
  let log = new Log();
  if (request.data[0] !== null) {
    let dsLog = new DSLogReader(request.data[0]);
    if (!dsLog.isSupportedVersion()) {
      sendResponse({ type: "failed" });
      return;
    }
    dsLog.forEach((entry) => {
      log.putNumber("/DSLog/TripTimeMS", entry.timestamp, entry.tripTimeMs);
      log.putNumber("/DSLog/PacketLoss", entry.timestamp, entry.packetLoss);
      log.putNumber("/DSLog/BatteryVoltage", entry.timestamp, entry.batteryVolts);
      log.putNumber("/DSLog/RioCPUUtilization", entry.timestamp, entry.rioCpuUtilization);
      log.putBoolean("/DSLog/Status/Brownout", entry.timestamp, entry.brownout);
      log.putBoolean("/DSLog/Status/Watchdog", entry.timestamp, entry.watchdog);
      log.putBoolean("/DSLog/Status/DSTeleop", entry.timestamp, entry.dsTeleop);
      log.putBoolean("/DSLog/Status/DSDisabled", entry.timestamp, entry.dsDisabled);
      log.putBoolean("/DSLog/Status/RobotTeleop", entry.timestamp, entry.robotTeleop);
      log.putBoolean("/DSLog/Status/RobotAuto", entry.timestamp, entry.robotAuto);
      log.putBoolean("/DSLog/Status/RobotDisabled", entry.timestamp, entry.robotDisabled);
      log.putNumber("/DSLog/CANUtilization", entry.timestamp, entry.canUtilization);
      log.putNumberArray("/DSLog/PowerDistributionCurrents", entry.timestamp, entry.powerDistributionCurrents);

      // Signal strength and bandwidth are not logged:
      // https://www.chiefdelphi.com/t/alternate-viewer-for-driver-station-logs-dslog/120629/11
      //
      // log.putNumber("/DSLog/WifiDb", entry.timestamp, entry.wifiDb);
      // log.putNumber("/DSLog/WifiMb", entry.timestamp, entry.wifiMb);
    });
  }
  if (request.data[1] !== null) {
    let dsEvents = new DSEventsReader(request.data[1]);
    if (!dsEvents.isSupportedVersion()) {
      sendResponse({ type: "failed" });
      return;
    }
    dsEvents.forEach((entry) => {
      log.putString("/DSEvents", entry.timestamp, entry.text);
    });
  }
  sendResponse({
    type: "initial",
    log: log.toSerialized(),
    isPartial: false
  });
};
