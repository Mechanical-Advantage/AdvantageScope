import SwiftUI
import MetalKit

class AppState : ObservableObject {
    @Published var showControls = true
    @Published var trackingReady = false
    @Published var calibrationText = ""
    
    #if APPCLIP
    @Published var scanningQR = false
    #else
    @Published var scanningQR = true
    #endif
    
    @Published var serverIncompatibility: NativeHostIncompatibility = .none
    @Published var serverAddresses: [String] = []
    @Published var serverConnected = false
}

struct ContentView : View {
    @StateObject private var appState = AppState()
    @StateObject private var recordingPreviewState = RecordingPreviewState()
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
            .safeAreaInset(edge: .top) {
                ControlsMenu(requestCalibration: webOverlay.requestCalibration)
                    .environmentObject(recordingPreviewState)
            }
            .safeAreaInset(edge: .bottom) {
                Banner()
            }
            .environmentObject(appState)
        
            // Recording preview
            .fullScreenCover(isPresented: $recordingPreviewState.showFullScreen) {
                recordingPreviewState.view.ignoresSafeArea(.all)
            }
            .sheet(isPresented: $recordingPreviewState.showSheet) {
                recordingPreviewState.view.ignoresSafeArea(.all)
            }
        
            // Event handling
            .onTapGesture(coordinateSpace: .global) { location in
                if (!appState.calibrationText.isEmpty && location.y > 150) {
                    webOverlay.userTap()
                } else {
                    appState.showControls.toggle()
                }
            }
            .onAppear() {
                networking.start(appState, webOverlay)
                arManager.appState = appState
                arManager.webOverlay = webOverlay
                arManager.addFrameCallback(qrScanner.processFrame)
                webOverlay.messageHandler.arManager = arManager
                qrScanner.start(appState)
            }
            .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) {activity in
                if (activity.webpageURL != nil) {
                    qrScanner.parseURL(activity.webpageURL!)
                }
            }
    }
    
    private func showWebOverlay() -> Bool {
        return !appState.scanningQR && appState.serverConnected
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
