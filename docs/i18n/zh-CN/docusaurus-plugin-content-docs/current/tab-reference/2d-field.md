---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 2D 场地 {#2d-field}

2D 场地选项卡展示了叠加在场地地图上的机器人 2D 可视化效果。它还可以显示诸如视觉目标状态和参考位姿等额外数据。

<img src="/img/tab-reference/2d-field-1.webp" alt="2D 场地标签页概述" />

_上图所示为英文界面。_

<details>
<summary>时间轴控制</summary>

时间轴用于控制播放和可视化。在时间轴上点击可选择时间，右键单击可取消选择。所选时间将在所有选项卡中同步，从而可以轻松地在其他视图中快速找到此位置。

黄色区域表示机器人处于自动阶段，蓝色区域表示机器人处于遥控阶段，灰色区域表示机器人处于测试模式。

要进行缩放，请将光标置于时间轴上方并向上或向下滚动。按住 `Shift` 的同时点击并拖动也可以选择一个范围。通过水平滚动（在受支持的设备上）或在时间轴上点击并拖动来左右移动。当进行实时连接时，向左滚动会解锁与当前时间的关联，而一路向右滚动将重新锁定到当前时间。按下 `Ctrl+\` 可缩放到机器人处于启用状态的时间段。

<img src="/img/tab-reference/timeline.webp" alt="时间轴" />

</details>

## 添加对象 {#adding-objects}

要开始使用，请将字段拖动到“位姿”部分。使用 X 按钮删除对象，或通过点击眼睛图标或双击字段名称临时隐藏它。要移除所有对象，请点击轴标题附近的垃圾桶图标，然后点击 `清除所有字段`。可以在列表中通过点击并拖动来重新排列对象。

**要自定义每个对象，请点击彩色图标或右键单击字段名称。** AdvantageScope 支持大量对象类型，其中许多类型都可以进行自定义（例如更改颜色）。某些对象必须作为子项添加到现有对象中。

:::tip
要查看受支持对象类型的完整列表，请点击 `?` 图标。该列表还包含受支持的数据类型以及对象是否必须作为子项添加。
:::

<img src="/img/tab-reference/2d-field-2.webp" alt="带有对象的 2D 场地" />

## 数据格式 {#data-format}

几何数据应作为字节编码的结构体或 protobuf 进行发布。支持各种 2D 和 3D 几何类型，包括 `Pose2d`、`Pose3d`、`Translation2d`、`Translation3d` 等。

许多库都支持结构体格式，包括 WPILib 和 AdvantageKit。下面的示例代码展示了如何在 Java 中记录 2D 位姿数据。

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

StructPublisher<Pose2d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose2d.struct).publish();
StructArrayPublisher<Pose2d> arrayPublisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyPoseArray", Pose2d.struct).publish();

periodic() {
  publisher.set(poseA);
  arrayPublisher.set(new Pose2d[] {poseA, poseB});
}
```

:::tip
WPILib 的 [`Field2d`](https://docs.wpilib.org/zh-cn/stable/docs/software/dashboards/glass/field2d-widget.html) 类也可以用于将多组 2D 位姿数据记录在一起。
:::

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose2d[] {poseA, poseB});
```

</TabItem>
<TabItem value="ftcdashboard" label="FTC Dashboard">

```java
// 该协议不支持现代结构体格式，但位姿值
// 可以使用带有后缀 "x"、"y" 和 "heading" 的独立字段进行发布
// （如下所示）：
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // 英寸
packet.put("Pose y", 2.8); // 英寸
packet.put("Pose heading", 3.14); // 弧度

// 或者，朝向可以用度为单位发布
packet.put("Pose heading (deg)", 180.0); // 度

// 在此处添加其他遥测值...

FtcDashboard.getInstance().sendTelemetryPacket(packet)

// 或者，使用 MultipleTelemetry 和标准 SDK 遥测：
// 在 OpMode Init 期间：
telemetry = new MultipleTelemetry(telemetry,FtcDashboard.getInstance().getTelemetry());

// 在 Loop 期间：
telemetry.addData("Pose x", 6.3); // 英寸
telemetry.addData("Pose y", 2.8); // 英寸
telemetry.addData("Pose heading", 3.14); // 弧度

// 或...
telemetry.addData("Pose heading (deg)", 180.0); // 度

// 在此处添加其他遥测值...
telemetry.update();
```

</TabItem>
</Tabs>

## 配置 {#configuration}

- **场地：** 要使用的场地图像。支持所有近期 FRC 和 FTC 比赛。要添加自定义场地图像，请参阅 [自定义资源](/more-features/custom-assets)。
- **方向：** 视图面板中场地图像的方向。
- **大小：** 机器人的边长（FRC 为 30/27/24 英寸，FTC 为 18/16/14 英寸）。

:::info
在此选项卡上使用的坐标系是可自定义的。有关详细信息，请参阅 [坐标系](/more-features/coordinate-systems) 页面。
:::
