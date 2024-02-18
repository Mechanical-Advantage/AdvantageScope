import LoggableType from "../../shared/log/LoggableType";
// import { LogValueSetNumberArray, LogValueSetRaw } from "../../shared/log/LogValueSets";
import TabType from "../../shared/TabType";
import PointCloudVisualizerSwitching from "../../shared/visualizers/PointCloudVisualizerSwitching";
import TimelineVizController from "./TimelineVizController";

export default class PointCloudController extends TimelineVizController {

  constructor(content: HTMLElement) {
    let configBody = content.getElementsByClassName("timeline-viz-config")[0].firstElementChild as HTMLElement;
    super(
      content,
      TabType.PointClouds,
      [
        {
          element: configBody.children[1].firstElementChild as HTMLElement,
          types: [ LoggableType.Raw, LoggableType.NumberArray ]
        }
      ],
      [ // use this array if we want to support multiple point clouds rendering at once (ie. different colors!?)
        // {
        //   element: configBody.children[1].children[0] as HTMLElement,
        //   types: [
        //     LoggableType.Raw,
        //     LoggableType.NumberArray,
        //     "Translation3d[]"
        //   ],
        //   options: [
        //     ["Point Cloud 1"]
        //   ]
        // }
      ],
      new PointCloudVisualizerSwitching(
        content,
        content.getElementsByClassName("point-clouds-canvas")[0] as HTMLCanvasElement,
        content.getElementsByClassName("point-clouds-annotations")[0] as HTMLElement,
        content.getElementsByClassName("point-clouds-alert")[0] as HTMLElement
      )
    );

  }


  /** Switches the orbit FOV for the main visualizer. */
  setFov(fov: number) {
    (this.visualizer as PointCloudVisualizerSwitching).setFov(fov);
  }


/** Overrides for TimelineVizController */

  get options(): { [id: string]: any } {
    return {
      // currently we do not have any options
    };
  }

  set options(options: { [id: string]: any }) {
    // currently we do not have any options
  }

  newAssets() {}  // shouldn't need to do anything with this
  getAdditionalActiveFields(): string[] { return []; }    // shouldn't need this for anything either

  /** This gets called every 'control loop' (15hz?) with the currently selected timestamp in the viewer */
  getCommand(time: number) {

    const fields_arr = super.getFields();

    if (fields_arr.length > 0 && fields_arr[0]) {  // only use the first cloud for now
      const field = fields_arr[0];    // currently only 1 point cloud slot so use the first idx

      switch (field.sourceType) {

        case LoggableType.Raw: {
          const valset = window.log.getRaw(field.key, time, time);
          const arr = valset?.values[0];    // the "range" is only a single timestamp so we only ever should have a single value
          // console.log('point data timeline scroll: recieved raw data of length %d', arr?.length);

          return {
            buffer: (arr !== undefined) ? new Float32Array(arr.buffer, 0, (arr.length - (arr.length % 16)) / 4) : null,
            src_ts: valset?.timestamps[0]
          };

        }

        case LoggableType.NumberArray: {
          const valset = window.log.getNumberArray(field.key, time, time);    // same here
          const arr = valset?.values[0];
          // console.log('point data timeline scroll: received number array of length %d', arr?.length);

          return {
            buffer: (arr !== undefined) ? new Float32Array(arr.slice(0, arr.length - (arr.length % 4))) : null,
            src_ts: valset?.timestamps[0]
          };

        }

      }

    }

    // default object with null buffer
    return {
      buffer: null,
      src_ts: undefined
    };

  }


}
