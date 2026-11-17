---
sidebar_position: 8
---

# 🎮 控制器 {#joysticks}

控制器选项卡可同时显示最多六个已连接控制器的状态。下图展示了一个示例布局，包含两个 Xbox 控制器和一个通用控制器。按下按钮时对应按键会高亮显示，同时还会实时呈现摇杆及其他轴的状态。

<img src="/img/tab-reference/joysticks-1.webp" alt="控制器选项卡概述" />

_上图所示为英文界面。_

<details>
<summary>时间轴控制</summary>

时间轴用于控制数据回放和可视化显示。在时间轴上点击即可选中某个时间点，右键点击可取消选择。所选时间点会在所有选项卡之间同步，方便你在其他视图中快速定位到同一时刻。

黄色区域表示机器人处于自动阶段，蓝色区域表示机器人处于遥控阶段，灰色区域表示机器人处于测试模式。

将鼠标悬停在时间轴上并上下滚动即可缩放；按住 `Shift` 并点击拖动可以框选时间范围。在支持横向滚动的设备上水平滚动，或在时间轴上直接点击拖动，即可左右移动视图。实时连接时，向左滚动会解除对当前时间的锁定，一直向右滚动到底则会重新锁定到当前时间。按下 `Ctrl+\` 可一键缩放到机器人处于启用状态的时间段。

<img src="/img/tab-reference/timeline.webp" alt="时间轴" />

</details>

## 控制面板 {#control-pane}

在选项卡底部的表格中选择各槽位对应的控制器类型。控制器 ID 范围为 0 到 5，与操控站和 WPILib 中的 ID 一一对应。有关控制器的更多信息，请参阅 [WPILib 文档](https://docs.wpilib.org/zh-cn/stable/docs/software/basic-programming/joystick.html)。

AdvantageScope 内置了多种常见控制器预设，包括以网格形式展示所有按钮、轴和 POV 的“通用控制器”（如上图所示）。如需添加自定义控制器，请参阅[自定义资源](/more-features/custom-assets)。

:::warning
**原生 WPILib 无法通过 NetworkTables 连接传输控制器数据。** 目前支持从 WPILib 日志文件（需[启用控制器日志记录](https://docs.wpilib.org/zh-cn/stable/docs/software/telemetry/datalog.html#logging-joystick-data)）、AdvantageKit 日志以及 AdvantageKit 实时串流中读取控制器数据。
:::
