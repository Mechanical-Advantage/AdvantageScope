---
sidebar_position: 1
---

# 💡 AdvantageScope Lite

:::warning
AdvantageScope Lite is only available in the 2027 (v27.x) releases of AdvantageScope on the Systemcore control system. An [unofficial distribution](/overview/installation#unofficial-distributions) is available for use on the existing FTC control system, but is not supported by the AdvantageScope/WPILib developers.
:::

AdvantageScope Lite is an upcoming browser-based version of AdvantageScope accessible from the Systemcore web interface and intended for on-robot development. Most features of the AdvantageScope desktop app are included in AdvantageScope Lite, with the following **omissions**:

- Downloading and viewing local log files: log files can be opened _directly_ from Systemcore and accessed in the browser, but they cannot be saved for offline use.
- Support for some logging formats, including [Hoot](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html), REVLOG, and [Phoenix Diagnostics](/overview/live-sources/phoenix-diagnostics).
- Pop-out visualization windows (viewing multiple tabs at once).
- Exporting and importing tab layouts from a JSON file.
- All features of the [video tab](/tab-reference/video).
- Integration with [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/lHsak9Mmx2M" title="AdvantageScope Lite Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Installation & Assets

AdvantageScope Lite can be installed and updated by downloading the "Systemcore" version of AdvantageScope from the GitHub releases page. Select the "Add Package" card on the Systemcore web interface to upload the package to the robot.

Asset files (e.g. field/robot models) can be uploaded by choosing `File` > `Upload Asset`. The selected file can either be a zip file for an individual asset, or a zip file containing multiple asset zip files. See the [custom assets](/more-features/custom-assets/) page for more information on asset formats.

:::info
Zip files containing collections of common assets can be downloaded by clicking the links below:

- [**Default FRC assets**](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases/download/bundles-v1/AllAssetsDefaultFRC.zip): FRC fields, FRC example robots, and all joystick layouts.
- [**Default FTC assets**](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases/download/bundles-v1/AllAssetsDefaultFTC.zip): FTC fields, FTC example robots, and all joystick layouts.
- [**FRC 6328 assets**](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases/download/bundles-v1/AllAssetsFRC6328.zip): Assets exclusive to the [Team 6328 distribution](/overview/installation#team-6328) of AdvantageScope.

:::
