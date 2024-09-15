import config from "./docusaurus.config";

const configEmbed = Object.assign(config, {
  future: {
    experimental_router: "hash"
  }
});

export default configEmbed;
