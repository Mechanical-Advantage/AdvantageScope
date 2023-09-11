import { getMechanismState, MechanismState, mergeMechanismStates } from "../../shared/log/LogUtil";
import TabType from "../../shared/TabType";
import MechanismVisualizer from "../../shared/visualizers/MechanismVisualizer";
import TimelineVizController from "./TimelineVizController";

export default class MechanismController extends TimelineVizController {
  constructor(content: HTMLElement) {
    let configBody = content.getElementsByClassName("timeline-viz-config")[0].firstElementChild as HTMLElement;
    super(
      content,
      TabType.Mechanism,
      [
        {
          element: configBody.children[1].children[0] as HTMLElement,
          types: ["Mechanism2d"]
        },
        {
          element: configBody.children[1].children[1] as HTMLElement,
          types: ["Mechanism2d"]
        },
        {
          element: configBody.children[1].children[2] as HTMLElement,
          types: ["Mechanism2d"]
        }
      ],
      [],
      new MechanismVisualizer(content.getElementsByClassName("mechanism-svg-container")[0] as HTMLElement)
    );
  }

  get options(): { [id: string]: any } {
    return {};
  }

  set options(options: { [id: string]: any }) {}

  newAssets() {}

  getAdditionalActiveFields(): string[] {
    return [];
  }

  getCommand(time: number): MechanismState | null {
    let states: MechanismState[] = [];
    this.getFields()
      .filter((field) => field !== null)
      .forEach((field) => {
        let state = getMechanismState(window.log, field!.key, time);
        if (state !== null) states.push(state);
      });

    if (states.length === 0) {
      return null;
    } else {
      return mergeMechanismStates(states);
    }
  }
}
