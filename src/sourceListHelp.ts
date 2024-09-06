import NamedMessage from "./shared/NamedMessage";
import { SourceListConfig } from "./shared/SourceListConfig";

window.addEventListener("message", (event) => {
  // Get elements
  // TODO

  if (event.source === window && event.data === "port") {
    let messagePort = event.ports[0];
    messagePort.onmessage = (event) => {
      let message: NamedMessage = event.data;
      if (message.name !== "set-config") return;
      let config: SourceListConfig = message.data;

      document.title = config.title + " \u2014 AdvantageScope";
      console.log(config);
    };
  }
});
