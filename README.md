# ![AdvantageScope](/banner.png)

[![Build](https://github.com/Mechanical-Advantage/AdvantageScope/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/Mechanical-Advantage/AdvantageScope/actions/workflows/build.yml)

AdvantageScope is a robot diagnostics, log review/analysis, and data visualization application for FIRST Robotics Competition teams. It reads logs in WPILOG, DS log, and RLOG file formats, plus live robot data viewing using NT4 or RLOG streaming. AdvantageScope can be used with any WPILib project, but is also optimized for use with our [AdvantageKit](https://github.com/Mechanical-Advantage/AdvantageKit) logging framework.

It includes the following tools:

- A wide selection of flexible graphs and charts
- 2D and 3D field visualizations of odometry data, with customizable CAD-based robots
- Synchronized video playback from a separately loaded match video
- Joystick visualization, showing driver actions on customizable controller representations
- Swerve drive module vector displays
- Console message review
- Log statistics analysis
- Flexible export options, with support for CSV and WPILOG

**View the [online documentation](/docs/INDEX.md) or find it offline by clicking the 📖 icon in the tab bar.**

Feedback, feature requests, and bug reports are welcome on the [issues page](https://github.com/Mechanical-Advantage/AdvantageScope/issues). For non-public inquires, please send a message to software@team6328.org.

![Example screenshot](/docs/resources/screenshot-light.png)

## Installation

1. Find the [latest release](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest) under "Releases".
2. Download the appropriate build based on the OS & architecture. AdvantageScope supports Windows, macOS, and Linux on both x86 and ARM architectures.

## Building

To install all dependencies, run:

```bash
npm install
```

To build for the current platform, run:

```bash
npm run build
```

To build for another platform, run:

```bash
npm run build -- --win --x64 # For full list of options, run "npx electron-builder help"
```

To build the WPILib version, set the environment variable `ASCOPE_DISTRIBUTOR` to `WPILIB` before building:

```bash
export ASCOPE_DISTRIBUTOR=WPILIB
```

For development, run:

```bash
npm run watch
npm start
```

## Assets

For details on adding custom assets, see [Custom Assets](/docs/CUSTOM-ASSETS.md).

Bundled assets are stored under [`bundledAssets`](/bundledAssets/). Larger assets are downloaded automatically by AdvantageScope from the [AdvantageScopeAssets](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) repository.
