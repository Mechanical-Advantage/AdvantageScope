import TabRenderer from "./TabRenderer";

export default class OdometryRenderer implements TabRenderer {
  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}

  render(command: unknown): void {}
}

export enum Orientation {
  DEG_0 = 0,
  DEG_90 = 1,
  DEG_180 = 2,
  DEG_270 = 3
}
