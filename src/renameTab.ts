window.addEventListener("message", (event) => {
  const NAME_INPUT = document.getElementById("name") as HTMLInputElement;
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
      let oldName: string = event.data;

      // Update values
      NAME_INPUT.value = oldName;
      NAME_INPUT.select();

      // Close function
      function confirm() {
        messagePort.postMessage(NAME_INPUT.value);
      }

      // Set up exit triggers
      EXIT_BUTTON.addEventListener("click", () => {
        messagePort.postMessage(oldName);
      });
      CONFIRM_BUTTON.addEventListener("click", confirm);
      window.addEventListener("keydown", (event) => {
        if (event.code === "Enter") confirm();
      });
    };
  }
});
