// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import ARKit

class QRScanner {
    private var started = false
    private var appState: AppState! = nil
    private var processing = false
    
    func start(_ appState: AppState) {
        started = true
        self.appState = appState
    }
    
    func processFrame(_ frame: ARFrame) {
        if (!started || !appState.scanningQR || processing) {
            return
        }
        
        let requestHandler = VNImageRequestHandler(cvPixelBuffer: frame.capturedImage)
        processing = true
        DispatchQueue.global(qos: .utility).async() {
            let request = VNDetectBarcodesRequest()
            request.symbologies = [.qr]
            do {
                try requestHandler.perform([request])
            } catch {}
            
            if (request.results != nil &&
                !request.results!.isEmpty &&
                request.results![0].payloadStringValue != nil) {
                let value = request.results![0].payloadStringValue!
                if (value.starts(with: Constants.qrPrefix)) {
                    self.parseURL(value)
                }
            }
            self.processing = false
        }
    }
    
    func parseURL(_ url: String) {
        parseURL(NSURLComponents(string: url))
    }
    
    func parseURL(_ url: URL) {
        parseURL(NSURLComponents(url: url, resolvingAgainstBaseURL: false))
    }
    
    private func parseURL(_ components: NSURLComponents?) {
        // Parse components
        var nativeHostCompatibility: Int? = nil
        var addresses: [String] = []
        components?.queryItems?.forEach {item in
            if (item.value != nil) {
                switch (item.name) {
                case "c":
                    nativeHostCompatibility = Int(item.value!)
                case "a":
                    addresses = item.value!.split(separator: "_").map{ String($0) }
                default:
                    break
                }
            }
        }
        
        // Get server incompatibility value
        if (nativeHostCompatibility == nil) {
            return
        }
        var incompatibilityValue: NativeHostIncompatibility = .none
        if (nativeHostCompatibility! < Constants.nativeHostCompatibility) {
            incompatibilityValue = .serverTooOld
        } else if (nativeHostCompatibility! > Constants.nativeHostCompatibility) {
            incompatibilityValue = .serverTooNew
        }
        
        // Update app state
        DispatchQueue.main.async() {
            self.appState.scanningQR = false
            self.appState.serverIncompatibility = incompatibilityValue
            self.appState.serverAddresses = addresses
        }
    }
}
