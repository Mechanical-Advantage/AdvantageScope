// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { spawn } from "child_process";
import { app } from "electron";
import fs from "fs";
import path from "path";
import { createUUID } from "../../shared/util";
import { OWLET_STORAGE } from "./owletDownloadLoop";

export const CTRE_LICENSE_URL =
  "https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt";

/**
 * Converts a Hoot log to WPILOG
 *
 * @param hootPath The path to the Hoot file to convert
 * @returns The path to the converted WPILOG file
 */
export async function convertHoot(hootPath: string): Promise<string> {
  let owletPath = await getOwletPath(hootPath);
  let wpilogPath = path.join(app.getPath("temp"), "hoot_" + createUUID() + ".wpilog");
  let owlet = spawn(owletPath, [hootPath, wpilogPath, "-f", "wpilog"]);
  return new Promise((resolve) => {
    owlet.once("exit", () => {
      resolve(wpilogPath);
    });
  });
}

/**
 * Checks if a Hoot log contains non-Pro devices
 *
 * @param hootPath The path to the Hoot file ot check
 * @returns Whether the Hoot log is Pro-licensed
 */
export async function checkHootIsPro(hootPath: string): Promise<boolean> {
  let owletPath = await getOwletPath(hootPath);
  let owlet = spawn(owletPath, [hootPath, "--check-pro"]);
  return new Promise((resolve, reject) => {
    let stdout = "";
    owlet.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    owlet.once("exit", () => {
      if (owlet.exitCode !== 0) {
        reject();
      }
      resolve(!stdout.includes("NOT"));
    });
  });
}

/** Returns the path to an owlet executable capable of opening the Hoot log. */
async function getOwletPath(hootPath: string): Promise<string> {
  // Check that owlet storage exists
  if (!fs.existsSync(OWLET_STORAGE)) {
    throw new Error("The Hoot log file cannot be decoded because owlet is not available.");
  }

  // Get log file compliancy
  let compliancy = await new Promise<number>((resolve, reject) => {
    fs.open(hootPath, "r", (error, file) => {
      if (error) {
        reject("The Hoot log file could not be opened.");
        return;
      }

      let buffer = Buffer.alloc(2);
      fs.read(file, buffer, 0, 2, 70, (error, bytesRead) => {
        if (error || bytesRead !== 2) {
          reject("The Hoot log file cannot be decoded because compliancy cannot be retrieved.");
          return;
        }
        let view = new DataView(buffer.buffer);
        resolve(view.getUint8(0));
      });
    });
  });

  // Exit if too old
  if (compliancy < 6) {
    throw new Error("The Hoot log file is too old to be decoded. Hoot logs must be produced by Phoenix 2024 or later.");
  }

  // Find owlet version for compliancy
  let owletFilenames = await new Promise<string[]>((resolve) =>
    fs.readdir(OWLET_STORAGE, (_, files) => resolve(files))
  );
  owletFilenames = owletFilenames.filter((filename) => filename.startsWith("owlet-"));
  let finalOwletFilename = owletFilenames.find((filename) => filename.includes("-C" + compliancy.toString()));
  if (finalOwletFilename === undefined) {
    throw new Error(
      "The Hoot log cannot be decoded because of incompatible compliancy. Check the owlet download status in the menu bar for more information."
    );
  }
  return path.join(OWLET_STORAGE, finalOwletFilename);
}
