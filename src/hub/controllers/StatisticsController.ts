import * as stats from "simple-statistics";
import { SourceListItemState, SourceListState } from "../../shared/SourceListConfig";
import { AKIT_TIMESTAMP_KEYS, getRobotStateRanges } from "../../shared/log/LogUtil";
import { StatisticsRendererCommand, StatisticsRendererCommand_Stats } from "../../shared/renderers/StatisticsRenderer";
import { arraysEqual, cleanFloat, createUUID } from "../../shared/util";
import SourceList from "../SourceList";
import StatisticsController_Config from "./StatisticsController_Config";
import TabController from "./TabController";

export default class StatisticsController implements TabController {
  UUID = createUUID();

  private UPDATE_PERIOD_MS = 100;
  private DEFAULT_DT = 0.02;
  private MAX_BINS = 1000;

  private TIME_RANGE: HTMLSelectElement;
  private RANGE_MIN: HTMLInputElement;
  private RANGE_MAX: HTMLInputElement;
  private STEP_SIZE: HTMLInputElement;

  private sourceList: SourceList;
  private command: StatisticsRendererCommand = {
    changeCounter: 0,
    bins: [],
    stepSize: 1,
    fields: []
  };
  private shouldUpdate = true;
  private lastSourceStr = "";
  private lastTimelineRange: [number, number] = [0, 0];
  private lastUpdateTime = 0;

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(root.firstElementChild as HTMLElement, StatisticsController_Config, []);
    this.TIME_RANGE = root.getElementsByClassName("time-range")[0] as HTMLSelectElement;
    this.RANGE_MIN = root.getElementsByClassName("range-min")[0] as HTMLInputElement;
    this.RANGE_MAX = root.getElementsByClassName("range-max")[0] as HTMLInputElement;
    this.STEP_SIZE = root.getElementsByClassName("step-size")[0] as HTMLInputElement;

    // Schedule updates when inputs change
    [this.TIME_RANGE, this.RANGE_MIN, this.RANGE_MAX, this.STEP_SIZE].forEach((input) =>
      input.addEventListener("change", () => (this.shouldUpdate = true))
    );
    this.STEP_SIZE.addEventListener("change", () => {
      this.updateHistogramInputs();
    });

    // Set initial values for histogram inputs
    this.RANGE_MIN.value = "0";
    this.RANGE_MAX.value = "10";
    this.STEP_SIZE.value = "1";
    this.updateHistogramInputs();
  }

  /** Updates the step size for each histogram input. */
  private updateHistogramInputs() {
    if (Number(this.STEP_SIZE.value) <= 0) {
      this.STEP_SIZE.value = cleanFloat(Number(this.STEP_SIZE.step)).toString();
    }
    let range = Math.abs(Number(this.RANGE_MAX.value) - Number(this.RANGE_MIN.value));
    if (range / Number(this.STEP_SIZE.value) > this.MAX_BINS) {
      this.STEP_SIZE.value = cleanFloat(Math.ceil(range / this.MAX_BINS)).toString();
    }
    let step = Math.pow(10, Math.floor(Math.log10(Number(this.STEP_SIZE.value))));
    this.STEP_SIZE.step = step.toString();

    let minMaxStep = Math.pow(10, Math.ceil(Math.log10(Number(this.STEP_SIZE.value))));
    this.RANGE_MIN.step = minMaxStep.toString();
    this.RANGE_MAX.step = minMaxStep.toString();
  }

  saveState(): unknown {
    return {
      sources: this.sourceList.getState(),
      timeRange: this.TIME_RANGE.value,
      rangeMin: Number(this.RANGE_MIN.value),
      rangeMax: Number(this.RANGE_MAX.value),
      stepSize: Number(this.STEP_SIZE.value)
    };
  }

  restoreState(state: unknown): void {
    if (typeof state !== "object" || state === null) return;

    if ("sources" in state) {
      this.sourceList.setState(state.sources as SourceListState);
    }
    if ("timeRange" in state && typeof state.timeRange === "string") {
      this.TIME_RANGE.value = state.timeRange;
    }
    if ("rangeMin" in state && typeof state.rangeMin === "number") {
      this.RANGE_MIN.value = state.rangeMin.toString();
    }
    if ("rangeMax" in state && typeof state.rangeMax === "number") {
      this.RANGE_MAX.value = state.rangeMax.toString();
    }
    if ("stepSize" in state && typeof state.stepSize === "number") {
      this.STEP_SIZE.value = state.stepSize.toString();
    }
    this.updateHistogramInputs();
  }

  refresh(): void {
    this.sourceList.refresh();
    this.shouldUpdate = true;
  }

  newAssets(): void {}

  getActiveFields(): string[] {
    return this.sourceList.getActiveFields();
  }

  showTimeline(): boolean {
    return this.TIME_RANGE.value === "visible";
  }

  getCommand(): StatisticsRendererCommand {
    // Update time range options
    let isLive = window.selection.getCurrentLiveTime() !== null;
    Array.from(this.TIME_RANGE.children).forEach((option) => {
      if (option.classList.contains("live-only")) {
        (option as HTMLOptionElement).disabled = !isLive;
      }
    });

    // Check if command should be updated
    let sourcesStr = JSON.stringify(this.sourceList.getState());
    let currentTime = new Date().getTime();
    let isLiveMode = window.selection.getCurrentLiveTime() !== null && this.TIME_RANGE.value.startsWith("live");
    let visibleChanged =
      this.TIME_RANGE.value === "visible" && !arraysEqual(window.selection.getTimelineRange(), this.lastTimelineRange);
    if (
      (this.shouldUpdate || sourcesStr !== this.lastSourceStr || isLiveMode || visibleChanged) &&
      currentTime - this.lastUpdateTime > this.UPDATE_PERIOD_MS
    ) {
      this.shouldUpdate = false;
      this.lastSourceStr = sourcesStr;
      this.lastTimelineRange = [...window.selection.getTimelineRange()];
      this.lastUpdateTime = currentTime;

      // Get bins
      this.updateHistogramInputs;
      let min = Number(this.RANGE_MIN.value);
      let max = Number(this.RANGE_MAX.value);
      let step = Number(this.STEP_SIZE.value);
      if (step <= 0) step = 1;
      let bins: number[] = [];
      for (let i = min; i < max && bins.length < this.MAX_BINS; i += step) {
        bins.push(i);
      }

      // Get sample timestamps
      let stateRanges = getRobotStateRanges(window.log);
      let isValid = (timestamp: number): boolean => {
        let liveTime = window.selection.getCurrentLiveTime();
        if (liveTime === null) liveTime = window.log.getTimestampRange()[1];
        let timelineRange = window.selection.getTimelineRange();
        switch (this.TIME_RANGE.value) {
          case "full":
            return true;
          case "visible":
            return timestamp >= timelineRange[0] && timestamp <= timelineRange[1];
          case "live-30":
            return timestamp >= liveTime - 30;
          case "live-10":
            return timestamp >= liveTime - 10;
        }

        if (stateRanges === null) return false;
        let currentRange = stateRanges.findLast((range) => range.start <= timestamp);
        switch (this.TIME_RANGE.value) {
          case "enabled":
            return currentRange?.mode !== "disabled";
          case "auto":
            return currentRange?.mode === "auto";
          case "teleop":
            return currentRange?.mode === "teleop";
        }
        return false;
      };

      const akitTimestampKey = window.log.getFieldKeys().find((key) => AKIT_TIMESTAMP_KEYS.includes(key));
      let sampleTimes: number[] = [];
      if (akitTimestampKey !== undefined) {
        // Use synced AdvantageKit timestamps :)
        const akitTimestamps = window.log.getNumber(akitTimestampKey, -Infinity, Infinity);
        if (akitTimestamps !== undefined) sampleTimes = akitTimestamps.timestamps.filter(isValid);
      } else {
        // No synced timestamps, use fixed period :(
        for (
          let sampleTime = window.log.getTimestampRange()[0];
          sampleTime < window.log.getTimestampRange()[1];
          sampleTime += this.DEFAULT_DT
        ) {
          if (isValid(sampleTime)) {
            sampleTimes.push(sampleTime);
          }
        }
      }

      // Get fields
      let fields: StatisticsRendererCommand["fields"] = [];
      let sources = this.sourceList.getState(true);
      for (let i = 0; i < sources.length; i++) {
        let source = sources[i];
        let typeConfig = StatisticsController_Config.types.find((typeConfig) => typeConfig.key === source.type);
        if (typeConfig?.childOf !== undefined) continue; // This is a child, don't render

        // Find children
        let children: SourceListItemState[] = [];
        while (
          sources.length > i + 1 &&
          StatisticsController_Config.types.find((typeConfig) => typeConfig.key === sources[i + 1].type)?.childOf !==
            undefined
        ) {
          i++;
          children.push(sources[i]);
        }

        // Add field from source
        let addField = (source: SourceListItemState, refSource?: SourceListItemState) => {
          let data = window.log.getNumber(source.logKey, -Infinity, Infinity);
          let refData =
            refSource === undefined ? undefined : window.log.getNumber(refSource.logKey, -Infinity, Infinity);
          if (data === null) return;

          // Get samples
          let index = 0;
          let samples: number[] = sampleTimes.map((sampleTime) => {
            while (index < data!.timestamps.length && data!.timestamps[index + 1] < sampleTime) {
              index++;
            }
            return data!.values[index];
          });
          index = 0;
          let refSamples: number[] | undefined =
            refData === undefined
              ? undefined
              : sampleTimes.map((sampleTime) => {
                  while (index < refData!.timestamps.length && refData!.timestamps[index + 1] < sampleTime) {
                    index++;
                  }
                  return refData!.values[index];
                });

          // Apply reference
          if (refSamples !== undefined) {
            switch (source.type) {
              case "relativeError":
                samples = samples.map((x, index) => x - refSamples![index]);
                break;
              case "absoluteError":
                samples = samples.map((x, index) => Math.abs(x - refSamples![index]));
                break;
            }
          }

          // Sort samples (required for some statistic calculations)
          samples.sort();

          // Get histogram counts
          let histogramCounts: number[] = bins.map(() => 0);
          samples.forEach((value) => {
            if (value !== null) {
              let binIndex = Math.floor((value - min) / step);
              if (binIndex >= 0 && binIndex < bins.length) {
                histogramCounts[binIndex]++;
              }
            }
          });

          // Get statistics
          let samplesNonNegative = samples.filter((x) => x >= 0);
          let samplesPositive = samples.filter((x) => x > 0);
          let statistics: StatisticsRendererCommand_Stats = {
            count: samples.length,
            min: samples.length === 0 ? NaN : stats.minSorted(samples),
            max: samples.length === 0 ? NaN : stats.maxSorted(samples),
            mean: samples.length === 0 ? NaN : stats.mean(samples),
            median: samples.length === 0 ? NaN : stats.medianSorted(samples),
            mode: samples.length === 0 ? NaN : stats.modeSorted(samples),
            geometricMean: samplesNonNegative.length === 0 ? NaN : logAverage(samplesNonNegative),
            harmonicMean: samplesPositive.length === 0 ? NaN : stats.harmonicMean(samplesPositive),
            quadraticMean: samples.length === 0 ? NaN : stats.rootMeanSquare(samples),
            standardDeviation: samples.length < 2 ? NaN : stats.sampleStandardDeviation(samples),
            medianAbsoluteDeviation: samples.length === 0 ? NaN : stats.medianAbsoluteDeviation(samples),
            interquartileRange: samples.length === 0 ? NaN : stats.interquartileRange(samples),
            skewness: samples.length < 3 ? NaN : stats.sampleSkewness(samples),
            percentile01: samples.length === 0 ? NaN : stats.quantileSorted(samples, 0.01),
            percentile05: samples.length === 0 ? NaN : stats.quantileSorted(samples, 0.05),
            percentile10: samples.length === 0 ? NaN : stats.quantileSorted(samples, 0.1),
            percentile25: samples.length === 0 ? NaN : stats.quantileSorted(samples, 0.25),
            percentile50: samples.length === 0 ? NaN : stats.quantileSorted(samples, 0.5),
            percentile75: samples.length === 0 ? NaN : stats.quantileSorted(samples, 0.75),
            percentile90: samples.length === 0 ? NaN : stats.quantileSorted(samples, 0.9),
            percentile95: samples.length === 0 ? NaN : stats.quantileSorted(samples, 0.95),
            percentile99: samples.length === 0 ? NaN : stats.quantileSorted(samples, 0.99)
          };

          // Add field
          fields.push({
            title: source.logKey,
            color: source.options.color,
            histogramCounts: histogramCounts,
            stats: statistics
          });
        };

        // Add fields based on type
        if (source.type === "independent") {
          addField(source);
        } else {
          children.forEach((child) => {
            addField(child, source);
          });
        }
      }

      // Update command
      this.command = {
        changeCounter: this.command.changeCounter + 1,
        bins: bins,
        stepSize: step,
        fields: fields
      };
    }

    return this.command;
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
function logAverage(x: number[]): number {
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
