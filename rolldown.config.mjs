// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";
import fs from "fs";
import { replacePlugin } from "rolldown/plugins";
import cleanup from "rollup-plugin-cleanup";

const isWpilib = process.env.ASCOPE_DISTRIBUTION === "WPILIB";
const isDS = process.env.ASCOPE_DISTRIBUTION === "LITEDS";
const isLite = process.env.ASCOPE_DISTRIBUTION === "LITE" || isDS;
const licenseHeader =
  "// Copyright (c) 2021-2026 Littleton Robotics\n// Copyright (c) 2026 Melbourne University Motorsport\n// http://github.com/Mechanical-Advantage\n//\n// Use of this source code is governed by a BSD\n// license that can be found in the LICENSE file\n// at the resources directory of this application.\n";

/**
 * @import { RolldownOptions } from "rolldown"
 * @param input {string[]}
 * @param isMain {boolean}
 * @param external {string[]}
 * @returns {RolldownOptions}
 */
function bundle(input, isMain, external = []) {
  const packageJson = JSON.parse(
    fs.readFileSync("package.json", {
      encoding: "utf-8"
    })
  );
  return {
    input: input.map((input) => "src/" + input),
    output: {
      dir: (isLite ? "lite/static/" : "") + "bundles/",
      chunkFileNames: "chunk/[name].js",
      format: isMain ? "cjs" : "es",
      banner: licenseHeader,
      minify: isLite || "dce-only",
      minifyInternalExports: isLite
    },
    context: "this",
    external: external,
    checks: {
      pluginTimings: false
    },
    plugins: [
      typescript(),
      isLite
        ? getBabelOutputPlugin({
            presets: [["@babel/preset-env", { modules: false }]],
            compact: true,
            targets: "> 0.1%, not dead"
          })
        : cleanup(),
      replacePlugin(
        {
          __distribution__: isWpilib ? "WPILib" : isDS ? "LiteDS" : isLite ? "Lite" : "FRC6328",
          __version__: packageJson.version,
          __build_date__: new Date().toISOString(),
          __copyright__: packageJson.build.copyright
        },
        {
          preventAssignment: true
        }
      )
    ],
    onwarn(message, warn) {
      // Hide warnings about protobufjs circular dependencies
      // https://github.com/protobufjs/protobuf.js/issues/1402
      if (message.code === "CIRCULAR_DEPENDENCY") return;
      warn(message);
    }
  };
}

export default () => {
  return [
    // Main bundles
    ...(isLite
      ? [bundle(["main/lite/main.ts"], false)]
      : [
          bundle(["main/electron/main.ts"], true, [
            "electron",
            "fs",
            "jsonfile",
            "net",
            "os",
            "http",
            "path",
            "download",
            "lzma-native"
          ]),
          bundle(["preload.ts"], true, ["electron"])
        ]),

    // App bundles
    bundle(
      [
        "hub/hub.ts",
        ...(!isLite ? ["satellite.ts"] : []),

        "editRange.ts",
        "unitConversion.ts",
        "renameTab.ts",
        "sourceListHelp.ts",
        "licenses.ts",
        ...(!isLite ? ["export.ts"] : []),
        ...(!isDS ? ["preferences.ts", "editFov.ts"] : []),
        ...(isLite ? ["download.ts"] : []),
        ...(isLite && !isDS ? ["uploadAsset.ts"] : []),

        "hub/dataSources/wpilog/wpilogWorker.ts",
        ...(isLite ? ["main/lite/xzWorker.ts"] : []),
        ...(!isLite ? ["hub/exportWorker.ts"] : []),
        ...(!isDS
          ? [
              "hub/dataSources/csv/csvWorker.ts",
              "hub/dataSources/rlog/rlogWorker.ts",
              "hub/dataSources/roadrunnerlog/roadRunnerWorker.ts",
              "hub/dataSources/dslog/dsLogWorker.ts",
              "shared/renderers/field3d/workers/loadField.ts",
              "shared/renderers/field3d/workers/loadRobot.ts"
            ]
          : [])
      ],
      false
    )
  ];
};
