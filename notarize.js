// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

const { notarize } = require("@electron/notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }

  const appleId = process.env.APPLE_ID;
  const appleIdPwd = process.env.APPLE_ID_PWD;
  const appleIdTeam = process.env.APPLE_ID_TEAM;
  if (!appleId || !appleIdPwd || !appleIdTeam) {
    console.log("No Apple ID provided, skipping notarization");
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  console.log("Notarizing...");
  return await notarize({
    tool: "notarytool",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: appleId,
    appleIdPassword: appleIdPwd,
    teamId: appleIdTeam
  });
};
