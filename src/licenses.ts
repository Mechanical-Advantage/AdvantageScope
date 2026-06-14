// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import licenses from "./licenses.json";
import { Distribution, DISTRIBUTION } from "./shared/buildConstants";

window.addEventListener("load", () => {
  document.body.innerHTML = "";
  (licenses as { module: string; text: string }[]).forEach((license) => {
    let moduleElement = document.createElement("div");
    moduleElement.classList.add("module-text");
    let moduleText = license.module;
    if (DISTRIBUTION === Distribution.Lite && moduleText === "AdvantageScope") {
      moduleText = "AdvantageScope Lite";
    }
    moduleElement.innerText = moduleText;
    document.body.appendChild(moduleElement);

    let textElement = document.createElement("div");
    textElement.classList.add("license-text");
    let cleanText = license.text
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\t", "")
      .replaceAll("\r\n", "\n")
      .replaceAll("\n\n", "<br><br>")
      .replaceAll("\n&gt;", "<br>&gt;")
      .replaceAll("\n-", "<br>-")
      .replaceAll("\n", " ");
    while (cleanText.includes("  ")) {
      cleanText = cleanText.replaceAll("  ", " ");
    }
    if (cleanText.startsWith(" ")) {
      cleanText = cleanText.slice(1);
    }
    cleanText = cleanText.replaceAll("<br> ", "<br>");
    textElement.innerHTML = cleanText;
    document.body.appendChild(textElement);
  });
});
