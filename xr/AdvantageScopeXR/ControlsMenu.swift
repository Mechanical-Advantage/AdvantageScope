// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import SwiftUI
import ReplayKit

struct ControlsMenu: View {
    @EnvironmentObject var appState: AppState
    let requestCalibration: () -> Void
    
    var body: some View {
        Group {
            if #available(iOS 26.0, *) {
                GlassEffectContainer(spacing: 0) {
                    buttonStack
                }
            } else {
                buttonStack
            }
        }
        .padding()
        .statusBarHidden(true)
        .opacity(appState.showControls ? 1 : 0)
        .animation(.easeInOut(duration: 0.25), value: appState.showControls)
    }
    
    #if !APPCLIP
    private var scanButton: some View {
        Button("Scan", systemImage: "qrcode") {
            appState.scanningQR.toggle()
        }.buttonStyle(ControlButton(highlight: appState.scanningQR ? .blue : .none))
    }
    #endif
    
    private var recordButton: some View {
        RecordButton()
    }
    
    private var calibrateButton: some View {
        Button("Calibrate", systemImage: "scope") {
            requestCalibration()
        }.buttonStyle(ControlButton(highlight: .none))
    }
    
    @ViewBuilder
    private var allButtons: some View {
    #if !APPCLIP
        scanButton
    #endif
        recordButton
        calibrateButton
    }
    
    private var buttonStack: some View {
        ViewThatFits {
            HStack(spacing: 14) {
                allButtons
            }
            VStack(spacing: 14) {
            #if !APPCLIP
                HStack(spacing: 14) {
                    scanButton
                    recordButton
                }
                calibrateButton
            #else
                allButtons
            #endif
            }
            VStack(spacing: 14) {
                allButtons
            }
        }
    }
}

struct ControlButton : ButtonStyle {
    let highlight: Optional<Color>
    
    func makeBody(configuration: Configuration) -> some View {
        if #available(iOS 26.0, *) {
            configuration.label
                .lineLimit(1)
                .fixedSize(horizontal: true, vertical: false)
                .padding(10)
                .glassEffect(.regular.interactive())
                .contentShape(Rectangle())
                .foregroundStyle(highlight ?? .primary)
        } else {
            configuration.label
                .lineLimit(1)
                .fixedSize(horizontal: true, vertical: false)
                .padding(10)
                .controlSize(.large)
                .background(highlight == .none ? AnyShapeStyle(.thinMaterial) : AnyShapeStyle(highlight!))
                .foregroundStyle(highlight == .none ? .primary : Color.white)
                .clipShape(Capsule())
                .opacity(configuration.isPressed ? 0.75 : 1)
                .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
                .animation(.none, value: highlight)
        }
    }
}
