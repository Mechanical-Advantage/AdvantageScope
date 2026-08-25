// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { liteWarningAnnouncement } from "./announcements";
import config from "./docusaurus.config";

const isLite = process.env.ASCOPE_DISTRIBUTION === "LITE" || process.env.ASCOPE_DISTRIBUTION === "LITEDS";
const locale = process.env.DOCUSAURUS_CURRENT_LOCALE || "en-US";

const configEmbed: Config = Object.assign(config, {
  future: Object.assign({}, config.future, {
    experimental_router: "hash"
  }),
  headTags: [],

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          sidebarCollapsed: true
        },
        blog: false,
        sitemap: false, // Sitemap not supported by hash router
        theme: {
          customCss: "./src/css/custom.css"
        }
      } satisfies Preset.Options
    ]
  ],

  plugins: [],

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
          content: liteWarningAnnouncement[locale],
          backgroundColor: "#446ce3",
          textColor: "#ffffff",
          isCloseable: false
        }
      : undefined,
    algolia: undefined
  })
});

export default configEmbed;
