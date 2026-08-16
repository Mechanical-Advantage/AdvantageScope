---
sidebar_position: 1
---

# 📦 安裝 {#installation}

官方支援的 AdvantageScope 版本可直接從 6328 團隊取得或透過 WPILib 安裝程式取得。此外還提供多個非官方發行版本。

## 6328 團隊 {#team-6328}

### 下載：[穩定版](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest)，[預先發布版](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

直接從 6328 團隊下載 AdvantageScope 可以提供：

- 在其他管道發布前優先取得最新功能與 Bug 修復。
- 當有新版本可供下載時收到應用程式內提醒。
- 內建一系列近期 6328 機器人模型，可用於 👀 [3D 場地](/tab-reference/3d-field) 分頁。

:::note
在 Ubuntu 23.10 或更高版本上執行 AppImage 版本之前，您必須從 releases 頁面下載 AppArmor 設定檔並將其複製到 /etc/apparmor.d。
:::

:::info
AdvantageScope 的每個主要版本都會在每年 1 月 FRC kickoff 之前發布，版本號與年份對應（例如 v26.0.0 已於 2026 年 1 月發布）。在每次正式發布前的幾個月內，可能會面向希望體驗新功能並提供回饋的隊伍提供 AdvantageScope 的 Beta 與 Alpha 版本。**使用這些預先發布版本的隊伍可能會遇到穩定版本中不存在的問題與 Bug。**
:::

## WPILib {#wpilib}

### 安裝：[WPILib 文件](https://docs.wpilib.org/zh-cn/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

WPILib 安裝程式包含 AdvantageScope 的近期版本，但可能會落後於可供直接下載的最新版本。有關從 WPILib 版 VSCode 啟動 AdvantageScope 的文件可以在[此處](https://docs.wpilib.org/zh-cn/stable/docs/software/dashboards/advantagescope.html)找到。

## 非官方發行版 {#unofficial-distributions}

來自多個來源的非官方 AdvantageScope 發行版並非由 AdvantageScope/WPILib 開發人員官方支援。這些發行版可能會落後於官方提供的最新 AdvantageScope 版本。如果遇到問題，請直接與相關維護者聯絡。

- [**適用於 REV 控制系統的 AdvantageScope Lite：**](https://github.com/j5155/AdvantageScope-Lite-FTC) [AdvantageScope Lite](/more-features/advantagescope-lite) 的修改版，用於現有（Systemcore 之前）的 FTC 控制系統。
- [**Homebrew 安裝程式：**](https://formulae.brew.sh/cask/advantagescope) 用於在 macOS 上透過命令列安裝 AdvantageScope 的 Homebrew cask。
- [**Arch User Repository：**](https://aur.archlinux.org/packages/advantagescope) 配合 pacman 套件管理員使用的另一種發行方式（官方 Arch 版 AdvantageScope 可在[此處](#6328-downloads)取得）。
