import Log from "../../shared/log/Log";
import { LiveDataSource, LiveDataSourceStatus } from "./LiveDataSource";
import RLOGDecoder from "./RLOGDecoder";

export default class RLOGServerSource extends LiveDataSource {
  private RECONNECT_DELAY_MS = 500;
  private MIN_LIVE_RESYNC_SECS = 0.15; // Resync live data if out of sync by longer than this

  private decoder: RLOGDecoder | null = null;
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
    if (this.log === null || this.decoder === null) return;
    if (data.uuid !== this.UUID) return;
    if (this.status === LiveDataSourceStatus.Stopped) return;

    if (this.timeout !== null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (data.success) {
      let decodeSuccess = this.decoder.decode(this.log, data.raw);
      if (decodeSuccess) {
        // New data, everything normal
        this.setStatus(LiveDataSourceStatus.Active);

        // Update time sync
        if (this.log.getFieldKeys().length > 0) {
          let logRange = window.log.getTimestampRange();
          let newLiveZeroTime = new Date().getTime() / 1000 - (logRange[1] - logRange[0]);
          if (Math.abs(this.liveZeroTime - newLiveZeroTime) > this.MIN_LIVE_RESYNC_SECS) {
            this.liveZeroTime = newLiveZeroTime;
          }
        }

        // Run output callback
        if (this.outputCallback !== null)
          this.outputCallback(this.log, () => {
            if (this.log) {
              return new Date().getTime() / 1000 - this.liveZeroTime + this.log.getTimestampRange()[0];
            } else {
              return 0;
            }
          });
      } else {
        // Problem decoding, reconnect
        this.reconnect();
      }
    } else {
      // Failed to connect (or just disconnected), stop and reconnect automatically
      this.reconnect();
    }
  }

  private reconnect() {
    this.setStatus(LiveDataSourceStatus.Connecting);
    window.sendMainMessage("live-rlog-stop");
    this.timeout = setTimeout(() => {
      if (window.preferences === null) {
        // No preferences, can't reconnect
        this.setStatus(LiveDataSourceStatus.Error);
      } else {
        // Try to reconnect
        this.log = new Log();
        this.decoder = new RLOGDecoder();
        this.liveZeroTime = 0;
        window.sendMainMessage("live-rlog-start", {
          uuid: this.UUID,
          address: this.address,
          port: window.preferences.rlogPort
        });
      }
    }, this.RECONNECT_DELAY_MS);
  }
}
