---
sidebar_position: 1
---

# 💡 AdvantageScope Lite

:::warning
AdvantageScope Lite is only available in the 2027 (v27.x) releases of AdvantageScope on the SystemCore control system. An [unofficial distribution](/overview/installation#unofficial-distributions) is available for use on the REV Control Hub, but is not supported by the AdvantageScope/WPILib developers.
:::

AdvantageScope Lite is an upcoming browser-based version of AdvantageScope accessible from the SystemCore web interface and intended for on-robot development. Most features of the AdvantageScope desktop app are included in AdvantageScope Lite, with the following **omissions**:

- Downloading & viewing local log files: log files can be opened _directly_ from SystemCore and accessed in the browser, but they cannot be saved for offline use.
- Support for some logging formats, including [Hoot](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) and [Phoenix Diagnostics](/overview/live-sources/phoenix-diagnostics).
- Pop-out visualization windows (viewing multiple tabs at once).
- Exporting and importing tab layouts from a JSON file.
- All features of the [video tab](/tab-reference/video).
- Integration with [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/lHsak9Mmx2M" title="AdvantageScope Lite Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Installation

AdvantageScope Lite can be installed and updated by downloading the "SystemCore" version of AdvantageScope from the GitHub releases page. Additional assets (e.g. robot models) can be manually placed in the `/home/systemcore/ascope_assets` directory.
