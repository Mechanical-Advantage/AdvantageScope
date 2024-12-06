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
