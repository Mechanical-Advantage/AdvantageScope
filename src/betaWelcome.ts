// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Distribution, DISTRIBUTION } from "./shared/buildConstants";

const CHECKBOXES = Array.from(document.getElementsByTagName("input")) as HTMLInputElement[];
const CONTINUE_BUTTON = document.getElementsByTagName("button")[0] as HTMLButtonElement;

function updateDisable() {
  let enabled = CHECKBOXES.every((checkbox) => checkbox.checked);
  CONTINUE_BUTTON.disabled = !enabled;
}

window.addEventListener("message", (event) => {
  if (event.data === "port") {
    let messagePort = event.ports[0];

    CHECKBOXES.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        updateDisable();
      });
    });

    CONTINUE_BUTTON.addEventListener("click", () => {
      messagePort.postMessage(null);
    });

    messagePort.onmessage = (event) => {
      let isAlpha: boolean = event.data;
      Array.from(document.getElementsByClassName("beta-only")).forEach((element) => {
        (element as HTMLElement).hidden = isAlpha;
      });
      Array.from(document.getElementsByClassName("alpha-only")).forEach((element) => {
        (element as HTMLElement).hidden = !isAlpha;
      });
    };
  }
});

window.addEventListener("load", () => {
  Array.from(document.getElementsByClassName("desktop-only")).forEach((element) => {
    (element as HTMLElement).hidden = DISTRIBUTION === Distribution.Lite;
  });
  Array.from(document.getElementsByClassName("lite-only")).forEach((element) => {
    (element as HTMLElement).hidden = DISTRIBUTION !== Distribution.Lite;
  });
});
