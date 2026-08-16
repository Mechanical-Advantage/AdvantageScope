---
sidebar_position: 1
---

# ✴️ FTC Compatibility {#ftc-compatibility}

AdvantageScope includes features to provide a smooth experience on the existing FIRST Tech Challenge control system, while setting up a transition to [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) in future seasons. All features of AdvantageScope will be officially supported in FTC after the transition to Systemcore starting in the 2027-2028 season.

## Fields & Robots {#fields-and-robots}

FTC fields and robot models are fully supported natively.

- **Field & Robot Models:** Select FTC fields and robot models on the 🗺️ [2D Field](/tab-reference/2d-field) and 👀 [3D Field](/tab-reference/3d-field) tabs directly from the dropdown menus. All fields are compatible with [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- **Coordinate Systems:** Configure the [coordinate system](/more-features/coordinate-systems) for compatibility with [standard FTC coordinates](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) on any field. This coordiante system is used by default on FTC fields.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## Supported Formats {#supported-formats}

AdvantageScope includes native support for the **FTC Dashboard** live streaming format and **Road Runner** `.log` files, in addition to WPILib-compatible formats such as WPILOG and NetworkTables.

Several third-party FTC logging and telemetry libraries produce data in formats compatible with AdvantageScope. The AdvantageScope developers do not endorse or recommend any particular FTC logging solution, and you may encounter limited capabilities when using some logging solutions.

The list below provides a starting point but is not exhaustive:

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): Generates log files to debug path planning logic.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/): Streams live telemetry compatible with both its own dashboard and AdvantageScope.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): Enables custom data logging to multiple formats, including log files and live streaming.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): Saves data to the WPILOG format using annotations.
- **PsiKit**: A logging and replay framework for FTC inspired by AdvantageKit.

:::warning
Teams should take care to comply with R704 while at competition. Third-party telemetry services such as FTC Dashboard are prohibited when connected over Wi-Fi at competitions.
:::

### AdvantageScope Lite for FTC {#advantagescope-lite-for-ftc}

An unofficial distribution of [AdvantageScope Lite](/more-features/advantagescope-lite) optimized for FTC is available: [**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). This distribution is unofficial and is not supported by the AdvantageScope developers.

While the standard [AdvantageScope Lite](/more-features/advantagescope-lite) is a web app designed for use on Systemcore and the FIRST Driver Station, the unofficial FTC distribution is specifically modified for use directly on the existing FTC control system. It natively supports live viewing data over the FTC Dashboard protocol without the need for additional software.
