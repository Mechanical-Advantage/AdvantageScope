// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { GraphColors } from "../../shared/Colors";
import { SourceListConfig } from "../../shared/SourceListConfig";

const StatisticsController_Config: SourceListConfig = {
  title: "Measurements",
  autoAdvance: "color",
  allowChildrenFromDrag: false,
  typeMemoryId: "statistics",
  types: [
    {
      key: "independent",
      display: "Independent",
      symbol: "line.3.horizontal",
      showInTypeName: true,
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
      ],
      previewType: null
    },
    {
      key: "reference",
      display: "Reference",
      symbol: "line.horizontal.star.fill.line.horizontal",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Number"],
      parentKey: "reference",
      showDocs: true,
      options: [],
      previewType: null
    },
    {
      key: "relativeError",
      display: "Relative Error",
      symbol: "arrow.down.and.line.horizontal.and.arrow.up",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["Number"],
      childOf: "reference",
      showDocs: true,
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: GraphColors
        }
      ],
      previewType: null
    },
    {
      key: "absoluteError",
      display: "Absolute Error",
      symbol: "arrow.down.to.line",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["Number"],
      childOf: "reference",
      showDocs: true,
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: GraphColors
        }
      ],
      previewType: null
    }
  ]
};

export default StatisticsController_Config;
