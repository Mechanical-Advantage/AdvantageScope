import { Rotation2d, Translation2d } from "../../shared/geometry";
import LogFieldTree from "../../shared/log/LogFieldTree";
import LoggableType from "../../shared/log/LoggableType";
import { getOrDefault } from "../../shared/log/LogUtil";
import TabType from "../../shared/TabType";
import { convert } from "../../shared/units";
import { arraysEqual } from "../../shared/util";
import MechanismVisualizer, { MechanismLine, MechanismState } from "../../shared/visualizers/MechanismVisualizer";
import TimelineVizController from "./TimelineVizController";

export default class MechanismController extends TimelineVizController {
  private SELECT: HTMLSelectElement;

  private selected: string | null = null;
  private lastSelected: string | null = null;
  private lastOptions: string[] = [];

  constructor(content: HTMLElement) {
    super(
      content,
      TabType.Mechanism,
      [],
      [],
      new MechanismVisualizer(content.getElementsByClassName("mechanism-svg-container")[0] as HTMLElement)
    );

    this.SELECT = content.getElementsByTagName("select")[0] as HTMLSelectElement;
    this.SELECT.addEventListener("change", () => {
      this.selected = this.SELECT.value;
      this.updateOptions();
    });
  }

  get options(): { [id: string]: any } {
    return { source: this.selected };
  }

  set options(options: { [id: string]: any }) {
    this.selected = options.source;
    this.updateOptions();
  }

  private updateOptions() {
    // Find possible options
    let keyOptions: string[] = [];
    window.log.getFieldKeys().forEach((key) => {
      if (key.endsWith("/.type")) {
        let value = getOrDefault(window.log, key, LoggableType.String, Infinity, "");
        if (value === "Mechanism2d") {
          keyOptions.push(key.slice(0, -6));
        }
      }
    });
    keyOptions.sort();

    // Update select
    if (!arraysEqual(keyOptions, this.lastOptions) || this.lastSelected !== this.selected) {
      this.SELECT.disabled = false;
      while (this.SELECT.firstChild) {
        this.SELECT.removeChild(this.SELECT.firstChild);
      }
      if (this.selected !== null && !keyOptions.includes(this.selected)) {
        let option = document.createElement("option");
        option.innerText = this.selected + " (missing)";
        option.value = this.selected;
        this.SELECT.appendChild(option);
      }
      keyOptions.forEach((key) => {
        let option = document.createElement("option");
        option.innerText = key;
        option.value = key;
        this.SELECT.appendChild(option);
      });
      this.lastOptions = keyOptions;
      this.lastSelected = this.selected;
      if (this.selected === null && keyOptions.length > 0) {
        this.selected = keyOptions[0];
      }
      if (this.selected !== null) {
        this.SELECT.value = this.selected;
      }
    }
  }

  getCommand(time: number): MechanismState | null {
    this.updateOptions();
    if (this.selected === null) {
      return null;
    }

    // Get general config
    let backgroundColor = getOrDefault(window.log, this.selected + "/backgroundColor", LoggableType.String, time, null);
    let dimensions = getOrDefault(window.log, this.selected + "/dims", LoggableType.NumberArray, time, null);
    if (backgroundColor === null || dimensions === null) {
      return null;
    }

    // Get all lines
    let lines: MechanismLine[] = [];
    try {
      // Add a line and children recursively
      let addLine = (lineTree: LogFieldTree, startTranslation: Translation2d, startRotation: Rotation2d) => {
        let angle = getOrDefault(
          window.log,
          this.selected! + lineTree.children["angle"].fullKey,
          LoggableType.Number,
          time,
          0
        ) as number;
        let length = getOrDefault(
          window.log,
          this.selected! + lineTree.children["length"].fullKey,
          LoggableType.Number,
          time,
          0
        ) as number;
        let color = getOrDefault(
          window.log,
          this.selected! + lineTree.children["color"].fullKey,
          LoggableType.String,
          time,
          0
        ) as string;
        let weight = getOrDefault(
          window.log,
          this.selected! + lineTree.children["weight"].fullKey,
          LoggableType.Number,
          time,
          0
        ) as number;

        let endRotation = startRotation + convert(angle, "degrees", "radians");
        let endTranslation: Translation2d = [
          startTranslation[0] + Math.cos(endRotation) * length,
          startTranslation[1] + Math.sin(endRotation) * length
        ];
        lines.push({
          start: startTranslation,
          end: endTranslation,
          color: color,
          weight: weight
        });
        for (let [childKey, childTree] of Object.entries(lineTree.children)) {
          if ([".type", "angle", "color", "length", "weight"].includes(childKey)) continue;
          addLine(childTree, endTranslation, endRotation);
        }
      };

      // Find all roots and add children
      for (let [mechanismChildKey, mechanismChildTree] of Object.entries(
        window.log.getFieldTree(false, this.selected)
      )) {
        if (mechanismChildKey.startsWith(".") || mechanismChildKey == "backgroundColor" || mechanismChildKey == "dims")
          continue;
        let translation: Translation2d = [
          getOrDefault(
            window.log,
            this.selected + mechanismChildTree.children["x"].fullKey!,
            LoggableType.Number,
            time,
            0
          ),
          getOrDefault(
            window.log,
            this.selected + mechanismChildTree.children["y"].fullKey!,
            LoggableType.Number,
            time,
            0
          )
        ];
        for (let [rootChildKey, rootChildTree] of Object.entries(mechanismChildTree.children)) {
          if (rootChildKey == "x" || rootChildKey == "y") continue;
          addLine(rootChildTree, translation, 0.0);
        }
      }
    } catch {
      console.error("Failed to parse mechanism data");
    }

    // Return result
    return {
      backgroundColor: backgroundColor,
      dimensions: dimensions,
      lines: lines
    };
  }
}
