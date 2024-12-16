import ARKit
import MetalKit

extension MTKView : RenderDestinationProvider {
}

class ARManager: NSObject, ARSessionDelegate, MTKViewDelegate {
    var appState: AppState? = nil
    var webOverlay: WebOverlay? = nil
    let session = ARSession()
    let view = MTKView()
    
    private var renderer: ARRenderer! = nil
    private var viewportSize: CGSize = CGSize()
    private var frameCallbacks: [(_ frame: ARFrame) -> Void] = []
    
    override init() {
        super.init()
        
        // Initialize AR session
        session.delegate = self
        let arConfig = ARWorldTrackingConfiguration()
        arConfig.worldAlignment = .gravity
        arConfig.planeDetection = .horizontal
        session.run(arConfig)
        
        // Initialize view
        view.device = MTLCreateSystemDefaultDevice()
        view.backgroundColor = UIColor.clear
        view.delegate = self
        viewportSize = view.bounds.size
        guard view.device != nil else {
            print("Metal is not supported on this device")
            return
        }
        
        // Start renderer
        renderer = ARRenderer(session: session, metalDevice: view.device!, renderDestination: view)
        renderer.drawRectResized(size: view.bounds.size)
    }
    
    func addFrameCallback(_ callback: @escaping (_ frame: ARFrame) -> Void) {
        frameCallbacks.append(callback)
    }
    
    // MARK: - MTKViewDelegate
    
    func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {
        viewportSize = size
        renderer.drawRectResized(size: size)
    }
    
    func draw(in view: MTKView) {
        renderer.update()
    }
    
    // MARK: - ARSessionDelegate
    
    func session(_ session: ARSession, didUpdate frame: ARFrame) {
        // Get interface orientation
        var orientation: UIInterfaceOrientation = .portrait
        let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene
        if (windowScene != nil) {
            orientation = windowScene!.interfaceOrientation
        }
        
        // Get camera transform
        var cameraTransform = frame.camera.transform
        switch (orientation) {
        case .portrait:
            cameraTransform *= simd_float4x4(
                [ 0, 1, 0, 0],
                [-1, 0, 0, 0],
                [ 0, 0, 1, 0],
                [ 0, 0, 0, 1]
            )
        case .portraitUpsideDown:
            cameraTransform *= simd_float4x4(
                [0, -1, 0, 0],
                [1,  0, 0, 0],
                [0,  0, 1, 0],
                [0,  0, 0, 1]
            )
        case .landscapeLeft:
            cameraTransform *= simd_float4x4(
                [-1,  0, 0, 0],
                [ 0, -1, 0, 0],
                [ 0,  0, 1, 0],
                [ 0,  0, 0, 1]
            )
        default:
            break
        }
        
        // Update camera data
        var cameraData = Dictionary<String, Any>()
        cameraData["projection"] = simdFloat4x4ToArray(m: frame.camera.projectionMatrix(for: orientation, viewportSize: viewportSize, zNear: 0.001, zFar: 1000.0))
        cameraData["worldInverse"] = simdFloat4x4ToArray(m: simd_inverse(cameraTransform))
        cameraData["position"] = [cameraTransform.columns.3.x, cameraTransform.columns.3.y, cameraTransform.columns.3.z]
        
        // Get frame size
        var frameSize = Array<Int>()
        frameSize.append(CVPixelBufferGetWidth(frame.capturedImage))
        frameSize.append(CVPixelBufferGetHeight(frame.capturedImage))
        
        // Get lighting data
        var lightingData = Dictionary<String, Any>()
        lightingData["grain"] = frame.cameraGrainIntensity;
        lightingData["intensity"] = 1.0;
        lightingData["temperature"] = 4500.0;
        if let lightEstimate = frame.lightEstimate {
            lightingData["intensity"] = lightEstimate.ambientIntensity / 1000.0
            lightingData["temperature"] = lightEstimate.ambientColorTemperature
        }
        
        // Run raycast
        var raycastData = Dictionary<String, Any>()
        raycastData["isValid"] = false
        if (frame.camera.trackingState == .normal) {
            let raycastResults = session.raycast(frame.raycastQuery(from: CGPoint(x: 0.5, y: 0.5), allowing: .estimatedPlane, alignment: .horizontal))
            if (!raycastResults.isEmpty) {
                raycastData["isValid"] = true
                let transform = raycastResults[0].worldTransform
                raycastData["position"] = [transform.columns.3.x, transform.columns.3.y, transform.columns.3.z]
            }
        }
        
        // Publish data
        var renderData = Dictionary<String, Any>()
        renderData["camera"] = cameraData
        renderData["frameSize"] = frameSize
        renderData["lighting"] = lightingData
        renderData["raycast"] = raycastData
        webOverlay?.render(renderData)
        
        // Update tracking state
        if (appState != nil) {
            appState!.trackingReady = frame.camera.trackingState == .normal
        }
    
        
        // Run frame callbacks
        for callback in frameCallbacks {
            callback(frame)
        }
    }
    
    func simdFloat4x4ToArray(m: simd_float4x4) -> [Float] {
        return [m.columns.0.x, m.columns.0.y, m.columns.0.z, m.columns.0.w,
                m.columns.1.x, m.columns.1.y, m.columns.1.z, m.columns.1.w,
                m.columns.2.x, m.columns.2.y, m.columns.2.z, m.columns.2.w,
                m.columns.3.x, m.columns.3.y, m.columns.3.z, m.columns.3.w]
    }
    
    func simdFloat3ToArray(v: simd_float3) -> [Float] {
        return [v.x, v.y, v.z]
    }
}
