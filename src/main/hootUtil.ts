import { spawn } from "child_process";
import { app } from "electron";
import fs from "fs";
import path from "path";
import { createUUID } from "../shared/util";

const OWLET_CACHE_PATH = path.join(app.getPath("userData"), "owlet.exe");
const TUNER_OWLET_PATH = "C:\\Program Files\\WindowsApps\\${TUNERXNAME}\\windows_assets\\owlet.exe";

/**
 * Converts a Hoot log to WPILOG
 *
 * @param hootPath The path to the Hoot file to convert
 * @returns The path to the converted WPILOG file
 */
export async function convertHoot(hootPath: string): Promise<string> {
  // Check for owlet and copy if necessary
  // Normally copied at startup, unless Tuner X was installed after AdvantageScope
  if (!fs.existsSync(OWLET_CACHE_PATH)) {
    try {
      await copyOwlet();
    } catch {
      throw "Failed to decode Hoot log. Check that Phoenix Tuner X is installed, then try again.";
    }
  }

  // Run owlet
  let wpilogPath = app.getPath("temp") + "\\hoot_" + createUUID() + ".wpilog";
  let owlet = spawn(OWLET_CACHE_PATH, [hootPath, wpilogPath, "-f", "wpilog"]);
  return new Promise((resolve, reject) => {
    owlet.once("exit", () => {
      if (owlet.exitCode !== 0) {
        reject(
          "The Hoot log file may be incompatible with the installed version of Phoenix Tuner X. Update Phoenix Tuner X to the latest version, then restart AdvantageScope and try again."
        );
      }
      resolve(wpilogPath);
    });
  });
}

/**
 * Copy owlet from Phoenix Tuner X to the AdvantageScope cache
 */
export function copyOwlet(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (process.platform !== "win32") {
      reject();
      return;
    }

    let powershell = spawn("powershell.exe", ["Get-AppxPackage | Select-Object PackageFullName"]);
    let powershellOutput = "";
    powershell.stdout.on("data", (chunk: string) => (powershellOutput += chunk));
    powershell.stderr.on("data", (chunk: string) => (powershellOutput += chunk));
    powershell.once("exit", () => {
      if (powershell.exitCode !== 0) {
        reject();
        return;
      }

      let tunerXNames = powershellOutput
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("CTRElectronics"));
      if (tunerXNames.length < 1) {
        reject();
        return;
      }

      const tunerOwletPath = TUNER_OWLET_PATH.replace("${TUNERXNAME}", tunerXNames[0]);
      if (!fs.existsSync(tunerOwletPath)) {
        reject();
        return;
      }

      fs.copyFile(tunerOwletPath, OWLET_CACHE_PATH, (error) => {
        if (error !== null) {
          reject();
        } else {
          resolve();
        }
      });
    });
  });
}
