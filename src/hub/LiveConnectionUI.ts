// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { IS_LITE } from "../shared/buildConstants";
import { sessionAddresses, validateLiveAddress } from "./dataSources/LiveAddress";
import { LiveDataSourceStatus } from "./dataSources/LiveDataSource";
import { getAvailableLiveSources } from "./dataSources/LiveSourceRegistry";
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
        <div class="connect-message" role="status" aria-live="polite"></div><button class="connect-cancel" title="Cancel"><img src="symbols/close.svg" /></button>
        <button class="connect-confirm" title="Connect"><img src="symbols/check.svg" /></button>
      </div>`;
    document.body.appendChild(this.backdrop);

    this.message = this.backdrop.querySelector(".connect-message") as HTMLElement;
    this.sourceSelect = this.backdrop.querySelector(".connect-source") as HTMLSelectElement;
    this.addressInput = this.backdrop.querySelector(".connect-address") as HTMLInputElement;

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
    if (address) {
      this.addressInput.value = address;
      this.loadMQTT();
      this.validate();
    }
    this.backdrop.hidden = false;
    this.addressInput.focus();
    this.addressInput.select();
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
    button.title = busy ? "Connecting…" : "Connect";
  }

  hide() {
    if (this.pending) {
      window.dispatchEvent(new Event("cancel-live-connect"));
      this.pending = false;
    }
    this.setBusy(false);
    this.backdrop.hidden = true;
  }

  private applySourceDefaults() {
    const source = getAvailableLiveSources(IS_LITE).find((source) => source.id === this.sourceSelect.value);
    if (source === undefined) return;
    this.addressInput.placeholder = source.defaultAddress;
    this.addressInput.value = sessionAddresses.get(source.id) ?? source.defaultAddress;
    this.loadMQTT();
    this.validate();
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
