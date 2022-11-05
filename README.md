# AdvantageScope

[![Build](https://github.com/Mechanical-Advantage/AdvantageScope/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/Mechanical-Advantage/AdvantageScope/actions/workflows/build.yml)

AdvantageScope is a robot diagnostics, log review/analysis, and data visualization application for FIRST Robotics Competition teams. It reads logs in WPILOG and RLOG file formats, and supports live robot data viewing using NT4 or RLOG streaming.

It includes the following tools:

- A wide selection of flexible graphs and charts
- 2D and 3D field visualizations of odometry data, with customizable CAD-based robot avatars
- Synchronized video playback from a separately loaded match video
- Controller visualization, showing driver/operator actions on customizable controller representations
- Swerve drive module vector displays
- Console message review
- Log statistics analysis

AdvantageScope can be used with any WPILib project, but is also optimized for use with our [AdvantageKit](https://github.com/Mechanical-Advantage/AdvantageKit) logging framework.

**View the [online documentation](/docs/INDEX.md) or find it offline by clicking the 📖 icon in the tab bar.**

![Example screenshot](/screenshot.jpg)

## Installation

1. Click the release marked "Latest" under "Releases".
2. Download the appropriate build based on the OS & architecture. AdvantageScope supports Windows, macOS, and Linux on both x86 and ARM architectures.
