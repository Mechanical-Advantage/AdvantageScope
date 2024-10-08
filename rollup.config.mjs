import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import fs from "fs";
import cleanup from "rollup-plugin-cleanup";
import replaceRegEx from "rollup-plugin-re";

function bundle(input, output, isMain, external = []) {
  const isWpilib = process.env.ASCOPE_DISTRIBUTOR === "WPILIB";
  return {
    input: "src/" + input,
    output: {
      file: "bundles/" + output,
      format: isMain ? "cjs" : "es"
    },
    context: "this",
    external: external,
    plugins: [
      typescript(),
      nodeResolve({
        preferBuiltins: true
      }),
      commonjs(),
      cleanup(),
      json(),
      replace({
        preventAssignment: true,
        values: {
          __distributor__: isWpilib ? "WPILib" : "FRC6328",
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
          }),
          __copyright__: JSON.parse(
            fs.readFileSync("package.json", {
              encoding: "utf-8"
            })
          ).build.copyright
        }
      }),
      replaceRegEx({
        patterns: [
          // Remove unused eval in protobufjs
          // https://github.com/protobufjs/protobuf.js/issues/593
          {
            test: /eval.*\(moduleName\);/g,
            replace: "undefined;"
          }
        ]
      })
    ],
    onwarn(message, warn) {
      // Hide warnings about protobufjs circular dependencies
      // https://github.com/protobufjs/protobuf.js/issues/1402
      if (message.code === "CIRCULAR_DEPENDENCY") return;
      warn(message);
    }
  };
}

const mainBundles = [
  bundle("main/main.ts", "main.js", true, [
    "electron",
    "electron-fetch",
    "fs",
    "jsonfile",
    "net",
    "os",
    "path",
    "ssh2",
    "download",
    "ytdl-core",
    "tesseract.js"
  ]),
  bundle("preload.ts", "preload.js", true, ["electron"])
];
const largeRendererBundles = [bundle("hub/hub.ts", "hub.js", false), bundle("satellite.ts", "satellite.js", false)];
const smallRendererBundles = [
  bundle("editRange.ts", "editRange.js", false),
  bundle("unitConversion.ts", "unitConversion.js", false),
  bundle("renameTab.ts", "renameTab.js", false),
  bundle("editFov.ts", "editFov.js", false),
  bundle("sourceListHelp.ts", "sourceListHelp.js", false),
  bundle("betaWelcome.ts", "betaWelcome.js", false),
  bundle("export.ts", "export.js", false),
  bundle("download.ts", "download.js", false),
  bundle("preferences.ts", "preferences.js", false),
  bundle("licenses.ts", "licenses.js", false)
];
const workerBundles = [
  bundle("hub/dataSources/rlog/rlogWorker.ts", "hub$rlogWorker.js", false),
  bundle("hub/dataSources/wpilog/wpilogWorker.ts", "hub$wpilogWorker.js", false),
  bundle("hub/dataSources/dslog/dsLogWorker.ts", "hub$dsLogWorker.js", false),
  bundle("hub/exportWorker.ts", "hub$exportWorker.js", false),
  bundle("shared/renderers/threeDimension/workers/loadField.ts", "shared$loadField.js", false),
  bundle("shared/renderers/threeDimension/workers/loadRobot.ts", "shared$loadRobot.js", false)
];
const runOwletDownload = {
  input: "src/runOwletDownload.ts",
  output: {
    file: "runOwletDownload.js",
    format: "cjs"
  },
  context: "this",
  external: ["download"],
  plugins: [
    typescript(),
    nodeResolve({
      preferBuiltins: true
    }),
    commonjs(),
    json()
  ],
  onwarn() {}
};

export default (cliArgs) => {
  if (cliArgs.configMain === true) return mainBundles;
  if (cliArgs.configLargeRenderers === true) return largeRendererBundles;
  if (cliArgs.configSmallRenderers === true) return smallRendererBundles;
  if (cliArgs.configWorkers === true) return workerBundles;
  if (cliArgs.configRunOwletDownload === true) return runOwletDownload;

  return [...mainBundles, ...largeRendererBundles, ...smallRendererBundles, ...workerBundles];
};
