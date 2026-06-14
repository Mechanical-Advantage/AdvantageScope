// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { GraphColors } from "../../shared/Colors";
import { SourceListConfig } from "../../shared/SourceListConfig";

export const LineGraphController_NumericConfig: SourceListConfig = {
  title: "Numeric Axis",
  autoAdvance: "color",
  allowChildrenFromDrag: true,
  types: [
    {
      key: "stepped",
      display: "Stepped",
      symbol: "stairs",
      showInTypeName: false,
      color: "color",
      sourceTypes: ["Number"],
      showDocs: true,
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: GraphColors
        },
        {
          key: "size",
          display: "Thickness",
          showInTypeName: false,
          values: [
            { key: "normal", display: "Normal" },
            { key: "bold", display: "Bold" },
            { key: "verybold", display: "Very Bold" }
          ]
        }
      ]
    },
    {
      key: "smooth",
      display: "Smooth",
      symbol: "scribble.variable",
      showInTypeName: false,
      color: "color",
      sourceTypes: ["Number"],
      showDocs: true,
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: GraphColors
        },
        {
          key: "size",
          display: "Thickness",
          showInTypeName: false,
          values: [
            { key: "normal", display: "Normal" },
            { key: "bold", display: "Bold" },
            { key: "verybold", display: "Very Bold" }
          ]
        }
      ]
    },
    {
      key: "points",
      display: "Points",
      symbol: "smallcircle.filled.circle",
      showInTypeName: false,
      color: "color",
      sourceTypes: ["Number"],
      showDocs: true,
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: GraphColors
        },
        {
          key: "size",
          display: "Size",
          showInTypeName: false,
          values: [
            { key: "normal", display: "Normal" },
            { key: "bold", display: "Large" }
          ]
        }
      ]
    }
  ]
};

export const LineGraphController_DiscreteConfig: SourceListConfig = {
  title: "Discrete Fields",
  autoAdvance: "color",
  allowChildrenFromDrag: false,
  types: [
    {
      key: "stripes",
      display: "Stripes",
      symbol: "square.stack.3d.forward.dottedline.fill",
      showInTypeName: false,
      color: "color",
      sourceTypes: ["Raw", "Boolean", "Number", "String", "BooleanArray", "NumberArray", "StringArray"],
      showDocs: true,
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: GraphColors
        }
      ]
    },
    {
      key: "graph",
      display: "Graph",
      symbol: "chart.xyaxis.line",
      showInTypeName: false,
      color: "color",
      sourceTypes: ["Raw", "Boolean", "Number", "String", "BooleanArray", "NumberArray", "StringArray"],
      showDocs: true,
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: GraphColors
        }
      ]
    },
    {
      key: "alerts",
      display: "Alerts",
      symbol: "list.bullet",
      showInTypeName: false,
      color: "#ffaa00",
      sourceTypes: ["Alerts"],
      showDocs: true,
      options: []
    }
  ]
};
