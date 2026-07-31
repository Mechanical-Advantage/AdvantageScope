---
sidebar_position: 8
---

# 🎮 操纵杆

操纵杆选项卡显示最多六个已连接控制器的状态。下图显示了一个示例布局，包含两个 Xbox 控制器和一个通用操纵杆。按键在按住时会高亮显示，并显示操纵杆和其他轴的状态。

<img src="/img/tab-reference/joysticks-1.png" alt="操纵杆选项卡概述" />

<details>
<summary>时间轴控制</summary>

时间轴用于控制播放和可视化。在时间轴上点击可选择时间，右键单击可取消选择。所选时间将在所有选项卡中同步，从而可以轻松地在其他视图中快速找到此位置。

黄色区域表示机器人处于自动阶段，蓝色区域表示机器人处于遥控阶段，灰色区域表示机器人处于测试模式。

要进行缩放，请将光标置于时间轴上方并向上或向下滚动。按住 `Shift` 的同时点击并拖动也可以选择一个范围。通过水平滚动（在受支持的设备上）或在时间轴上点击并拖动来左右移动。当进行实时连接时，向左滚动会解锁与当前时间的关联，而一路向右滚动将重新锁定到当前时间。按下 `Ctrl+\` 可缩放到机器人处于启用状态的时间段。

<img src="/img/tab-reference/timeline.png" alt="时间轴" />

</details>

## 控制面板

在选项卡底部的表格中选择操纵杆类型。操纵杆 ID 范围从 0 到 5，与 Driver Station 和 WPILib 中的 ID 匹配。有关操纵杆的更多信息，请参阅 [WPILib 文档](https://docs.wpilib.org/en/stable/docs/software/basic-programming/joystick.html)。

AdvantageScope 包含一组常见操纵杆，包括以网格格式显示所有按钮、轴和 POV 的“通用操纵杆”（如上图所示）。要添加自定义操纵杆，请参阅 [自定义资源](/more-features/custom-assets)。

:::warning
**原生 WPILib 中，操纵杆数据在 NetworkTables 连接下不可用。** 支持 WPILib 日志文件（需 [启用操纵杆日志记录](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html#logging-joystick-data)）、AdvantageKit 日志以及 AdvantageKit 实时串流。
:::
