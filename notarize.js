const { notarize } = require("@electron/notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  const appleId = process.env.APPLE_ID;
  const appleIdPwd = process.env.APPLE_ID_PWD;
  if (electronPlatformName !== "darwin" || !appleId || !appleIdPwd) {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    tool: "notarytool",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: appleId,
    appleIdPassword: appleIdPwd,
    teamId: "6S3UQC528P" // Team ID for Apple Developer organization
  });
};
