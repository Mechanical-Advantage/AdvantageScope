---
sidebar_position: 1
---

# 📦 Installation

The officially supported version of AdvantageScope is available directly from Team 6328 or through the WPILib installer. Several unofficial distributions are also available.

## Team 6328

### Downloads: [Stable](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest), [Prerelease](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

Downloading AdvantageScope directly from Team 6328 provides:

- The latest features and bug fixes before they are available through other channels.
- In-app alerts when a new version is available to download.
- A built-in collection of recent 6328 robot models for use on the 👀 [3D Field](/tab-reference/3d-field) tab.

:::note
Before running AppImage builds on Ubuntu 23.10 or later, you must download the AppArmor profile from the releases page and copy it to /etc/apparmor.d.
:::

:::info
Each major version of AdvantageScope is released in January before the FRC kickoff, with a version number corresponding to the year (e.g. v26.0.0 will be released in January 2026). Beta and alpha versions of AdvantageScope may be available in the months leading up to each release, for teams who wish to experiment with new features and provide feedback. **Teams using these prelease versions should expect to see issues and bugs not present in stable releases.**
:::

## WPILib

### Installation: [WPILib Docs](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

The WPILib installer includes a recent release of AdvantageScope, but may lag behind the latest version available for direct download. Documentation for launching AdvantageScope from the WPILib version of VSCode can be found [here](https://docs.wpilib.org/en/stable/docs/software/dashboards/advantagescope.html).

## Unofficial Distributions

Unofficial distributions of AdvantageScope are available from several sources, which are not officially supported by the AdvantageScope/WPILib developers. These distributions may lag behind the latest version of AdvantageScope available from official sources. Please contact the maintainers directly in case of issues.

- [**AdvantageScope Lite for REV Control System:**](https://github.com/j5155/AdvantageScope-Lite-FTC) A modification of [AdvantageScope Lite](/more-features/advantagescope-lite) for use on the existing (pre-Systemcore) FTC control system.
- [**Homebrew Installer:**](https://formulae.brew.sh/cask/advantagescope) A Homebrew cask for installing AdvantageScope from the command line on macOS.
- [**Arch User Repository:**](https://aur.archlinux.org/packages/advantagescope) An alternative distribution method for use with the pacman package manager (an official Arch distribution of AdvantageScope is available [here](#6328-downloads)).
