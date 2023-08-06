import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import cleanup from "rollup-plugin-cleanup";

function bundle(input, output, external = []) {
  let isWpilib = process.env.ASCOPE_DISTRIBUTOR === "WPILIB";
  return {
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
          __distributor__: isWpilib ? "WPILib" : "LittletonRobotics",
          __build_date__: new Date().toLocaleString("en-US", {
            timeZone: "UTC",
            hour12: false,
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            timeZoneName: "short"
          })
        }
      })
    ],
    external: external
  };
}

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
