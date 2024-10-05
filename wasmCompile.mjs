import { exec } from "child_process";

await new Promise((resolve) => {
  let inPath, outPath;
  if (process.platform === "win32") {
    inPath = "src\\hub\\dataSources\\wpilog\\indexer\\wpilogIndexer.c";
    outPath = "bundles\\hub$wpilogIndexer.js";
  } else {
    inPath = "'src/hub/dataSources/wpilog/indexer/wpilogIndexer.c'";
    outPath = "'bundles/hub$wpilogIndexer.js' ";
  }
  exec(`emcc ${inPath} -o ${outPath} -sEXPORTED_FUNCTIONS=_run,_malloc -sALLOW_MEMORY_GROWTH -O3`, resolve);
});
