import { exec } from "child_process";

try {
  await new Promise((resolve, reject) => {
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
  });
} catch (exception) {
  process.exit(1);
}
