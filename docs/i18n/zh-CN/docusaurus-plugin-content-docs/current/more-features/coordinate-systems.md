---
sidebar_position: 4
---

# 📐 坐标系 {#coordinate-systems}

AdvantageScope 在 [🗺️ 2D 场地](/tab-reference/2d-field) 和 [👀 3D 场地](/tab-reference/3d-field) 选项卡中支持几种常见的坐标系。你可以参阅 [WPILib 坐标系文档](https://docs.wpilib.org/zh-cn/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system)，进一步了解 AdvantageScope 所采用的坐标轴与旋转方向约定。

### 自定义 {#customization}

默认情况下，系统会根据所选的场地图像或模型自动匹配坐标系。如果你想为所有场地统一指定其他坐标系，请点击 `应用程序` > `首选项...` (Windows/Linux) 或 `AdvantageScope` > `设置...` (macOS) 打开首选项窗口，然后修改“坐标系”选项。

:::tip
所有坐标系选项都同时适用于 FRC 和 FTC 场地。
:::

## 中心 / 红方 (Systemcore) {#center-red}

原点位于场地中心，+X 轴背向红方联盟墙，如下图所示。**从 2027 赛季的 FRC 场地以及 2027-2028 赛季的 FTC 场地开始，这将成为默认坐标系。**

<img src="/img/more-features/coordinate-system-center-red.webp" alt="中心/红方坐标系" />

## 蓝方联盟墙 {#blue-wall}

原点位于蓝方联盟墙的最右侧角落，+X 轴面向红方联盟墙，如下图所示。**这是 2023 至 2026 赛季 FRC 场地的默认坐标系。**

<img src="/img/more-features/coordinate-system-blue-wall.webp" alt="蓝方墙坐标系" />

## 联盟墙 {#alliance-wall}

原点位于 _机器人当前所在联盟_ 那一侧联盟墙的最右侧角落，+X 轴面向对面联盟墙，如下图所示。**这是 2022 赛季 FRC 场地的默认坐标系。**

<img src="/img/more-features/coordinate-system-alliance-wall.webp" alt="联盟墙坐标系" />

## 中心 / 旋转 {#center-rotated}

原点位于场地中心；从红方联盟墙的视角看，+X 轴指向右侧，如下图所示。**这是 2024-2025 至 2026-2027 赛季 FTC 场地的默认坐标系。**

<img src="/img/more-features/coordinate-system-center-rotated.webp" alt="中心/旋转坐标系" height="400" />
