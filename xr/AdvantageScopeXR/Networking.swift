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
            self.startConnection() // Starscream bug prevents reusing WebSocket
        }
    }
    
    func didReceive(event: WebSocketEvent, client: any WebSocketClient) {
        switch event {
            case .connected:
                connected()
            case .disconnected:
                disconnected()
            case .text(_):
                break
            case .binary(let data):
                webOverlay.setReceivedCommand(data)
                break
            case .ping(_):
                break
            case .pong(_):
                break
            case .viabilityChanged(_):
                break
            case .reconnectSuggested(_):
                break
            case .cancelled:
                disconnected()
            case .error:
                disconnected()
            case .peerClosed:
                disconnected()
            }
    }
}
