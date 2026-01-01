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
  display: string;
  symbol: string;
  showInTypeName: boolean;
  /** Option key or hex (starting with #) */
  color: string;
  darkColor?: string;
  sourceTypes: string[];
  /** Enable deprecation warning */
  numberArrayDeprecated?: boolean;
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
  display: string;
  showInTypeName: boolean;
  values: SourceListOptionValueConfig[];
};

export type SourceListOptionValueConfig = {
  key: string;
  display: string;
};

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
