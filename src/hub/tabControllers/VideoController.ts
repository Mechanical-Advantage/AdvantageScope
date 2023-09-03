import { MatchType } from "../../shared/MatchInfo";
import TabType from "../../shared/TabType";
import VideoSource from "../../shared/VideoSource";
import { getMatchInfo } from "../../shared/log/LogUtil";
import VideoVisualizer from "../../shared/visualizers/VideoVisualizer";
import TimelineVizController from "./TimelineVizController";

export default class VideoController extends TimelineVizController {
  private BUTTON_BORDER_RADIUS = 6;
  private LOCAL_SOURCE: HTMLButtonElement;
  private YOUTUBE_SOURCE: HTMLButtonElement;
  private TBA_SOURCE: HTMLButtonElement;

  private LOCK_BUTTON: HTMLButtonElement;
  private UNLOCK_BUTTON: HTMLButtonElement;
  private PLAY_BUTTON: HTMLButtonElement;
  private PAUSE_BUTTON: HTMLButtonElement;
  private FRAME_BACK_BUTTON: HTMLButtonElement;
  private FRAME_FORWARD_BUTTON: HTMLButtonElement;
  private SKIP_BACK_BUTTON: HTMLButtonElement;
  private SKIP_FORWARD_BUTTON: HTMLButtonElement;
  private VIDEO_TIMELINE_INPUT: HTMLInputElement;
  private VIDEO_TIMELINE_PROGRESS: HTMLElement;

  private imgFolder: string | null = null;
  private lastImgFolder: string | null = null;
  private fps: number | null = null;
  private totalFrames: number | null = null;
  private completedFrames: number | null = null;

  private locked: boolean = false;
  private lockedStartLog: number = 0;
  private playing: boolean = false;
  private playStartFrame: number = 0;
  private playStartReal: number = 0;

  constructor(content: HTMLElement) {
    super(
      content,
      TabType.Video,
      [],
      [],
      new VideoVisualizer(content.getElementsByClassName("video-container")[0].firstElementChild as HTMLImageElement)
    );

    // Get elements
    let configTable = content.getElementsByClassName("timeline-viz-config")[0] as HTMLElement;
    let controlsCellUpper = configTable.firstElementChild!.children[1].children[1] as HTMLElement;
    let controlsCellLower = configTable.getElementsByClassName("video-controls")[0] as HTMLElement;
    this.LOCK_BUTTON = controlsCellUpper.getElementsByTagName("button")[0] as HTMLButtonElement;
    this.UNLOCK_BUTTON = controlsCellUpper.getElementsByTagName("button")[1] as HTMLButtonElement;
    this.PLAY_BUTTON = controlsCellLower.getElementsByTagName("button")[2] as HTMLButtonElement;
    this.PAUSE_BUTTON = controlsCellLower.getElementsByTagName("button")[3] as HTMLButtonElement;
    this.FRAME_BACK_BUTTON = controlsCellLower.getElementsByTagName("button")[1] as HTMLButtonElement;
    this.FRAME_FORWARD_BUTTON = controlsCellLower.getElementsByTagName("button")[4] as HTMLButtonElement;
    this.SKIP_BACK_BUTTON = controlsCellLower.getElementsByTagName("button")[0] as HTMLButtonElement;
    this.SKIP_FORWARD_BUTTON = controlsCellLower.getElementsByTagName("button")[5] as HTMLButtonElement;
    this.VIDEO_TIMELINE_INPUT = configTable.getElementsByClassName(
      "timeline-viz-timeline-slider"
    )[0] as HTMLInputElement;
    this.VIDEO_TIMELINE_PROGRESS = configTable.getElementsByClassName("timeline-viz-timeline-marker-container")[0]
      .firstElementChild as HTMLElement;

    // Source selection
    let sourceCell = content.getElementsByClassName("video-source")[0] as HTMLElement;
    this.LOCAL_SOURCE = sourceCell.children[0] as HTMLButtonElement;
    this.YOUTUBE_SOURCE = sourceCell.children[1] as HTMLButtonElement;
    this.TBA_SOURCE = sourceCell.children[2] as HTMLButtonElement;
    this.LOCAL_SOURCE.addEventListener("click", () => {
      this.YOUTUBE_SOURCE.classList.remove("animating");
      this.TBA_SOURCE.classList.remove("animating");
      window.sendMainMessage("select-video", {
        uuid: this.UUID,
        source: VideoSource.Local,
        matchInfo: null,
        menuCoordinates: null
      });
    });
    this.createButtonAnimation(this.YOUTUBE_SOURCE);
    this.YOUTUBE_SOURCE.addEventListener("click", () => {
      this.YOUTUBE_SOURCE.classList.add("animating");
      this.TBA_SOURCE.classList.remove("animating");
      window.sendMainMessage("select-video", {
        uuid: this.UUID,
        source: VideoSource.YouTube,
        matchInfo: null,
        menuCoordinates: null
      });
    });
    this.createButtonAnimation(this.TBA_SOURCE);
    this.TBA_SOURCE.addEventListener("click", () => {
      if (!window.preferences?.tbaApiKey) {
        window.sendMainMessage("error", {
          title: "No API key",
          content:
            "Please enter an API key for The Blue Alliance in the AdvantageScope preferences. An API key can be obtained from the Account page on The Blue Alliance website."
        });
        return;
      }
      let matchInfo = getMatchInfo(window.log);
      if (matchInfo === null) {
        window.sendMainMessage("error", {
          title: "No match info",
          content:
            "Failed to read event and match info from the log. Please load the video using a YouTube URL or local file instead."
        });
        return;
      }
      if (matchInfo.matchType === MatchType.Practice) {
        window.sendMainMessage("error", {
          title: "No videos for practice match",
          content:
            "This is a practice match. No data is available on The Blue Alliance for practice matches, please load the video using a YouTube URL or local file instead."
        });
        return;
      }
      this.YOUTUBE_SOURCE.classList.remove("animating");
      this.TBA_SOURCE.classList.add("animating");
      let rect = this.TBA_SOURCE.getBoundingClientRect();
      window.sendMainMessage("select-video", {
        uuid: this.UUID,
        source: VideoSource.TheBlueAlliance,
        matchInfo: matchInfo,
        menuCoordinates: [rect.right, rect.top]
      });
    });

    // Lock buttons
    let toggleLock = () => {
      if (!this.hasData()) return;
      this.locked = !this.locked;
      if (this.locked) {
        this.playing = false;
        let selectedTime = window.selection.getSelectedTime();
        if (selectedTime === null) selectedTime = 0;
        this.lockedStartLog = selectedTime - (Number(this.VIDEO_TIMELINE_INPUT.value) - 1) / this.fps!;
      }
      this.updateButtons();
    };
    this.LOCK_BUTTON.addEventListener("click", () => toggleLock());
    this.UNLOCK_BUTTON.addEventListener("click", () => toggleLock());

    // Playback buttons
    let togglePlayPause = () => {
      if (this.locked || !this.hasData()) return;
      this.playing = !this.playing;
      if (this.playing) {
        this.playStartFrame = Number(this.VIDEO_TIMELINE_INPUT.value);
        this.playStartReal = new Date().getTime() / 1000;
      }
      this.updateButtons();
    };
    let changeFrame = (delta: number) => {
      if (this.locked || !this.hasData() || this.playing) return;
      this.VIDEO_TIMELINE_INPUT.value = (Number(this.VIDEO_TIMELINE_INPUT.value) + delta).toString();
    };
    let skipTime = (delta: number) => {
      if (this.locked || !this.hasData()) return;
      if (this.fps) {
        this.VIDEO_TIMELINE_INPUT.value = (Number(this.VIDEO_TIMELINE_INPUT.value) + delta * this.fps).toString();
        if (this.playing) {
          this.playStartFrame = Number(this.VIDEO_TIMELINE_INPUT.value);
          this.playStartReal = new Date().getTime() / 1000;
        }
      }
    };
    this.PLAY_BUTTON.addEventListener("click", () => togglePlayPause());
    this.PAUSE_BUTTON.addEventListener("click", () => togglePlayPause());
    this.VIDEO_TIMELINE_INPUT.addEventListener("input", () => {
      if (this.playing) {
        this.playStartFrame = Number(this.VIDEO_TIMELINE_INPUT.value);
        this.playStartReal = new Date().getTime() / 1000;
      }
    });
    this.FRAME_BACK_BUTTON.addEventListener("click", () => changeFrame(-1));
    this.FRAME_FORWARD_BUTTON.addEventListener("click", () => changeFrame(1));
    this.SKIP_BACK_BUTTON.addEventListener("click", () => skipTime(-5));
    this.SKIP_FORWARD_BUTTON.addEventListener("click", () => skipTime(5));
    window.addEventListener("keydown", (event) => {
      if (content.parentElement === null || content.hidden || event.target !== document.body || event.metaKey) return;
      switch (event.code) {
        case "ArrowUp":
        case "ArrowDown":
          toggleLock();
          break;
        case "Slash":
          togglePlayPause();
          break;
        case "Comma":
          skipTime(-5);
          break;
        case "Period":
          skipTime(5);
          break;
        case "ArrowLeft":
          changeFrame(-1);
          break;
        case "ArrowRight":
          changeFrame(1);
          break;
      }
    });
  }

  private hasData(): boolean {
    return this.imgFolder !== null && this.fps !== null && this.totalFrames !== null && this.completedFrames !== null;
  }

  private updateButtons() {
    this.LOCK_BUTTON.hidden = this.locked;
    this.UNLOCK_BUTTON.hidden = !this.locked;
    this.PLAY_BUTTON.hidden = this.playing;
    this.PAUSE_BUTTON.hidden = !this.playing;
    this.PLAY_BUTTON.disabled = this.locked;

    this.PAUSE_BUTTON.disabled = this.locked;
    this.FRAME_BACK_BUTTON.disabled = this.locked;
    this.FRAME_FORWARD_BUTTON.disabled = this.locked;
    this.SKIP_BACK_BUTTON.disabled = this.locked;
    this.SKIP_FORWARD_BUTTON.disabled = this.locked;
    this.VIDEO_TIMELINE_INPUT.disabled = this.locked;
  }

  private createButtonAnimation(button: HTMLElement) {
    let animation: Animation | null = null;
    new ResizeObserver(() => {
      let svg = button.lastElementChild as SVGAElement;
      let path = svg.firstElementChild as SVGPathElement;
      let width = button.getBoundingClientRect().width;
      let height = button.getBoundingClientRect().height;
      svg.setAttribute("width", width.toString());
      svg.setAttribute("height", height.toString());
      path.setAttribute(
        "d",
        "M " +
          (width - this.BUTTON_BORDER_RADIUS).toString() +
          " 0 A " +
          this.BUTTON_BORDER_RADIUS.toString() +
          " " +
          this.BUTTON_BORDER_RADIUS.toString() +
          " 0 0 1 " +
          width.toString() +
          " " +
          this.BUTTON_BORDER_RADIUS.toString() +
          " L " +
          width.toString() +
          " " +
          (height - this.BUTTON_BORDER_RADIUS).toString() +
          " A " +
          this.BUTTON_BORDER_RADIUS.toString() +
          " " +
          this.BUTTON_BORDER_RADIUS.toString() +
          " 0 0 1 " +
          (width - this.BUTTON_BORDER_RADIUS).toString() +
          " " +
          height.toString() +
          " L " +
          this.BUTTON_BORDER_RADIUS.toString() +
          " " +
          height.toString() +
          " A " +
          this.BUTTON_BORDER_RADIUS.toString() +
          " " +
          this.BUTTON_BORDER_RADIUS.toString() +
          " 0 0 1 0 " +
          (height - this.BUTTON_BORDER_RADIUS).toString() +
          " L 0 " +
          this.BUTTON_BORDER_RADIUS.toString() +
          " A " +
          this.BUTTON_BORDER_RADIUS.toString() +
          " " +
          this.BUTTON_BORDER_RADIUS.toString() +
          " 0 0 1 " +
          this.BUTTON_BORDER_RADIUS.toString() +
          " 0 Z"
      );
      path.style.strokeDasharray = (path.getTotalLength() / 4).toString();
      let lastAnimationTime = animation?.currentTime;
      animation?.cancel();
      animation = path.animate([{ strokeDashoffset: path.getTotalLength() }], {
        duration: 1000,
        iterations: Infinity,
        direction: "reverse"
      });
      if (lastAnimationTime) {
        animation.currentTime = lastAnimationTime;
      }
    }).observe(button);
  }

  processVideoData(data: any) {
    if (data.uuid !== this.UUID) return;

    if ("error" in data) {
      this.YOUTUBE_SOURCE.classList.remove("animating");
      this.TBA_SOURCE.classList.remove("animating");
    } else if ("fps" in data) {
      // Set progress
      this.imgFolder = data.imgFolder;
      this.fps = data.fps;
      this.totalFrames = data.totalFrames;
      this.completedFrames = data.completedFrames;

      if (this.totalFrames === null || this.completedFrames === null) return;
      this.VIDEO_TIMELINE_PROGRESS.style.width = ((this.completedFrames / this.totalFrames) * 100).toString() + "%";
      this.VIDEO_TIMELINE_INPUT.max = this.totalFrames.toString();

      if (this.imgFolder !== this.lastImgFolder) {
        this.lastImgFolder = this.imgFolder;
        this.YOUTUBE_SOURCE.classList.remove("animating");
        this.TBA_SOURCE.classList.remove("animating");
      }
    } else {
      // Start to load new source, reset controls
      this.locked = false;
      this.playing = false;
      this.updateButtons();
    }
  }

  get options(): { [id: string]: any } {
    return {};
  }

  set options(options: { [id: string]: any }) {}

  newAssets() {}

  getAdditionalActiveFields(): string[] {
    return [];
  }

  getCommand(time: number) {
    if (this.hasData()) {
      // Set time if locked
      if (this.locked) {
        this.VIDEO_TIMELINE_INPUT.value = (Math.floor((time - this.lockedStartLog) * this.fps!) + 1).toString();
      }

      // Set time if playing
      if (this.playing) {
        this.VIDEO_TIMELINE_INPUT.value = (
          (new Date().getTime() / 1000 - this.playStartReal) * this.fps! +
          this.playStartFrame
        ).toString();
      }

      // Find filename
      let frame = Number(this.VIDEO_TIMELINE_INPUT.value);
      if (frame >= 1 && frame <= this.completedFrames!) {
        let filename = frame.toString();
        while (filename.length < 8) filename = "0" + filename;
        return this.imgFolder + filename + ".jpg";
      }
    }
    return "";
  }
}
