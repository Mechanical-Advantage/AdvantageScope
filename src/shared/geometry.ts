import Log from "./log/Log";
import { getOrDefault, getRobotStateRanges } from "./log/LogUtil";
import LoggableType from "./log/LoggableType";
import { convert } from "./units";
import { indexArray, jsonCopy, scaleValue } from "./util";

export type Translation2d = [number, number]; // meters (x, y)
export type Rotation2d = number; // radians
export type Pose2d = {
  translation: Translation2d;
  rotation: Rotation2d;
};
export const Translation2dZero: Translation2d = [0, 0];
export const Rotation2dZero: Rotation2d = 0;
export const Pose2dZero: Pose2d = {
  translation: Translation2dZero,
  rotation: Rotation2dZero
};

export type Translation3d = [number, number, number]; // meters (x, y, z)
export type Rotation3d = [number, number, number, number]; // radians (w, x, y, z)
export type Pose3d = {
  translation: Translation3d;
  rotation: Rotation3d;
};
export const Translation3dZero: Translation3d = [0, 0, 0];
export const Rotation3dZero: Rotation3d = [1, 0, 0, 0];
export const Pose3dZero: Pose3d = {
  translation: Translation3dZero,
  rotation: Rotation3dZero
};

export type AnnotatedPose2d = {
  pose: Pose2d;
  annotation: PoseAnnotations;
};
export type AnnotatedPose3d = {
  pose: Pose3d;
  annotation: PoseAnnotations;
};
export type PoseAnnotations = {
  is2DSource: boolean;
  zebraTeam?: number;
  zebraAlliance?: "blue" | "red";
  aprilTagId?: number;
  visionColor?: string;
  visionSize?: string;
};

export type SwerveState = { speed: number; angle: Rotation2d };
export type ChassisSpeeds = { vx: number; vy: number; omega: number };

export const APRIL_TAG_36H11_COUNT = 587;
export const APRIL_TAG_16H5_COUNT = 30;
export const APRIL_TAG_36H11_SIZE = convert(8.125, "inches", "meters");
export const APRIL_TAG_16H5_SIZE = convert(8, "inches", "meters");
export const HEATMAP_DT = 0.25;

// FORMAT CONVERSION UTILITIES

export function translation2dTo3d(input: Translation2d): Translation3d {
  return [...input, 0];
}

export function translation3dTo2d(input: Translation3d): Translation2d {
  return [input[0], input[1]];
}

export function rotation2dTo3d(input: Rotation2d): Rotation3d {
  // https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles#Euler_angles_to_quaternion_conversion
  return [Math.cos(input * 0.5), 0, 0, Math.sin(input * 0.5)];
}

export function rotation3dTo2d(input: Rotation3d): Rotation2d {
  // https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles#Quaternion_to_Euler_angles_(in_3-2-1_sequence)_conversion
  return Math.atan2(
    2.0 * (input[0] * input[3] + input[1] * input[2]),
    1.0 - 2.0 * (input[2] * input[2] + input[3] * input[3])
  );
}

export function rotation3dToRPY(input: Rotation3d): [number, number, number] {
  let w = input[0];
  let x = input[1];
  let y = input[2];
  let z = input[3];

  let roll = 0;
  let pitch = 0;
  let yaw = 0;

  // wpimath/algorithms.md
  {
    let cxcy = 1.0 - 2.0 * (x * x + y * y);
    let sxcy = 2.0 * (w * x + y * z);
    let cy_sq = cxcy * cxcy + sxcy * sxcy;
    if (cy_sq > 1e-20) {
      roll = Math.atan2(sxcy, cxcy);
    }
  }
  {
    let ratio = 2.0 * (w * y - z * x);
    if (Math.abs(ratio) >= 1.0) {
      pitch = (Math.PI / 2.0) * Math.sign(ratio);
    } else {
      pitch = Math.asin(ratio);
    }
  }
  {
    let cycz = 1.0 - 2.0 * (y * y + z * z);
    let cysz = 2.0 * (w * z + x * y);
    let cy_sq = cycz * cycz + cysz * cysz;
    if (cy_sq > 1e-20) {
      yaw = Math.atan2(cysz, cycz);
    } else {
      yaw = Math.atan2(2.0 * w * z, w * w - z * z);
    }
  }
  return [roll, pitch, yaw];
}

export function pose2dTo3d(input: Pose2d): Pose3d {
  return {
    translation: translation2dTo3d(input.translation),
    rotation: rotation2dTo3d(input.rotation)
  };
}

export function pose3dTo2d(input: Pose3d): Pose2d {
  return {
    translation: translation3dTo2d(input.translation),
    rotation: rotation3dTo2d(input.rotation)
  };
}

export function annotatedPose2dTo3d(input: AnnotatedPose2d): AnnotatedPose3d {
  return {
    pose: {
      translation: translation2dTo3d(input.pose.translation),
      rotation: rotation2dTo3d(input.pose.rotation)
    },
    annotation: input.annotation
  };
}

export function annotatedPose3dTo2d(input: AnnotatedPose3d): AnnotatedPose2d {
  return {
    pose: {
      translation: translation3dTo2d(input.pose.translation),
      rotation: rotation3dTo2d(input.pose.rotation)
    },
    annotation: input.annotation
  };
}

// LOG READING UTILITIES

export function grabPosesAuto(
  log: Log,
  key: string,
  logType: string,
  timestamp: number,
  uuid?: string,
  numberArrayFormat?: "Translation2d" | "Translation3d" | "Pose2d" | "Pose3d",
  numberArrayUnits?: "radians" | "degrees",
  zebraOrigin?: "blue" | "red",
  zebraFieldWidth?: number,
  zebraFieldHeight?: number
): AnnotatedPose3d[] {
  switch (logType) {
    case "Number":
      return grabNumberRotation(log, key, timestamp, numberArrayUnits, uuid);
    case "NumberArray":
      if (numberArrayFormat !== undefined) {
        return grabNumberArray(log, key, timestamp, numberArrayFormat, numberArrayUnits, uuid);
      } else {
        return [];
      }
    case "Rotation2d":
      return grabRotation2d(log, key, timestamp, uuid);
    case "Rotation3d":
      return grabRotation3d(log, key, timestamp, uuid);
    case "Rotation2d[]":
      return grabRotation2dArray(log, key, timestamp, uuid);
    case "Rotation3d[]":
      return grabRotation3dArray(log, key, timestamp, uuid);
    case "Translation2d":
      return grabTranslation2d(log, key, timestamp, uuid);
    case "Translation3d":
      return grabTranslation3d(log, key, timestamp, uuid);
    case "Translation2d[]":
      return grabTranslation2dArray(log, key, timestamp, uuid);
    case "Translation3d[]":
      return grabTranslation3dArray(log, key, timestamp, uuid);
    case "Pose2d":
    case "Transform2d":
      return grabPose2d(log, key, timestamp, uuid);
    case "Pose3d":
    case "Transform3d":
      return grabPose3d(log, key, timestamp, uuid);
    case "Pose2d[]":
    case "Transform2d[]":
      return grabPose2dArray(log, key, timestamp, uuid);
    case "Pose3d[]":
    case "Transform3d[]":
      return grabPose3dArray(log, key, timestamp, uuid);
    case "Trajectory":
      return grabTrajectory(log, key, timestamp, uuid);
    case "ZebraTranslation":
      if (zebraOrigin !== undefined && zebraFieldWidth !== undefined && zebraFieldHeight !== undefined) {
        return grabZebraTranslation(log, key, timestamp, zebraOrigin, zebraFieldWidth, zebraFieldHeight, uuid);
      } else {
        return [];
      }
    default:
      return [];
  }
}

export function grabNumberRotation(
  log: Log,
  key: string,
  timestamp: number,
  unit?: "radians" | "degrees",
  uuid?: string
): AnnotatedPose3d[] {
  let value = getOrDefault(log, key, LoggableType.Number, timestamp, 0, uuid);
  if (unit === "degrees") {
    value = convert(value, "degrees", "radians");
  }
  return [
    {
      pose: {
        translation: Translation3dZero,
        rotation: rotation2dTo3d(value)
      },
      annotation: {
        is2DSource: true
      }
    }
  ];
}

export function grabNumberArray(
  log: Log,
  key: string,
  timestamp: number,
  format: "Translation2d" | "Translation3d" | "Pose2d" | "Pose3d",
  unit?: "radians" | "degrees",
  uuid?: string
): AnnotatedPose3d[] {
  let value = getOrDefault(log, key, LoggableType.NumberArray, timestamp, [], uuid);
  let poses: AnnotatedPose3d[] = [];
  let finalUnit: "radians" | "degrees" = unit === "degrees" ? "degrees" : "radians";
  switch (format) {
    case "Translation2d":
      for (let i = 0; i < value.length - 1; i += 2) {
        poses.push({
          pose: {
            translation: translation2dTo3d([value[i], value[i + 1]]),
            rotation: Rotation3dZero
          },
          annotation: {
            is2DSource: true
          }
        });
      }
      break;
    case "Translation3d":
      for (let i = 0; i < value.length - 2; i += 3) {
        poses.push({
          pose: {
            translation: [value[i], value[i + 1], value[i + 2]],
            rotation: Rotation3dZero
          },
          annotation: {
            is2DSource: false
          }
        });
      }
      break;
    case "Pose2d":
      for (let i = 0; i < value.length - 2; i += 3) {
        poses.push({
          pose: pose2dTo3d({
            translation: [value[i], value[i + 1]],
            rotation: convert(value[i + 2], finalUnit, "radians")
          }),
          annotation: {
            is2DSource: true
          }
        });
      }
      break;
    case "Pose3d":
      for (let i = 0; i < value.length - 6; i += 7) {
        poses.push({
          pose: {
            translation: [value[i], value[i + 1], value[i + 2]],
            rotation: [value[i + 3], value[i + 4], value[i + 5], value[i + 6]]
          },
          annotation: {
            is2DSource: false
          }
        });
      }
      break;
  }
  return poses;
}

export function grabRotation2d(log: Log, key: string, timestamp: number, uuid?: string): AnnotatedPose3d[] {
  return [
    {
      pose: {
        translation: Translation3dZero,
        rotation: rotation2dTo3d(getOrDefault(log, key + "/value", LoggableType.Number, timestamp, 0, uuid))
      },
      annotation: {
        is2DSource: true
      }
    }
  ];
}

export function grabRotation3d(log: Log, key: string, timestamp: number, uuid?: string): AnnotatedPose3d[] {
  return [
    {
      pose: {
        translation: Translation3dZero,
        rotation: [
          getOrDefault(log, key + "/q/w", LoggableType.Number, timestamp, 0, uuid),
          getOrDefault(log, key + "/q/x", LoggableType.Number, timestamp, 0, uuid),
          getOrDefault(log, key + "/q/y", LoggableType.Number, timestamp, 0, uuid),
          getOrDefault(log, key + "/q/z", LoggableType.Number, timestamp, 0, uuid)
        ]
      },
      annotation: { is2DSource: false }
    }
  ];
}

export function grabRotation2dArray(log: Log, key: string, timestamp: number, uuid?: string): AnnotatedPose3d[] {
  return indexArray(getOrDefault(log, key + "/length", LoggableType.Number, timestamp, 0, uuid)).reduce(
    (array, index) => array.concat(grabRotation2d(log, key + "/" + index.toString(), timestamp)),
    [] as AnnotatedPose3d[]
  );
}

export function grabRotation3dArray(log: Log, key: string, timestamp: number, uuid?: string): AnnotatedPose3d[] {
  return indexArray(getOrDefault(log, key + "/length", LoggableType.Number, timestamp, 0, uuid)).reduce(
    (array, index) => array.concat(grabRotation3d(log, key + "/" + index.toString(), timestamp)),
    [] as AnnotatedPose3d[]
  );
}

export function grabTranslation2d(log: Log, key: string, timestamp: number, uuid?: string): AnnotatedPose3d[] {
  return [
    {
      pose: {
        translation: translation2dTo3d([
          getOrDefault(log, key + "/x", LoggableType.Number, timestamp, 0, uuid),
          getOrDefault(log, key + "/y", LoggableType.Number, timestamp, 0, uuid)
        ]),
        rotation: Rotation3dZero
      },
      annotation: { is2DSource: true }
    }
  ];
}

export function grabTranslation3d(log: Log, key: string, timestamp: number, uuid?: string): AnnotatedPose3d[] {
  return [
    {
      pose: {
        translation: [
          getOrDefault(log, key + "/x", LoggableType.Number, timestamp, 0, uuid),
          getOrDefault(log, key + "/y", LoggableType.Number, timestamp, 0, uuid),
          getOrDefault(log, key + "/z", LoggableType.Number, timestamp, 0, uuid)
        ],
        rotation: Rotation3dZero
      },
      annotation: { is2DSource: false }
    }
  ];
}

export function grabTranslation2dArray(log: Log, key: string, timestamp: number, uuid?: string): AnnotatedPose3d[] {
  return indexArray(getOrDefault(log, key + "/length", LoggableType.Number, timestamp, 0, uuid)).reduce(
    (array, index) => array.concat(grabTranslation2d(log, key + "/" + index.toString(), timestamp)),
    [] as AnnotatedPose3d[]
  );
}

export function grabTranslation3dArray(log: Log, key: string, timestamp: number, uuid?: string): AnnotatedPose3d[] {
  return indexArray(getOrDefault(log, key + "/length", LoggableType.Number, timestamp, 0, uuid)).reduce(
    (array, index) => array.concat(grabTranslation3d(log, key + "/" + index.toString(), timestamp)),
    [] as AnnotatedPose3d[]
  );
}

export function grabPose2d(log: Log, key: string, timestamp: number, uuid?: string): AnnotatedPose3d[] {
  return [
    {
      pose: pose2dTo3d({
        translation: [
          getOrDefault(log, key + "/translation/x", LoggableType.Number, timestamp, 0, uuid),
          getOrDefault(log, key + "/translation/y", LoggableType.Number, timestamp, 0, uuid)
        ],
        rotation: getOrDefault(log, key + "/rotation/value", LoggableType.Number, timestamp, 0, uuid)
      }),
      annotation: { is2DSource: true }
    }
  ];
}

export function grabPose3d(log: Log, key: string, timestamp: number, uuid?: string): AnnotatedPose3d[] {
  return [
    {
      pose: {
        translation: [
          getOrDefault(log, key + "/translation/x", LoggableType.Number, timestamp, 0, uuid),
          getOrDefault(log, key + "/translation/y", LoggableType.Number, timestamp, 0, uuid),
          getOrDefault(log, key + "/translation/z", LoggableType.Number, timestamp, 0, uuid)
        ],
        rotation: [
          getOrDefault(log, key + "/rotation/q/w", LoggableType.Number, timestamp, 0, uuid),
          getOrDefault(log, key + "/rotation/q/x", LoggableType.Number, timestamp, 0, uuid),
          getOrDefault(log, key + "/rotation/q/y", LoggableType.Number, timestamp, 0, uuid),
          getOrDefault(log, key + "/rotation/q/z", LoggableType.Number, timestamp, 0, uuid)
        ]
      },
      annotation: { is2DSource: false }
    }
  ];
}

export function grabPose2dArray(log: Log, key: string, timestamp: number, uuid?: string): AnnotatedPose3d[] {
  return indexArray(getOrDefault(log, key + "/length", LoggableType.Number, timestamp, 0, uuid)).reduce(
    (array, index) => array.concat(grabPose2d(log, key + "/" + index.toString(), timestamp)),
    [] as AnnotatedPose3d[]
  );
}

export function grabPose3dArray(log: Log, key: string, timestamp: number, uuid?: string): AnnotatedPose3d[] {
  return indexArray(getOrDefault(log, key + "/length", LoggableType.Number, timestamp, 0, uuid)).reduce(
    (array, index) => array.concat(grabPose3d(log, key + "/" + index.toString(), timestamp)),
    [] as AnnotatedPose3d[]
  );
}

export function grabTrajectory(log: Log, key: string, timestamp: number, uuid?: string): AnnotatedPose3d[] {
  return indexArray(getOrDefault(log, key + "/states/length", LoggableType.Number, timestamp, 0, uuid)).reduce(
    (array, index) => array.concat(grabPose3d(log, key + "/states/" + index.toString() + "/pose", timestamp)),
    [] as AnnotatedPose3d[]
  );
}

export function grabAprilTag(log: Log, key: string, timestamp: number, uuid?: string): AnnotatedPose3d[] {
  return [
    {
      pose: {
        translation: [
          getOrDefault(log, key + "/pose/translation/x", LoggableType.Number, timestamp, 0, uuid),
          getOrDefault(log, key + "/pose/translation/y", LoggableType.Number, timestamp, 0, uuid),
          getOrDefault(log, key + "/pose/translation/z", LoggableType.Number, timestamp, 0, uuid)
        ],
        rotation: [
          getOrDefault(log, key + "/pose/rotation/q/w", LoggableType.Number, timestamp, 0, uuid),
          getOrDefault(log, key + "/pose/rotation/q/x", LoggableType.Number, timestamp, 0, uuid),
          getOrDefault(log, key + "/pose/rotation/q/y", LoggableType.Number, timestamp, 0, uuid),
          getOrDefault(log, key + "/pose/rotation/q/z", LoggableType.Number, timestamp, 0, uuid)
        ]
      },
      annotation: {
        aprilTagId: getOrDefault(log, key + "/ID", LoggableType.Number, timestamp, undefined, uuid),
        is2DSource: false
      }
    }
  ];
}

export function grabAprilTagArray(log: Log, key: string, timestamp: number, uuid?: string): AnnotatedPose3d[] {
  return indexArray(getOrDefault(log, key + "/length", LoggableType.Number, timestamp, 0, uuid)).reduce(
    (array, index) => array.concat(grabAprilTag(log, key + "/" + index.toString(), timestamp)),
    [] as AnnotatedPose3d[]
  );
}

export function grabZebraTranslation(
  log: Log,
  key: string,
  timestamp: number,
  origin: "blue" | "red",
  fieldWidth: number,
  fieldHeight: number,
  uuid?: string
): AnnotatedPose3d[] {
  let x: number | null = null;
  let y: number | null = null;
  {
    let xData = window.log.getNumber(key + "/x", timestamp, timestamp);
    if (xData !== undefined && xData.values.length > 0) {
      if (xData.values.length === 1) {
        x = xData.values[0];
      } else {
        x = scaleValue(timestamp, [xData.timestamps[0], xData.timestamps[1]], [xData.values[0], xData.values[1]]);
      }
    }
  }
  {
    let yData = window.log.getNumber(key + "/y", timestamp, timestamp);
    if (yData !== undefined && yData.values.length > 0) {
      if (yData.values.length === 1) {
        y = yData.values[0];
      } else {
        y = scaleValue(timestamp, [yData.timestamps[0], yData.timestamps[1]], [yData.values[0], yData.values[1]]);
      }
    }
  }
  if (x === null || y === null) return [];
  x = convert(x, "feet", "meters");
  y = convert(y, "feet", "meters");

  let alliance: "blue" | "red" =
    getOrDefault(log, key + "/alliance", LoggableType.String, Infinity, 0, uuid) === "red" ? "red" : "blue"; // Read alliance from end of log
  let splitKey = key.split("FRC");
  let teamNumber = splitKey.length > 1 ? Number(splitKey[splitKey.length - 1]) : undefined;

  // Zebra always uses red origin, convert translation
  if (origin === "blue") {
    x = fieldWidth - x;
    y = fieldHeight - y;
  }
  return [
    {
      pose: pose2dTo3d({
        translation: [x, y],
        rotation: Rotation2dZero
      }),
      annotation: {
        zebraAlliance: alliance,
        zebraTeam: teamNumber,
        is2DSource: true
      }
    }
  ];
}

export function grabHeatmapData(
  log: Log,
  key: string,
  logType: string,
  timeRange: "enabled" | "auto" | "teleop" | "teleop-no-endgame" | "full",
  uuid?: string,
  numberArrayFormat?: "Translation2d" | "Translation3d" | "Pose2d" | "Pose3d",
  numberArrayUnits?: "radians" | "degrees",
  zebraOrigin?: "blue" | "red",
  zebraFieldWidth?: number,
  zebraFieldHeight?: number
): AnnotatedPose3d[] {
  let poses: AnnotatedPose3d[] = [];
  let isFullLog = timeRange === "full";
  let stateRanges = isFullLog ? null : getRobotStateRanges(log);
  let isValid = (timestamp: number) => {
    if (isFullLog) return true;
    if (stateRanges === null) return false;
    let currentRange = stateRanges.findLast((range) => range.start <= timestamp);
    switch (timeRange) {
      case "enabled":
        return currentRange?.mode !== "disabled";
      case "auto":
        return currentRange?.mode === "auto";
      case "teleop":
        return currentRange?.mode === "teleop";
      case "teleop-no-endgame":
        return currentRange?.mode === "teleop" && currentRange?.end !== undefined && currentRange?.end - timestamp > 30;
    }
  };
  for (let sampleTime = log.getTimestampRange()[0]; sampleTime < log.getTimestampRange()[1]; sampleTime += HEATMAP_DT) {
    if (!isValid(sampleTime)) continue;
    poses = poses.concat(
      grabPosesAuto(
        log,
        key,
        logType,
        sampleTime,
        uuid,
        numberArrayFormat,
        numberArrayUnits,
        zebraOrigin,
        zebraFieldWidth,
        zebraFieldHeight
      )
    );
  }
  return poses;
}

export function grabSwerveStates(
  log: Log,
  key: string,
  logType: string,
  timestamp: number,
  arrangement?: string,
  rotationUnits: "radians" | "degrees" = "radians",
  uuid?: string
): SwerveState[] {
  let states: SwerveState[] = [];
  switch (logType) {
    case "NumberArray":
      {
        let value: number[] = getOrDefault(log, key, LoggableType.NumberArray, timestamp, [], uuid);
        for (let i = 0; i < value.length - 1; i += 2) {
          states.push({
            speed: value[i + 1],
            angle: convert(value[i], rotationUnits, "radians")
          });
        }
      }
      break;

    case "SwerveModuleState[]":
      {
        let length = getOrDefault(log, key + "/length", LoggableType.Number, timestamp, 0, uuid);
        for (let i = 0; i < length; i++) {
          states.push({
            speed: getOrDefault(log, key + "/" + i.toString() + "/speed", LoggableType.Number, timestamp, 0, uuid),
            angle: getOrDefault(log, key + "/" + i.toString() + "/angle/value", LoggableType.Number, timestamp, 0, uuid)
          });
        }
      }
      break;
  }

  // Apply arrangement
  if (states.length === 4 && arrangement !== undefined) {
    let originalStates = jsonCopy(states);
    arrangement
      .split(",")
      .map((x) => Number(x))
      .forEach((sourceIndex, targetIndex) => {
        states[targetIndex] = originalStates[sourceIndex];
      });
  }

  return states;
}

export function grabChassiSpeeds(log: Log, key: string, timestamp: number, uuid?: string): ChassisSpeeds {
  return {
    vx: getOrDefault(log, key + "/vx", LoggableType.Number, timestamp, 0, uuid),
    vy: getOrDefault(log, key + "/vy", LoggableType.Number, timestamp, 0, uuid),
    omega: getOrDefault(log, key + "/omega", LoggableType.Number, timestamp, 0, uuid)
  };
}
