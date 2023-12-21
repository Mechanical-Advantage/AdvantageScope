import { TabState } from "../../shared/HubState";
import { MERGE_PREFIX, METADATA_KEYS } from "../../shared/log/LogUtil";
import TabType from "../../shared/TabType";
import TabController from "../TabController";

export default class MetadataController implements TabController {
  private NO_DATA_ALERT: HTMLElement;
  private TABLE_CONTAINER: HTMLElement;
  private TABLE_BODY: HTMLElement;

  private lastDataString: string = "";

  constructor(content: HTMLElement) {
    this.NO_DATA_ALERT = content.getElementsByClassName("tab-centered")[0] as HTMLElement;
    this.TABLE_CONTAINER = content.getElementsByClassName("metadata-table-container")[0] as HTMLElement;
    this.TABLE_BODY = content.getElementsByClassName("metadata-table")[0].firstElementChild as HTMLElement;
    this.refresh();
  }

  saveState(): TabState {
    return { type: TabType.Metadata };
  }

  restoreState(state: TabState) {}

  getActiveFields(): string[] {
    return METADATA_KEYS;
  }

  periodic() {}

  refresh() {
    // Get data
    let data: { [id: string]: { generic: string | null; real: string | null; replay: string | null } } = {};
    window.log.getFieldKeys().forEach((key) => {
      METADATA_KEYS.forEach((metadataKey) => {
        if (key.startsWith(metadataKey)) {
          let cleanKey = key.slice(metadataKey.length);
          if (key.startsWith("/" + MERGE_PREFIX)) {
            cleanKey = key.slice(0, key.indexOf("/", MERGE_PREFIX.length + 1)) + cleanKey;
          }
          if (!(cleanKey in data)) {
            data[cleanKey] = { generic: null, real: null, replay: null };
          }
          let logData = window.log.getString(key, Infinity, Infinity);
          if (logData) {
            if (metadataKey.includes("RealMetadata")) {
              data[cleanKey]["real"] = logData.values[0];
            } else if (metadataKey.includes("ReplayMetadata")) {
              data[cleanKey]["replay"] = logData.values[0];
            } else {
              data[cleanKey]["generic"] = logData.values[0];
            }
          }
        }
      });
    });

    // Exit if nothing has changed
    let dataString = JSON.stringify(data);
    if (dataString === this.lastDataString) {
      return;
    }
    this.lastDataString = dataString;

    // Remove old rows and headers
    while (this.TABLE_BODY.childElementCount > 1) {
      this.TABLE_BODY.removeChild(this.TABLE_BODY.lastChild as HTMLElement);
    }
    while (this.TABLE_BODY.firstElementChild!.childElementCount > 1) {
      this.TABLE_BODY.firstElementChild!.removeChild(this.TABLE_BODY.firstElementChild!.lastChild as HTMLElement);
    }

    // Update headers
    let visibleTypes: Set<"generic" | "real" | "replay"> = new Set();
    let visibleTypesArr: ("generic" | "real" | "replay")[] = [];
    Object.values(data).forEach((value) => {
      if (value.generic !== null) visibleTypes.add("generic");
      if (value.real !== null) visibleTypes.add("real");
      if (value.replay !== null) visibleTypes.add("replay");
    });
    if (visibleTypes.has("generic")) {
      this.TABLE_BODY.firstElementChild!.appendChild(document.createElement("th")).innerText = "Value";
      visibleTypesArr.push("generic");
    }
    if (visibleTypes.has("real")) {
      this.TABLE_BODY.firstElementChild!.appendChild(document.createElement("th")).innerText = "Real";
      visibleTypesArr.push("real");
    }
    if (visibleTypes.has("replay")) {
      this.TABLE_BODY.firstElementChild!.appendChild(document.createElement("th")).innerText = "Replay";
      visibleTypesArr.push("replay");
    }

    // Add rows
    let keys = Object.keys(data);
    keys.sort();
    keys.sort((a, b) => {
      if (a.startsWith("/" + MERGE_PREFIX)) a = a.slice(a.indexOf("/", MERGE_PREFIX.length + 1));
      if (b.startsWith("/" + MERGE_PREFIX)) b = b.slice(b.indexOf("/", MERGE_PREFIX.length + 1));
      return a.localeCompare(b);
    });
    keys.forEach((key) => {
      let row = document.createElement("tr");
      this.TABLE_BODY.appendChild(row);
      let cells: HTMLTableCellElement[] = [];
      let visibleTypesIdx = 0;
      for (let i = 0; i < 1 + visibleTypes.size; i++) {
        let cell = document.createElement("td");
        cells.push(cell);
        row.appendChild(cell);

        if (i === 0) {
          cell.innerText = key.substring(1);
        } else {
          let value = data[key][visibleTypesArr[visibleTypesIdx]];
          if (value !== null) {
            cell.innerText = value;
          } else {
            cell.innerText = "NA";
            cell.classList.add("no-data");
          }
          visibleTypesIdx++;
        }
      }
    });

    // Show/hide table
    let showTable = keys.length > 0;
    this.NO_DATA_ALERT.hidden = showTable;
    this.TABLE_CONTAINER.hidden = !showTable;
  }

  newAssets() {}
}
