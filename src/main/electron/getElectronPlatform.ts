// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

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
