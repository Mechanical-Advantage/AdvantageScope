import Log from "./log/Log";
import { getOrDefault } from "./log/LogUtil";
import LoggableType from "./log/LoggableType";
import { convert } from "./units";
import { indexArray } from "./util";

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
  zebraTeam?: number;
  zebraAlliance?: "blue" | "red";
  aprilTagId?: number;
};

export const APRIL_TAG_36H11_COUNT = 587;
export const APRIL_TAG_16H5_COUNT = 30;

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
  numberArrayFormat?: "Translation2d" | "Translation3d" | "Pose2d" | "Pose3d",
  numberArrayUnits?: "radians" | "degrees",
  zebraOrigin?: "blue" | "red",
  zebraFieldWidth?: number,
  zebraFieldHeight?: number
): AnnotatedPose3d[] {
  switch (logType) {
    case "NumberArray":
      if (numberArrayFormat !== undefined && numberArrayUnits !== undefined) {
        return grabNumberArray(log, key, timestamp, numberArrayFormat, numberArrayUnits);
      } else {
        return [];
      }
    case "Translation2d":
      return grabTranslation2d(log, key, timestamp);
    case "Translation3d":
      return grabTranslation3d(log, key, timestamp);
    case "Translation2d[]":
      return grabTranslation2dArray(log, key, timestamp);
    case "Translation3d[]":
      return grabTranslation3dArray(log, key, timestamp);
    case "Pose2d":
    case "Transform2d":
      return grabPose2d(log, key, timestamp);
    case "Pose3d":
    case "Transform3d":
      return grabPose3d(log, key, timestamp);
    case "Pose2d[]":
    case "Transform2d[]":
      return grabPose2dArray(log, key, timestamp);
    case "Pose3d[]":
    case "Transform3d[]":
      return grabPose3dArray(log, key, timestamp);
    case "Trajectory":
      return grabTrajectory(log, key, timestamp);
    case "ZebraTranslation":
      if (zebraOrigin !== undefined && zebraFieldWidth !== undefined && zebraFieldHeight !== undefined) {
        return grabZebraTranslation(log, key, timestamp, zebraOrigin, zebraFieldWidth, zebraFieldHeight);
      } else {
        return [];
      }
    default:
      return [];
  }
}

export function grabNumberArray(
  log: Log,
  key: string,
  timestamp: number,
  format: "Translation2d" | "Translation3d" | "Pose2d" | "Pose3d",
  unit?: "radians" | "degrees"
): AnnotatedPose3d[] {
  let value = getOrDefault(log, key, LoggableType.NumberArray, timestamp, []);
  let poses: AnnotatedPose3d[] = [];
  let finalUnit: "radians" | "degrees" = unit === "radians" ? "radians" : "degrees";
  switch (format) {
    case "Translation2d":
      for (let i = 0; i < value.length; i += 2) {
        poses.push({
          pose: {
            translation: translation2dTo3d([value[i], value[i + 1]]),
            rotation: Rotation3dZero
          },
          annotation: {}
        });
      }
      break;
    case "Translation3d":
      for (let i = 0; i < value.length; i += 3) {
        poses.push({
          pose: {
            translation: [value[i], value[i + 1], value[i + 2]],
            rotation: Rotation3dZero
          },
          annotation: {}
        });
      }
      break;
    case "Pose2d":
      for (let i = 0; i < value.length; i += 3) {
        poses.push({
          pose: pose2dTo3d({
            translation: [value[i], value[i + 1]],
            rotation: convert(value[i + 2], finalUnit, "radians")
          }),
          annotation: {}
        });
      }
      break;
    case "Pose3d":
      for (let i = 0; i < value.length; i += 7) {
        poses.push({
          pose: {
            translation: [value[i], value[i + 1], value[i + 2]],
            rotation: [value[i + 3], value[i + 4], value[i + 5], value[i + 6]]
          },
          annotation: {}
        });
      }
      break;
  }
  return poses;
}

export function grabTranslation2d(log: Log, key: string, timestamp: number): AnnotatedPose3d[] {
  return [
    {
      pose: {
        translation: translation2dTo3d([
          getOrDefault(log, key + "/x", LoggableType.Number, timestamp, 0),
          getOrDefault(log, key + "/y", LoggableType.Number, timestamp, 0)
        ]),
        rotation: Rotation3dZero
      },
      annotation: {}
    }
  ];
}

export function grabTranslation3d(log: Log, key: string, timestamp: number): AnnotatedPose3d[] {
  return [
    {
      pose: {
        translation: [
          getOrDefault(log, key + "/x", LoggableType.Number, timestamp, 0),
          getOrDefault(log, key + "/y", LoggableType.Number, timestamp, 0),
          getOrDefault(log, key + "/z", LoggableType.Number, timestamp, 0)
        ],
        rotation: Rotation3dZero
      },
      annotation: {}
    }
  ];
}

export function grabTranslation2dArray(log: Log, key: string, timestamp: number): AnnotatedPose3d[] {
  return indexArray(getOrDefault(log, key + "/length", LoggableType.Number, timestamp, 0)).reduce(
    (array, index) => array.concat(grabTranslation2d(log, key + "/" + index.toString(), timestamp)),
    [] as AnnotatedPose3d[]
  );
}

export function grabTranslation3dArray(log: Log, key: string, timestamp: number): AnnotatedPose3d[] {
  return indexArray(getOrDefault(log, key + "/length", LoggableType.Number, timestamp, 0)).reduce(
    (array, index) => array.concat(grabTranslation3d(log, key + "/" + index.toString(), timestamp)),
    [] as AnnotatedPose3d[]
  );
}

export function grabPose2d(log: Log, key: string, timestamp: number): AnnotatedPose3d[] {
  return [
    {
      pose: pose2dTo3d({
        translation: [
          getOrDefault(log, key + "/translation/x", LoggableType.Number, timestamp, 0),
          getOrDefault(log, key + "/translation/y", LoggableType.Number, timestamp, 0)
        ],
        rotation: getOrDefault(log, key + "/rotation/value", LoggableType.Number, timestamp, 0)
      }),
      annotation: {}
    }
  ];
}

export function grabPose3d(log: Log, key: string, timestamp: number): AnnotatedPose3d[] {
  return [
    {
      pose: {
        translation: [
          getOrDefault(log, key + "/translation/x", LoggableType.Number, timestamp, 0),
          getOrDefault(log, key + "/translation/y", LoggableType.Number, timestamp, 0),
          getOrDefault(log, key + "/translation/z", LoggableType.Number, timestamp, 0)
        ],
        rotation: [
          getOrDefault(log, key + "/rotation/q/w", LoggableType.Number, timestamp, 0),
          getOrDefault(log, key + "/rotation/q/x", LoggableType.Number, timestamp, 0),
          getOrDefault(log, key + "/rotation/q/y", LoggableType.Number, timestamp, 0),
          getOrDefault(log, key + "/rotation/q/z", LoggableType.Number, timestamp, 0)
        ]
      },
      annotation: {}
    }
  ];
}

export function grabPose2dArray(log: Log, key: string, timestamp: number): AnnotatedPose3d[] {
  return indexArray(getOrDefault(log, key + "/length", LoggableType.Number, timestamp, 0)).reduce(
    (array, index) => array.concat(grabPose2d(log, key + "/" + index.toString(), timestamp)),
    [] as AnnotatedPose3d[]
  );
}

export function grabPose3dArray(log: Log, key: string, timestamp: number): AnnotatedPose3d[] {
  return indexArray(getOrDefault(log, key + "/length", LoggableType.Number, timestamp, 0)).reduce(
    (array, index) => array.concat(grabPose3d(log, key + "/" + index.toString(), timestamp)),
    [] as AnnotatedPose3d[]
  );
}

export function grabTrajectory(log: Log, key: string, timestamp: number): AnnotatedPose3d[] {
  return indexArray(getOrDefault(log, key + "/states/length", LoggableType.Number, timestamp, 0)).reduce(
    (array, index) => array.concat(grabPose3d(log, key + "/states/" + index.toString() + "/pose", timestamp)),
    [] as AnnotatedPose3d[]
  );
}

export function grabAprilTag(log: Log, key: string, timestamp: number): AnnotatedPose3d[] {
  return [
    {
      pose: {
        translation: [
          getOrDefault(log, key + "/pose/translation/x", LoggableType.Number, timestamp, 0),
          getOrDefault(log, key + "/pose/translation/y", LoggableType.Number, timestamp, 0),
          getOrDefault(log, key + "/pose/translation/z", LoggableType.Number, timestamp, 0)
        ],
        rotation: [
          getOrDefault(log, key + "/pose/rotation/q/w", LoggableType.Number, timestamp, 0),
          getOrDefault(log, key + "/pose/rotation/q/x", LoggableType.Number, timestamp, 0),
          getOrDefault(log, key + "/pose/rotation/q/y", LoggableType.Number, timestamp, 0),
          getOrDefault(log, key + "/pose/rotation/q/z", LoggableType.Number, timestamp, 0)
        ]
      },
      annotation: {
        aprilTagId: getOrDefault(log, key + "/ID", LoggableType.Number, timestamp, undefined)
      }
    }
  ];
}

export function grabAprilTagArray(log: Log, key: string, timestamp: number): AnnotatedPose3d[] {
  return indexArray(getOrDefault(log, key + "/length", LoggableType.Number, timestamp, 0)).reduce(
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
  fieldHeight: number
): AnnotatedPose3d[] {
  let x = convert(getOrDefault(log, key + "/x", LoggableType.Number, timestamp, 0), "feet", "meters");
  let y = convert(getOrDefault(log, key + "/y", LoggableType.Number, timestamp, 0), "feet", "meters");
  let alliance: "blue" | "red" =
    getOrDefault(log, key + "/alliance", LoggableType.String, timestamp, 0) === "red" ? "red" : "blue";
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
        zebraTeam: teamNumber
      }
    }
  ];
}
