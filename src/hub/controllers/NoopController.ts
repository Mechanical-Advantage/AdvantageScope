import TabController from "./TabController";

export default class NoopController implements TabController {
  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}

  refresh(): void {}

  newAssets(): void {}

  getActiveFields(): string[] {
    return [];
  }

  getCommand(): unknown {
    return null;
  }

  periodic(): void {}
}
