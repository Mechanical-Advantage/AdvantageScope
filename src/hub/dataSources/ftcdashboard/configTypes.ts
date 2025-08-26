// MIT License
//
// Copyright (c) 2018-2022 ACME Robotics
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

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
