import { getJoystickState, JOYSTICK_KEYS } from "../../shared/log/LogUtil";
import TabType from "../../shared/TabType";
import JoysticksVisualizer from "../../shared/visualizers/JoysticksVisualizer";
import TimelineVizController from "./TimelineVizController";

export default class JoysticksController extends TimelineVizController {
  private CONFIG_IDS: HTMLInputElement[];
  private CONFIG_LAYOUTS: HTMLInputElement[];

  private lastOptions: { [id: string]: any } | null = null;

  constructor(content: HTMLElement) {
    super(
      content,
      TabType.Joysticks,
      [],
      [],
      new JoysticksVisualizer(content.getElementsByClassName("joysticks-canvas")[0] as HTMLCanvasElement)
    );

    // Get option inputs
    let cells = content.getElementsByClassName("joysticks-config")[0].firstElementChild?.lastElementChild?.children;
    this.CONFIG_IDS = Array.from(cells == null ? [] : cells).map((cell) => cell.firstElementChild as HTMLInputElement);
    this.CONFIG_LAYOUTS = Array.from(cells == null ? [] : cells).map(
      (cell) => cell.lastElementChild as HTMLInputElement
    );

    // Enforce range
    this.CONFIG_IDS.forEach((input) => {
      input.addEventListener("change", () => {
        if (Number(input.value) < 0) input.value = "0";
        if (Number(input.value) > 5) input.value = "5";
        if (Number(input.value) % 1 != 0) input.value = Math.round(Number(input.value)).toString();
      });
    });
  }

  get options(): { [id: string]: any } {
    return {
      ids: this.CONFIG_IDS.map((input) => Number(input.value)),
      layouts: this.CONFIG_LAYOUTS.map((input) => input.value)
    };
  }

  set options(options: { [id: string]: any }) {
    this.lastOptions = options;
    this.CONFIG_IDS.forEach((input, index) => {
      input.value = options.ids[index];
    });
    this.CONFIG_LAYOUTS.forEach((input, index) => {
      input.value = options.layouts[index];
    });
  }

  getAdditionalActiveFields(): string[] {
    let activeFields: string[] = [];
    this.CONFIG_IDS.forEach((element, index) => {
      let joystickId = Number(element.value);
      let joystickLayout = this.CONFIG_LAYOUTS[index].value;
      if (joystickLayout !== "None") {
        activeFields = activeFields.concat(JOYSTICK_KEYS.map((key) => key + joystickId.toString()));
      }
    });
    return activeFields;
  }

  getCommand(time: number) {
    // Add layout options
    let newLayouts = false;
    this.CONFIG_LAYOUTS.forEach((input) => {
      if (input.children.length == 0 && window.frcData) {
        newLayouts = true;
        ["None", "Generic Joystick", ...window.frcData.joysticks.map((joystick) => joystick.title)].forEach((title) => {
          let option = document.createElement("option");
          option.innerText = title;
          input.appendChild(option);
        });
      }
    });
    if (newLayouts && this.lastOptions) this.options = this.lastOptions;

    // Read data
    let command: any[] = [];
    this.CONFIG_LAYOUTS.forEach((layoutInput, index) => {
      if (layoutInput.value !== "None") {
        let joystickId = Number(this.CONFIG_IDS[index].value);
        command.push({
          layoutTitle: layoutInput.value,
          state: getJoystickState(window.log, joystickId, time)
        });
      }
    });
    return command;
  }
}
