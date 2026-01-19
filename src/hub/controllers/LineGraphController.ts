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
import { AKIT_TIMESTAMP_KEYS, getEnabledKey, getLogValueText } from "../../shared/log/LogUtil";
import { LogValueSetNumber } from "../../shared/log/LogValueSets";
import {
  LineGraphRendererCommand,
  LineGraphRendererCommand_Alert,
  LineGraphRendererCommand_AlertSet,
  LineGraphRendererCommand_DiscreteField,
  LineGraphRendererCommand_NumericField
} from "../../shared/renderers/LineGraphRenderer";
import { Units } from "../../shared/units";
import { clampValue, createUUID, scaleValueClamped } from "../../shared/util";
import SourceList from "../SourceList";
import { LineGraphController_DiscreteConfig, LineGraphController_NumericConfig } from "./LineGraphController_Config";
import TabController from "./TabController";

type NumericCommandCacheValue = LineGraphRendererCommand_NumericField & { hasUnit: boolean };

export default class LineGraphController implements TabController {
  UUID = createUUID();

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

  constructor(root: HTMLElement) {
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
          config: LineGraphController_DiscreteConfig
        });
      }
    );
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
      rightFilter: this.rightFilter
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
    if (rightLabels.length > 0) {
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

  /** Adds the enabled field to the discrete axis. */
  addDiscreteEnabled() {
    let enabledKey = getEnabledKey(window.log);
    if (enabledKey !== undefined) {
      this.discreteSourceList.addField(enabledKey);
    } else {
      window.sendMainMessage("error", {
        title: "No enabled state",
        content:
          window.log.getFieldCount() === 0
            ? "Please open a log file or connect to a live source, then try again."
            : "Please open a different log file or a live source, then try again."
      });
    }
  }

  refresh(): void {
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
    let command = commandCache[key];
    let index = command.timestamps.findLastIndex((sample) => sample <= time);
    if (index === -1) {
      return null;
    }
    let output = this.PREVIEW_FORMAT.format(command.values[index]);
    if (unitCache !== null && command.hasUnit) {
      let suffix = Units.getSuffixForFilter(unitCache.suffix, filter);
      output += suffix.length > 1 ? " " : "";
      output += suffix;
      if (filter === LineGraphFilter.None && unitCache.pluralizeSuffix && command.values[index] !== 1) output += "s";
    }
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
    if (options.autoTarget !== null) {
      let autoTargetGroup = Units.GROUP_BY_UNIT[options.autoTarget];
      if (
        sourceVisible.every((item) => {
          let itemUnit = window.log.getUnit(item.logKey);
          return itemUnit !== null && Units.GROUP_BY_UNIT[itemUnit] === autoTargetGroup;
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
      if (unit !== null) {
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
      return { status: "success", unit: firstUnit };
    }
  }

  getCommand(): LineGraphRendererCommand {
    let leftDataRange: [number, number] = [Infinity, -Infinity];
    let rightDataRange: [number, number] = [Infinity, -Infinity];
    let leftFieldsCommand: LineGraphRendererCommand_NumericField[] = [];
    let rightFieldsCommand: LineGraphRendererCommand_NumericField[] = [];
    let discreteFieldsCommand: LineGraphRendererCommand_DiscreteField[] = [];
    const timeRange = window.selection.getTimelineRange();

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
      source.forEach((fieldItem) => {
        let data = window.log.getNumber(
          fieldItem.logKey,
          filter === LineGraphFilter.Integrate ? -Infinity : timeRange[0],
          timeRange[1],
          undefined,
          filter === LineGraphFilter.Differentiate ? -1 : 0
        );
        if (data === undefined) return;

        // Add AdvantageKit samples
        if (akitTimestamps !== undefined) {
          switch (fieldItem.type) {
            case "stepped":
              // Extra samples wouldn't affect rendering
              break;
            case "smooth":
            case "points":
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
              break;
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
          if (sourceUnit !== null && Units.GROUP_BY_UNIT[sourceUnit] === Units.GROUP_BY_UNIT[autoTargetResult.unit]) {
            data.values = data.values.map((value) => Units.convert(value, sourceUnit, autoTargetResult.unit));
            hasUnit = true;
          }
        } else if (unitConversion.preset !== undefined) {
          data.values = data.values.map((value) =>
            Units.convertWithPreset(
              value,
              unitConversion.preset === null ? Units.NoopUnitConversion : unitConversion.preset
            )
          );
          hasUnit = true;
        }

        // Clamp values
        data.values = data.values.map((value) => clampValue(value, -this.MAX_VALUE, this.MAX_VALUE));

        // Trim early point
        if (data.timestamps.length > 0 && data.timestamps[0] < timeRange[0]) {
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
        if (data.timestamps.length > 0 && data.timestamps[data.timestamps.length - 1] > timeRange[1]) {
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
          timestamps: data.timestamps,
          values: data.values,
          color: ensureThemeContrast(fieldItem.options.color),
          type: fieldItem.type as "smooth" | "stepped" | "points",
          size: fieldItem.options.size as "normal" | "bold" | "verybold",
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
      data.values = data.values.map((value) => getLogValueText(value, logType!));

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
    return {
      timeRange: timeRange,
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
