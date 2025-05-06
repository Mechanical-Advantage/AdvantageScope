import config from "./docusaurus.config";

const isLite = process.env.ASCOPE_DISTRIBUTION === "LITE";
const configEmbed = Object.assign(config, {
  future: {
    experimental_router: "hash"
  },
  themeConfig: Object.assign(config.themeConfig!, {
    announcementBar: isLite
      ? {
          id: "lite_warning",
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
