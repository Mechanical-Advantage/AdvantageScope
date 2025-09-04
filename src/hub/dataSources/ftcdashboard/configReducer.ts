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

import { ConfigAction, ConfigState, ConfigVar, ConfigVarState } from "./configTypes";

function inflate(v: ConfigVar): ConfigVarState {
  if (v.__type === "custom") {
    const value = v.__value;
    if (value === null) {
      return {
        __type: "custom",
        __value: null
      };
    } else {
      return {
        __type: "custom",
        __value: Object.keys(value).reduce(
          (acc, key) => ({
            ...acc,
            [key]: inflate(value[key])
          }),
          {}
        )
      };
    }
  } else {
    return {
      ...v,
      __newValue: v.__value,
      __valid: true
    };
  }
}

// merge modified, matching members of base into latest
function mergeModified(base: ConfigVarState, latest: ConfigVar): ConfigVarState {
  if (base.__type === "custom" && latest.__type === "custom") {
    const latestValue = latest.__value;
    if (latestValue === null) {
      return {
        __type: "custom",
        __value: null
      };
    } else {
      return {
        __type: "custom",
        __value: Object.keys(latestValue).reduce(
          (acc, key) =>
            base.__value !== null && key in base.__value
              ? {
                  ...acc,
                  [key]: mergeModified(base.__value[key], latestValue[key])
                }
              : {
                  ...acc,
                  [key]: inflate(latestValue[key])
                },
          {}
        )
      };
    }
  } else if (
    base.__type === "enum" &&
    latest.__type === "enum" &&
    base.__enumClass === latest.__enumClass &&
    base.__value !== base.__newValue
  ) {
    return {
      ...base,
      __value: latest.__value
    };
  } else if (
    base.__type === latest.__type &&
    /* type checker reminder */ base.__type !== "custom" &&
    latest.__type !== "custom" &&
    base.__value !== base.__newValue
  ) {
    return {
      ...base,
      __value: latest.__value
    };
  } else {
    return inflate(latest);
  }
}

function revertModified(state: ConfigVarState): ConfigVarState {
  if (state.__type === "custom") {
    const value = state.__value;
    if (value === null) {
      return {
        __type: "custom",
        __value: null
      };
    } else {
      return {
        __type: "custom",
        __value: Object.keys(value).reduce(
          (acc, key) => ({
            ...acc,
            [key]: inflate(value[key])
          }),
          {}
        )
      };
    }
  } else {
    return {
      ...state,
      __newValue: state.__value
    };
  }
}

export const initialState: ConfigState = {
  configRoot: {
    __type: "custom",
    __value: {}
  }
};

const configReducer = (state: ConfigState = initialState, action: ConfigAction): ConfigState => {
  switch (action.type) {
    case "RECEIVE_CONFIG":
      return {
        ...state,
        configRoot: mergeModified(state.configRoot, action.configRoot)
      };
    case "UPDATE_CONFIG":
      return {
        ...state,
        configRoot: action.configRoot
      };
    case "REFRESH_CONFIG":
      return {
        ...state,
        configRoot: revertModified(state.configRoot)
      };
    default:
      return state;
  }
};

export default configReducer;
