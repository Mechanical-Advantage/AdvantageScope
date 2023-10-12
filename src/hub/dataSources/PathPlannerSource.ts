import Log from "../../shared/log/Log";
import LoggableType from "../../shared/log/LoggableType";
import { LiveDataSource, LiveDataSourceStatus } from "./LiveDataSource";
import RLOGDecoder from "./RLOGDecoder";

export default class PathPlannerSource extends LiveDataSource {
  private RECONNECT_DELAY_MS = 500;
  private PONG_TEXT = "pong";
  private timeout: NodeJS.Timeout | null = null;
  private liveZeroTime = 0;

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
      window.sendMainMessage("live-pathplanner-start", {
        uuid: this.UUID,
        address: address
      });
    }
  }

  stop() {
    super.stop();
    window.sendMainMessage("live-pathplanner-stop");
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
      if (data.string !== this.PONG_TEXT) {
        try {
          decoded = JSON.parse(data.string);
        } catch {}
      }

      // Add data
      if (decoded !== null) {
        const timestamp = new Date().getTime() / 1000 - this.liveZeroTime;
        switch (decoded.command) {
          case "pathFollowingData":
            this.log.putPose("/TargetPose", timestamp, {
              translation: [decoded.targetPose.x, decoded.targetPose.y],
              rotation: decoded.targetPose.theta
            });
            this.log.putPose("/ActualPose", timestamp, {
              translation: [decoded.actualPose.x, decoded.actualPose.y],
              rotation: decoded.actualPose.theta
            });
            break;
          case "activePath":
            this.log.putTranslationArray("/ActivePath", timestamp, decoded.states);
            break;
          default:
            console.warn("Unknown PathPlanner data", decoded);
            break;
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
    window.sendMainMessage("live-pathplanner-stop");
    this.timeout = setTimeout(() => {
      if (window.preferences === null) {
        // No preferences, can't reconnect
        this.setStatus(LiveDataSourceStatus.Error);
      } else {
        // Try to reconnect
        this.log = new Log();
        this.liveZeroTime = 0;
        window.sendMainMessage("live-pathplanner-start", {
          uuid: this.UUID,
          address: this.address,
          port: window.preferences.rlogPort
        });
      }
    }, this.RECONNECT_DELAY_MS);
  }
}
