import ExportOptions from "./shared/ExportOptions";

const HELP_URL = "https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/EXPORT.md#options";

const FORMAT = document.getElementById("format") as HTMLInputElement;
const SAMPLING_MODE = document.getElementById("samplingMode") as HTMLInputElement;
const SAMPLING_MODE_AKIT = SAMPLING_MODE.children[2] as HTMLOptionElement;
const SAMPLING_PERIOD = document.getElementById("samplingPeriod") as HTMLInputElement;
const PREFIXES = document.getElementById("prefixes") as HTMLInputElement;
const INCLUDE_GENERATED = document.getElementById("includeGenerated") as HTMLInputElement;
const EXIT_BUTTON = document.getElementById("exit") as HTMLInputElement;
const CONFIRM_BUTTON = document.getElementById("confirm") as HTMLInputElement;
const HELP_BUTTON = document.getElementsByClassName("help-div")[0].firstElementChild as HTMLElement;

window.addEventListener("message", (event) => {
  if (event.source === window && event.data === "port") {
    let messagePort = event.ports[0];
    messagePort.onmessage = (event) => {
      if (typeof event.data === "object") {
        // Update button focus
        if ("isFocused" in event.data) {
          Array.from(document.getElementsByTagName("button")).forEach((button) => {
            if (event.data.isFocused) {
              button.classList.remove("blurred");
            } else {
              button.classList.add("blurred");
            }
          });
        }

        if ("supportsAkit" in event.data) {
          let supportsAkit: boolean = event.data.supportsAkit;
          SAMPLING_MODE_AKIT.disabled = !supportsAkit;
        }
      }
    };

    // Close function
    function confirm() {
      let format: "csv-table" | "csv-list" | "wpilog" | "mcap" = "csv-table";
      if (FORMAT.value === "csv-table") format = "csv-table";
      if (FORMAT.value === "csv-list") format = "csv-list";
      if (FORMAT.value === "wpilog") format = "wpilog";
      if (FORMAT.value === "mcap") format = "mcap";

      let samplingMode: "changes" | "fixed" | "akit" = "changes";
      if (SAMPLING_MODE.value === "changes") samplingMode = "changes";
      if (SAMPLING_MODE.value === "fixed") samplingMode = "fixed";
      if (SAMPLING_MODE.value === "akit") samplingMode = "akit";

      let options: ExportOptions = {
        format: format,
        samplingMode: samplingMode,
        samplingPeriod: Number(SAMPLING_PERIOD.value),
        prefixes: PREFIXES.value,
        includeGenerated: INCLUDE_GENERATED.value === "true"
      };
      messagePort.postMessage(options);
    }

    // Update disabled inputs
    let updateDisabled = () => {
      SAMPLING_PERIOD.disabled = SAMPLING_MODE.value !== "fixed";
    };
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
