import fs from "fs";
import jsonfile from "jsonfile";
import path from "path";
import {
  Config2d,
  Config3dField,
  Config3dRobot,
  ConfigJoystick,
  ConfigJoystick_Axis,
  ConfigJoystick_Button,
  ConfigJoystick_Joystick,
  FRCData
} from "../lib/FRCData";
import { checkArrayType, smartSort } from "../lib/util";
import { EXTRA_FRC_DATA } from "./Constants";

/** Creates extra FRC data folder and updates README. */
export function createExtraFRCDataFolder(): void {
  if (!fs.existsSync(EXTRA_FRC_DATA)) {
    fs.mkdirSync(EXTRA_FRC_DATA);
  }
  fs.copyFileSync(path.join(__dirname, "..", "frcData", "extra-readme.txt"), path.join(EXTRA_FRC_DATA, "README.txt"));
}

/** Loads all current FRC data (bundled and extra). */
export function loadFRCData(): FRCData {
  let frcData: FRCData = {
    field2ds: [],
    field3ds: [],
    robots: [],
    joysticks: []
  };

  [path.join(__dirname, "..", "frcData"), EXTRA_FRC_DATA].forEach((folder) => {
    fs.readdirSync(folder).forEach((file) => {
      if (!file.endsWith(".json")) return;
      let title = file.split("_").slice(1).join("_").split(".").slice(0, -1).join(".");
      let configRaw = jsonfile.readFileSync(path.join(folder, file));
      let isField2d = file.startsWith("Field2d_");
      let isField3d = file.startsWith("Field3d_");
      let isRobot = file.startsWith("Robot_");
      let isJoystick = file.startsWith("Joystick_");

      if (isField2d) {
        // ***** 2D FIELD *****
        let config: Config2d = {
          title: title,
          path: path.join(folder, "Field2d_" + title + ".png"),
          sourceUrl: "",
          topLeft: [0, 0],
          bottomRight: [0, 0],
          widthInches: 0,
          heightInches: 0
        };
        if (typeof configRaw == "object") {
          if ("sourceUrl" in configRaw && typeof configRaw.sourceUrl === "string") {
            config.sourceUrl = configRaw.sourceUrl;
          }
          if ("topLeft" in configRaw && checkArrayType(config.topLeft, "number") && config.topLeft.length == 2) {
            config.topLeft = configRaw.topLeft;
          }
          if (
            "bottomRight" in configRaw &&
            checkArrayType(config.bottomRight, "number") &&
            config.topLeft.length == 2
          ) {
            config.bottomRight = configRaw.bottomRight;
          }
          if ("widthInches" in configRaw && typeof configRaw.widthInches === "number") {
            config.widthInches = configRaw.widthInches;
          }
          if ("heightInches" in configRaw && typeof configRaw.heightInches === "number") {
            config.heightInches = configRaw.heightInches;
          }
        }
        frcData.field2ds.push(config);
      } else if (isField3d) {
        // ***** 3D FIELD *****
        let config: Config3dField = {
          title: title,
          path: path.join(folder, "Field3d_" + title + ".glb"),
          sourceUrl: "",
          rotations: [],
          widthInches: 0,
          heightInches: 0
        };
        if (typeof configRaw == "object") {
          if ("sourceUrl" in configRaw && typeof configRaw.sourceUrl === "string") {
            config.sourceUrl = configRaw.sourceUrl;
          }
          if (
            "rotations" in configRaw &&
            Array.isArray(config.rotations) &&
            config.rotations.every((rotation) => checkArrayType(rotation, "number") && rotation.length == 4)
          ) {
            config.rotations = configRaw.rotations;
          }
          if ("widthInches" in configRaw && typeof configRaw.widthInches === "number") {
            config.widthInches = configRaw.widthInches;
          }
          if ("heightInches" in configRaw && typeof configRaw.heightInches === "number") {
            config.heightInches = configRaw.heightInches;
          }
        }
        frcData.field3ds.push(config);
      } else if (isRobot) {
        // ***** 3D ROBOT *****
        let config: Config3dRobot = {
          title: title,
          path: path.join(folder, "Robot_" + title + ".glb"),
          sourceUrl: "",
          position: [0, 0, 0],
          rotations: []
        };
        if (typeof configRaw == "object") {
          if ("sourceUrl" in configRaw && typeof configRaw.sourceUrl === "string") {
            config.sourceUrl = configRaw.sourceUrl;
          }
          if (
            "rotations" in configRaw &&
            Array.isArray(config.rotations) &&
            config.rotations.every((rotation) => checkArrayType(rotation, "number") && rotation.length == 4)
          ) {
            config.rotations = configRaw.rotations;
          }
          if (
            "position" in configRaw &&
            checkArrayType(configRaw.position, "number") &&
            configRaw.position.length == 3
          ) {
            config.position = configRaw.position;
          }
        }
        frcData.robots.push(config);
      } else if (isJoystick) {
        // ***** JOYSTICK *****
        let config: ConfigJoystick = {
          title: title,
          path: path.join(folder, "Joystick_" + title + ".png"),
          components: []
        };
        if (Array.isArray(configRaw)) {
          configRaw.forEach((componentRaw) => {
            let isYellow = false;
            if ("isYellow" in componentRaw && typeof componentRaw.isYellow === "boolean") {
              isYellow = componentRaw.isYellow;
            }
            let centerPx: [number, number] = [0, 0];
            if (
              "centerPx" in componentRaw &&
              Array.isArray(componentRaw.centerPx) &&
              checkArrayType(componentRaw.centerPx, "number") &&
              componentRaw.centerPx.length == 2
            ) {
              centerPx = componentRaw.centerPx;
            }

            if ("type" in componentRaw && typeof componentRaw.type === "string") {
              switch (componentRaw.type) {
                case "button":
                  let buttonComponent: ConfigJoystick_Button = {
                    type: "button",
                    isYellow: isYellow,
                    isEllipse: false,
                    centerPx: centerPx,
                    sizePx: [0, 0],
                    sourceIndex: 0
                  };
                  if ("isEllipse" in componentRaw && typeof componentRaw.isEllipse === "boolean") {
                    buttonComponent.isEllipse = componentRaw.isEllipse;
                  }
                  if (
                    "sizePx" in componentRaw &&
                    Array.isArray(componentRaw.sizePx) &&
                    checkArrayType(componentRaw.sizePx, "number") &&
                    componentRaw.sizePx.length == 2
                  ) {
                    buttonComponent.sizePx = componentRaw.sizePx;
                  }
                  if ("sourceIndex" in componentRaw && typeof componentRaw.sourceIndex === "number") {
                    buttonComponent.sourceIndex = componentRaw.sourceIndex;
                  }
                  if (
                    "sourcePov" in componentRaw &&
                    typeof componentRaw.sourcePov === "string" &&
                    (componentRaw.sourcePov == "up" ||
                      componentRaw.sourcePov == "right" ||
                      componentRaw.sourcePov == "down" ||
                      componentRaw.sourcePov == "left")
                  ) {
                    buttonComponent.sourcePov = componentRaw.sourcePov;
                  }
                  config.components.push(buttonComponent);
                  break;

                case "joystick":
                  let joystickComponent: ConfigJoystick_Joystick = {
                    type: "joystick",
                    isYellow: isYellow,
                    centerPx: centerPx,
                    radiusPx: 0,
                    xSourceIndex: 0,
                    xSourceInverted: false,
                    ySourceIndex: 0,
                    ySourceInverted: false
                  };
                  if ("radiusPx" in componentRaw && typeof componentRaw.radiusPx === "number") {
                    joystickComponent.radiusPx = componentRaw.radiusPx;
                  }
                  if ("xSourceIndex" in componentRaw && typeof componentRaw.xSourceIndex === "number") {
                    joystickComponent.xSourceIndex = componentRaw.xSourceIndex;
                  }
                  if ("xSourceInverted" in componentRaw && typeof componentRaw.xSourceInverted === "boolean") {
                    joystickComponent.xSourceInverted = componentRaw.xSourceInverted;
                  }
                  if ("ySourceIndex" in componentRaw && typeof componentRaw.ySourceIndex === "number") {
                    joystickComponent.ySourceIndex = componentRaw.ySourceIndex;
                  }
                  if ("ySourceInverted" in componentRaw && typeof componentRaw.ySourceInverted === "boolean") {
                    joystickComponent.ySourceInverted = componentRaw.ySourceInverted;
                  }
                  if ("buttonSourceIndex" in componentRaw && typeof componentRaw.buttonSourceIndex === "number") {
                    joystickComponent.buttonSourceIndex = componentRaw.buttonSourceIndex;
                  }
                  config.components.push(joystickComponent);
                  break;

                case "axis":
                  let axisComponent: ConfigJoystick_Axis = {
                    type: "axis",
                    isYellow: isYellow,
                    centerPx: centerPx,
                    sizePx: [0, 0],
                    sourceIndex: 0,
                    sourceRange: [-1, 1]
                  };
                  if (
                    "sizePx" in componentRaw &&
                    Array.isArray(componentRaw.sizePx) &&
                    checkArrayType(componentRaw.sizePx, "number") &&
                    componentRaw.sizePx.length == 2
                  ) {
                    axisComponent.sizePx = componentRaw.sizePx;
                  }
                  if ("sourceIndex" in componentRaw && typeof componentRaw.sourceIndex === "number") {
                    axisComponent.sourceIndex = componentRaw.sourceIndex;
                  }
                  if (
                    "sourceRange" in componentRaw &&
                    Array.isArray(componentRaw.sourceRange) &&
                    checkArrayType(componentRaw.sourceRange, "number") &&
                    componentRaw.sourceRange.length == 2
                  ) {
                    axisComponent.sourceRange = componentRaw.sourceRange;
                  }
                  config.components.push(axisComponent);
                  break;
              }
            }
          });
        }
        frcData.joysticks.push(config);
      }
    });
  });
  frcData.field2ds.sort((a, b) => (a.title > b.title ? -1 : b.title > a.title ? 1 : 0));
  frcData.field3ds.sort((a, b) => {
    if (a.title == "Evergreen") return 1;
    if (b.title == "Evergreen") return -1;
    return a.title > b.title ? -1 : b.title > a.title ? 1 : 0;
  });
  frcData.robots.sort((a, b) => {
    if (a.title == "KitBot") return -1;
    if (b.title == "KitBot") return 1;
    return smartSort(a.title, b.title);
  });
  frcData.joysticks.sort((a, b) => (a.title > b.title ? -1 : b.title > a.title ? 1 : 0));

  return frcData;
}
