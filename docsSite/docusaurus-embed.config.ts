import config from "./docusaurus.config";

const configEmbed = Object.assign(config, {
  baseUrl: "/",
  future: {
    experimental_router: "hash"
  }
});

export default configEmbed;
