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
    }
  ]
};
