---
sidebar_position: 4
---

# 📐 坐标系 {#coordinate-systems}

AdvantageScope 在 [🗺️ 2D 场地](/tab-reference/2d-field) 和 [👀 3D 场地](/tab-reference/3d-field) 选项卡上支持几种常见的坐标系。请参阅 [WPILib 坐标系文档](https://docs.wpilib.org/zh-cn/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system) 以了解有关 AdvantageScope 所使用的轴与旋转约定的更多信息。

### 自定义 {#customization}

默认情况下，坐标系是根据所选场地图像/模型自动选择的。要在所有场地上使用不同的坐标系，请点击 `应用程序` > `显示首选项...` (Windows/Linux) 或 `AdvantageScope` > `设置...` (macOS) 打开首选项窗口，并更改“坐标系”选项。

:::tip
所有坐标系选项均兼容 FRC 和 FTC 场地。
:::

## 中心 / 红色 (Systemcore) {#center-red}

原点位于场地中心，+X 轴背向红方联盟墙，如下图所示。**这是自 2027 年起的 FRC 场地以及自 2027-2028 赛季起的 FTC 场地的默认坐标系。**

<img src="/img/more-features/coordinate-system-center-red.webp" alt="中心/红方坐标系" />

## 蓝方联盟墙 {#blue-wall}

原点位于蓝方联盟墙的最右侧角，+X 轴面向红方联盟墙，如下图所示。**这是 2023 至 2026 年 FRC 场地的默认坐标系。**

<img src="/img/more-features/coordinate-system-blue-wall.webp" alt="蓝方墙坐标系" />

## 联盟墙 {#alliance-wall}

原点位于 _机器人当前联盟_ 的联盟墙的最右侧角，+X 轴面向对侧联盟墙，如下图所示。**这是 2022 年 FRC 场地的默认坐标系。**

<img src="/img/more-features/coordinate-system-alliance-wall.webp" alt="联盟墙坐标系" />

## 中心 / 旋转 {#center-rotated}

原点位于场地中心，从红方联盟墙的视角看 +X 轴指向右侧，如下图所示。**这是 2024-2025 至 2026-2027 赛季 FTC 场地的默认坐标系。**

<img src="/img/more-features/coordinate-system-center-rotated.webp" alt="中心/旋转坐标系" height="400" />
