// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { ChildProcess, spawn } from "child_process";
import download from "download";
import { BrowserWindow, Menu, MenuItem, app, clipboard, dialog } from "electron";
import fs from "fs";
import jsonfile from "jsonfile";
import crypto from "node:crypto";
import path from "path";
import Tesseract, { createWorker } from "tesseract.js";
import youtubedl, { Exec, Payload } from "youtube-dl-exec";
import MatchInfo from "../../shared/MatchInfo";
import Preferences from "../../shared/Preferences";
import { getTBAMatchInfo, getTBAMatchKey } from "../../shared/TBAUtil";
import VideoSource from "../../shared/VideoSource";
import { createUUID, zfill } from "../../shared/util";
import { PREFS_FILENAME, VIDEO_CACHE, VIDEO_CACHE_FALLBACK, WINDOW_ICON } from "./ElectronConstants";
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
  private static NUM_TESSERACT_WORKERS = 8;
  private static TIMER_RECTS = [
    // Small format - 2023 and older
    {
      left: 1040 / 1920,
      top: 760 / 1080,
      width: 80 / 1920,
      height: 40 / 1080
    },

    // Large banner format (lower) - 2023 and older
    {
      left: 895 / 1920,
      top: 905 / 1080,
      width: 130 / 1920,
      height: 80 / 1080
    },

    // Large banner format (upper) - 2023 and older
    {
      left: 895 / 1920,
      top: 80 / 1080,
      width: 130 / 1920,
      height: 80 / 1080
    },

    // Small format - 2024
    {
      left: 925 / 1920,
      top: 1005 / 1080,
      width: 75 / 1920,
      height: 30 / 1080
    },

    // Large banner format (lower) - 2024/2025
    {
      left: 865 / 1920,
      top: 980 / 1080,
      width: 200 / 1920,
      height: 90 / 1080
    },

    // Large banner format (upper) - 2024/2025
    {
      left: 865 / 1920,
      top: 160 / 1080,
      width: 200 / 1920,
      height: 90 / 1080
    },

    // Web stream format (lower) - 2025
    {
      left: 900 / 1920,
      top: 960 / 1080,
      width: 120 / 1920,
      height: 68 / 1080
    },

    // Web stream format (upper) - 2025
    {
      left: 900 / 1920,
      top: 65 / 1080,
      width: 120 / 1920,
      height: 68 / 1080
    }
  ];

  private static processes: { [id: string]: ChildProcess } = {}; // Key is tab UUID
  private static tesseractScheduler = Tesseract.createScheduler();
  private static ytInst: (...args: Parameters<Exec>) => Promise<Payload | string>;

  static {
    // Initialize Tesseract
    let langPath: string;
    if (app.isPackaged) {
      langPath = path.join(__dirname, "..", "..");
    } else {
      langPath = path.join(__dirname, "..");
    }
    for (let i = 0; i < this.NUM_TESSERACT_WORKERS; i++) {
      createWorker("eng", undefined, {
        langPath: langPath,
        cacheMethod: "readOnly",
        gzip: true
      }).then((worker) => {
        this.tesseractScheduler.addWorker(worker);
      });
    }

    // Initialize youtube-dl-exec
    if (app.isPackaged) {
      const fullBinaryPath = path.join(
        __dirname,
        "..",
        "..",
        "app.asar.unpacked",
        "node_modules",
        "youtube-dl-exec",
        "bin",
        process.platform === "win32" ? "yt-dlp.exe" : process.platform === "darwin" ? "yt-dlp_macos" : "yt-dlp"
      );
      const binaryDir = path.dirname(fullBinaryPath);
      const binaryName = `.${path.sep}${path.basename(fullBinaryPath)}`;
      const rawYt = youtubedl.create(binaryName);
      this.ytInst = (url, flags, options) => {
        return rawYt(url, flags, { cwd: binaryDir, ...options });
      };
    } else {
      this.ytInst = youtubedl;
    }
  }

  /**
   * Helper to run youtube-dl-exec.
   * Catches errors regarding missing Python and displays a dialog to the user.
   */
  private static async runYoutubeDl(url: string, flags: any, window?: BrowserWindow): Promise<any> {
    try {
      return await VideoProcessor.ytInst(url, flags);
    } catch (e: any) {
      const errorStr = String(e);
      // Check for common error indicators that Python is missing or invalid
      if (
        errorStr.includes("python3") ||
        errorStr.includes("Python") ||
        errorStr.includes("ENOENT") ||
        (e.code && e.code === "ENOENT")
      ) {
        console.error(e);
        if (window && !window.isDestroyed()) {
          dialog.showMessageBox(window, {
            type: "error",
            title: "Error",
            message: "Python Installation Required",
            detail:
              "This feature requires Python 3.10 or above available in your system. Please install Python and try again.",
            icon: WINDOW_ICON
          });
        }
        throw new Error("Python missing");
      }
      throw e;
    }
  }

  private static getVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

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
      .update(fs.readFileSync(path.join(folder, filenameTemp)))
      .digest("hex");
    if (hash !== downloadInfo.sha256) {
      console.warn("FFmpeg hash violation!");
      console.warn("\tFound: " + hash);
      console.warn("\tExpected: " + downloadInfo.sha256);
      fs.rmSync(path.join(folder, filenameTemp));
      throw "Failed";
    }
    fs.renameSync(path.join(folder, filenameTemp), path.join(folder, filename));
    fs.chmodSync(path.join(folder, filename), 0o755);
    return ffmpegPath;
  }

  /** Loads a video based on a request from the hub window. */
  static prepare(
    window: BrowserWindow,
    uuid: string,
    source: VideoSource,
    matchInfo: MatchInfo | null,
    menuCoordinates: null | [number, number],
    dataCallback: (data: any) => void
  ) {
    let loadPath = async (videoPath: string, videoCache: string, httpHeaders?: any) => {
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

      const ffmpegArgs: string[] = [];
      if (httpHeaders) {
        ffmpegArgs.push("-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_delay_max", "5");
        let headersStr = "";
        for (const [key, value] of Object.entries(httpHeaders)) {
          headersStr += `${key}: ${value}\r\n`;
        }
        ffmpegArgs.push("-headers", headersStr);
      }
      ffmpegArgs.push(
        "-i",
        videoPath,
        "-vf",
        "scale=1920:-2,setsar=1:1", // Limit to 1920px width
        "-q:v",
        "2",
        path.join(cachePath, "%08d.jpg")
      );

      let ffmpeg = spawn(ffmpegPath, ffmpegArgs);
      VideoProcessor.processes[uuid] = ffmpeg;
      let running = true;
      let fullOutput = "";
      let fps = 0;
      let width = 0;
      let height = 0;
      let durationSecs = 0;
      let completedFrames = 0;
      let matchStartFrame = -1;
      let timerSample = 0;
      let timerValues: { frame: number; text: string }[] = [];
      let timerStartFound = false;

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

          // Start finding timer values
          if (!timerStartFound) {
            let time = completedFrames / fps;
            // 2s margin for frames being written
            while (timerSample < time - 2) {
              let sampleFrame = Math.round(timerSample * fps) + 1; // Frames are 1-indexed
              this.readTimerText(cachePath + zfill(sampleFrame.toString(), 8) + ".jpg", width, height).then(
                async (timerText) => {
                  if (timerStartFound) return;

                  // Insert frame
                  timerValues.push({ frame: sampleFrame, text: timerText });
                  timerValues.sort((a, b) => a.frame - b.frame);

                  // Search for 13 -> 12 transition
                  let lastIs13 = false;
                  let secs13Frame: number | null = null;
                  for (let i = 0; i < timerValues.length; i++) {
                    let is13 = timerValues[i].text.includes("13");
                    let is12 = !is13 && timerValues[i].text.includes("12");
                    if (lastIs13 && is12) {
                      secs13Frame = timerValues[i - 1].frame;
                      break;
                    }
                    lastIs13 = is13;
                  }
                  if (secs13Frame === null) return;
                  timerStartFound = true;

                  // Find exact frame
                  let jobs: Promise<string>[] = [];
                  for (let frame = secs13Frame; frame < secs13Frame + fps; frame++) {
                    jobs.push(this.readTimerText(cachePath + zfill(frame.toString(), 8) + ".jpg", width, height));
                  }
                  const results = await Promise.all(jobs);
                  results.forEach((timerText, index) => {
                    if (matchStartFrame > 0) return;
                    if (timerText.includes("12")) {
                      let secs12Frame = secs13Frame! + index;
                      matchStartFrame = Math.round(secs12Frame - fps * 3);
                    }
                  });
                }
              );
              timerSample++;
            }
          }

          // Send status
          dataCallback({
            uuid: uuid,
            imgFolder: cachePath,
            fps: fps,
            totalFrames: Math.round(durationSecs * fps),
            completedFrames: completedFrames,
            matchStartFrame: matchStartFrame
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
            completedFrames: completedFrames,
            matchStartFrame: matchStartFrame
          });
        } else if (code === 1) {
          if (videoCache === VIDEO_CACHE && fullOutput.includes("No space left on device")) {
            fs.rmSync(cachePath, { recursive: true });
            loadPath(videoPath, VIDEO_CACHE_FALLBACK, httpHeaders);
          } else {
            sendError();
          }
        }
      });
    };

    // Get URL based on source type
    switch (source) {
      case VideoSource.Local:
        this.getLocalPath(window)
          .then((path) => loadPath(path, VIDEO_CACHE))
          .catch(() => {});
        break;
      case VideoSource.YouTube:
        let clipboardText = clipboard.readText();
        if (!clipboardText.includes("youtube.com") && !clipboardText.includes("youtu.be")) {
          dataCallback({ uuid: uuid, error: true });
          dialog.showMessageBox(window, {
            type: "error",
            title: "Error",
            message: "Copy URL to clipboard",
            detail: "Please copy a YouTube URL to the clipboard, then try again.",
            icon: WINDOW_ICON
          });
        } else {
          this.getDirectUrlFromYouTubeUrl(clipboardText, window)
            .then((result) => loadPath(result.url, VIDEO_CACHE, result.httpHeaders))
            .catch((silent) => {
              dataCallback({ uuid: uuid, error: true });
              if (silent === true) return;
              dialog.showMessageBox(window, {
                type: "error",
                title: "Error",
                message: "YouTube download failed",
                detail:
                  "There was an error while trying to open the YouTube video. Note that this feature may fail unexpectedly due to changes on YouTube's servers. Please check for updates or choose a local video file instead.",
                icon: WINDOW_ICON
              });
            });
        }
        break;
      case VideoSource.TheBlueAlliance:
        this.getYouTubeUrlFromMatchInfo(matchInfo!, window, menuCoordinates!)
          .then((url) => {
            this.getDirectUrlFromYouTubeUrl(url, window)
              .then((result) => loadPath(result.url, VIDEO_CACHE, result.httpHeaders))
              .catch((silent) => {
                dataCallback({ uuid: uuid, error: true });
                if (silent === true) return;
              });
          })
          .catch((silent) => {
            dataCallback({ uuid: uuid, error: true });
            if (silent === true) return;
            dialog.showMessageBox(window, {
              type: "error",
              title: "Error",
              message: "TBA download failed",
              detail:
                "There was a problem finding the match video on The Blue Alliance. Please check your API key, or load the video using a YouTube URL or local file instead.",
              icon: WINDOW_ICON
            });
          });
        break;
    }
  }

  private static async readTimerText(imagePath: string, width: number, height: number): Promise<string> {
    const image = fs.readFileSync(imagePath);
    let result = "";
    for (let i = 0; i < this.TIMER_RECTS.length; i++) {
      let rect = this.TIMER_RECTS[i];
      const rectResult = await this.tesseractScheduler.addJob("recognize", image, {
        rectangle: {
          left: rect.left * width,
          top: rect.top * height,
          width: rect.width * width,
          height: rect.height * height
        }
      });
      if (rectResult) {
        result += rectResult.data.text;
      }
    }
    return result;
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

  /** Gets the direct download URL and User Agent based on a YouTube URL using youtube-dl-exec */
  private static getDirectUrlFromYouTubeUrl(
    youTubeUrl: string,
    window: BrowserWindow
  ): Promise<{ url: string; httpHeaders: any }> {
    return new Promise(async (resolve, reject) => {
      try {
        const videoId = VideoProcessor.getVideoId(youTubeUrl);
        if (!videoId) {
          reject();
          return;
        }
        const cleanUrl = "https://youtube.com/watch?v=" + videoId;

        // Get video info
        const output = await this.runYoutubeDl(
          cleanUrl,
          {
            dumpSingleJson: true,
            noWarnings: true,
            noCheckCertificates: true,
            forceIpv4: true,
            format: "best",
            extractorArgs: "youtube:player_client=android"
          },
          window
        );

        // Filter formats
        let formats = output.formats || [];
        // Filter for formats that have a video codec and are not too large
        formats = formats.filter((f: any) => f.vcodec && f.vcodec !== "none" && f.height <= 1080);
        // Sort by quality (height/resolution) descending
        formats.sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

        // Find best url and User Agent
        if (formats.length > 0) {
          resolve({ url: formats[0].url, httpHeaders: output.http_headers });
        } else {
          reject();
        }
      } catch (e) {
        // If it's not the "Python missing" error (which already showed a dialog), log it
        if (String(e) !== "Error: Python missing") {
          console.error(e);
        }
        reject(true); // Silent reject to avoid double dialogs if the caller also has a catch block
      }
    });
  }

  /** Uses the TBA API to get the YouTube URL for a match. */
  private static async getYouTubeUrlFromMatchInfo(
    matchInfo: MatchInfo,
    window: BrowserWindow,
    menuCoordinates: [number, number]
  ): Promise<string> {
    // Get TBA match key
    let preferences = jsonfile.readFileSync(PREFS_FILENAME) as Preferences;
    let tbaMatchKey = await getTBAMatchKey(matchInfo, preferences);

    // Get videos
    let videoKeys: string[] = [];
    {
      let allData = await getTBAMatchInfo(tbaMatchKey, preferences);
      let videoData = allData["videos"] as { key: string; type: string }[];
      videoKeys = videoData.filter((video) => video.type === "youtube").map((video) => video.key);
    }

    // If zero or one video, nothing more to do
    if (videoKeys.length === 0) {
      throw new Error();
    } else if (videoKeys.length === 1) {
      return "https://youtube.com/watch?v=" + videoKeys[0];
    } else {
      // Get titles of videos using youtube-dl-exec
      let titles: string[] = [];
      const titlePromises = videoKeys.map(async (key) => {
        try {
          const url = "https://youtube.com/watch?v=" + key;
          const output = await this.runYoutubeDl(
            url,
            {
              getTitle: true,
              noWarnings: true,
              noCheckCertificates: true
            },
            window
          );
          return (output as string).trim() || "Unknown Video";
        } catch (e) {
          if (String(e) === "Error: Python missing") throw e; // Stop immediately if python is missing
          return "Unknown Video";
        }
      });

      try {
        titles = await Promise.all(titlePromises);
      } catch (e) {
        throw true; // Silent reject
      }

      return new Promise((resolve, reject) => {
        const menu = new Menu();
        let resolved = false;
        for (let i = 0; i < videoKeys.length; i++) {
          menu.append(
            new MenuItem({
              label: titles[i],
              click() {
                resolved = true;
                resolve("https://youtube.com/watch?v=" + videoKeys[i]);
              }
            })
          );
        }
        menu.popup({
          window: window,
          x: Math.round(menuCoordinates[0]),
          y: Math.round(menuCoordinates[1])
        });
        menu.addListener("menu-will-close", () => {
          setTimeout(() => {
            if (!resolved) {
              reject(true);
            }
          }, 100);
        });
      });
    }
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
