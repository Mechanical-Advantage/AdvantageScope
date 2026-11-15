---
title: What's New in 2027?
sidebar_position: 2
---

#

<!-- TODO: Add 2027 banner images (/img/whats-new/banner-light.webp and /img/whats-new/banner-dark.webp) -->
<img src="/img/whats-new/banner-light.webp" className="light-only" />
<img src="/img/whats-new/banner-dark.webp" className="dark-only" />

The 2027 version of AdvantageScope is now available! Check the [installation docs](/overview/installation) and [full changelog](https://github.com/Mechanical-Advantage/AdvantageScope/releases) for details. This release includes several major new features and numerous enhancements across the application. This is also the first version of AdvantageScope with full support for Systemcore.

**We value your feedback! Feedback, feature requests, and bug reports are welcome on the [issues page](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

## 🍋‍🟩 Systemcore Compatibility {#systemcore-compatibility}

AdvantageScope 2027 is built for seamless operation with the new Systemcore robot controller and WPILib 2027:

- The default robot address is now `robot.local`, allowing you to connect live or download logs without configuring a team number. Systemcore USB and Wi-Fi addresses are also selectable from the menu bar.
- [Log downloading](/overview/log-files#downloading-from-the-robot) now supports SFTP for Systemcore alongside legacy roboRIO log downloads.
- Added the [Center/Red](/more-features/coordinate-systems#center-red) coordinate system used by FRC fields starting in 2027 and FTC fields starting in 2027-2028.
- Added support for WPILib 2027's `Telemetry` and `Tunables` APIs, updated alert colors, and a new [timestamp display preference](/more-features/timestamps) to keep Systemcore timestamps easy to read.
- A new [Systemcore Diagnostics](/overview/live-sources) live mode connects directly to Systemcore's built-in NetworkTables server to monitor robot state and hardware IO with no user code required.

## 💡 AdvantageScope Lite {#advantagescope-lite}

[AdvantageScope Lite](/more-features/advantagescope-lite) brings AdvantageScope's visualization and analysis tools directly to your web browser. It's accessible both from the Systemcore web interface and inside the FIRST Driver Station with **no installation required**.

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/lHsak9Mmx2M" title="AdvantageScope Lite Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 🎮 FIRST Driver Station {#first-driver-station}

AdvantageScope integrates closely with the new [FIRST Driver Station](https://docs.wpilib.org/en/latest/docs/software/firstdriverstation) to streamline match diagnostics:

- [AdvantageScope Lite](/more-features/advantagescope-lite) is accessible directly from the FIRST Driver Station settings menu to analyze WPILOG files produced by the DS.
- Use desktop app to stream real-time match state, comms metrics, battery voltage, and joystick inputs from a local Driver Station with zero configuration.
- Opening a Driver Station `.wpilog` file on desktop prompts to open a dedicated window pre-configured with tabs for console output, communication metrics, power, CPU usage, and joysticks ([docs](/overview/log-files#driver-station-layout)). This layout is also used by default in AdvantageScope Lite for the Driver Station.
- View Driver Station console logs on the 💬 [Console](/tab-reference/console) tab with automatic warning/error highlighting and full support for [ANSI escape sequences](/tab-reference/console#ansi-formatting) (colors and text styles).

<img src="/img/tutorials/taking-control-1.webp" alt="Opening AdvantageScope Lite from the FIRST Driver Station" />

## 🌐 Multi-Language Support {#language-support}

AdvantageScope is now available in **14 languages** across the desktop application, documentation site, mobile apps, and AdvantageScope Lite: English (US), Spanish (Latin America), French, Dutch, Portuguese (Brazil), Romanian, Turkish, Russian, Kazakh, Hebrew, Arabic, Hindi, Simplified Chinese, and Traditional Chinese.

:::info
Translations are a work in progress created with the support of AI and community contributors, and **may include unnatural phrasing or inaccuracies**. Thank you to the teams who have already helped review and refine these translations! See the 🌐 [Language Support](/overview/language-support) page for details on our translation process and how to submit feedback.
:::

<img src="/img/whats-new/multi-language-1.webp" alt="Line graph tab in Simplified Chinese" />

## 📖 New Tutorials & Documentation {#new-tutorials-and-documentation}

The documentation has been expanded with a new three-part [tutorial series](/category/tutorials) designed to help teams get started with WPILib 2027 and AdvantageScope:

1. **👋 [Hello, Telemetry!](/tutorials/hello-telemetry):** Setting up `DataLogManager` and the `Telemetry` API, connecting live, and analyzing data with line graphs, tables, and statistics.
2. **🤖 [To the Field: Robot Visualization](/tutorials/to-the-field):** Publishing 2D/3D poses, trajectories, and `Mechanism2d` objects on FRC and FTC fields.
3. **🕹️ [Taking Control: DS & Joysticks](/tutorials/taking-control):** Streaming live Driver Station diagnostics, synchronizing robot and DS logs, viewing console output, and visualizing controller inputs.

Code examples across the documentation have also been updated with full coverage for WPILib's telemetry API across multiple languages.

<img src="/img/tutorials/to-the-field-4.webp" alt="3D field visualization from the To the Field tutorial" />

## 📱 AdvantageTune {#advantagetune}

AdvantageTune is a new standalone iPhone and iPad application that provides a lightweight mobile tuning experience to complement AdvantageScope. You can view and modify live [NetworkTables](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html) topics (including primitives, arrays, WPILib structs, and Protobufs) directly from your phone, making it easy for everyone to get involved in tuning robot code.

Both AdvantageTune and AdvantageScope streamline the process of exporting tuned values back to robot code with buttons to save all tuned values to a list for sharing ([docs](/overview/live-sources/tuning-mode)).

[<img src="/img/app-store.svg" alt="App Store" />](https://apps.apple.com/us/app/advantagetune/id6811453643)

<div className="image-gallery">
  <img src="/img/whats-new/advantagetune-1.webp" alt="AdvantageTune browse view" />
  <img src="/img/whats-new/advantagetune-2.webp" alt="AdvantageTune topic editing" />
  <img src="/img/whats-new/advantagetune-3.webp" alt="AdvantageTune struct editing" />
  <img src="/img/whats-new/advantagetune-4.webp" alt="AdvantageTune tuned values list" />
  <img src="/img/whats-new/advantagetune-5.webp" alt="AdvantageTune search and filter" />
</div>

## 🪐 WPILOG Universal Logging {#wpilog-universal-logging}

With [Universal Logging](/more-features/universal-logging), a single WPILOG file can now serve as a universal container for multiple log streams and formats, including vendor-specific device logs, CSV data, and child WPILOG files. Universal logging replaces URCL with a flexible, vendor-agnostic approach: data from every source is automatically synchronized and merged into a single unified sidebar tree. See the [Universal Logging documentation](/more-features/universal-logging#experimental-vendor-logging) for details on vendor log capture in WPILib (Java, C++, and Python) and AdvantageKit.

<img src="/img/more-features/universal-logging-1.webp" alt="A WPILOG file showing multiple vendor logs in the sidebar" />

## 🗺️ Field Tab Improvements {#field-tab-improvements}

Several usability improvements have been added to the 🗺️ [2D Field](/tab-reference/2d-field) and 👀 [3D Field](/tab-reference/3d-field) tabs:

- Pan and zoom across the 2D field, or right-click to lock the camera to follow the robot's position and rotation ([docs](/tab-reference/2d-field#camera-controls)).
- Added tile grid lines on 2D and 3D FTC fields for easier spatial reference.
- AdvantageScope now remembers whether an FRC or FTC field was last used when opening new 2D or 3D field tabs.

<img src="/img/tab-reference/2d-field-1.webp" alt="2D field tab overview" />

## 📉 Line Graph Improvements {#line-graph-improvements}

The 📉 [Line Graph](/tab-reference/line-graph) and timeline include several visual refinements for clearer analysis:

- Enabling "Show Robot Mode" now renders a color-coded bar for autonomous, teleoperated, utility, and disabled periods.
- Point-style graphs automatically scale point sizes for better visibility at any level of zoom.
- Helpful hints appear on the line graph and timeline to guide new users on scrolling and zooming gestures.
- Improved the rendering and legibility of large timestamp values on the timeline and line graph axes.

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="Color-coded robot mode overlay on the line graph" />

## 🤝 Accessibility Enhancements {#accessibility-enhancements}

AdvantageScope 2027 includes several updates to make the application more accessible:

- Added keyboard tab navigation for all inputs and descriptive tooltips for all controls across the app.
- AdvantageScope now respects OS-level reduce transparency and reduce motion settings.
- Boolean indicators in the sidebar now distinguish states without relying on color alone.

## 🥔 New Unit Types {#new-unit-types}

AdvantageScope's [unit-aware graphing](/tab-reference/line-graph/units) has been expanded with additional unit types and parsing options:

- Power (watts, horsepower, etc.)
- Ratios (dimensionless, percent)
- Temperature in Kelvin
- Potato energy
- British English unit spellings (e.g. `metres`)
- Suffixes for WPILib's unit library

## 🧱 Stability Improvements {#stability-improvements}

This release includes numerous bug fixes, performance optimizations, and stability improvements across the application. The full list can be found in the release [changelog](https://github.com/Mechanical-Advantage/AdvantageScope/releases), with notable highlights below:

- Official Windows releases are now code-signed, reducing the frequency of SmartScreen warnings during installation.
- Significantly improved log loading and graphing performance, especially when working with Hoot (`.hoot`) logs.
- Improved the multi-log timestamp synchronization algorithm when aligning logs from multiple sources.
- Improved connection reliability for [Phoenix Diagnostics](/overview/live-sources/phoenix-diagnostics).
- Fixed UI issues with the menu bar on pop-out windows and the recording popup in [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- Refined UI text and phrasing throughout the application to improve clarity.
