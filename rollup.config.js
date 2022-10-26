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

export default [
  bundle("main/main.ts", "main.js", ["electron", "electron-fetch", "fs", "jsonfile", "net", "os", "path", "ssh2"]),
  bundle("preload.ts", "preload.js", ["electron"]),

  bundle("hub/hub.ts", "hub.js"),
  bundle("hub/dataSources/rlogWorker.ts", "hub$rlogWorker.js"),
  bundle("hub/dataSources/wpilogWorker.ts", "hub$wpilogWorker.js"),
  bundle("hub/csvWorker.ts", "hub$csvWorker.js"),
  bundle("editRange.ts", "editRange.js"),
  bundle("unitConversion.ts", "unitConversion.js"),
  bundle("renameTab.ts", "renameTab.js"),
  bundle("download.ts", "download.js"),
  bundle("satellite.ts", "satellite.js"),
  bundle("preferences.ts", "preferences.js")
];
