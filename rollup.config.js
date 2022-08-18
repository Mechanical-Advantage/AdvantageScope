import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

const bundle = (name) => ({
  input: "src/" + name + "/" + name + ".ts",
  output: {
    file: "bundles/" + name + ".js",
    format: "cjs"
  },
  plugins: [typescript(), terser()]
});

const preload = (name) => ({
  input: "src/" + name + "/preload.ts",
  output: {
    file: "bundles/" + name + "$preload.js",
    format: "cjs"
  },
  plugins: [typescript(), terser()]
});

export default [
  bundle("main"),
  bundle("hub"),
  bundle("download"),
  bundle("satellite"),
  bundle("preferences"),
  preload("hub"),
  preload("download"),
  preload("satellite"),
  preload("preferences")
];
