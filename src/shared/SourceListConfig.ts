export type SourceListConfig = {
  title: string;
  autoAdvance: boolean | string; // True advances type, string advances option
  allowChildrenFromDrag: boolean; // Should be false if parent types (arrays/structs) are supported directly
  typeMemoryId?: string; // If provided, remember types and options for fields
  types: SourceListTypeConfig[];
};

export type SourceListTypeConfig = {
  key: string;
  display: string;
  symbol: string;
  showInTypeName: boolean;
  color: string; // Option key or hex (starting with #)
  darkColor?: string;
  sourceTypes: string[];
  numberArrayDeprecated?: boolean; // Enable deprecation warning
  parentKey?: string; // Identifies parents with shared children types
  childOf?: string; // Parent key this child is attached to
  geometryPreviewType?:
    | "Rotation2d"
    | "Translation2d"
    | "Pose2d"
    | "Transform2d"
    | "Rotation3d"
    | "Translation3d"
    | "Pose3d"
    | "Transform3d"
    | null; // Hide preview

  // If only one option, show without submenu
  options: SourceListOptionConfig[];
  initialSelectionOption?: string;
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
