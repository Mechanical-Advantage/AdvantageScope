// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { ChildProcess, spawn } from "child_process";
import download from "download";
import { BrowserWindow, app, dialog } from "electron";
import fs from "fs";
import crypto from "node:crypto";
import path from "path";
import { createUUID } from "../../shared/util";
import { VIDEO_CACHE, VIDEO_CACHE_FALLBACK, WINDOW_ICON } from "./ElectronConstants";
import getElectronPlatform from "./getElectronPlatform";

export class VideoProcessor {
  private static FFMPEG_DOWNLOAD_INFO: { [key: string]: { url: string; sha256: string } } = {
    "mac-x64": {
      url: "https://github.com/eugeneware/ffmpeg-static/releases/download/b6.0/ffmpeg-darwin-x64",
      sha256: "cfe20936c83ecf5d68e424b87e8cc45b24dd6be81787810123bb964a0df686f9"
    },
    "mac-arm64": {
      url: "https://github.com/eugeneware/ffmpeg-static/releases/download/b6.0/ffmpeg-darwin-arm64",
      sha256: "a90e3db6a3fd35f6074b013f948b1aa45b31c6375489d39e572bea3f18336584"
    },
    "win-x64": {
      url: "https://github.com/eugeneware/ffmpeg-static/releases/download/b6.0/ffmpeg-win32-x64",
      sha256: "e9fd5e711debab9d680955fc1e38a2c1160fd280b144476cc3f62bc43ef49db1"
    },
    "win-arm64": {
      url: "https://github.com/eugeneware/ffmpeg-static/releases/download/b6.0/ffmpeg-win32-ia32",
      sha256: "fb3766af5cc193ca863e15cd4554a33732973209dad5e3c1433b5e291bceb16c"
    }
  };
  private static processes: { [id: string]: ChildProcess } = {}; // Key is tab UUID
  private static async getFFmpegPath(window: BrowserWindow): Promise<string> {
    // Check for AdvantageScope install (user data folder)
    // Not compatible with Linux due to DNS issues, force a system install
    let ffmpegPath: string;
    if (process.platform === "win32") {
      ffmpegPath = path.join(app.getPath("userData"), "ffmpeg.exe");
    } else {
      ffmpegPath = path.join(app.getPath("userData"), "ffmpeg");
    }
    if (process.platform !== "linux" && fs.existsSync(ffmpegPath)) {
      return ffmpegPath;
    }

    // Check for system install
    let systemFFmpegValid = false;
    try {
      let testProcess = spawn("ffmpeg", ["-version"]);
      await new Promise<void>((resolve) => {
        testProcess.on("close", (code) => {
          if (code === 0) {
            systemFFmpegValid = true;
          }
          resolve();
        });
        testProcess.on("error", () => {
          resolve();
        });
      });
    } catch {}
    if (systemFFmpegValid) {
      return "ffmpeg";
    }

    // Exit immediately on Linux
    if (process.platform === "linux") {
      await dialog.showMessageBox(window, {
        type: "question",
        title: "Alert",
        message: "FFmpeg Installation Required",
        detail: "FFmpeg is required to process videos files. Please install FFmpeg and add to the PATH.",
        buttons: ["OK"],
        defaultId: 0,
        icon: WINDOW_ICON
      });
      throw "Failed";
    }

    // Download FFmpeg on Windows and macOS
    let ffmpegDownloadResponse = await dialog.showMessageBox(window, {
      type: "question",
      title: "Alert",
      message: "Download FFmpeg?",
      detail:
        'FFmpeg is required to process videos files. Select "Continue" to download automatically, or install FFmpeg manually and add to the PATH.',
      buttons: ["Continue", "Stop"],
      defaultId: 0,
      icon: WINDOW_ICON
    });
    if (ffmpegDownloadResponse.response === 1) {
      throw "Failed";
    }

    // Perform download
    let folder = app.getPath("userData");
    let filenameTemp = "ffmpeg-download";
    let filename = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
    let downloadInfo = this.FFMPEG_DOWNLOAD_INFO[getElectronPlatform()];
    await download(downloadInfo.url, folder, {
      filename: filenameTemp
    });

    // Verify hash
    let hash = crypto
      .createHash("sha256")
      .update(await fs.promises.readFile(path.join(folder, filenameTemp)))
      .digest("hex");
    if (hash !== downloadInfo.sha256) {
      console.warn("FFmpeg hash violation!");
      console.warn("\tFound: " + hash);
      console.warn("\tExpected: " + downloadInfo.sha256);
      await fs.promises.unlink(path.join(folder, filenameTemp));
      throw "Failed";
    }
    await fs.promises.rename(path.join(folder, filenameTemp), path.join(folder, filename));
    await fs.promises.chmod(path.join(folder, filename), 0o755);
    return ffmpegPath;
  }

  /** Loads a video based on a request from the hub window. */
  static prepare(window: BrowserWindow, uuid: string, dataCallback: (data: any) => void) {
    let loadPath = async (videoPath: string, videoCache: string) => {
      // Find FFmpeg path
      let ffmpegPath: string;
      try {
        ffmpegPath = await this.getFFmpegPath(window);
      } catch {
        dataCallback({ uuid: uuid, error: true });
        return;
      }

      // Indicate download has started
      dataCallback({ uuid: uuid });

      // Create cache folder
      let cachePath = path.join(videoCache, createUUID()) + path.sep;
      if (fs.existsSync(cachePath)) {
        fs.rmSync(cachePath, { recursive: true });
      }
      fs.mkdirSync(cachePath, { recursive: true });

      // Start ffmpeg
      if (uuid in VideoProcessor.processes) VideoProcessor.processes[uuid].kill();

      const ffmpegArgs: string[] = [
        "-i",
        videoPath,
        "-vf",
        "scale=1920:-2,setsar=1:1", // Limit to 1920px width
        "-q:v",
        "2",
        path.join(cachePath, "%08d.jpg")
      ];

      let ffmpeg = spawn(ffmpegPath, ffmpegArgs);
      VideoProcessor.processes[uuid] = ffmpeg;
      let running = true;
      let fullOutput = "";
      let fps = 0;
      let width = 0;
      let height = 0;
      let durationSecs = 0;
      let completedFrames = 0;

      // Send error message and exit
      let sendError = () => {
        running = false;
        ffmpeg.kill();
        dataCallback({ uuid: uuid, error: true });
        dialog.showMessageBox(window, {
          type: "error",
          title: "Error",
          message: "Failed to process video",
          detail: "There was a problem while processing the video. Please try again.",
          icon: WINDOW_ICON
        });
        console.log("*** START FFMPEG OUTPUT ***");
        console.log(fullOutput);
        console.log("*** END FFMPEG OUTPUT ***");
      };

      // New data, get status
      ffmpeg.stderr.on("data", (data: Buffer) => {
        if (!running) return;
        let text = data.toString();
        fullOutput += text;
        if (text.includes(" fps, ")) {
          // Get FPS
          let fpsIndex = text.lastIndexOf(" fps, ");
          let fpsStartIndex = text.lastIndexOf(" ", fpsIndex - 1);
          fps = Number(text.slice(fpsStartIndex + 1, fpsIndex));
          if (isNaN(fps)) {
            sendError();
            return;
          }

          // Get dimensions
          let regexResult = /, [0-9]+x[0-9]+/.exec(text);
          if (regexResult === null) {
            sendError();
            return;
          }
          let dimensionsXIndex = text.indexOf("x", regexResult.index + 2);
          width = Number(text.substring(regexResult.index + 2, dimensionsXIndex));
          let dimensionsHeightEnd = /[^0-9]/.exec(text.substring(dimensionsXIndex + 1));
          if (dimensionsHeightEnd === null) {
            sendError();
            return;
          }
          let dimensionsHeightEndIndex = dimensionsXIndex + dimensionsHeightEnd.index;
          height = Number(text.substring(dimensionsXIndex + 1, dimensionsHeightEndIndex + 1));
          if (isNaN(width) || isNaN(height)) {
            sendError();
            return;
          }
        }
        if (text.includes("Duration: ")) {
          // Get duration
          let durationIndex = text.lastIndexOf("Duration: ");
          let durationText = text.slice(durationIndex + 10, durationIndex + 21);
          durationSecs =
            Number(durationText.slice(0, 2)) * 3600 +
            Number(durationText.slice(3, 5)) * 60 +
            Number(durationText.slice(6, 8)) +
            Number(durationText.slice(9, 11)) * 0.01;
          if (isNaN(durationSecs)) {
            sendError();
            return;
          }
        }
        if (text.startsWith("frame=")) {
          // Exit if initial information not collected
          if (fps === 0 || durationSecs === 0 || width === 0 || height === 0) {
            sendError();
            return;
          }

          // Updated frame count
          let fpsIndex = text.indexOf(" fps=");
          completedFrames = Number(text.slice(6, fpsIndex));
          if (isNaN(completedFrames)) {
            sendError();
            return;
          }

          // Send status
          dataCallback({
            uuid: uuid,
            imgFolder: cachePath,
            fps: fps,
            totalFrames: Math.round(durationSecs * fps),
            completedFrames: completedFrames
          });
        }
      });

      // Finished, check status code
      ffmpeg.on("close", (code) => {
        if (!running) return;
        if (code === 0) {
          dataCallback({
            uuid: uuid,
            imgFolder: cachePath,
            fps: fps,
            totalFrames: completedFrames, // In case original value was inaccurate
            completedFrames: completedFrames
          });
        } else if (code === 1) {
          if (videoCache === VIDEO_CACHE && fullOutput.includes("No space left on device")) {
            fs.rmSync(cachePath, { recursive: true });
            loadPath(videoPath, VIDEO_CACHE_FALLBACK);
          } else {
            sendError();
          }
        }
      });
    };

    this.getLocalPath(window)
      .then((path) => loadPath(path, VIDEO_CACHE))
      .catch(() => {});
  }

  /** Displays a selector for a local file */
  private static getLocalPath(window: BrowserWindow): Promise<string> {
    return dialog
      .showOpenDialog(window, {
        title: "Select a video to open",
        properties: ["openFile"],
        filters: [{ name: "Videos", extensions: VideoProcessor.extensions }]
      })
      .then((result) => {
        if (result.canceled || result.filePaths.length === 0) {
          throw new Error();
        }
        return result.filePaths[0];
      });
  }

  /** Cleans up remaining ffmpeg processes and caches */
  static cleanup() {
    Object.values(VideoProcessor.processes).forEach((process) => {
      process.kill();
    });
    [VIDEO_CACHE, VIDEO_CACHE_FALLBACK].forEach((videoCache) => {
      if (fs.existsSync(videoCache)) {
        try {
          fs.rmSync(videoCache, { recursive: true });
        } catch {
          // ffmpeg might not have shut down completely, and "rmSync" will
          // sometimes throw an exception if files are still being written.
          // Fail silently instead of crashing since the OS will clear the
          // few remaining images automatically (or we will on the next shutdown).
        }
      }
    });
  }

  // https://github.com/sindresorhus/video-extensions
  private static extensions: string[] = [
    "3g2",
    "3gp",
    "aaf",
    "asf",
    "avchd",
    "avi",
    "drc",
    "flv",
    "m2v",
    "m3u8",
    "m4p",
    "m4v",
    "mkv",
    "mng",
    "mov",
    "mp2",
    "mp4",
    "mpe",
    "mpeg",
    "mpg",
    "mpv",
    "mxf",
    "nsv",
    "ogg",
    "ogv",
    "qt",
    "rm",
    "rmvb",
    "roq",
    "svi",
    "vob",
    "webm",
    "wmv",
    "yuv"
  ];
}
