// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import Starscream
import SwiftUI
import Combine

enum NativeHostIncompatibility {
    case none
    case serverTooOld
    case serverTooNew
}

class Networking : WebSocketDelegate {
    private var appState: AppState! = nil
    private var webOverlay: WebOverlay! = nil
    private var addressSubscriber: Cancellable?
    
    private var socket: WebSocket?
    private var reconnecting = false
    private var currentServerAddress: String?
    private var attemptCount = 0
    
    private let maxQueuedCommands = 500
    private var queuedCommands: [Data] = []
    
    func start(_ appState: AppState, _ webOverlay: WebOverlay) {
        self.appState = appState
        self.webOverlay = webOverlay
        addressSubscriber = appState.$serverAddresses.sink() {address in
            // Force disconnect and reconnect to new address
            // Always runs once at startup for initial connection
            self.disconnected()
        }
    }
    
    private func startConnection() {
        if (appState.serverAddresses.isEmpty) {
            disconnected()
            return
        }
        attemptCount += 1
        currentServerAddress = appState.serverAddresses[attemptCount % appState.serverAddresses.count]
        var request = URLRequest(url: URL(string: "ws://" + currentServerAddress! + ":" + String(Constants.serverPort) + "/ws")!)
        request.timeoutInterval = 0.5
        socket = WebSocket(request: request)
        socket?.delegate = self
        socket?.connect()
    }
    
    private func connected() {
        if (!appState.serverConnected) {
            appState.serverConnected = true
            webOverlay.load(currentServerAddress!)
            queuedCommands = []
        }
    }
    
    private func disconnected() {
        if (appState.serverConnected) {
            appState.serverConnected = false
        }
        if (reconnecting) {
            return
        }
        reconnecting = true
        self.socket?.forceDisconnect()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.reconnecting = false
            self.startConnection()
        }
    }
    
    func didReceive(event: WebSocketEvent, client: any WebSocketClient) {
        switch event {
        case .binary(let data):
            if (webOverlay.isWebViewReady()) {
                for command in queuedCommands {
                    webOverlay.setReceivedCommand(command, isQueued: true)
                }
                queuedCommands.removeAll()
                webOverlay.setReceivedCommand(data, isQueued: false)
            } else if (queuedCommands.count < maxQueuedCommands) {
                queuedCommands.append(data)
            }
        case .connected:
            connected()
        case .disconnected, .cancelled, .error, .peerClosed:
            disconnected()
        case .text(_), .ping(_), .pong(_), .viabilityChanged(_), .reconnectSuggested(_):
            break
        }
    }
}
