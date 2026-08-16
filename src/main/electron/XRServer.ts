// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Encoder } from "@msgpack/msgpack";
import { app } from "electron";
import fs from "fs";
import http from "http";
import jsonfile from "jsonfile";
import * as https from "node:https";
import { networkInterfaces } from "os";
import path from "path";
import selfsigned from "selfsigned";
import { WebSocketServer } from "ws";
import { AdvantageScopeAssets } from "../../shared/AdvantageScopeAssets";
import { Field3dRendererCommand } from "../../shared/renderers/Field3dRenderer";
import { XRPacket, XRSettings } from "../../shared/XRTypes";
import {
  HTTPS_CERT_FILENAME,
  HTTPS_XR_SERVER_PORT,
  XR_APPCLIP_DOMAIN,
  XR_SERVER_PORT,
  XR_URL_ARGS
} from "./ElectronConstants";

export namespace XRServer {
  let httpServer: http.Server | null = null;
  let wsServer: WebSocketServer | null = null;
  let httpsServer: https.Server | null = null;
  let wssServer: WebSocketServer | null = null;
  let xrSettings: XRSettings | null = null;
  let periodicInterval: NodeJS.Timeout | null = null;
  export let ipAddresses: Set<string> = new Set();
  export let selectedIp: string = "";
  const msgpackEncoder = new Encoder();
  export let assetsSupplier: () => AdvantageScopeAssets;

  export function getQRText(): string {
    if (selectedIp == "legacy-ios") {
      return XR_APPCLIP_DOMAIN + XR_URL_ARGS + Array.from(ipAddresses).join("_");
    }
    return "http://" + selectedIp + ":" + XR_SERVER_PORT + XR_URL_ARGS + selectedIp;
  }

  export async function start() {
    const interfaces = networkInterfaces();
    ipAddresses = new Set();
    Object.values(interfaces).forEach((addressSet) => {
      if (addressSet === undefined) return;
      addressSet.forEach((addressData) => {
        if (!addressData.internal && addressData.family === "IPv4") {
          ipAddresses.add(addressData.address);
        }
      });
    });
    // SystemCore
    let guessedIp = ipAddresses.values().find((s) => s.startsWith("172.30."));
    // Most common LAN
    if (!guessedIp) {
      guessedIp = ipAddresses.values().find((s) => s.startsWith("192.168."));
    }
    // Less common LAN
    if (!guessedIp) {
      guessedIp = ipAddresses.values().find((s) => s.startsWith("10."));
    }
    // Just pick something
    if (!guessedIp && ipAddresses.size > 0) {
      guessedIp = ipAddresses.values().toArray()[0];
    }
    selectedIp = guessedIp!!;

    // Create HTTP server
    const requestListener: http.RequestListener = async (request, response) => {
      if (request.url !== undefined) {
        let url: URL;
        try {
          url = new URL("http://localhost" + request.url);
        } catch {
          response.writeHead(400, { "Content-Type": "text/html" });
          response.end("Bad request");
          return;
        }

        // If in dev mode, host the raw TS source so that sourcemaps can be used from other devices (like VR headsets)
        if ((!app.isPackaged && url.pathname.startsWith("/src")) || url.pathname.startsWith("/node_modules")) {
          // Try to sanitize/prevent obvious path escapes using path.normalize here
          let filePath = path.join(__dirname, "../" + path.normalize(url.pathname));
          if (fs.existsSync(filePath)) {
            response.writeHead(200, { "Content-Type": "text" });
            response.end(fs.readFileSync(filePath));
          } else {
            response.writeHead(404);
            response.end("File not found");
          }
        }
        switch (url.pathname) {
          case "/":
            response.writeHead(200, { "Content-Type": "text/html" });
            response.end(fs.readFileSync(path.join(__dirname, "../www/xrClient.html"), { encoding: "utf-8" }));
            return;
          case "/xrClient.css":
            response.writeHead(200, { "Content-Type": "text/css" });
            response.end(fs.readFileSync(path.join(__dirname, "../www/xrClient.css"), { encoding: "utf-8" }));
            return;
          case "/global.css":
            response.writeHead(200, { "Content-Type": "text/css" });
            response.end(fs.readFileSync(path.join(__dirname, "../www/global.css"), { encoding: "utf-8" }));
            return;
          case "/xrClient.js":
            response.writeHead(200, { "Content-Type": "text/javascript" });
            response.end(fs.readFileSync(path.join(__dirname, "../bundles/xrClient.js"), { encoding: "utf-8" }));
            return;
          case "/img/xr-logo.png":
            response.writeHead(200, { "Content-Type": "image/png" });
            response.end(fs.readFileSync(path.join(__dirname, "../www/img/xr-logo.png")));
            return;
          case "/symbols/android-icon.svg":
            response.writeHead(200, { "Content-Type": "image/svg+xml" });
            response.end(
              fs.readFileSync(path.join(__dirname, "../www/symbols/android-icon.svg"), { encoding: "utf-8" })
            );
            return;
          case "/symbols/ios-icon.svg":
            response.writeHead(200, { "Content-Type": "image/svg+xml" });
            response.end(fs.readFileSync(path.join(__dirname, "../www/symbols/ios-icon.svg"), { encoding: "utf-8" }));
            return;
          case "/symbols/vr-icon.svg":
            response.writeHead(200, { "Content-Type": "image/svg+xml" });
            response.end(fs.readFileSync(path.join(__dirname, "../www/symbols/vr-icon.svg"), { encoding: "utf-8" }));
            return;
          case "/symbols/play.fill.svg":
            response.writeHead(200, { "Content-Type": "image/svg+xml" });
            response.end(fs.readFileSync(path.join(__dirname, "../www/symbols/play.fill.svg"), { encoding: "utf-8" }));
            return;
          case "/xrClient.js.map":
            response.writeHead(200, { "Content-Type": "text/javascript" });
            response.end(fs.readFileSync(path.join(__dirname, "../bundles/xrClient.js.map"), { encoding: "utf-8" }));
            return;
          case "/apriltag":
            let family = url.searchParams.get("family");
            let name = url.searchParams.get("name");
            if (family === null || name === null || family.includes("..") || name.includes("..")) {
              response.writeHead(400);
              response.end("Family or name not provided or invalid");
              return;
            }

            const imgPath = path.join(__dirname, "../www/textures/apriltag-" + family + "/" + name + ".png");
            try {
              let imgData = fs.readFileSync(imgPath);
              response.writeHead(200, { "Content-Type": "image/png" });
              response.end(imgData);
            } catch {
              response.writeHead(404);
              response.end("Texture not found");
              return;
            }
            return;
          case "/asset":
            let assetPath = url.searchParams.get("path");
            if (assetPath === null) {
              response.writeHead(400);
              response.end("Asset path not provided");
              return;
            }

            // Clean requested path
            if (!assetPath!.endsWith(".glb")) {
              response.writeHead(400);
              response.end("Asset path is invalid");
              return;
            }
            let assetPathSimplified = assetPath!.substring(0, assetPath!.length - ".glb".length);
            while (
              assetPathSimplified.length > 0 &&
              !isNaN(Number(assetPathSimplified[assetPathSimplified.length - 1]))
            ) {
              assetPathSimplified = assetPathSimplified.substring(0, assetPathSimplified.length - 1);
            }
            if (assetPathSimplified.endsWith("_")) {
              assetPathSimplified = assetPathSimplified.substring(0, assetPathSimplified.length - 1);
            }

            // Check if path is for a valid 3D asset
            // (Prevent requests for other files)
            let allAssets = assetsSupplier();
            let isValid = false;
            [...allAssets.field3ds, ...allAssets.robots].forEach((fieldConfig) => {
              let referencePathNoExtension = fieldConfig.path.substring(0, fieldConfig.path!.length - ".glb".length);
              if (assetPathSimplified === referencePathNoExtension) {
                isValid = true;
              }
            });
            if (!isValid) {
              response.writeHead(400);
              response.end("Asset path is invalid");
              return;
            }

            // Read file
            response.writeHead(200, { "Content-Type": "application/octet-stream" });
            response.end(fs.readFileSync(decodeURIComponent(assetPath)));
            return;
        }
      }

      response.writeHead(404);
      response.end("Not found");
    };

    httpServer = http.createServer(requestListener).listen(XR_SERVER_PORT);

    // The IPs in this certificate don't matter since you have to bypass the red warning to use self-signed regardless
    // Generate on first launch and store on each device
    // This could be replaced with one hardcoded one for all installs, but that might lead to revocation issues?
    if (!fs.existsSync(HTTPS_CERT_FILENAME)) {
      const pems = await selfsigned.generate([{ name: "commonName", value: "localhost" }], {
        extensions: [
          {
            name: "subjectAltName",
            altNames: [{ type: 7, value: "127.0.0.1" }]
          }
        ],
        // default expiry is a year; extend to 2037 so we never have to worry about it
        // (without triggering any potential 2038 bugs)
        notAfterDate: new Date("2037-01-01")
      });
      const options: https.ServerOptions = {
        key: pems.private,
        cert: pems.cert
      };
      jsonfile.writeFileSync(HTTPS_CERT_FILENAME, options);
    }
    const options: https.ServerOptions = jsonfile.readFileSync(HTTPS_CERT_FILENAME);

    httpsServer = https.createServer(options, requestListener).listen(HTTPS_XR_SERVER_PORT);

    // Create WebSocket server
    wsServer = new WebSocketServer({ server: httpServer, path: "/ws", backlog: 2, perMessageDeflate: true });
    wssServer = new WebSocketServer({ server: httpsServer, path: "/ws", backlog: 2, perMessageDeflate: true });
    periodicInterval = setInterval(() => {
      // Send current settings
      if (xrSettings !== null) {
        let packet: XRPacket = {
          type: "settings",
          time: new Date().getTime(),
          value: xrSettings
        };
        sendMessage(msgpackEncoder.encode(packet));
      }

      // Send assets
      let packet: XRPacket = {
        type: "assets",
        time: new Date().getTime(),
        value: assetsSupplier()
      };
      sendMessage(msgpackEncoder.encode(packet));
      lastHubCommand = null;
    }, 500);
  }

  export function stop() {
    httpServer?.close();
    wsServer?.close();
    httpsServer?.close();
    wssServer?.close();
    xrSettings = null;
    if (periodicInterval !== null) {
      clearInterval(periodicInterval);
      periodicInterval = null;
    }
  }

  export function setXRSettings(settings: XRSettings) {
    xrSettings = settings;
    selectedIp = settings.selectedIp;

    // Broadcast to all clients
    let packet: XRPacket = {
      type: "settings",
      time: new Date().getTime(),
      value: settings
    };
    sendMessage(msgpackEncoder.encode(packet));
  }
  let lastHubCommand: Field3dRendererCommand | null = null;
  // Ran every frame
  export function setHubCommand(command: Field3dRendererCommand) {
    if (lastHubCommand === command) return; // don't spam the same command
    lastHubCommand = command;
    // Broadcast to all clients
    let packet: XRPacket = {
      type: "command",
      time: new Date().getTime(),
      value: command
    };
    sendMessage(msgpackEncoder.encode(packet));
  }

  function sendMessage(message: Uint8Array) {
    wsServer?.clients.forEach((client) => {
      client.send(message);
    });
    wssServer?.clients.forEach((client) => {
      client.send(message);
    });
  }
}
