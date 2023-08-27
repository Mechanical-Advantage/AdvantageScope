import { BrowserWindow, screen } from "electron";
import fs from "fs";
import jsonfile from "jsonfile";
import { STATE_FILENAME } from "./Constants";

export default class StateTracker {
  private SAVE_PERIOD_MS = 250;

  private focusedWindow: BrowserWindow | null = null;
  private rendererStateCache: { [id: number]: any } = {};

  constructor() {
    setInterval(() => {
      if (this.focusedWindow === null) return;
      if (this.focusedWindow.isDestroyed()) return;
      let bounds = this.focusedWindow.getBounds();
      let state: WindowState = {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        rendererState: this.rendererStateCache[this.focusedWindow.id]
      };
      jsonfile.writeFileSync(STATE_FILENAME, state);
    }, this.SAVE_PERIOD_MS);
  }

  /** Reads the saved state from the file. */
  getState(defaultWidth: number, defaultHeight: number): WindowState {
    let state: WindowState = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };

    let resetToDefault: boolean;
    if (fs.existsSync(STATE_FILENAME)) {
      try {
        state = jsonfile.readFileSync(STATE_FILENAME);
        resetToDefault = !screen.getAllDisplays().some((display) => {
          return (
            state.x >= display.bounds.x &&
            state.y >= display.bounds.y &&
            state.x + state.width <= display.bounds.x + display.bounds.width &&
            state.y + state.height <= display.bounds.y + display.bounds.height
          );
        });
      } catch (e) {
        console.error("Unable to load state. Reverting to default settings.", e);
        fs.copyFileSync(STATE_FILENAME, STATE_FILENAME.slice(0, -5) + "-corrupted.json");
        resetToDefault = true;
      }
    } else {
      resetToDefault = true;
    }

    if (resetToDefault) {
      const bounds = screen.getPrimaryDisplay().bounds;
      state = {
        x: bounds.x + bounds.width / 2 - defaultWidth / 2,
        y: bounds.y + bounds.height / 2 - defaultHeight / 2,
        width: defaultWidth,
        height: defaultHeight
      };
    }

    return state;
  }

  /** Sets the focused window, which will be used to save state.  */
  setFocusedWindow(window: BrowserWindow) {
    this.focusedWindow = window;
  }

  /** Caches the renderer state for a window. */
  saveRendererState(window: BrowserWindow, rendererState: any) {
    this.rendererStateCache[window.id] = rendererState;
  }

  /** Returns the cached renderer state for a window. */
  getRendererState(window: BrowserWindow): any {
    return this.rendererStateCache[window.id];
  }
}

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  rendererState?: any;
}
