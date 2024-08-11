import { GraphColors } from "../../shared/Colors";
import { SourceListConfig, SourceListItemState } from "../../shared/SourceListConfig";
import SourceList from "../SourceList";
import TabController from "./TabController";

export default class LineGraphController implements TabController {
  private leftSourceList: SourceList;
  private discreteSourceList: SourceList;
  private rightSourceList: SourceList;

  constructor(root: HTMLElement) {
    this.leftSourceList = new SourceList(
      root.getElementsByClassName("line-graph-left")[0] as HTMLElement,
      NumericAxisConfig
    );
    this.leftSourceList.setTitle("Left Axis");

    this.discreteSourceList = new SourceList(
      root.getElementsByClassName("line-graph-discrete")[0] as HTMLElement,
      DiscreteFieldsConfig
    );

    this.rightSourceList = new SourceList(
      root.getElementsByClassName("line-graph-right")[0] as HTMLElement,
      NumericAxisConfig
    );
    this.rightSourceList.setTitle("Right Axis");
  }

  saveState(): unknown {
    return {
      left: this.leftSourceList.saveState(),
      discrete: this.discreteSourceList.saveState(),
      right: this.rightSourceList.saveState()
    };
  }

  restoreState(state: unknown): void {
    if (typeof state !== "object" || state === null) return;
    if ("left" in state) {
      this.leftSourceList.restoreState(state.left as SourceListItemState[]);
    }
    if ("discrete" in state) {
      this.discreteSourceList.restoreState(state.discrete as SourceListItemState[]);
    }
    if ("right" in state) {
      this.rightSourceList.restoreState(state.right as SourceListItemState[]);
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
