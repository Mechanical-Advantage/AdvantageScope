import Preferences from "./shared/Preferences";

const THEME = document.getElementById("theme") as HTMLInputElement;
const RIO_ADDRESS = document.getElementById("rioAddress") as HTMLInputElement;
const RIO_PATH = document.getElementById("rioPath") as HTMLInputElement;
const LIVE_MODE = document.getElementById("liveMode") as HTMLInputElement;
const RLOG_PORT = document.getElementById("rlogPort") as HTMLInputElement;
const THREE_DIMENSION_MODE = document.getElementById("threeDimensionMode") as HTMLInputElement;
const WPILOG_NT_PREFIX = document.getElementById("wpilogNTPrefix") as HTMLInputElement;
const EXIT_BUTTON = document.getElementById("exit") as HTMLInputElement;
const CONFIRM_BUTTON = document.getElementById("confirm") as HTMLInputElement;

window.addEventListener("message", (event) => {
  if (event.source == window && event.data == "port") {
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
      if (platform == "linux") {
        (THEME.children[0] as HTMLElement).hidden = true;
        (THEME.children[1] as HTMLElement).innerText = "Light";
        (THEME.children[2] as HTMLElement).innerText = "Dark";
      }
      THEME.value = oldPrefs.theme;
      RIO_ADDRESS.value = oldPrefs.rioAddress;
      RIO_PATH.value = oldPrefs.rioPath;
      LIVE_MODE.value = oldPrefs.liveMode;
      RLOG_PORT.value = oldPrefs.rlogPort.toString();
      THREE_DIMENSION_MODE.value = oldPrefs.threeDimensionMode;
      WPILOG_NT_PREFIX.checked = oldPrefs.wpilogNtPrefix;

      // Close function
      function close(useNewPrefs: boolean) {
        if (useNewPrefs) {
          let theme: "light" | "dark" | "system" = "system";
          if (THEME.value == "light") theme = "light";
          if (THEME.value == "dark") theme = "dark";
          if (THEME.value == "system") theme = "system";

          let liveMode: "nt4" | "nt4-akit" | "rlog" = "nt4";
          if (LIVE_MODE.value == "nt4") liveMode = "nt4";
          if (LIVE_MODE.value == "nt4-akit") liveMode = "nt4-akit";
          if (LIVE_MODE.value == "rlog") liveMode = "rlog";

          let threeDimensionMode: "quality" | "efficiency" | "auto" = "quality";
          if (THREE_DIMENSION_MODE.value == "quality") threeDimensionMode = "quality";
          if (THREE_DIMENSION_MODE.value == "efficiency") threeDimensionMode = "efficiency";
          if (THREE_DIMENSION_MODE.value == "auto") threeDimensionMode = "auto";

          let newPrefs: Preferences = {
            theme: theme,
            rioAddress: RIO_ADDRESS.value,
            rioPath: RIO_PATH.value,
            liveMode: liveMode,
            rlogPort: Number(RLOG_PORT.value),
            threeDimensionMode: threeDimensionMode,
            wpilogNtPrefix: WPILOG_NT_PREFIX.checked
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
        if (event.code == "Enter") close(true);
      });
    };
  }
});
