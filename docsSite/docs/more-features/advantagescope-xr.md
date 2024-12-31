---
sidebar_position: 1
---

import Image1 from "./img/xr-1.png";
import Image2 from "./img/xr-2.png";

# AdvantageScope XR

:::warning
AdvantageScope XR is an experimental feature, and may not function properly on all devices. Please report any problems via the [GitHub issues page](https://github.com/Mechanical-Advantage/AdvantageScope/issues), though note that during the season we always prioritize bug fixes that affect non-experimental features.
:::

AdvantageScope XR brings the 👀 [3D Field](/tab-reference/3d-field) view to life in augmented reality, enabling you to visualize data in all new ways. See a simulated auto in life size, review match strategy with a tabletop field model, overlay diagnostic information on a real robot, and so much more! The video below demonstrates several use cases for this feature:

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/gWPhQyB66DQ" title="AdvantageScope XR: Feature Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Requirements

- **Host:** The AdvantageScope desktop application on Windows, macOS, or Linux (v4.1.0 or later). Any firewalls on the device should be [disabled](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/windows-firewall-configuration.html#disabling-windows-firewall).
- **Client:** An iPhone or iPad running iOS/iPadOS 16 or later. No app installation is required.
- **Network:** Both devices must be connected to the same network (Wi-Fi, USB tethering, etc). Subject to the requirement below, this network does not need to be connected to the internet.
- **Internet:** If AdvantageScope XR has not been used recently, the mobile device must have an internet connection (e.g. cellular data). To eliminate this requirement, check the [offline usage](#offline-usage) section below.

:::tip
AdvantageScope XR is supported on many iPhone and iPad models, but is more stable for devices with a **LiDAR sensor**. This includes the iPhone Pro (starting with the iPhone 12 Pro) and iPad Pro (spring 2020 or later).
:::

<details>
<summary>What about other platforms?</summary>

AdvantageScope XR is only supported on iOS and iPadOS. We do not have any immediate plans to support alternative platforms. The client application requires tight integration with native APIs for augmented reality, video recording, web rendering, and more. We chose to prioritize iOS and iPadOS development and support for several reasons:

- **Consistency:** AdvantageScope XR is a demanding application. While Android devices vary widely in processing power and features, the iPhone and iPad provide a consistent development experience across generations. All recent iOS and iPadOS devices are powerful enough to run AdvantageScope XR, and newer devices support additional features AdvantageScope can utilize (such as LiDAR).

- **Availability:** The iPhone remains the most common smartphone that students in the United States are likely to own or have easily accessible from peers, and is more widely available than any model of VR or mixed reality headset. Supporting iOS maximizes the number of users who have easy access to AdvantageScope XR.

- **Tablet Support:** We think many users will want to take advantage of running AdvantageScope XR on a tablet, since tablets provide a larger display that is easier for multiple people to see at once. iPad is the most commonly used tablet worldwide, so supporting iPadOS makes the tablet experience as accessible as possible.

</details>

## Setup

1. On the host system, **click the "XR" button** on any 3D field tab. Only one XR host session may be active at the same time, so clicking this button will interrupt any other active sessions.

<img src={Image1} alt="XR button" height="450" />

2. The **XR controls window** will open, with a QR code and [options](#options) to customize the AR experience. To cancel the XR session and disconnect any clients, close the controls window.

<img src={Image2} alt="XR window" height="350" />

3. Scan the QR code using the **built-in camera app** on the client device. No app installation is required.
4. Tap "AdvantageScope XR" and then "Open" to **start the experience** and connect to the host. If prompted, allow AdvantageScope XR to access the **camera and local network**.
5. Follow the instructions on the device to **calibrate and position the field model**.
6. Control the field model as normal using the host device, including **log playback and live streaming**. The state of the field model is displayed live on the client device.
7. To quickly **record a video**, tap the "Record" icon at the top of the screen. Tap it again to stop recording, then edit and save the clip.

:::warning
Heatmaps, swerve states, and Zebra labels are not available yet in XR. All other object types are supported.
:::

:::tip
AdvantageScope XR is a demanding application, and may experience performance issues depending on the complexity of the 3D scene. Consider using simpler robot models or fewer objects if necessary.
:::

## Options

The XR controls window presents several options that control how the model is displayed in augmented reality:

- **Calibration:**
  - Choose _Miniature_ to visualize a scaled-down version of the field, suitable for tabletop use.
  - Choose _Full-Size_ to visualize the field with accurate scaling, positioned based on a real field barrier. Switching between _Blue Alliance_ and _Red Alliance_ controls which side of the field is used for calibration, but the full field is visualized in all cases.
- **Streaming:**
  - Choose _Smooth_ for applications where some latency is acceptable in exchange for more reliable streaming, such as simulating auto routines or playing back log files.
  - Choose _Low-Latency_ for real-time applications where some jitter is acceptable, such as overlaying data on a real robot or driving a simulated robot in teleop.
- **Show Carpet:** Display the flat carpet model under the field instead of overlaying on a real surface.
- **Show Field:** Display the field model, including the field barrier and game-specific elements. Custom [game piece objects](/tab-reference/3d-field#game-piece-objects) are always displayed.
- **Show Robots:** Display the robot models, can be disabled when overlaying data on a real robot (such as vision targets or 2D mechanisms).

## Offline Usage

AdvantageScope XR does not require an internet connection. To ensure that the app is available offline, download AdvantageScope XR from the App Store using the link below. To connect to the AdvantageScope desktop application, scan the QR code using the iOS camera app or tap the "Scan" button in the AdvantageScope XR app.

[![App Store](./img/app-store.svg)](https://apps.apple.com/us/app/advantagescope-xr/id6739718081)

:::note
Even when running without an internet connection, the host and client devices **must be connected to the same network** (such as a robot, custom Wi-Fi network, or via USB tethering).
:::
