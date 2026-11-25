---
sidebar_position: 2
---

# 🤖 踏上赛场：机器人可视化

既然基础遥测已经跑通，是时候可视化你的机器人了！AdvantageScope 提供了强大的 2D 和 3D 场地视图，能在 FRC 与 FTC 场地模型上生动呈现里程计、视觉定位估计、轨迹以及关节机构。

在本教程中，你将学习如何：

- 使用 **Telemetry API** 发布结构化位姿数据。
- 使用 **🗺️ 2D 场地**和 **👀 3D 场地**选项卡可视化机器人运动。
- 在 2D 和 3D 中发布并渲染机构。

## 1. 发布位姿

在 WPILib 中，使用 `Pose2d`、`Pose3d` 和 `Translation2d` 等几何对象表示机器人及场地元素的位置。借助 **Telemetry API**，只需一次方法调用即可直接记录位姿/平移及其数组（例如规划路径或视觉目标）：

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

<details>
<summary>示例 OpMode</summary>

想在没有完整机器人项目的情况下体验 AdvantageScope 的可视化功能吗？复制下方的 OpMode，它会在 FRC 场地模型上发布多个 2D 和 3D 位姿用于演示。有关创建新 WPILib 项目并配置遥测的详情，请参阅 👋 [你好，遥测！](/tutorials/hello-telemetry)。

```java
@Teleop
public class ExampleTeleop implements OpMode {
  @Override
  public void periodic() {
    double t = Timer.getTimestamp();

    // 生成示例圆形行驶轨迹
    double x = 2.0 * Math.cos(t * 0.5);
    double y = 2.0 * Math.sin(t * 0.5);
    Rotation2d rotation = Rotation2d.fromRadians(t * 0.5 + Math.PI / 2.0);
    Pose2d robotPose2d = new Pose2d(x, y, rotation);

    // 创建示例 3D 位姿（例如来自视觉定位或陀螺仪俯仰/横滚角）
    Pose3d robotPose3d = new Pose3d(x, y, 0.0, new Rotation3d(0.0, 0.0, rotation.getRadians()));

    // 创建示例轨迹（Pose2d 对象数组）
    Pose2d[] trajectory = new Pose2d[] {
        new Pose2d(8.0, 4.0, Rotation2d.ZERO),
        new Pose2d(10.0, 4.0, Rotation2d.ZERO),
        new Pose2d(10.0, 6.0, Rotation2d.CW_PI_2)
    };

    // 记录单个 2D 和 3D 位姿
    Telemetry.log("Field/RobotPose2d", robotPose2d);
    Telemetry.log("Field/RobotPose3d", robotPose3d);

    // 记录位姿数组（例如轨迹或 AprilTag 位姿）
    Telemetry.log("Field/Trajectory", trajectory);
  }
}
```

</details>

在 AdvantageScope 中，侧边栏里的几何数值会标明其类型。你还可以展开每个字段，查看位姿的各个分量，例如 X、Y 和旋转角度：

<img src="/img/tutorials/to-the-field-1.webp" alt="在 AdvantageScope 侧边栏中查看位姿数据。" />

_上图所示为英文界面。_

## 2. 可视化 2D 数据

🗺️ [2D 场地](/tab-reference/2d-field)选项卡会在比赛场地平面图上叠加显示机器人的俯视图。

1. 在 AdvantageScope 中，点击选项卡栏中的 **+** 按钮并选择 **2D 场地**（或选择现有的 2D 场地选项卡）。
2. 从底部控制面板的“场地”下拉菜单中，选择当前赛季或通用场地。
3. 在侧边栏树中找到 `NT:/Telemetry/Field/RobotPose2d`，将其拖入控制面板的“位姿”列表中。
4. 你的机器人就会出现在场地上！
5. 点击控制面板中位姿旁的图标可更改机器人颜色。

:::info 相机控制

在场地画布任意位置右键点击，可在**未锁定**、**锁定（机器人）**（随机器人平移）或**锁定（机器人和旋转）**（旋转场地使机器人始终朝上）之间切换。点击“方向”下的按钮可调整旋转角度。
:::

<img src="/img/tutorials/to-the-field-2.webp" alt="2026 FRC 场地上的机器人可视化。" />

_上图所示为英文界面。_

## 3. 切换对象类型

除了简单的机器人位姿外，AdvantageScope 还支持多种视觉对象类型，包括虚影（半透明机器人）、轨迹、视觉目标、热力图、AprilTag、游戏元素等！要了解 AdvantageScope 支持渲染哪些对象类型：

1. 点击控制面板中的 `?`（帮助）图标。
2. 随后会打开一个窗口，列出所有受支持的视觉类型、它们的预期数据类型（例如 `Pose2d`、`Pose3d[]`、`Translation2d`），以及它们是可以作为独立项目添加，还是必须作为子项附加到其他对象下。

点击控制面板中每个位姿旁的图标即可切换对象类型。试着将机器人位姿切换为虚影、箭头或热力图等其他对象类型！

<img src="/img/tutorials/to-the-field-3.webp" alt="2D 场地的内置帮助窗口。" height="500" />

_上图所示为英文界面。_

## 4. 可视化 3D 数据

👀 [3D 场地](/tab-reference/3d-field)选项卡会渲染包含游戏元素、光照和可自定义机器人模型的 3D 场地。

1. 点击选项卡栏中的 **+** 并选择 **3D 场地**（或选择现有的 3D 场地选项卡）。
2. 从“场地”下拉菜单中选择你的赛季场地模型。
3. 将 `NT:/Telemetry/Field/RobotPose3d` 或 `NT:/Telemetry/Field/RobotPose2d` 拖入“位姿”区域。（2D 位姿会自动放置在场地地面上）。
4. 将 `NT:/Telemetry/Field/Trajectory` 拖入“位姿”列表并将其类型设为**轨迹**，即可在场地上将路径渲染为一条丝带。
5. 按住**鼠标左键**拖动可围绕场地旋转相机；按住**鼠标右键**拖动可平移；滚动滚轮可缩放。
6. 或者，使用 **WASD** 平移、**IJKL** 旋转，以及 **Q/E** 上下移动。
7. 右键点击 3D 视口可在**环绕机器人**、**操控站**（从联盟视角观看比赛）和**固定相机**（从机载视觉相机视角观看）之间切换。

<img src="/img/tutorials/to-the-field-4.webp" alt="3D 场地选项卡渲染带有轨迹丝带的 3D 机器人模型在场地上行驶。" />

_上图所示为英文界面。_

## 5. 发布机构数据

如果你的机器人有升降梯、机械臂或腕部等关节结构，可以使用 WPILib 的 `Mechanism2d` 进行可视化。详情请参阅 WPILib [文档](https://docs.wpilib.org/zh-cn/stable/docs/software/dashboards/glass/mech2d-widget.html)。下方展示了一个单关节机械臂的示例。

```java
public class ExampleTeleop implements OpMode {
  // 创建 2D 机构画布（宽 2 m，高 2 m）
  private final Mechanism2d mechanism = new Mechanism2d(2.0, 2.0);
  private MechanismLigament2d arm;

  public ExampleTeleop(Robot robot) {
    // 创建根部位于 (1 m, 0.5 m) 的机械臂
    MechanismRoot2d root = mechanism.getRoot("ArmRoot", 1.0, 0.5);
    arm = root.append(new MechanismLigament2d("Arm", 0.8, 0.0, 6.0, new Color8Bit(255, 100, 0)));
  }

  @Override
  public void periodic() {
    // 使机械臂角度产生动画效果
    double angle = 45.0 + 45.0 * Math.sin(Timer.getTimestamp() * 2.0);
    arm.setAngle(angle);

    // 每个循环周期发布一次机构状态
    Telemetry.log("Superstructure/Mechanism", mechanism);
  }
}
```

## 6. 在 2D 中可视化机构

可以使用 ⚙️ [机构](/tab-reference/mechanism)选项卡在 2D 中可视化机构。

1. 点击选项卡栏中的 **+** 并选择**机构**。
2. 将 `NT:/Telemetry/Superstructure/Mechanism` 拖入控制面板，你将看到 2D 机械臂实时动画运动。

<img src="/img/tutorials/to-the-field-5.webp" alt="显示 2D 关节机械臂可视化的机构选项卡。" />

_上图所示为英文界面。_

## 7. 在 3D 中可视化机构

你还可以将同一个 `Mechanism2d` 直接投影到 3D 场地选项卡中的机器人上！

1. 在 3D 场地选项卡中，确保你的机器人位姿已添加到“位姿”列表中。
2. 将 `NT:/Telemetry/Superstructure/Mechanism` **拖到**对象列表中的机器人位姿条目**上**（作为子对象）。
3. 2D 机构就会投影到机器人底盘的 3D 空间中！点击机构旁的齿轮图标，可在 **XZ**（侧面轮廓）和 **YZ**（正面轮廓）平面之间切换。

<img src="/img/tutorials/to-the-field-6.webp" alt="3D 场地选项卡显示投影在 3D 机器人模型上的机构。" />

_上图所示为英文界面。_

## 下一步？

既然你已经能够在 2D 和 3D 中可视化机器人的运动和机构：

- **🕹️ [掌握控制：DS 与控制器](/tutorials/taking-control)：** 学习如何与 FIRST Driver Station 集成、处理 DS 日志以及可视化控制器输入。
- **👀 [3D 场地](/tab-reference/3d-field)：** 3D 场地选项卡的全面指南，包括游戏元素可视化、相机选项和渲染模式。
- **[AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr)：** 在 iPhone 和 iPad 上以增强现实形式生动呈现 3D 场地视图。
- **🎬 [视频](/tab-reference/video)：** 将场地可视化与真实比赛录像并排对比。
- **🦀 [Swerve](/tab-reference/swerve)：** 可视化 Swerve 驱动机构的状态，包括在 2D 和 3D 场地上的叠加显示。
- **⚙️ [自定义资源](/more-features/custom-assets)：** 添加自定义 CAD 模型、关节机构以及场地图片/模型。
