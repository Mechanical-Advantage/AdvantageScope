// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Preferences from "./shared/Preferences";

const THEME = document.getElementById("theme") as HTMLInputElement;
const ROBOT_ADDRESS = document.getElementById("robotAddress") as HTMLInputElement;
const REMOTE_PATH = document.getElementById("remotePath") as HTMLInputElement;
const DBC_FOLDER = document.getElementById("dbcFolder") as HTMLInputElement;
const LIVE_SUBSCRIBE_MODE = document.getElementById("liveSubscribeMode") as HTMLInputElement;
const LIVE_DISCARD = document.getElementById("liveDiscard") as HTMLInputElement;
const TIMESTAMPS = document.getElementById("timestamps") as HTMLInputElement;
const FIELD_3D_MODE_AC = document.getElementById("field3dModeAc") as HTMLInputElement;
const FIELD_3D_MODE_AC_LABEL = document.getElementById("field3dModeAcLabel") as HTMLElement;
const FIELD_3D_MODE_BATTERY = document.getElementById("field3dModeBattery") as HTMLInputElement;
const FIELD_3D_ANTIALIASING = document.getElementById("field3dAntialiasing") as HTMLInputElement;
const EXIT_BUTTON = document.getElementById("exit") as HTMLInputElement;
const CONFIRM_BUTTON = document.getElementById("confirm") as HTMLInputElement;

window.addEventListener("message", (event) => {
  if (event.data === "port") {
    let messagePort = event.ports[0];
    messagePort.onmessage = (event) => {
      // Update button focus
      if (typeof event.data === "object" && "isFocused" in event.data) {
        Array.from(document.getElementsByTagName("button")).forEach((button) => {
          if (event.data.isFocused) {
            button.classList.remove("blurred");
          } else {
            button.classList.add("blurred");
          }
        });
        return;
      }

      // Normal message
      let platform: string = event.data.platform;
      let oldPrefs: Preferences = event.data.prefs;

      // Update values
      switch (platform) {
        case "linux":
          (THEME.children[0] as HTMLElement).hidden = true;
          (THEME.children[1] as HTMLElement).innerText = "Light";
          (THEME.children[2] as HTMLElement).innerText = "Dark";
          break;

        case "lite":
          document.body.classList.add("lite");
          FIELD_3D_MODE_AC_LABEL.innerText = "3D Mode";
          break;
      }
      THEME.value = oldPrefs.theme;
      ROBOT_ADDRESS.value = oldPrefs.robotAddress;
      REMOTE_PATH.value = oldPrefs.remotePath;
      DBC_FOLDER.value = oldPrefs.dbcFolder;
      LIVE_SUBSCRIBE_MODE.value = oldPrefs.liveSubscribeMode;
      LIVE_DISCARD.value = oldPrefs.liveDiscard.toString();
      TIMESTAMPS.value = oldPrefs.timestamps;
      FIELD_3D_MODE_AC.value = oldPrefs.field3dModeAc;
      FIELD_3D_MODE_BATTERY.value = oldPrefs.field3dModeBattery;
      FIELD_3D_ANTIALIASING.value = oldPrefs.field3dAntialiasing.toString();

      // Close function
      function close(useNewPrefs: boolean) {
        if (useNewPrefs) {
          let theme: "light" | "dark" | "system" = "system";
          if (THEME.value === "light") theme = "light";
          if (THEME.value === "dark") theme = "dark";
          if (THEME.value === "system") theme = "system";

          let liveSubscribeMode: "low-bandwidth" | "logging" = "low-bandwidth";
          if (LIVE_SUBSCRIBE_MODE.value === "low-bandwidth") liveSubscribeMode = "low-bandwidth";
          if (LIVE_SUBSCRIBE_MODE.value === "logging") liveSubscribeMode = "logging";

          let field3dModeAc: "cinematic" | "standard" | "low-power" = "standard";
          if (FIELD_3D_MODE_AC.value === "cinematic") field3dModeAc = "cinematic";
          if (FIELD_3D_MODE_AC.value === "standard") field3dModeAc = "standard";
          if (FIELD_3D_MODE_AC.value === "low-power") field3dModeAc = "low-power";

          let field3dModeBattery: "" | "cinematic" | "standard" | "low-power" = "";
          if (FIELD_3D_MODE_BATTERY.value === "") field3dModeBattery = "";
          if (FIELD_3D_MODE_BATTERY.value === "cinematic") field3dModeBattery = "cinematic";
          if (FIELD_3D_MODE_BATTERY.value === "standard") field3dModeBattery = "standard";
          if (FIELD_3D_MODE_BATTERY.value === "low-power") field3dModeBattery = "low-power";

          let timestamps: "start-zero" | "original" = "start-zero";
          if (TIMESTAMPS.value === "start-zero") timestamps = "start-zero";
          if (TIMESTAMPS.value === "original") timestamps = "original";

          let newPrefs: Preferences = {
            theme: theme,
            robotAddress: ROBOT_ADDRESS.value,
            remotePath: REMOTE_PATH.value,
            liveMode: oldPrefs.liveMode,
            liveSubscribeMode: liveSubscribeMode,
            liveDiscard: Number(LIVE_DISCARD.value),
            liveRecent: oldPrefs.liveRecent ?? [],
            mqttConnections: oldPrefs.mqttConnections ?? {},
            field3dModeAc: field3dModeAc,
            field3dModeBattery: field3dModeBattery,
            field3dAntialiasing: FIELD_3D_ANTIALIASING.value === "true",
            userAssetsFolder: oldPrefs.userAssetsFolder,
            dbcFolder: DBC_FOLDER.value.trim(),
            hasScrolledLineGraph: oldPrefs.hasScrolledLineGraph,
            hasScrolledTimeline: oldPrefs.hasScrolledTimeline,
            prefersFTC: oldPrefs.prefersFTC,
            timestamps: timestamps
          };
          messagePort.postMessage(newPrefs);
        } else {
          messagePort.postMessage(oldPrefs);
        }
      }

      // Set up exit triggers
      EXIT_BUTTON.addEventListener("click", () => {
        close(false);
      });
      CONFIRM_BUTTON.addEventListener("click", () => close(true));
      window.addEventListener("keydown", (event) => {
        if (event.code === "Enter") close(true);
      });
    };
  }
});
