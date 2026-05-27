// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { SourceListConfig } from "../../shared/SourceListConfig";

const MermaidController_Config: SourceListConfig = {
  title: "Sources",
  autoAdvance: true,
  allowChildrenFromDrag: false,
  typeMemoryId: "mermaid",
  types: [
    {
      key: "diagram",
      display: "Diagram",
      symbol: "point.3.connected.trianglepath.dotted",
      showInTypeName: false,
      color: "#000000",
      darkColor: "#ffffff",
      sourceTypes: ["String"],
      showDocs: true,
      options: [],
      previewType: null
    }
  ]
};

export default MermaidController_Config;
