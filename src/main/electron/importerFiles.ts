// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import fs from "fs";
import path from "path";

/**
 * Extra files for `.log` (candump) imports, in the order the candump worker expects:
 * [<stem>.json sidecar, <stem>.markers.csv sidecar, DBC pack]. Missing files are null.
 *
 * The DBC pack is UTF-8 JSON `{ "<path relative to the folder>": "<dbc text>" }` built from every
 * `.dbc` under `dbcFolder` (recursively). It is null when no folder is set, so the worker falls
 * back to its bundled DBCs. Road Runner `.log` files get the same extras, which they ignore.
 */
export function readCandumpExtras(logPath: string, dbcFolder: string): (Buffer | null)[] {
  const stem = logPath.slice(0, -path.extname(logPath).length);
  const readOptional = (filePath: string): Buffer | null => {
    try {
      return fs.readFileSync(filePath);
    } catch {
      return null;
    }
  };
  return [readOptional(stem + ".json"), readOptional(stem + ".markers.csv"), readDBCPack(dbcFolder)];
}

function readDBCPack(dbcFolder: string): Buffer | null {
  if (dbcFolder.length === 0 || !fs.existsSync(dbcFolder)) return null;
  const files: { [path: string]: string } = {};
  const walk = (folder: string, depth: number) => {
    if (depth > 4) return;
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(folder, { withFileTypes: true });
    } catch {
      return;
    }
    entries.forEach((entry) => {
      const fullPath = path.join(folder, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        walk(fullPath, depth + 1);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".dbc")) {
        try {
          files[path.relative(dbcFolder, fullPath).replaceAll(path.sep, "/")] = fs.readFileSync(fullPath, "utf-8");
        } catch {}
      }
    });
  };
  walk(dbcFolder, 0);
  if (Object.keys(files).length === 0) return null;
  return Buffer.from(JSON.stringify(files), "utf-8");
}
