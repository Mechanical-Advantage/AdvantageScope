import fs from "fs";
import http from "http";
import path from "path";
import { WebSocketServer } from "ws";
import { XR_NATIVE_HOST_COMPATIBILITY, XR_SERVER_PORT } from "./Constants";

export function startXRServer() {
  // Create HTTP server
  let httpServer = http
    .createServer((request, response) => {
      switch (request.url) {
        case "/":
          response.writeHead(200, { "Content-Type": "text/html" });
          response.end(fs.readFileSync(path.join(__dirname, "../www/xrClient.html"), { encoding: "utf-8" }));
          return;
        case "/index.css":
          response.writeHead(200, { "Content-Type": "text/css" });
          response.end(fs.readFileSync(path.join(__dirname, "../www/xrClient.css"), { encoding: "utf-8" }));
          return;
        case "/index.js":
          response.writeHead(200, { "Content-Type": "text/javascript" });
          response.end(fs.readFileSync(path.join(__dirname, "../bundles/xrClient.js"), { encoding: "utf-8" }));
          return;
        case "/loadField.js":
          response.writeHead(200, { "Content-Type": "text/javascript" });
          response.end(
            fs.readFileSync(path.join(__dirname, "../bundles/xrClient$loadField.js"), { encoding: "utf-8" })
          );
          return;
        case "/loadRobot.js":
          response.writeHead(200, { "Content-Type": "text/javascript" });
          response.end(
            fs.readFileSync(path.join(__dirname, "../bundles/xrClient$loadRobot.js"), { encoding: "utf-8" })
          );
          return;
      }

      response.writeHead(404);
      response.end("Not found");
    })
    .listen(XR_SERVER_PORT);

  // Create WebSocket server
  let wsServer = new WebSocketServer({ server: httpServer, path: "/ws" });
  wsServer.on("connection", (socket) => {
    socket.on("message", function message(data) {
      console.log("Received: %s", data);
    });

    socket.send(XR_NATIVE_HOST_COMPATIBILITY.toString());
  });
}
