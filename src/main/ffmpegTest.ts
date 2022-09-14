import { spawn } from "child_process";
import { app } from "electron";
import path from "path";

export default function ffmpegTest() {
  let platformString = "";
  switch (process.platform) {
    case "darwin":
      platformString = "mac";
      break;
    case "linux":
      platformString = "linux";
      break;
    case "win32":
      platformString = "win";
      break;
  }
  let ffmpegPath = "";
  if (app.isPackaged) {
    ffmpegPath = path.join(__dirname, "..", "..", "ffmpeg-" + platformString + "-" + process.arch);
  } else {
    ffmpegPath = path.join(__dirname, "..", "ffmpeg", "ffmpeg-" + platformString + "-" + process.arch);
  }

  console.log("FFMPEG_PATH=" + ffmpegPath);
  const child = spawn(ffmpegPath);
  child.stdout.on("data", (data) => {
    console.log(`ffmpeg stdout: ${data}`);
  });

  child.stderr.on("data", (data) => {
    console.error(`ffmpeg stderr: ${data}`);
  });

  child.on("close", (code) => {
    console.log(`ffmpeg process exited with code ${code}`);
  });
}
