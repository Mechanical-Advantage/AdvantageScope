---
sidebar_position: 1
---

# 💡 AdvantageScope Lite

AdvantageScope Lite is a browser-based version of AdvantageScope accessible from the FIRST Driver Station and Systemcore web interface. Most basic features of the AdvantageScope desktop app are included in AdvantageScope Lite. However, several features are omitted due to compatibility restrictions (including some tab types, logging formats, and related features).

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/lHsak9Mmx2M" title="AdvantageScope Lite Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Installation & Assets

AdvantageScope Lite for Systsemcore can be installed and updated by downloading the "Systemcore" version of AdvantageScope from the GitHub releases page. Select the "Add Package" card on the Systemcore web interface to upload the package to the robot.

Asset files (e.g. field/robot models) can be uploaded by choosing `File` > `Upload Asset`. The selected file can either be a zip file for an individual asset, or a zip file containing multiple asset zip files. See the [custom assets](/more-features/custom-assets/) page for more information on asset formats.

:::info
Zip files containing collections of common assets can be downloaded by clicking the links below:

- [**Default FRC assets**](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases/download/bundles-v1/AllAssetsDefaultFRC.zip): FRC fields, FRC example robots, and all joystick layouts.
- [**Default FTC assets**](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases/download/bundles-v1/AllAssetsDefaultFTC.zip): FTC fields, FTC example robots, and all joystick layouts.
- [**FRC 6328 assets**](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases/download/bundles-v1/AllAssetsFRC6328.zip): Assets exclusive to the [Team 6328 distribution](/overview/installation#team-6328) of AdvantageScope.

:::

:::tip
No installation is required to use AdvantageScope Lite in the FIRST Driver Station. Navigate to http://localhost:6768/ascope to connect live or view log files.
:::
