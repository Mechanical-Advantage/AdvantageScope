import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const bundle = (name, isPreload, external = []) => ({
  input: "src/" + name + "/" + (isPreload ? "preload" : name) + ".ts",
  output: {
    file: "bundles/" + name + (isPreload ? "$preload" : "") + ".js",
    format: "cjs"
  },
  plugins: [typescript(), resolve(), commonjs()],
  external: external
});

export default [
  bundle("main", false, ["electron", "electron-fetch", "fs", "jsonfile", "os", "path"]),
  bundle("hub", false),
  bundle("download", false),
  bundle("satellite", false),
  bundle("preferences", false),
  bundle("hub", true),
  bundle("download", true),
  bundle("satellite", true),
  bundle("preferences", true)
];
