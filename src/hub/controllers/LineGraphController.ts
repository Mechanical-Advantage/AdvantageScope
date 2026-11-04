// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { ensureThemeContrast } from "../../shared/Colors";
import LineGraphFilter from "../../shared/LineGraphFilter";
import { SelectionMode } from "../../shared/Selection";
import { SourceListState } from "../../shared/SourceListConfig";
import { clipGaps, TraceGapCache } from "../../shared/TraceGaps";
import {
  axisDisplayUnit,
  canonicalChannelPath,
  channelProfile,
  formatChannelValue
} from "../../shared/display/ChannelProfile";
import { compatibleProfiles, splitLegendName } from "../../shared/display/LineGraphStyle";
import { formatSignedSeconds, heldValueAt, sectorDeltaText } from "../../shared/laps/LapAnalysis";
import { interpolate, lapSamples } from "../../shared/laps/LapEngine";
import { getLogValueText } from "../../shared/log/LogUtil";
import { LogValueSetNumber } from "../../shared/log/LogValueSets";
import { AKIT_TIMESTAMP_KEYS, getRobotStateRanges } from "../../shared/log/RobotState";
import {
  LineGraphRendererCommand,
  LineGraphRendererCommand_Alert,
  LineGraphRendererCommand_AlertSet,
  LineGraphRendererCommand_DiscreteField,
  LineGraphRendererCommand_NumericField
} from "../../shared/renderers/LineGraphRenderer";
import { Units } from "../../shared/units";
import { clampValue, createUUID, scaleValueClamped } from "../../shared/util";
import { LAP_COLORS, lapService } from "../LapService";
import SourceList from "../SourceList";
import { LineGraphController_DiscreteConfig, LineGraphController_NumericConfig } from "./LineGraphController_Config";
import TabController from "./TabController";

type NumericCommandCacheValue = LineGraphRendererCommand_NumericField & { hasUnit: boolean };

export default class LineGraphController implements TabController {
  dispose() {
    this.leftSourceList.stop();
    this.discreteSourceList.stop();
    this.rightSourceList.stop();
  }

  UUID = createUUID();

  private periodStats = new WeakMap<object, Map<string, TraceGapCache>>();

  private RANGE_MARGIN = 0.05;
  private MIN_AXIS_RANGE = 1e-5;
  private MAX_AXIS_RANGE = 1e20;
  private MAX_VALUE = 1e20;
  private PREVIEW_FORMAT = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
    useGrouping: false
  });

  private leftSourceList: SourceList;
  private discreteSourceList: SourceList;
  private rightSourceList: SourceList;

  private leftLockedRange: [number, number] | null = null;
  private rightLockedRange: [number, number] | null = null;
  private leftUnitConversion: Units.UIUnitOptions = { autoTarget: null, preset: null };
  private rightUnitConversion: Units.UIUnitOptions = { autoTarget: null, preset: null };
  private leftFilter = LineGraphFilter.None;
  private rightFilter = LineGraphFilter.None;

  private leftNumericCommandCache: { [key: string]: NumericCommandCacheValue } = {};
  private rightNumericCommandCache: { [key: string]: NumericCommandCacheValue } = {};
  private leftUnitCache: Units.UnitConfig | null = null;
  private rightUnitCache: Units.UnitConfig | null = null;
  private showThresholds = true;
  private showRobotMode = false;
  private lapMode = "time";
  private lapSelect: HTMLSelectElement;
  private rootElement: HTMLElement;

  constructor(root: HTMLElement) {
    this.rootElement = root;
    const mode = document.createElement("select");
    this.lapSelect = mode;
    mode.className = "lap-axis-mode mv-select";
    mode.setAttribute("aria-label", "Line graph x-axis mode");
    [
      ["time", "Session time"],
      ["lapTime", "Lap time overlay"],
      ["distance", "Lap distance + ΔT"]
    ].forEach(([value, label]) => mode.add(new Option(label, value)));
    mode.onchange = () => {
      this.lapMode = mode.value;
      this.updateAxisLabels();
    };
    const controls = document.createElement("div");
    controls.className = "graph-inline-controls";
    const modeLabel = document.createElement("label");
    modeLabel.className = "lap-axis-label";
    modeLabel.append("X axis", mode);
    controls.append(modeLabel);
    const toggle = document.createElement("label");
    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "mv-checkbox";
    check.checked = this.showThresholds;
    check.onchange = () => (this.showThresholds = check.checked);
    toggle.append(check, "Health limits");
    toggle.title = "Draw health-strip warn/crit thresholds on matching axes";
    mode.title = "X axis: session time, lap time, or lap distance with ΔT";
    controls.append(toggle);
    root.append(controls);
    // Make source lists
    this.leftSourceList = new SourceList(
      root.getElementsByClassName("line-graph-left")[0] as HTMLElement,
      LineGraphController_NumericConfig,
      [() => this.rightSourceList.getState(), () => this.discreteSourceList.getState()],
      (rect) => {
        // Get auto unit info
        let source = this.leftSourceList.getState();
        let autoTarget = this.getAxisUnitAutoTarget(source, this.leftUnitConversion, true);
        let autoUnitGroup: string | "none" | "inconsistent" = "none";
        let autoUnitSelected: string | null = null;
        switch (autoTarget.status) {
          case "success":
            autoUnitGroup = Units.GROUP_BY_UNIT[autoTarget.unit];
            autoUnitSelected = this.leftUnitConversion.preset === null ? autoTarget.unit : null;
            break;

          case "inconsistent":
            autoUnitGroup = "inconsistent";
            break;
        }

        // Send message
        let sourceVisible = source.filter((item) => item.visible && window.log.getField(item.logKey) !== null);
        window.sendMainMessage("ask-edit-axis", {
          rect: rect,
          legend: "left",
          lockedRange: this.leftLockedRange,
          autoUnitGroup: autoUnitGroup,
          autoUnitSelected: autoUnitSelected,
          autoUnitDefault: sourceVisible.length === 1 ? window.log.getUnit(sourceVisible[0].logKey) : null,
          unitConversion: this.leftUnitConversion,
          filter: this.leftFilter,
          config: LineGraphController_NumericConfig
        });
      },
      (key: string, time: number) =>
        this.getPreview(key, time, this.leftNumericCommandCache, this.leftUnitCache, this.leftFilter)
    );
    this.leftSourceList.setTitle("Left Axis");

    this.rightSourceList = new SourceList(
      root.getElementsByClassName("line-graph-right")[0] as HTMLElement,
      LineGraphController_NumericConfig,
      [() => this.leftSourceList.getState(), () => this.discreteSourceList.getState()],
      (rect) => {
        // Get auto unit info
        let source = this.rightSourceList.getState();
        let autoTarget = this.getAxisUnitAutoTarget(source, this.rightUnitConversion, true);
        let autoUnitGroup: string | "none" | "inconsistent" = "none";
        let autoUnitSelected: string | null = null;
        switch (autoTarget.status) {
          case "success":
            autoUnitGroup = Units.GROUP_BY_UNIT[autoTarget.unit];
            autoUnitSelected = this.rightUnitConversion.preset === null ? autoTarget.unit : null;
            break;

          case "inconsistent":
            autoUnitGroup = "inconsistent";
            break;
        }

        // Send message
        let sourceVisible = source.filter((item) => item.visible && window.log.getField(item.logKey) !== null);
        window.sendMainMessage("ask-edit-axis", {
          rect: rect,
          legend: "right",
          lockedRange: this.rightLockedRange,
          unitConversion: this.rightUnitConversion,
          autoUnitGroup: autoUnitGroup,
          autoUnitSelected: autoUnitSelected,
          autoUnitDefault: sourceVisible.length === 1 ? window.log.getUnit(sourceVisible[0].logKey) : null,
          filter: this.rightFilter,
          config: LineGraphController_NumericConfig
        });
      },
      (key: string, time: number) =>
        this.getPreview(key, time, this.rightNumericCommandCache, this.rightUnitCache, this.rightFilter)
    );
    this.rightSourceList.setTitle("Right Axis");

    this.discreteSourceList = new SourceList(
      root.getElementsByClassName("line-graph-discrete")[0] as HTMLElement,
      LineGraphController_DiscreteConfig,
      [() => this.leftSourceList.getState(), () => this.rightSourceList.getState()],
      (rect) => {
        window.sendMainMessage("ask-edit-axis", {
          rect: rect,
          legend: "discrete",
          showRobotMode: this.showRobotMode,
          lapMode: this.lapMode,
          config: LineGraphController_DiscreteConfig
        });
      }
    );
    for (const [source, other, name] of [
      [this.leftSourceList, this.rightSourceList, "Right"],
      [this.rightSourceList, this.leftSourceList, "Left"]
    ] as const) {
      source.graphLegend = true;
      source.beforeAdd = (key) => {
        if (this.lapMode !== "time" && source === this.rightSourceList) {
          // The right axis is locked to ΔT in lap-distance mode
          const lock = document.createElement("div");
          lock.className = "graph-unit-prompt";
          lock.append("Right axis is locked to ΔT in lap modes, so this signal can't go there. ");
          const move = document.createElement("button");
          move.textContent = "Add to Left Axis instead";
          move.onclick = () => {
            other.addField(key);
            lock.remove();
          };
          const cancel = document.createElement("button");
          cancel.textContent = "Cancel";
          cancel.onclick = () => lock.remove();
          lock.append(move, cancel);
          root.querySelector(".graph-unit-prompt")?.remove();
          root.append(lock);
          return false;
        }
        const first = source.getState()[0];
        if (!first || compatibleProfiles(window.log.getChannelProfile(key), window.log.getChannelProfile(first.logKey)))
          return true;
        const prompt = document.createElement("div");
        prompt.className = "graph-unit-prompt";
        const unitOf = (k: string) => window.log.getChannelProfile(k).unit || "no unit";
        const message = document.createElement("div");
        message.className = "graph-unit-message";
        message.textContent = `${splitLegendName(key).leaf} (${unitOf(key)}) has a different unit from ${
          splitLegendName(first.logKey).leaf
        } (${unitOf(first.logKey)}) on this axis.`;
        const buttons = document.createElement("div");
        buttons.className = "graph-unit-buttons";
        prompt.append(message, buttons);
        for (const [label, target] of [
          [`Move to ${name} Axis`, other],
          ["Add anyway", source]
        ] as const) {
          const button = document.createElement("button");
          button.textContent = label;
          button.onclick = () => {
            const guard = target.beforeAdd;
            if (target === source) target.beforeAdd = undefined;
            target.addField(key);
            target.beforeAdd = guard;
            prompt.remove();
          };
          buttons.append(button);
        }
        const cancel = document.createElement("button");
        cancel.textContent = "Cancel";
        cancel.onclick = () => prompt.remove();
        buttons.append(cancel);
        prompt.addEventListener("keydown", (event) => {
          if (event.key === "Escape") prompt.remove();
        });
        root.querySelector(".graph-unit-prompt")?.remove();
        // Anchor to the zone the signal was dropped on
        (root.querySelector(source === this.leftSourceList ? ".line-graph-left" : ".line-graph-right") ?? root).append(
          prompt
        );
        (buttons.firstElementChild as HTMLElement).focus();
        return false;
      };
    }
  }

  private axisTitle(source: SourceList, unit: Units.UnitConfig | null, filter: LineGraphFilter): string {
    const fields = source.getState().filter((f) => f.visible);
    const name = fields.length === 1 ? splitLegendName(fields[0].logKey).leaf : "Signals";
    const suffix = unit ? Units.getSuffixForFilter(unit.suffix, filter) : "";
    return fields.length ? name + (suffix ? ` [${suffix}]` : "") : "";
  }

  saveState(): unknown {
    return {
      leftSources: this.leftSourceList.getState(),
      rightSources: this.rightSourceList.getState(),
      discreteSources: this.discreteSourceList.getState(),

      leftLockedRange: this.leftLockedRange,
      rightLockedRange: this.rightLockedRange,

      leftUnitConversion: this.leftUnitConversion,
      rightUnitConversion: this.rightUnitConversion,

      leftFilter: this.leftFilter,
      rightFilter: this.rightFilter,
      showRobotMode: this.showRobotMode,
      showThresholds: this.showThresholds,
      lapMode: this.lapMode
    };
  }

  restoreState(state: unknown): void {
    if (typeof state !== "object" || state === null) return;

    if ("leftLockedRange" in state) {
      this.leftLockedRange = state.leftLockedRange as [number, number] | null;
    }
    if ("rightLockedRange" in state) {
      this.rightLockedRange = state.rightLockedRange as [number, number] | null;
    }
    if ("leftUnitConversion" in state) {
      this.leftUnitConversion = state.leftUnitConversion as Units.UIUnitOptions;
    }
    if ("rightUnitConversion" in state) {
      this.rightUnitConversion = state.rightUnitConversion as Units.UIUnitOptions;
    }
    if ("leftFilter" in state) {
      this.leftFilter = state.leftFilter as LineGraphFilter;
    }
    if ("rightFilter" in state) {
      this.rightFilter = state.rightFilter as LineGraphFilter;
    }
    if ("showRobotMode" in state) {
      this.showRobotMode = state.showRobotMode as boolean;
    }
    if ("showThresholds" in state) this.showThresholds = Boolean(state.showThresholds);
    if ("lapMode" in state && ["time", "lapTime", "distance"].includes(String(state.lapMode))) {
      this.lapMode = String(state.lapMode);
      this.lapSelect.value = this.lapMode;
    }
    this.updateAxisLabels();

    if ("leftSources" in state) {
      this.leftSourceList.setState(state.leftSources as SourceListState);
    }
    if ("rightSources" in state) {
      this.rightSourceList.setState(state.rightSources as SourceListState);
    }
    if ("discreteSources" in state) {
      this.discreteSourceList.setState(state.discreteSources as SourceListState);
    }
  }

  /** Updates the axis labels based on the locked and unit conversion status. */
  private updateAxisLabels() {
    let leftLabels: string[] = [];
    if (this.leftLockedRange !== null) {
      leftLabels.push("Locked");
    }
    if (this.leftUnitConversion.preset !== null) {
      if (this.leftUnitConversion.preset.type !== null || this.leftUnitConversion.preset.factor !== 1) {
        leftLabels.push("Converted");
      } else {
        leftLabels.push("No Units");
      }
    }
    switch (this.leftFilter) {
      case LineGraphFilter.Differentiate:
        leftLabels.push("Differentiated");
        break;
      case LineGraphFilter.Integrate:
        leftLabels.push("Integrated");
        break;
    }
    if (leftLabels.length > 0) {
      this.leftSourceList.setTitle("Left Axis [" + leftLabels.join(", ") + "]");
    } else {
      this.leftSourceList.setTitle("Left Axis");
    }

    for (const item of this.rightSourceList.getState()) {
      if (this.lapMode !== "time")
        this.rightSourceList.itemStatus.set(item.logKey, { text: "Hidden in lap mode · ΔT only", error: false });
      else this.rightSourceList.itemStatus.delete(item.logKey);
    }
    let rightLabels: string[] = [];
    if (this.rightLockedRange !== null) {
      rightLabels.push("Locked");
    }
    if (this.rightUnitConversion.preset !== null) {
      if (this.rightUnitConversion.preset.type !== null || this.rightUnitConversion.preset.factor !== 1) {
        rightLabels.push("Converted");
      } else {
        rightLabels.push("No Units");
      }
    }
    switch (this.rightFilter) {
      case LineGraphFilter.Differentiate:
        rightLabels.push("Differentiated");
        break;
      case LineGraphFilter.Integrate:
        rightLabels.push("Integrated");
        break;
    }
    if (this.lapMode !== "time") {
      this.rightSourceList.setTitle("ΔT [s] · locked (separate strip)");
    } else if (rightLabels.length > 0) {
      this.rightSourceList.setTitle("Right Axis [" + rightLabels.join(", ") + "]");
    } else {
      this.rightSourceList.setTitle("Right Axis");
    }
  }

  /** Adjusts the locked range and unit conversion for an axis. */
  editAxis(
    legend: string,
    lockedRange: [number, number] | null,
    unitConversion: Units.UIUnitOptions,
    filter: LineGraphFilter
  ) {
    switch (legend) {
      case "left":
        if (lockedRange === null) {
          this.leftLockedRange = null;
        } else if (lockedRange[0] === null && lockedRange[1] === null) {
          this.leftLockedRange = this.getCommand().leftRange;
        } else {
          this.leftLockedRange = lockedRange;
        }
        this.leftUnitConversion = unitConversion;
        this.leftFilter = filter;
        break;

      case "right":
        if (lockedRange === null) {
          this.rightLockedRange = null;
        } else if (lockedRange[0] === null && lockedRange[1] === null) {
          this.rightLockedRange = this.getCommand().rightRange;
        } else {
          this.rightLockedRange = lockedRange;
        }
        this.rightUnitConversion = unitConversion;
        this.rightFilter = filter;
        break;
    }
    this.updateAxisLabels();
  }

  /** Clears the fields for an axis. */
  clearAxis(legend: string) {
    switch (legend) {
      case "left":
        this.leftSourceList.clear();
        break;
      case "right":
        this.rightSourceList.clear();
        break;
      case "discrete":
        this.discreteSourceList.clear();
        break;
    }
  }

  /** Sets the state of the robot mode visualization. */
  setRobotModeVisible(showRobotMode: boolean) {
    this.showRobotMode = showRobotMode;
    window.requestAnimationFrame(() => this.refresh());
  }

  refresh(): void {
    const active = new Set(this.getActiveFields());
    const caches = this.periodStats.get(window.log);
    if (caches)
      for (const key of caches.keys()) {
        if (!active.has(key) || window.log.getType(key) === null) caches.delete(key);
      }
    this.leftSourceList.refresh();
    this.discreteSourceList.refresh();
    this.rightSourceList.refresh();
  }

  newAssets(): void {}

  getActiveFields(): string[] {
    return [
      ...this.leftSourceList.getActiveFields(),
      ...this.discreteSourceList.getActiveFields(),
      ...this.rightSourceList.getActiveFields()
    ];
  }

  showTimeline(): boolean {
    return false;
  }

  private getPreview(
    key: string,
    time: number,
    commandCache: { [key: string]: NumericCommandCacheValue },
    unitCache: Units.UnitConfig | null,
    filter: LineGraphFilter
  ): string | null {
    if (!(key in commandCache)) return null;
    if (
      time < window.selection.getTimelineRange()[0] ||
      (time > window.selection.getTimelineRange()[1] && window.selection.getMode() !== SelectionMode.Locked)
    ) {
      return null;
    }
    // The mock's stale-test deliberately stops GPS while wheel speed keeps updating.
    // Do not present a held last-good GPS value as a current speed measurement.
    if (window.selection.getMode() === SelectionMode.Locked) {
      const freshness = window.liveStatus?.getFieldFreshness(key);
      if (freshness === "stale" || freshness === "offline") return `— (${freshness})`;
    }
    let command = commandCache[key];
    let index = command.timestamps.findLastIndex((sample) => sample <= time);
    if (index === -1) {
      return null;
    }
    const profile =
      unitCache !== null && command.hasUnit
        ? window.log.getChannelProfile(key, Units.getSuffixForFilter(unitCache.suffix, filter))
        : window.log.getChannelProfile(key);
    const value =
      command.type === "smooth" && index + 1 < command.timestamps.length
        ? interpolate(command.timestamps, command.values, time)
        : command.values[index];
    let output = formatChannelValue(value, profile);
    return output;
  }

  /** Returns the auto target type for an axis, based on a manual override or field selection. */
  private getAxisUnitAutoTarget(
    source: SourceListState,
    options: Units.UIUnitOptions,
    ignorePreset = false
  ): { status: "success"; unit: string } | { status: "none" } | { status: "inconsistent" } | { status: "manual" } {
    // Exit if using manual conversion
    if (!ignorePreset && options.preset !== null) {
      return { status: "manual" };
    }

    // Exit if no visible fields
    let sourceVisible = source.filter((item) => item.visible && window.log.getField(item.logKey) !== null);
    if (sourceVisible.length === 0) {
      return { status: "none" };
    }

    // Use specified value if valid
    if (options.autoTarget !== null && options.autoTarget in Units.GROUP_BY_UNIT) {
      let autoTargetGroup = Units.GROUP_BY_UNIT[options.autoTarget];
      if (
        sourceVisible.every((item) => {
          let itemUnit = window.log.getUnit(item.logKey);
          return (
            itemUnit !== null && itemUnit in Units.GROUP_BY_UNIT && Units.GROUP_BY_UNIT[itemUnit] === autoTargetGroup
          );
        })
      ) {
        return { status: "success", unit: options.autoTarget };
      }
    }

    // Check for first valid unit
    let firstUnit: string | null = null;
    let firstUnitGroup: string | null = null;
    let unitsConsistent = true;
    for (let i = 0; i < sourceVisible.length; i++) {
      let unit = window.log.getUnit(sourceVisible[i].logKey);
      if (unit !== null && unit in Units.GROUP_BY_UNIT) {
        if (firstUnit === null) {
          firstUnit = unit;
          firstUnitGroup = Units.GROUP_BY_UNIT[unit];
        } else if (Units.GROUP_BY_UNIT[unit] !== firstUnitGroup) {
          unitsConsistent = false;
          break;
        }
      } else {
        unitsConsistent = false;
        break;
      }
    }

    // Return result
    if (firstUnit === null) {
      return { status: "none" };
    } else if (!unitsConsistent) {
      return { status: "inconsistent" };
    } else {
      // Prefer the channel profile's display unit (e.g. °C over raw K) so the axis matches the legend
      return {
        status: "success",
        unit: axisDisplayUnit(firstUnit, window.log.getChannelProfile(sourceVisible[0].logKey))
      };
    }
  }

  /** Marks empty drop zones ("Drag a signal here") and hides the zoom/pan hint until something is plotted. */
  private updateEmptyState() {
    const zones: [string, SourceList][] = [
      [".line-graph-left", this.leftSourceList],
      [".line-graph-right", this.rightSourceList],
      [".line-graph-discrete", this.discreteSourceList]
    ];
    let empty = true;
    for (const [selector, list] of zones) {
      const locked = list === this.rightSourceList && this.lapMode !== "time";
      const zoneEmpty = list.getState().length === 0 && !locked;
      if (!zoneEmpty) empty = false;
      const zone = this.rootElement.querySelector(selector);
      zone?.classList.toggle("zone-empty", zoneEmpty);
      zone?.classList.toggle("zone-locked", locked);
    }
    document.body.classList.toggle("line-graph-empty", empty);
  }

  getCommand(): LineGraphRendererCommand {
    this.updateEmptyState();
    let leftDataRange: [number, number] = [Infinity, -Infinity];
    let rightDataRange: [number, number] = [Infinity, -Infinity];
    let leftFieldsCommand: LineGraphRendererCommand_NumericField[] = [];
    let rightFieldsCommand: LineGraphRendererCommand_NumericField[] = [];
    let discreteFieldsCommand: LineGraphRendererCommand_DiscreteField[] = [];
    const timeRange = this.lapMode === "time" ? window.selection.getTimelineRange() : window.log.getTimestampRange();

    // Add numeric fields
    this.leftNumericCommandCache = {};
    this.rightNumericCommandCache = {};
    this.leftUnitCache = null;
    this.rightUnitCache = null;
    const akitTimestampField = window.log.getFieldKeys().find((key) => AKIT_TIMESTAMP_KEYS.includes(key));
    const akitTimestamps =
      akitTimestampField === undefined
        ? undefined
        : window.log.getNumber(akitTimestampField, -Infinity, Infinity)?.timestamps;
    let addNumeric = (
      source: SourceListState,
      dataRange: [number, number],
      command: LineGraphRendererCommand_NumericField[],
      unitConversion: Units.UIUnitOptions,
      setUnits: (unit: string | null) => void,
      filter: LineGraphFilter,
      commandCache: { [key: string]: NumericCommandCacheValue }
    ) => {
      // Get unit
      let autoTargetResult = this.getAxisUnitAutoTarget(source, unitConversion);
      if (autoTargetResult.status === "success") {
        setUnits(autoTargetResult.unit);
      } else if (unitConversion.preset?.to) {
        setUnits(unitConversion.preset.to);
      }

      // Process fields
      source.forEach((fieldItem, index) => {
        let data = window.log.getNumber(
          fieldItem.logKey,
          filter === LineGraphFilter.Integrate ? -Infinity : timeRange[0],
          timeRange[1],
          undefined,
          filter === LineGraphFilter.Differentiate ? -1 : 0
        );
        if (data === undefined) return;

        // Statistics always use the whole field, independent of viewport and lap selection.
        let statsByKey = this.periodStats.get(window.log);
        if (!statsByKey) this.periodStats.set(window.log, (statsByKey = new Map()));
        let stats = statsByKey.get(fieldItem.logKey);
        if (!stats) statsByKey.set(fieldItem.logKey, (stats = new TraceGapCache()));
        const freshness = window.liveStatus?.getFieldFreshness(fieldItem.logKey);
        const gaps =
          fieldItem.type === "points"
            ? undefined
            : stats.update(
                window.log,
                fieldItem.logKey,
                Math.max(timeRange[1], window.log.getTimestampRange()[1]),
                freshness === "stale" || freshness === "offline"
              );
        let convertValue = (value: number) => value;

        // Add AdvantageKit samples
        if (akitTimestamps !== undefined) {
          // Only if its needed for rendering intermediate points, or for a filter.
          if (fieldItem.type !== "stepped" || filter !== LineGraphFilter.None) {
            let newData: LogValueSetNumber = { timestamps: [], values: [] };
            let sourceIndex = 0;
            let akitIndex = akitTimestamps.findIndex((akitTime) => akitTime >= data!.timestamps[0]);
            while (
              akitIndex < akitTimestamps.length &&
              akitTimestamps[akitIndex] <= data!.timestamps[data!.timestamps.length - 1]
            ) {
              while (
                sourceIndex < data!.timestamps.length - 1 &&
                akitTimestamps[akitIndex] >= data!.timestamps[sourceIndex + 1]
              ) {
                sourceIndex++;
              }
              newData.timestamps.push(akitTimestamps[akitIndex]);
              newData.values.push(data!.values[sourceIndex]);
              akitIndex++;
            }
            data = newData;
          }
        }

        // Apply filter
        switch (filter) {
          case LineGraphFilter.Differentiate:
            {
              let newValues: number[] = [];
              for (let i = 1; i < data.values.length; i++) {
                let prevIndex = Math.max(0, i - 1);
                let nextIndex = Math.min(data.values.length - 1, i + 1);
                newValues.push(
                  (data.values[nextIndex] - data.values[prevIndex]) /
                    (data.timestamps[nextIndex] - data.timestamps[prevIndex])
                );
              }
              data.values = newValues;
              data.timestamps.splice(0, 1); // Extra sample included in initial range
            }
            break;
          case LineGraphFilter.Integrate:
            {
              let newValues: number[] = [];
              let startIndex: number | undefined = undefined;
              let integral = 0;
              for (let i = 0; i < data.values.length; i++) {
                let prevIndex = Math.max(0, i - 1);
                if (data.timestamps[i] > timeRange[0] && startIndex === undefined) {
                  startIndex = Math.max(0, i - 1);
                }

                // Trapezoidal integration
                integral +=
                  (data.timestamps[i] - data.timestamps[prevIndex]) * (data.values[i] + data.values[prevIndex]) * 0.5;
                newValues.push(integral);
              }
              data.values = newValues.slice(startIndex);
              data.timestamps = data.timestamps.slice(startIndex);
            }
            break;
        }

        // Convert units
        let hasUnit = false;
        if (autoTargetResult.status === "success") {
          let sourceUnit = window.log.getUnit(fieldItem.logKey);
          if (
            sourceUnit !== null &&
            sourceUnit in Units.GROUP_BY_UNIT &&
            autoTargetResult.unit in Units.GROUP_BY_UNIT &&
            Units.GROUP_BY_UNIT[sourceUnit] === Units.GROUP_BY_UNIT[autoTargetResult.unit]
          ) {
            convertValue = (value) => Units.convert(value, sourceUnit, autoTargetResult.unit);
            data.values = data.values.map(convertValue);
            hasUnit = true;
          }
        } else if (unitConversion.preset !== undefined) {
          convertValue = (value) =>
            Units.convertWithPreset(
              value,
              unitConversion.preset === null ? Units.NoopUnitConversion : unitConversion.preset
            );
          data.values = data.values.map(convertValue);
          hasUnit = true;
        }

        // Clamp values
        data.values = data.values.map((value) => clampValue(value, -this.MAX_VALUE, this.MAX_VALUE));

        // Trim early point
        if (!gaps?.length && data.timestamps.length > 0 && data.timestamps[0] < timeRange[0]) {
          switch (fieldItem.type) {
            case "stepped":
              // Keep, adjust timestamp
              data.timestamps[0] = timeRange[0];
              break;
            case "smooth":
              // Interpolate to displayed value
              if (data.timestamps.length >= 2) {
                data.values[0] = scaleValueClamped(
                  timeRange[0],
                  [data.timestamps[0], data.timestamps[1]],
                  [data.values[0], data.values[1]]
                );
                data.timestamps[0] = timeRange[0];
              }
              break;
            case "points":
              // Remove, no effect on displayed range
              data.timestamps.shift();
              data.values.shift();
              break;
          }
        }

        // Trim late point
        if (!gaps?.length && data.timestamps.length > 0 && data.timestamps[data.timestamps.length - 1] > timeRange[1]) {
          switch (fieldItem.type) {
            case "stepped":
            case "points":
              // Remove, no effect on displayed range
              data.timestamps.pop();
              data.values.pop();
              break;
            case "smooth":
              // Interpolate to displayed value
              if (data.timestamps.length >= 2) {
                data.values[data.values.length - 1] = scaleValueClamped(
                  timeRange[1],
                  [data.timestamps[data.timestamps.length - 2], data.timestamps[data.timestamps.length - 1]],
                  [data.values[data.values.length - 2], data.values[data.values.length - 1]]
                );
                data.timestamps[data.timestamps.length - 1] = timeRange[1];
              }
              break;
          }
        } else if (
          !gaps?.some((gap) => gap.t1 === Infinity) &&
          fieldItem.type === "smooth" &&
          data.timestamps.length >= 1 &&
          data.timestamps[data.timestamps.length - 1] < timeRange[1]
        ) {
          // Assume constant until end of range
          data.timestamps.push(timeRange[1]);
          data.values.push(data.values[data.values.length - 1]);
        }

        // Update data range
        if (fieldItem.visible) {
          data.values.forEach((value) => {
            if (value < dataRange[0]) dataRange[0] = value;
            if (value > dataRange[1]) dataRange[1] = value;
          });
        }

        // Add field command
        let itemCommand: NumericCommandCacheValue = {
          gaps: gaps?.map((gap) => ({
            ...gap,
            v0: clampValue(convertValue(gap.v0), -this.MAX_VALUE, this.MAX_VALUE),
            v1: clampValue(convertValue(gap.v1), -this.MAX_VALUE, this.MAX_VALUE)
          })),
          timestamps: data.timestamps,
          values: data.values,
          color: ensureThemeContrast(fieldItem.options.color),
          type: fieldItem.type as "smooth" | "stepped" | "points",
          size: (fieldItem.options.size ?? "normal") as "normal" | "bold" | "verybold",
          dim:
            (this.leftSourceList.hoveredKey ?? this.rightSourceList.hoveredKey) !== null &&
            (this.leftSourceList.hoveredKey ?? this.rightSourceList.hoveredKey) !== fieldItem.logKey,
          hasUnit: hasUnit
        };
        if (fieldItem.visible) command.push(itemCommand);
        commandCache[fieldItem.logKey] = itemCommand;
      });
    };
    addNumeric(
      this.leftSourceList.getState(),
      leftDataRange,
      leftFieldsCommand,
      this.leftUnitConversion,
      (unit: string | null) => (this.leftUnitCache = unit === null ? null : Units.ALL_UNITS[unit]),
      this.leftFilter,
      this.leftNumericCommandCache
    );
    addNumeric(
      this.rightSourceList.getState(),
      rightDataRange,
      rightFieldsCommand,
      this.rightUnitConversion,
      (unit: string | null) => (this.rightUnitCache = unit === null ? null : Units.ALL_UNITS[unit]),
      this.rightFilter,
      this.rightNumericCommandCache
    );

    // Add discrete fields
    if (this.showRobotMode) {
      let ranges = getRobotStateRanges(window.log);

      // Filter out ranges outside the time range
      let relevantRanges = ranges.filter(
        (range) => range.start <= timeRange[1] && (range.end === undefined || range.end > timeRange[0])
      );

      if (relevantRanges.length > 0) {
        let timestamps: number[] = [];
        let values: string[] = [];

        relevantRanges.forEach((range) => {
          let start = Math.max(range.start, timeRange[0]);
          let value = range.mode.charAt(0).toUpperCase() + range.mode.slice(1);
          if (timestamps.length > 0 && start <= timestamps[timestamps.length - 1]) {
            // Same timestamp, later range wins
            values[values.length - 1] = value;
          } else {
            timestamps.push(start);
            values.push(value);
          }
        });

        // Add final point to cap the range if needed
        let lastEnd = relevantRanges[relevantRanges.length - 1].end;
        if (lastEnd !== undefined && lastEnd <= timeRange[1]) {
          timestamps.push(lastEnd);
          values.push(""); // Terminate visual block
        }

        let light = !window.matchMedia("(prefers-color-scheme: dark)").matches;
        let colorMap: { [key: string]: string } = {
          Disabled: light ? "#dddddd" : "#444444",
          Teleop: light ? "#5a83ff" : "#3957dd",
          Auto: light ? "#efab28" : "#c38615",
          Utility: light ? "#888888" : "#777777"
        };

        discreteFieldsCommand.push({
          timestamps: timestamps,
          values: values,
          color: colorMap["Disabled"], // fallback color
          colorMap: colorMap,
          type: "stripes",
          toggleReference: false
        });
      }
    }

    this.discreteSourceList.getState().forEach((fieldItem) => {
      if (!fieldItem.visible || fieldItem.type === "alerts") return;

      let data = window.log.getRange(fieldItem.logKey, timeRange[0], timeRange[1]);
      if (data === undefined) return;

      // Get toggle reference
      let toggleReference = window.log.getTimestamps([fieldItem.logKey]).indexOf(data.timestamps[0]) % 2 === 0;
      toggleReference = toggleReference !== window.log.getStripingReference(fieldItem.logKey);
      if (typeof data.values[0] === "boolean") toggleReference = !data.values[0];

      // Adjust early point
      if (data.timestamps.length > 0 && data.timestamps[0] < timeRange[0]) {
        data.timestamps[0] = timeRange[0];
      }

      // Trim late point
      if (data.timestamps.length > 0 && data.timestamps[data.timestamps.length - 1] > timeRange[1]) {
        data.timestamps.pop();
        data.values.pop();
      }

      // Convert to text
      let logType = window.log.getType(fieldItem.logKey);
      if (logType === null) return;
      const profile = window.log.getChannelProfile(fieldItem.logKey);
      data.values = data.values.map((value) =>
        profile.enumLabels ? formatChannelValue(value, profile) : getLogValueText(value, logType!)
      );

      // Add field command
      discreteFieldsCommand.push({
        timestamps: data.timestamps,
        values: data.values,
        color: ensureThemeContrast(fieldItem.options.color),
        type: fieldItem.type as "stripes" | "graph",
        toggleReference: toggleReference
      });
    });

    // Process alerts
    let alerts: LineGraphRendererCommand_AlertSet = [];
    (["error", "warning", "info"] as const).forEach((alertType) => {
      this.discreteSourceList.getState().forEach((fieldItem) => {
        if (!fieldItem.visible || fieldItem.type !== "alerts") return;

        let valueSet = window.log.getStringArray(fieldItem.logKey + "/" + alertType + "s", -Infinity, Infinity);
        if (valueSet === undefined) return;

        let allAlerts: LineGraphRendererCommand_Alert[] = [];
        for (let i = 0; i < valueSet.values.length; i++) {
          // Add new alerts
          new Set(valueSet.values[i]).forEach((alertText) => {
            let currentCount = valueSet!.values[i].filter((x) => x === alertText).length;
            let activeCount = allAlerts.filter((x) => x.text === alertText && !isFinite(x.range[1])).length;
            if (currentCount > activeCount) {
              for (let count = 0; count < currentCount - activeCount; count++) {
                allAlerts.push({
                  type: alertType,
                  text: alertText,
                  range: [valueSet!.timestamps[i], Infinity]
                });
              }
            }
          });

          // Clear inactive alerts
          new Set(allAlerts.map((x) => x.text)).forEach((alertText) => {
            let currentCount = valueSet!.values[i].filter((x) => x === alertText).length;
            let activeCount = allAlerts.filter((x) => x.text === alertText && !isFinite(x.range[1])).length;
            if (activeCount > currentCount) {
              for (let count = 0; count < activeCount - currentCount; count++) {
                allAlerts.find((alert) => alert.text === alertText && !isFinite(alert.range[1]))!.range[1] =
                  valueSet!.timestamps[i];
              }
            }
          });
        }

        // Clear all remaining active alerts
        allAlerts.forEach((alert) => {
          if (alert.range[1] === Infinity) {
            alert.range[1] = timeRange[1];
          }
        });

        // Add alerts to main set
        allAlerts.forEach((alert) => {
          let row = -1;
          do {
            row++;
            while (alerts.length <= row) {
              alerts.push([]);
            }
          } while (!alerts[row].every((other) => other.range[1] <= alert.range[0] || other.range[0] >= alert.range[1]));
          alerts[row].push(alert);
        });
      });
    });

    // Remove offscreen alerts
    alerts = alerts.map((row) =>
      row.filter(
        (alert) =>
          !(alert.range[0] > timeRange[1] && alert.range[1] > timeRange[1]) &&
          !(alert.range[0] < timeRange[0] && alert.range[1] < timeRange[0])
      )
    );
    alerts = alerts.filter((row) => row.length > 0);

    // Get numeric ranges
    let calcRange = (dataRange: [number, number], lockedRange: [number, number] | null): [number, number] => {
      let range: [number, number];
      if (lockedRange === null) {
        let margin = (dataRange[1] - dataRange[0]) * this.RANGE_MARGIN;
        range = [dataRange[0] - margin, dataRange[1] + margin];
      } else {
        range = lockedRange;
      }
      if (!isFinite(range[0])) range[0] = -1;
      if (!isFinite(range[1])) range[1] = 1;
      return this.limitAxisRange(range);
    };
    let leftRange = calcRange(leftDataRange, this.leftLockedRange);
    let rightRange = calcRange(rightDataRange, this.rightLockedRange);
    let showLeftAxis = this.leftLockedRange !== null || leftFieldsCommand.length > 0;
    let showRightAxis = this.rightLockedRange !== null || rightFieldsCommand.length > 0;
    if (!showLeftAxis && !showRightAxis) {
      showLeftAxis = true;
    }

    // Return command
    leftFieldsCommand.reverse();
    rightFieldsCommand.reverse();
    const result: LineGraphRendererCommand = {
      leftTitle: this.axisTitle(this.leftSourceList, this.leftUnitCache, this.leftFilter),
      rightTitle: this.axisTitle(this.rightSourceList, this.rightUnitCache, this.rightFilter),
      timeRange: timeRange,
      displayOffset: window.log.getTimestampDisplayOffset(),
      selectionMode: window.selection.getMode(),
      selectedTime: window.selection.getSelectedTime(),
      hoveredTime: window.selection.getHoveredTime(),
      grabZoomRange: window.selection.getGrabZoomRange(),

      leftRange: leftRange,
      rightRange: rightRange,
      showLeftAxis: showLeftAxis,
      showRightAxis: showRightAxis,
      leftUnits: this.leftUnitCache,
      rightUnits: this.rightUnitCache,
      leftFilter: this.leftFilter,
      rightFilter: this.rightFilter,
      priorityAxis:
        (this.leftLockedRange === null && this.rightLockedRange !== null) ||
        (leftFieldsCommand.length === 0 && rightFieldsCommand.length > 0)
          ? "right"
          : "left",
      leftFields: leftFieldsCommand,
      rightFields: rightFieldsCommand,
      discreteFields: discreteFieldsCommand,
      alerts: alerts
    };
    result.thresholds = [];
    if (this.showThresholds) {
      for (const [axis, source, units, filter] of [
        ["left", this.leftSourceList, this.leftUnitCache, this.leftFilter],
        ["right", this.rightSourceList, this.rightUnitCache, this.rightFilter]
      ] as const) {
        if (filter !== LineGraphFilter.None) continue;
        for (const tile of window.healthStrip?.state.tiles ?? []) {
          if (
            tile.fault ||
            !source
              .getState()
              .some((f) => f.visible && canonicalChannelPath(f.logKey) === canonicalChannelPath(tile.path))
          )
            continue;
          const base = window.log.getChannelProfile(tile.path);
          const profile = tile.profile ? channelProfile({ name: tile.path, unit: base.rawUnit }, tile.profile) : base;
          const target = units ? Object.keys(Units.ALL_UNITS).find((u) => Units.ALL_UNITS[u] === units) : null;
          for (const [limit, critical] of [
            [tile.warn, false],
            [tile.critical, true]
          ] as const) {
            if (limit === undefined || !Number.isFinite(limit)) continue;
            if (profile.to && target && Units.GROUP_BY_UNIT[profile.to] !== Units.GROUP_BY_UNIT[target]) continue;
            const value = profile.to && target ? Units.convert(limit, profile.to, target) : limit;
            result.thresholds.push({ axis, value, label: `${tile.label} ${critical ? "CRIT" : "WARN"}`, critical });
          }
        }
      }
      // Auto-scaled axes stretch to keep the warning line in view (untick "Health limits" for a tight fit)
      for (const [axis, dataRange, locked] of [
        ["left", leftDataRange, this.leftLockedRange],
        ["right", rightDataRange, this.rightLockedRange]
      ] as const) {
        const warn = result.thresholds.filter((t) => t.axis === axis && !t.critical).map((t) => t.value);
        if (locked !== null || warn.length === 0 || !isFinite(dataRange[0])) continue;
        const range = calcRange([Math.min(dataRange[0], ...warn), Math.max(dataRange[1], ...warn)], null);
        if (axis === "left") result.leftRange = range;
        else result.rightRange = range;
      }
    }
    const hasNumericSamples = [...result.leftFields, ...result.rightFields].some(
      (f) => f.timestamps.length && f.values.some(Number.isFinite)
    );
    const selectedKeys = [...this.leftSourceList.getState(), ...this.rightSourceList.getState()]
      .filter((source) => source.visible)
      .map((source) => source.logKey);
    const loadingFields = window.getLoadingFields();
    const stillLoading = selectedKeys.some((key) => loadingFields.has(key));
    if (selectedKeys.length && !hasNumericSamples && !stillLoading && !result.discreteFields.length) {
      result.message = "The selected fields have no numeric samples in this log.";
    }
    if (this.lapMode !== "time") {
      result.thresholds = [];
      lapService.update();
      const reference = lapService.result.laps.find((l) => l.index === lapService.reference);
      const laps = lapService.result.laps.filter(
        (l) => l.valid && (lapService.overlays.includes(l.index) || l.index === lapService.reference)
      );
      if (!laps.length)
        result.message =
          "No laps found from the lap counter, beacon or GPS. Add manual splits under Lap setup in the Laps tab, or set the X axis to Session time.";
      const distance = this.lapMode === "distance";
      if (laps.length && distance && !laps.some((l) => l.grid.length && l.distance > 0))
        result.message =
          "Lap distance needs valid GPS or a speed with known units. Check Lap setup in the Laps tab, or set the X axis to Lap time or Session time.";
      // One hue per lap. Values stay as the raw samples; only the x position is mapped onto the lap.
      const convert = (fields: LineGraphRendererCommand_NumericField[]) =>
        fields.flatMap((field) =>
          laps.map((lap, i) => ({
            ...field,
            color: LAP_COLORS[i % LAP_COLORS.length],
            ...lapSamples(field.timestamps, field.values, lap, distance),
            gaps:
              field.gaps &&
              clipGaps(field.gaps, lap.start, lap.end, (t) =>
                distance
                  ? interpolate(
                      lap.grid.map((p) => p.time),
                      lap.grid.map((p) => p.distance),
                      t
                    )
                  : t
              )
          }))
        );
      result.leftFields = convert(result.leftFields);
      result.rightFields = convert(result.rightFields);
      {
        // The right axis is locked to ΔT, which is drawn in its own strip under the overlay
        result.rightFields = [];
        result.showRightAxis = false;
        result.rightTitle = "";
        result.rightUnits = null;
        if (reference) {
          const stripFields = laps
            .filter((lap) => lap.index !== reference.index)
            .map((lap) => ({
              timestamps: lap.grid.map((p) => (distance ? p.distance : p.time)),
              values: lap.grid.map((p) => lapService.delta(lap.index, p.distance)),
              color: LAP_COLORS[laps.indexOf(lap) % LAP_COLORS.length],
              type: "smooth" as const,
              size: "normal" as const
            }));
          const vs = stripFields.flatMap((f) => f.values).filter(Number.isFinite);
          const low = vs.reduce((a, b) => Math.min(a, b), 0),
            high = vs.reduce((a, b) => Math.max(a, b), 0);
          const pad = Math.max(0.05, (high - low) * 0.08);
          result.deltaStrip = {
            fields: stripFields,
            range: [low - pad, high + pad],
            title: `ΔT vs Lap ${reference.index} [s], + = slower`,
            referenceLabel: `Lap ${reference.index} (ref)`
          };
        }
      }
      const end = Math.max(1, ...laps.map((l) => (distance ? l.distance : l.end - l.start)));
      result.lapMode = this.lapMode;
      result.timeRange = [0, end];
      result.displayOffset = 0;
      result.xUnit = distance ? "m" : "s";
      const split = (lap: (typeof laps)[number]) =>
        reference && lap.index !== reference.index
          ? sectorDeltaText(lap.sectors, reference.sectors)
          : lap.sectors.map((t, j) => `S${j + 1} ${Number.isFinite(t) ? t.toFixed(2) + " s" : "—"}`).join(" · ");
      result.lapLabels = laps.map((lap, i) => ({
        text: `Lap ${lap.index}${lap.index === lapService.reference ? " (ref)" : ""}  ${(lap.end - lap.start).toFixed(
          2
        )} s  ${split(lap)}`,
        color: LAP_COLORS[i % LAP_COLORS.length]
      }));
      const sectorRef = reference ?? laps[0];
      if (sectorRef) {
        let cumulative = 0;
        result.sectorMarks = sectorRef.sectors.slice(0, -1).map((t, j) => {
          cumulative += t;
          return {
            x: distance
              ? interpolate(
                  sectorRef.grid.map((p) => p.time),
                  sectorRef.grid.map((p) => p.distance),
                  cumulative
                )
              : cumulative,
            label: `S${j + 2}`
          };
        });
      }
      const cursorLap =
        lapService.result.laps.find(
          (l) => result.selectedTime !== null && result.selectedTime >= l.start && result.selectedTime <= l.end
        ) ?? reference;
      const transform = (t: number | null) =>
        t === null || !cursorLap
          ? null
          : distance
          ? interpolate(
              cursorLap.grid.map((p) => p.time),
              cursorLap.grid.map((p) => p.distance),
              t - cursorLap.start
            )
          : t - cursorLap.start;
      result.selectedTime = transform(result.selectedTime);
      result.hoveredTime = transform(result.hoveredTime);
      // Each lap's own value (and ΔT) at the cursor, so overlaid laps are not collapsed into one number
      const cursorX = result.hoveredTime ?? result.selectedTime;
      if (cursorX !== null) {
        const perLap = laps.map(() => [] as string[]);
        const lapFields = result.leftFields;
        lapFields.forEach((field, k) => {
          const lapIndex = k % laps.length;
          const v = heldValueAt(field.timestamps, field.values, cursorX);
          if (Number.isFinite(v)) perLap[lapIndex].push(Number(v.toPrecision(4)).toString());
        });
        result.lapValues = perLap.map((v) => v.join(" / "));
        if (result.deltaStrip) {
          result.deltaStrip.readout = result.deltaStrip.fields.map((f) => ({
            text: formatSignedSeconds(interpolate(f.timestamps, f.values, cursorX)),
            color: f.color
          }));
        }
      }
      result.grabZoomRange = null;
      const seekLap = lapService.result.laps.find((l) => l.index === lapService.selected) ?? reference;
      if (seekLap)
        result.lapTimeline = {
          x: seekLap.grid.map((p) => (distance ? p.distance : p.time)),
          time: seekLap.grid.map((p) => seekLap.start + p.time)
        };
      result.discreteFields = [];
      result.alerts = [];
    }
    return result;
  }

  /** Adjusts the range to fit the extreme limits. */
  private limitAxisRange(range: [number, number]): [number, number] {
    let adjustedRange = [range[0], range[1]] as [number, number];
    if (adjustedRange[0] > this.MAX_VALUE) {
      adjustedRange[0] = this.MAX_VALUE;
    }
    if (adjustedRange[1] > this.MAX_VALUE) {
      adjustedRange[1] = this.MAX_VALUE;
    }
    if (adjustedRange[0] < -this.MAX_VALUE) {
      adjustedRange[0] = -this.MAX_VALUE;
    }
    if (adjustedRange[1] < -this.MAX_VALUE) {
      adjustedRange[1] = -this.MAX_VALUE;
    }
    if (adjustedRange[0] === adjustedRange[1]) {
      if (Math.abs(adjustedRange[0]) >= this.MAX_VALUE) {
        if (adjustedRange[0] > 0) {
          adjustedRange[0] *= 0.8;
        } else {
          adjustedRange[1] *= 0.8;
        }
      } else {
        adjustedRange[0]--;
        adjustedRange[1]++;
      }
    }
    if (adjustedRange[1] - adjustedRange[0] > this.MAX_AXIS_RANGE) {
      if (adjustedRange[0] + this.MAX_AXIS_RANGE < this.MAX_VALUE) {
        adjustedRange[1] = adjustedRange[0] + this.MAX_AXIS_RANGE;
      } else {
        adjustedRange[0] = adjustedRange[1] - this.MAX_AXIS_RANGE;
      }
    }
    if (adjustedRange[1] - adjustedRange[0] < this.MIN_AXIS_RANGE) {
      adjustedRange[1] = adjustedRange[0] + this.MIN_AXIS_RANGE;
    }
    return adjustedRange;
  }
}
