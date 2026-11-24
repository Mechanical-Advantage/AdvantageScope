// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { GraphColors } from "../../shared/Colors";
import { SourceListConfig } from "../../shared/SourceListConfig";

const StatisticsController_Config: SourceListConfig = {
  title: "hub.statistics.measurements",
  autoAdvance: "color",
  allowChildrenFromDrag: true,
  typeMemoryId: "statistics",
  types: [
    {
      key: "independent",
      symbol: "menu",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["Number"],
      showDocs: true,
      options: [
        {
          key: "color",
          showInTypeName: false,
          values: GraphColors
        }
      ],
      previewType: null
    },
    {
      key: "reference",
      symbol: "anchor",
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
      symbol: "verticalaligncenter",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["Number"],
      childOf: "reference",
      showDocs: true,
      options: [
        {
          key: "color",
          showInTypeName: false,
          values: GraphColors
        }
      ],
      previewType: null
    },
    {
      key: "absoluteError",
      symbol: "verticalalignbottom",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["Number"],
      childOf: "reference",
      showDocs: true,
      options: [
        {
          key: "color",
          showInTypeName: false,
          values: GraphColors
        }
      ],
      previewType: null
    }
  ]
};

export default StatisticsController_Config;
