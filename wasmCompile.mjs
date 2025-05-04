import { exec } from "child_process";
import fs from "fs";

try {
  await new Promise((resolve, reject) => {
    // Create directories
    if (!fs.existsSync("bundles")) {
      fs.mkdirSync("bundles");
    }
    if (!fs.existsSync("lite/bundles")) {
      fs.mkdirSync("lite/bundles");
    }

    // Compile wasm
    let inPath, outPath;
    if (process.platform === "win32") {
      inPath = "src\\hub\\dataSources\\wpilog\\indexer\\wpilogIndexer.c";
      outPath = "bundles\\hub$wpilogIndexer.js";
    } else {
      inPath = "'src/hub/dataSources/wpilog/indexer/wpilogIndexer.c'";
      outPath = "'bundles/hub$wpilogIndexer.js' ";
    }
    exec(
      `emcc ${inPath} -o ${outPath} -sEXPORTED_FUNCTIONS=_run,_malloc -sALLOW_MEMORY_GROWTH -O3`,
      (error, stdout, stderr) => {
        console.log(stdout);
        console.error(stderr);
        if (error === null) {
          resolve();
        } else {
          reject();
        }
      }
    );

    // Copy to Lite bundles
    fs.copyFileSync("bundles/hub$wpilogIndexer.js", "lite/bundles/hub$wpilogIndexer.js");
    fs.copyFileSync("bundles/hub$wpilogIndexer.wasm", "lite/bundles/hub$wpilogIndexer.wasm");
  });
} catch (exception) {
  process.exit(1);
}
