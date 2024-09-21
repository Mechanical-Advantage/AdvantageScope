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
          sidebarCollapsed: false
        },
        theme: {
          customCss: "./src/css/custom.css"
        }
      } satisfies Preset.Options
    ]
  ],

  themeConfig: {
    // Replace with your project's social card
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
    colorMode: {
      disableSwitch: true,
      respectPrefersColorScheme: true
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["java"]
    }
  } satisfies Preset.ThemeConfig
};

export default config;
