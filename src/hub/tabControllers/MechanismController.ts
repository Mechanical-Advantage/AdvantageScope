import LoggableType from "../../shared/log/LoggableType";
import { getMechanismKeys, getMechanismState, MechanismState } from "../../shared/log/LogUtil";
import TabType from "../../shared/TabType";
import { arraysEqual } from "../../shared/util";
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
          types: ["mechanism"]
        },
        {
          element: configBody.children[1].children[1] as HTMLElement,
          types: ["mechanism"]
        },
        {
          element: configBody.children[1].children[2] as HTMLElement,
          types: ["mechanism"]
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

  getCommand(time: number): MechanismState[] {
    let states: MechanismState[] = [];
    this.getFields()
      .filter((field) => field !== null)
      .forEach((field) => {
        let state = getMechanismState(window.log, field!, time);
        if (state !== null) states.push(state);
      });
    return states;
  }
}
