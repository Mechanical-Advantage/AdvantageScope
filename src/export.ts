import ExportOptions from "./shared/ExportOptions";

const HELP_URL = "https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/EXPORT.md";

const FORMAT = document.getElementById("format") as HTMLInputElement;
const SAMPLING_MODE = document.getElementById("samplingMode") as HTMLInputElement;
const SAMPLING_PERIOD = document.getElementById("samplingPeriod") as HTMLInputElement;
const PREFIXES = document.getElementById("prefixes") as HTMLInputElement;
const EXIT_BUTTON = document.getElementById("exit") as HTMLInputElement;
const CONFIRM_BUTTON = document.getElementById("confirm") as HTMLInputElement;
const HELP_BUTTON = document.getElementsByClassName("help-div")[0].firstElementChild as HTMLElement;

window.addEventListener("message", (event) => {
  if (event.source === window && event.data === "port") {
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
    };

    // Close function
    function confirm() {
      let format: "csv-table" | "csv-list" | "wpilog" = "csv-table";
      if (FORMAT.value === "csv-table") format = "csv-table";
      if (FORMAT.value === "csv-list") format = "csv-list";
      if (FORMAT.value === "wpilog") format = "wpilog";

      let samplingMode: "all" | "fixed" = "all";
      if (SAMPLING_MODE.value === "all") samplingMode = "all";
      if (SAMPLING_MODE.value === "fixed") samplingMode = "fixed";

      let options: ExportOptions = {
        format: format,
        samplingMode: samplingMode,
        samplingPeriod: Number(SAMPLING_PERIOD.value),
        prefixes: PREFIXES.value
      };
      messagePort.postMessage(options);
    }

    // Update disabled inputs
    function updateDisabled() {
      SAMPLING_MODE.disabled = FORMAT.value !== "csv-table";
      SAMPLING_PERIOD.disabled = FORMAT.value !== "csv-table" || SAMPLING_MODE.value !== "fixed";
    }
    FORMAT.addEventListener("change", updateDisabled);
    SAMPLING_MODE.addEventListener("change", updateDisabled);
    updateDisabled();

    // Enforce range for period
    SAMPLING_PERIOD.addEventListener("change", () => {
      if (Number(SAMPLING_PERIOD.value) <= 0) {
        SAMPLING_PERIOD.value = "1";
      }
    });

    // Set up exit triggers
    EXIT_BUTTON.addEventListener("click", () => {
      messagePort.postMessage(null);
    });
    CONFIRM_BUTTON.addEventListener("click", confirm);
    window.addEventListener("keydown", (event) => {
      if (event.code === "Enter") confirm();
    });

    // Help button
    HELP_BUTTON.addEventListener("click", () => {
      messagePort.postMessage(HELP_URL);
    });
  }
});
