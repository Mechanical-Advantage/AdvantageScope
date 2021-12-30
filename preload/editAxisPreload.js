const { ipcRenderer } = require("electron")

ipcRenderer.on("start", (_, data) => {
  function confirm() {
    var min = Number(document.getElementById("min").value)
    var max = Number(document.getElementById("max").value)
    if (min >= max) {
      alert("Maximum must be greater than minimum.")
    } else {
      ipcRenderer.send("edit-axis-complete", data.timestamp, [min, max])
    }
  }

  document.getElementById("min").value = Math.round(data.range[0] * 100000) / 100000
  document.getElementById("max").value = Math.round(data.range[1] * 100000) / 100000
  document.getElementById("exit").addEventListener("click", () => {
    ipcRenderer.send("edit-axis-complete", data.timestamp, null)
  })
  document.getElementById("confirm").addEventListener("click", confirm)
  window.addEventListener("keydown", (event) => {
    if (event.code == "Enter") confirm()
  })
})