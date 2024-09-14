import { SourceListConfig } from "../../shared/SourceListConfig";

const MechanismController_Config: SourceListConfig = {
  title: "Sources",
  autoAdvance: false,
  allowChildrenFromDrag: false,
  types: [
    {
      key: "mechanism",
      display: "Mechanism",
      symbol: "gearshape.fill",
      showInTypeName: false,
      color: "#888888",
      sourceTypes: ["Mechanism2d"],
      showDocs: true,
      options: []
    }
  ]
};

export default MechanismController_Config;
