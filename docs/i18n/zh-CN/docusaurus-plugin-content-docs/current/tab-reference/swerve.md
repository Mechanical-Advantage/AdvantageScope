---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 Swerve {#swerve}

Swerve 选项卡用于显示四个 Swerve 模块的实时状态，包括速度矢量、空闲位置、机器人旋转角度以及底盘速度。

<img src="/img/tab-reference/swerve-1.webp" alt="Swerve 选项卡概览" />

_上图所示为英文界面。_

<details>
<summary>时间轴控制</summary>

时间轴用于控制播放和可视化进度。点击时间轴可选中某个时间点，右键点击则取消选中。选中的时间点会在所有选项卡之间同步，方便你在其他视图中快速定位。

黄色区段表示机器人处于自动阶段，蓝色区段表示遥控阶段，灰色区段表示测试模式。

将光标置于时间轴上方并上下滚动即可缩放，也可以按住 `Shift` 键的同时点击并拖动来框选范围。通过水平滚动（在受支持的设备上）或在时间轴上点击并拖动即可左右平移。在实时连接状态下，向左滚动会解除对当前时间的锁定，向右滚动到底则会重新锁定到当前时间。按下 `Ctrl+\` 可快速缩放到机器人处于启用状态的时间段。

<img src="/img/tab-reference/timeline.webp" alt="时间轴" />

</details>

## 添加数据源 {#adding-sources}

将字段拖入“来源”区域即可开始使用。点击 X 按钮可删除数据源，点击眼睛图标或双击字段名称可临时隐藏它。要移除所有数据源，请点击标题旁的垃圾桶图标，然后选择 `全部清除`。你还可以在列表中点击并拖动数据源来调整顺序。

**点击彩色图标或右键点击字段名称，即可自定义每个数据源的显示效果。** AdvantageScope 支持三种数据源类型：

- **模块速度：** 一组四个 Swerve 模块的状态，在图示上显示为速度矢量。
- **机器人速度：** 在图示中心显示的线速度和角速度。
- **旋转：** 用于旋转机器人图示的角度位置。

## 数据格式 {#data-format}

数据应以字节编码的结构体或 protobuf 形式发布，使用 `SwerveModuleVelocity[]`、`ChassisVelocities`、`Rotation2d` 或 `Rotation3d` 类型。

包括 WPILib 和 AdvantageKit 在内的许多库都支持结构体格式。以下示例展示了如何在 Java 中记录 Swerve 模块状态。

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Telemetry.log("MyStates", states);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

:::note
自 2027 赛季起，该数据结构已从 `SwerveModuleState` 重命名为 `SwerveModuleVelocity`。
对于在 WPILib 2027 和 Systemcore 之前生成的日志文件，仍支持使用旧的 `SwerveModuleState` 类型进行可视化。
:::

## 配置 {#configuration}

可用的配置选项如下：

- **最大速度：** 模块可达到的最大速度，用于缩放速度矢量的显示长度。
- **车架尺寸：** 左右和前后 Swerve 模块之间的距离，用于调整机器人图示的宽高比。
- **方向：** 调整机器人图示的朝向。该选项通常用于使图示方向与位姿数据或比赛视频保持一致。

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
