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
      symbol: "floor",
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
      symbol: "gesture",
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
      symbol: "scatterplot",
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
      symbol: "barcode",
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
      symbol: "earthquake",
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
      symbol: "list",
      showInTypeName: false,
      color: "#ffaa00",
      sourceTypes: ["Alerts"],
      showDocs: true,
      options: []
    },
    {
      key: "commands",
      display: "Commands",
      symbol: "menu",
      showInTypeName: false,
      color: "#3957dd",
      sourceTypes: ["Scheduler"],
      showDocs: true,
      options: [
        {
          key: "depth",
          display: "Depth",
          showInTypeName: false,
          values: [
            { key: "all", display: "All" },
            { key: "roots", display: "Roots Only" },
            { key: "1", display: "Depth 1" },
            { key: "2", display: "Depth 2" },
            { key: "3", display: "Depth 3" }
          ]
        },
        {
          key: "minDuration",
          display: "Min Duration",
          showInTypeName: false,
          values: [
            { key: "0", display: "None" },
            { key: "20", display: "20 ms" },
            { key: "50", display: "50 ms" },
            { key: "100", display: "100 ms" },
            { key: "250", display: "250 ms" },
            { key: "500", display: "500 ms" },
            { key: "1000", display: "1 s" }
          ]
        },
        {
          key: "requirements",
          display: "Requirements",
          showInTypeName: false,
          values: [
            { key: "all", display: "All" },
            { key: "required", display: "With Requirements" },
            { key: "none", display: "Without Requirements" }
          ]
        },
        {
          key: "colorScheme",
          display: "Color Scheme",
          showInTypeName: false,
          values: [
            { key: "mechanism", display: "By Mechanism" },
            { key: "depth", display: "By Depth" },
            { key: "id", display: "By Run Order" }
          ]
        },
        {
          key: "borders",
          display: "Show Borders",
          showInTypeName: false,
          values: [
            { key: "true", display: "Yes" },
            { key: "false", display: "No" }
          ]
        },
        {
          key: "defaultCommands",
          display: "Default Commands",
          showInTypeName: false,
          values: [
            { key: "show", display: "Show" },
            { key: "hide", display: "Hide" }
          ]
        }
      ]
    }
  ]
};
