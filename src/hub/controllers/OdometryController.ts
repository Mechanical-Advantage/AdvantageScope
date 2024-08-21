import { NeonColors } from "../../shared/Colors";
import { SourceListConfig, SourceListItemState } from "../../shared/SourceListConfig";
import { Orientation } from "../../shared/renderers/OdometryRenderer";
import SourceList from "../SourceList";
import TabController from "./TabController";

export default class OdometryController implements TabController {
  private BUMPER_SWITCHER: HTMLElement;
  private ORIGIN_SWITCHER: HTMLElement;
  private ORIENTATION_SWITCHER: HTMLElement;
  private SIZE_SWITCHER: HTMLElement;
  private GAME_SELECT: HTMLSelectElement;
  private GAME_SOURCE: HTMLElement;

  private sourceList: SourceList;

  private bumperSetting: "auto" | "blue" | "red" = "auto";
  private originSetting: "auto" | "blue" | "red" = "auto";
  private orientationSetting = Orientation.DEG_0;
  private sizeSetting: 30 | 27 | 24 = 30;

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(root.getElementsByClassName("odometry-sources")[0] as HTMLElement, SourcesConfig);
    let settings = root.getElementsByClassName("odometry-settings")[0] as HTMLElement;
    this.GAME_SELECT = root.getElementsByClassName("game-select")[0] as HTMLSelectElement;
    this.GAME_SOURCE = root.getElementsByClassName("game-source")[0] as HTMLElement;
    this.BUMPER_SWITCHER = settings.getElementsByClassName("bumper-switcher")[0] as HTMLElement;
    this.ORIGIN_SWITCHER = settings.getElementsByClassName("origin-switcher")[0] as HTMLElement;
    this.ORIENTATION_SWITCHER = settings.getElementsByClassName("orientation-switcher")[0] as HTMLElement;
    this.SIZE_SWITCHER = settings.getElementsByClassName("size-switcher")[0] as HTMLElement;

    // Set up game select
    this.GAME_SELECT.addEventListener("change", () => this.updateGameDependentControls());
    this.GAME_SOURCE.addEventListener("click", () => {
      window.sendMainMessage(
        "open-link",
        window.assets?.field2ds.find((game) => game.name === this.GAME_SELECT.value)?.sourceUrl
      );
    });
    this.updateGameOptions();

    // Set up switchers
    (["auto", "blue", "red"] as const).forEach((value, index) => {
      this.BUMPER_SWITCHER.children[index].addEventListener("click", () => {
        this.bumperSetting = value;
        this.updateSwitchers();
      });
    });
    (["auto", "blue", "red"] as const).forEach((value, index) => {
      this.ORIGIN_SWITCHER.children[index].addEventListener("click", () => {
        this.originSetting = value;
        this.updateSwitchers();
      });
    });
    this.ORIENTATION_SWITCHER.children[0].addEventListener("click", () => {
      this.orientationSetting--;
      if (this.orientationSetting < 0) this.orientationSetting = 3;
    });
    this.ORIENTATION_SWITCHER.children[1].addEventListener("click", () => {
      this.orientationSetting++;
      if (this.orientationSetting > 3) this.orientationSetting = 0;
    });
    ([30, 27, 24] as const).forEach((value, index) => {
      this.SIZE_SWITCHER.children[index].addEventListener("click", () => {
        this.sizeSetting = value;
        this.updateSwitchers();
      });
    });
    this.updateSwitchers();
  }

  /** Updates game select with the latest options. */
  private updateGameOptions() {
    let value = this.GAME_SELECT.value;
    while (this.GAME_SELECT.firstChild) {
      this.GAME_SELECT.removeChild(this.GAME_SELECT.firstChild);
    }
    let options: string[] = [];
    if (window.assets !== null) {
      options = window.assets.field2ds.map((game) => game.name);
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

  /** Updates the alliance and source buttons based on the selected value. */
  private updateGameDependentControls(skipOriginReset = false) {
    let fieldConfig = window.assets?.field2ds.find((game) => game.name === this.GAME_SELECT.value);
    this.GAME_SOURCE.hidden = fieldConfig !== undefined && fieldConfig.sourceUrl === undefined;

    if (fieldConfig !== undefined && !skipOriginReset) {
      this.originSetting = fieldConfig.defaultOrigin;
      this.updateSwitchers();
    }
  }

  /** Updates the switcher elements to match the internal state. */
  private updateSwitchers() {
    // Bumpers
    {
      let selectedIndex = ["auto", "blue", "red"].indexOf(this.bumperSetting);
      if (selectedIndex === -1) selectedIndex = 0;
      for (let i = 0; i < 3; i++) {
        if (i === selectedIndex) {
          this.BUMPER_SWITCHER.children[i].classList.add("selected");
        } else {
          this.BUMPER_SWITCHER.children[i].classList.remove("selected");
        }
      }
    }

    // Origin
    {
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

    // Size
    {
      let selectedIndex = [30, 27, 24].indexOf(this.sizeSetting);
      if (selectedIndex === -1) selectedIndex = 0;
      for (let i = 0; i < 3; i++) {
        if (i === selectedIndex) {
          this.SIZE_SWITCHER.children[i].classList.add("selected");
        } else {
          this.SIZE_SWITCHER.children[i].classList.remove("selected");
        }
      }
    }
  }

  saveState(): unknown {
    return {
      sources: this.sourceList.getState(),
      game: this.GAME_SELECT.value,
      bumpers: this.bumperSetting,
      origin: this.originSetting,
      orientation: this.orientationSetting,
      size: this.sizeSetting
    };
  }

  restoreState(state: unknown): void {
    if (typeof state !== "object" || state === null) return;

    this.updateGameOptions();
    if ("sources" in state) {
      this.sourceList.setState(state.sources as SourceListItemState[]);
    }
    if ("game" in state && typeof state.game === "string") {
      this.GAME_SELECT.value = state.game;
      if (this.GAME_SELECT.value === "") {
        this.GAME_SELECT.selectedIndex = 0;
      }
    }
    if ("bumpers" in state && (state.bumpers === "auto" || state.bumpers === "blue" || state.bumpers === "red")) {
      this.bumperSetting = state.bumpers;
    }
    if ("origin" in state && (state.origin === "auto" || state.origin === "blue" || state.origin === "red")) {
      this.originSetting = state.origin;
    }
    if (
      "orientation" in state &&
      (state.orientation === Orientation.DEG_0 ||
        state.orientation === Orientation.DEG_90 ||
        state.orientation === Orientation.DEG_180 ||
        state.orientation === Orientation.DEG_270)
    ) {
      this.orientationSetting = state.orientation;
    }
    if ("size" in state && (state.size === 30 || state.size === 27 || state.size === 24)) {
      this.sizeSetting = state.size;
    }
    this.updateGameDependentControls(true);
    this.updateSwitchers();
  }

  refresh(): void {}

  newAssets(): void {
    this.updateGameOptions();
  }

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
      options: []
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
