import ARKit

class QRScanner {
    private let prefix = "https://asxr.team6328.org/?a="
    
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
                if (value.starts(with: self.prefix)) {
                    let address = String(value.dropFirst(self.prefix.count))
                    DispatchQueue.main.sync() {
                        self.appState.scanningQR = false
                        self.appState.serverAddress = address
                    }
                }
            }
            self.processing = false
        }
    }
}
