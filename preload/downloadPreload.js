const { ipcRenderer } = require("electron");
const { Client } = require("ssh2");
const fs = require("fs");

const username = "lvuser";
const password = "";

const connectTimeoutMs = 3000; // How long to wait when connecting
const retryDelayMs = 1000; // How long to wait between connection attempts
const refreshIntervalMs = 5000; // How often to refresh file list when connected

var prefs = null;
var sshClient = new Client();
var retryTimeout = null;
var refreshInterval = null;

// Communication between renderer and main process
ipcRenderer.on("set-preferences", (_, newPrefs) => {
  prefs = newPrefs;
  window.dispatchEvent(
    new CustomEvent("set-preferences", {
      detail: prefs
    })
  );
  connect();
});

window.addEventListener("exit-download", () => {
  ipcRenderer.send("exit-download");
});

window.addEventListener("prompt-download-save", (event) => {
  ipcRenderer.send("prompt-download-save", event.detail);
});

// Manage SSH connection
function connect() {
  clearTimeout(retryTimeout);
  clearInterval(refreshInterval);
  sshClient.connect({
    host: prefs.address,
    port: 22,
    readyTimeout: connectTimeoutMs,
    username: username,
    password: password
  });
}

function sendError(errorMessage) {
  console.error(errorMessage);
  window.dispatchEvent(
    new CustomEvent("status-error", {
      detail: errorMessage
    })
  );
  clearInterval(refreshInterval);
  retryTimeout = setTimeout(connect, retryDelayMs);
}

sshClient.on("ready", () => {
  sshClient.sftp((error, sftp) => {
    if (error) {
      sendError(error.message);
    } else {
      var readFiles = () =>
        sftp.readdir(prefs.rioPath, (error, list) => {
          if (error) {
            sendError(error.message);
          } else {
            var files = list
              .map((x) => x.filename)
              .filter((x) => x.endsWith(".rlog"))
              .sort();
            window.dispatchEvent(
              new CustomEvent("status-list", {
                detail: files
              })
            );
          }
        });

      refreshInterval = setInterval(readFiles, refreshIntervalMs);
      readFiles();
    }
  });
});

sshClient.on("error", (error) => {
  sendError(error.message);
});

window.addEventListener("DOMContentLoaded", () => {
  window.dispatchEvent(
    new CustomEvent("set-platform", {
      detail: process.platform
    })
  );
});

// Save files
ipcRenderer.on("download-save", (_, files, savePath) => {
  var fullRioPath = prefs.rioPath.endsWith("/") ? prefs.rioPath : prefs.rioPath + "/";

  sshClient.sftp((error, sftp) => {
    if (error) {
      sendError(error.message);
    } else {
      window.dispatchEvent(new CustomEvent("status-progress", { detail: null }));
      if (files.length == 1) {
        // Single file
        sftp.fastGet(fullRioPath + files[0], savePath, (error) => {
          if (error) {
            sendError(error.message);
          } else {
            window.dispatchEvent(new CustomEvent("status-progress", { detail: 1.0 }));
            ipcRenderer.send("prompt-download-auto-open", savePath);
          }
        });
      } else {
        // Multiple files
        var completeCount = 0;
        var skipCount = 0;
        files.forEach((file) => {
          fs.stat(savePath + "/" + file, (statErr) => {
            if (statErr == null) {
              // File exists already, skip downloading
              completeCount++;
              skipCount++;
              if (skipCount == files.length) {
                // All files skipped
                window.dispatchEvent(new CustomEvent("status-alert", { detail: "No new logs found." }));
              }
            } else {
              // File not found, download
              sftp.fastGet(fullRioPath + file, savePath + "/" + file, (error) => {
                if (error) {
                  sendError(error.message);
                } else {
                  completeCount++;
                  var progress = (completeCount - skipCount) / (files.length - skipCount);
                  window.dispatchEvent(new CustomEvent("status-progress", { detail: progress }));
                  console.log(progress);

                  if (completeCount >= files.length) {
                    if (skipCount > 0) {
                      var newCount = completeCount - skipCount;
                      var message =
                        "Saved " +
                        newCount.toString() +
                        " new log" +
                        (newCount == 1 ? "" : "s") +
                        " (" +
                        skipCount.toString() +
                        " skipped) to <u>" +
                        savePath +
                        "</u>";
                    } else {
                      var message =
                        "Saved " +
                        completeCount.toString() +
                        " log" +
                        (completeCount == 1 ? "" : "s") +
                        " to <u>" +
                        savePath +
                        "</u>";
                    }
                    window.dispatchEvent(new CustomEvent("status-alert", { detail: message }));
                  }
                }
              });
            }
          });
        });
      }
    }
  });
});
