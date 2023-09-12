window.addEventListener("message", (event) => {
  const FOV_INPUT = document.getElementById("fov") as HTMLInputElement;
  const EXIT_BUTTON = document.getElementById("exit") as HTMLInputElement;
  const CONFIRM_BUTTON = document.getElementById("confirm") as HTMLInputElement;

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
      let oldValue: number = event.data;

      // Update values
      FOV_INPUT.value = oldValue.toString();
      FOV_INPUT.select();

      // Close function
      function confirm() {
        let value = Number(FOV_INPUT.value);
        messagePort.postMessage(isNaN(value) ? oldValue : value);
      }

      // Set up exit triggers
      EXIT_BUTTON.addEventListener("click", () => {
        messagePort.postMessage(oldValue);
      });
      CONFIRM_BUTTON.addEventListener("click", confirm);
      window.addEventListener("keydown", (event) => {
        if (event.code === "Enter") confirm();
      });
    };
  }
});
