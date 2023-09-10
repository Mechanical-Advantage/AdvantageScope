import { cleanFloat } from "./shared/util";

const MIN_INPUT = document.getElementById("min") as HTMLInputElement;
const MAX_INPUT = document.getElementById("max") as HTMLInputElement;
const EXIT_BUTTON = document.getElementById("exit") as HTMLInputElement;
const CONFIRM_BUTTON = document.getElementById("confirm") as HTMLInputElement;

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

      // Normal message
      let range: [number, number] = event.data;

      // Update values
      MIN_INPUT.value = cleanFloat(range[0]).toString();
      MAX_INPUT.value = cleanFloat(range[1]).toString();
      MAX_INPUT.select();

      // Close function
      function confirm() {
        let min = Number(MIN_INPUT.value);
        let max = Number(MAX_INPUT.value);
        if (min >= max) {
          alert("Maximum must be greater than minimum.");
        } else {
          messagePort.postMessage([min, max]);
        }
      }

      // Set up exit triggers
      EXIT_BUTTON.addEventListener("click", () => {
        messagePort.postMessage(range);
      });
      CONFIRM_BUTTON.addEventListener("click", confirm);
      window.addEventListener("keydown", (event) => {
        if (event.code === "Enter") confirm();
      });
    };
  }
});
