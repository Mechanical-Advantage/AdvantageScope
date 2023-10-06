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
            this.log.setGeneratedParent("/TargetPose");
            this.log.setGeneratedParent("/ActualPose");

            this.log.createBlankField("/TargetPose", LoggableType.Empty);
            this.log.createBlankField("/ActualPose", LoggableType.Empty);
            this.log.setSpecialType("/TargetPose", "Pose2d");
            this.log.setSpecialType("/ActualPose", "Pose2d");

            this.log.createBlankField("/TargetPose/translation", LoggableType.Empty);
            this.log.createBlankField("/ActualPose/translation", LoggableType.Empty);
            this.log.setSpecialType("/TargetPose/translation", "Translation2d");
            this.log.setSpecialType("/ActualPose/translation", "Translation2d");

            this.log.createBlankField("/TargetPose/rotation", LoggableType.Empty);
            this.log.createBlankField("/ActualPose/rotation", LoggableType.Empty);
            this.log.setSpecialType("/TargetPose/rotation", "Rotation2d");
            this.log.setSpecialType("/ActualPose/rotation", "Rotation2d");

            this.log.putNumber("/TargetPose/translation/x", timestamp, decoded.targetPose.x);
            this.log.putNumber("/TargetPose/translation/y", timestamp, decoded.targetPose.y);
            this.log.putNumber("/TargetPose/rotation/value", timestamp, decoded.targetPose.theta);
            this.log.putNumber("/ActualPose/translation/x", timestamp, decoded.actualPose.x);
            this.log.putNumber("/ActualPose/translation/y", timestamp, decoded.actualPose.y);
            this.log.putNumber("/ActualPose/rotation/value", timestamp, decoded.actualPose.theta);
            break;
          case "activePath":
            this.log.setGeneratedParent("/ActivePath");
            this.log.createBlankField("/ActivePath", LoggableType.Empty);
            this.log.setSpecialType("/ActivePath", "Translation2d[]");

            const length = decoded.states.length;
            this.log.putNumber("/ActivePath/length", timestamp, length);

            for (let i = 0; i < length; i++) {
              this.log.createBlankField("/ActivePath/" + i.toString(), LoggableType.Empty);
              this.log.setSpecialType("/ActivePath/" + i.toString(), "Translation2d");
              this.log.putNumber("/ActivePath/" + i.toString() + "/x", timestamp, decoded.states[i][0]);
              this.log.putNumber("/ActivePath/" + i.toString() + "/y", timestamp, decoded.states[i][1]);
            }
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
