import { GraphColors } from "../../shared/Colors";
import { SourceListConfig, SourceListItemState } from "../../shared/SourceListConfig";
import { getEnabledKey } from "../../shared/log/LogUtil";
import { UnitConversionPreset } from "../../shared/units";
import SourceList from "../SourceList";
import TabController from "./TabController";

export default class LineGraphController implements TabController {
  private leftSourceList: SourceList;
  private discreteSourceList: SourceList;
  private rightSourceList: SourceList;

  private leftLockedRange: [number, number] | null = null;
  private rightLockedRange: [number, number] | null = null;
  private leftUnitConversion: UnitConversionPreset = {
    type: null,
    factor: 1
  };
  private rightUnitConversion: UnitConversionPreset = {
    type: null,
    factor: 1
  };

  constructor(root: HTMLElement) {
    // Make source lists
    this.leftSourceList = new SourceList(
      root.getElementsByClassName("line-graph-left")[0] as HTMLElement,
      NumericAxisConfig
    );
    this.leftSourceList.setTitle("Left Axis");

    this.rightSourceList = new SourceList(
      root.getElementsByClassName("line-graph-right")[0] as HTMLElement,
      NumericAxisConfig
    );
    this.rightSourceList.setTitle("Right Axis");

    this.discreteSourceList = new SourceList(
      root.getElementsByClassName("line-graph-discrete")[0] as HTMLElement,
      DiscreteFieldsConfig
    );

    // Edit axis handling
    let leftExitAxisButton = root.getElementsByClassName("line-graph-edit-left")[0];
    leftExitAxisButton.addEventListener("click", () => {
      let rect = leftExitAxisButton.getBoundingClientRect();
      window.sendMainMessage("ask-edit-axis", {
        x: Math.round(rect.right),
        y: Math.round(rect.top),
        legend: "left",
        lockedRange: this.leftLockedRange,
        unitConversion: this.leftUnitConversion
      });
    });

    let rightExitAxisButton = root.getElementsByClassName("line-graph-edit-right")[0];
    rightExitAxisButton.addEventListener("click", () => {
      let rect = rightExitAxisButton.getBoundingClientRect();
      window.sendMainMessage("ask-edit-axis", {
        x: Math.round(rect.right),
        y: Math.round(rect.top),
        legend: "right",
        lockedRange: this.rightLockedRange,
        unitConversion: this.rightUnitConversion
      });
    });

    let discreteEditAxisButton = root.getElementsByClassName("line-graph-edit-discrete")[0];
    discreteEditAxisButton.addEventListener("click", () => {
      let rect = discreteEditAxisButton.getBoundingClientRect();
      window.sendMainMessage("ask-edit-axis", {
        x: Math.round(rect.right),
        y: Math.round(rect.top),
        legend: "discrete"
      });
    });
  }

  saveState(): unknown {
    return {
      leftSources: this.leftSourceList.saveState(),
      rightSources: this.rightSourceList.saveState(),
      discreteSources: this.discreteSourceList.saveState(),

      leftLockedRange: this.leftLockedRange,
      rightLockedRange: this.rightLockedRange,

      leftUnitConversion: this.leftUnitConversion,
      rightUnitConversion: this.rightUnitConversion
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
      this.leftUnitConversion = state.leftUnitConversion as UnitConversionPreset;
    }
    if ("rightUnitConversion" in state) {
      this.rightUnitConversion = state.rightUnitConversion as UnitConversionPreset;
    }
    this.updateAxisLabels();

    if ("leftSources" in state) {
      this.leftSourceList.restoreState(state.leftSources as SourceListItemState[]);
    }
    if ("rightSources" in state) {
      this.rightSourceList.restoreState(state.rightSources as SourceListItemState[]);
    }
    if ("discreteSources" in state) {
      this.discreteSourceList.restoreState(state.discreteSources as SourceListItemState[]);
    }
  }

  /** Updates the axis labels based on the locked and unit conversion status. */
  private updateAxisLabels() {
    let leftLocked = this.leftLockedRange !== null;
    let leftConverted = this.leftUnitConversion.type !== null || this.leftUnitConversion.factor !== 1;
    if (leftLocked && leftConverted) {
      this.leftSourceList.setTitle("Left Axis [Locked, Converted]");
    } else if (leftLocked) {
      this.leftSourceList.setTitle("Left Axis [Locked]");
    } else if (leftConverted) {
      this.leftSourceList.setTitle("Left Axis [Converted]");
    } else {
      this.leftSourceList.setTitle("Left Axis");
    }

    let rightLocked = this.rightLockedRange !== null;
    let rightConverted = this.rightUnitConversion.type !== null || this.rightUnitConversion.factor !== 1;
    if (rightLocked && rightConverted) {
      this.rightSourceList.setTitle("Right Axis [Locked, Converted]");
    } else if (rightLocked) {
      this.rightSourceList.setTitle("Right Axis [Locked]");
    } else if (rightConverted) {
      this.rightSourceList.setTitle("Right Axis [Converted]");
    } else {
      this.rightSourceList.setTitle("Right Axis");
    }
  }

  /** Adjusts the locked range and unit conversion for an axis. */
  editAxis(legend: string, lockedRange: [number, number] | null, unitConversion: UnitConversionPreset) {
    switch (legend) {
      case "left":
        if (lockedRange === null) {
          this.leftLockedRange = null;
        } else if (lockedRange[0] === null && lockedRange[1] === null) {
          this.leftLockedRange = [0, 10]; // TODO: Use data range
        } else {
          this.leftLockedRange = lockedRange;
        }
        this.leftUnitConversion = unitConversion;
        break;

      case "right":
        if (lockedRange === null) {
          this.rightLockedRange = null;
        } else if (lockedRange[0] === null && lockedRange[1] === null) {
          this.rightLockedRange = [0, 10]; // TODO: Use data range
        } else {
          this.rightLockedRange = lockedRange;
        }
        this.rightUnitConversion = unitConversion;
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
    }
  }

  refresh(): void {}

  newAssets(): void {}

  getActiveFields(): string[] {
    return [];
  }

  getCommand(): unknown {
    return null;
  }

  periodic(): void {}
}

const DiscreteFieldsConfig: SourceListConfig = {
  title: "Discrete Fields",
  autoAdvance: "color",
  types: [
    {
      key: "stripes",
      display: "Stripes",
      symbol: "square.stack.3d.forward.dottedline.fill",
      showInTypeName: false,
      color: "color",
      sourceTypes: ["Raw", "Boolean", "Number", "String", "BooleanArray", "NumberArray", "StringArray"],
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: GraphColors
        }
      ]
    },
    {
      key: "graph",
      display: "Graph",
      symbol: "chart.xyaxis.line",
      showInTypeName: false,
      color: "color",
      sourceTypes: ["Raw", "Boolean", "Number", "String", "BooleanArray", "NumberArray", "StringArray"],
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: GraphColors
        }
      ]
    }
  ]
};

const NumericAxisConfig: SourceListConfig = {
  title: "",
  autoAdvance: "color",
  types: [
    {
      key: "smooth",
      display: "Smooth",
      symbol: "scribble.variable",
      showInTypeName: false,
      color: "color",
      sourceTypes: ["Number"],
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: GraphColors
        },
        {
          key: "thickness",
          display: "Thickness",
          showInTypeName: false,
          values: [
            { key: "normal", display: "Normal" },
            { key: "bold", display: "Bold" },
            { key: "verybold", display: "Very Bold" }
          ]
        }
      ]
    },
    {
      key: "stepped",
      display: "Stepped",
      symbol: "stairs",
      showInTypeName: false,
      color: "color",
      sourceTypes: ["Number"],
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: GraphColors
        },
        {
          key: "thickness",
          display: "Thickness",
          showInTypeName: false,
          values: [
            { key: "normal", display: "Normal" },
            { key: "bold", display: "Bold" },
            { key: "verybold", display: "Very Bold" }
          ]
        }
      ]
    },
    {
      key: "points",
      display: "Points",
      symbol: "smallcircle.filled.circle",
      showInTypeName: false,
      color: "color",
      sourceTypes: ["Number"],
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: GraphColors
        },
        {
          key: "size",
          display: "Size",
          showInTypeName: false,
          values: [
            { key: "normal", display: "Normal" },
            { key: "large", display: "Large" }
          ]
        }
      ]
    }
  ]
};
