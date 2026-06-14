// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

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
