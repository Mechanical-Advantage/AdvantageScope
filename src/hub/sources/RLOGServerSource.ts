import Log from "../log/Log";
import { LiveDataSource, LiveDataSourceStatus } from "./LiveDataSource";
import RLOGDecoder from "./RLOGDecoder";

export default class RLOGServerSource extends LiveDataSource {
  private decoder = new RLOGDecoder();

  connect(
    address: string,
    log: Log,
    statusCallback: (status: LiveDataSourceStatus) => void,
    outputCallback: () => void
  ): void {
    super.connect(address, log, statusCallback, outputCallback);
    if (window.preferences == null) {
      this.setStatus(LiveDataSourceStatus.Error);
    } else {
      window.sendMainMessage("live-rlog-start", { address: address, port: window.preferences.port });
    }
  }

  stop(): void {
    super.stop();
    window.sendMainMessage("live-rlog-stop");
  }

  handleMainMessage(data: any) {
    if (this.log == null) return;
    if (data.success) {
      let success = this.decoder.decode(this.log, data.raw);
      if (success) {
        if (this.outputCallback != null) this.outputCallback();
      } else {
        this.setStatus(LiveDataSourceStatus.Error);
        window.sendMainMessage("live-rlog-stop");
      }
    } else {
      this.setStatus(LiveDataSourceStatus.Error);
      window.sendMainMessage("live-rlog-stop");
    }
  }
}
