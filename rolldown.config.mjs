// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import fs from "fs";
import { replacePlugin } from "rolldown/plugins";
import cleanup from "rollup-plugin-cleanup";

const isWpilib = process.env.ASCOPE_DISTRIBUTION === "WPILIB";
const isLite = process.env.ASCOPE_DISTRIBUTION === "LITE";
const licenseHeader =
  "// Copyright (c) 2021-2026 Littleton Robotics\n// http://github.com/Mechanical-Advantage\n//\n// Use of this source code is governed by a BSD\n// license that can be found in the LICENSE file\n// at the resources directory of this application.\n";

function bundle(input, isMain, isXRClient, external = []) {
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
      banner: licenseHeader
    },
    context: "this",
    external: external,
    checks: {
      pluginTimings: false
    },
    plugins: [
      typescript(),
      ...(isXRClient
        ? [
            getBabelOutputPlugin({
              presets: [["@babel/preset-env", { modules: false }]],
              compact: true,
              targets: "iOS 16" // AdvantageScope XR is built for iOS 16
            }),
            terser()
          ]
        : isLite
        ? [
            getBabelOutputPlugin({
              presets: [["@babel/preset-env", { modules: false }]],
              compact: true,
              targets: "> 0.1%, not dead"
            }),
            terser({ mangle: { reserved: ["Module"] } })
          ]
        : [cleanup()]),
      replacePlugin(
        {
          __distribution__: isWpilib ? "WPILib" : isLite ? "Lite" : "FRC6328",
          __version__: packageJson.version,
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

export default (cliArgs) => {
  // Owlet download
  if (cliArgs.configRunOwletDownload === true) {
    return [
      {
        input: "src/runOwletDownload.ts",
        output: {
          file: "runOwletDownload.js",
          format: "cjs"
        },
        context: "this",
        external: ["download"],
        plugins: [typescript()],
        onwarn() {}
      }
    ];
  }

  return [
    // Main bundles
    ...(isLite
      ? [bundle(["main/lite/main.ts"], false, false)]
      : [
          bundle(["main/electron/main.ts"], true, false, [
            "electron",
            "fs",
            "jsonfile",
            "net",
            "os",
            "ws",
            "http",
            "path",
            "basic-ftp",
            "download",
            "youtube-dl-exec",
            "tesseract.js",
            "lzma-native",
            "@rev-robotics/revlog-converter"
          ]),
          bundle(["preload.ts"], true, false, ["electron"])
        ]),

    // App bundles
    bundle(
      [
        "hub/hub.ts",
        ...(isLite ? [] : ["satellite.ts"]),

        "editRange.ts",
        "unitConversion.ts",
        "renameTab.ts",
        "editFov.ts",
        "sourceListHelp.ts",
        "betaWelcome.ts",
        "preferences.ts",
        "licenses.ts",
        "download.ts",
        ...(isLite ? ["uploadAsset.ts"] : []),
        ...(isLite ? [] : ["export.ts"]),
        ...(isLite ? [] : ["xrControls.ts"]),

        "hub/dataSources/csv/csvWorker.ts",
        "hub/dataSources/rlog/rlogWorker.ts",
        "hub/dataSources/roadrunnerlog/roadRunnerWorker.ts",
        "hub/dataSources/wpilog/wpilogWorker.ts",
        "hub/dataSources/dslog/dsLogWorker.ts",
        ...(isLite ? [] : ["hub/exportWorker.ts"]),
        "shared/renderers/field3d/workers/loadField.ts",
        "shared/renderers/field3d/workers/loadRobot.ts"
      ],
      false,
      false
    ),

    // XR client
    ...(isLite ? [] : [bundle(["xrClient/xrClient.ts"], false, true)])
  ];
};
