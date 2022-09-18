import TabType from "../../lib/TabType";
import VideoVisualizer from "../../lib/visualizers/VideoVisualizer";
import TimelineVizController from "./TimelineVizController";

export default class VideoController extends TimelineVizController {
  private SOURCE_CELL: HTMLElement;
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
      new VideoVisualizer(content.getElementsByClassName("video-container")[0].firstElementChild as HTMLImageElement)
    );

    // Get elements
    this.SOURCE_CELL = content.getElementsByClassName("video-source")[0] as HTMLElement;
    let configTable = content.getElementsByClassName("timeline-viz-config")[0] as HTMLElement;
    this.LOCK_BUTTON = configTable.getElementsByTagName("button")[0] as HTMLButtonElement;
    this.UNLOCK_BUTTON = configTable.getElementsByTagName("button")[1] as HTMLButtonElement;
    this.PLAY_BUTTON = configTable.getElementsByTagName("button")[4] as HTMLButtonElement;
    this.PAUSE_BUTTON = configTable.getElementsByTagName("button")[5] as HTMLButtonElement;
    this.FRAME_BACK_BUTTON = configTable.getElementsByTagName("button")[3] as HTMLButtonElement;
    this.FRAME_FORWARD_BUTTON = configTable.getElementsByTagName("button")[6] as HTMLButtonElement;
    this.SKIP_BACK_BUTTON = configTable.getElementsByTagName("button")[2] as HTMLButtonElement;
    this.SKIP_FORWARD_BUTTON = configTable.getElementsByTagName("button")[7] as HTMLButtonElement;
    this.VIDEO_TIMELINE_INPUT = configTable.getElementsByClassName(
      "timeline-viz-timeline-slider"
    )[0] as HTMLInputElement;
    this.VIDEO_TIMELINE_PROGRESS = configTable.getElementsByClassName("timeline-viz-timeline-marker-container")[0]
      .firstChild as HTMLElement;

    // Source selection
    this.SOURCE_CELL.addEventListener("click", () => {
      window.sendMainMessage("select-video", this.UUID);
    });

    // Lock buttons
    let toggleLock = () => {
      if (!this.hasData()) return;
      this.locked = !this.locked;
      if (this.locked) {
        this.playing = false;
        let selectedTime = window.selection.getSelectedTime();
        if (selectedTime == null) selectedTime = 0;
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
      if (this.locked || !this.hasData()) return;
      this.VIDEO_TIMELINE_INPUT.value = (Number(this.VIDEO_TIMELINE_INPUT.value) + delta).toString();
    };
    let skipTime = (delta: number) => {
      if (this.locked || !this.hasData()) return;
      if (this.fps) {
        this.VIDEO_TIMELINE_INPUT.value = (Number(this.VIDEO_TIMELINE_INPUT.value) + delta * this.fps).toString();
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
      if (content.hidden || event.target != document.body) return;
      switch (event.code) {
        case "ArrowUp":
        case "ArrowDown":
          event.preventDefault();
          toggleLock();
          break;

        case "Slash":
          event.preventDefault();
          togglePlayPause();
          break;

        case "Comma":
          event.preventDefault();
          skipTime(-5);
          break;

        case "Period":
          event.preventDefault();
          skipTime(5);
          break;

        case "ArrowLeft":
          event.preventDefault();
          changeFrame(-1);
          break;

        case "ArrowRight":
          event.preventDefault();
          changeFrame(1);
          break;
      }
    });
  }

  private hasData(): boolean {
    return this.imgFolder != null && this.fps != null && this.totalFrames != null && this.completedFrames != null;
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

  processVideoData(data: any) {
    if (data.uuid != this.UUID) return;

    if ("path" in data) {
      // Set name
      let components = data.path.split(window.platform == "win32" ? "\\" : "/");
      let friendlyName = components[components.length - 1];
      this.SOURCE_CELL.innerText = friendlyName;

      this.locked = false;
      this.playing = false;
      this.updateButtons();
    } else {
      // Set progress
      this.imgFolder = data.imgFolder;
      this.fps = data.fps;
      this.totalFrames = data.totalFrames;
      this.completedFrames = data.completedFrames;

      if (this.totalFrames == null || this.completedFrames == null) return;
      this.VIDEO_TIMELINE_PROGRESS.style.width = ((this.completedFrames / this.totalFrames) * 100).toString() + "%";
      this.VIDEO_TIMELINE_INPUT.max = this.totalFrames.toString();
    }
  }

  get options(): { [id: string]: any } {
    return {};
  }

  set options(options: { [id: string]: any }) {}

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
