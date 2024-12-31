import SwiftUI

struct Banner: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        Text(text())
            .multilineTextAlignment(.center)
            .padding(10)
            .frame(maxWidth: .infinity)
            .background(.thinMaterial)
            .opacity(show() ? 1 : 0)
            .persistentSystemOverlays(show() ? .visible : .hidden)
            .animation(.easeInOut(duration: 0.25), value: show())
    }
    
    private func text() -> String {
        if (appState.scanningQR) {
            return "Scan QR code displayed in AdvantageScope."
        } else if (appState.serverIncompatibility == .serverTooOld) {
            return "Update AdvantageScope to the latest version, then try again."
        } else if (appState.serverIncompatibility == .serverTooNew) {
            return "Update AdvantageScope XR to the latest version, then try again."
        } else if (!appState.serverConnected ) {
            return "Searching for server..."
        } else if (!appState.trackingReady || appState.calibrationText == "$TRACKING_WARNING") {
            return "Move " + UIDevice.current.model + " to detect environment."
        } else if (!appState.calibrationText.isEmpty) {
            return appState.calibrationText
        } else {
            return ""
        }
    }
    
    private func show() -> Bool {
        return text() != ""
    }
}
