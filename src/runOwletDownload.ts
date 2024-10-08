import path from "path";
import { downloadOwletInternal } from "./main/owletDownload";

function download(platform: string) {
  downloadOwletInternal(path.join("owlet", platform), platform).then(() => {
    console.log("Finished downloading for " + platform);
  });
}

console.log("Downloading owlet...");
download("mac-x64");
download("mac-arm64");
download("linux-x64");
download("linux-arm64");
download("linux-armv7l");
download("win32-x64");
download("win32-arm64");
