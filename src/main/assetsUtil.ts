import fs from "fs";
import jsonfile from "jsonfile";
import path from "path";
import {
  AdvantageScopeAssets,
  Config2d,
  Config3dField,
  Config3dRobot,
  Config3dRobot_Camera,
  Config3dRobot_Component,
  ConfigJoystick,
  ConfigJoystick_Axis,
  ConfigJoystick_Button,
  ConfigJoystick_Joystick
} from "../shared/AdvantageScopeAssets";
import { checkArrayType } from "../shared/util";
import { AUTO_ASSETS, USER_ASSETS } from "./Constants";

const userAssetsReadme =
  'This folder contains extra assets for the odometry, 3D field, and joystick views. For more details, see the "Custom Fields/Robots/Joysticks" page in the AdvantageScope documentation (available through the documentation tab in the app or the URL below).\n\nhttps://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/CUSTOM-CONFIG.md';

/** Creates folders for user and automatic assets. */
export function createAssetsFolders() {
  if (!fs.existsSync(AUTO_ASSETS)) {
    fs.mkdirSync(AUTO_ASSETS);
  }
  if (!fs.existsSync(USER_ASSETS)) {
    fs.mkdirSync(USER_ASSETS);
  }
  fs.writeFileSync(path.join(USER_ASSETS, "README.txt"), userAssetsReadme);
}

/** Loads all current FRC data (bundled and extra). */
export function loadAssets(): AdvantageScopeAssets {
  let assets: AdvantageScopeAssets = {
    field2ds: [],
    field3ds: [],
    robots: [],
    joysticks: []
  };

  // Load user assets first so they take priority
  [USER_ASSETS, AUTO_ASSETS].forEach((parentFolder) => {
    fs.readdirSync(parentFolder, { withFileTypes: true })
      .sort((a, b) => (a.name < b.name ? 1 : a.name > b.name ? -1 : 0)) // Inverse order so newer versions take priority
      .forEach((object) => {
        if (!object.isDirectory() || object.name.startsWith(".")) return;
        let isField2d = object.name.startsWith("Field2d_");
        let isField3d = object.name.startsWith("Field3d_");
        let isRobot = object.name.startsWith("Robot_");
        let isJoystick = object.name.startsWith("Joystick_");

        let configRaw = jsonfile.readFileSync(path.join(parentFolder, object.name, "config.json")) as unknown;
        if (configRaw === null || typeof configRaw !== "object") return;

        if (isField2d) {
          // ***** 2D FIELD *****
          let config: Config2d = {
            name: "",
            path: path.join(parentFolder, object.name, "image.png"),
            topLeft: [0, 0],
            bottomRight: [0, 0],
            widthInches: 0,
            heightInches: 0
          };
          if ("name" in configRaw && typeof configRaw.name === "string") {
            config.name = configRaw.name;
          }
          if ("sourceUrl" in configRaw && typeof configRaw.sourceUrl === "string") {
            config.sourceUrl = configRaw.sourceUrl;
          }
          if (
            "topLeft" in configRaw &&
            checkArrayType(configRaw.topLeft, "number") &&
            (configRaw.topLeft as number[]).length == 2
          ) {
            config.topLeft = configRaw.topLeft as [number, number];
          }
          if (
            "bottomRight" in configRaw &&
            checkArrayType(configRaw.bottomRight, "number") &&
            (configRaw.bottomRight as number[]).length == 2
          ) {
            config.bottomRight = configRaw.bottomRight as [number, number];
          }
          if ("widthInches" in configRaw && typeof configRaw.widthInches === "number") {
            config.widthInches = configRaw.widthInches;
          }
          if ("heightInches" in configRaw && typeof configRaw.heightInches === "number") {
            config.heightInches = configRaw.heightInches;
          }
          assets.field2ds.push(config);
        } else if (isField3d) {
          // ***** 3D FIELD *****
          let config: Config3dField = {
            name: "",
            path: path.join(parentFolder, object.name, "model.glb"),
            rotations: [],
            widthInches: 0,
            heightInches: 0
          };
          if ("name" in configRaw && typeof configRaw.name === "string") {
            config.name = configRaw.name;
          }
          if ("sourceUrl" in configRaw && typeof configRaw.sourceUrl === "string") {
            config.sourceUrl = configRaw.sourceUrl;
          }
          if (
            "rotations" in configRaw &&
            Array.isArray(configRaw.rotations) &&
            configRaw.rotations.every(
              (rotation: any) =>
                typeof rotation === "object" &&
                "axis" in rotation &&
                (rotation.axis === "x" || rotation.axis === "y" || rotation.axis === "z") &&
                "degrees" in rotation &&
                typeof rotation.degrees === "number"
            )
          ) {
            config.rotations = configRaw.rotations;
          }
          if ("widthInches" in configRaw && typeof configRaw.widthInches === "number") {
            config.widthInches = configRaw.widthInches;
          }
          if ("heightInches" in configRaw && typeof configRaw.heightInches === "number") {
            config.heightInches = configRaw.heightInches;
          }
          assets.field3ds.push(config);
        } else if (isRobot) {
          // ***** 3D ROBOT *****
          let config: Config3dRobot = {
            name: "",
            path: path.join(parentFolder, object.name, "model.glb"),
            rotations: [],
            position: [0, 0, 0],
            cameras: [],
            components: []
          };
          if ("name" in configRaw && typeof configRaw.name === "string") {
            config.name = configRaw.name;
          }
          if ("sourceUrl" in configRaw && typeof configRaw.sourceUrl === "string") {
            config.sourceUrl = configRaw.sourceUrl;
          }
          if (
            "rotations" in configRaw &&
            Array.isArray(configRaw.rotations) &&
            configRaw.rotations.every(
              (rotation: any) =>
                typeof rotation === "object" &&
                "axis" in rotation &&
                (rotation.axis === "x" || rotation.axis === "y" || rotation.axis === "z") &&
                "degrees" in rotation &&
                typeof rotation.degrees === "number"
            )
          ) {
            config.rotations = configRaw.rotations;
          }
          if (
            "position" in configRaw &&
            checkArrayType(configRaw.position, "number") &&
            (configRaw.position as number[]).length == 3
          ) {
            config.position = configRaw.position as [number, number, number];
          }
          if ("cameras" in configRaw && Array.isArray(configRaw.cameras)) {
            configRaw.cameras.forEach((cameraRaw: any) => {
              let camera: Config3dRobot_Camera = {
                name: "",
                rotations: [],
                position: [0, 0, 0],
                resolution: [200, 100],
                fov: 90
              };
              config.cameras.push(camera);
              if ("name" in cameraRaw && typeof cameraRaw.name === "string") {
                camera.name = cameraRaw.name;
              }
              if (
                "rotations" in cameraRaw &&
                Array.isArray(cameraRaw.rotations) &&
                cameraRaw.rotations.every(
                  (rotation: any) =>
                    typeof rotation === "object" &&
                    "axis" in rotation &&
                    (rotation.axis === "x" || rotation.axis === "y" || rotation.axis === "z") &&
                    "degrees" in rotation &&
                    typeof rotation.degrees === "number"
                )
              ) {
                camera.rotations = cameraRaw.rotations;
              }
              if (
                "position" in cameraRaw &&
                checkArrayType(cameraRaw.position, "number") &&
                cameraRaw.position.length == 3
              ) {
                camera.position = cameraRaw.position;
              }
              if (
                "resolution" in cameraRaw &&
                checkArrayType(cameraRaw.resolution, "number") &&
                cameraRaw.resolution.length == 2
              ) {
                camera.resolution = cameraRaw.resolution;
              }
              if ("fov" in cameraRaw && typeof cameraRaw.fov === "number") {
                camera.fov = cameraRaw.fov;
              }
            });
          }
          if ("components" in configRaw && Array.isArray(configRaw.components)) {
            configRaw.components.forEach((componentRaw: any) => {
              let component: Config3dRobot_Component = {
                zeroedRotations: [],
                zeroedPosition: [0, 0, 0]
              };
              config.components.push(component);
              if (
                "zeroedRotations" in componentRaw &&
                Array.isArray(componentRaw.zeroedRotations) &&
                componentRaw.zeroedRotations.every(
                  (rotation: any) =>
                    typeof rotation === "object" &&
                    "axis" in rotation &&
                    (rotation.axis === "x" || rotation.axis === "y" || rotation.axis === "z") &&
                    "degrees" in rotation &&
                    typeof rotation.degrees === "number"
                )
              ) {
                component.zeroedRotations = componentRaw.zeroedRotations;
              }
              if (
                "zeroedPosition" in componentRaw &&
                checkArrayType(componentRaw.zeroedPosition, "number") &&
                componentRaw.zeroedPosition.length == 3
              ) {
                component.zeroedPosition = componentRaw.zeroedPosition;
              }
            });
          }
          assets.robots.push(config);
        } else if (isJoystick) {
          // ***** JOYSTICK *****
          let config: ConfigJoystick = {
            name: "",
            path: path.join(parentFolder, object.name, "image.png"),
            components: []
          };
          if ("name" in configRaw && typeof configRaw.name === "string") {
            config.name = configRaw.name;
          }
          if ("components" in configRaw && Array.isArray(configRaw.components)) {
            configRaw.components.forEach((componentRaw: object) => {
              let isYellow = false;
              if ("isYellow" in componentRaw && typeof componentRaw.isYellow === "boolean") {
                isYellow = componentRaw.isYellow;
              }
              let centerPx: [number, number] = [0, 0];
              if (
                "centerPx" in componentRaw &&
                checkArrayType(componentRaw.centerPx, "number") &&
                (componentRaw.centerPx as number[]).length == 2
              ) {
                centerPx = componentRaw.centerPx as [number, number];
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
                      checkArrayType(componentRaw.sizePx, "number") &&
                      (componentRaw.sizePx as number[]).length == 2
                    ) {
                      buttonComponent.sizePx = componentRaw.sizePx as [number, number];
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
                      checkArrayType(componentRaw.sizePx, "number") &&
                      (componentRaw.sizePx as number[]).length == 2
                    ) {
                      axisComponent.sizePx = componentRaw.sizePx as [number, number];
                    }
                    if ("sourceIndex" in componentRaw && typeof componentRaw.sourceIndex === "number") {
                      axisComponent.sourceIndex = componentRaw.sourceIndex;
                    }
                    if (
                      "sourceRange" in componentRaw &&
                      checkArrayType(componentRaw.sourceRange, "number") &&
                      (componentRaw.sourceRange as number[]).length == 2
                    ) {
                      axisComponent.sourceRange = componentRaw.sourceRange as [number, number];
                    }
                    config.components.push(axisComponent);
                    break;
                }
              }
            });
          }
          assets.joysticks.push(config);
        }
      });
  });

  // Remove duplicate names
  let uniqueAssets: AdvantageScopeAssets = {
    field2ds: [],
    field3ds: [],
    robots: [],
    joysticks: []
  };
  assets.field2ds.forEach((asset) => {
    if (uniqueAssets.field2ds.find((other) => other.name === asset.name) === undefined) {
      uniqueAssets.field2ds.push(asset);
    }
  });
  assets.field3ds.forEach((asset) => {
    if (uniqueAssets.field3ds.find((other) => other.name === asset.name) === undefined) {
      uniqueAssets.field3ds.push(asset);
    }
  });
  assets.robots.forEach((asset) => {
    if (uniqueAssets.robots.find((other) => other.name === asset.name) === undefined) {
      uniqueAssets.robots.push(asset);
    }
  });
  assets.joysticks.forEach((asset) => {
    if (uniqueAssets.joysticks.find((other) => other.name === asset.name) === undefined) {
      uniqueAssets.joysticks.push(asset);
    }
  });
  assets = uniqueAssets;

  // Sort assets
  assets.field2ds.sort((a, b) => (a.name > b.name ? -1 : b.name > a.name ? 1 : 0));
  assets.field3ds.sort((a, b) => (a.name > b.name ? -1 : b.name > a.name ? 1 : 0));
  assets.robots.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  assets.joysticks.sort((a, b) => (a.name > b.name ? -1 : b.name > a.name ? 1 : 0));

  return assets;
}
