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
