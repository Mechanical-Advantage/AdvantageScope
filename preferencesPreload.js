const { ipcRenderer } = require("electron")

ipcRenderer.on("start", (_, data) => {
  function confirm() {
    ipcRenderer.send("exit-preferences", {
      address: document.getElementById("address").value,
      port: Number(document.getElementById("port").value),
      rioPath: document.getElementById("rioPath").value
    })
  }

  document.getElementById("address").value = data.address
  document.getElementById("port").value = data.port
  document.getElementById("rioPath").value = data.rioPath
  document.getElementById("exit").addEventListener("click", () => {
    ipcRenderer.send("exit-preferences", null)
  })
  document.getElementById("confirm").addEventListener("click", confirm)
  window.addEventListener("keydown", (event) => {
    if (event.code == "Enter") confirm()
  })
})