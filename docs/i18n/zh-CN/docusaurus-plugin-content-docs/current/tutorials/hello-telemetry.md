---
sidebar_position: 1
---

# 👋 你好，遥测！

欢迎来到 AdvantageScope！遥测和日志记录是强大的工具，能帮助你更好地理解机器人代码、诊断问题，并在赛场内外高效实现解决方案。本系列教程旨在带你入门遥测功能，让你充分发挥 AdvantageScope 的全部能力。

在本教程中，你将学习如何：

- 在 Java WPILib 项目中配置基础机器人遥测。
- 在 AdvantageScope 中连接到实时数据流。
- 将数据记录到日志文件中以便日后查看。
- 使用 AdvantageScope 可视化遥测数据。

:::tip 想找其他内容？

- **FTC 队伍：** 如果你使用的是现有的 FIRST Tech Challenge 控制系统，请参阅 ✴️ [FTC 兼容性](/more-features/ftc-compatibility)指南。
- **网页界面：** FIRST Driver Station 和 Systemcore 网页界面中直接内置了基于浏览器的 AdvantageScope 版本。详情请参阅 💡 [AdvantageScope Lite](/more-features/advantagescope-lite)。
- **AdvantageKit：** 专为在仿真中进行确定性重放而设计的高级日志框架。详情请参阅[相关文档](https://docs.advantagekit.org)。我们建议从下文介绍的 WPILib 内置遥测 API 开始。
  :::

## 1. 创建新的 WPILib 项目

首先，在 VS Code 中创建一个新的 WPILib Java 项目：

1. 打开 VS Code。
2. 点击右上角的 WPILib 图标（或按 `Ctrl+Shift+P` / `Cmd+Shift+P` 并输入 **WPILib: Create a new project**）。
3. 选择 **Template** > **Java** > **Command v3 Robot**（或 **Command v2 Robot**）。
4. 选择一个文件夹，为项目命名（例如 `HelloTelemetry`），并输入你的队号。
5. 勾选 **Enable Desktop Support**，然后点击 **Create Project**。

<img src="/img/tutorials/hello-telemetry-1.webp" alt="在 VS Code 中使用 WPILib 项目创建器创建新的 WPILib Java 项目。" />

_上图所示为英文界面。_

## 2. 初始化数据日志记录

WPILib 通过 `DataLogManager` 提供内置的数据日志记录功能。启动后，它会自动将所有遥测数据、NetworkTables 条目和操控站输入记录到 `.wpilog` 文件中。

:::info 建议
虽然日志可以保存在 Systemcore 的内部存储中，但内部闪存容量有限。我们强烈建议在 Systemcore 的任意 USB 端口插入一个标准的 **FAT32 格式 U 盘**。`DataLogManager` 会自动检测到 U 盘并将所有日志直接写入其中。
:::

打开 `src/main/java/first/robot/Robot.java`，并在 `Robot()` 构造函数中初始化 `DataLogManager`：

```java
public class Robot extends OpModeRobot {
  // ...

  public Robot() {
    // 启动 DataLogManager，将所有遥测数据记录到 U 盘上的 .wpilog 文件中
    DataLogManager.start();

    // 同时记录操控站数据（控制器、OpMode、启用状态）
    DriverStation.startDataLog(DataLogManager.getLog());
  }

  // ...
}
```

## 3. 发布遥测数据

WPILib 的 `Telemetry` 类只需一行代码即可发布数据，并将字段整理为层级化的表格。该 API 支持多种数据类型，包括数值、布尔值、字符串、数组以及 WPILib [几何类型](https://docs.wpilib.org/zh-cn/stable/docs/software/advanced-controls/geometry/index.html)。

:::info
WPILib 中的 `Telemetry` 类与 FTC SDK 中的 `Telemetry` 类不同。WPILib 的 `Telemetry` 类用于将信息从机器人程序发送到仪表盘、调试工具或日志文件。若要更新内置操控站显示内容，请使用 WPILib 的 `DriverStationDisplay` 类。
:::

更新 `src/main/java/first/robot/ExampleTeleop.java`：

```java
@Teleop
public class ExampleTeleop implements OpMode {
  // ...

  @Override
  public void periodic() {
    double currentTime = Timer.getTimestamp();
    double sineWave = Math.sin(currentTime * 2.0);

    // 使用 Telemetry API 发布遥测数值
    Telemetry.log("Time", currentTime);
    Telemetry.log("SineWave/Value", sineWave);
    Telemetry.log("SineWave/Low", sineWave < 0.5);
  }
}
```

将代码部署到机器人（或在 VS Code 中运行 `WPILib: Simulate Robot Code`）。在仿真界面中，点击 `Teleoperated` > `ExampleTeleop` > `Enable`。

<img src="/img/tutorials/hello-telemetry-2.webp" alt="在仿真器 GUI 中启用 ExampleTeleop OpMode。" height="200" />

_上图所示为英文界面。_

:::tip
只有在调用 `Telemetry.log` 时才会发布新的遥测数据。`Robot` 类、OpMode、子系统和机构中的周期性方法会在不同条件下激活；在决定将日志调用放在何处时，请仔细查阅 API 文档。
:::

## 4. 实时连接 AdvantageScope

启动 AdvantageScope 桌面应用。在顶部菜单中选择 `文件` > `连接到机器人` > `NetworkTables`（如果正在仿真，则选择 `文件` > `连接到模拟器`）。连接成功后，左侧边栏会在 `NT:/Telemetry` 下填充已发布的字段。

:::tip 键盘快捷键
按 `Ctrl+K` / `Cmd+K` 可快速连接到机器人，按 `Ctrl+Shift+K` / `Cmd+Shift+K` 可连接到模拟器。
:::

<img src="/img/tutorials/hello-telemetry-3.webp" alt="AdvantageScope 连接到实时机器人数据流，并在侧边栏树中列出字段。" />

_上图所示为英文界面。_

## 5. 可视化遥测数据

### 折线图

📉 [折线图](/tab-reference/line-graph)是 AdvantageScope 中的默认选项卡，提供数值和离散值的实时绘制功能。

1. 查看左侧边栏中的 `Telemetry` > `SineWave`。
2. 将 `Value` 拖到控制面板的“左轴”区域。
3. 将 `Low` 拖到控制面板的“离散字段”区域。
4. 点击“离散字段”旁边的三个点图标，然后选择“显示机器人模式”。

随着数据流传入，你会看到正弦波和机器人状态实时更新！

:::info 与图表交互

- **暂停 / 拖动查看：** 横向滚动或在图表上点击拖动可查看历史数据。右上角的红色箭头表示实时自动滚动已暂停，点击该箭头或按 `L` 键可切换实时自动滚动。
- **缩放：** 将鼠标置于图表上方并上下滚动，或按住 `Shift` 拖动以放大到特定时间窗口。
- **检查数值：** 在图表任意位置点击可放置时间光标，并在图例中查看精确数值。
  :::

<img src="/img/tutorials/hello-telemetry-4.webp" alt="绘制正弦波信号的折线图。" />

_上图所示为英文界面。_

### 表格

🔢 [表格](/tab-reference/table)选项卡以按时间顺序排列的电子表格形式展示状态和数值变化，非常适合诊断状态切换和事件序列。

1. 点击顶部选项卡栏中的 **+** 按钮并选择**表格**。
2. 从侧边栏中将 `NT:/Telemetry/SineWave/Value` 和 `NT:/Telemetry/Low` 拖入表格视图。
3. 每当任意显示字段的值发生变化时，系统都会自动添加新行。
4. 点击任意行，即可立即将所有已打开的选项卡跳转到该精确时刻！

:::tip
可以使用选项卡栏重新排列和重命名选项卡。点击标题栏中的窗口按钮可在弹出窗口中打开选项卡，并排查看多个选项卡。
:::

<img src="/img/tutorials/hello-telemetry-5.webp" alt="显示正弦波数据的表格选项卡。" />

_上图所示为英文界面。_

### 统计

📊 [统计](/tab-reference/statistics)选项卡显示数值数据的直方图，让你详细了解一个或多个字段的数据分布情况。

1. 点击顶部选项卡栏中的 **+** 按钮并选择**统计**。
2. 从侧边栏中将 `NT:/Telemetry/SineWave/Value` 拖入“测量值”区域。
3. 将“数据范围”设为 `-1` 和 `1`，并将“组距”设为 `0.1`。
4. 使用直方图和汇总统计信息查看数据。
5. 滚动顶部的时间轴可调整要包含的数据范围。

<img src="/img/tutorials/hello-telemetry-6.webp" alt="显示正弦波数据的统计选项卡。" />

_上图所示为英文界面。_

## 6. 下载并打开日志文件

在测试或比赛结束后，你可以从机器人下载 `.wpilog` 文件以事后复盘数据：

1. 在菜单栏中选择 `文件` > `下载日志...`。
2. AdvantageScope 会连接到机器人并列出所有已记录的日志文件（最新的排在最上方）。
3. 选择要检查的日志文件，点击下载 (↓) 图标，并选择电脑上的保存文件夹。
4. 使用 `文件` > `打开日志...` 或直接将 `.wpilog` 文件拖入 AdvantageScope 来打开已下载的文件。

<img src="/img/overview/log-files/open-file-2.webp" alt="下载对话框显示机器人存储上可用的 WPILOG 文件。" height="350" />

_上图所示为英文界面。_

## 下一步？

既然你已经成功运行了基础遥测和日志记录，接下来可以进一步提升你的可视化能力：

- **🤖 [踏上赛场：机器人可视化](/tutorials/to-the-field)：** 学习如何在 FRC 和 FTC 场地模型上可视化 2D/3D 机器人位置、轨迹和机构。
- **[概述](/category/overview)：** 有关文件管理、导航快捷键和实时串流选项的全面指南。
- **[单位支持](/tab-reference/line-graph/units)：** 如何将单位元数据集成到日志中，以实现更精确的可视化。
- **💬 [控制台](/tab-reference/console)：** 可视化由 WPILib 的 `DataLogManager` 保存的文本日志。
- **🔍 [元数据](/tab-reference/metadata)：** 保存额外信息以标识和分类日志文件。
- **[Epilogue](https://docs.wpilib.org/zh-cn/stable/docs/software/telemetry/robot-telemetry-with-annotations.html)：** 在 Java 中使用注解记录遥测数据。
