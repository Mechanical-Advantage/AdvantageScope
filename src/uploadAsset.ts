// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

window.addEventListener("message", (event) => {
  const ASSET_INPUT = document.getElementById("asset") as HTMLInputElement;
  const EXIT_BUTTON = document.getElementById("exit") as HTMLInputElement;
  const CONFIRM_BUTTON = document.getElementById("confirm") as HTMLInputElement;
  const PROGRESS_TEXT = document.getElementById("progress") as HTMLTableCellElement;

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
    }

      ASSET_INPUT.addEventListener("change", event => {
        const files = ASSET_INPUT.files ?? [];
        for (const file of files) {
          uploadFile(file);
        }
      });

      const uploadFile = (file: File) => {
        PROGRESS_TEXT.innerText = "Uploading file...";
        const API_ENDPOINT = "../uploadAsset";
        const request = new XMLHttpRequest();
        const formData = new FormData();

        request.open("POST", API_ENDPOINT, true);
        request.onreadystatechange = () => {
          if (request.readyState === 4) {
            if (request.status === 200) {
              PROGRESS_TEXT.innerText = "Upload succeeded";
            } else {
              PROGRESS_TEXT.innerText = `Upload failed: ${request.statusText}`;
            }
          }
        };
        formData.append("file", file);
        request.send(formData);
      };

      // Close function
      function confirm() {
        messagePort.postMessage(null)
      }

      // Set up exit triggers
      EXIT_BUTTON.addEventListener("click", () => {
        messagePort.postMessage(null)
      });
      CONFIRM_BUTTON.addEventListener("click", confirm);
      window.addEventListener("keydown", (event) => {
        if (event.code === "Enter") confirm();
      });
});
