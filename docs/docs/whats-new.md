---
title: What's New in 2027?
sidebar_position: 2
---

import BannerLight from "./img/whats-new/banner-light.png";
import BannerDark from "./img/whats-new/banner-dark.png";

#

<img src={BannerLight} className="light-only" />
<img src={BannerDark} className="dark-only" />

The 2027 version of AdvantageScope is now available! Check the [installation docs](/overview/installation) and [full changelog](https://github.com/Mechanical-Advantage/AdvantageScope/releases) for details. This release includes several major new features and numerous enhancements across the application. This is also the first version of AdvantageScope with full support for Systemcore.

**We value your feedback! Feedback, feature requests, and bug reports are welcome on the [issues page](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

## 🍋‍🟩 Systemcore Compatibility {#systemcore-compatibility}

- Log downloading (backwards compatible)
- Systemcore diagnostics mode
- USB/Wi-Fi connection
- Default robot address of `robot.local`: no need to configure team number
- 2027 coordinate system
- WPILib 2027 compatibility (new formats, timestamp option, alert colors, etc.)

## 💡 AdvantageScope Lite {#advantagescope-lite}

## 🎮 FIRST Driver Station {#first-driver-station}

- AdvantageScope Lite
- Driver Station live mode
- Updated robot mode and joystick formats (SDL bindings)
- Support for DS console data, including warning/error highlighting
- Built-in layout on Lite and desktop
- ANSI rendering on console tab

## 📱 AdvantageTune {#advantagetune}

- Mobile app
- ...also a button on desktop to copy tuned values to the clipboard

## 🪐 WPILOG Universal Logging {#wpilog-universal-logging}

## 🗺️ Field Tab Improvements {#field-tab-improvements}

- Camera controls on the 2D field
- Added line grids on 2D and 3D FTC fields
- Remember last used field type on 2D/3D fields

## 📉 Line Graph Improvements {#line-graph-improvements}

- Color-coded robot mode visualization on line graph (including utility mode)
- Dynamic sizing for line graph points
- Onboarding overlay for line graph and timeline
- Improved rendering of large timestamp values on the timeline and line graph

## 🌐 Multi-Language Support {#language-support}

## 🤝 Accessibility Enhancements {#accessibility-enhancements}

- Added tab controls for all inputs
- Added tooltips to all controls
- Respect reduce transparency and reduce motion settings
- Boolean values are differentiated without color

## ⚡️ New Unit Types {#new-unit-types}

- Potato energy
- Power
- Ratios
- Added missing WPILib unit suffixes

## 🧱 Stability Improvements {#stability-improvements}

- Windows signing
- Fixed menu bars on popup windows
- Language refinements to improve clarity
- Fixed safe area handling for XR recording popup
- Improved reliability of Phoenix diagnostics
