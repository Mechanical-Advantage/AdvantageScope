// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export type SourceListConfig = {
  title: string;
  /** True advances type, string advances option */
  autoAdvance: boolean | string;
  /** Should be false if parent types (arrays/structs) are supported directly */
  allowChildrenFromDrag: boolean;
  /** If provided, remember types and options for fields */
  typeMemoryId?: string;
  types: SourceListTypeConfig[];
};

export type SourceListTypeConfig = {
  key: string;
  symbol: string;
  showInTypeName: boolean;
  /** Option key or hex (starting with #) */
  color: string;
  darkColor?: string;
  sourceTypes: string[];
  /** Identifies parents with shared children types */
  parentKey?: string;
  /** Parent key this child is attached to */
  childOf?: string;
  previewType?:
    | "Rotation2d"
    | "Translation2d"
    | "Pose2d"
    | "Transform2d"
    | "Rotation3d"
    | "Translation3d"
    | "Pose3d"
    | "Transform3d"
    | "SwerveModuleState[]"
    | "ChassisSpeeds"
    | null; // Don't use preview
  initialSelectionOption?: string;
  showDocs: boolean;
  options: SourceListOptionConfig[];
};

export type SourceListOptionConfig = {
  key: string;
  showInTypeName: boolean;
  values: string[];
};

export function getSourceListPrefix(titleKey: string): string {
  let parts = titleKey.split(".");
  if (parts.length >= 2) {
    return parts[0] + "." + parts[1];
  }
  return "sourceList";
}

export function tType(prefix: string, typeKey: string): string {
  let key = `${prefix}.types.${typeKey}`;
  let res = t(key);
  return res !== key ? res : typeKey;
}

export function tOption(prefix: string, typeKey: string, optionKey: string): string {
  let specificKey = `${prefix}.options.${typeKey}_${optionKey}`;
  let genericKey = `${prefix}.options.${optionKey}`;
  let res = t(specificKey);
  if (res !== specificKey) return res;
  res = t(genericKey);
  return res !== genericKey ? res : optionKey;
}

export function tValue(prefix: string, typeKey: string, optionKey: string, valueKey: string): string {
  let keys = [
    `${prefix}.optionValues.${typeKey}_${optionKey}_${valueKey}`,
    `${prefix}.optionValues.${optionKey}_${valueKey}`,
    `${prefix}.optionValues.${valueKey}`,
    `sourceList.optionValues.${valueKey}`
  ];
  for (let key of keys) {
    let res = t(key);
    if (res !== key) return res;
  }
  return valueKey;
}

export type SourceListState = SourceListItemState[];

export type SourceListItemState = {
  type: string;
  logKey: string;
  logType: string;
  visible: boolean;
  options: { [key: string]: string };
};

export type SourceListTypeMemory = {
  // Memory ID
  [key: string]: {
    // Log key
    [key: string]: SourceListTypeMemoryEntry;
  };
};

export type SourceListTypeMemoryEntry = {
  type: string;
  options: { [key: string]: string };
};
