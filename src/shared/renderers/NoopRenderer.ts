import TabRenderer from "./TabRenderer";

export default class NoopRenderer implements TabRenderer {
  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}

  render(command: unknown): void {}
}
