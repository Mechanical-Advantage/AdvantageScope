const CHECKBOXES = Array.from(document.getElementsByTagName("input")) as HTMLInputElement[];
const CONTINUE_BUTTON = document.getElementsByTagName("button")[0] as HTMLButtonElement;

function updateDisable() {
  let enabled = CHECKBOXES.every((checkbox) => checkbox.checked);
  CONTINUE_BUTTON.disabled = !enabled;
}

window.addEventListener("message", (event) => {
  if (event.source === window && event.data === "port") {
    let messagePort = event.ports[0];

    CHECKBOXES.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        updateDisable();
      });
    });

    CONTINUE_BUTTON.addEventListener("click", () => {
      messagePort.postMessage(null);
    });
  }
});
