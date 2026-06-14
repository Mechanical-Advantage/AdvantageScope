// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import ARKit
import MetalKit

extension MTKView : RenderDestinationProvider {
}

class ARManager: NSObject, ARSessionDelegate, MTKViewDelegate {
    var appState: AppState? = nil
    var webOverlay: WebOverlay? = nil
    let session = ARSession()
    let view = MTKView()
    
    private let arConfig = ARWorldTrackingConfiguration()
    private var renderer: ARRenderer! = nil
    private var viewportSize: CGSize = CGSize()
    private var frameCallbacks: [(_ frame: ARFrame) -> Void] = []
    private var cachedAnchors: [ARAnchor] = []
    
    override init() {
        super.init()
        
        // Initialize AR session
        session.delegate = self
        arConfig.worldAlignment = .gravity
        arConfig.planeDetection = .horizontal
        
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
    
    func start() {
        session.run(arConfig)
    }
    
    func stop() {
        session.pause()
    }
    
    func addFrameCallback(_ callback: @escaping (_ frame: ARFrame) -> Void) {
        frameCallbacks.append(callback)
    }
    
    func recalibrate() {
        cachedAnchors = []
        session.run(arConfig, options: [.resetTracking, .resetSceneReconstruction, .removeExistingAnchors])
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
        cameraData["projection"] = simdFloat4x4ToArray(m: frame.camera.projectionMatrix(for: orientation, viewportSize: viewportSize, zNear: 0.15, zFar: 50.0))
        cameraData["worldInverse"] = simdFloat4x4ToArray(m: simd_inverse(cameraTransform))
        cameraData["position"] = [cameraTransform.columns.3.x, cameraTransform.columns.3.y, cameraTransform.columns.3.z]
        
        // Get frame size
        var frameSize = Array<Int>()
        frameSize.append(Int(frame.camera.imageResolution.width))
        frameSize.append(Int(frame.camera.imageResolution.height))
        
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
            let raycastResults = session.raycast(frame.raycastQuery(from: CGPoint(x: 0.5, y: 0.5), allowing: .existingPlaneGeometry, alignment: .horizontal))
            if (!raycastResults.isEmpty && raycastResults[0].anchor != nil) {
                let result = raycastResults[0]
                let anchor = result.anchor!
                let pointTransform = result.worldTransform
                let anchorTransform = anchor.transform
                
                // Save results
                raycastData["isValid"] = true
                raycastData["position"] = [
                    pointTransform.columns.3.x - anchorTransform.columns.3.x,
                    pointTransform.columns.3.y - anchorTransform.columns.3.y,
                    pointTransform.columns.3.z - anchorTransform.columns.3.z
                ]
                raycastData["anchorId"] = result.anchor!.identifier.uuidString
                
                // Start tracking anchor if new
                if (!cachedAnchors.contains(where: { $0.identifier == result.anchor!.identifier })) {
                    cachedAnchors.append(anchor)
                }
            }
        }
        
        // Get anchors
        var anchorData = Dictionary<String, Any>()
        for anchor in cachedAnchors {
            let transform = anchor.transform
            anchorData[anchor.identifier.uuidString] = [transform.columns.3.x, transform.columns.3.y, transform.columns.3.z]
        }
        
        // Publish data
        var renderData = Dictionary<String, Any>()
        renderData["camera"] = cameraData
        renderData["frameSize"] = frameSize
        renderData["lighting"] = lightingData
        renderData["raycast"] = raycastData
        renderData["anchors"] = anchorData
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
    
    func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
        var newCachedAnchors: [ARAnchor] = []
        for cachedAnchor in cachedAnchors {
            var found = false;
            for anchor in anchors {
                if anchor.identifier == cachedAnchor.identifier {
                    found = true;
                    newCachedAnchors.append(anchor)
                    break
                }
            }
            if (!found) {
                newCachedAnchors.append(cachedAnchor)
            }
        }
        cachedAnchors = newCachedAnchors
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
