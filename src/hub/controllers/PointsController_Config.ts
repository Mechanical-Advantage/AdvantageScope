import { SourceListConfig } from "../../shared/SourceListConfig";

const PointsController_Config: SourceListConfig = {
  title: "Sources",
  autoAdvance: false,
  allowChildrenFromDrag: false,
  typeMemoryId: "points",
  types: [
    {
      key: "mechanism",
      display: "Mechanism",
      symbol: "gearshape.fill",
      showInTypeName: false,
      color: "#888888",
      sourceTypes: ["Mechanism2d"],
      options: []
    }
  ]
};

export default PointsController_Config;
