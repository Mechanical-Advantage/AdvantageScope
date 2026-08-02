import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 👀 3D 场地

3D 场地展示机器人和场地的 3D 可视化效果。它可以用于常规 2D 位姿，但在处理 3D 计算（例如利用 AprilTag 定位）时特别有用。提供多种相机视图，包括场地相对、机器人相对和固定视图。[AdvantageScope XR](advantagescope-xr) 允许使用增强现实来可视化此选项卡。时间轴显示机器人何时处于启用状态，并可用于在日志数据中进行导航。

<img src="/img/tab-reference/3d-field/3d-field-1.png" alt="3D 场地选项卡示例" />

<details>
<summary>时间轴控制</summary>

时间轴用于控制播放和可视化。在时间轴上点击可选择时间，右键单击可取消选择。所选时间将在所有选项卡中同步，从而可以轻松地在其他视图中快速找到此位置。

黄色区域表示机器人处于自动阶段，蓝色区域表示机器人处于遥控阶段，灰色区域表示机器人处于测试模式。

要进行缩放，请将光标置于时间轴上方并向上或向下滚动。按住 `Shift` 的同时点击并拖动也可以选择一个范围。通过水平滚动（在受支持的设备上）或在时间轴上点击并拖动来左右移动。当进行实时连接时，向左滚动会解锁与当前时间的关联，而一路向右滚动将重新锁定到当前时间。按下 `Ctrl+\` 可缩放到机器人处于启用状态的时间段。

<img src="/img/tab-reference/timeline.png" alt="时间轴" />

</details>

:::warning
2026 FRC 场地模型与 **焊接版** 场地的 AprilTag 布局一致。焊接版和 AndyMark 场地之间的差异非常微小，但在基于 AndyMark 场地布局可视化 AprilTag 位姿时可能会有轻微（~0.5 英寸）的不对齐。
:::

## 添加对象

要开始使用，请将字段拖动到“位姿”部分。使用 X 按钮删除对象，或通过点击眼睛图标或双击字段名称临时隐藏它。要移除所有对象，请点击轴标题附近的垃圾桶图标，然后点击 `清除所有字段`。可以在列表中通过点击并拖动来重新排列对象。

**要自定义每个对象，请点击彩色图标或右键单击字段名称。** AdvantageScope 支持大量对象类型，其中许多类型都可以进行自定义（例如更改颜色和机器人模型）。某些对象必须作为子项添加到现有对象中。

:::tip
要查看受支持对象类型的完整列表，请点击 `?` 图标。该列表还包含受支持的数据类型以及对象是否必须作为子项添加。
:::

:::info
AdvantageScope 支持用于 FTC 场地的多种尺寸的 AprilTag。尺寸以 **AprilTag 黑色部分的边长** 进行测量，不包括所需的白色边框。
:::

## 数据格式

几何数据应作为字节编码的结构体或 protobuf 进行发布。支持各种 2D 和 3D 几何类型，包括 `Pose2d`、`Pose3d`、`Translation2d`、`Translation3d` 等。

许多库都支持结构体格式，包括 WPILib 和 AdvantageKit。下面的示例代码展示了如何在 Java 中记录 3D 位姿数据。

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

StructPublisher<Pose3d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose3d.struct).publish();
StructArrayPublisher<Pose3d> arrayPublisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyPoseArray", Pose3d.struct).publish();

periodic() {
  publisher.set(poseA);
  arrayPublisher.set(new Pose3d[] {poseA, poseB});
}
```

:::tip
WPILib 的 [`Field2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/field2d-widget.html) 类也可以用于将多组 2D 位姿数据记录在一起。
:::

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
// 该协议不支持现代结构体格式，但位姿值
// 可以使用带有后缀 "x"、"y" 和 "heading" 的独立字段进行发布
// （如下所示）：
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // 英寸
packet.put("Pose y", 2.8); // 英寸
packet.put("Pose heading", 3.14); // 弧度

// 或者，朝向可以用度为单位发布
packet.put("Pose heading (deg)", 180.0); // 度
```

</TabItem>
</Tabs>

## 机构与组件

机构数据可以使用 2D 机构或铰接的 3D 组件进行可视化。

### 2D 机构 {#2d-mechanisms}

要可视化使用 [`Mechanism2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html) 记录的机构数据，请将机构字段添加到现有的机器人或幽灵模型对象中。机构使用简单的方框投影到机器人的 XZ 或 YZ 平面上（如下所示）。点击齿轮图标或右键单击字段名称可以在 XZ 和 YZ 平面之间切换。机器人的原点位于机构底边的中心。

<img src="/img/tab-reference/3d-field/3d-field-2.png" alt="2D 机构" />

### 3D 组件

:::warning
设置 3D 组件可能非常复杂且耗时。可考虑使用如上所述的 AdvantageScope 的 `Mechanism2d` 支持，它提供了在 3D 场地上可视化机构的更简化方法。
:::

机构可以通过记录代表每个组件相对于机器人的位置的一组 3D 位姿，使用铰接组件进行可视化。将这些位姿添加到现有的机器人或幽灵模型对象中，并将对象类型设置为 "Component"。

每个组件都可以独立移动（例如升降机滑台、机械臂或末端执行器）。AdvantageKit 用户应考虑使用 [`generate3dMechanism()`](https://docs.advantagekit.org/data-flow/supported-types#mechanisms-output-only) 方法将 Mechanism2d 转换为 Pose3d 对象数组。有关配置带有组件的机器人的更多信息，请参阅 [自定义资源](/more-features/custom-assets)。

<img src="/img/tab-reference/3d-field/3d-field-3.png" alt="3D 机构" />

## 游戏元素对象 {#game-piece-objects}

每个场地都包含一套游戏元素对象类型，允许使用机器人代码发布的数据在场地的任何位置渲染游戏元素。这具有多种应用，包括：

- 使用简单动画可视化模拟自动阶段例程的操作
- 显示在场地上检测到的游戏元素位置
- 指示游戏元素位于机器人内的什么位置
- 根据物理计算查看发射轨迹

另一个简单的使用场景是根据传感器数据在机器人内显示游戏元素的状态。例如，2024 年机器人的 Note 路径内的断光传感器可以使 Note 出现（如下所示）。

<details>
<summary>代码示例</summary>

AdvantageKit KitBot 2024 示例项目包含一个 [命令](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/util/NoteVisualizer.java) 的简单示例，该命令动画展示了 Note 从机器人飞向 Speaker 的过程。此命令被纳入标准 [发射序列](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/subsystems/launcher/Launcher.java#L73)，每当释放 Note 时便触发动画。[此视频](https://youtube.com/shorts/-HxfDo9f19U?feature=share) 展示了如何使用游戏元素动画来可视化多个不同比赛的自动阶段例程。

</details>

<img src="/img/tab-reference/3d-field/3d-field-4.png" alt="2024 KitBot Note 可视化" />

## 相机选项

要切换选定的相机模式，请右键单击渲染的场地视图。每个弹出窗口的相机模式和位置均独立控制，从而可以轻松创建多相机视图。

:::info
右键单击渲染的场地视图并点击“设置 FOV...”以调整环绕相机和操控站相机的视野 (FOV)。
:::

### 环绕场地

这是默认的相机模式，相机可以相对于场地自由移动。**左键点击 + 拖动** 旋转相机，**右键点击 + 拖动** 平移相机。**滚动** 放大和缩小。

:::tip
相机也可以使用键盘控制。**WASD** 键用于平移，**IJKL** 键用于旋转，**E** 和 **Q** 键用于垂直平移。
:::

### 环绕机器人

此模式与“环绕场地”模式具有相同的控制方式，但相机的位姿锁定在相对于机器人的位置。这允许对机器人的运动进行“追踪”拍摄。

### 操控站

此模式将相机锁定在其中一个操控站后方的典型眼高位置。可以手动选择要查看的操控站，或者选择“自动”以使用日志数据中存储的联盟和操控站编号。

:::warning
查看由 AdvantageKit 2023 或更早版本生成的日志数据时，自动选择操控站编号可能会不准确。
:::

### 固定相机

每个机器人模型都配置了一组固定相机，例如视觉相机和驾驶员相机。这些相机具有固定的位置、宽高比和 FOV。这些视图通常有助于检查视觉数据或模拟驾驶员相机视图。在下面的示例中，显示了一个驾驶员相机。

<img src="/img/tab-reference/3d-field/3d-field-5.png" alt="固定相机" />

如果提供了“相机覆盖”位姿，它将在保留其配置的 FOV 和宽高比的同时替换所有固定相机的默认位姿。这允许机器人代码提供移动相机的姿态，例如安装在转塔或发射罩上的相机。

:::info
与其它位姿数据一致，“相机覆盖”位姿必须是 _场地相对_ 的，而不是机器人相对的。
:::

## 配置

可以使用下拉菜单配置场地模型。支持所有近期的 FRC 和 FTC 比赛。我们建议在图形性能有限的设备上使用“Evergreen”场地。“Axes”场地仅在原点显示 XYZ 轴，并带有场地外框以供参考标尺。

:::info
在此选项卡上使用的坐标系是可自定义的。有关详细信息，请参阅 [坐标系](/more-features/coordinate-systems) 页面。
:::

### 渲染模式 {#rendering-modes}

3D 场地支持三种渲染模式：

- **电影级：** 使用阴影、照明、反射和高细节 3D 模型进行渲染，以获得更逼真的外观。需要相当强大的 GPU。
- **标准（默认）：** 使用最小限度的照明和简化的 3D 模型进行渲染。在大多数设备上运行良好。
- **低功耗：** 降低帧率、分辨率和模型细节，以减少电池消耗，并在低端设备上提供更一致的性能。

<img src="/img/tab-reference/3d-field/3d-field-6.png" alt="渲染模式对比" />

要配置渲染模式，请按点击 `应用程序` > `显示首选项...` (Windows/Linux) 或 `AdvantageScope` > `设置...` (macOS) 打开首选项窗口。“3D 模式（电池供电）”设置可以从默认值切换，以覆盖笔记本电脑未充电时使用的渲染模式。例如，这可用于在比赛现场节省电量。

<img src="/img/prefs.png" alt="首选项图解" height="350" />
