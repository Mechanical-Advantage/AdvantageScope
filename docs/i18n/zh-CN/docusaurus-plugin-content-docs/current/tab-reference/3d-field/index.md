import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 👀 3D 场地 {#3d-field}

3D 场地视图以三维形式展示机器人和比赛场地。它不仅适用于常规 2D 位姿，在进行 3D 计算（如利用 AprilTag 进行视觉定位）时更是格外实用。视图支持多种相机模式，包括相对场地、相对机器人以及固定视角。[AdvantageScope XR](advantagescope-xr) 还支持通过增强现实来查看此选项卡。时间轴会标示机器人的启用时段，并可用于在日志数据中快速跳转。

<img src="/img/tab-reference/3d-field/3d-field-1.webp" alt="3D 场地选项卡示例" />

_上图所示为英文界面。_

<details>
<summary>时间轴控制</summary>

时间轴用于控制数据回放和可视化显示。在时间轴上点击即可选中某个时间点，右键点击可取消选择。所选时间点会在所有选项卡之间同步，方便你在其他视图中快速定位到同一时刻。

黄色区域表示机器人处于自动阶段，蓝色区域表示机器人处于遥控阶段，灰色区域表示机器人处于测试模式。

将鼠标悬停在时间轴上并上下滚动即可缩放；按住 `Shift` 并点击拖动可以框选时间范围。在支持横向滚动的设备上水平滚动，或在时间轴上直接点击拖动，即可左右移动视图。实时连接时，向左滚动会解除对当前时间的锁定，一直向右滚动到底则会重新锁定到当前时间。按下 `Ctrl+\` 可一键缩放到机器人处于启用状态的时间段。

<img src="/img/tab-reference/timeline.webp" alt="时间轴" />

</details>

:::warning 2026-2027 FTC 场地
2026-2027 FTC 场地模型不包含内置 AprilTag，因为比赛过程中巢箱 (hive) 上的标签位置可能会发生变化。队伍可以发布 `Pose3d[]` 和 `number[]` 数据，在场地上添加动态 AprilTag 对象。该场地使用的 AprilTag 正确尺寸为 **3.25 英寸**。
:::

:::warning 2026 FRC 场地
2026 FRC 场地模型与**焊接版**场地的 AprilTag 布局一致。焊接版和 AndyMark 场地之间的差异非常微小，但在基于 AndyMark 场地布局可视化 AprilTag 位姿时，可能会出现轻微（约 0.5 英寸）的偏差。
:::

## 添加对象 {#adding-objects}

首先将字段拖入“位姿”区域即可开始使用。点击 X 按钮可删除对象，点击眼睛图标或双击字段名称可暂时隐藏对象。如需移除所有对象，请点击列表标题旁的垃圾桶图标，然后选择 `清除所有字段`。你也可以在列表中点击并拖动对象来调整排列顺序。

**点击彩色图标或右键点击字段名称，即可自定义各个对象。** AdvantageScope 支持丰富的对象类型，其中许多都支持自定义设置（如更改颜色和机器人模型等）。部分对象需要作为子项添加到现有对象下。

:::tip
要查看受支持对象类型的完整列表，请点击 `?` 图标。该列表还会说明每种对象支持的数据类型，以及是否必须作为子项添加。
:::

:::info
AdvantageScope 支持用于 FTC 场地的多种尺寸 AprilTag。尺寸按 **AprilTag 黑色区域的边长**计算，不包含外围必需的白色边框。
:::

## 数据格式 {#data-format}

几何数据需要以字节编码的 Struct 或 protobuf 格式发布，支持多种 2D 和 3D 几何类型，包括 `Pose2d`、`Pose3d`、`Translation2d`、`Translation3d` 等。

WPILib、AdvantageKit 等众多库均支持 Struct 格式。以下示例代码演示了如何在 Java 中记录 3D 位姿数据。

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", poseA, poseB);
Telemetry.log("MyPoseArray", new Pose3d[] {poseA, poseB});
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose3d[] {poseA, poseB});
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
```

</TabItem>
</Tabs>

## 机构与组件 {#mechanisms-and-components}

机构数据可以通过 2D 机构或 3D 关节组件进行可视化。

### 2D 机构 {#2d-mechanisms}

要可视化使用 [`Mechanism2d`](https://docs.wpilib.org/zh-cn/stable/docs/software/dashboards/glass/mech2d-widget.html) 记录的机构数据，请将机构字段添加到现有的机器人或幽灵模型对象下。系统会使用简化的方框，将机构投影到机器人的 XZ 或 YZ 平面上（如下图所示）。点击齿轮图标或右键点击字段名称，即可在 XZ 和 YZ 平面之间切换。机器人的原点位于机构底边的中心。

<img src="/img/tab-reference/3d-field/3d-field-2.webp" alt="2D 机构" />

### 3D 组件 {#3d-components}

:::warning
配置 3D 组件通常较为复杂且耗时。建议优先考虑使用上文介绍的 AdvantageScope `Mechanism2d` 支持，它能以更简便的方式在 3D 场地中展示机构。
:::

通过记录一组表示各组件相对机器人位置的 3D 位姿，即可使用关节组件来可视化机构。将这些位姿添加到现有的机器人或幽灵模型对象下，并将对象类型设为“组件”即可。

每个组件都可以独立运动（例如升降机滑台、机械臂或末端执行器）。AdvantageKit 用户可以使用 [`generate3dMechanism()`](https://docs.advantagekit.org/data-flow/supported-types#mechanisms-output-only) 方法将 Mechanism2d 转换为 Pose3d 对象数组。有关配置带组件机器人的更多信息，请参阅[自定义资源](/more-features/custom-assets)。

<img src="/img/tab-reference/3d-field/3d-field-3.webp" alt="3D 机构" />

## 游戏元素对象 {#game-piece-objects}

每个场地都内置了对应的游戏元素对象类型，可根据机器人代码发布的数据在场地任意位置渲染游戏元素。这有多种实用场景，包括：

- 使用简单动画可视化自动阶段仿真例程的动作
- 展示在场地上识别到的游戏元素位置
- 指示游戏元素当前在机器人内部的位置
- 根据物理计算预览发射轨迹

另一个常见用法是根据传感器数据展示游戏元素在机器人内部的状态。例如，在 2024 赛季机器人的 Note 通道中，当光电开关触发时，即可让 Note 显示出来（如下图所示）。

<details>
<summary>代码示例</summary>

AdvantageKit KitBot 2024 示例项目包含一个简单的[命令](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/util/NoteVisualizer.java)示例，可通过动画演示 Note 从机器人飞向 Speaker 的过程。该命令已集成到标准的[发射序列](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/subsystems/launcher/Launcher.java#L73)中，每次发射 Note 时都会触发动画。[这段视频](https://youtube.com/shorts/-HxfDo9f19U?feature=share)展示了如何利用游戏元素动画来可视化多个不同赛季的自动阶段例程。

</details>

<img src="/img/tab-reference/3d-field/3d-field-4.webp" alt="2024 KitBot Note 可视化" />

## 相机选项 {#camera-options}

右键点击渲染的场地视图即可切换相机模式。每个弹出窗口的相机模式和位置均可独立控制，方便轻松搭建多视角画面。

:::info
右键点击场地视图并选择“设置视野...”，即可调整环绕相机和操控站相机的视野 (FOV)。
:::

### 环绕场地 {#orbit-field}

这是默认的相机模式，相机可相对于场地自由移动。**左键点击并拖动**可旋转相机，**右键点击并拖动**可平移相机，**滚动滚轮**可放大或缩小。

:::tip
相机也支持键盘控制：**WASD** 键用于水平平移，**IJKL** 键用于旋转视角，**E** 和 **Q** 键用于垂直升降。
:::

### 环绕机器人 {#orbit-robot}

此模式的控制方式与“环绕场地”相同，但相机位置会锁定为相对机器人固定，从而实现“跟拍”机器人运动的效果。

### 操控站 {#driver-station}

此模式将相机锁定在其中一个操控站后方的正常视线高度。你可以手动选择要观察的操控站，或选择“自动”以直接读取日志中记录的联盟与操控站编号。

:::warning
查看 AdvantageKit 2023 或更早版本生成的日志数据时，自动选择操控站编号可能不够准确。
:::

### 固定相机 {#fixed-camera}

每个机器人模型都配置了一组固定相机（如视觉相机和驾驶员相机），它们具有固定的安装位置、宽高比和 FOV。这些视角常用于检查视觉识别数据或模拟驾驶员第一视角。下方示例展示了一个驾驶员相机视图。

<img src="/img/tab-reference/3d-field/3d-field-5.webp" alt="固定相机" />

如果提供了“相机覆盖”位姿，它会替换所有固定相机的默认位姿，同时保留各自配置的 FOV 和宽高比。这样机器人代码就能传入可动相机（例如安装在转塔或发射罩上的相机）的实时位姿。

:::info
与其他位姿数据一致，“相机覆盖”位姿必须**相对场地**，而非相对机器人。
:::

## 配置 {#configuration}

可通过下拉菜单选择场地模型，支持近期所有 FRC 和 FTC 赛季场地。对于图形性能有限的设备，建议使用“常青”场地。“坐标轴”场地仅在原点显示 XYZ 坐标轴及场地外框，用作比例参考。

:::info
此选项卡使用的坐标系支持自定义，详情请参阅[坐标系](/more-features/coordinate-systems)页面。
:::

### 渲染模式 {#rendering-modes}

3D 场地支持三种渲染模式：

- **电影级（左）：** 启用阴影、光照、反射和高细节 3D 模型，呈现更逼真的视觉效果，需要性能较强的 GPU。
- **标准（中）：** 默认模式，采用精简光照和简化版 3D 模型，在绝大多数设备上都能流畅运行。
- **低功耗（右）：** 降低帧率、分辨率和模型细节，以减少耗电，并在低配置设备上提供更稳定的性能。

<img src="/img/tab-reference/3d-field/3d-field-6.webp" alt="渲染模式比较" />

要配置渲染模式，请点击 `应用程序` > `首选项...` (Windows/Linux) 或 `AdvantageScope` > `设置...` (macOS) 打开首选项窗口。“3D 模式（电池供电）”选项可用于覆盖笔记本电脑未接通电源时的默认渲染模式，例如在比赛现场借此节省电量。

<img src="/img/prefs_zh-CN.webp" alt="首选项界面图解" height="450" />
