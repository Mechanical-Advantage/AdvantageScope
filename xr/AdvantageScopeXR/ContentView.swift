// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

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
    @Environment(\.scenePhase) var scenePhase

    private let networking = Networking()
    private let qrScanner = QRScanner()
    @StateObject private var webOverlay = WebOverlay()
    
    var body: some View {
        ARViewContainer(arManager: $arManager)
            .ignoresSafeArea(.all)
        
            // Web overlay
            .overlay(
                WebOverlayView(overlay: webOverlay)
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
                if (appState.calibrationText.hasPrefix("Tap") && location.y > 350) {
                    webOverlay.userTap()
                } else if (!appState.showControls || location.y > 150) {
                    appState.showControls.toggle()
                }
            }
            .onAppear() {
                webOverlay.appState = appState
                networking.start(appState, webOverlay)
                arManager.appState = appState
                arManager.webOverlay = webOverlay
                arManager.addFrameCallback(qrScanner.processFrame)
                webOverlay.messageHandler.arManager = arManager
                qrScanner.start(appState)
                arManager.start()
            }
            .onChange(of: scenePhase) { newPhase in
                switch newPhase {
                case .active:
                    arManager.start()
                case .background, .inactive:
                    arManager.stop()
                @unknown default:
                    break
                }
            }
            .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) {activity in
                if (activity.webpageURL != nil) {
                    qrScanner.start(appState)
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
