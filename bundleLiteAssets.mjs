import download from "download";
import fs from "fs-extra";
import path from "path";

// Constants
const bundledAssetsPath = "bundledAssets";
const liteAssetsPath = path.join("lite", "bundledAssets");
const githubAssetsRepository = "Mechanical-Advantage/AdvantageScopeAssets";
const githubAssetsTag = "default-assets-v2";
const githubAssetNames = [
  "Field2d_2025FRCFieldWeldedV2",
  "Field2d_20242025FTCFieldV1",
  "Field3d_2025FRCFieldWeldedV2",
  "Field3d_20242025FTCFieldV1",
  "Joystick_LogitechF310V1",
  "Joystick_PS4ControllerV1",
  "Joystick_XboxControllerBlueV1",
  "Joystick_XboxControllerWhiteV1",
  "Robot_2025FRCKitBotV2",
  "Robot_FTCDriveBaseV1"
];

// Delete existing Lite assets
if (fs.existsSync(liteAssetsPath)) {
  fs.rmSync(liteAssetsPath, { recursive: true });
}

// Copy basic bundled assets
fs.copySync(bundledAssetsPath, liteAssetsPath);

// Download GitHub assets
githubAssetNames.forEach((asset) => {
  const url = `https://github.com/${githubAssetsRepository}/releases/download/${githubAssetsTag}/${asset}.zip`;
  const destination = path.join(liteAssetsPath, asset);
  download(url, destination, { extract: true }).then(() => {
    console.log("Finished downloading '" + asset + "'");
  });
});
