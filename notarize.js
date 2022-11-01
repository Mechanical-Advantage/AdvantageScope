const { notarize } = require("@electron/notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }

  const appleId = process.env.APPLE_ID;
  const appleIdPwd = process.env.APPLE_ID_PWD;
  if (!appleId || !appleIdPwd) {
    console.log("Skipped notarization, no Apple ID provided");
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  console.log("Notarizing...");
  return await notarize({
    tool: "notarytool",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: appleId,
    appleIdPassword: appleIdPwd,
    teamId: "6S3UQC528P" // Team ID for Apple Developer organization
  });
};
