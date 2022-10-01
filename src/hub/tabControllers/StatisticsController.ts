import * as stats from "simple-statistics";
import LoggableType from "../../lib/log/LoggableType";
import { getEnabledData } from "../../lib/log/LogUtil";
import TabType from "../../lib/TabType";
import { createUUID } from "../../lib/util";
import { StatisticsState } from "../HubState";
import TabController from "../TabController";

export default class StatisticsController implements TabController {
  private UPDATE_PERIOD_MS = 100;
  private UUID = createUUID();

  private CONTENT: HTMLElement;
  private CONFIG_TABLE: HTMLElement;
  private VALUES_TABLE_CONTAINER: HTMLElement;
  private VALUES_TABLE_BODY: HTMLElement;
  private HISTOGRAM_CONTAINER: HTMLElement;
  private DRAG_HIGHLIGHT: HTMLElement;

  private FIELD_CELLS: HTMLElement[];
  private SELECTION_TYPE: HTMLInputElement;
  private SELECTION_RANGE_MIN: HTMLInputElement;
  private SELECTION_RANGE_MAX: HTMLInputElement;
  private SAMPLING_TYPE: HTMLInputElement;
  private SAMPLING_PERIOD: HTMLInputElement;
  private HISTOGRAM_BINS: HTMLInputElement;

  private fields: (string | null)[] = [];
  private shouldUpdate = false;
  private lastUpdateTime = 0;

  constructor(content: HTMLElement) {
    this.CONTENT = content;
    this.CONFIG_TABLE = content.getElementsByClassName("stats-config")[0] as HTMLElement;
    this.VALUES_TABLE_CONTAINER = content.getElementsByClassName("stats-values-container")[0] as HTMLElement;
    this.VALUES_TABLE_BODY = this.VALUES_TABLE_CONTAINER.firstElementChild?.firstElementChild as HTMLElement;
    this.HISTOGRAM_CONTAINER = content.getElementsByClassName("stats-histogram-container")[0] as HTMLElement;
    this.DRAG_HIGHLIGHT = content.getElementsByClassName("stats-drag-highlight")[0] as HTMLElement;

    let configBody = this.CONFIG_TABLE.firstElementChild as HTMLElement;
    this.FIELD_CELLS = Array.from(configBody.firstElementChild?.children!).map((cell) => cell as HTMLElement);
    this.SELECTION_TYPE = configBody.lastElementChild?.children[0].children[2] as HTMLInputElement;
    this.SELECTION_RANGE_MIN = configBody.lastElementChild?.children[0].children[3] as HTMLInputElement;
    this.SELECTION_RANGE_MAX = configBody.lastElementChild?.children[0].children[4] as HTMLInputElement;
    this.SAMPLING_TYPE = configBody.lastElementChild?.children[1].children[2] as HTMLInputElement;
    this.SAMPLING_PERIOD = configBody.lastElementChild?.children[1].children[3] as HTMLInputElement;
    this.HISTOGRAM_BINS = configBody.lastElementChild?.children[2].children[2] as HTMLInputElement;

    // Bind help link
    configBody.lastElementChild?.children[1].children[0].children[0].addEventListener("click", () => {
      window.sendMainMessage("alert", {
        title: "About sampling",
        content:
          "Fixed sampling reads data at the specified interval and is recommended in most cases. Auto sampling reads data whenever any field is updated and is recommended for timestamp synchronized logs (like those produced by AdvantageKit)."
      });
    });

    // Bind input disabling
    this.SELECTION_TYPE.addEventListener("change", () => {
      let disabled = this.SELECTION_TYPE.value != "range";
      this.SELECTION_RANGE_MIN.disabled = disabled;
      this.SELECTION_RANGE_MAX.disabled = disabled;
    });
    this.SAMPLING_TYPE.addEventListener("change", () => {
      this.SAMPLING_PERIOD.disabled = this.SAMPLING_TYPE.value != "fixed";
    });

    // Drag handling
    window.addEventListener("drag-update", (event) => {
      this.handleDrag((event as CustomEvent).detail);
    });

    // Create field list and clear fields on right click
    Object.values(this.FIELD_CELLS).forEach((cell, index) => {
      this.fields.push(null);
      cell.addEventListener("contextmenu", () => {
        this.fields[index] = null;
        this.updateFields();
      });
    });

    // Enforce range
    this.SELECTION_RANGE_MIN.addEventListener("change", () => {
      if (Number(this.SELECTION_RANGE_MIN.value) < 0) {
        this.SELECTION_RANGE_MIN.value = "0";
      }
      if (Number(this.SELECTION_RANGE_MAX.value) < Number(this.SELECTION_RANGE_MIN.value)) {
        this.SELECTION_RANGE_MAX.value = this.SELECTION_RANGE_MIN.value;
      }
    });
    this.SELECTION_RANGE_MAX.addEventListener("change", () => {
      if (Number(this.SELECTION_RANGE_MAX.value) < 0) {
        this.SELECTION_RANGE_MAX.value = "0";
      }
      if (Number(this.SELECTION_RANGE_MAX.value) < Number(this.SELECTION_RANGE_MIN.value)) {
        this.SELECTION_RANGE_MAX.value = this.SELECTION_RANGE_MIN.value;
      }
    });
    this.SAMPLING_PERIOD.addEventListener("change", () => {
      if (Number(this.SAMPLING_PERIOD.value) <= 0) {
        this.SAMPLING_PERIOD.value = "1";
      }
    });
    this.HISTOGRAM_BINS.addEventListener("change", () => {
      if (Number(this.HISTOGRAM_BINS.value) < 1) {
        this.HISTOGRAM_BINS.value = "1";
      }
    });

    // Schedule update when config changes
    this.SELECTION_TYPE.addEventListener("change", () => (this.shouldUpdate = true));
    this.SELECTION_RANGE_MIN.addEventListener("change", () => (this.shouldUpdate = true));
    this.SELECTION_RANGE_MAX.addEventListener("change", () => (this.shouldUpdate = true));
    this.SAMPLING_TYPE.addEventListener("change", () => (this.shouldUpdate = true));
    this.SAMPLING_PERIOD.addEventListener("change", () => (this.shouldUpdate = true));
    this.HISTOGRAM_BINS.addEventListener("change", () => (this.shouldUpdate = true));
  }

  saveState(): StatisticsState {
    return {
      type: TabType.Statistics,
      fields: this.fields,
      selectionType: this.SELECTION_TYPE.value,
      selectionRangeMin: Number(this.SELECTION_RANGE_MIN.value),
      selectionRangeMax: Number(this.SELECTION_RANGE_MAX.value),
      samplingType: this.SAMPLING_TYPE.value,
      samplingPeriod: Number(this.SAMPLING_PERIOD.value),
      histogramBins: Number(this.HISTOGRAM_BINS.value)
    };
  }

  restoreState(state: StatisticsState): void {
    this.fields = state.fields;
    this.updateFields();

    this.SELECTION_TYPE.value = state.selectionType;
    this.SELECTION_RANGE_MIN.value = state.selectionRangeMin.toString();
    this.SELECTION_RANGE_MAX.value = state.selectionRangeMax.toString();
    this.SAMPLING_TYPE.value = state.samplingType;
    this.SAMPLING_PERIOD.value = state.samplingPeriod.toString();
    this.HISTOGRAM_BINS.value = state.histogramBins.toString();

    this.SELECTION_RANGE_MIN.disabled = state.selectionType != "range";
    this.SELECTION_RANGE_MAX.disabled = state.selectionType != "range";
    this.SAMPLING_PERIOD.disabled = state.samplingType != "fixed";
  }

  /** Processes a drag event, including updating a field if necessary. */
  private handleDrag(dragData: any) {
    if (this.CONTENT.hidden) return;

    this.DRAG_HIGHLIGHT.hidden = true;
    Object.values(this.FIELD_CELLS).forEach((cell, index) => {
      let rect = cell.getBoundingClientRect();
      let active =
        dragData.x > rect.left && dragData.x < rect.right && dragData.y > rect.top && dragData.y < rect.bottom;
      let type = window.log.getType(dragData.data.fields[0]);
      let validType = type == LoggableType.Number;

      if (active && validType) {
        if (dragData.end) {
          let key = dragData.data.fields[0];
          this.fields[index] = key;
          this.updateFields();
        } else {
          let contentRect = this.CONTENT.getBoundingClientRect();
          this.DRAG_HIGHLIGHT.style.left = (rect.left - contentRect.left).toString() + "px";
          this.DRAG_HIGHLIGHT.style.top = (rect.top - contentRect.top).toString() + "px";
          this.DRAG_HIGHLIGHT.style.width = rect.width.toString() + "px";
          this.DRAG_HIGHLIGHT.style.height = rect.height.toString() + "px";
          this.DRAG_HIGHLIGHT.hidden = false;
        }
      }
    });
  }

  /** Updates the field elements based on the internal field list. */
  private updateFields() {
    this.shouldUpdate = true;
    Object.values(this.FIELD_CELLS).forEach((cell, index) => {
      let textElement = cell.lastElementChild as HTMLElement;
      let key = this.fields[index];
      let availableKeys = window.log.getFieldKeys();

      if (key == null) {
        textElement.innerText = "<Drag Here>";
        textElement.style.textDecoration = "";
      } else if (!availableKeys.includes(key)) {
        textElement.innerText = key;
        textElement.style.textDecoration = "line-through";
      } else {
        textElement.innerText = key;
        textElement.style.textDecoration = "";
      }
    });
  }

  refresh(): void {
    this.updateFields();
    this.shouldUpdate = true;
  }

  periodic(): void {
    // Update histogram layout
    this.VALUES_TABLE_CONTAINER.style.top = (this.CONFIG_TABLE.clientHeight + 20).toString() + "px";
    this.HISTOGRAM_CONTAINER.style.top = (this.CONFIG_TABLE.clientHeight + 20).toString() + "px";
    this.HISTOGRAM_CONTAINER.style.left = (this.VALUES_TABLE_CONTAINER.clientWidth + 20).toString() + "px";

    // Check if data should be updated
    let currentTime = new Date().getTime();
    if (this.shouldUpdate && currentTime - this.lastUpdateTime > this.UPDATE_PERIOD_MS) {
      this.shouldUpdate = false;
      this.lastUpdateTime = currentTime;

      // Get sample ranges
      let sampleRanges: [number, number][] = [];
      switch (this.SELECTION_TYPE.value) {
        case "full":
          sampleRanges.push(window.log.getTimestampRange());
          break;
        case "enabled":
          let enabledData = getEnabledData(window.log);
          if (enabledData) {
            for (let i = 0; i < enabledData.values.length; i++) {
              if (enabledData.values[i]) {
                let startTime = enabledData.timestamps[i];
                let endTime =
                  i == enabledData.values.length - 1
                    ? window.log.getTimestampRange()[1]
                    : enabledData.timestamps[i + 1];
                sampleRanges.push([startTime, endTime]);
              }
            }
          }
          break;
        case "range":
          sampleRanges.push([Number(this.SELECTION_RANGE_MIN.value), Number(this.SELECTION_RANGE_MAX.value)]);
          break;
      }

      // Get sample timestamps
      let sampleTimes: number[] = [];
      switch (this.SAMPLING_TYPE.value) {
        case "fixed":
          let period = Number(this.SAMPLING_PERIOD.value) / 1000;
          sampleRanges.forEach((range) => {
            for (let i = range[0]; i < range[1]; i += period) {
              sampleTimes.push(i);
            }
          });
          break;
        case "auto":
          let allTimestamps = window.log.getTimestamps(window.log.getFieldKeys(), this.UUID);
          sampleRanges.forEach((range) => {
            sampleTimes = sampleTimes.concat(
              allTimestamps.filter((timestamp) => timestamp >= range[0] && timestamp <= range[1])
            );
          });
          break;
      }

      // Get valid fields and sample data
      let sampleData: number[][] = this.fields
        .filter((field) => field != null)
        .map((field) => {
          let fieldSampleData: number[] = [];
          let logData = window.log.getNumber(field!, -Infinity, Infinity);
          if (logData) {
            let index = 0;
            logData.timestamps.push(Infinity);
            sampleTimes.forEach((sampleTime) => {
              if (!logData) return;
              while (index < logData.timestamps.length && logData.timestamps[index + 1] < sampleTime) {
                index++;
              }
              fieldSampleData.push(logData.values[index]);
            });
          }
          fieldSampleData.sort((a, b) => a - b);
          return fieldSampleData;
        });

      // Clear values
      while (this.VALUES_TABLE_BODY.firstChild) {
        this.VALUES_TABLE_BODY.removeChild(this.VALUES_TABLE_BODY.firstChild);
      }

      // Add a new section header
      let addSection = (title: string) => {
        let row = document.createElement("tr");
        this.VALUES_TABLE_BODY.appendChild(row);
        row.classList.add("section");
        let cell = document.createElement("td");
        row.appendChild(cell);
        cell.colSpan = Math.max(1 + sampleData.length, 2);
        cell.innerText = title;
      };

      // Add a new row with data
      let addValues = (title: string, digits: number, calcFunction: (data: number[]) => number) => {
        let row = document.createElement("tr");
        this.VALUES_TABLE_BODY.appendChild(row);
        row.classList.add("values");
        let titleCell = document.createElement("td");
        row.appendChild(titleCell);
        titleCell.innerText = title;
        for (let i = 0; i < (sampleData.length == 0 ? 1 : sampleData.length); i++) {
          let valueCell = document.createElement("td");
          row.appendChild(valueCell);
          valueCell.innerText = "???";
          if (sampleData.length > 0) {
            try {
              let value = calcFunction(sampleData[i]);
              if (!isNaN(value) && isFinite(value)) {
                valueCell.innerText = value.toFixed(digits);
              }
            } catch {}
          }
        }
      };

      // Add all rows
      addSection("Summary");
      addValues("Count", 0, (data) => data.length);
      addValues("Min", 3, (data) => stats.minSorted(data));
      addValues("Max", 3, (data) => stats.maxSorted(data));
      addSection("Center");
      addValues("Mean", 3, (data) => stats.mean(data));
      addValues("Median", 3, (data) => stats.medianSorted(data));
      addValues("Mode", 3, (data) => stats.modeSorted(data));
      addValues("Geometric Mean", 3, (data) => this.logAverage(data.filter((value) => value > 0)));
      addValues("Harmonic Mean", 3, (data) => stats.harmonicMean(data.filter((value) => value > 0)));
      addValues("Quadratic Mean", 3, (data) => stats.rootMeanSquare(data));
      addSection("Spread");
      addValues("Standard Deviation", 3, (data) => stats.sampleStandardDeviation(data));
      addValues("Median Absolute Deviation", 3, (data) => stats.medianAbsoluteDeviation(data));
      addValues("Interquartile Range", 3, (data) => stats.interquartileRange(data));
      addValues("Skewness", 3, (data) => stats.sampleSkewness(data));
      addSection("Percentiles");
      addValues("1st Percentile", 3, (data) => stats.quantileSorted(data, 0.01));
      addValues("5th Percentile", 3, (data) => stats.quantileSorted(data, 0.05));
      addValues("10th Percentile", 3, (data) => stats.quantileSorted(data, 0.1));
      addValues("25th Percentile", 3, (data) => stats.quantileSorted(data, 0.25));
      addValues("50th Percentile", 3, (data) => stats.quantileSorted(data, 0.5));
      addValues("75th Percentile", 3, (data) => stats.quantileSorted(data, 0.75));
      addValues("90th Percentile", 3, (data) => stats.quantileSorted(data, 0.9));
      addValues("95th Percentile", 3, (data) => stats.quantileSorted(data, 0.95));
      addValues("99th Percentile", 3, (data) => stats.quantileSorted(data, 0.99));
    }
  }

  /**
   * --- Copied from "https://github.com/simple-statistics/simple-statistics/blob/master/src/log_average.js" ---
   *
   * The [log average](https://en.wikipedia.org/wiki/https://en.wikipedia.org/wiki/Geometric_mean#Relationship_with_logarithms)
   * is an equivalent way of computing the geometric mean of an array suitable for large or small products.
   *
   * It's found by calculating the average logarithm of the elements and exponentiating.
   *
   * @param {Array<number>} x sample of one or more data points
   * @returns {number} geometric mean
   * @throws {Error} if x is empty
   * @throws {Error} if x contains a negative number
   */
  private logAverage(x: number[]): number {
    if (x.length === 0) {
      throw new Error("logAverage requires at least one data point");
    }

    let value = 0;
    for (let i = 0; i < x.length; i++) {
      if (x[i] < 0) {
        throw new Error("logAverage requires only non-negative numbers as input");
      }
      value += Math.log(x[i]);
    }

    return Math.exp(value / x.length);
  }
}
