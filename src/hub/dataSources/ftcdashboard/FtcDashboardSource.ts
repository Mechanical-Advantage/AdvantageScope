// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Pose2d } from "../../../shared/geometry";
import Log from "../../../shared/log/Log";
import { LiveDataSource, LiveDataSourceStatus } from "../LiveDataSource";
import LiveDataTuner from "../LiveDataTuner";
import configReducer, { initialState } from "./configReducer";
import { BasicVarType, ConfigState, ConfigVar, ConfigVarState, SaveConfigAction } from "./configTypes";

export default class FtcDashboardSource extends LiveDataSource implements LiveDataTuner {
  private FTCDASHBOARD_PORT = 8000;
  private FTCDASHBOARD_DATA_TIMEOUT_MS = 5000; // How long with no data until timeout
  private FTCDASHBOARD_PING_TIMEOUT_MS = 1000; // How often to ping
  private RECONNECT_DELAY_MS = 2000;
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private liveZeroTime = 0;
  private configState: ConfigState = initialState;
  private tunableKeysTypes = new Map<string, BasicVarType>(); // key, type

  private socket: WebSocket | null = null;
  private socketTimeout: ReturnType<typeof setTimeout> | null = null;
  private pingTimeout: ReturnType<typeof setTimeout> | null = null;

  private robotClockSkew = 0;

  connect(
    address: string,
    statusCallback: (status: LiveDataSourceStatus) => void,
    outputCallback: (log: Log, timeSupplier: () => number) => void
  ) {
    super.connect(address, statusCallback, outputCallback);

    if (window.preferences === null) {
      this.setStatus(LiveDataSourceStatus.Error);
    } else {
      this.log = new Log();
      this.socket?.close();
      let url = "ws://" + address + ":" + this.FTCDASHBOARD_PORT;
      try {
        this.socket = new WebSocket(url);
      } catch (e) {
        return this.reconnect();
      }

      this.socket.addEventListener("message", (event) => {
        if (this.socketTimeout !== null) clearTimeout(this.socketTimeout);
        this.socketTimeout = setTimeout(() => {
          this.socket?.close();
        }, this.FTCDASHBOARD_DATA_TIMEOUT_MS);

        this.decodeData(event.data);
      });

      this.socket.addEventListener("error", () => {
        this.reconnect();
      });

      this.socket.addEventListener("close", () => {
        this.reconnect();
      });
      this.ping();
    }
  }

  ping() {
    if (!this.socket) {
      return;
    }
    if (this.socket.readyState === 1) {
      // OPEN
      let pingMsg = JSON.stringify({ type: "GET_ROBOT_STATUS" });
      this.socket.send(pingMsg);
    }

    if (this.pingTimeout !== null) clearTimeout(this.pingTimeout);
    this.pingTimeout = setTimeout(() => {
      this.ping();
    }, this.FTCDASHBOARD_PING_TIMEOUT_MS);
  }

  decodeData(data: string) {
    if (this.log === null) return;
    if (this.status === LiveDataSourceStatus.Stopped) return;

    if (this.timeout !== null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    // Update time on first connection
    if (this.liveZeroTime === 0) {
      this.liveZeroTime = new Date().getTime() / 1000;
    }

    // Receiving data, set to active
    this.setStatus(LiveDataSourceStatus.Active);

    // Decode JSON
    let decoded: any = null;
    try {
      decoded = JSON.parse(data);
    } catch {}

    // Add data
    if (decoded !== null) {
      let timestamp = new Date().getTime() / 1000 - this.liveZeroTime;
      if (Object.hasOwn(decoded, "configRoot")) {
        this.configState = configReducer(this.configState, decoded);
        this.parseConfigState(this.configState.configRoot, timestamp);
      }
      if (Object.hasOwn(decoded, "telemetry")) {
        let packets: any[] = decoded.telemetry;
        for (const packet of packets) {
          if (Object.hasOwn(packet, "timestamp")) {
            let packetTimestamp = packet.timestamp / 1000 - this.liveZeroTime;
            if (this.robotClockSkew === 0) {
              this.robotClockSkew = timestamp - packetTimestamp;
            }
            packetTimestamp += this.robotClockSkew;
            timestamp = packetTimestamp;
          }
          if (Object.hasOwn(packet, "data")) {
            this.logObject(packet.data, timestamp);
          }
        }
      }
      if (Object.hasOwn(decoded, "status")) {
        this.logObject(decoded.status, timestamp, "/_Status/");
      }
    }

    // Run output callback
    if (this.outputCallback !== null) {
      this.outputCallback(this.log, () => {
        if (this.log) {
          return new Date().getTime() / 1000 - this.liveZeroTime;
        } else {
          return 0;
        }
      });
    }
  }

  private logObject(obj: any, timestamp: number, path: string = "") {
    if (!this.log) {
      return;
    }
    let foundPoses = new Map<string, Pose2d>();
    for (const name of Object.getOwnPropertyNames(obj)) {
      let data = obj[name];
      let key = path + name;
      switch (typeof data) {
        case "string":
          if (!isNaN(Number(data)) && !isNaN(parseFloat(data))) {
            let num = Number(data);
            this.log.putNumber(key, timestamp, num);
          } else {
            this.log.putString(key, timestamp, data);
          }
          break;
        case "boolean":
          this.log.putBoolean(key, timestamp, data);
          break;
        case "number":
          this.log.putNumber(key, timestamp, data);
          break;
        case "bigint":
          this.log.putNumber(key, timestamp, Number(data));
          break;
      }
      // Search for poses in the telemetry by parsing lines ending with x, y, heading, and heading (deg)
      let label = name.split(" ").slice(0, -1).join(" ") + " Pose";
      if (name.endsWith(" x") || name === "x") {
        if (!foundPoses.has(label)) {
          foundPoses.set(label, { translation: [Number(data) / 39.37008, 0], rotation: 0 });
        } else {
          let cur = foundPoses.get(label)!!;
          foundPoses.set(label, <Pose2d>{
            translation: [Number(data) / 39.37008, cur.translation.at(1)],
            rotation: cur.rotation
          });
        }
      }
      if (name.endsWith(" y") || name === "y") {
        if (!foundPoses.has(label)) {
          foundPoses.set(label, { translation: [0, Number(data) / 39.37008], rotation: 0 });
        } else {
          let cur = foundPoses.get(label)!!;
          foundPoses.set(label, <Pose2d>{
            translation: [cur.translation.at(0), Number(data) / 39.37008],
            rotation: cur.rotation
          });
        }
      }
      if (name.endsWith(" heading") || name === "heading") {
        if (!foundPoses.has(label)) {
          foundPoses.set(label, { translation: [0, 0], rotation: Number(data) });
        } else {
          let cur = foundPoses.get(label)!!;
          foundPoses.set(label, <Pose2d>{ translation: cur.translation, rotation: Number(data) });
        }
      }
      if (name.endsWith(" heading (deg)") || name === "heading (deg)") {
        if (!foundPoses.has(label)) {
          foundPoses.set(label, { translation: [0, 0], rotation: (Number(data) * 2 * Math.PI) / 360 });
        } else {
          let cur = foundPoses.get(label)!!;
          foundPoses.set(label, <Pose2d>{ translation: cur.translation, rotation: (Number(data) * 2 * Math.PI) / 360 });
        }
      }
    }

    for (const label of foundPoses.keys()) {
      this.log.putPose(label, timestamp, foundPoses.get(label)!!);
    }
  }

  private reconnect() {
    this.setStatus(LiveDataSourceStatus.Connecting);
    this.timeout = setTimeout(() => {
      if (window.preferences === null) {
        // No preferences, can't reconnect
        this.setStatus(LiveDataSourceStatus.Error);
      } else {
        // Try to reconnect
        this.log = new Log();
        this.liveZeroTime = 0;
        this.robotClockSkew = 0;
        this.configState = initialState;
        this.tunableKeysTypes = new Map<string, BasicVarType>();
        this.connect(this.address!!, this.statusCallback!!, this.outputCallback!!);
      }
    }, this.RECONNECT_DELAY_MS);
  }

  private parseConfigState(state: ConfigVarState, timestamp: number, path = "/_Config") {
    switch (state.__type) {
      case "boolean":
        this.log!!.putBoolean(path, timestamp, state.__value as boolean);
        this.tunableKeysTypes.set(path, state.__type);
        break;
      case "double":
      case "float":
      case "int":
      case "long":
        this.log!!.putNumber(path, timestamp, Number(state.__value));
        this.tunableKeysTypes.set(path, state.__type);
        break;
      case "string":
        this.log!!.putString(path, timestamp, state.__value as string);
        this.tunableKeysTypes.set(path, state.__type);
        break;
      case "custom":
        if (state.__value === null) {
          break;
        } else {
          for (const entry of Object.keys(state.__value)) {
            this.parseConfigState(state.__value[entry], timestamp, path + "/" + entry);
          }
          break;
        }
    }
  }

  hasTunableFields(): boolean {
    return this.configState !== initialState;
  }
  isTunable(key: string): boolean {
    return this.tunableKeysTypes.get(key) != undefined;
  }
  publish(key: string, value: number | boolean): void {
    if (!this.isTunable(key)) {
      return;
    }
    let path = key.split("/");
    if (path[0] === "" && path[1] === "_Config") {
      path = path.slice(2);
    } else {
      return;
    }
    let saveAction: SaveConfigAction = {
      type: "SAVE_CONFIG",
      configDiff: this.generateConfigDiff(path, value, this.tunableKeysTypes.get(key)!!)
    };
    let saveMsg = JSON.stringify(saveAction);
    this.socket!!.send(saveMsg);
  }

  generateConfigDiff(path: string[], value: number | boolean, type: BasicVarType): ConfigVar {
    if (path.length === 0) {
      return {
        __type: type,
        __value: value
      };
    } else {
      return {
        __type: "custom",
        __value: { [path[0]]: this.generateConfigDiff(path.slice(1), value, type) }
      };
    }
  }
  unpublish(_key: string): void {
    // do nothing (not possible for FTCDashboard)
  }

  getTuner(): LiveDataTuner {
    return this;
  }
}
