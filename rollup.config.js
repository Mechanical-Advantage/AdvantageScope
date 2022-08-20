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
  bundle("main/main.ts", "main.js", ["electron", "electron-fetch", "fs", "jsonfile", "os", "path"]),

  bundle("hub/hub.ts", "hub.js"),
  bundle("hub/preload.ts", "hub$preload.js", ["electron"]),
  bundle("hub/sources/rlogworker.ts", "hub$rlogworker.js"),

  bundle("download/download.ts", "download.js"),
  bundle("download/preload.ts", "download$preload."),

  bundle("satellite/satellite.ts", "satellite.js"),
  bundle("satellite/preload.ts", "satellite$preload.js"),

  bundle("preferences/preferences.ts", "preferences.js"),
  bundle("preferences/preload.ts", "preferences$preload.js")
];
