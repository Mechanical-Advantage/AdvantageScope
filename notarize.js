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
    tool: "legacy",
    appPath: `${appOutDir}/${appName}.app`,
    appBundleId: "org.littletonrobotics.advantagescope",
    appleId: appleId,
    appleIdPassword: appleIdPwd
  });
};
