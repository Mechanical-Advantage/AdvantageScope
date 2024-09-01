import { SourceListConfig } from "../../shared/SourceListConfig";
import { indexArray } from "../../shared/util";

const PointsController_Config: SourceListConfig = {
  title: "Sources",
  autoAdvance: false,
  allowChildrenFromDrag: false,
  typeMemoryId: "points",
  types: [
    {
      key: "plus",
      display: "Plus",
      symbol: "plus",
      showInTypeName: true,
      color: "#888888",
      sourceTypes: ["Translation2d", "Translation2d[]", "NumberArray"],
      options: [
        {
          key: "size",
          display: "Size",
          showInTypeName: false,
          values: [
            { key: "medium", display: "Medium" },
            { key: "large", display: "Large" },
            { key: "small", display: "Small" }
          ]
        },
        {
          key: "groupSize",
          display: "Group Size",
          showInTypeName: false,
          values: indexArray(10).map((num) => {
            return {
              key: num.toString(),
              display: num.toString()
            };
          })
        }
      ],
      geometryPreviewType: null
    },
    {
      key: "cross",
      display: "Cross",
      symbol: "xmark",
      showInTypeName: true,
      color: "#888888",
      sourceTypes: ["Translation2d", "Translation2d[]", "NumberArray"],
      options: [
        {
          key: "size",
          display: "Size",
          showInTypeName: false,
          values: [
            { key: "medium", display: "Medium" },
            { key: "large", display: "Large" },
            { key: "small", display: "Small" }
          ]
        },
        {
          key: "groupSize",
          display: "Group Size",
          showInTypeName: false,
          values: indexArray(10).map((num) => {
            return {
              key: num.toString(),
              display: num.toString()
            };
          })
        }
      ],
      geometryPreviewType: null
    },
    {
      key: "circle",
      display: "Circle",
      symbol: "circle.fill",
      showInTypeName: true,
      color: "#888888",
      sourceTypes: ["Translation2d", "Translation2d[]", "NumberArray"],
      options: [
        {
          key: "size",
          display: "Size",
          showInTypeName: false,
          values: [
            { key: "medium", display: "Medium" },
            { key: "large", display: "Large" },
            { key: "small", display: "Small" }
          ]
        },
        {
          key: "groupSize",
          display: "Group Size",
          showInTypeName: false,
          values: indexArray(10).map((num) => {
            return {
              key: num.toString(),
              display: num.toString()
            };
          })
        }
      ],
      geometryPreviewType: null
    },
    {
      key: "plusSplit",
      display: "Plus/Split",
      symbol: "plus",
      showInTypeName: true,
      color: "#888888",
      sourceTypes: ["NumberArray"],
      parentKey: "split",
      options: [
        {
          key: "component",
          display: "Component",
          showInTypeName: true,
          values: [
            { key: "x", display: "X" },
            { key: "y", display: "Y" }
          ]
        },
        {
          key: "size",
          display: "Size",
          showInTypeName: false,
          values: [
            { key: "medium", display: "Medium" },
            { key: "large", display: "Large" },
            { key: "small", display: "Small" }
          ]
        },
        {
          key: "groupSize",
          display: "Group Size",
          showInTypeName: false,
          values: indexArray(10).map((num) => {
            return {
              key: num.toString(),
              display: num.toString()
            };
          })
        }
      ],
      initialSelectionOption: "component",
      geometryPreviewType: null
    },
    {
      key: "crossSplit",
      display: "Cross/Split",
      symbol: "xmark",
      showInTypeName: true,
      color: "#888888",
      sourceTypes: ["NumberArray"],
      parentKey: "split",
      options: [
        {
          key: "component",
          display: "Component",
          showInTypeName: true,
          values: [
            { key: "x", display: "X" },
            { key: "y", display: "Y" }
          ]
        },
        {
          key: "size",
          display: "Size",
          showInTypeName: false,
          values: [
            { key: "medium", display: "Medium" },
            { key: "large", display: "Large" },
            { key: "small", display: "Small" }
          ]
        },
        {
          key: "groupSize",
          display: "Group Size",
          showInTypeName: false,
          values: indexArray(10).map((num) => {
            return {
              key: num.toString(),
              display: num.toString()
            };
          })
        }
      ],
      initialSelectionOption: "component",
      geometryPreviewType: null
    },
    {
      key: "circleSplit",
      display: "Circle/Split",
      symbol: "circle.fill",
      showInTypeName: true,
      color: "#888888",
      sourceTypes: ["NumberArray"],
      parentKey: "split",
      options: [
        {
          key: "component",
          display: "Component",
          showInTypeName: true,
          values: [
            { key: "x", display: "X" },
            { key: "y", display: "Y" }
          ]
        },
        {
          key: "size",
          display: "Size",
          showInTypeName: false,
          values: [
            { key: "medium", display: "Medium" },
            { key: "large", display: "Large" },
            { key: "small", display: "Small" }
          ]
        },
        {
          key: "groupSize",
          display: "Group Size",
          showInTypeName: false,
          values: indexArray(10).map((num) => {
            return {
              key: num.toString(),
              display: num.toString()
            };
          })
        }
      ],
      initialSelectionOption: "component",
      geometryPreviewType: null
    },
    {
      key: "component",
      display: "Component",
      symbol: "number",
      showInTypeName: false,
      color: "#888888",
      sourceTypes: ["NumberArray"],
      childOf: "split",
      options: [
        {
          key: "component",
          display: "Component",
          showInTypeName: true,
          values: [
            { key: "x", display: "X" },
            { key: "y", display: "Y" }
          ]
        }
      ],
      geometryPreviewType: null
    }
  ]
};

export default PointsController_Config;
