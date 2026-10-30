import re


def cut(s, start, end, repl=""):
    i = s.index(start)
    j = s.index(end, i)
    return s[:i] + repl + s[j:]


def rep(s, a, b=""):
    assert a in s, a[:100]
    return s.replace(a, b)


def edit(p, fn):
    s = open(p).read()
    s = fn(s)
    open(p, "w").write(s)


# ---------- AdvantageScopeAssets ----------
def assets(s):
    s = cut(s, "export const ALLIANCE_STATION_WIDTH", "export interface AdvantageScopeAssets")
    s = cut(
        s,
        "export type CoordinateSystem =",
        "export interface Config2d {",
        """/**
 * All poses use a single right-handed coordinate system: origin at the center
 * of the field, +X forward, +Y left, +Z up.
 */

""",
    )
    s = s.replace("  coordinateSystem: CoordinateSystem;\n", "")
    s = s.replace("  driverStations: [number, number][];\n", "")
    s = s.replace('    coordinateSystem: "center-red",\n', "")
    s = s.replace("    driverStations: DEFAULT_DRIVER_STATIONS_FRC,\n", "")
    s = s.replace("    driverStations: DEFAULT_DRIVER_STATIONS_FTC,\n", "")
    return s


edit("src/shared/AdvantageScopeAssets.ts", assets)


# EvergreenField still needs ALLIANCE_STATION_WIDTH for its geometry
def evergreen(s):
    s = rep(
        s,
        """import {
  ALLIANCE_STATION_WIDTH,
  FRC_STANDARD_FIELD_LENGTH,""",
        """import {
  FRC_STANDARD_FIELD_LENGTH,""",
    )
    s = rep(
        s,
        """  let field = new THREE.Group();
  const blueColor = 0x6379a6;
  const redColor = 0xa66363;
""",
        """  let field = new THREE.Group();
  const endWallColor = 0x6e747c; // Neutral (no alliance colors)
""",
    )
    s = s.replace("x < 0 ? redColor : blueColor", "endWallColor")
    s = rep(s, "    const allianceStationWidth = ALLIANCE_STATION_WIDTH;\n", '    const allianceStationWidth = Units.convert(69, "inches", "meters");\n')
    return s


edit("src/shared/renderers/field3d/EvergreenField.ts", evergreen)


def axes(s):
    s = rep(s, "  CoordinateSystem,\n")
    s = rep(s, "  coorindateSystem: CoordinateSystem,\n")
    s = cut(
        s,
        "  switch (coorindateSystem) {",
        "  let outline = new THREE.Line(",
        "  axes.position.set(0, 0, 0);\n\n",
    )
    return s


edit("src/shared/renderers/field3d/AxesField.ts", axes)


# ---------- geometry ----------
def geometry(s):
    s = rep(s, 'import { Config3d_Rotation, CoordinateSystem } from "./AdvantageScopeAssets";', 'import { Config3d_Rotation } from "./AdvantageScopeAssets";')
    s = cut(s, "// COORDINATE SYSTEM CONVERSION\n", "// LOG READING UTILITIES")
    return s


edit("src/shared/geometry.ts", geometry)


# ---------- assetUtil ----------
def assetutil(s):
    s = s.replace('    coordinateSystem: "center-red",\n', "")
    s = s.replace("    driverStations: DEFAULT_DRIVER_STATIONS_FRC,\n", "")
    block = """  if (
    "coordinateSystem" in configRaw &&
    typeof configRaw.coordinateSystem === "string" &&
    (configRaw.coordinateSystem === "wall-alliance" ||
      configRaw.coordinateSystem === "wall-blue" ||
      configRaw.coordinateSystem === "center-rotated" ||
      configRaw.coordinateSystem === "center-red")
  ) {
    config.coordinateSystem = configRaw.coordinateSystem;
  }
"""
    assert s.count(block) == 2
    s = s.replace(block, "")
    s = rep(
        s,
        """    config.isFTC = configRaw.isFTC;
    if (config.isFTC) {
      config.driverStations = DEFAULT_DRIVER_STATIONS_FTC;
    }
""",
        """    config.isFTC = configRaw.isFTC;
""",
    )
    s = rep(
        s,
        """  if (
    "driverStations" in configRaw &&
    Array.isArray(configRaw.driverStations) &&
    configRaw.driverStations.length === (config.isFTC ? 4 : 6) &&
    configRaw.driverStations.every((position) => checkArrayType(position, "number") && position.length === 2)
  ) {
    config.driverStations = configRaw.driverStations;
  }
""",
    )
    s = re.sub(r"  DEFAULT_DRIVER_STATIONS_FRC,\n", "", s)
    s = re.sub(r"  DEFAULT_DRIVER_STATIONS_FTC,\n", "", s)
    return s


edit("src/main/assetUtil.ts", assetutil)


# ---------- Preferences ----------
def prefs(s):
    s = rep(s, 'import { CoordinateSystem } from "./AdvantageScopeAssets";\n\n')
    s = rep(s, '  coordinateSystem: "automatic" | CoordinateSystem;\n')
    s = rep(s, "  skipFRCCoordinateSystemWarning: boolean;\n  skipFTCCoordinateSystemWarning: boolean;\n")
    s = rep(s, '  coordinateSystem: "automatic",\n')
    s = rep(s, "  skipFRCCoordinateSystemWarning: false,\n  skipFTCCoordinateSystemWarning: false,\n")
    s = cut(s, '  if (\n    "coordinateSystem" in newPrefs', "  if (\n    \"threeDimensionModeAc\" in newPrefs")
    s = cut(s, '  if ("skipFRCCoordinateSystemWarning" in newPrefs', '  if ("hasScrolledLineGraph" in newPrefs')
    return s


edit("src/shared/Preferences.ts", prefs)


def prefsui(s):
    s = rep(s, 'import { CoordinateSystem } from "./shared/AdvantageScopeAssets";\n')
    s = rep(s, 'const COORDINATE_SYSTEM = document.getElementById("coordinateSystem") as HTMLInputElement;\n')
    s = rep(s, "      COORDINATE_SYSTEM.value = oldPrefs.coordinateSystem;\n")
    s = cut(s, '          let coordinateSystem: "automatic" | CoordinateSystem = "automatic";', '          if (COORDINATE_SYSTEM.value === "center-red") coordinateSystem = "center-red";\n')
    s = rep(s, '          if (COORDINATE_SYSTEM.value === "center-red") coordinateSystem = "center-red";\n')
    s = rep(s, "            coordinateSystem: coordinateSystem,\n")
    s = rep(s, "            skipFRCCoordinateSystemWarning: oldPrefs.skipFRCCoordinateSystemWarning,\n            skipFTCCoordinateSystemWarning: oldPrefs.skipFTCCoordinateSystemWarning,\n")
    return s


edit("src/preferences.ts", prefsui)
edit(
    "www/preferences.html",
    lambda s: cut(s, '        <tr>\n          <td class="label">Coordinate System</td>', '        <tr>\n          <td class="label">Timestamps</td>'),
)


# ---------- main / lite warnings + camera popups ----------
def mainw(s):
    s = cut(s, '    case "frc-coordinate-system-warning":', '    case "live-rlog-start":')
    s = cut(
        s,
        """  cameraMenu.append(
    new MenuItem({
      label: isFTC ? "Driver View" : "Driver Station",""",
        """  cameraMenu.append(
    new MenuItem({
      label: "Set FOV...",""",
    )
    return s


edit("src/main/electron/main.ts", mainw)


def litew(s):
    s = cut(s, '    case "frc-coordinate-system-warning":', '    case "historical-start":')
    i = s.index('            content: isFTC ? "Driver View" : "Driver Station",')
    i = s.rindex("          {\n", 0, i)
    # find end of this menu entry: the matching "          }," at same indent after the items array
    j = s.index("\n          },\n", i) + len("\n          },\n")
    # the nested items contain "          }," only at deeper indent (with more spaces), so this is the end
    s = s[:i] + s[j:]
    return s


edit("src/main/lite/main.ts", litew)


# ---------- Field2dController ----------
def f2d(s):
    s = rep(s, '  private lastCoordinateSystemAlert: "none" | "frc" | "ftc" = "none";\n')
    s = cut(s, "    let coordinateSystem =\n", "    // Get objects\n")
    s = rep(
        s,
        """            if (fieldData !== undefined) {
              poses = convertFromCoordinateSystem(
                poses,
                coordinateSystem,
                isRedAlliance ? "red" : "blue",
                fieldWidth,
                fieldHeight
              );
            }
""",
    )
    s = rep(
        s,
        """      // Apply coordinate system
      if (fieldData !== undefined) {
        poses = convertFromCoordinateSystem(
          poses,
          coordinateSystem,
          isRedAlliance ? "red" : "blue",
          fieldWidth,
          fieldHeight
        );
        visionTargets = convertFromCoordinateSystem(
          visionTargets,
          coordinateSystem,
          isRedAlliance ? "red" : "blue",
          fieldWidth,
          fieldHeight
        );
      }

""",
    )
    s = rep(
        s,
        """            bumperColor:
              source.options.bumpers === "" ? (isRedAlliance ? "#ff0000" : "#0000ff") : source.options.bumpers,""",
        """            bumperColor: source.options.bumpers,""",
    )
    s = rep(s, "    return [...this.sourceList.getActiveFields(), ...ALLIANCE_KEYS];", "    return this.sourceList.getActiveFields();")
    s = rep(s, 'import { ALLIANCE_KEYS, getIsRedAlliance } from "../../shared/log/RobotState";\n')
    s = rep(s, "  convertFromCoordinateSystem,\n")
    # Robot size buttons
    s = rep(s, "  private SIZE_SWITCHER: HTMLElement;\n")
    s = rep(s, '  private sizeSetting: "large" | "medium" | "small" = "large";\n')
    s = rep(s, '    this.SIZE_SWITCHER = this.SETTINGS.getElementsByClassName("size-switcher")[0] as HTMLElement;\n')
    s = rep(
        s,
        """    (["large", "medium", "small"] as const).forEach((value, index) => {
      setupKeyboardControls(this.SIZE_SWITCHER.children[index] as HTMLElement);
      this.SIZE_SWITCHER.children[index].addEventListener("click", () => {
        this.sizeSetting = value;
        this.updateSwitchers();
      });
    });
    this.updateSwitchers();
""",
    )
    s = cut(s, "  /** Updates the switcher elements to match the internal state. */", "  saveState(): unknown {")
    s = rep(s, ",\n      size: this.sizeSetting\n", "\n")
    s = rep(
        s,
        """    if ("size" in state && (state.size === "large" || state.size === "medium" || state.size === "small")) {
      this.sizeSetting = state.size;
    }
""",
    )
    s = rep(s, "    this.updateFieldDependentControls();\n    this.updateSwitchers();\n", "    this.updateFieldDependentControls();\n")
    s = cut(
        s,
        "    // Get size setting\n",
        "    objects.reverse();",
        "    // Robot footprint size in inches (FRC default robot frame size)\n    let size = fieldData?.isFTC ? 18 : Field2dController.ROBOT_SIZE_INCHES;\n\n",
    )
    s = rep(s, "  private SETTINGS: HTMLElement;\n", "  private static ROBOT_SIZE_INCHES = 30;\n\n  private SETTINGS: HTMLElement;\n") if "  private SETTINGS: HTMLElement;\n" in s else s
    return s


edit("src/hub/controllers/Field2dController.ts", f2d)


def f2dcfg(s):
    s = rep(s, 'values: [{ key: "", display: "Alliance Color" }, ...NeonColors]', "values: NeonColors")
    return s


edit("src/hub/controllers/Field2dController_Config.ts", f2dcfg)


def f2dhtml(s):
    s = rep(
        s,
        """          <div class="title">
            <div class="half">Orientation</div>
            <div class="half">Size</div>
          </div>
          <div class="orientation input tall">
            <div class="half">""",
        """          <div class="title">
            <div class="full">Orientation</div>
          </div>
          <div class="orientation input tall">
            <div class="full">""",
    )
    i = s.index('            <div class="half">\n              <div class="size-switcher split split-3">')
    j = s.index("            </div>\n", s.index("</div>\n              </div>\n", i) + 10)
    # remove until the end of the size half div
    end_marker = """                <div tabindex="0" title="Small robot size">
                  <span class="frc-only">24</span>
                  <span class="ftc-only">14</span>
                </div>
              </div>
            </div>
"""
    k = s.index(end_marker, i) + len(end_marker)
    s = s[:i] + s[k:]
    s = s.replace('<optgroup label="FRC Fields"></optgroup>', '<optgroup label="Fields"></optgroup>')
    return s


edit("www/hub.html", f2dhtml)


# ---------- Field3dController ----------
def f3d(s):
    s = rep(s, 'import { ALLIANCE_KEYS, DRIVER_STATION_KEYS, getDriverStation, getIsRedAlliance } from "../../shared/log/RobotState";\n')
    s = rep(s, '  private lastCoordinateSystemAlert: "none" | "frc" | "ftc" = "none";\n')
    s = rep(s, "    return [...this.sourceList.getActiveFields(), ...ALLIANCE_KEYS, ...DRIVER_STATION_KEYS];", "    return this.sourceList.getActiveFields();")
    s = cut(s, "    let coordinateSystem =\n", "    let objects: Field3dRendererCommand_AnyObj[] = [];")
    s = rep(s, "      isRedAlliance: isRedAlliance,\n      coordinateSystem: coordinateSystem,\n")
    s = rep(s, "      autoDriverStation: getDriverStation(window.log, time!),\n")
    return s


edit("src/hub/controllers/Field3dController.ts", f3d)


def f3drenderer(s):
    s = rep(s, 'import { CoordinateSystem } from "../AdvantageScopeAssets";\n')
    s = rep(
        s,
        """// Most poses are still in their original coordinate system
// Heatmap poses are already converted to a center-red coordinate system
export type Field3dRendererCommand = {
  field: string;
  isRedAlliance: boolean;
  coordinateSystem: CoordinateSystem;
  objects: Field3dRendererCommand_AnyObj[];
  cameraOverride: AnnotatedPose3d | null;
  autoDriverStation: number;
  allRobotModels: string[];
};""",
        """// All poses use the field-centered coordinate system (+X forward, +Y left, +Z up)
export type Field3dRendererCommand = {
  field: string;
  objects: Field3dRendererCommand_AnyObj[];
  cameraOverride: AnnotatedPose3d | null;
  allRobotModels: string[];
};""",
    )
    return s


edit("src/shared/renderers/Field3dRenderer.ts", f3drenderer)


def heat(s):
    s = rep(s, 'import { annotatedPose3dTo2d, convertFromCoordinateSystem } from "../../../geometry";', 'import { annotatedPose3dTo2d } from "../../../geometry";')
    s = rep(s, "  private isRedAlliance = false;\n")
    s = rep(
        s,
        """  setIsRedAlliance(isRedAlliance: boolean) {
    this.isRedAlliance = isRedAlliance;
  }

""",
    )
    s = rep(
        s,
        """    let coordinateSystem =
      (window.preferences?.coordinateSystem === "automatic"
        ? fieldConfig.coordinateSystem
        : window.preferences?.coordinateSystem) ?? "center-red";
    let translations = object.poses.map(
      (x) =>
        convertFromCoordinateSystem(
          annotatedPose3dTo2d(x),
          coordinateSystem,
          this.isRedAlliance ? "red" : "blue",
          fieldDimensions[0],
          fieldDimensions[1]
        ).pose.translation
    );""",
        """    let translations = object.poses.map((x) => annotatedPose3dTo2d(x).pose.translation);""",
    )
    return s


edit("src/shared/renderers/field3d/objectManagers/HeatmapManager.ts", heat)


def impl(s):
    s = rep(s, "import { AdvantageScopeAssets, BuiltIn3dFields, Config3dField, CoordinateSystem } from", "import { AdvantageScopeAssets, BuiltIn3dFields, Config3dField } from")
    s = rep(s, "  private lastCoordinateSystem: CoordinateSystem | null = null;\n")
    s = rep(
        s,
        """    // Update field if currently axes and coordinate system changes
    if (
      command.coordinateSystem !== this.lastCoordinateSystem &&
      this.lastCoordinateSystem !== null &&
      (command.field === "FRC:Axes" || command.field === "FTC:Axes")
    ) {
      this.shouldLoadNewField = true;
      this.shouldRender = true;
    }
    this.lastCoordinateSystem = command.coordinateSystem;

""",
    )
    s = cut(s, "    // Update field coordinates\n    switch (command.coordinateSystem) {", "    // Update field\n")
    s = rep(
        s,
        """        this.field = makeAxesField(
          this.MATERIAL_SPECULAR,
          this.MATERIAL_SHININESS,
          command.coordinateSystem,
          fieldId === "FTC:Axes"
        );""",
        """        this.field = makeAxesField(this.MATERIAL_SPECULAR, this.MATERIAL_SHININESS, fieldId === "FTC:Axes");""",
    )
    s = rep(
        s,
        """      if (entry.type === "heatmap") {
        (entry.manager as HeatmapManager).setIsRedAlliance(command.isRedAlliance);
      }
""",
    )
    # DS cameras
    s = rep(
        s,
        """  private DS_CAMERA_HEIGHT = Units.convert(62, "inches", "meters"); // https://www.ergocenter.ncsu.edu/wp-content/uploads/sites/18/2017/09/Anthropometric-Summary-Data-Tables.pdf
  private DS_CAMERA_OFFSET_FRC = 1.5; // Distance away from the glass
  private DS_CAMERA_TARGET_FTC = new THREE.Vector3(0, -0.2, 0);
""",
    )
    s = rep(s, "  private lastAutoDriverStation = -1;\n")
    s = rep(
        s,
        """    // Create DS camera object
    {
      this.dsCameraObj = new THREE.Object3D();
      this.dsCameraObj.position.set(-this.DS_CAMERA_OFFSET_FRC, 0.0, this.DS_CAMERA_HEIGHT);
      this.dsCameraGroup = new THREE.Group().add(this.dsCameraObj);
      this.wpilibCoordinateGroup.add(this.dsCameraGroup);
    }

""",
    )
    s = cut(
        s,
        "    } else {\n      // Driver Station\n",
        "  private getFieldConfig(",
        "    }\n  }\n\n",
    )
    s = rep(s, "      // Reset camera if switching between FRC and FTC, or if using DS camera\n      if ((fieldConfig.isFTC !== this.lastIsFTC && this.lastIsFTC !== null) || this.cameraIndex < -2) {", "      // Reset camera if switching between FRC and FTC\n      if (fieldConfig.isFTC !== this.lastIsFTC && this.lastIsFTC !== null) {")
    s = rep(s, "      let dsCamera = this.cameraIndex < CameraIndexEnum.OrbitRobot;\n")
    s = rep(s, "      if (orbitalCamera || dsCamera) {", "      if (orbitalCamera) {")
    s = rep(s, "        if (this.cameraIndex === CameraIndexEnum.OrbitField || dsCamera) {\n          // Reset to default origin", "        if (this.cameraIndex === CameraIndexEnum.OrbitField) {\n          // Reset to default origin")
    s = rep(
        s,
        """        if (
          this.cameraIndex !== this.lastCameraIndex ||
          (this.cameraIndex === CameraIndexEnum.DSAuto && this.lastAutoDriverStation !== command.autoDriverStation)
        ) {""",
        """        if (this.cameraIndex !== this.lastCameraIndex) {""",
    )
    s = rep(
        s,
        """      } else if (this.cameraIndex === CameraIndexEnum.DSAuto) {
        this.alert.hidden = command.autoDriverStation >= 0;
        this.alert.innerHTML = "Driver Station position</br>not available.";
      } else if (this.cameraIndex === CameraIndexEnum.OrbitField || dsCamera) {""",
        """      } else if (this.cameraIndex === CameraIndexEnum.OrbitField) {""",
    )
    s = rep(s, "      this.lastCameraIndex = this.cameraIndex;\n      this.lastAutoDriverStation = command.autoDriverStation;\n", "      this.lastCameraIndex = this.cameraIndex;\n")
    s = rep(
        s,
        """enum CameraIndexEnum {
  OrbitField = -1,
  OrbitRobot = -2,
  DSAuto = -3,
  DSB1 = -4,
  DSB2 = -5,
  DSB3 = -6,
  DSR1 = -7,
  DSR2 = -8,
  DSR3 = -9
}""",
        """enum CameraIndexEnum {
  OrbitField = -1,
  OrbitRobot = -2
}""",
    )
    return s


edit("src/shared/renderers/Field3dRendererImpl.ts", impl)
