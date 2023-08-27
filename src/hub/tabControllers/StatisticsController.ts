import { Chart, ChartDataset, LegendOptions, LinearScaleOptions, registerables, TooltipCallbacks } from "chart.js";
import * as stats from "simple-statistics";
import { SimpleColors } from "../../shared/Colors";
import { StatisticsState } from "../../shared/HubState";
import LoggableType from "../../shared/log/LoggableType";
import { getEnabledData } from "../../shared/log/LogUtil";
import TabType from "../../shared/TabType";
import { cleanFloat, createUUID } from "../../shared/util";
import TabController from "../TabController";

export default class StatisticsController implements TabController {
  private UPDATE_PERIOD_MS = 100;
  private UUID = createUUID();
  private static registeredChart = false;

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
  private MEASUREMENT_TYPE: HTMLInputElement;
  private MEASUREMENT_SAMPLING: HTMLInputElement;
  private MEASUREMENT_SAMPLING_PERIOD: HTMLInputElement;
  private HISTOGRAM_MIN: HTMLInputElement;
  private HISTOGRAM_MAX: HTMLInputElement;
  private HISTOGRAM_STEP: HTMLInputElement;

  private fields: (string | null)[] = [];
  private shouldUpdate = true;
  private lastUpdateTime = 0;
  private lastIsLight: boolean | null = null;
  private histogram: Chart;

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
    this.MEASUREMENT_TYPE = configBody.lastElementChild?.children[1].children[2] as HTMLInputElement;
    this.MEASUREMENT_SAMPLING = configBody.lastElementChild?.children[1].children[4] as HTMLInputElement;
    this.MEASUREMENT_SAMPLING_PERIOD = configBody.lastElementChild?.children[1].children[6] as HTMLInputElement;
    this.HISTOGRAM_MIN = configBody.lastElementChild?.children[2].children[2] as HTMLInputElement;
    this.HISTOGRAM_MAX = configBody.lastElementChild?.children[2].children[3] as HTMLInputElement;
    this.HISTOGRAM_STEP = configBody.lastElementChild?.children[2].children[4] as HTMLInputElement;

    // Bind help link
    configBody.lastElementChild?.children[1].children[5].addEventListener("click", () => {
      window.sendMainMessage("alert", {
        title: "About sampling",
        content:
          "Fixed sampling reads data at the specified interval and is recommended in most cases. Auto sampling reads data whenever any field is updated and is recommended for timestamp synchronized logs (like those produced by AdvantageKit)."
      });
    });

    // Bind input disabling
    this.SELECTION_TYPE.addEventListener("change", () => {
      let disabled = this.SELECTION_TYPE.value !== "range";
      this.SELECTION_RANGE_MIN.disabled = disabled;
      this.SELECTION_RANGE_MAX.disabled = disabled;
    });
    this.MEASUREMENT_SAMPLING.addEventListener("change", () => {
      this.MEASUREMENT_SAMPLING_PERIOD.disabled = this.MEASUREMENT_SAMPLING.value !== "fixed";
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
    this.MEASUREMENT_SAMPLING_PERIOD.addEventListener("change", () => {
      if (Number(this.MEASUREMENT_SAMPLING_PERIOD.value) <= 0) {
        this.MEASUREMENT_SAMPLING_PERIOD.value = "1";
      }
    });
    this.HISTOGRAM_STEP.addEventListener("change", () => {
      this.updateHistogramInputs();
    });

    // Schedule update when config changes
    this.SELECTION_TYPE.addEventListener("change", () => (this.shouldUpdate = true));
    this.SELECTION_RANGE_MIN.addEventListener("change", () => (this.shouldUpdate = true));
    this.SELECTION_RANGE_MAX.addEventListener("change", () => (this.shouldUpdate = true));
    this.MEASUREMENT_TYPE.addEventListener("change", () => {
      this.shouldUpdate = true;
      this.updateFields();
    });
    this.MEASUREMENT_SAMPLING.addEventListener("change", () => (this.shouldUpdate = true));
    this.MEASUREMENT_SAMPLING_PERIOD.addEventListener("change", () => (this.shouldUpdate = true));
    this.HISTOGRAM_MIN.addEventListener("change", () => (this.shouldUpdate = true));
    this.HISTOGRAM_MAX.addEventListener("change", () => (this.shouldUpdate = true));
    this.HISTOGRAM_STEP.addEventListener("change", () => (this.shouldUpdate = true));

    // Set initial values for histogram inputs
    this.HISTOGRAM_MIN.value = "0";
    this.HISTOGRAM_MAX.value = "10";
    this.HISTOGRAM_STEP.value = "1";
    this.updateHistogramInputs();

    // Create chart
    StatisticsController.registerChart();
    this.histogram = new Chart(this.HISTOGRAM_CONTAINER.firstElementChild as HTMLCanvasElement, {
      type: "bar",
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0
        },
        scales: {
          x: {
            type: "linear",
            stacked: true,
            offset: false,
            grid: {
              offset: false
            },
            ticks: {
              stepSize: 1
            }
          },
          y: {
            stacked: true,
            grace: 0.1
          }
        }
      }
    });
  }

  /** Registers all Chart.js elements. */
  private static registerChart() {
    if (!this.registeredChart) {
      this.registeredChart = true;
      Chart.register(...registerables);
    }
  }

  /** Updates the step size for each histogram input. */
  private updateHistogramInputs() {
    if (Number(this.HISTOGRAM_STEP.value) <= 0) {
      this.HISTOGRAM_STEP.value = cleanFloat(Number(this.HISTOGRAM_STEP.step) * 0.9).toString();
    }
    let step = Math.pow(10, Math.floor(Math.log10(Number(this.HISTOGRAM_STEP.value))));
    this.HISTOGRAM_STEP.step = step.toString();

    let minMaxStep = Math.pow(10, Math.ceil(Math.log10(Number(this.HISTOGRAM_STEP.value))));
    this.HISTOGRAM_MIN.step = minMaxStep.toString();
    this.HISTOGRAM_MAX.step = minMaxStep.toString();
  }

  saveState(): StatisticsState {
    return {
      type: TabType.Statistics,
      fields: this.fields,
      selectionType: this.SELECTION_TYPE.value,
      selectionRangeMin: Number(this.SELECTION_RANGE_MIN.value),
      selectionRangeMax: Number(this.SELECTION_RANGE_MAX.value),
      measurementType: this.MEASUREMENT_TYPE.value,
      measurementSampling: this.MEASUREMENT_SAMPLING.value,
      measurementSamplingPeriod: Number(this.MEASUREMENT_SAMPLING_PERIOD.value),
      histogramMin: Number(this.HISTOGRAM_MIN.value),
      histogramMax: Number(this.HISTOGRAM_MAX.value),
      histogramStep: Number(this.HISTOGRAM_STEP.value)
    };
  }

  restoreState(state: StatisticsState) {
    this.SELECTION_TYPE.value = state.selectionType;
    this.SELECTION_RANGE_MIN.value = state.selectionRangeMin.toString();
    this.SELECTION_RANGE_MAX.value = state.selectionRangeMax.toString();
    this.MEASUREMENT_TYPE.value = state.measurementType;
    this.MEASUREMENT_SAMPLING.value = state.measurementSampling;
    this.MEASUREMENT_SAMPLING_PERIOD.value = state.measurementSamplingPeriod.toString();
    this.HISTOGRAM_MIN.value = state.histogramMin.toString();
    this.HISTOGRAM_MAX.value = state.histogramMax.toString();
    this.HISTOGRAM_STEP.value = state.histogramStep.toString();
    this.updateHistogramInputs();

    this.SELECTION_RANGE_MIN.disabled = state.selectionType !== "range";
    this.SELECTION_RANGE_MAX.disabled = state.selectionType !== "range";
    this.MEASUREMENT_SAMPLING_PERIOD.disabled = state.measurementSampling !== "fixed";

    this.fields = state.fields;
    this.updateFields();
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
      let validType = type === LoggableType.Number;

      if (active && validType) {
        if (dragData.end) {
          this.fields[index] = dragData.data.fields[0];
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
    const titles =
      this.MEASUREMENT_TYPE.value === "independent"
        ? ["Field #1", "Field #2", "Field #3"]
        : ["Reference", "Measurement #1", "Measurement #2"];
    Object.values(this.FIELD_CELLS).forEach((cell, index) => {
      let titleElement = cell.firstElementChild as HTMLElement;
      titleElement.innerText = titles[index] + ":";

      let fieldElement = cell.lastElementChild as HTMLElement;
      let key = this.fields[index];
      let availableKeys = window.log.getFieldKeys();
      if (key === null) {
        fieldElement.innerText = "<Drag Here>";
        fieldElement.style.textDecoration = "";
      } else if (!availableKeys.includes(key)) {
        fieldElement.innerText = key;
        fieldElement.style.textDecoration = "line-through";
      } else {
        fieldElement.innerText = key;
        fieldElement.style.textDecoration = "";
      }
    });
  }

  refresh() {
    this.updateFields();
    this.shouldUpdate = true;
  }

  newAssets() {}

  getActiveFields(): string[] {
    return this.fields.filter((field) => field !== null) as string[];
  }

  periodic() {
    // Update histogram layout
    this.VALUES_TABLE_CONTAINER.style.top = (this.CONFIG_TABLE.clientHeight + 10).toString() + "px";
    this.HISTOGRAM_CONTAINER.style.top = (this.CONFIG_TABLE.clientHeight + 20).toString() + "px";
    this.HISTOGRAM_CONTAINER.style.left = (this.VALUES_TABLE_CONTAINER.clientWidth + 20).toString() + "px";

    // Update histogram colors
    const isLight = !window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isLight !== this.lastIsLight) {
      this.lastIsLight = isLight;
      (this.histogram.options.plugins!.legend as LegendOptions<"bar">).labels.color = isLight ? "#222" : "#eee";
      let xAxisOptions = this.histogram.options.scales!.x as LinearScaleOptions;
      let yAxisOptions = this.histogram.options.scales!.y as LinearScaleOptions;
      xAxisOptions.ticks.color = isLight ? "#222" : "#eee";
      yAxisOptions.ticks.color = isLight ? "#222" : "#eee";
      xAxisOptions.border.color = isLight ? "#222" : "#eee";
      yAxisOptions.border.color = isLight ? "#222" : "#eee";
      xAxisOptions.grid.color = isLight ? "#eee" : "#333";
      yAxisOptions.grid.color = isLight ? "#eee" : "#333";
      this.histogram.update();
    }

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
                  i === enabledData.values.length - 1
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
      switch (this.MEASUREMENT_SAMPLING.value) {
        case "fixed":
          let period = Number(this.MEASUREMENT_SAMPLING_PERIOD.value) / 1000;
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
      let sampleData: (number | null)[][] = this.fields.map((field) => {
        let blankData: (number | null)[] = sampleTimes.map(() => null);
        if (field === null) return blankData;
        let logData = window.log.getNumber(field!, -Infinity, Infinity);
        if (!logData) return blankData;

        logData.timestamps.push(Infinity);
        let index = 0;
        let fieldSampleData: number[] = sampleTimes.map((sampleTime) => {
          if (!logData) {
            return 0.0;
          }
          while (index < logData.timestamps.length && logData.timestamps[index + 1] < sampleTime) {
            index++;
          }
          return logData.values[index];
        });
        return fieldSampleData;
      });

      // Calculate errors if using reference
      if (this.MEASUREMENT_TYPE.value !== "independent") {
        let isAbsolute = this.MEASUREMENT_TYPE.value === "absolute";
        for (let valueIndex = 0; valueIndex < sampleTimes.length; valueIndex++) {
          let reference = sampleData[0][valueIndex];
          for (let fieldIndex = 1; fieldIndex < 3; fieldIndex++) {
            let measurement = sampleData[fieldIndex][valueIndex];
            if (reference === null || measurement === null) {
              sampleData[fieldIndex][valueIndex] = null;
            } else {
              let error = measurement - reference;
              sampleData[fieldIndex][valueIndex] = isAbsolute ? Math.abs(error) : error;
            }
          }
        }
        sampleData.shift(); // Remove reference data
      }

      // Find which fields have valid data
      let fieldsHaveData = sampleData.map((data) => {
        return data.length > 0 && !data.every((value) => value === null);
      });
      let fieldHavaDataCount = fieldsHaveData.filter((hasData) => hasData).length;

      // Sort sample data
      sampleData.forEach((data) => {
        data.sort((a, b) => {
          if (a === null || b === null) return 0;
          return a - b;
        });
      });

      // Clear values
      while (this.VALUES_TABLE_BODY.firstChild) {
        this.VALUES_TABLE_BODY.removeChild(this.VALUES_TABLE_BODY.firstChild);
      }

      // Add a new title row
      let addTitle = () => {
        let titles =
          this.MEASUREMENT_TYPE.value === "independent"
            ? ["Field #1", "Field #2", "Field #3"]
            : ["Error #1", "Error #2"];
        let row = document.createElement("tr");
        this.VALUES_TABLE_BODY.appendChild(row);
        row.classList.add("title");
        let cell = document.createElement("td");
        row.appendChild(cell);
        titles.forEach((title, index) => {
          if (fieldsHaveData[index] || (fieldHavaDataCount === 0 && index === 0)) {
            let cell = document.createElement("td");
            row.appendChild(cell);
            cell.innerText = title;
          }
        });
      };

      // Add a new section header
      let addSection = (title: string) => {
        let row = document.createElement("tr");
        this.VALUES_TABLE_BODY.appendChild(row);
        row.classList.add("section");
        let cell = document.createElement("td");
        row.appendChild(cell);
        cell.colSpan = Math.max(1 + fieldHavaDataCount, 2);
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
        for (let i = 0; i < sampleData.length; i++) {
          if (fieldsHaveData[i] || (fieldHavaDataCount === 0 && i === 0)) {
            let valueCell = document.createElement("td");
            row.appendChild(valueCell);
            valueCell.innerText = "-";
            try {
              let value = calcFunction(sampleData[i].filter((value) => value !== null) as number[]);
              if (!isNaN(value) && isFinite(value)) {
                valueCell.innerText = value.toFixed(digits);
              }
            } catch {}
          }
        }
      };

      // Add all rows
      addTitle();
      addSection("Summary");
      addValues("Count", 0, (data) => data.length);
      addValues("Min", 3, stats.minSorted);
      addValues("Max", 3, stats.maxSorted);
      addSection("Center");
      addValues("Mean", 3, stats.mean);
      addValues("Median", 3, stats.medianSorted);
      addValues("Mode", 3, stats.modeSorted);
      addValues("Geometric Mean", 3, (data) => this.logAverage(data.filter((value) => value > 0)));
      addValues("Harmonic Mean", 3, (data) => stats.harmonicMean(data.filter((value) => value > 0)));
      addValues("Quadratic Mean", 3, stats.rootMeanSquare);
      addSection("Spread");
      addValues("Standard Deviation", 3, stats.sampleStandardDeviation);
      addValues("Median Absolute Deviation", 3, stats.medianAbsoluteDeviation);
      addValues("Interquartile Range", 3, stats.interquartileRange);
      addValues("Skewness", 3, stats.sampleSkewness);
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

      // Get histogram data
      let min = Number(this.HISTOGRAM_MIN.value);
      let max = Number(this.HISTOGRAM_MAX.value);
      let step = Number(this.HISTOGRAM_STEP.value);
      if (step <= 0) step = 1;
      let bins: number[] = [];
      for (let i = min; i < max; i += step) {
        bins.push(i);
      }
      let counts: number[][] = sampleData.map(() => bins.map(() => 0));
      sampleData.forEach((field, fieldIndex) => {
        field.forEach((value) => {
          if (value !== null) {
            let binIndex = Math.floor((value - min) / step);
            if (binIndex >= 0 && binIndex < bins.length) {
              counts[fieldIndex][binIndex]++;
            }
          }
        });
      });

      // Update histogram data
      this.histogram.data.labels = bins.map((value) => value + step / 2);
      this.histogram.data.datasets = counts.map((data, index) => {
        const dataset: ChartDataset = {
          label: (this.MEASUREMENT_TYPE.value === "independent" ? "Field" : "Error") + " #" + (index + 1).toString(),
          data: data,
          backgroundColor: SimpleColors[index],
          barPercentage: 1,
          categoryPercentage: 1
        };
        return dataset;
      });
      (this.histogram.options.scales!.x as LinearScaleOptions).ticks.stepSize = step;
      (this.histogram.options.plugins!.tooltip!.callbacks as TooltipCallbacks<"bar">).title = (items) => {
        if (items.length < 1) {
          return "";
        }
        const item = items[0];
        const x = item.parsed.x;
        const min = x - step / 2;
        const max = x + step / 2;
        return cleanFloat(min).toString() + " to " + cleanFloat(max).toString();
      };
      this.histogram.update();
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
