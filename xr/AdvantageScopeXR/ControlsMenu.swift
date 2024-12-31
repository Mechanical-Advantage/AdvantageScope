import SwiftUI
import ReplayKit

struct ControlsMenu: View {
    @EnvironmentObject var appState: AppState
    let requestCalibration: () -> Void
    
    var body: some View {
        HStack {
            #if !APPCLIP
            Button("Scan", systemImage: "qrcode") {
                appState.scanningQR.toggle()
            }
            .opacity(appState.scanningQR ? 0.5 : 1)
            .animation(.easeInOut(duration: 0.1), value: appState.scanningQR)
            #endif
            
            RecordButton()
            
            Button("Recalibrate", systemImage: "scope") {
                requestCalibration()
            }
        }
        .buttonStyle(ControlButton(highlight: false))
        .padding()
        .statusBarHidden(true)
        .opacity(appState.showControls ? 1 : 0)
        .animation(.easeInOut(duration: 0.25), value: appState.showControls)
    }
}

struct ControlButton : ButtonStyle {
    let highlight: Bool
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(10)
            .foregroundStyle(highlight ? Color.white : Color.primary)
            .background(highlight ? AnyShapeStyle(Color.red) : AnyShapeStyle(.thinMaterial))
            .clipShape(Capsule())
            .controlSize(.large)
            .opacity(configuration.isPressed ? 0.75 : 1)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
            .animation(.none, value: highlight)
    }
}
