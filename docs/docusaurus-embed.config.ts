// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import config from "./docusaurus.config";

const configEmbed = Object.assign(config, {
  future: {
    experimental_router: "hash"
  },
  themeConfig: Object.assign(config.themeConfig!, {
    announcementBar: undefined,
    algolia: undefined
  })
});

export default configEmbed;
