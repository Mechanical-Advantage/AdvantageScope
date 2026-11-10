// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { SourceListConfig } from "../../shared/SourceListConfig";

const TracksideController_Config: SourceListConfig = {
  title: "Tiles",
  showInGraph: true,
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
