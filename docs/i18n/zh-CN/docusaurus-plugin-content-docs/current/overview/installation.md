---
sidebar_position: 1
---

# 📦 安装

官方支持的 AdvantageScope 版本可直接从 6328 团队获取或通过 WPILib 安装程序获取。此外还提供多个非官方分发版本。

## 6328 团队 {#team-6328}

### 下载：[稳定版](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest)，[预发布版](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

直接从 6328 团队下载 AdvantageScope 可以提供：

- 在其他渠道发布前优先获取最新功能和 Bug 修复。
- 当有新版本可供下载时收到应用内提醒。
- 内置一系列近期 6328 机器人模型，可用于 👀 [3D 场地](/tab-reference/3d-field) 选项卡。

:::note
在 Ubuntu 23.10 或更高版本上运行 AppImage 版本之前，你必须从 releases 页面下载 AppArmor 配置文件并将其复制到 /etc/apparmor.d。
:::

:::info
AdvantageScope 的每个主版本都会在每年 1 月 FRC kickoff 之前发布，版本号与年份对应（例如 v26.0.0 将于 2026 年 1 月发布）。在每次正式发布前的几个月内，可能会面向希望体验新功能并提供反馈的队伍提供 AdvantageScope 的 Beta 和 Alpha 版本。**使用这些预发布版本的队伍可能会遇到稳定版本中不存在的问题和 Bug。**
:::

## WPILib

### 安装：[WPILib 文档](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

WPILib 安装程序包含 AdvantageScope 的近期版本，但可能会落后于可供直接下载的最新版本。有关从 WPILib 版 VSCode 启动 AdvantageScope 的文档可以在 [此处](https://docs.wpilib.org/en/stable/docs/software/dashboards/advantagescope.html) 找到。

## 非官方分发版

来自多个来源的非官方 AdvantageScope 分发版并非由 AdvantageScope/WPILib 开发者官方支持。这些分发版可能会落后于官方提供的最新 AdvantageScope 版本。如果遇到问题，请直接与相关维护者联系。

- [**适用于 REV 控制系统的 AdvantageScope Lite：**](https://github.com/j5155/AdvantageScope-Lite-FTC) [AdvantageScope Lite](/more-features/advantagescope-lite) 的修改版，用于现有（Systemcore 之前）的 FTC 控制系统。
- [**Homebrew 安装程序：**](https://formulae.brew.sh/cask/advantagescope) 用于在 macOS 上通过命令行安装 AdvantageScope 的 Homebrew cask。
- [**Arch User Repository：**](https://aur.archlinux.org/packages/advantagescope) 配合 pacman 包管理器使用的另一种分发方式（官方 Arch 版 AdvantageScope 可在 [此处](#6328-downloads) 获取）。
