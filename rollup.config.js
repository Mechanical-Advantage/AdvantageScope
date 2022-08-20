import typescript from "@rollup/plugin-typescript";

const bundle = (name, isPreload) => ({
  input: "src/" + name + "/" + (isPreload ? "preload" : name) + ".ts",
  output: {
    file: "bundles/" + name + (isPreload ? "$preload" : "") + ".js",
    format: "cjs"
  },
  plugins: [typescript()]
});

export default [
  bundle("main", false),
  bundle("hub", false),
  bundle("download", false),
  bundle("satellite", false),
  bundle("preferences", false),
  bundle("hub", true),
  bundle("download", true),
  bundle("satellite", true),
  bundle("preferences", true)
];
