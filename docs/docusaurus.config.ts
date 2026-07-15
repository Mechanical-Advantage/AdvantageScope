// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";
import { LOCALIZATION_FEEDBACK_FORMS } from "../src/shared/LocalizationFeedbackForms";
import { localizationFeedbackAnnouncement, offlineInfoAnnouncement } from "./announcements";
import youtubeLocaleRehypePlugin from "./youtubeLocales";

const envLocale = process.env.DOCUSAURUS_CURRENT_LOCALE;
const locale = envLocale && envLocale !== "undefined" ? envLocale : "en-US";

const config: Config = {
  title: "AdvantageScope",
  favicon: "/icons/favicon.ico",

  // Set the production url of your site here
  url: "https://docs.advantagescope.org",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  onBrokenLinks: "throw",
  markdown: {
    hooks: { onBrokenMarkdownLinks: "throw", onBrokenMarkdownImages: "throw" }
  },

  i18n: {
    defaultLocale: "en-US",
    locales: ["en-US", "es-419", "fr", "pt-BR", "tr", "ro", "he", "kk", "ru", "ar", "zh-CN", "zh-TW"],
    localeConfigs: {
      "en-US": {
        label: "English (US)"
      },
      "es-419": {
        label: "Español (Latinoamérica)"
      },
      "zh-CN": {
        label: "简体中文"
      },
      "zh-TW": {
        label: "繁體中文"
      }
    }
  },

  headTags: [
    {
      tagName: "script",
      attributes: {
        src: "/js/redirect.js"
      }
    }
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          sidebarCollapsed: true,
          rehypePlugins: [youtubeLocaleRehypePlugin]
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
    image: "/icons/social.png",
    navbar: {
      title: "AdvantageScope Documentation",
      logo: {
        alt: "AdvantageScope Logo",
        src: "/icons/logo.png"
      },
      items: [
        {
          type: "localeDropdown",
          position: "left"
        },
        ...(locale === "en-US"
          ? []
          : [
              {
                href: LOCALIZATION_FEEDBACK_FORMS[locale],
                label: "Feedback",
                position: "left"
              } as const
            ]),
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
      copyright: "Copyright © 2021-2026 Littleton Robotics.",
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
      id: locale === "en-US" ? "ascope_offline_info" : "ascope_localization_feedback",
      content: locale === "en-US" ? offlineInfoAnnouncement[locale] : localizationFeedbackAnnouncement[locale],
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
