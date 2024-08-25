import { NeonColors } from "../../shared/Colors";
import { SourceListConfig, SourceListOptionValueConfig, SourceListState } from "../../shared/SourceListConfig";
import { createUUID } from "../../shared/util";
import SourceList from "../SourceList";
import TabController from "./TabController";

export default class ThreeDimensionController implements TabController {
  private UUID = createUUID();
  private ORIGIN_SWITCHER: HTMLElement;
  private XR_BUTTON: HTMLButtonElement;
  private GAME_SELECT: HTMLSelectElement;
  private GAME_SOURCE: HTMLElement;

  private sourceList: SourceList;
  private originSetting: "auto" | "blue" | "red" = "auto";

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(
      root.getElementsByClassName("three-dimension-sources")[0] as HTMLElement,
      SourcesConfig,
      []
    );
    let settings = root.getElementsByClassName("three-dimension-settings")[0] as HTMLElement;
    this.ORIGIN_SWITCHER = settings.getElementsByClassName("origin-switcher")[0] as HTMLElement;
    this.XR_BUTTON = settings.getElementsByClassName("xr-button")[0] as HTMLButtonElement;
    this.GAME_SELECT = settings.getElementsByClassName("game-select")[0] as HTMLSelectElement;
    this.GAME_SOURCE = settings.getElementsByClassName("game-source")[0] as HTMLElement;

    // Set up XR button
    this.XR_BUTTON.addEventListener("click", () => {
      window.sendMainMessage("open-xr");
    });

    // Set up game select
    this.GAME_SELECT.addEventListener("change", () => this.updateGameDependentControls());
    this.GAME_SOURCE.addEventListener("click", () => {
      window.sendMainMessage(
        "open-link",
        window.assets?.field3ds.find((game) => game.name === this.GAME_SELECT.value)?.sourceUrl
      );
    });
    this.updateGameOptions();
    this.updateRobotOptions();

    // Set up switchers
    (["auto", "blue", "red"] as const).forEach((value, index) => {
      this.ORIGIN_SWITCHER.children[index].addEventListener("click", () => {
        this.originSetting = value;
        this.updateOriginSwitcher();
      });
    });
    this.updateOriginSwitcher();
  }

  /** Updates game select with the latest options. */
  private updateGameOptions() {
    let value = this.GAME_SELECT.value;
    while (this.GAME_SELECT.firstChild) {
      this.GAME_SELECT.removeChild(this.GAME_SELECT.firstChild);
    }
    let options: string[] = [];
    if (window.assets !== null) {
      options = [...window.assets.field3ds.map((game) => game.name), "Evergreen", "Axes"];
      options.forEach((title) => {
        let option = document.createElement("option");
        option.innerText = title;
        this.GAME_SELECT.appendChild(option);
      });
    }
    if (options.includes(value)) {
      this.GAME_SELECT.value = value;
    } else {
      this.GAME_SELECT.value = options[0];
    }
    this.updateGameDependentControls(this.GAME_SELECT.value === value); // Skip origin reset if game is unchanged
  }

  /** Updates source list with the latest robot models. */
  private updateRobotOptions() {
    let robotList: string[] = [];
    if (window.assets !== null) {
      robotList = window.assets.robots.map((robot) => robot.name);
    }
    if (robotList.length === 0) {
      robotList.push("KitBot");
    }
    let sourceListValues: SourceListOptionValueConfig[] = robotList.map((name) => {
      return { key: name, display: name };
    });
    this.sourceList.setOptionValues("robot", "model", sourceListValues);
    this.sourceList.setOptionValues("robotLegacy", "model", sourceListValues);
    this.sourceList.setOptionValues("ghost", "model", sourceListValues);
    this.sourceList.setOptionValues("ghostLegacy", "model", sourceListValues);
    this.sourceList.setOptionValues("ghostZebra", "model", sourceListValues);
  }

  /** Updates the alliance select, source button, and game pieces based on the selected value. */
  private updateGameDependentControls(skipOriginReset = false) {
    let fieldConfig = window.assets?.field3ds.find((game) => game.name === this.GAME_SELECT.value);
    this.GAME_SOURCE.hidden = fieldConfig !== undefined && fieldConfig.sourceUrl === undefined;

    if (fieldConfig !== undefined && !skipOriginReset) {
      this.originSetting = fieldConfig.defaultOrigin;
      this.updateOriginSwitcher();
    }

    let gamePieces: string[] = [];
    if (fieldConfig !== undefined) {
      gamePieces = fieldConfig.gamePieces.map((x) => x.name);
    }
    if (gamePieces.length === 0) {
      gamePieces.push("None");
    }
    let sourceListValues: SourceListOptionValueConfig[] = gamePieces.map((name) => {
      return { key: name, display: name };
    });
    this.sourceList.setOptionValues("gamePiece", "variant", sourceListValues);
    this.sourceList.setOptionValues("gamePieceLegacy", "variant", sourceListValues);
  }

  /** Updates the switcher elements to match the internal state. */
  private updateOriginSwitcher() {
    let selectedIndex = ["auto", "blue", "red"].indexOf(this.originSetting);
    if (selectedIndex === -1) selectedIndex = 0;
    for (let i = 0; i < 3; i++) {
      if (i === selectedIndex) {
        this.ORIGIN_SWITCHER.children[i].classList.add("selected");
      } else {
        this.ORIGIN_SWITCHER.children[i].classList.remove("selected");
      }
    }
  }

  saveState(): unknown {
    return {
      sources: this.sourceList.getState(),
      game: this.GAME_SELECT.value,
      origin: this.originSetting
    };
  }

  restoreState(state: unknown): void {
    if (typeof state !== "object" || state === null) return;

    this.updateGameOptions();
    if ("sources" in state) {
      this.sourceList.setState(state.sources as SourceListState);
    }
    if ("game" in state && typeof state.game === "string") {
      this.GAME_SELECT.value = state.game;
      if (this.GAME_SELECT.value === "") {
        this.GAME_SELECT.selectedIndex = 0;
      }
    }
    if ("origin" in state && (state.origin === "auto" || state.origin === "blue" || state.origin === "red")) {
      this.originSetting = state.origin;
    }
    this.updateGameDependentControls(true);
    this.updateOriginSwitcher();
  }

  refresh(): void {
    this.sourceList.refresh();
  }

  newAssets(): void {
    this.updateGameOptions();
    this.updateRobotOptions();
  }

  getActiveFields(): string[] {
    return this.sourceList.getActiveFields();
  }

  getCommand() {
    return null;
  }
}

const SourcesConfig: SourceListConfig = {
  title: "Poses",
  autoAdvance: true,
  allowChildrenFromDrag: false,
  typeMemoryId: "threeDimension",
  types: [
    {
      key: "robot",
      display: "Robot",
      symbol: "location.fill",
      showInTypeName: false,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: [
        "Pose2d",
        "Pose3d",
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d",
        "Transform3d",
        "Transform2d[]",
        "Transform3d[]"
      ],
      options: [
        {
          key: "model",
          display: "Model",
          showInTypeName: true,
          values: []
        }
      ],
      initialSelectionOption: "model",
      parentKey: "robot",
      geometryPreviewType: "Pose3d"
    },
    {
      key: "robotLegacy",
      display: "Robot",
      symbol: "location.fill",
      showInTypeName: false,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "model",
          display: "Model",
          showInTypeName: true,
          values: []
        },
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose2d", display: "2D Pose(s)" },
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation2d", display: "2D Translation(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
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
      initialSelectionOption: "model",
      numberArrayDeprecated: true,
      parentKey: "robot",
      geometryPreviewType: "Pose3d"
    },
    {
      key: "ghost",
      display: "Ghost",
      symbol: "location.fill.viewfinder",
      showInTypeName: true,
      color: "color",
      sourceTypes: [
        "Pose2d",
        "Pose3d",
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d",
        "Transform3d",
        "Transform2d[]",
        "Transform3d[]"
      ],
      options: [
        {
          key: "model",
          display: "Model",
          showInTypeName: true,
          values: []
        },
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        }
      ],
      initialSelectionOption: "color",
      parentKey: "robot",
      geometryPreviewType: "Pose3d"
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
          key: "model",
          display: "Model",
          showInTypeName: true,
          values: []
        },
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        },
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose2d", display: "2D Pose(s)" },
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation2d", display: "2D Translation(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
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
      parentKey: "robot",
      numberArrayDeprecated: true,
      geometryPreviewType: "Pose3d"
    },
    {
      key: "ghostZebra",
      display: "Ghost",
      symbol: "location.fill.viewfinder",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["ZebraTranslation"],
      options: [
        {
          key: "model",
          display: "Model",
          showInTypeName: true,
          values: []
        },
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        }
      ],
      initialSelectionOption: "color",
      parentKey: "robot",
      geometryPreviewType: "Translation2d"
    },
    {
      key: "mechanism",
      display: "Mechanism",
      symbol: "gearshape.fill",
      showInTypeName: true,
      color: "#888888",
      sourceTypes: ["Mechanism2d"],
      options: [],
      childOf: "robot",
      geometryPreviewType: null
    },
    {
      key: "component",
      display: "Component",
      symbol: "puzzlepiece.extension.fill",
      showInTypeName: true,
      color: "#9370db",
      sourceTypes: ["Pose3d", "Pose3d[]", "Transform3d", "Transform3d[]"],
      options: [],
      childOf: "robot",
      geometryPreviewType: "Pose3d"
    },
    {
      key: "componentLegacy",
      display: "Component",
      symbol: "puzzlepiece.extension.fill",
      showInTypeName: true,
      color: "#9370db",
      sourceTypes: ["NumberArray"],
      options: [],
      childOf: "robot",
      numberArrayDeprecated: true,
      geometryPreviewType: "Pose3d"
    },
    {
      key: "cameraOverride",
      display: "Camera Override",
      symbol: "camera.fill",
      showInTypeName: true,
      color: "#888888",
      sourceTypes: ["Pose3d", "Transform3d"],
      options: [],
      childOf: "robot",
      geometryPreviewType: "Pose3d"
    },
    {
      key: "cameraOverrideLegacy",
      display: "Camera Override",
      symbol: "camera.fill",
      showInTypeName: true,
      color: "#888888",
      sourceTypes: ["NumberArray"],
      options: [],
      childOf: "robot",
      numberArrayDeprecated: true,
      geometryPreviewType: "Pose3d"
    },
    {
      key: "rotationOverride",
      display: "Rotation Override",
      symbol: "angle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Rotation2d", "Rotation3d"],
      options: [],
      childOf: "robot",
      geometryPreviewType: "Rotation3d"
    },
    {
      key: "rotationOverrideLegacy",
      display: "Rotation Override",
      symbol: "angle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Number"],
      options: [
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
      childOf: "robot",
      geometryPreviewType: "Rotation2d"
    },
    {
      key: "vision",
      display: "Vision Target",
      symbol: "scope",
      showInTypeName: true,
      color: "#00bb00",
      sourceTypes: [
        "Pose2d",
        "Pose3d",
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d",
        "Transform3d",
        "Transform2d[]",
        "Transform3d[]",
        "Translation2d",
        "Translation3d",
        "Translation2d[]",
        "Translation3d[]"
      ],
      options: [],
      childOf: "robot",
      geometryPreviewType: "Translation3d"
    },
    {
      key: "visionLegacy",
      display: "Vision Target",
      symbol: "scope",
      showInTypeName: true,
      color: "#00bb00",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose2d", display: "2D Pose(s)" },
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation2d", display: "2D Translation(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
          ]
        }
      ],
      numberArrayDeprecated: true,
      childOf: "robot",
      geometryPreviewType: "Translation3d"
    },
    {
      key: "gamePiece",
      display: "Game Piece",
      symbol: "star.fill",
      showInTypeName: false,
      color: "#ffd700",
      sourceTypes: ["Pose3d", "Pose3d[]", "Transform3d", "Transform3d[]", "Translation3d", "Translation3d[]"],
      options: [
        {
          key: "variant",
          display: "Variant",
          showInTypeName: true,
          values: [
            { key: "Note", display: "Note" },
            { key: "High Note", display: "High Note" }
          ]
        }
      ],
      initialSelectionOption: "variant",
      geometryPreviewType: "Pose3d"
    },
    {
      key: "gamePieceLegacy",
      display: "Game Piece",
      symbol: "star.fill",
      showInTypeName: false,
      color: "#ffd700",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "variant",
          display: "Variant",
          showInTypeName: true,
          values: [
            { key: "Note", display: "Note" },
            { key: "High Note", display: "High Note" }
          ]
        },
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
          ]
        }
      ],
      initialSelectionOption: "variant",
      numberArrayDeprecated: true,
      geometryPreviewType: "Pose3d"
    },
    {
      key: "trajectory",
      display: "Trajectory",
      symbol: "point.bottomleft.forward.to.point.topright.scurvepath.fill",
      showInTypeName: true,
      color: "#ff8800",
      sourceTypes: [
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d[]",
        "Transform3d[]",
        "Translation2d[]",
        "Translation3d[]",
        "Trajectory"
      ],
      options: [],
      geometryPreviewType: "Translation3d"
    },
    {
      key: "trajectoryLegacy",
      display: "Trajectory",
      symbol: "point.bottomleft.forward.to.point.topright.scurvepath.fill",
      showInTypeName: true,
      color: "#ff8800",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose2d", display: "2D Pose(s)" },
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation2d", display: "2D Translation(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
          ]
        }
      ],
      numberArrayDeprecated: true,
      geometryPreviewType: "Translation3d"
    },
    {
      key: "heatmap",
      display: "Heatmap",
      symbol: "map.fill",
      showInTypeName: true,
      color: "#ff0000",
      sourceTypes: [
        "Pose2d",
        "Pose3d",
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d",
        "Transform3d",
        "Transform2d[]",
        "Transform3d[]",
        "Translation2d",
        "Translation3d",
        "Translation2d[]",
        "Translation3d[]",
        "ZebraTranslation"
      ],
      options: [
        {
          key: "filter",
          display: "Filter",
          showInTypeName: false,
          values: [
            { key: "enabled", display: "Enabled" },
            { key: "auto", display: "Auto" },
            { key: "teleop", display: "Teleop" },
            { key: "teleop-no-endgame", display: "Teleop (No Endgame)" },
            { key: "full", display: "No Filter" }
          ]
        }
      ],
      initialSelectionOption: "filter",
      geometryPreviewType: null
    },
    {
      key: "heatmapLegacy",
      display: "Heatmap",
      symbol: "map.fill",
      showInTypeName: true,
      color: "#ff0000",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "filter",
          display: "Filter",
          showInTypeName: false,
          values: [
            { key: "enabled", display: "Enabled" },
            { key: "auto", display: "Auto" },
            { key: "teleop", display: "Teleop" },
            { key: "teleop-no-endgame", display: "Teleop (No Endgame)" },
            { key: "full", display: "Full Log" }
          ]
        },
        {
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose2d", display: "2D Pose(s)" },
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation2d", display: "2D Translation(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
          ]
        }
      ],
      initialSelectionOption: "filter",
      numberArrayDeprecated: true,
      geometryPreviewType: null
    },
    {
      key: "aprilTag",
      display: "AprilTag",
      symbol: "qrcode",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Pose3d", "Pose3d[]", "Transform3d", "Transform3d[]", "Trajectory"],
      options: [
        {
          key: "family",
          display: "Family",
          showInTypeName: true,
          values: [
            { key: "36h11", display: "36h11" },
            { key: "16h5", display: "16h5" }
          ]
        }
      ],
      parentKey: "aprilTag",
      initialSelectionOption: "family",
      geometryPreviewType: "Pose3d"
    },
    {
      key: "aprilTagLegacy",
      display: "AprilTag",
      symbol: "qrcode",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      options: [
        {
          key: "family",
          display: "Family",
          showInTypeName: true,
          values: [
            { key: "36h11", display: "36h11" },
            { key: "16h5", display: "16h5" }
          ]
        }
      ],
      numberArrayDeprecated: true,
      parentKey: "aprilTag",
      initialSelectionOption: "family",
      geometryPreviewType: "Pose3d"
    },
    {
      key: "aprilTagIDs",
      display: "AprilTag IDs",
      symbol: "number",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      options: [],
      childOf: "aprilTag",
      geometryPreviewType: null
    },
    {
      key: "axes",
      display: "Axes",
      symbol: "move.3d",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Pose3d", "Pose3d[]", "Transform3d", "Transform3d[]", "Trajectory"],
      options: [],
      geometryPreviewType: "Pose3d"
    },
    {
      key: "axesLegacy",
      display: "Axes",
      symbol: "move.3d",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      options: [],
      numberArrayDeprecated: true,
      geometryPreviewType: "Pose3d"
    },
    {
      key: "cone",
      display: "Cone",
      symbol: "cone.fill",
      showInTypeName: true,
      color: "color",
      sourceTypes: [
        "Pose2d",
        "Pose3d",
        "Pose2d[]",
        "Pose3d[]",
        "Transform2d",
        "Transform3d",
        "Transform2d[]",
        "Transform3d[]",
        "Trajectory"
      ],
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        },
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
      initialSelectionOption: "color",
      geometryPreviewType: "Pose3d"
    },
    {
      key: "coneLegacy",
      display: "Cone",
      symbol: "cone.fill",
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
          key: "format",
          display: "Format",
          showInTypeName: false,
          values: [
            { key: "Pose2d", display: "2D Pose(s)" },
            { key: "Pose3d", display: "3D Pose(s)" },
            { key: "Translation2d", display: "2D Translation(s)" },
            { key: "Translation3d", display: "3D Translation(s)" }
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
      numberArrayDeprecated: true,
      geometryPreviewType: "Pose3d"
    },
    {
      key: "zebra",
      display: "Zebra Marker",
      symbol: "mappin.circle.fill",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["ZebraTranslation"],
      options: [],
      geometryPreviewType: "Translation2d"
    }
  ]
};
