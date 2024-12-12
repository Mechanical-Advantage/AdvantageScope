import Starscream
import SwiftUI
import Combine

class Networking : WebSocketDelegate {
    private var appState: AppState! = nil
    private var webOverlay: WebOverlay! = nil
    private var addressSubscriber: Cancellable?
    
    private var socket: WebSocket?
    private var reconnecting = false
    
    func start(_ appState: AppState, _ webOverlay: WebOverlay) {
        self.appState = appState
        self.webOverlay = webOverlay
        addressSubscriber = appState.$serverAddress.sink() {address in
            // Force disconnect and reconnect to new address
            // Always runs once at startup for initial connection
            self.disconnected()
        }
    }
    
    private func startConnection() {
        if (appState.serverAddress.isEmpty) {
            disconnected()
            return
        }
        var request = URLRequest(url: URL(string: "ws://" + appState.serverAddress + ":56328/ws")!)
        request.timeoutInterval = 2
        socket = WebSocket(request: request)
        socket?.delegate = self
        socket?.connect()
    }
    
    private func connected() {
        if (!appState.serverConnected) {
            appState.serverConnected = true
            webOverlay.load(appState.serverAddress)
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
            case .text(let string):
                print("Received text: \(string)")
            case .binary(let data):
                print("Received data: \(data.count)")
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
