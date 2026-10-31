// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export function validateLiveAddress(source: string, address: string): string | null {
  if (/\s/.test(address)) return "Address cannot contain spaces.";
  if (source === "mur") {
    try {
      const url = new URL(/^[a-z]+:\/\//i.test(address) ? address : "http://" + address);
      if (
        !["http:", "https:", "ws:", "wss:"].includes(url.protocol) ||
        !url.hostname ||
        url.username ||
        url.password ||
        url.search ||
        url.hash
      )
        return "Enter an HTTP or WebSocket server address.";
      return null;
    } catch {
      return "Enter a valid server address, for example http://localhost:8090.";
    }
  }
  const port = address.match(/:(\d+)$/)?.[1];
  if (port !== undefined && (Number(port) < 1 || Number(port) > 65535)) return "Port must be between 1 and 65535.";
  return /^(\[[a-fA-F0-9:]+\]|[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*)(?::[0-9]{1,5})?$/.test(address)
    ? null
    : "Enter a hostname or IP address (optionally with a port).";
}
