import licenses from "./licenses.json";

window.addEventListener("load", () => {
  document.body.innerHTML = "";
  (licenses as { module: string; text: string }[]).forEach((license) => {
    let moduleElement = document.createElement("div");
    moduleElement.classList.add("module-text");
    moduleElement.innerText = license.module;
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
