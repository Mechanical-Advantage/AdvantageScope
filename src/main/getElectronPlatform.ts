export default function getElectronPlatform(): string {
  let platform = "";
  switch (process.platform) {
    case "darwin":
      platform = "mac";
      break;
    case "linux":
      platform = "linux";
      break;
    case "win32":
      platform = "win";
      break;
  }
  let arch = process.arch === "arm" ? "armv7l" : process.arch;
  return platform + "-" + arch;
}
