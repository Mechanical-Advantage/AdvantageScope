import { SourceListConfig } from "../../shared/SourceListConfig";

const TracksideController_Config: SourceListConfig = {
  title: "Tiles",
  autoAdvance: false,
  allowChildrenFromDrag: false,
  types: [
    {
      key: "tile",
      display: "Tile",
      symbol: "numbers",
      showInTypeName: false,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Number", "String", "Boolean"],
      showDocs: false,
      options: [],
      previewType: null
    }
  ]
};
export default TracksideController_Config;
