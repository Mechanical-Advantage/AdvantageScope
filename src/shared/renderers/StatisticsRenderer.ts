import { Chart, ChartDataset, LegendOptions, LinearScaleOptions, TooltipCallbacks, registerables } from "chart.js";
import { ensureThemeContrast } from "../Colors";
import { cleanFloat } from "../util";
import TabRenderer from "./TabRenderer";

export default class StatisticsRenderer implements TabRenderer {
  private static registeredChart = false;

  private VALUES_TABLE_CONTAINER: HTMLElement;
  private VALUES_TABLE_BODY: HTMLElement;
  private HISTOGRAM_CONTAINER: HTMLElement;

  private changeCounter = -1;
  private firstRender = true;
  private lastIsLight: boolean | null = null;
  private histogram: Chart;

  /** Registers all Chart.js elements. */
  private static registerChart() {
    if (!this.registeredChart) {
      this.registeredChart = true;
      Chart.register(...registerables);
    }
  }

  constructor(root: HTMLElement) {
    this.VALUES_TABLE_CONTAINER = root.getElementsByClassName("stats-values-container")[0] as HTMLElement;
    this.VALUES_TABLE_BODY = this.VALUES_TABLE_CONTAINER.firstElementChild?.firstElementChild as HTMLElement;
    this.HISTOGRAM_CONTAINER = root.getElementsByClassName("stats-histogram-container")[0] as HTMLElement;

    // Create chart
    StatisticsRenderer.registerChart();
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
        plugins: {
          legend: {
            onClick: () => {}
          }
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

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}

  getAspectRatio(): number | null {
    return null;
  }

  render(command: StatisticsRendererCommand): void {
    // Update histogram layout
    this.HISTOGRAM_CONTAINER.style.left = (this.VALUES_TABLE_CONTAINER.offsetWidth + 10).toString() + "px";

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

    // Update data
    if (command.changeCounter !== this.changeCounter || this.firstRender) {
      this.firstRender = false;
      this.changeCounter = command.changeCounter;

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
        cell.colSpan = Math.max(1 + command.fields.length, 2);
        cell.innerText = title;
      };

      // Add a new row with data
      let addValues = (title: string, digits: number, getValue: (stats: StatisticsRendererCommand_Stats) => number) => {
        let row = document.createElement("tr");
        this.VALUES_TABLE_BODY.appendChild(row);
        row.classList.add("values");
        let titleCell = document.createElement("td");
        row.appendChild(titleCell);
        titleCell.innerText = title;
        command.fields.forEach((field) => {
          let color = ensureThemeContrast(field.color);
          let valueCell = document.createElement("td");
          row.appendChild(valueCell);
          let value = getValue(field.stats);
          if (isNaN(value)) {
            valueCell.innerText = "-";
          } else {
            valueCell.innerText = value.toFixed(digits);
          }
          valueCell.style.color = color;
        });
        if (command.fields.length === 0) {
          let valueCell = document.createElement("td");
          row.appendChild(valueCell);
          valueCell.innerText = "-";
        }
      };

      // Add all rows
      addSection("Summary");
      addValues("Count", 0, (x) => x.count);
      addValues("Min", 3, (x) => x.min);
      addValues("Max", 3, (x) => x.max);
      addSection("Center");
      addValues("Mean", 3, (x) => x.mean);
      addValues("Median", 3, (x) => x.median);
      addValues("Mode", 3, (x) => x.mode);
      addValues("Geometric Mean", 3, (x) => x.geometricMean);
      addValues("Harmonic Mean", 3, (x) => x.harmonicMean);
      addValues("Quadratic Mean", 3, (x) => x.quadraticMean);
      addSection("Spread");
      addValues("Standard Deviation", 3, (x) => x.standardDeviation);
      addValues("Median Absolute Deviation", 3, (x) => x.medianAbsoluteDeviation);
      addValues("Interquartile Range", 3, (x) => x.interquartileRange);
      addValues("Skewness", 3, (x) => x.skewness);
      addSection("Percentiles");
      addValues("1st Percentile", 3, (x) => x.percentile01);
      addValues("5th Percentile", 3, (x) => x.percentile05);
      addValues("10th Percentile", 3, (x) => x.percentile10);
      addValues("25th Percentile", 3, (x) => x.percentile25);
      addValues("50th Percentile", 3, (x) => x.percentile50);
      addValues("75th Percentile", 3, (x) => x.percentile75);
      addValues("90th Percentile", 3, (x) => x.percentile90);
      addValues("95th Percentile", 3, (x) => x.percentile95);
      addValues("99th Percentile", 3, (x) => x.percentile99);

      // Update histogram data
      this.histogram.data.labels = command.bins.map((value) => value + command.stepSize / 2);
      this.histogram.data.datasets = command.fields.map((field) => {
        const dataset: ChartDataset = {
          label: field.title.length > 20 ? "..." + field.title.slice(-20) : field.title,
          data: field.histogramCounts,
          backgroundColor: ensureThemeContrast(field.color),
          barPercentage: 1,
          categoryPercentage: 1
        };
        return dataset;
      });
      (this.histogram.options.scales!.x as LinearScaleOptions).ticks.stepSize = command.stepSize;
      (this.histogram.options.plugins!.tooltip!.callbacks as TooltipCallbacks<"bar">).title = (items) => {
        if (items.length < 1) {
          return "";
        }
        const item = items[0];
        const x = item.parsed.x;
        const min = x - command.stepSize / 2;
        const max = x + command.stepSize / 2;
        return cleanFloat(min).toString() + " to " + cleanFloat(max).toString();
      };
      this.histogram.update();
    }
  }
}

export type StatisticsRendererCommand = {
  changeCounter: number;
  bins: number[];
  stepSize: number;
  fields: {
    title: string;
    color: string;
    histogramCounts: number[];
    stats: StatisticsRendererCommand_Stats;
  }[];
};

export type StatisticsRendererCommand_Stats = {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  mode: number;
  geometricMean: number;
  harmonicMean: number;
  quadraticMean: number;
  standardDeviation: number;
  medianAbsoluteDeviation: number;
  interquartileRange: number;
  skewness: number;
  percentile01: number;
  percentile05: number;
  percentile10: number;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile90: number;
  percentile95: number;
  percentile99: number;
};
