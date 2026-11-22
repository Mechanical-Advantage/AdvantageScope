---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 2D 场地 {#2d-field}

2D 场地选项卡会在场地地图上叠加显示机器人的 2D 视图，同时还支持展示视觉目标状态、参考位姿等额外数据。

<img src="/img/tab-reference/2d-field-1.webp" alt="2D 场地选项卡概览" />

_上图所示为英文界面。_

<details>
<summary>时间轴控制</summary>

时间轴用于控制数据回放和可视化显示。在时间轴上点击即可选中某个时间点，右键点击可取消选择。所选时间点会在所有选项卡之间同步，方便你在其他视图中快速定位到同一时刻。

黄色区域表示机器人处于自动阶段，蓝色区域表示机器人处于遥控阶段，灰色区域表示机器人处于测试模式。

将鼠标悬停在时间轴上并上下滚动即可缩放；按住 `Shift` 并点击拖动可以框选时间范围。在支持横向滚动的设备上水平滚动，或在时间轴上直接点击拖动，即可左右移动视图。实时连接时，向左滚动会解除对当前时间的锁定，一直向右滚动到底则会重新锁定到当前时间。按下 `Ctrl+\` 可一键缩放到机器人处于启用状态的时间段。

<img src="/img/tab-reference/timeline.webp" alt="时间轴" />

</details>

## 相机控制 {#camera-controls}

在场地上上下滚动鼠标滚轮即可缩放，点击并拖动即可平移视图。在场地任意位置右键点击，可打开包含以下选项的相机菜单：

- **未锁定：** 手动控制平移和缩放。
- **锁定（机器人）：** 相机自动平移以跟随机器人移动。
- **锁定（机器人和旋转）：** 相机自动平移并旋转，实时跟随机器人的位置和朝向。

在任一锁定模式下，你仍然可以自由拖动视图将相机移离机器人。无论处于哪种模式，都可以使用控制面板中的方向按钮来旋转相机。

## 添加对象 {#adding-objects}

首先将字段拖入“位姿”区域即可开始使用。点击 X 按钮可删除对象，点击眼睛图标或双击字段名称可暂时隐藏对象。如需移除所有对象，请点击列表标题旁的垃圾桶图标，然后选择 `清除所有字段`。你也可以在列表中点击并拖动对象来调整排列顺序。

**点击彩色图标或右键点击字段名称，即可自定义各个对象。** AdvantageScope 支持丰富的对象类型，其中许多都支持自定义设置（如更改颜色等）。部分对象需要作为子项添加到现有对象下。

:::tip
要查看受支持对象类型的完整列表，请点击 `?` 图标。该列表还会说明每种对象支持的数据类型，以及是否必须作为子项添加。
:::

<img src="/img/tab-reference/2d-field-2.webp" alt="带有对象的 2D 场地" />

## 数据格式 {#data-format}

几何数据需要以字节编码的 Struct 或 protobuf 格式发布，支持多种 2D 和 3D 几何类型，包括 `Pose2d`、`Pose3d`、`Translation2d`、`Translation3d` 等。

WPILib、AdvantageKit 等众多库均支持 Struct 格式。以下示例代码演示了如何记录 2D 位姿数据。

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::math::Pose2d poseA;
wpi::math::Pose2d poseB;

wpi::telemetry::Log("MyPose", poseA);
wpi::telemetry::Log("MyPoseArray", std::vector{poseA, poseB});
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
from wpimath import Pose2d
import telemetry

pose_a = Pose2d()
pose_b = Pose2d()

telemetry.log("MyPose", pose_a)
telemetry.log("MyPoseArray", [pose_a, pose_b], element_type=Pose2d)
```

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
// 该协议不支持新版 Struct 格式，但可以通过带 "x"、"y" 和 "heading" 后缀的
// 独立字段来发布位姿值（如下所示）：
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

- **场地：** 选择要使用的场地图像，支持近期所有 FRC 和 FTC 赛季场地。如需添加自定义场地图像，请参阅[自定义资源](/more-features/custom-assets)。
- **方向：** 设置视图面板中场地图像的朝向。
- **大小：** 设置机器人的边长（FRC 为 30/27/24 英寸，FTC 为 18/16/14 英寸）。

:::info
此选项卡使用的坐标系支持自定义，详情请参阅[坐标系](/more-features/coordinate-systems)页面。
:::
