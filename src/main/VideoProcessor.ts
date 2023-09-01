import { ChildProcess, spawn } from "child_process";
import { BrowserWindow, app, clipboard, dialog } from "electron";
import fs from "fs";
import jsonfile from "jsonfile";
import path from "path";
import ytdl from "ytdl-core";
import MatchInfo, { MatchType, PlayoffType, getElimMatchString } from "../shared/MatchInfo";
import Preferences from "../shared/Preferences";
import VideoSource from "../shared/VideoSource";
import { createUUID } from "../shared/util";
import { PREFS_FILENAME, VIDEO_CACHE, WINDOW_ICON } from "./Constants";

export class VideoProcessor {
  private static processes: { [id: string]: ChildProcess } = {}; // Key is tab UUID
  private static folderUUIDs: string[] = [];

  /** Loads a video based on a request from the hub window. */
  static prepare(
    window: BrowserWindow,
    uuid: string,
    source: VideoSource,
    matchInfo: MatchInfo | null,
    callback: (data: any) => void
  ) {
    let loadPath = (videoPath: string) => {
      // Indicate download has started
      callback({ uuid: uuid });

      // Create cache folder
      let folderUUID = createUUID();
      VideoProcessor.folderUUIDs.push(folderUUID);
      let cachePath = path.join(VIDEO_CACHE, folderUUID) + path.sep;
      if (fs.existsSync(cachePath)) {
        fs.rmSync(cachePath, { recursive: true });
      }
      fs.mkdirSync(cachePath, { recursive: true });

      // Find ffmpeg path
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
      let ffmpegPath: string;
      if (app.isPackaged) {
        ffmpegPath = path.join(__dirname, "..", "..", "ffmpeg-" + platformString + "-" + process.arch);
      } else {
        ffmpegPath = path.join(__dirname, "..", "ffmpeg", "ffmpeg-" + platformString + "-" + process.arch);
      }

      // Start ffmpeg
      if (uuid in VideoProcessor.processes) VideoProcessor.processes[uuid].kill();
      let ffmpeg = spawn(ffmpegPath, ["-i", videoPath, "-q:v", "2", path.join(cachePath, "%08d.jpg")]);
      VideoProcessor.processes[uuid] = ffmpeg;
      let running = true;
      let fullOutput = "";
      let fps = 0;
      let durationSecs = 0;
      let completedFrames = 0;

      // Send error message and exit
      let sendError = () => {
        running = false;
        ffmpeg.kill();
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
          if (fps === 0 || durationSecs === 0) {
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
          callback({
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
          callback({
            uuid: uuid,
            imgFolder: cachePath,
            fps: fps,
            totalFrames: completedFrames, // In case original value was inaccurate
            completedFrames: completedFrames
          });
        } else if (code === 1) {
          sendError();
        }
      });
    };

    // Get URL based on source type
    switch (source) {
      case VideoSource.Local:
        this.getLocalPath(window).then(loadPath);
        break;
      case VideoSource.YouTube:
        let clipboardText = clipboard.readText();
        if (!clipboardText.includes("youtube.com") && !clipboardText.includes("youtu.be")) {
          dialog.showMessageBox(window, {
            type: "error",
            title: "Error",
            message: "Copy URL to clipboard",
            detail: "Please copy a YouTube URL to the clipboard, then try again.",
            icon: WINDOW_ICON
          });
        } else {
          this.getDirectUrlFromYouTubeUrl(clipboardText)
            .then(loadPath)
            .catch(() => {
              dialog.showMessageBox(window, {
                type: "error",
                title: "Error",
                message: "YouTube download failed",
                detail:
                  "There was an error while trying to open the YouTube video. Please choose a local video file instead.",
                icon: WINDOW_ICON
              });
            });
        }
        break;
      case VideoSource.TheBlueAlliance:
        this.getYouTubeUrlFromMatchInfo(matchInfo!)
          .then((url) => {
            this.getDirectUrlFromYouTubeUrl(url)
              .then(loadPath)
              .catch(() => {
                dialog.showMessageBox(window, {
                  type: "error",
                  title: "Error",
                  message: "YouTube download failed",
                  detail:
                    "There was an error while trying to open the match video from YouTube. Please choose a local video file instead.",
                  icon: WINDOW_ICON
                });
              });
          })
          .catch((error) => {
            console.log(error);
            dialog.showMessageBox(window, {
              type: "error",
              title: "Error",
              message: "No match videos found",
              detail:
                "No videos were found for this match on The Blue Alliance. Please load the video using a YouTube URL or local file instead.",
              icon: WINDOW_ICON
            });
          });
        break;
    }
  }

  /** Displays a selector for a local file */
  private static getLocalPath(window: BrowserWindow): Promise<string> {
    return dialog
      .showOpenDialog(window, {
        title: "Select a video to open",
        properties: ["openFile"],
        filters: [{ name: "Videos", extensions: VideoProcessor.extensions }]
      })
      .then((result) => result.filePaths[0]);
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
  private static async getYouTubeUrlFromMatchInfo(matchInfo: MatchInfo): Promise<string> {
    // Get TBA API key]
    let tbaApikey = (jsonfile.readFileSync(PREFS_FILENAME) as Preferences).tbaApiKey;
    if (!tbaApikey) {
      throw new Error();
    }

    // Get TBA event key (the robot only has the FIRST event key)
    let tbaEventKey, tbaMatchKey: string;
    {
      let response = await fetch("https://www.thebluealliance.com/api/v3/events/" + matchInfo.year.toString(), {
        method: "GET",
        signal: AbortSignal.timeout(3000),
        headers: [["X-TBA-Auth-Key", tbaApikey]]
      });
      if (!response.ok) {
        throw new Error();
      }
      let allEvents = (await response.json()) as any[];
      let event = allEvents.find(
        (event) =>
          event["first_event_code"] && event["first_event_code"].toLowerCase() === matchInfo.event.toLowerCase()
      );
      if (!event) throw new Error();
      tbaEventKey = event["key"];
    }

    // Get match key
    if (matchInfo.matchType === MatchType.Elimination) {
      // Get playoff type for event
      let response = await fetch("https://www.thebluealliance.com/api/v3/event/" + tbaEventKey, {
        method: "GET",
        signal: AbortSignal.timeout(3000),
        headers: [["X-TBA-Auth-Key", tbaApikey]]
      });
      if (!response.ok) {
        throw new Error();
      }
      let eventData = await response.json();
      let playoffType = eventData["playoff_type"] as PlayoffType;
      tbaMatchKey = tbaEventKey + "_" + getElimMatchString(playoffType, matchInfo.matchNumber);
    } else {
      tbaMatchKey = tbaEventKey + "_qm" + matchInfo.matchNumber.toString();
    }

    // Get videos
    let videoKeys: string[] = [];
    {
      let response = await fetch("https://www.thebluealliance.com/api/v3/match/" + tbaMatchKey, {
        method: "GET",
        signal: AbortSignal.timeout(3000),
        headers: [["X-TBA-Auth-Key", tbaApikey]]
      });
      if (!response.ok) {
        throw new Error();
      }
      let allData = await response.json();
      let videoData = allData["videos"] as { key: string; type: string }[];
      videoKeys = videoData.filter((video) => video.type === "youtube").map((video) => video.key);
    }

    // If zero or one video, nothing more to do
    if (videoKeys.length === 0) {
      throw new Error();
    } else if (videoKeys.length === 1) {
      return "https://youtube.com/watch?v=" + videoKeys[0];
    }

    return "";
  }

  /** Cleans up remaining ffmpeg processes and caches */
  static cleanup() {
    Object.values(VideoProcessor.processes).forEach((process) => {
      process.kill();
    });
    VideoProcessor.folderUUIDs.forEach((uuid) => {
      fs.rmSync(path.join(VIDEO_CACHE, uuid), { recursive: true });
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
