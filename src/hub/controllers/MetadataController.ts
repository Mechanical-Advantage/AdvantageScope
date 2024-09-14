import { MERGE_PREFIX, METADATA_KEYS } from "../../shared/log/LogUtil";
import { MetadataRendererCommand } from "../../shared/renderers/MetadataRenderer";
import { createUUID } from "../../shared/util";
import TabController from "./TabController";

export default class MetadataController implements TabController {
  UUID = createUUID();

  private command: MetadataRendererCommand = {};

  constructor() {
    this.refresh();
  }

  getActiveFields(): string[] {
    return METADATA_KEYS;
  }

  refresh(): void {
    this.command = {};
    window.log.getFieldKeys().forEach((key) => {
      METADATA_KEYS.forEach((metadataKey) => {
        if (key.startsWith(metadataKey)) {
          let cleanKey = key.slice(metadataKey.length);
          if (key.startsWith("/" + MERGE_PREFIX)) {
            cleanKey = key.slice(0, key.indexOf("/", MERGE_PREFIX.length + 1)) + cleanKey;
          }
          if (!(cleanKey in this.command)) {
            this.command[cleanKey] = { generic: null, real: null, replay: null };
          }
          let logData = window.log.getString(key, Infinity, Infinity);
          if (logData) {
            if (metadataKey.includes("RealMetadata")) {
              this.command[cleanKey]["real"] = logData.values[0];
            } else if (metadataKey.includes("ReplayMetadata")) {
              this.command[cleanKey]["replay"] = logData.values[0];
            } else {
              this.command[cleanKey]["generic"] = logData.values[0];
            }
          }
        }
      });
    });
  }

  showTimeline(): boolean {
    return false;
  }

  getCommand(): MetadataRendererCommand {
    return this.command;
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}

  newAssets(): void {}
}
