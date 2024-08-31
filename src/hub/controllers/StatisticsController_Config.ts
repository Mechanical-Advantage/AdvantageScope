import { SourceListConfig } from "../../shared/SourceListConfig";

const StatisticsController_Config: SourceListConfig = {
  title: "Measurements",
  autoAdvance: false,
  allowChildrenFromDrag: false,
  typeMemoryId: "statistics",
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

export default StatisticsController_Config;
