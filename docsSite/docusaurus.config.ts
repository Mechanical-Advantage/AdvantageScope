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
  onBrokenMarkdownLinks: "warn",

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
      copyright: "Copyright © 2021-2024 FRC 6328",
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
    colorMode: {
      disableSwitch: true,
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
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["java"]
    }
  } satisfies Preset.ThemeConfig
};

export default config;
