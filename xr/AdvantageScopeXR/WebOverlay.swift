import SwiftUI
import WebKit

struct WebOverlay: UIViewRepresentable {
    @EnvironmentObject var appState: AppState
    private var webView = WKWebView()
    
    func makeUIView(context: Context) -> WKWebView  {
        webView.isOpaque = false
        webView.backgroundColor = UIColor.clear
        webView.scrollView.backgroundColor = UIColor.clear
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        return webView;
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {}
    
    func load(_ serverAddress: String) {
        let url = URL(string: "http://" + serverAddress + ":56328")
        if (url != nil) {
            webView.load(URLRequest(url: url!))
        }
    }
    
    func render(_ data: Dictionary<String, Any>) {
        do {
            let json = try JSONSerialization.data(withJSONObject: data, options: JSONSerialization.WritingOptions(rawValue: 0))
            let jsonData = NSString(data: json, encoding: String.Encoding.utf8.rawValue)!
            webView.evaluateJavaScript("render(\(jsonData))")
        } catch {
            print("Failed to serialize JSON")
        }
    }
}
