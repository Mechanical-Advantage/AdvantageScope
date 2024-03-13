import { BrowserWindow, screen } from "electron";
import fs from "fs";
import jsonfile from "jsonfile";
import {
  HUB_DEFAULT_HEIGHT,
  HUB_DEFAULT_WIDTH,
  SATELLITE_DEFAULT_HEIGHT,
  SATELLITE_DEFAULT_WIDTH,
  STATE_FILENAME
} from "./Constants";

export default class StateTracker {
  private SAVE_PERIOD_MS = 250;
  private rendererStates: { [id: number]: any } = {};
  private satelliteUUIDs: { [id: number]: string } = {};

  constructor() {
    let lastState = this.getSavedApplicationState(false);
    setInterval(() => {
      let state: ApplicationState = this.getCurrentApplicationState();
      if (state.hubs.length > 0 && JSON.stringify(state) !== JSON.stringify(lastState)) {
        jsonfile.writeFileSync(STATE_FILENAME, state);
        lastState = state;
      }
    }, this.SAVE_PERIOD_MS);
  }

  /** Reads the full application state based on the saved file. */
  getSavedApplicationState(allowReset = true): ApplicationState | null {
    if (fs.existsSync(STATE_FILENAME)) {
      try {
        let state: ApplicationState = jsonfile.readFileSync(STATE_FILENAME);
        [...state.hubs, ...state.satellites].forEach((window, index) => {
          if (allowReset) {
            let reset = !screen
              .getAllDisplays()
              .some(
                (display) =>
                  window.x >= display.bounds.x &&
                  window.y >= display.bounds.y &&
                  window.x + window.width <= display.bounds.x + display.bounds.width &&
                  window.y + window.height <= display.bounds.y + display.bounds.height
              );
            if (reset) {
              const primaryBounds = screen.getPrimaryDisplay().bounds;
              const isHub = index < state.hubs.length;
              const defaultWidth = isHub ? HUB_DEFAULT_WIDTH : SATELLITE_DEFAULT_WIDTH;
              const defaultHeight = isHub ? HUB_DEFAULT_HEIGHT : SATELLITE_DEFAULT_HEIGHT;
              window.x = primaryBounds.x + primaryBounds.width / 2 - defaultWidth / 2;
              window.y = primaryBounds.y + primaryBounds.height / 2 - defaultHeight / 2;
              window.width = defaultWidth;
              window.height = defaultHeight;
            }
          }
        });
        return state;
      } catch (e) {
        console.error("Unable to load state. Reverting to default settings.", e);
        fs.copyFileSync(STATE_FILENAME, STATE_FILENAME.slice(0, -5) + "-corrupted.json");
        return null;
      }
    } else {
      return null;
    }
  }

  /** Returns the full application state. */
  getCurrentApplicationState(): ApplicationState {
    let state: ApplicationState = { hubs: [], satellites: [] };
    Object.keys(this.rendererStates).forEach((windowId) => {
      let windowIdNum = Number(windowId);
      let window = BrowserWindow.fromId(Number(windowIdNum));
      if (window === null) return;
      let windowBounds = window.getBounds();
      let windowState = this.rendererStates[windowIdNum];
      let satelliteUUID = windowIdNum in this.satelliteUUIDs ? this.satelliteUUIDs[windowIdNum] : null;
      if (satelliteUUID === null) {
        state.hubs.push({
          x: windowBounds.x,
          y: windowBounds.y,
          width: windowBounds.width,
          height: windowBounds.height,
          state: windowState
        });
      } else {
        state.satellites.push({
          x: windowBounds.x,
          y: windowBounds.y,
          width: windowBounds.width,
          height: windowBounds.height,
          state: windowState,
          uuid: satelliteUUID
        });
      }
    });
    return state;
  }

  /** Caches the renderer state for a window. */
  saveRendererState(window: BrowserWindow, rendererState: any) {
    this.rendererStates[window.id] = rendererState;
  }

  /** Returns the cached renderer state for a window. */
  getRendererState(window: BrowserWindow): any {
    return this.rendererStates[window.id];
  }

  /** Caches the set of satellite windows for each UUID. */
  saveSatelliteIds(windows: { [id: string]: BrowserWindow[] }) {
    this.satelliteUUIDs = {};
    Object.entries(windows).forEach(([uuid, value]) => {
      value.forEach((window) => {
        this.satelliteUUIDs[window.id] = uuid;
      });
    });
  }
}

export type ApplicationState = { hubs: WindowState[]; satellites: SatelliteWindowState[] };

export type WindowState = {
  x: number;
  y: number;
  width: number;
  height: number;
  state: any;
};

export type SatelliteWindowState = WindowState & {
  uuid: string;
};
