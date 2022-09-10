import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const bundle = (input, output, external = []) => ({
  input: "src/" + input,
  output: {
    file: "bundles/" + output,
    format: "cjs"
  },
  plugins: [typescript(), nodeResolve(), commonjs()],
  external: external
});

export default [
  bundle("main/main.ts", "main.js", ["electron", "electron-fetch", "fs", "jsonfile", "net", "os", "path", "ssh2"]),
  bundle("preload/preload.ts", "preload.js", ["electron"]),

  bundle("hub/hub.ts", "hub.js"),
  bundle("hub/dataSources/rlogWorker.ts", "hub$rlogWorker.js"),
  bundle("hub/dataSources/wpilogWorker.ts", "hub$wpilogWorker.js"),
  bundle("hub/csvWorker.ts", "hub$csvWorker.js"),
  bundle("editAxis/editAxis.ts", "editAxis.js"),
  bundle("download/download.ts", "download.js"),
  bundle("satellite/satellite.ts", "satellite.js"),
  bundle("preferences/preferences.ts", "preferences.js")
];
