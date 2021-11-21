const { ipcRenderer } = require("electron")

ipcRenderer.on("start", (_, data) => {
  function update() {
    ipcRenderer.send("update-preferences", {
      theme: document.getElementById("theme").value,
      address: document.getElementById("address").value,
      port: Number(document.getElementById("port").value),
      rioPath: document.getElementById("rioPath").value
    })
  }

  // Update values
  if (process.platform == "linux") {
    document.getElementById("theme").children[0].hidden = true
    document.getElementById("theme").children[1].innerText = "Light"
    document.getElementById("theme").children[2].innerText = "Dark"
  }
  document.getElementById("theme").value = data.theme
  document.getElementById("address").value = data.address
  document.getElementById("port").value = data.port
  document.getElementById("rioPath").value = data.rioPath

  // Add change listeners
  document.getElementById("theme").addEventListener("change", update)
  document.getElementById("address").addEventListener("change", update)
  document.getElementById("port").addEventListener("change", update)
  document.getElementById("rioPath").addEventListener("change", update)

  // Set up exit triggers
  document.getElementById("exit").addEventListener("click", () => {
    ipcRenderer.send("exit-preferences", null)
  })
  document.getElementById("confirm").addEventListener("click", () => {
    update()
    ipcRenderer.send("exit-preferences")
  })
  window.addEventListener("keydown", (event) => {
    if (event.code == "Enter") {
      update()
      ipcRenderer.send("exit-preferences")
    }
  })
})