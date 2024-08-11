import TabRenderer from "./TabRenderer";

export default class LineGraphRenderer implements TabRenderer {
  saveState(): unknown {
    return null;
  }
  restoreState(state: unknown): void {}
  setCommand(command: any): void {}
  render(): void {}
}
