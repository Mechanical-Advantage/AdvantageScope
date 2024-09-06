import { NeonColors } from "../../shared/Colors";
import { SourceListConfig, SourceListOptionValueConfig } from "../../shared/SourceListConfig";

const ArrangementValues: SourceListOptionValueConfig[] = [
  { display: "FL, FR, BL, BR", key: "0,1,2,3" },
  { display: "FR, FL, BR, BL", key: "1,0,3,2" },
  { display: "FL, FR, BR, BL", key: "0,1,3,2" },
  { display: "FL, BL, BR, FR", key: "0,3,1,2" },
  { display: "FR, BR, BL, FL", key: "3,0,2,1" },
  { display: "FR, FL, BL, BR", key: "1,0,2,3" }
];

const SwerveController_Config: SourceListConfig = {
  title: "Sources",
  autoAdvance: "color",
  allowChildrenFromDrag: false,
  typeMemoryId: "swerve",
  types: [
    {
      key: "states",
      display: "States",
      symbol: "arrow.up.left.and.down.right.and.arrow.up.right.and.down.left",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["SwerveModuleState[]"],
      showDocs: true,
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        },
        {
          key: "arrangement",
          display: "Arrangement",
          showInTypeName: false,
          values: ArrangementValues
        }
      ],
      initialSelectionOption: "color",
      previewType: "SwerveModuleState[]"
    },
    {
      key: "statesLegacy",
      display: "States",
      symbol: "arrow.up.left.and.down.right.and.arrow.up.right.and.down.left",
      showInTypeName: true,
      color: "color",
      sourceTypes: ["NumberArray"],
      showDocs: false,
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: false,
          values: NeonColors
        },
        {
          key: "arrangement",
          display: "Arrangement",
          showInTypeName: false,
          values: ArrangementValues
        },
        {
          key: "units",
          display: "Rotation Units",
          showInTypeName: false,
          values: [
            { key: "radians", display: "Radians" },
            { key: "degrees", display: "Degrees" }
          ]
        }
      ],
      initialSelectionOption: "color",
      numberArrayDeprecated: true,
      previewType: "SwerveModuleState[]"
    },
    {
      key: "rotation",
      display: "Rotation",
      symbol: "angle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Rotation2d", "Rotation3d"],
      showDocs: true,
      options: [],
      previewType: "Rotation2d"
    },
    {
      key: "rotationLegacy",
      display: "Rotation",
      symbol: "angle",
      showInTypeName: true,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["Number"],
      showDocs: false,
      options: [
        {
          key: "units",
          display: "Rotation Units",
          showInTypeName: false,
          values: [
            { key: "radians", display: "Radians" },
            { key: "degrees", display: "Degrees" }
          ]
        }
      ],
      previewType: "Rotation2d"
    }
  ]
};

export default SwerveController_Config;
