import SwiftUI
import MetalKit

class AppState : ObservableObject {
    @Published var showControls = true
    @Published var scanningQR = false
    @Published var trackingReady = false
    @Published var calibrating = false
    @Published var serverConnected = false
    @Published var serverAddresses: [String] = []
    @Published var serverCompatibility = ServerCompatibility.unknown
}

struct ContentView : View {
    @StateObject private var appState = AppState()
    @State private var arManager = ARManager()

    private let networking = Networking()
    private let qrScanner = QRScanner()
    private let webOverlay = WebOverlay()
    
    var body: some View {
        ARViewContainer(arManager: $arManager)
            .ignoresSafeArea(.all)
        
            // Web overlay
            .overlay(
                webOverlay
                    .ignoresSafeArea(.all)
                    .allowsHitTesting(false)
                    .opacity(showWebOverlay() ? 1 : 0)
                    .animation(.easeInOut(duration: 0.25), value: showWebOverlay())
            )
            
            // UI overlays
            .safeAreaInset(edge: .top, spacing: 0) {
                ControlsMenu()
            }
            .safeAreaInset(edge: .bottom, spacing: 0) {
                Banner()
            }
            .environmentObject(appState)
        
            // Event handling
            .onTapGesture(coordinateSpace: .global) { location in
                if (!appState.calibrating || location.y < 200) {
                    appState.showControls.toggle()
                }
            }
            .onAppear() {
                networking.start(appState, webOverlay)
                arManager.appState = appState
                arManager.webOverlay = webOverlay
                arManager.addFrameCallback(qrScanner.processFrame)
                qrScanner.start(appState)
            }
    }
    
    private func showWebOverlay() -> Bool {
        return !appState.scanningQR && appState.serverConnected && appState.serverCompatibility == .supported
    }
}

struct ARViewContainer: UIViewRepresentable {
    @Binding var arManager: ARManager
    
    func makeUIView(context: Context) -> MTKView {
        return arManager.view
    }
    
    func updateUIView(_ uiView: MTKView, context: Context) {}
}

#Preview {
    ContentView()
}
