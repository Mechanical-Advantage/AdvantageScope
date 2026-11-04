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
import { RenderGuard } from "../shared/RenderGuard";
import { IS_LITE } from "../shared/buildConstants";
import { htmlEncode } from "../shared/util";
import { validateLiveAddress } from "./dataSources/LiveAddress";
import { LiveDataSourceStatus } from "./dataSources/LiveDataSource";
import { getAvailableLiveSources } from "./dataSources/LiveSourceRegistry";
import { Freshness, LiveStatusProvider, LiveStatusSummary, SimAction } from "./dataSources/LiveStatus";
import {
  DEFAULT_MQTT_SETTINGS,
  MQTTSettings,
  mqttCredentials,
  normaliseMQTTSettings,
  validateTopicFilter
} from "./dataSources/mqtt/MQTTConfig";

// ------------------------------------------------------------------------------------------------
// Connect dialog

export class ConnectDialog {
  private backdrop: HTMLElement;
  private sourceSelect: HTMLSelectElement;
  private addressInput: HTMLInputElement;
  private recentList: HTMLElement;
  private pending = false;
  private message: HTMLElement;
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
            <td class="input"><select class="connect-source mv-select" title="Select the live source"></select></td>
          </tr>
          <tr>
            <td class="label">Address</td>
            <td class="input"><input class="connect-address" type="text" spellcheck="false" title="Address of the live source" /></td>
          </tr>
          <tr class="mqtt-option"><td class="label">Username</td><td class="input"><input class="mqtt-username" aria-label="MQTT username" autocomplete="off" title="Session-only broker username" /></td></tr>
          <tr class="mqtt-option"><td class="label">Password</td><td class="input"><input class="mqtt-password" aria-label="MQTT password" type="password" autocomplete="off" title="Session-only broker password" /></td></tr>
          <tr class="mqtt-option"><td class="label">Topic filter</td><td class="input"><input class="mqtt-topic" aria-label="Topic filter" value="mur/#" spellcheck="false" /></td></tr>
          <tr class="mqtt-option"><td class="label">Mapping</td><td class="input"><select class="mqtt-mode mv-select" aria-label="Mapping mode"><option value="json-per-signal">JSON per signal</option><option value="json-object">JSON object</option><option value="raw-can">Raw CAN + DBC</option><option value="ascii">ASCII name=value</option></select></td></tr>
          <tr class="mqtt-option"><td class="label">CAN timestamp</td><td class="input"><label><input class="mqtt-timestamp mv-checkbox" type="checkbox" /> u64 ns prefix (big endian)</label></td></tr>
        </table>
        <div class="connect-bridge-hint" hidden></div>
        <div class="connect-recent-title">Recent</div>
        <div class="connect-recent"></div>
        <div class="connect-message" role="status" aria-live="polite"></div><button class="connect-cancel" title="Cancel">Cancel</button>
        <button class="connect-confirm" title="Connect">Connect</button>
      </div>`;
    document.body.appendChild(this.backdrop);

    this.message = this.backdrop.querySelector(".connect-message") as HTMLElement;
    this.sourceSelect = this.backdrop.querySelector(".connect-source") as HTMLSelectElement;
    this.addressInput = this.backdrop.querySelector(".connect-address") as HTMLInputElement;
    this.recentList = this.backdrop.querySelector(".connect-recent") as HTMLElement;

    this.addressInput.addEventListener("input", () => this.validate());
    this.addressInput.addEventListener("change", () => this.loadMQTT());
    this.backdrop.querySelector(".mqtt-topic")!.addEventListener("input", () => this.validate());
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

  show(address?: string) {
    this.message.innerText = "";
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
    if (address) {
      this.addressInput.value = address;
      this.loadMQTT();
      this.validate();
    }
    this.backdrop.hidden = false;
    this.probeBridge();
    this.addressInput.focus();
    this.addressInput.select();
  }

  /** Hints when a Foxglove bridge answers on :8765 so ROS users do not have to know to pick the source. */
  private probeBridge() {
    const hint = this.backdrop.querySelector(".connect-bridge-hint") as HTMLElement;
    hint.hidden = true;
    let socket: WebSocket;
    try {
      socket = new WebSocket("ws://localhost:8765", ["foxglove.websocket.v1"]);
    } catch {
      return;
    }
    const timer = window.setTimeout(() => socket.close(), 1500);
    socket.onopen = () => {
      window.clearTimeout(timer);
      if (socket.protocol === "foxglove.websocket.v1" && !this.backdrop.hidden) {
        hint.hidden = false;
        hint.replaceChildren();
        const use = document.createElement("button");
        use.textContent = "Use";
        use.title = "Select ROS 2 (Foxglove) at ws://localhost:8765";
        use.onclick = () => {
          if ([...this.sourceSelect.options].some((o) => o.value === "foxglove")) {
            this.sourceSelect.value = "foxglove";
            this.addressInput.value = "ws://localhost:8765";
            this.validate();
          }
        };
        hint.append("Foxglove bridge detected on localhost:8765. ", use);
      }
      socket.close();
    };
    socket.onerror = () => window.clearTimeout(timer);
  }

  updateStatus(status: LiveDataSourceStatus) {
    if (!this.pending) return;
    if (status === LiveDataSourceStatus.Active) {
      this.pending = false;
      this.hide();
    }
    if (status === LiveDataSourceStatus.Error)
      this.connectionFailed("Connection failed. Edit the address and try again.");
  }

  connectionFailed(error: string) {
    this.pending = false;
    this.message.innerText = error;
    this.setBusy(false);
  }

  private setBusy(busy: boolean) {
    this.sourceSelect.disabled = this.addressInput.disabled = busy;
    this.backdrop
      .querySelectorAll<HTMLInputElement | HTMLSelectElement>(".mqtt-option input, .mqtt-option select")
      .forEach((input) => (input.disabled = busy));
    const button = this.backdrop.querySelector(".connect-confirm") as HTMLButtonElement;
    button.disabled = busy;
    button.innerText = busy ? "Connecting…" : "Connect";
  }

  hide() {
    if (this.pending) {
      window.dispatchEvent(new Event("cancel-live-connect"));
      this.pending = false;
    }
    this.setBusy(false);
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
    this.loadMQTT();
    this.validate();
  }

  private renderRecent() {
    const sources = getAvailableLiveSources(IS_LITE);
    const recent = this.getRecent();
    this.recentList.innerHTML = "";
    this.recentList.classList.toggle("empty", recent.length === 0);
    (this.backdrop.querySelector(".connect-recent-title") as HTMLElement).hidden = recent.length === 0;
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
        this.loadMQTT();
        this.validate();
      });
      row.addEventListener("dblclick", () => {
        this.sourceSelect.value = entry.source;
        this.addressInput.value = entry.address;
        this.loadMQTT();
        this.validate();
        this.confirm();
      });
      this.recentList.appendChild(row);
    });
  }

  private mqttInput<T extends HTMLInputElement | HTMLSelectElement>(name: string): T {
    return this.backdrop.querySelector(".mqtt-" + name) as T;
  }
  private loadMQTT() {
    const enabled = this.sourceSelect.value === "mqtt";
    this.backdrop.querySelectorAll<HTMLElement>(".mqtt-option").forEach((row) => (row.hidden = !enabled));
    if (!enabled) return;
    const address = this.addressInput.value;
    const settings = normaliseMQTTSettings(window.preferences?.mqttConnections?.[address] ?? DEFAULT_MQTT_SETTINGS);
    this.mqttInput("topic").value = settings.topic;
    this.mqttInput("mode").value = settings.mode;
    this.mqttInput<HTMLInputElement>("timestamp").checked = settings.timestampPrefix;
    this.mqttInput("username").value = mqttCredentials.get(address)?.username ?? "";
    this.mqttInput("password").value = mqttCredentials.get(address)?.password ?? "";
  }
  private validate(): boolean {
    let error = validateLiveAddress(
      this.sourceSelect.value,
      this.addressInput.value.trim() || this.addressInput.placeholder
    );
    if (this.sourceSelect.value === "mqtt" && !validateTopicFilter(this.mqttInput("topic").value))
      error = "Enter a valid MQTT topic filter (for example mur/#).";
    this.message.innerText = error ?? "";
    this.addressInput.setAttribute("aria-invalid", String(error !== null));
    return error === null;
  }

  private confirm() {
    if (this.pending || !this.validate()) return;
    const sourceId = this.sourceSelect.value;
    const address = this.addressInput.value.trim() || this.addressInput.placeholder;
    if (sourceId === "mqtt" && window.preferences) {
      const settings = normaliseMQTTSettings({
        topic: this.mqttInput("topic").value,
        mode: this.mqttInput("mode").value as MQTTSettings["mode"],
        timestampPrefix: this.mqttInput<HTMLInputElement>("timestamp").checked
      });
      window.preferences.mqttConnections = { ...window.preferences.mqttConnections, [address]: settings };
      window.sendMainMessage("update-preferences", { mqttConnections: window.preferences.mqttConnections });
      mqttCredentials.set(address, {
        username: this.mqttInput("username").value,
        password: this.mqttInput("password").value
      });
    }
    this.pending = true;
    this.setBusy(true);
    this.message.innerText = "Connecting…";
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

const FRESHNESS_TONE: { [key in Freshness]: Tone } = {
  online: "good",
  stale: "warn",
  offline: "idle",
  unknown: "idle"
};

export class LiveStatusPill {
  private pill: HTMLButtonElement;
  private popover: HTMLElement;
  private getState: () => LivePillState;
  private onConnectRequest: (address?: string) => void;
  private onDisconnect: () => void;
  private lastPillHtml = "";
  private lastPopoverHtml = "";
  private simMessage = "";
  private detailsOpen = false;
  private runLabel: HTMLElement;
  private failureBar: HTMLElement;

  constructor(getState: () => LivePillState, onConnectRequest: (address?: string) => void, onDisconnect: () => void) {
    this.failureBar = document.createElement("div");
    this.failureBar.className = "live-failure-bar";
    this.failureBar.hidden = true;
    this.failureBar.addEventListener("click", (event) => {
      const action = (event.target as HTMLElement).closest("button")?.dataset.action;
      if (action === "edit-address") this.onConnectRequest(this.getState().address);
      else if (action === "disconnect") this.onDisconnect();
    });
    document.body.appendChild(this.failureBar);
    this.runLabel = document.createElement("span");
    this.runLabel.className = "live-run-label mv-chip";
    document.body.appendChild(this.runLabel);
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
    this.popover.addEventListener("change", (event) => {
      if (event.target instanceof HTMLSelectElement && event.target.classList.contains("live-run-select"))
        this.getState().provider?.selectRun(Number(event.target.value));
    });
    this.popover.addEventListener(
      "toggle",
      (event) => {
        if (event.target instanceof HTMLDetailsElement) this.detailsOpen = event.target.open;
      },
      true
    );
    this.popover.addEventListener("click", (event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest("button") : null;
      if (target === null) return;
      const action = target.dataset.action;
      if (action === "connect") {
        this.popover.hidden = true;
        this.onConnectRequest();
      } else if (action === "edit-address") {
        this.popover.hidden = true;
        this.onConnectRequest(this.getState().address);
      } else if (action === "disconnect") {
        this.popover.hidden = true;
        this.onDisconnect();
      } else if (action === "stale" || action === "offline") {
        window.sidebar.toggleFreshnessFilter(action);
      } else if (action === "live") {
        const summary = this.getState().provider?.getLiveStatus();
        if (summary) this.getState().provider?.selectRun(summary.runCount - 1);
      } else if (action === "pause" || action === "resume" || action === "reset") {
        this.runSimAction(action);
      }
    });

    const guard = new RenderGuard();
    window.setInterval(() => guard.run(() => this.render()), 200);
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

    // Inline failure message at the top of the content area
    const failing = state.active && (summary?.backend === "error" || (summary?.retryAttempt ?? 0) > 0);
    const viewer = document.querySelector("div.viewer") as HTMLElement | null;
    document.body.classList.toggle("live-failure", failing);
    this.failureBar.hidden = !failing || viewer === null;
    if (failing && viewer !== null) {
      this.failureBar.style.top = (viewer.offsetTop - 26).toString() + "px";
      const html =
        `<span class="live-failure-text">Cannot reach ${htmlEncode(state.address ?? "the backend")}</span>` +
        `<button class="text-button" data-action="edit-address">Edit address</button>` +
        `<button class="text-button" data-action="disconnect">Stop retrying</button>`;
      if (html !== this.failureBar.innerHTML) this.failureBar.innerHTML = html;
    }

    const pillRect = this.pill.getBoundingClientRect();
    this.runLabel.style.top = pillRect.top.toString() + "px";
    this.runLabel.style.right = (window.innerWidth - pillRect.left + 8).toString() + "px";
    this.runLabel.hidden = summary?.sim === null || summary === null;
    this.runLabel.style.visibility = "";
    this.runLabel.innerText = summary
      ? `Run ${summary.viewedRun + 1}${
          summary.viewedRun < summary.runCount - 1
            ? " · past run"
            : summary.sim?.state === "reset"
            ? " · reset"
            : " · live"
        }`
      : "";
    // The chip yields to the sidebar menu when the window is too narrow for both.
    const sideBarWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--side-bar-width"));
    if (!this.runLabel.hidden && this.runLabel.getBoundingClientRect().left < (sideBarWidth || 0) + 8)
      this.runLabel.style.visibility = "hidden";
    // Pill
    let segments: { tone: Tone; text: string; title: string; glyph?: string }[] = [];
    if (!state.active) {
      segments.push({ tone: "idle", text: "Connect…", title: "Connect to a live source (Cmd/Ctrl+K)" });
    } else {
      const backend = getBackend(state, summary);
      segments.push({
        tone: backend.tone,
        text: state.sourceName.startsWith("MQTT") ? backend.label.replace("Backend", "Broker") : backend.label,
        title: (state.sourceName.startsWith("MQTT") ? "Broker: " : "Backend: ") + backend.detail
      });
      if (summary !== null) {
        if (summary.car !== null) {
          const counts = summary.signalCounts;
          segments.push({
            tone: FRESHNESS_TONE[summary.car],
            text: "Telemetry " + summary.car.toUpperCase(),
            title: `Car: ${counts.online} online, ${counts.stale} stale, ${counts.offline} offline, ${counts.neverSeen} never seen`
          });
        }
        // The sim state is unknown while the backend is unreachable, so don't show the last one as current
        if (summary.sim !== null && backend.tone !== "bad") {
          segments.push({
            tone: summary.sim.state === "running" ? "good" : summary.sim.state === "paused" ? "warn" : "idle",

            text: "Sim " + summary.sim.state,
            title: "Simulation clock: " + summary.sim.state
          });
        }
        if (summary.oldestAgeS !== null)
          segments.push({
            tone: "idle",
            text: `oldest ${summary.oldestAgeS.toFixed(1)} s`,
            title: "Oldest known sample age"
          });
        if (summary.retryAttempt > 0)
          segments.push({
            tone: "warn",
            text: `Retry ${summary.retryAttempt} in ${summary.retryInS.toFixed(1)} s · ${
              summary.lastReceiptAgeS === null
                ? "no data yet"
                : `last receipt ${summary.lastReceiptAgeS.toFixed(1)} s ago`
            }`,
            title: summary.backendDetail
          });
        if (summary.receivingAgain)
          segments.push({ tone: "good", text: "Receiving again", title: "Samples are arriving again" });
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
    // Sit below the signal summary and strip.
    const chrome = [
      document.querySelector(".severity-banner"),
      document.querySelector(".health-strip"),
      document.querySelector(".live-failure-bar")
    ];
    const bottom = Math.max(
      40,
      ...chrome.map((el) => (el instanceof HTMLElement && !el.hidden ? el.getBoundingClientRect().bottom + 4 : 0))
    );
    this.popover.style.top = bottom.toString() + "px";
    const rows: [string, string][] = [];

    const backend = getBackend(state, summary);
    rows.push([
      state.sourceName.startsWith("MQTT") ? "Broker" : "Backend",
      toneDot(backend.tone) + htmlEncode(backend.detail)
    ]);
    if (summary !== null) {
      const counts = summary.signalCounts;
      rows.push([
        "Car",
        `<span class="live-signal-counts">${counts.online} fresh &middot; <button class="text-button" data-action="stale">${counts.stale} stale</button> &middot; <button class="text-button" data-action="offline">${counts.offline} offline</button> &middot; ${counts.neverSeen} unknown</span>`
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
    html += `<div class="live-freshness-legend">● fresh · ◇ stale · ⊘ offline · ? unknown · ⚠ clock quality</div>`;
    html += `<details ${
      this.detailsOpen ? "open" : ""
    }><summary>Details</summary><table><tr><td class="label">Source</td><td>${htmlEncode(
      state.sourceName
    )}</td></tr><tr><td class="label">Address</td><td>${htmlEncode(state.address)}</td></tr>`;
    if (summary)
      html += `<tr><td class="label">Catalogue</td><td>${htmlEncode(
        JSON.stringify(summary.catalogue)
      )}</td></tr><tr><td class="label">Segment</td><td>${
        summary.segmentIndex + 1
      }</td></tr><tr><td class="label">History</td><td>${
        summary.historyAvailable === false
          ? "Unavailable (501): live buffer only"
          : summary.historyAvailable
          ? "Available"
          : "Not requested yet"
      }</td></tr>`;
    html += `</table></details>`;
    if (summary?.sim)
      html += `<div class="live-run-controls"><label>Run <select class="live-run-select mv-select">${Array.from(
        { length: summary.runCount },
        (_, i) =>
          `<option value="${i}" ${i === summary.viewedRun ? "selected" : ""}>Run ${i + 1}${
            i === summary.runCount - 1 ? " · live" : ""
          }</option>`
      ).join("")}</select></label>${
        summary.viewedRun < summary.runCount - 1
          ? '<button class="text-button" data-action="live">Back to live</button>'
          : ""
      }</div>`;
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
    const failed = summary?.backend === "error" || summary?.retryAttempt;
    html +=
      `<div class="live-popover-actions">` +
      (failed
        ? `<button class="text-button" data-action="edit-address">Edit address…</button>` +
          `<button class="text-button" data-action="disconnect">Stop retrying</button></div>`
        : `<button class="text-button" data-action="connect">Connect…</button>` +
          `<button class="text-button" data-action="disconnect">Disconnect</button></div>`);
    if (this.popover.querySelector("select") === document.activeElement) return;
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
        return { tone: "good", label: "Backend ✓", detail: "Connected to " + state.address };
      case "connecting":
        return {
          tone: "warn",
          label: "Backend connecting",
          detail: summary.backendDetail !== "" ? summary.backendDetail : "Connecting to " + state.address
        };
      case "error":
        return {
          tone: "bad",
          label: "Backend error",
          detail: (summary.backendDetail !== "" ? summary.backendDetail : "Connection failed") + " (retrying)"
        };
    }
  }
  switch (state.status) {
    case LiveDataSourceStatus.Active:
      return { tone: "good", label: "Backend ✓", detail: "Connected to " + state.address };
    case LiveDataSourceStatus.Error:
      return { tone: "bad", label: "Backend error", detail: "Connection failed" };
    default:
      return { tone: "warn", label: "Backend connecting", detail: "Searching for " + state.address };
  }
}

function toneDot(tone: Tone): string {
  return `<span class="live-pill-segment ${tone} inline"><span class="live-pill-dot"></span></span>`;
}
