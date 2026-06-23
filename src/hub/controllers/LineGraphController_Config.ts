// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { GraphColors } from "../../shared/Colors";
import { SourceListConfig } from "../../shared/SourceListConfig";

export const LineGraphController_NumericConfig: SourceListConfig = {
  title: "hub.lineGraph.numericAxis",
  autoAdvance: "color",
  allowChildrenFromDrag: true,
  types: [
    {
      key: "stepped",
      symbol: "stairs",
      showInTypeName: false,
      color: "color",
      sourceTypes: ["Number"],
      showDocs: true,
      options: [
        {
          key: "color",
          showInTypeName: false,
          values: GraphColors
        },
        {
          key: "size",
          showInTypeName: false,
          values: ["normal", "bold", "verybold"]
        }
      ]
    },
    {
      key: "smooth",
      symbol: "scribble.variable",
      showInTypeName: false,
      color: "color",
      sourceTypes: ["Number"],
      showDocs: true,
      options: [
        {
          key: "color",
          showInTypeName: false,
          values: GraphColors
        },
        {
          key: "size",
          showInTypeName: false,
          values: ["normal", "bold", "verybold"]
        }
      ]
    },
    {
      key: "points",
      symbol: "smallcircle.filled.circle",
      showInTypeName: false,
      color: "color",
      sourceTypes: ["Number"],
      showDocs: true,
      options: [
        {
          key: "color",
          showInTypeName: false,
          values: GraphColors
        },
        {
          key: "size",
          showInTypeName: false,
          values: ["normal", "bold"]
        }
      ]
    }
  ]
};

export const LineGraphController_DiscreteConfig: SourceListConfig = {
  title: "hub.lineGraph.discreteFields",
  autoAdvance: "color",
  allowChildrenFromDrag: false,
  types: [
    {
      key: "stripes",
      symbol: "square.stack.3d.forward.dottedline.fill",
      showInTypeName: false,
      color: "color",
      sourceTypes: ["Raw", "Boolean", "Number", "String", "BooleanArray", "NumberArray", "StringArray"],
      showDocs: true,
      options: [
        {
          key: "color",
          showInTypeName: false,
          values: GraphColors
        }
      ]
    },
    {
      key: "graph",
      symbol: "chart.xyaxis.line",
      showInTypeName: false,
      color: "color",
      sourceTypes: ["Raw", "Boolean", "Number", "String", "BooleanArray", "NumberArray", "StringArray"],
      showDocs: true,
      options: [
        {
          key: "color",
          showInTypeName: false,
          values: GraphColors
        }
      ]
    },
    {
      key: "alerts",
      symbol: "list.bullet",
      showInTypeName: false,
      color: "#ffaa00",
      sourceTypes: ["Alerts"],
      showDocs: true,
      options: []
    }
  ]
};
