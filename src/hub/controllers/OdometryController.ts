import { NeonColors } from "../../shared/Colors";
import { SourceListConfig, SourceListItemState } from "../../shared/SourceListConfig";
import SourceList from "../SourceList";
import TabController from "./TabController";

export default class OdometryController implements TabController {
  private sourceList: SourceList;

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(root.getElementsByClassName("odometry-sources")[0] as HTMLElement, SourcesConfig);
  }

  saveState(): unknown {
    return {
      sources: this.sourceList.getState()
    };
  }

  restoreState(state: unknown): void {
    if (typeof state !== "object" || state === null) return;

    if ("sources" in state) {
      this.sourceList.setState(state.sources as SourceListItemState[]);
    }
  }

  refresh(): void {}

  newAssets(): void {}

  getActiveFields(): string[] {
    return this.sourceList.getActiveFields();
  }

  getCommand(): unknown {
    return null;
  }
}

const SourcesConfig: SourceListConfig = {
  title: "Poses",
  autoAdvance: true,
  typeMemoryId: "odometry",
  types: [
    {
      key: "robot",
      display: "Robot",
      symbol: "location.fill",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Pose2d", "Pose2d[]", "Transform2d", "Transform2d[]"],
      options: [
        {
          key: "size",
          display: "Frame Size",
          showInTypeName: false,
          values: [
            { key: "30", display: "Max (30 in)" },
            { key: "27", display: "Small (27 in)" },
            { key: "24", display: "Very Small (24 in)" }
          ]
        }
      ]
    },
    {
      key: "robotLegacy",
      display: "Robot",
      symbol: "location.fill",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "size",
          display: "Frame Size",
          showInTypeName: false,
          values: [
            { key: "30", display: "Max (30 in)" },
            { key: "27", display: "Small (27 in)" },
            { key: "24", display: "Very Small (24 in)" }
          ]
        },
        {
          key: "units",
          display: "Rotation Units",
          showInTypeName: false,
          values: [
            { key: "radians", display: "Radians" },
            { key: "degrees", display: "Degrees" }
          ]
        }
      ],
      numberArrayDeprecated: true
    },
    {
      key: "ghost",
      display: "Ghost",
      symbol: "location.fill.viewfinder",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["Pose2d", "Pose2d[]", "Transform2d", "Transform2d[]", "ZebraTranslation"],
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        },
        {
          key: "size",
          display: "Frame Size",
          showInTypeName: false,
          values: [
            { key: "30", display: "Max (30 in)" },
            { key: "27", display: "Small (27 in)" },
            { key: "24", display: "Very Small (24 in)" }
          ]
        }
      ],
      initialSelectionOption: "color"
    },
    {
      key: "ghostLegacy",
      display: "Ghost",
      symbol: "location.fill.viewfinder",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        },
        {
          key: "size",
          display: "Frame Size",
          showInTypeName: false,
          values: [
            { key: "30", display: "Max (30 in)" },
            { key: "27", display: "Small (27 in)" },
            { key: "24", display: "Very Small (24 in)" }
          ]
        },
        {
          key: "units",
          display: "Rotation Units",
          showInTypeName: false,
          values: [
            { key: "radians", display: "Radians" },
            { key: "degrees", display: "Degrees" }
          ]
        }
      ],
      initialSelectionOption: "color",
      numberArrayDeprecated: true
    },
    {
      key: "vision",
      display: "Vision Target",
      symbol: "scope",
      showInTypeName: true,
      color: "#00bb00",
      sourceTypes: [
        "NumberArray",
        "Pose2d",
        "Pose2d[]",
        "Transform2d",
        "Transform2d[]",
        "Translation2d",
        "Translation2d[]"
      ],
      options: [],
      numberArrayDeprecated: true
    },
    {
      key: "trajectory",
      display: "Trajectory",
      symbol: "point.bottomleft.forward.to.point.topright.scurvepath.fill",
      showInTypeName: true,
      color: "#ff8800",
      sourceTypes: ["NumberArray", "Pose2d[]", "Transform2d[]", "Translation2d[]", "Trajectory"],
      options: [],
      numberArrayDeprecated: true
    },
    {
      key: "heatmap",
      display: "Heatmap",
      symbol: "map.fill",
      showInTypeName: true,
      color: "#ff0000",
      sourceTypes: [
        "NumberArray",
        "Pose2d",
        "Pose2d[]",
        "Transform2d",
        "Transform2d[]",
        "Translation2d",
        "Translation2d[]"
      ],
      options: [
        {
          key: "samples",
          display: "Samples",
          showInTypeName: false,
          values: [
            { key: "enabled", display: "Enabled Only" },
            { key: "full", display: "Full Log" }
          ]
        }
      ],
      initialSelectionOption: "samples",
      numberArrayDeprecated: true
    },
    {
      key: "arrow",
      display: "Arrow",
      symbol: "arrow.up.circle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Pose2d", "Pose2d[]", "Transform2d", "Transform2d[]"],
      options: [
        {
          key: "position",
          display: "Position",
          showInTypeName: true,
          values: [
            { key: "center", display: "Center" },
            { key: "back", display: "Back" },
            { key: "front", display: "Front" }
          ]
        }
      ],
      initialSelectionOption: "position"
    },
    {
      key: "arrowLegacy",
      display: "Arrow",
      symbol: "arrow.up.circle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "position",
          display: "Position",
          showInTypeName: true,
          values: [
            { key: "center", display: "Center" },
            { key: "back", display: "Back" },
            { key: "front", display: "Front" }
          ]
        },
        {
          key: "units",
          display: "Rotation Units",
          showInTypeName: false,
          values: [
            { key: "radians", display: "Radians" },
            { key: "degrees", display: "Degrees" }
          ]
        }
      ],
      initialSelectionOption: "position",
      numberArrayDeprecated: true
    },
    {
      key: "zebra",
      display: "Zebra Marker",
      symbol: "mappin.circle.fill",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["ZebraTranslation"],
      options: []
    }
  ]
};
