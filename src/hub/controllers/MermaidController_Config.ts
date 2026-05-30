// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { SourceListConfig } from "../../shared/SourceListConfig";
import { GraphColors } from "../../shared/Colors";

const MermaidController_Config: SourceListConfig = {
  title: "Sources",
  autoAdvance: true,
  allowChildrenFromDrag: false,
  typeMemoryId: "mermaid",
  types: [
    {
      key: "diagram",
      display: "Diagram",
      symbol: "square.stack.3d.forward.dottedline.fill",
      showInTypeName: false,
      color: "color",
      sourceTypes: ["String"],
      showDocs: true,
      options: [
        {
          key: "color",
          display: "Color",
          showInTypeName: true,
          values: GraphColors
        }
      ],
      initialSelectionOption: "color:blue",
      previewType: null
    }
  ]
};

export default MermaidController_Config;
