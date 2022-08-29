import Log from "../log/Log";
import { LiveDataSource, LiveDataSourceStatus } from "./LiveDataSource";
import RLOGDecoder from "./RLOGDecoder";

export default class RLOGServerSource extends LiveDataSource {
  private RECONNECT_DELAY_MS = 1000;

  private log: Log | null = null;
  private decoder: RLOGDecoder | null = null;
  private timeout: NodeJS.Timeout | null = null;

  connect(
    address: string,
    statusCallback: (status: LiveDataSourceStatus) => void,
    outputCallback: (log: Log) => void
  ): void {
    super.connect(address, statusCallback, outputCallback);

    if (window.preferences == null) {
      this.setStatus(LiveDataSourceStatus.Error);
    } else {
      this.log = new Log();
      this.decoder = new RLOGDecoder();
      window.sendMainMessage("live-rlog-start", {
        uuid: this.uuid,
        address: address,
        port: window.preferences.rlogPort
      });
    }
  }

  stop(): void {
    super.stop();
    window.sendMainMessage("live-rlog-stop");
  }

  handleMainMessage(data: any) {
    if (this.log == null || this.decoder == null) return;
    if (data.uuid != this.uuid) return;

    if (this.timeout != null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (data.success) {
      let success = this.decoder.decode(this.log, data.raw);
      if (success) {
        if (this.outputCallback != null) this.outputCallback(this.log);
        this.setStatus(LiveDataSourceStatus.Active);
      } else {
        this.setStatus(LiveDataSourceStatus.Error);
        window.sendMainMessage("live-rlog-stop");
      }
    } else {
      window.sendMainMessage("live-rlog-stop");
      this.timeout = setTimeout(() => {
        if (window.preferences == null) {
          this.setStatus(LiveDataSourceStatus.Error);
        } else {
          this.log = new Log();
          this.decoder = new RLOGDecoder();
          this.setStatus(LiveDataSourceStatus.Connecting);
          window.sendMainMessage("live-rlog-start", {
            uuid: this.uuid,
            address: this.address,
            port: window.preferences.rlogPort
          });
        }
      }, this.RECONNECT_DELAY_MS);
    }
  }
}
