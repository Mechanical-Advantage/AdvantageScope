import ytdl from "@distube/ytdl-core";
import { ChildProcess, spawn } from "child_process";
import { BrowserWindow, Menu, MenuItem, app, clipboard, dialog } from "electron";
import fs from "fs";
import jsonfile from "jsonfile";
import path from "path";
import Tesseract, { createWorker } from "tesseract.js";
import MatchInfo from "../shared/MatchInfo";
import Preferences from "../shared/Preferences";
import { getTBAMatchInfo, getTBAMatchKey } from "../shared/TBAUtil";
import VideoSource from "../shared/VideoSource";
import { createUUID, zfill } from "../shared/util";
import { PREFS_FILENAME, VIDEO_CACHE, VIDEO_CACHE_FALLBACK, WINDOW_ICON } from "./Constants";
import getElectronPlatform from "./getElectronPlatform";

export class VideoProcessor {
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

  static {
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
  }

  /** Loads a video based on a request from the hub window. */
  static prepare(
    window: BrowserWindow,
    uuid: string,
    source: VideoSource,
    matchInfo: MatchInfo | null,
    menuCoordinates: null | [number, number],
    callback: (data: any) => void
  ) {
    let loadPath = (videoPath: string, videoCache: string) => {
      // Indicate download has started
      callback({ uuid: uuid });

      // Create cache folder
      let cachePath = path.join(videoCache, createUUID()) + path.sep;
      if (fs.existsSync(cachePath)) {
        fs.rmSync(cachePath, { recursive: true });
      }
      fs.mkdirSync(cachePath, { recursive: true });

      // Find ffmpeg path
      let ffmpegPath: string;
      if (app.isPackaged) {
        ffmpegPath = path.join(__dirname, "..", "..", "ffmpeg-" + getElectronPlatform());
      } else {
        ffmpegPath = path.join(__dirname, "..", "ffmpeg", "ffmpeg-" + getElectronPlatform());
      }

      // Start ffmpeg
      if (uuid in VideoProcessor.processes) VideoProcessor.processes[uuid].kill();
      let ffmpeg = spawn(ffmpegPath, [
        "-i",
        videoPath,
        "-vf",
        "scale=1920:-2,setsar=1:1", // Limit to 1920px width
        "-q:v",
        "2",
        path.join(cachePath, "%08d.jpg")
      ]);
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
        callback({ uuid: uuid, error: true });
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
          callback({
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
          callback({
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
            loadPath(videoPath, VIDEO_CACHE_FALLBACK);
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
          callback({ uuid: uuid, error: true });
          dialog.showMessageBox(window, {
            type: "error",
            title: "Error",
            message: "Copy URL to clipboard",
            detail: "Please copy a YouTube URL to the clipboard, then try again.",
            icon: WINDOW_ICON
          });
        } else {
          this.getDirectUrlFromYouTubeUrl(clipboardText)
            .then((path) => loadPath(path, VIDEO_CACHE))
            .catch(() => {
              callback({ uuid: uuid, error: true });
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
            this.getDirectUrlFromYouTubeUrl(url)
              .then((path) => loadPath(path, VIDEO_CACHE))
              .catch(() => {
                callback({ uuid: uuid, error: true });
                dialog.showMessageBox(window, {
                  type: "error",
                  title: "Error",
                  message: "YouTube download failed",
                  detail:
                    "There was an error while trying to open the match video from YouTube. Note that this feature may fail unexpectedly due to changes on YouTube's servers. Please check for updates or choose a local video file instead.",
                  icon: WINDOW_ICON
                });
              });
          })
          .catch((silent) => {
            callback({ uuid: uuid, error: true });
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

  /** Gets the direct download URL based on a YouTube URL */
  private static getDirectUrlFromYouTubeUrl(youTubeUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      ytdl
        .getInfo(youTubeUrl)
        .then((info) => {
          let format = ytdl.chooseFormat(info.formats, { quality: "highestvideo", filter: "videoonly" });
          if (format.url) {
            resolve(format.url);
          } else {
            reject();
          }
        })
        .catch(reject);
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
      // Get titles of videos
      let titles: string[] = [];
      for (let i = 0; i < videoKeys.length; i++) {
        let info = await ytdl.getBasicInfo("https://youtube.com/watch?v=" + videoKeys[i]);
        titles.push(info.videoDetails.author.name + " (" + info.videoDetails.title + ")");
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
