import { cleanFloat } from "../lib/util";

const MIN_INPUT = document.getElementById("min") as HTMLInputElement;
const MAX_INPUT = document.getElementById("max") as HTMLInputElement;
const EXIT_BUTTON = document.getElementById("exit") as HTMLInputElement;
const CONFIRM_BUTTON = document.getElementById("confirm") as HTMLInputElement;

window.addEventListener("message", (event) => {
  if (event.source == window && event.data == "port") {
    let messagePort = event.ports[0];
    messagePort.onmessage = (event) => {
      let range: [number, number] = event.data;

      function confirm() {
        let min = Number(MIN_INPUT.value);
        let max = Number(MAX_INPUT.value);
        if (min >= max) {
          alert("Maximum must be greater than minimum.");
        } else {
          messagePort.postMessage([min, max]);
        }
      }

      MIN_INPUT.value = cleanFloat(range[0]).toString();
      MAX_INPUT.value = cleanFloat(range[1]).toString();
      EXIT_BUTTON.addEventListener("click", () => {
        messagePort.postMessage(range);
      });
      CONFIRM_BUTTON.addEventListener("click", confirm);
      window.addEventListener("keydown", (event) => {
        if (event.code == "Enter") confirm();
      });
    };
  }
});
