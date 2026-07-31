---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 Swerve

Swerve 选项卡显示四个 Swerve 模块的状态，包括速度矢量、空闲位置、机器人旋转和底盘速度。

<img src="/img/tab-reference/swerve-1.png" alt="Swerve 选项卡概述" />

<details>
<summary>时间轴控制</summary>

时间轴用于控制播放和可视化。在时间轴上点击可选择时间，右键单击可取消选择。所选时间将在所有选项卡中同步，从而可以轻松地在其他视图中快速找到此位置。

黄色区域表示机器人处于自动阶段，蓝色区域表示机器人处于遥控阶段，灰色区域表示机器人处于测试模式。

要进行缩放，请将光标置于时间轴上方并向上或向下滚动。按住 `Shift` 的同时点击并拖动也可以选择一个范围。通过水平滚动（在受支持的设备上）或在时间轴上点击并拖动来左右移动。当进行实时连接时，向左滚动会解锁与当前时间的关联，而一路向右滚动将重新锁定到当前时间。按下 `Ctrl+\` 可缩放到机器人处于启用状态的时间段。

<img src="/img/tab-reference/timeline.png" alt="时间轴" />

</details>

## 添加数据源

要开始使用，请将字段拖动到“来源”部分。使用 X 按钮删除数据源，或通过点击眼睛图标或双击字段名称临时隐藏它。要移除所有数据源，请点击轴标题附近的垃圾桶图标，然后点击 `清除所有字段`。可以在列表中通过点击并拖动来重新排列数据源。

**要自定义每个数据源，请点击彩色图标或右键单击字段名称。** AdvantageScope 支持三种数据源类型：

- **模块速度：** 一组四个 Swerve 模块状态，在图示上显示为矢量。
- **机器人速度：** 在图示中心显示的线速度和角速度。
- **旋转：** 用于旋转图示的角度位置。

## 数据格式

数据应作为字节编码的结构体或 protobuf 进行发布，使用 `SwerveModuleState[]`、`ChassisSpeeds`、`Rotation2d` 或 `Rotation3d` 类型。

许多库都支持结构体格式，包括 WPILib 和 AdvantageKit。下面的示例代码展示了如何在 Java 中记录 Swerve 模块状态。

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
}

StructArrayPublisher<SwerveModuleVelocity> publisher = NetworkTableInstance.getDefault()
.getStructArrayTopic("MyStates", SwerveModuleVelocity.struct).publish();

periodic() {
  publisher.set(states);
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
}

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

## 配置

提供以下配置选项：

- **最大速度：** 模块可达到的最大速度，用于调整矢量的大小。
- **框架尺寸：** 左右和前后 Swerve 模块之间的距离。改变机器人图示的宽高比。
- **方向：** 调整机器人图示指向的方向。此选项通常有助于与位姿数据或比赛视频保持一致。

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
