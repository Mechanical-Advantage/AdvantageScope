import Log from "../../shared/log/Log";
import { LiveDataSource, LiveDataSourceStatus } from "./LiveDataSource";
import RLOGDecoder from "./RLOGDecoder";

export default class RLOGServerSource extends LiveDataSource {
  private RECONNECT_DELAY_MS = 1000;

  private log: Log | null = null;
  private decoder: RLOGDecoder | null = null;
  private timeout: NodeJS.Timeout | null = null;

  connect(address: string, statusCallback: (status: LiveDataSourceStatus) => void, outputCallback: (log: Log) => void) {
    super.connect(address, statusCallback, outputCallback);

    if (window.preferences == null) {
      this.setStatus(LiveDataSourceStatus.Error);
    } else {
      this.log = new Log();
      this.decoder = new RLOGDecoder();
      window.sendMainMessage("live-rlog-start", {
        uuid: this.UUID,
        address: address,
        port: window.preferences.rlogPort
      });
    }
  }

  stop() {
    super.stop();
    window.sendMainMessage("live-rlog-stop");
  }

  handleMainMessage(data: any) {
    if (this.log == null || this.decoder == null) return;
    if (data.uuid != this.UUID) return;
    if (this.status == LiveDataSourceStatus.Stopped) return;

    if (this.timeout != null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (data.success) {
      let decodeSuccess = this.decoder.decode(this.log, data.raw);
      if (decodeSuccess) {
        // New data, everything normal
        this.setStatus(LiveDataSourceStatus.Active);
        if (this.outputCallback != null) this.outputCallback(this.log);
      } else {
        // Problem decoding, don't reconnect automatically
        this.setStatus(LiveDataSourceStatus.Error);
        window.sendMainMessage("live-rlog-stop");
      }
    } else {
      // Failed to connect (or just disconnected), stop and reconnect automatically
      this.setStatus(LiveDataSourceStatus.Connecting);
      window.sendMainMessage("live-rlog-stop");
      this.timeout = setTimeout(() => {
        if (window.preferences == null) {
          // No preferences, can't reconnect
          this.setStatus(LiveDataSourceStatus.Error);
        } else {
          // Try to reconnect
          this.log = new Log();
          this.decoder = new RLOGDecoder();
          window.sendMainMessage("live-rlog-start", {
            uuid: this.UUID,
            address: this.address,
            port: window.preferences.rlogPort
          });
        }
      }, this.RECONNECT_DELAY_MS);
    }
  }
}
