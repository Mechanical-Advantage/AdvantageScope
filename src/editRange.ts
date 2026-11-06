// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { cleanFloat } from "./shared/util";

const MIN_INPUT = document.getElementById("min") as HTMLInputElement;
const MAX_INPUT = document.getElementById("max") as HTMLInputElement;
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
      const limits = event.data.limits === true;
      let range: [number | null, number | null] = limits ? event.data.range : event.data;
      if (limits) document.title = "Edit Limits";

      // Update values
      MIN_INPUT.value = range[0] === null ? "" : cleanFloat(range[0]).toString();
      MAX_INPUT.value = range[1] === null ? "" : cleanFloat(range[1]).toString();
      MAX_INPUT.select();

      // Close function
      function confirm() {
        let min = limits && MIN_INPUT.value === "" ? null : Number(MIN_INPUT.value);
        let max = limits && MAX_INPUT.value === "" ? null : Number(MAX_INPUT.value);
        if (min !== null && max !== null && min >= max) {
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
