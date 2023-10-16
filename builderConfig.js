const fs = require("fs");

module.exports = () => {
  const isWpilib = process.env.ASCOPE_DISTRIBUTOR === "WPILIB";
  const package = JSON.parse(
    fs.readFileSync("package.json", {
      encoding: "utf-8"
    })
  );
  return {
    productName: isWpilib ? "AdvantageScope (WPILib)" : "AdvantageScope",
    appId: "org.littletonrobotics.advantagescope",
    copyright: package.copyright,
    npmRebuild: false,
    publish: [],
    afterSign: "notarize.js",
    files: ["www/**/*", "bundles/*", "icons/**/*", "!icons/**/*.iconset", "bundledAssets/**/*", "docs/**/*", "!**/.*"],
    extraResources: [
      {
        from: "ffmpeg",
        filter: ["ffmpeg-${os}-${arch}*"]
      },
      "LICENSE",
      "ThirdPartyLicenses.txt"
    ],
    fileAssociations: [
      {
        ext: "wpilog",
        name: "WPILib robot log",
        description: "WPILib robot log",
        mimeType: "application/x-wpilog",
        role: "Viewer",
        icon: "icons/app/wpilog-icon"
      },
      {
        ext: "rlog",
        name: "Robot log",
        description: "Robot log",
        mimeType: "application/x-rlog",
        role: "Viewer",
        icon: "icons/app/rlog-icon"
      },
      {
        ext: "dslog",
        name: "FRC Driver Station log",
        description: "FRC Driver Station log",
        mimeType: "application/x-dslog",
        role: "Viewer",
        icon: "icons/app/dslog-icon"
      },
      {
        ext: "dsevents",
        name: "FRC Driver Station events",
        description: "FRC Driver Station events",
        mimeType: "application/x-dsevents",
        role: "Viewer",
        icon: "icons/app/dsevents-icon"
      }
    ],
    mac: {
      target: isWpilib ? "dir" : "dmg",
      icon: "icons/app/app-icon.icns",
      entitlements: "entitlements.mac.plist",
      entitlementsInherit: "entitlements.mac.plist",
      notarize: false
    },
    linux: {
      target: isWpilib ? "AppImage" : ["AppImage", "snap", "flatpak", "deb", "rpm", "pacman"],
      icon: "icons/app/app-icons-linux",
      category: "Utility"
    },
    flatpak: {
      runtimeVersion: "22.08",
      baseVersion: "22.08"
    },
    win: {
      target: isWpilib ? "portable" : "nsis",
      icon: "icons/app/app-icon.ico"
    }
  };
};
