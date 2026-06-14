// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import config from "./docusaurus.config";

const isLite = process.env.ASCOPE_DISTRIBUTION === "LITE";
const configEmbed = Object.assign(config, {
  future: {
    experimental_router: "hash"
  },
  themeConfig: Object.assign(config.themeConfig!, {
    navbar: Object.assign(config.themeConfig!.navbar!, { items: undefined }),
    footer: undefined,
    colorMode: {
      disableSwitch: true,
      respectPrefersColorScheme: true
    },
    announcementBar: isLite
      ? {
          id: "ascope_lite_warning",
          content:
            "This documentation describes the desktop version of AdvantageScope, which includes some features not available in AdvantageScope Lite.",
          backgroundColor: "#446ce3",
          textColor: "#ffffff",
          isCloseable: false
        }
      : undefined,
    algolia: undefined
  })
});

export default configEmbed;
