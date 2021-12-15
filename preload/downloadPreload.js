const { ipcRenderer } = require("electron")
const { Client } = require("ssh2")

const username = "lvuser"
const password = ""

const connectTimeoutMs = 3000 // How long to wait when connecting
const retryDelayMs = 1000 // How long to wait between connection attempts
const refreshIntervalMs = 5000 // How often to refresh file list when connected

var prefs = null
var sshClient = new Client()
var retryTimeout = null
var refreshInterval = null

ipcRenderer.on("set-preferences", (_, newPrefs) => {
  prefs = newPrefs
  window.dispatchEvent(new CustomEvent("set-preferences", {
    detail: prefs
  }))
  connect()
})

function connect() {
  clearTimeout(retryTimeout)
  clearInterval(refreshInterval)
  sshClient.connect({
    host: prefs.address,
    port: 22,
    readyTimeout: connectTimeoutMs,
    username: username,
    password: password
  })
}

function sendError(errorMessage) {
  console.error(errorMessage)
  window.dispatchEvent(new CustomEvent("status-error", {
    detail: errorMessage
  }))
  clearInterval(refreshInterval)
  retryTimeout = setTimeout(connect, retryDelayMs)
}

sshClient.on("ready", () => {
  sshClient.sftp((error, sftp) => {
    if (error) {
      sendError(error.message)
    } else {
      var readFiles = () => sftp.readdir(prefs.rioPath, (error, list) => {
        if (error) {
          sendError(error.message)
        } else {
          var files = list
            .map(x => x.filename)
            .filter(x => x.endsWith(".rlog"))
            .sort()
          window.dispatchEvent(new CustomEvent("status-list", {
            detail: files
          }))
        }
      })

      refreshInterval = setInterval(readFiles, refreshIntervalMs)
      readFiles()
    }
  })
})

sshClient.on("error", error => {
  sendError(error.message)
})

window.addEventListener("DOMContentLoaded", () => {
  window.dispatchEvent(new CustomEvent("set-platform", {
    detail: process.platform
  }))
})
