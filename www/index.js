var log = null

window.addEventListener("open-file", function (event) {
  console.log("Opening file '" + event.detail.path + "'")
  log = new Log()
  var startTime = new Date().getTime()
  decodeBytes(log, event.detail.data)
  var length = new Date().getTime() - startTime
  console.log("Log decoded in " + length.toString() + "ms")
  alert("Log decoded in " + length.toString() + "ms")
})