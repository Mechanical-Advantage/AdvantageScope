// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export type ConfigVar = CustomVar | BasicVar;
export type ConfigVarState = CustomVarState | BasicVarState;

export type CustomVar = {
  __type: "custom";
  __value: Record<string, ConfigVar> | null;
};

export type CustomVarState = {
  __type: "custom";
  __value: Record<string, ConfigVarState> | null;
};

export type BasicVar =
  | {
      __type: "enum";
      // only string is actualy present, but this helps treat vars uniformly
      __value: boolean | number | string | null;
      __enumClass: string;
      __enumValues: string[];
    }
  | {
      __type: "boolean" | "int" | "long" | "float" | "double" | "string";
      __value: boolean | number | string | null;
    };

export type BasicVarState = (
  | {
      __type: "enum";
      __value: boolean | number | string | null;
      __newValue: boolean | number | string | null;
      __enumClass: string;
      __enumValues: string[];
    }
  | {
      __type: "boolean" | "int" | "long" | "float" | "double" | "string";
      __value: boolean | number | string | null;
      __newValue: boolean | number | string | null;
    }
) & {
  __valid: boolean;
};

export type ConfigState = {
  configRoot: ConfigVarState;
};

export type ReceiveConfigAction = {
  type: "RECEIVE_CONFIG";
  configRoot: ConfigVar;
};

export type UpdateConfigAction = {
  type: "UPDATE_CONFIG";
  configRoot: ConfigVarState;
};

export type SaveConfigAction = {
  type: "SAVE_CONFIG";
  configDiff: ConfigVar;
};
export type RefreshConfigAction = {
  type: "REFRESH_CONFIG";
};

export type ConfigAction = ReceiveConfigAction | UpdateConfigAction | SaveConfigAction | RefreshConfigAction;

export type BasicVarType = "string" | "boolean" | "int" | "long" | "float" | "double";
