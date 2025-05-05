import { CoordinateSystem } from "./shared/AdvantageScopeAssets";
import Preferences from "./shared/Preferences";

const THEME = document.getElementById("theme") as HTMLInputElement;
const RIO_ADDRESS = document.getElementById("rioAddress") as HTMLInputElement;
const RIO_PATH = document.getElementById("rioPath") as HTMLInputElement;
const LIVE_MODE = document.getElementById("liveMode") as HTMLInputElement;
const LIVE_SUBSCRIBE_MODE = document.getElementById("liveSubscribeMode") as HTMLInputElement;
const LIVE_DISCARD = document.getElementById("liveDiscard") as HTMLInputElement;
const PUBLISH_FILTER = document.getElementById("publishFilter") as HTMLInputElement;
const COORDINATE_SYSTEM = document.getElementById("coordinateSystem") as HTMLInputElement;
const FIELD_3D_MODE_AC = document.getElementById("field3dModeAc") as HTMLInputElement;
const FIELD_3D_MODE_BATTERY = document.getElementById("field3dModeBattery") as HTMLInputElement;
const FIELD_3D_ANTIALIASING = document.getElementById("field3dAntialiasing") as HTMLInputElement;
const TBA_API_KEY = document.getElementById("tbaApiKey") as HTMLInputElement;
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
      if (platform === "linux") {
        (THEME.children[0] as HTMLElement).hidden = true;
        (THEME.children[1] as HTMLElement).innerText = "Light";
        (THEME.children[2] as HTMLElement).innerText = "Dark";
      }
      THEME.value = oldPrefs.theme;
      RIO_ADDRESS.value = oldPrefs.rioAddress;
      RIO_PATH.value = oldPrefs.rioPath;
      LIVE_MODE.value = oldPrefs.liveMode;
      LIVE_SUBSCRIBE_MODE.value = oldPrefs.liveSubscribeMode;
      LIVE_DISCARD.value = oldPrefs.liveDiscard.toString();
      PUBLISH_FILTER.value = oldPrefs.publishFilter;
      COORDINATE_SYSTEM.value = oldPrefs.coordinateSystem;
      FIELD_3D_MODE_AC.value = oldPrefs.field3dModeAc;
      FIELD_3D_MODE_BATTERY.value = oldPrefs.field3dModeBattery;
      FIELD_3D_ANTIALIASING.value = oldPrefs.field3dAntialiasing.toString();
      TBA_API_KEY.value = oldPrefs.tbaApiKey;

      // Close function
      function close(useNewPrefs: boolean) {
        if (useNewPrefs) {
          let theme: "light" | "dark" | "system" = "system";
          if (THEME.value === "light") theme = "light";
          if (THEME.value === "dark") theme = "dark";
          if (THEME.value === "system") theme = "system";

          let liveMode: "nt4" | "nt4-akit" | "phoenix" | "pathplanner" | "rlog" = "nt4";
          if (LIVE_MODE.value === "nt4") liveMode = "nt4";
          if (LIVE_MODE.value === "nt4-akit") liveMode = "nt4-akit";
          if (LIVE_MODE.value === "phoenix") liveMode = "phoenix";
          if (LIVE_MODE.value === "pathplanner") liveMode = "pathplanner";
          if (LIVE_MODE.value === "rlog") liveMode = "rlog";

          let liveSubscribeMode: "low-bandwidth" | "logging" = "low-bandwidth";
          if (LIVE_SUBSCRIBE_MODE.value === "low-bandwidth") liveSubscribeMode = "low-bandwidth";
          if (LIVE_SUBSCRIBE_MODE.value === "logging") liveSubscribeMode = "logging";

          let coordinateSystem: "automatic" | CoordinateSystem = "automatic";
          if (COORDINATE_SYSTEM.value === "automatic") coordinateSystem = "automatic";
          if (COORDINATE_SYSTEM.value === "wall-alliance") coordinateSystem = "wall-alliance";
          if (COORDINATE_SYSTEM.value === "wall-blue") coordinateSystem = "wall-blue";
          if (COORDINATE_SYSTEM.value === "center-rotated") coordinateSystem = "center-rotated";
          if (COORDINATE_SYSTEM.value === "center-red") coordinateSystem = "center-red";

          let field3dModeAc: "cinematic" | "standard" | "low-power" = "standard";
          if (FIELD_3D_MODE_AC.value === "cinematic") field3dModeAc = "cinematic";
          if (FIELD_3D_MODE_AC.value === "standard") field3dModeAc = "standard";
          if (FIELD_3D_MODE_AC.value === "low-power") field3dModeAc = "low-power";

          let field3dModeBattery: "" | "cinematic" | "standard" | "low-power" = "";
          if (FIELD_3D_MODE_BATTERY.value === "") field3dModeBattery = "";
          if (FIELD_3D_MODE_BATTERY.value === "cinematic") field3dModeBattery = "cinematic";
          if (FIELD_3D_MODE_BATTERY.value === "standard") field3dModeBattery = "standard";
          if (FIELD_3D_MODE_BATTERY.value === "low-power") field3dModeBattery = "low-power";

          let newPrefs: Preferences = {
            theme: theme,
            rioAddress: RIO_ADDRESS.value,
            rioPath: RIO_PATH.value,
            liveMode: liveMode,
            liveSubscribeMode: liveSubscribeMode,
            liveDiscard: Number(LIVE_DISCARD.value),
            publishFilter: PUBLISH_FILTER.value,
            rlogPort: oldPrefs.rlogPort,
            coordinateSystem: coordinateSystem,
            field3dModeAc: field3dModeAc,
            field3dModeBattery: field3dModeBattery,
            field3dAntialiasing: FIELD_3D_ANTIALIASING.value === "true",
            tbaApiKey: TBA_API_KEY.value,
            userAssetsFolder: oldPrefs.userAssetsFolder,
            skipHootNonProWarning: oldPrefs.skipHootNonProWarning,
            skipFrcLogFolderDefault: oldPrefs.skipFrcLogFolderDefault,
            skipNumericArrayDeprecationWarning: oldPrefs.skipNumericArrayDeprecationWarning,
            skipXRExperimentalWarning: oldPrefs.skipXRExperimentalWarning,
            ctreLicenseAccepted: oldPrefs.ctreLicenseAccepted
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
