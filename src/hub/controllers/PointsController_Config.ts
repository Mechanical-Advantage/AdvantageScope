// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { SourceListConfig } from "../../shared/SourceListConfig";
import { indexArray } from "../../shared/util";

const PointsController_Config: SourceListConfig = {
  title: "hub.points.sources",
  autoAdvance: false,
  allowChildrenFromDrag: false,
  typeMemoryId: "points",
  types: [
    {
      key: "plus",
      symbol: "plus",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Translation2d", "Translation2d[]", "TargetCorner:16f6ac0dedc8eaccb951f4895d9e18b6[]"],
      showDocs: true,
      options: [
        {
          key: "size",
          showInTypeName: false,
          values: ["medium", "large", "small"]
        },
        {
          key: "groupSize",
          showInTypeName: false,
          values: indexArray(10).map((num) => num.toString())
        }
      ],
      previewType: null
    },
    {
      key: "cross",
      symbol: "xmark",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Translation2d", "Translation2d[]", "TargetCorner:16f6ac0dedc8eaccb951f4895d9e18b6[]"],
      showDocs: true,
      options: [
        {
          key: "size",
          showInTypeName: false,
          values: ["medium", "large", "small"]
        },
        {
          key: "groupSize",
          showInTypeName: false,
          values: indexArray(10).map((num) => num.toString())
        }
      ],
      previewType: null
    },
    {
      key: "circle",
      symbol: "circle.fill",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Translation2d", "Translation2d[]", "TargetCorner:16f6ac0dedc8eaccb951f4895d9e18b6[]"],
      showDocs: true,
      options: [
        {
          key: "size",
          showInTypeName: false,
          values: ["medium", "large", "small"]
        },
        {
          key: "groupSize",
          showInTypeName: false,
          values: indexArray(10).map((num) => num.toString())
        }
      ],
      previewType: null
    },
    {
      key: "plusSplit",
      symbol: "plus",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      parentKey: "split",
      showDocs: true,
      options: [
        {
          key: "component",
          showInTypeName: true,
          values: ["x", "y"]
        },
        {
          key: "size",
          showInTypeName: false,
          values: ["medium", "large", "small"]
        },
        {
          key: "groupSize",
          showInTypeName: false,
          values: indexArray(10).map((num) => num.toString())
        }
      ],
      initialSelectionOption: "component",
      previewType: null
    },
    {
      key: "crossSplit",
      symbol: "xmark",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      parentKey: "split",
      showDocs: true,
      options: [
        {
          key: "component",
          showInTypeName: true,
          values: ["x", "y"]
        },
        {
          key: "size",
          showInTypeName: false,
          values: ["medium", "large", "small"]
        },
        {
          key: "groupSize",
          showInTypeName: false,
          values: indexArray(10).map((num) => num.toString())
        }
      ],
      initialSelectionOption: "component",
      previewType: null
    },
    {
      key: "circleSplit",
      symbol: "circle.fill",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      parentKey: "split",
      showDocs: true,
      options: [
        {
          key: "component",
          showInTypeName: true,
          values: ["x", "y"]
        },
        {
          key: "size",
          showInTypeName: false,
          values: ["medium", "large", "small"]
        },
        {
          key: "groupSize",
          showInTypeName: false,
          values: indexArray(10).map((num) => num.toString())
        }
      ],
      initialSelectionOption: "component",
      previewType: null
    },
    {
      key: "component",
      symbol: "number",
      showInTypeName: false,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["NumberArray"],
      childOf: "split",
      showDocs: true,
      options: [
        {
          key: "component",
          showInTypeName: true,
          values: ["x", "y"]
        }
      ],
      previewType: null
    }
  ]
};

export default PointsController_Config;
