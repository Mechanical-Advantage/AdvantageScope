var log = null

window.addEventListener("open-file", function (event) {
  console.log("Opening file '" + event.detail.path + "'")
  log = new Log()
  decodeBytes(log, event.detail.data)
  console.log("Log decoded")
})