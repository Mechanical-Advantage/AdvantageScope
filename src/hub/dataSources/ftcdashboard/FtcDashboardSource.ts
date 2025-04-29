import Log from "../../../shared/log/Log";
import { LiveDataSource, LiveDataSourceStatus } from "../LiveDataSource";
import { Pose2d } from "../../../shared/geometry";
import { ConfigState, ConfigAction, ConfigVarState } from "./configTypes";
import configReducer, { initialState } from "./configReducer";
import LiveDataTuner from "../LiveDataTuner";

export default class FtcDashboardSource extends LiveDataSource implements LiveDataTuner {
  private RECONNECT_DELAY_MS = 500;
  private timeout: NodeJS.Timeout | null = null;
  private liveZeroTime = 0;
  private configState: ConfigState = initialState;
  private tunableKeys: string[] = [];

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
      window.sendMainMessage("live-ftcdashboard-start", {
        uuid: this.UUID,
        address: address
      });
    }
  }

  stop() {
    super.stop();
    window.sendMainMessage("live-ftcdashboard-stop");
  }

  handleMainMessage(data: any) {
    if (this.log === null) return;
    if (data.uuid !== this.UUID) return;
    if (this.status === LiveDataSourceStatus.Stopped) return;

    if (this.timeout !== null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (data.success) {
      // Update time on first connection
      if (this.liveZeroTime === 0) {
        this.liveZeroTime = new Date().getTime() / 1000;
      }

      // Receiving data, set to active
      this.setStatus(LiveDataSourceStatus.Active);

      // Decode JSON
      let decoded: any = null;
        try {
          decoded = JSON.parse(data.string);
        } catch {}


      // Add data
      if (decoded !== null) {
        let timestamp = new Date().getTime() / 1000 - this.liveZeroTime;
        if (Object.hasOwn(decoded, "configRoot")) {
          configReducer(this.configState, decoded)
          this.parseConfigState(this.configState.configRoot,timestamp)
        }
        if (Object.hasOwn(decoded, "telemetry")) {
          let packets: any[] = decoded.telemetry;
          for (const packet of packets) {
            if (Object.hasOwn(packet, "timestamp")) {
              timestamp = packet.timestamp / 1000 - this.liveZeroTime;
            }
            if (Object.hasOwn(packet, "data")) {
                for (const key of Object.getOwnPropertyNames(packet.data)) {
                  let data = packet.data[key];
                  switch (typeof data) {
                    case "string":
                      if (!isNaN(Number(data)) && !isNaN(parseFloat(data))) {
                        let num = Number(data);
                        this.log.putNumber(key, timestamp, num)
                      } else {
                        this.log.putString(key, timestamp, data);
                      }
                      break;
                    case "boolean":
                      this.log.putBoolean(key, timestamp, data);
                      break;
                    case "number":
                      this.log.putNumber(key, timestamp, data)
                      break;
                    case "bigint":
                      this.log.putNumber(key, timestamp, Number(data));
                      break;
                  }
                }
              if (Object.hasOwn(packet.data,"x") && Object.hasOwn(packet.data, "y")) {
                this.log.putPose("Pose", timestamp, <Pose2d>{
                  translation: [Number(packet.data.x) / 39.37008, Number(packet.data.y) / 39.37008],
                  rotation: Object.hasOwn(packet.data,"heading") ? Number(packet.data.heading) : 0.0
                });
              }
            }
          }

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
    } else {
      // Failed to connect (or just disconnected), stop and reconnect automatically
      this.reconnect();
    }
  }

  private reconnect() {
    this.setStatus(LiveDataSourceStatus.Connecting);
    window.sendMainMessage("live-ftcdashboard-stop");
    this.timeout = setTimeout(() => {
      if (window.preferences === null) {
        // No preferences, can't reconnect
        this.setStatus(LiveDataSourceStatus.Error);
      } else {
        // Try to reconnect
        this.log = new Log();
        this.liveZeroTime = 0;
        window.sendMainMessage("live-ftcdashboard-start", {
          uuid: this.UUID,
          address: this.address,
          port: window.preferences.rlogPort
        });
      }
    }, this.RECONNECT_DELAY_MS);
  }

  parseConfigState(state: ConfigVarState, timestamp: number, path = "/Config") {
    switch (state.__type) {
      case "boolean":
        this.log!!.putBoolean(path,timestamp,state.__value as boolean);
        this.tunableKeys.concat(path);
        break;
      case "double":
      case "float":
      case "int":
      case "long":
        this.log!!.putNumber(path,timestamp,Number(state.__value));
        this.tunableKeys.concat(path);
        break;
      case "string":
        this.log!!.putString(path,timestamp,state.__value as string)
        this.tunableKeys.concat(path);
        break;
      case "custom":
        if (state.__value === null) {
          break;
        } else {
          for (const entry of Object.keys(state.__value)) {
            this.parseConfigState(state.__value[entry], timestamp, path + "/" + entry)
          }
          break;
        }
    }
  }

  hasTunableFields(): boolean {
    return this.configState !== initialState
  }
  isTunable(key: string): boolean {
    throw new Error("Method not implemented.");
  }
  publish(key: string, value: number | boolean): void {
    throw new Error("Method not implemented.");
  }
  unpublish(key: string): void {
    // do nothing (not possible for FTCDashboard)
  }
}
