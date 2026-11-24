---
sidebar_position: 1
---

# 📦 安裝 {#installation}

官方支援的 AdvantageScope 可直接從 6328 團隊下載，或透過 WPILib 安裝程式取得；另外也有數個非官方發行版。

## 6328 團隊 {#team-6328}

### 下載：[穩定版](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest)，[預先發布版](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

直接從 6328 團隊下載 AdvantageScope 的優點如下：

- 搶先在其他管道發布前取得最新功能與 Bug 修復。
- 有新版本可供下載時，會在應用程式內收到通知。
- 內建近期 6328 機器人模型，可用於 👀 [3D 場地](/tab-reference/3d-field) 分頁。

:::note
在 Ubuntu 23.10 或更新版本上執行 AppImage 之前，你必須先從 releases 頁面下載 AppArmor 設定檔並複製到 `/etc/apparmor.d`。
:::

:::info
AdvantageScope 每年都會在 1 月 FRC 開賽 (kickoff) 前發布主要版本，版本號對應年份（例如 v26.0.0 於 2026 年 1 月發布）。在正式發布前的幾個月內，我們可能會提供 Beta 與 Alpha 版本，讓想搶先體驗新功能並提供回饋的隊伍試用。**使用這些預先發布版本時，可能會遇到穩定版中沒有的問題與 Bug。**
:::

## WPILib {#wpilib}

### 安裝：[WPILib 文件](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

WPILib 安裝程式內含近期版本的 AdvantageScope，但版本可能會比直接下載的最新版稍微落後。關於如何從 WPILib 版 VSCode 啟動 AdvantageScope，請參閱[這份文件](https://docs.wpilib.org/en/stable/docs/software/dashboards/advantagescope.html)。

## 非官方發行版 {#unofficial-distributions}

網路上還有數個非官方來源的 AdvantageScope 發行版，這些版本不受 AdvantageScope 或 WPILib 開發團隊官方支援，更新進度也可能落後於官方最新版本。若遇到問題，請直接聯絡該發行版的維護者。

- [**適用於 REV 控制系統的 AdvantageScope Lite：**](https://github.com/j5155/AdvantageScope-Lite-FTC) [AdvantageScope Lite](/more-features/advantagescope-lite) 的修改版，適用於現有（Systemcore 之前）的 FTC 控制系統。
- [**Homebrew 安裝程式：**](https://formulae.brew.sh/cask/advantagescope) 用於在 macOS 上透過命令列安裝 AdvantageScope 的 Homebrew cask。
- [**Arch User Repository：**](https://aur.archlinux.org/packages/advantagescope) 配合 pacman 套件管理員使用的另一種發行方式（官方 Arch 版 AdvantageScope 可在[此處](#6328-downloads)取得）。
- [**FRC-Nix：**](https://github.com/frc4451/frc-nix) 一組與 FIRST 相關的 Nix 套件與宣告式 NixOS 模組，其中包含 AdvantageScope，適用於 Nix 套件管理員與 NixOS Linux 發行版。
