import { TabState } from "../../shared/HubState";
import LogFieldTree from "../../shared/log/LogFieldTree";
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
    return ["/RealMetadata", "/ReplayMetadata", "NT:/AdvantageKit/RealMetadata", "NT:/AdvantageKit/ReplayMetadata"];
  }

  periodic() {}

  refresh() {
    let fieldList = window.log.getFieldKeys();

    // Get data
    let tree = window.log.getFieldTree();
    let data: { [id: string]: { real: string | null; replay: string | null } } = {};
    let scanTree = (fieldData: LogFieldTree, prefix: string, isReal: boolean) => {
      if (fieldData.fullKey) {
        let cleanKey = fieldData.fullKey.slice(prefix.length);
        if (!(cleanKey in data)) {
          data[cleanKey] = { real: null, replay: null };
        }
        let logData = window.log.getString(fieldData.fullKey, 0, 0);
        if (logData) data[cleanKey][isReal ? "real" : "replay"] = logData.values[0];
      } else {
        Object.values(fieldData.children).forEach((child) => {
          scanTree(child, prefix, isReal);
        });
      }
    };
    if ("RealMetadata" in tree) {
      scanTree(tree["RealMetadata"], "/RealMetadata", true);
    }
    if ("ReplayMetadata" in tree) {
      scanTree(tree["ReplayMetadata"], "/ReplayMetadata", false);
    }
    if ("NT" in tree && "AdvantageKit" in tree["NT"].children) {
      let akitTable = tree["NT"].children["AdvantageKit"].children;
      if ("RealMetadata" in akitTable) {
        scanTree(akitTable["RealMetadata"], "NT:/AdvantageKit/RealMetadata", true);
      }
      if ("ReplayMetadata" in akitTable) {
        scanTree(akitTable["ReplayMetadata"], "NT:/AdvantageKit/ReplayMetadata", false);
      }
    }

    // Exit if nothing has changed
    let dataString = JSON.stringify(data);
    if (dataString === this.lastDataString) {
      return;
    }
    this.lastDataString = dataString;

    // Remove old rows
    while (this.TABLE_BODY.childElementCount > 1) {
      this.TABLE_BODY.removeChild(this.TABLE_BODY.lastChild as HTMLElement);
    }

    // Add rows
    let keys = Object.keys(data);
    keys.sort();
    keys.forEach((key) => {
      let row = document.createElement("tr");
      this.TABLE_BODY.appendChild(row);
      let cells: HTMLTableCellElement[] = [];
      for (let i = 0; i < 3; i++) {
        let cell = document.createElement("td");
        cells.push(cell);
        row.appendChild(cell);
      }

      cells[0].innerText = key.substring(1);
      if (data[key].real !== null) {
        cells[1].innerText = data[key].real as string;
      } else {
        cells[1].innerText = "NA";
        cells[1].classList.add("no-data");
      }
      if (data[key].replay !== null) {
        cells[2].innerText = data[key].replay as string;
      } else {
        cells[2].innerText = "NA";
        cells[2].classList.add("no-data");
      }
    });

    // Show/hide table
    let showTable = keys.length > 0;
    this.NO_DATA_ALERT.hidden = showTable;
    this.TABLE_CONTAINER.hidden = !showTable;
  }

  newAssets() {}
}
