// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import SwiftUI
import ReplayKit

class RecordingPreviewState : ObservableObject {
    @Published var view: RPPreviewView!
    @Published var showFullScreen = false
    @Published var showSheet = false
}

struct RecordButton: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var recordingPreviewState: RecordingPreviewState
    @State private var recording = false
    
    var body: some View {
        Button("Record", systemImage: recording ? "stop.circle": "record.circle") {
            // Immediately update button style and stop recording
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                recording.toggle()
                if (!recording) {
                    stopRecording()
                }
            }
            
            // When starting, automatically hide controls for clean UI
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                if (recording) {
                    appState.showControls = false
                }
            }
            
            // After controls are hidden, start recording
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.55) {
                if (recording) {
                    startRecording()
                }
            }
        }
        .buttonStyle(ControlButton(highlight: recording ? .red : .none))
        .animation(.none, value: recording)
    }
    
    private func startRecording() {
        RPScreenRecorder.shared().startRecording { error in
            if (error != nil) {
                recording = false
            }
        }
    }
    
    private func stopRecording() {
        RPScreenRecorder.shared().stopRecording { preview, error in
            guard let preview = preview else { return }
            recordingPreviewState.view = RPPreviewView(controller: preview, showFullScreen: $recordingPreviewState.showFullScreen, showSheet: $recordingPreviewState.showSheet)
            if (UIDevice.current.userInterfaceIdiom == .pad) {
                recordingPreviewState.showSheet = true
            } else {
                recordingPreviewState.showFullScreen = true
            }
        }
    }
}

struct RPPreviewView: UIViewControllerRepresentable {
    let controller: RPPreviewViewController
    @Binding var showFullScreen: Bool
    @Binding var showSheet: Bool
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    func makeUIViewController(context: Context) -> RPPreviewViewController {
        controller.previewControllerDelegate = context.coordinator
        return controller
    }
    
    func updateUIViewController(_ uiView: RPPreviewViewController, context: Context) {}
    
    class Coordinator: NSObject, RPPreviewViewControllerDelegate {
        var parent: RPPreviewView
           
        init(_ parent: RPPreviewView) {
            self.parent = parent
        }
           
        func previewControllerDidFinish(_ previewController: RPPreviewViewController) {
            parent.showFullScreen = false
            parent.showSheet = false
        }
    }
}
