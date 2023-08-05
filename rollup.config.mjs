import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import cleanup from "rollup-plugin-cleanup";

const bundle = (input, output, isWpilib, external = []) => ({
  input: "src/" + input,
  output: {
    file: "bundles/" + output,
    format: "cjs"
  },
  plugins: [
    typescript(),
    nodeResolve(),
    commonjs(),
    cleanup(),
    replace({
      preventAssignment: true,
      values: {
        __distributor__: isWpilib ? "WPILib" : "Team6328",
        __build_date__: new Date().toUTCString()
      }
    })
  ],
  external: external
});

function mainBundles(isWpilib) {
  return [
    bundle("main/main.ts", "main.js", isWpilib, [
      "electron",
      "electron-fetch",
      "fs",
      "jsonfile",
      "net",
      "os",
      "path",
      "ssh2"
    ]),
    bundle("preload.ts", "preload.js", isWpilib, ["electron"])
  ];
}
function largeRendererBundles(isWpilib) {
  return [bundle("hub/hub.ts", "hub.js", isWpilib), bundle("satellite.ts", "satellite.js", isWpilib)];
}
function smallRendererBundles(isWpilib) {
  return [
    bundle("editRange.ts", "editRange.js", isWpilib),
    bundle("unitConversion.ts", "unitConversion.js", isWpilib),
    bundle("renameTab.ts", "renameTab.js", isWpilib),
    bundle("export.ts", "export.js", isWpilib),
    bundle("download.ts", "download.js", isWpilib),
    bundle("preferences.ts", "preferences.js", isWpilib)
  ];
}
function workerBundles(isWpilib) {
  return [
    bundle("hub/dataSources/rlogWorker.ts", "hub$rlogWorker.js", isWpilib),
    bundle("hub/dataSources/wpilogWorker.ts", "hub$wpilogWorker.js", isWpilib),
    bundle("hub/dataSources/dsLogWorker.ts", "hub$dsLogWorker.js", isWpilib),
    bundle("hub/exportWorker.ts", "hub$exportWorker.js", isWpilib)
  ];
}

export default (cliArgs) => {
  const isWpilib = cliArgs.configWpilib;
  if (cliArgs.configMain === true) return mainBundles(isWpilib);
  if (cliArgs.configLargeRenderers === true) return largeRendererBundles(isWpilib);
  if (cliArgs.configSmallRenderers === true) return smallRendererBundles(isWpilib);
  if (cliArgs.configWorkers === true) return workerBundles(isWpilib);

  return [
    ...mainBundles(isWpilib),
    ...largeRendererBundles(isWpilib),
    ...smallRendererBundles(isWpilib),
    ...workerBundles(isWpilib)
  ];
};
