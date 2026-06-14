// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import SwiftUI
import WebKit

// MARK: - View (Struct)
struct WebOverlayView: UIViewRepresentable {
    @ObservedObject var overlay: WebOverlay

    func makeUIView(context: Context) -> WKWebView  {
        return overlay.webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {}
}

// MARK: - Controller (Class)
class WebOverlay: ObservableObject {
    var appState: AppState? {
        didSet { messageHandler.appState = appState }
    }
    var webView: WKWebView!
    let messageHandler = ScriptMessageHandler()
    
    init() {
        let contentController = WKUserContentController()
        contentController.add(messageHandler, name: "asxr")
        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        
        webView = WKWebView(frame: CGRect(), configuration: config)
        webView.isOpaque = false
        webView.backgroundColor = UIColor.clear
        webView.scrollView.backgroundColor = UIColor.clear
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        
        // Enable remote inspection with Safari for debug builds
#if DEBUG
        if webView.responds(to: Selector(("setInspectable:"))) {
            webView.perform(Selector(("setInspectable:")), with: true)
        }
#endif
    }
    
    func load(_ serverAddress: String) {
        let url = URL(string: "http://" + serverAddress + ":" + String(Constants.serverPort))
        if (url != nil) {
            webView.load(URLRequest(url: url!))
        }
    }
    
    func isWebViewReady() -> Bool {
        return webView.url != nil && !webView.isLoading
    }
    
    // MARK: - JS Outgoing Messages
    
    func setReceivedCommand(_ data: Data, isQueued: Bool) {
        guard (isWebViewReady()) else { return }
        let base64Data = data.base64EncodedString()
        webView.evaluateJavaScript("setCommand(\"\(base64Data)\", \(isQueued ? "true" : "false"))")
    }
    
    func render(_ data: Dictionary<String, Any>) {
        guard (isWebViewReady()) else { return }
        do {
            let json = try JSONSerialization.data(withJSONObject: data, options: JSONSerialization.WritingOptions(rawValue: 0))
            let jsonData = NSString(data: json, encoding: String.Encoding.utf8.rawValue)!
            webView.evaluateJavaScript("render(\(jsonData))")
        } catch {
            print("Failed to serialize JSON")
        }
    }
    
    func requestCalibration() {
        guard (isWebViewReady()) else { return }
        webView.evaluateJavaScript("requestCalibration()")
    }
    
    func userTap() {
        guard (isWebViewReady()) else { return }
        webView.evaluateJavaScript("userTap()")
    }
}

class ScriptMessageHandler: NSObject, WKScriptMessageHandler {
    var appState: AppState? = nil
    var arManager: ARManager? = nil
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard (message.name == "asxr") else { return }
        let messageBody = message.body as! NSDictionary
        let name = messageBody["name"] as! String
        let data = messageBody["data"]
        
        switch (name) {
        case "setCalibrationText":
            guard (appState != nil) else { return }
            appState!.calibrationText = data as! String
        case "showControls":
            appState!.showControls = data as! Bool
        case "recalibrate":
            arManager?.recalibrate()
        default:
            break
        }
    }
}
