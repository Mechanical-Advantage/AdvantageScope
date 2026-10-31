// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// In-page live connection UI (works the same in Electron and Lite):
// - ConnectDialog: File -> Connect... (Cmd/Ctrl+K). Pick a registered source, enter an address, or pick a
//   recent server. Styled like the Preferences prompt.
// - LiveStatusPill: title-bar pill with three separate indicators (backend, car, sim), plus a popover with
//   details, sim controls (only when the backend has sim endpoints) and connect/disconnect.

import { LiveRecentServer } from "../shared/Preferences";
import { IS_LITE } from "../shared/buildConstants";
import { htmlEncode } from "../shared/util";
import { LiveDataSourceStatus } from "./dataSources/LiveDataSource";
import { getAvailableLiveSources } from "./dataSources/LiveSourceRegistry";
import { Freshness, LiveStatusProvider, LiveStatusSummary, SimAction } from "./dataSources/LiveStatus";

// ------------------------------------------------------------------------------------------------
// Connect dialog

export class ConnectDialog {
  private backdrop: HTMLElement;
  private sourceSelect: HTMLSelectElement;
  private addressInput: HTMLInputElement;
  private recentList: HTMLElement;
  private onConnect: (sourceId: string, address: string) => void;

  constructor(onConnect: (sourceId: string, address: string) => void) {
    this.onConnect = onConnect;
    this.backdrop = document.createElement("div");
    this.backdrop.classList.add("connect-dialog-backdrop");
    this.backdrop.hidden = true;
    this.backdrop.innerHTML = `
      <div class="connect-dialog" role="dialog" aria-label="Connect to live source">
        <div class="connect-dialog-title">Connect to Live Source</div>
        <table>
          <tr>
            <td class="label">Source</td>
            <td class="input"><select class="connect-source" title="Select the live source"></select></td>
          </tr>
          <tr>
            <td class="label">Address</td>
            <td class="input"><input class="connect-address" type="text" spellcheck="false" title="Address of the live source" /></td>
          </tr>
        </table>
        <div class="connect-recent-title">Recent</div>
        <div class="connect-recent"></div>
        <button class="connect-cancel" title="Cancel"><img src="symbols/close.svg" /></button>
        <button class="connect-confirm" title="Connect"><img src="symbols/check.svg" /></button>
      </div>`;
    document.body.appendChild(this.backdrop);

    this.sourceSelect = this.backdrop.querySelector(".connect-source") as HTMLSelectElement;
    this.addressInput = this.backdrop.querySelector(".connect-address") as HTMLInputElement;
    this.recentList = this.backdrop.querySelector(".connect-recent") as HTMLElement;

    this.sourceSelect.addEventListener("change", () => this.applySourceDefaults());
    (this.backdrop.querySelector(".connect-cancel") as HTMLElement).addEventListener("click", () => this.hide());
    (this.backdrop.querySelector(".connect-confirm") as HTMLElement).addEventListener("click", () => this.confirm());
    this.backdrop.addEventListener("mousedown", (event) => {
      if (event.target === this.backdrop) this.hide();
    });
    this.backdrop.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        this.hide();
      } else if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) {
        event.preventDefault();
        this.confirm();
      }
    });
  }

  isVisible(): boolean {
    return !this.backdrop.hidden;
  }

  show() {
    const prefs = window.preferences;
    const sources = getAvailableLiveSources(IS_LITE);
    this.sourceSelect.innerHTML = "";
    sources.forEach((source) => {
      const option = document.createElement("option");
      option.value = source.id;
      option.innerText = source.name;
      this.sourceSelect.appendChild(option);
    });
    const selected = sources.find((source) => source.id === prefs?.liveMode) ?? sources[0];
    this.sourceSelect.value = selected.id;
    this.applySourceDefaults();
    this.renderRecent();
    this.backdrop.hidden = false;
    this.addressInput.focus();
    this.addressInput.select();
  }

  hide() {
    this.backdrop.hidden = true;
  }

  private getRecent(): LiveRecentServer[] {
    const ids = getAvailableLiveSources(IS_LITE).map((source) => source.id);
    return (window.preferences?.liveRecent ?? []).filter((entry) => ids.includes(entry.source));
  }

  private applySourceDefaults() {
    const source = getAvailableLiveSources(IS_LITE).find((source) => source.id === this.sourceSelect.value);
    if (source === undefined) return;
    const recent = this.getRecent().find((entry) => entry.source === source.id);
    this.addressInput.placeholder = source.defaultAddress;
    this.addressInput.value = recent?.address ?? source.defaultAddress;
  }

  private renderRecent() {
    const sources = getAvailableLiveSources(IS_LITE);
    const recent = this.getRecent();
    this.recentList.innerHTML = "";
    if (recent.length === 0) {
      const empty = document.createElement("div");
      empty.classList.add("connect-recent-empty");
      empty.innerText = "No recent servers";
      this.recentList.appendChild(empty);
      return;
    }
    recent.forEach((entry) => {
      const row = document.createElement("div");
      row.classList.add("connect-recent-item");
      row.tabIndex = 0;
      const name = sources.find((source) => source.id === entry.source)?.name ?? entry.source;
      row.innerHTML = `<span class="connect-recent-address">${htmlEncode(
        entry.address
      )}</span><span class="connect-recent-source">${htmlEncode(name)}</span>`;
      row.title = "Click to select, double-click to connect";
      row.addEventListener("click", () => {
        this.sourceSelect.value = entry.source;
        this.addressInput.value = entry.address;
      });
      row.addEventListener("dblclick", () => {
        this.sourceSelect.value = entry.source;
        this.addressInput.value = entry.address;
        this.confirm();
      });
      this.recentList.appendChild(row);
    });
  }

  private confirm() {
    const sourceId = this.sourceSelect.value;
    const address = this.addressInput.value.trim() || this.addressInput.placeholder;
    this.hide();
    this.onConnect(sourceId, address);
  }
}

// ------------------------------------------------------------------------------------------------
// Status pill

export interface LivePillState {
  active: boolean;
  sourceName: string;
  address: string;
  status: LiveDataSourceStatus;
  provider: LiveStatusProvider | null;
}

type Tone = "good" | "warn" | "bad" | "idle";

const FRESHNESS_TONE: { [key in Freshness]: Tone } = { online: "good", stale: "warn", offline: "bad" };

export class LiveStatusPill {
  private pill: HTMLButtonElement;
  private popover: HTMLElement;
  private getState: () => LivePillState;
  private onConnectRequest: () => void;
  private onDisconnect: () => void;
  private lastPillHtml = "";
  private lastPopoverHtml = "";
  private simMessage = "";

  constructor(getState: () => LivePillState, onConnectRequest: () => void, onDisconnect: () => void) {
    this.getState = getState;
    this.onConnectRequest = onConnectRequest;
    this.onDisconnect = onDisconnect;

    this.pill = document.createElement("button");
    this.pill.classList.add("live-pill");
    document.body.appendChild(this.pill);
    this.popover = document.createElement("div");
    this.popover.classList.add("live-popover");
    this.popover.hidden = true;
    document.body.appendChild(this.popover);

    this.pill.addEventListener("click", () => {
      if (!this.getState().active) {
        this.onConnectRequest();
      } else {
        this.popover.hidden = !this.popover.hidden;
        this.render();
      }
    });
    window.addEventListener("mousedown", (event) => {
      if (this.popover.hidden) return;
      if (event.target instanceof Node && (this.popover.contains(event.target) || this.pill.contains(event.target))) {
        return;
      }
      this.popover.hidden = true;
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") this.popover.hidden = true;
    });
    this.popover.addEventListener("click", (event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest("button") : null;
      if (target === null) return;
      const action = target.dataset.action;
      if (action === "connect") {
        this.popover.hidden = true;
        this.onConnectRequest();
      } else if (action === "disconnect") {
        this.popover.hidden = true;
        this.onDisconnect();
      } else if (action === "pause" || action === "resume" || action === "reset") {
        this.runSimAction(action);
      }
    });

    window.setInterval(() => this.render(), 200);
    this.render();
  }

  private async runSimAction(action: SimAction) {
    const provider = this.getState().provider;
    if (provider === null) return;
    this.simMessage = "";
    try {
      await provider.simControl(action);
    } catch (error) {
      this.simMessage = "Sim " + action + " failed: " + String(error);
    }
    this.render();
  }

  private render() {
    const state = this.getState();
    const summary = state.provider?.getLiveStatus() ?? null;

    // Pill
    let segments: { tone: Tone; text: string; title: string; glyph?: string }[] = [];
    if (!state.active) {
      segments.push({ tone: "idle", text: "Not connected", title: "Connect to a live source (Cmd/Ctrl+K)" });
    } else {
      const backend = getBackend(state, summary);
      segments.push({ tone: backend.tone, text: backend.label, title: "Backend: " + backend.detail });
      if (summary !== null) {
        if (summary.car !== null) {
          const counts = summary.signalCounts;
          segments.push({
            tone: FRESHNESS_TONE[summary.car],
            text: "Car " + summary.car,
            title: `Car: ${counts.online} online, ${counts.stale} stale, ${counts.offline} offline, ${counts.neverSeen} never seen`
          });
        }
        if (summary.sim !== null) {
          segments.push({
            tone: summary.sim.state === "running" ? "good" : summary.sim.state === "paused" ? "warn" : "bad",
            glyph: summary.sim.state === "running" ? "▶" : summary.sim.state === "paused" ? "❙❙" : "↺",
            text: "Sim " + summary.sim.state,
            title: "Simulation clock: " + summary.sim.state
          });
        }
        if (summary.unsynchronisedCount > 0) {
          segments.push({
            tone: "warn",
            glyph: "⚠",
            text: "",
            title: summary.unsynchronisedCount.toString() + " signal(s) with unsynchronised clocks (receive time shown)"
          });
        }
      }
    }
    const pillHtml = segments
      .map(
        (segment) =>
          `<span class="live-pill-segment ${segment.tone}" title="${htmlEncode(segment.title)}">` +
          (segment.glyph !== undefined
            ? `<span class="live-pill-glyph">${segment.glyph}</span>`
            : `<span class="live-pill-dot"></span>`) +
          (segment.text !== "" ? `<span>${htmlEncode(segment.text)}</span>` : "") +
          `</span>`
      )
      .join("");
    if (pillHtml !== this.lastPillHtml) {
      this.lastPillHtml = pillHtml;
      this.pill.innerHTML = pillHtml;
      this.pill.title = state.active ? "Live connection details" : "Connect to a live source";
      document.documentElement.style.setProperty("--live-pill-width", (this.pill.offsetWidth + 12).toString() + "px");
    }

    // Popover
    if (this.popover.hidden) return;
    const rows: [string, string][] = [];
    rows.push(["Source", htmlEncode(state.sourceName)]);
    rows.push(["Address", htmlEncode(state.address)]);
    const backend = getBackend(state, summary);
    rows.push(["Backend", toneDot(backend.tone) + htmlEncode(backend.detail)]);
    if (summary !== null) {
      if (summary.catalogue !== null) {
        rows.push([
          "Catalogue",
          htmlEncode(
            `${summary.catalogue.signals} signals, ${summary.catalogue.epoch} rev ${summary.catalogue.revision}`
          )
        ]);
      }
      const counts = summary.signalCounts;
      rows.push([
        "Car",
        (summary.car !== null ? toneDot(FRESHNESS_TONE[summary.car]) + htmlEncode(summary.car) + " &middot; " : "") +
          htmlEncode(
            `${counts.online} online, ${counts.stale} stale, ${counts.offline} offline` +
              (counts.neverSeen > 0 ? `, ${counts.neverSeen} never seen` : "")
          )
      ]);
      if (summary.sim !== null) {
        rows.push([
          "Sim clock",
          htmlEncode(
            `${summary.sim.state}, t = ${summary.sim.timeS.toFixed(1)} s, ${summary.sim.speed}×, ${
              summary.sim.resetCount
            } reset(s)`
          )
        ]);
      } else {
        rows.push(["Clock", "Unix time"]);
      }
      rows.push([
        "Segment",
        (summary.segmentIndex + 1).toString() + (summary.segmentIndex > 0 ? " (since reset)" : "")
      ]);
      rows.push([
        "History",
        summary.historyAvailable === false
          ? "Unavailable (501): live buffer only"
          : summary.historyAvailable === true
          ? "Available"
          : "Not requested yet"
      ]);
      if (summary.unsynchronisedCount > 0) {
        rows.push([
          "Clock sync",
          `<span class="live-warn">&#x26A0;</span> ${summary.unsynchronisedCount} signal(s) unsynchronised, receive time shown`
        ]);
      }
    }
    let html =
      `<table>` +
      rows.map(([label, value]) => `<tr><td class="label">${label}</td><td>${value}</td></tr>`).join("") +
      `</table>`;
    if (summary !== null && summary.simControls && summary.sim !== null) {
      const paused = summary.sim.state === "paused";
      html +=
        `<div class="live-popover-buttons">` +
        (paused
          ? `<button data-action="resume" title="Resume the simulation"><img src="symbols/play.svg" /></button>`
          : `<button data-action="pause" title="Pause the simulation"><img src="symbols/pause.svg" /></button>`) +
        `<button data-action="reset" title="Reset the simulation"><img src="symbols/rotateleft.svg" /></button>` +
        `<span class="live-popover-hint">Simulation</span></div>`;
    }
    if (this.simMessage !== "") html += `<div class="live-popover-error">${htmlEncode(this.simMessage)}</div>`;
    html +=
      `<div class="live-popover-actions">` +
      `<button class="text-button" data-action="connect">Connect…</button>` +
      `<button class="text-button" data-action="disconnect">Disconnect</button></div>`;
    if (html !== this.lastPopoverHtml) {
      this.lastPopoverHtml = html;
      this.popover.innerHTML = html;
    }
  }
}

function getBackend(
  state: LivePillState,
  summary: LiveStatusSummary | null
): { tone: Tone; label: string; detail: string } {
  if (summary !== null) {
    switch (summary.backend) {
      case "connected":
        return { tone: "good", label: "Connected", detail: "Connected to " + state.address };
      case "connecting":
        return {
          tone: "warn",
          label: "Connecting",
          detail: summary.backendDetail !== "" ? summary.backendDetail : "Connecting to " + state.address
        };
      case "error":
        return {
          tone: "bad",
          label: "Error",
          detail: (summary.backendDetail !== "" ? summary.backendDetail : "Connection failed") + " (retrying)"
        };
    }
  }
  switch (state.status) {
    case LiveDataSourceStatus.Active:
      return { tone: "good", label: "Connected", detail: "Connected to " + state.address };
    case LiveDataSourceStatus.Error:
      return { tone: "bad", label: "Error", detail: "Connection failed" };
    default:
      return { tone: "warn", label: "Connecting", detail: "Searching for " + state.address };
  }
}

function toneDot(tone: Tone): string {
  return `<span class="live-pill-segment ${tone} inline"><span class="live-pill-dot"></span></span>`;
}
