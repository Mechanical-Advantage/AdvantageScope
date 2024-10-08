import { spawn } from "child_process";
import { compareVersions } from "compare-versions";
import { app } from "electron";
import fs from "fs";
import path from "path";
import { createUUID } from "../shared/util";
import { OWLET_STORAGE } from "./owletDownloadLoop";

/**
 * Converts a Hoot log to WPILOG
 *
 * @param hootPath The path to the Hoot file to convert
 * @returns The path to the converted WPILOG file
 */
export async function convertHoot(hootPath: string): Promise<string> {
  let owletPath = await getOwletPath(hootPath);
  let wpilogPath = app.getPath("temp") + "\\hoot_" + createUUID() + ".wpilog";
  let owlet = spawn(owletPath, [hootPath, wpilogPath, "-f", "wpilog"]);
  return new Promise((resolve, reject) => {
    owlet.once("exit", () => {
      if (owlet.exitCode !== 0) {
        reject("Failed to decode Hoot log file.");
      }
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

  // Get latest owlet version
  let owletFilenames = await new Promise<string[]>((resolve) =>
    fs.readdir(OWLET_STORAGE, (_, files) => resolve(files))
  );
  owletFilenames = owletFilenames.filter((filename) => filename.startsWith("owlet-"));
  if (owletFilenames.length === 0) {
    throw new Error("The Hoot log file cannot be decoded because owlet is not available.");
  }
  owletFilenames = owletFilenames.sort((a, b) => -compareVersions(a.split("-")[1], b.split("-")[1]));
  let latestOwletPath = path.join(OWLET_STORAGE, owletFilenames[0]);

  // Get log file compliancy
  let owlet = spawn(latestOwletPath, [hootPath, "--compliancy"]);
  let compliancy = await new Promise<number>((resolve, reject) => {
    let stdout = "";
    owlet.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    owlet.once("exit", () => {
      if (owlet.exitCode !== 0) {
        reject("The Hoot log file cannot be decoded because compliancy cannot be retrieved.");
      }
      let compliancyLine = stdout.split("\n").find((line) => line.includes("hoot log: "));
      if (compliancyLine === undefined) {
        throw new Error();
      }
      resolve(Number(compliancyLine.slice("hoot log: ".length)));
    });
  });

  // Exit if too old
  if (compliancy < 6) {
    throw new Error("The Hoot log file is too old to be decoded. Hoot logs must be produced by Phoenix 2024 or later.");
  }

  // Find owlet version for compliancy
  let finalOwletFilename = owletFilenames.find((filename) => filename.includes("-C" + compliancy.toString()));
  if (finalOwletFilename === undefined) {
    throw new Error(
      "The Hoot log cannot be decoded because of incompatible compliancy. Check the owlet download status in the menu bar for more information."
    );
  }
  return path.join(OWLET_STORAGE, finalOwletFilename);
}
