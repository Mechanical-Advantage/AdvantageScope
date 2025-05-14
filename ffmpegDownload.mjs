// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import download from "download";
import fs from "fs";
import path from "path";

// Exit if disabled
if (process.env.ASCOPE_NO_FFMPEG === "true") {
  process.exit();
}

// Configuration
const folder = "ffmpeg";
const versions = {
  "ffmpeg-mac-x64": "https://github.com/eugeneware/ffmpeg-static/releases/download/b5.0.1/darwin-x64",
  "ffmpeg-mac-arm64": "https://github.com/eugeneware/ffmpeg-static/releases/download/b5.0.1/darwin-arm64",
  "ffmpeg-linux-x64": "https://github.com/eugeneware/ffmpeg-static/releases/download/b5.0.1/linux-x64",
  "ffmpeg-linux-arm64": "https://github.com/eugeneware/ffmpeg-static/releases/download/b5.0.1/linux-arm64",
  "ffmpeg-linux-armv7l": "https://github.com/eugeneware/ffmpeg-static/releases/download/b5.0.1/linux-arm",
  "ffmpeg-win-x64.exe": "https://github.com/eugeneware/ffmpeg-static/releases/download/b5.0.1/win32-x64",
  "ffmpeg-win-arm64.exe": "https://github.com/eugeneware/ffmpeg-static/releases/download/b5.0.1/win32-ia32"
};

// Download files
console.log("Downloading ffmpeg...");
if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder);
}
for (let [filename, url] of Object.entries(versions)) {
  if (fs.existsSync(path.join(process.cwd(), folder, filename))) {
    console.log('Skipped downloading "' + filename + '"');
  } else {
    download(url, path.join(process.cwd(), folder), { filename: filename }).then(() => {
      fs.chmodSync(path.join(process.cwd(), folder, filename), 0o755);
      console.log('Finished downloading "' + filename + '"');
    });
  }
}
