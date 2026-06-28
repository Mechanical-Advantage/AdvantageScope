// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import SwiftUI
import ReplayKit

class PreviewContainerViewController: UIViewController {
    let previewController: RPPreviewViewController
    
    init(previewController: RPPreviewViewController) {
        self.previewController = previewController
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder: NSCoder) { fatalError() }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        
        addChild(previewController)
        view.addSubview(previewController.view)
        previewController.view.translatesAutoresizingMaskIntoConstraints = false
        
        NSLayoutConstraint.activate([
            previewController.view.topAnchor.constraint(equalTo: view.topAnchor, constant: 10),
            previewController.view.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            previewController.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            previewController.view.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])
        
        previewController.didMove(toParent: self)
    }
}

class RecordingPreviewState : NSObject, ObservableObject, RPPreviewViewControllerDelegate {
    func previewControllerDidFinish(_ previewController: RPPreviewViewController) {
        if let container = previewController.parent {
            container.dismiss(animated: true)
        } else {
            previewController.dismiss(animated: true)
        }
    }
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
            preview.previewControllerDelegate = self.recordingPreviewState
            
            let container = PreviewContainerViewController(previewController: preview)
            if (UIDevice.current.userInterfaceIdiom == .pad) {
                container.modalPresentationStyle = .formSheet
            } else {
                container.modalPresentationStyle = .pageSheet
                if let sheet = container.sheetPresentationController {
                    sheet.detents = [.large()]
                    sheet.prefersGrabberVisible = true
                    sheet.preferredCornerRadius = 24
                }
            }
            
            DispatchQueue.main.async {
                guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                      let rootViewController = windowScene.windows.first(where: { $0.isKeyWindow })?.rootViewController else {
                    return
                }
                
                var topController = rootViewController
                while let presented = topController.presentedViewController {
                    topController = presented
                }
                
                topController.present(container, animated: true)
            }
        }
    }
}


