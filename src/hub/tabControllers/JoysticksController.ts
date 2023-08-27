import { getJoystickState, JOYSTICK_KEYS } from "../../shared/log/LogUtil";
import TabType from "../../shared/TabType";
import JoysticksVisualizer from "../../shared/visualizers/JoysticksVisualizer";
import TimelineVizController from "./TimelineVizController";

export default class JoysticksController extends TimelineVizController {
  private CONFIG_IDS: HTMLInputElement[];
  private CONFIG_LAYOUTS: HTMLInputElement[];

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
    this.CONFIG_IDS = Array.from(cells === undefined ? [] : cells).map(
      (cell) => cell.firstElementChild as HTMLInputElement
    );
    this.CONFIG_LAYOUTS = Array.from(cells === undefined ? [] : cells).map(
      (cell) => cell.lastElementChild as HTMLInputElement
    );

    // Add initial set of options
    this.resetLayoutOptions();

    // Enforce range
    this.CONFIG_IDS.forEach((input) => {
      input.addEventListener("change", () => {
        if (Number(input.value) < 0) input.value = "0";
        if (Number(input.value) > 5) input.value = "5";
        if (Number(input.value) % 1 !== 0) input.value = Math.round(Number(input.value)).toString();
      });
    });
  }

  /** Clears all options for the layout selectors then updates them with the latest options. */
  private resetLayoutOptions() {
    let options = ["None", "Generic Joystick"];
    if (window.assets !== null) {
      options = [...options, ...window.assets.joysticks.map((joystick) => joystick.name)];
    }
    this.CONFIG_LAYOUTS.forEach((select) => {
      let value = select.value;
      while (select.firstChild) {
        select.removeChild(select.firstChild);
      }
      options.forEach((title) => {
        let option = document.createElement("option");
        option.innerText = title;
        select.appendChild(option);
      });
      if (options.includes(value)) {
        select.value = value;
      } else {
        select.value = options[0];
      }
    });
  }

  get options(): { [id: string]: any } {
    return {
      ids: this.CONFIG_IDS.map((input) => Number(input.value)),
      layouts: this.CONFIG_LAYOUTS.map((input) => input.value)
    };
  }

  set options(options: { [id: string]: any }) {
    this.resetLayoutOptions();
    this.CONFIG_IDS.forEach((input, index) => {
      input.value = options.ids[index];
    });
    this.CONFIG_LAYOUTS.forEach((input, index) => {
      input.value = options.layouts[index];
    });
  }

  newAssets() {
    this.resetLayoutOptions();
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
