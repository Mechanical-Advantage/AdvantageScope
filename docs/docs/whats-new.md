---
title: What's New in 2026?
sidebar_position: 2
---

import BannerLight from "./img/whats-new/banner-light.png";
import BannerDark from "./img/whats-new/banner-dark.png";

import FTC1 from "./img/whats-new/ftc-1.jpg";
import FTC2 from "./img/whats-new/ftc-2.jpg";
import FTC3 from "./img/whats-new/ftc-3.png";
import FTC4 from "./img/whats-new/ftc-4.png";
import FTC5 from "./img/whats-new/ftc-5.png";

import Menus1 from "./img/whats-new/menus-1.png";
import Menus2 from "./img/whats-new/menus-2.png";
import Menus3 from "./img/prefs.png";

#

<img src={BannerLight} className="light-only" />
<img src={BannerDark} className="dark-only" />

The 2026 version of AdvantageScope is now available in beta! This release includes several major new features and numerous enhancements across the application. Many of the features in this release are designed to improve the experience on existing control systems while setting up a smooth transition to [SystemCore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) in future seasons.

**We value your feedback! Feedback, feature requests, and bug reports are welcome on the [issues page](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

:::warning
**AdvantageScope 2026 is in beta**, which means that teams will encounter issues not present in stable releases. Beta releases allow teams to experiment with upcoming features and provide feedback before the official release in January 2026. Users looking for a stable release should download AdvantageScope [v4.1.6](https://github.com/Mechanical-Advantage/AdvantageScope/releases/tag/v4.1.6), the latest 2025 release. For more information, check the [installation](/overview/installation) page.
:::

To get started with the AdvantageScope 2026 beta, click the "Prerelease" link in the [installation docs](/overview/installation#team-6328) and find the first release with version v26.0.0-beta-X. Check the [full changelog](https://github.com/Mechanical-Advantage/AdvantageScope/releases/tag/v26.0.0-beta-1) for a complete list of changes. The most notable features in this release are documented below.

## ✴️ Experimental: FTC Support {#ftc-support}

In preparation for full support with SystemCore in the 2027-2028 season, this release adds several features to improve compatibility with the existing FIRST Tech Challenge control system:

- FTC fields and robot models on the 🗺️ [2D Field](/tab-reference/2d-field) and 👀 [3D Field](/tab-reference/3d-field)
- New [coordinate system](/more-features/coordinate-systems) options for compatibility with [standard FTC coordinates](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- Support for [Road Runner](https://rr.brott.dev/docs/v1-0/installation/) log files
- Support for the [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard) live streaming format

:::tip
FTC teams should exercise caution when using beta/experimental software during the official season. FTC support for AdvantageScope is still in active development.
:::

<div className="image-gallery">
  <img src={FTC1} />
  <img src={FTC2} />
  <img src={FTC3} />
  <img src={FTC4} />
  <img src={FTC5} />
</div>

Several third-party FTC logging/telemetry libraries support other formats compatible with AdvantageScope, such as WPILOG and RLOG. Documentation of these libraries can be found in the respective projects; the AdvantageScope developers do not endorse/recommend any particular FTC logging solution for use with AdvantageScope.

:::info
AdvantageScope is designed to provide the best experience when used alongside the WPILib framework and associated logging tools. You may encounter compatibility issues or limited capabilities when using unofficial logging solutions.

All features of AdvantageScope will be officially supported in FTC after the transition to SystemCore for the 2027-2028 season.
:::

## 🧮 Unit-Aware Graphing {#unit-aware-graphing}

The 📉 [Line Graph](/tab-reference/line-graph/) tab has been redesigned to be fully unit-aware. This enables several new capabilities when graphing numeric fields:

- Precise labeling of Y axes and value displays
- Quick conversion to compatible units (no popup windows)
- Implicit conversion of compatible unit types within a single axis
- Accurate display of [integrated and differentiated](/tab-reference/line-graph/#integration--differentiation) units

The screenshot below shows all of these features in action. Note that the left axis includes fields with different angular velocity units, and the right axis includes values that are differentiated and displayed in a non-native unit (degrees). Selecting units is also easier than ever before, with compatible unit options integrated directly in the control menu for each axis.

_More information about unit support can be found in the [documentation](/tab-reference/line-graph/units)._

![Unit-aware graphing](./tab-reference/line-graph/img/units-1.png)

## 🏁 Faster Log Downloads {#faster-log-downloads}

[Downloading logs from the roboRIO](/overview/log-files/#downloading-from-the-robot) is now **2-4x faster** than previous releases. This is accomplished by switching to a new protocol (FTP) that allows the roboRIO to transfer log data with less CPU overhead.

The table below shows the measured transfer speed on the 2025 and 2026 releases of AdvantageScope while tethered via Ethernet (max bandwidth of 100 Mb/s). Note that the performance of the 2025 release is severely impacted by the CPU load on the roboRIO.

|                                                    | 2025 (SFTP) | 2026 (FTP) | Speedup                                          |
| -------------------------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| High CPU load<br /><sub>Complex robot code</sub>   | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3.2x**</span> |
| Average CPU load<br /><sub>Normal robot code</sub> | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2.3x**</span> |
| Minimal CPU load<br /><sub>No robot code</sub>     | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1.1x**</span> |

## 🌈 New Visualization Options {#new-visualization-options}

Several new visualization options are supported on the 🗺️ [2D Field](/tab-reference/2d-field) and 👀 [3D Field](/tab-reference/3d-field):

- A wider variety of robot bumper colors are now available on the 2D field, and each object can be configured with its own color. This enables greater flexibility when combining ghosts with multiple robot objects.
- When [visualizing 2D mechanisms on the 3D field](/tab-reference/3d-field/#2d-mechanisms), mechanisms can now be placed on the YZ plane in addition to the XZ plane. This enables easier visualization of complex mechanisms with movement in multiple axes.
- The 3D field now supports optional anti-aliasing to improve the quality of rendered edges.

![New field visualizations](./img/whats-new/field-viz.jpg)

## 💿 CSV File Imports {#csv-file-imports}

For more flexible visualization of data produced outside of robot logging frameworks, AdvantageScope now includes basic support for importing CSV files. Check the [documentation](/overview/log-files/#csv-formatting) for more details on supported formats and other limitations.

![CSV data](./overview/log-files/img/export-2.png)

## 🤩 Aesthetic Improvements {#aesthetic-improvements}

The AdvantageScope UI on Windows 11 has been updated to support a translucent sidebar, which was previously exclusive to macOS releases. An updated app icon is also available for macOS Tahoe based on Apple's Liquid Glass material.

![Windows UI](./img/whats-new/windows-ui.png)

## 📋 Streamlined Menus {#streamlined-menus}

The menu bar and related controls have been streamlined and reorganized to make the controls more accessible and consistent across all platforms. Notable features include:

- Faster switching between live sources (e.g. NetworkTables and [Phoenix Diagnostics](/overview/live-sources/phoenix-diagnostics)), with no need to open the preferences window.
- Right-click on the sidebar to quickly copy the name of a field (or the full field key).
- Reorganization of the preferences window, making options easier to find quickly.

<div className="image-gallery">
  <img src={Menus1} />
  <img src={Menus2} />
  <img src={Menus3} />
</div>

## 🐛 Stability Improvements {#stability-improvements}

This release includes a variety of bug fixes and stability improvements across the application. The full list can be found in the release [changelog](https://github.com/Mechanical-Advantage/AdvantageScope/releases/tag/v26.0.0-beta-1), but some notable fixes are listed below:

- The performance of AdvantageScope when streaming data for long periods has been greatly improved, especially when using the line graph tab.
- AdvantageScope is now more tolerant of unusual log data, including large log files and large field values.
- Various visual glitches have been fixed when browsing log data, especially when using filters on the line graph tab.
- The ordering of AdvantageKit log files in the download window has been fixed; logs without timestamps are now at the bottom of the list, similar to other formats.
