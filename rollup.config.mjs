import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import cleanup from "rollup-plugin-cleanup";

const bundle = (input, output, external = []) => ({
  input: "src/" + input,
  output: {
    file: "bundles/" + output,
    format: "cjs"
  },
  plugins: [typescript(), nodeResolve(), commonjs(), cleanup()],
  external: external
});

const mainBundles = [
  bundle("main/main.ts", "main.js", ["electron", "electron-fetch", "fs", "jsonfile", "net", "os", "path", "ssh2"]),
  bundle("preload.ts", "preload.js", ["electron"])
];
const largeRendererBundles = [bundle("hub/hub.ts", "hub.js"), bundle("satellite.ts", "satellite.js")];
const smallRendererBundles = [
  bundle("editRange.ts", "editRange.js"),
  bundle("unitConversion.ts", "unitConversion.js"),
  bundle("renameTab.ts", "renameTab.js"),
  bundle("export.ts", "export.js"),
  bundle("download.ts", "download.js"),
  bundle("preferences.ts", "preferences.js")
];
const workerBundles = [
  bundle("hub/dataSources/rlogWorker.ts", "hub$rlogWorker.js"),
  bundle("hub/dataSources/wpilogWorker.ts", "hub$wpilogWorker.js"),
  bundle("hub/dataSources/dsLogWorker.ts", "hub$dsLogWorker.js"),
  bundle("hub/exportWorker.ts", "hub$exportWorker.js")
];

export default (cliArgs) => {
  if (cliArgs.configMain === true) return mainBundles;
  if (cliArgs.configLargeRenderers === true) return largeRendererBundles;
  if (cliArgs.configSmallRenderers === true) return smallRendererBundles;
  if (cliArgs.configWorkers === true) return workerBundles;

  return [...mainBundles, ...largeRendererBundles, ...smallRendererBundles, ...workerBundles];
};
