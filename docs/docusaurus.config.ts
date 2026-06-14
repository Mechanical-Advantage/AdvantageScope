// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
  title: "AdvantageScope",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://docs.advantagescope.org",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  onBrokenLinks: "throw",
  markdown: {
    hooks: { onBrokenMarkdownLinks: "throw", onBrokenMarkdownImages: "throw" }
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"]
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          sidebarCollapsed: true
        },
        theme: {
          customCss: "./src/css/custom.css"
        }
      } satisfies Preset.Options
    ]
  ],

  plugins: [
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          {
            to: "/tab-reference/3d-field/advantagescope-xr",
            from: "/xr"
          },
          {
            to: "/overview/legacy-formats",
            from: "/whats-new/legacy-formats"
          },
          {
            to: "/overview/legacy-formats",
            from: "/legacy-formats"
          },
          {
            to: "/overview/navigation",
            from: "/getting-started/navigation"
          },
          {
            to: "/overview/navigation/keyboard",
            from: "/getting-started/keyboard"
          },
          {
            to: "/overview/log-files",
            from: "/getting-started/manage-files"
          },
          {
            to: "/overview/log-files/export",
            from: "/more-features/export"
          },
          {
            to: "/overview/live-sources",
            from: "/getting-started/connect-live"
          },
          {
            to: "/overview/champs-conference",
            from: "/getting-started/champs-conference"
          },
          {
            to: "/tab-reference/2d-field",
            from: "/tab-reference/odometry"
          },
          {
            to: "/tab-reference/3d-field/advantagescope-xr",
            from: "/more-features/advantagescope-xr"
          },
          {
            to: "/more-features/custom-assets/gltf-convert",
            from: "/more-features/gltf-convert"
          }
        ]
      }
    ]
  ],

  themeConfig: {
    image: "img/social.png",
    navbar: {
      title: "AdvantageScope Documentation",
      logo: {
        alt: "AdvantageScope Logo",
        src: "img/logo.png"
      },
      items: [
        {
          href: "https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest",
          label: "Downloads",
          position: "right"
        },
        {
          href: "https://github.com/Mechanical-Advantage/AdvantageScope",
          label: "GitHub",
          position: "right"
        }
      ]
    },
    footer: {
      copyright: "Copyright © 2021-2026 Littleton Robotics",
      links: [
        {
          label: "Littleton Robotics",
          href: "https://littletonrobotics.org"
        },
        {
          label: "AdvantageKit",
          href: "https://docs.advantagekit.org"
        },
        {
          label: "WPILib Docs",
          href: "https://docs.wpilib.org"
        }
      ]
    },
    docs: {
      sidebar: {
        hideable: true
      }
    },
    colorMode: {
      disableSwitch: false,
      respectPrefersColorScheme: true
    },
    announcementBar: {
      id: "offline_info",
      content:
        "This documentation is available <b>offline</b> by clicking the 📖 icon in the tab bar of AdvantageScope.",
      backgroundColor: "#446ce3",
      textColor: "#ffffff",
      isCloseable: true
    },
    prism: {
      theme: prismThemes.jettwaveLight,
      darkTheme: prismThemes.jettwaveDark,
      additionalLanguages: ["java"]
    },
    algolia: {
      appId: "GBP8QKXFZG",
      apiKey: "a9a4c90f61d9bb34e8d54e71acaccd60",
      indexName: "advantagescope"
    }
  } satisfies Preset.ThemeConfig
};

export default config;
