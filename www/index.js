window.addEventListener("open-file", function (event) {
  alert(event.detail.path)
})