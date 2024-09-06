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
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Translation2d", "Translation2d[]", "NumberArray"],
      showDocs: true,
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
      previewType: null
    },
    {
      key: "cross",
      display: "Cross",
      symbol: "xmark",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Translation2d", "Translation2d[]", "NumberArray"],
      showDocs: true,
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
      previewType: null
    },
    {
      key: "circle",
      display: "Circle",
      symbol: "circle.fill",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Translation2d", "Translation2d[]", "NumberArray"],
      showDocs: true,
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
      previewType: null
    },
    {
      key: "plusSplit",
      display: "Plus/Split",
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
      previewType: null
    },
    {
      key: "crossSplit",
      display: "Cross/Split",
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
      previewType: null
    },
    {
      key: "circleSplit",
      display: "Circle/Split",
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
      previewType: null
    },
    {
      key: "component",
      display: "Component",
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
          display: "Component",
          showInTypeName: true,
          values: [
            { key: "x", display: "X" },
            { key: "y", display: "Y" }
          ]
        }
      ],
      previewType: null
    }
  ]
};

export default PointsController_Config;
