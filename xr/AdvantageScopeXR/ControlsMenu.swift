import SwiftUI

struct ControlsMenu: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        HStack {
            Button("Scan Code", systemImage: "qrcode") {
                appState.scanningQR = true
            }
            .disabled(appState.scanningQR)
            .opacity(appState.scanningQR ? 0.5 : 1)
            Button("Recalibrate", systemImage: "scope") {
                // TODO
            }
        }
        .buttonStyle(ControlButton())
        .padding()
        .opacity(appState.showControls ? 1 : 0)
        .statusBarHidden(!appState.showControls)
        .animation(.easeInOut(duration: 0.25), value: appState.showControls)
    }
}

struct ControlButton : ButtonStyle {
    @State private var animate = false
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(10)
            .background(.thinMaterial)
            .clipShape(Capsule())
            .controlSize(.large)
            .scaleEffect(configuration.isPressed ? 0.9 : 1.0)
            .opacity(configuration.isPressed ? 0.6 : 1.0)
            .animation(.easeInOut, value: configuration.isPressed)
    }
}
