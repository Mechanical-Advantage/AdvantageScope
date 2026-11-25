---
sidebar_position: 3
---

# 🕹️ 掌握控制：DS 与控制器

在排查赛场上的问题时，了解驾驶员输入与通信健康状况至关重要。AdvantageScope 与 [FIRST Driver Station](https://docs.wpilib.org/en/latest/docs/software/firstdriverstation) 无缝集成，让你可以监控实时诊断数据、检查操控站日志并可视化控制器输入。

在本教程中，你将学习如何：

- 直接从 **FIRST Driver Station** 访问 AdvantageScope。
- 连接到实时操控站诊断数据。
- 对比并同步**机器人端日志**与**操控站日志**。
- 在 **💬 控制台**选项卡中查看控制台输出和错误消息。
- 在 **🎮 控制器**选项卡中可视化控制器输入和布局。

## 1. 从 FIRST Driver Station 访问 AdvantageScope

💡 [AdvantageScope Lite](/more-features/advantagescope-lite) 已直接集成到 FIRST Driver Station 中。点击 ⚙️ 图标，然后选择“Open Log Viewer in Browser”即可访问。

<img src="/img/tutorials/taking-control-1.webp" alt="FIRST Driver Station 中的 Open Log Viewer In Browser 按钮" />

_上图所示为英文界面。_

## 2. 实时连接到操控站

当与 FIRST Driver Station 运行在同一台笔记本电脑上时，AdvantageScope 桌面应用还可以实时串流操控站状态的遥测与诊断信息：

1. 同时启动 FIRST Driver Station 和 AdvantageScope。
2. 在顶部菜单中选择 `文件` > `连接到操控站`。
3. AdvantageScope 将连接到本地操控站服务，实时串流比赛状态、电池电压、控制器状态等数据。
4. 打开 📉 [折线图](/tab-reference/line-graph)或 🔢 [表格](/tab-reference/table)选项卡，查看实时 DS 诊断数据。

:::tip
你也可以使用键盘快捷键 `Ctrl+Option+Shift+K` (macOS) 或 `Ctrl+Alt+Shift+K` (Windows/Linux) 快速将操控站作为实时数据源进行连接。
:::

## 3. 操控站日志 vs 机器人端日志

在赛后或练习赛后诊断机器人行为时，主要有两种日志类型需要考虑：

| 日志类型         | 来源                                | 记录的数据                                                                                                      |
| :--------------- | :---------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| **机器人端日志** | 通过 `DataLogManager` 的 Systemcore | 高频遥测数据（50+ Hz）、机器人状态、控制器状态、传感器测量值、电机电流、PID 控制器状态、位姿估计和机构数据。    |
| **操控站日志**   | 操控站笔记本电脑                    | 网络往返时间（延迟）、丢包率 %、无线电 ping、电池电压、机器人控制器 CPU %、控制台数据、机器人状态和控制器状态。 |

:::important 通常优先使用机器人端日志
由于**机器人端日志**直接在源头记录丰富的高频遥测数据，在排查机器人行为、控制环路和自动阶段路径时通常是首选。不过，**DS 日志**会捕获机器人自身无法测量的关键外部网络与比赛事件。

**两份日志中**都会捕获控制器数据，如下方[第 6 节](#6-visualizing-joysticks)所示。
:::

## 4. 合并与同步多个日志

AdvantageScope 支持在同一时间轴上打开并同步来自多个来源的日志：

1. 使用 `文件` > `打开日志...` 打开你的机器人端日志文件（或直接将 `.wpilog` 文件拖入 AdvantageScope）。
2. 在菜单栏中选择 `文件` > `添加新日志...`，并选择对应的操控站日志。
3. AdvantageScope 会自动将两份日志对齐到同步时间轴上！每份日志的字段会分别归类在独立的表下（例如 `Log0` 和 `Log1`）。
4. 现在你可以在 📉 [折线图](/tab-reference/line-graph)中将机器人端遥测数据（如电机电流或位姿估计）与操控站信号（如丢包率或电池电压）直接叠加对比，判断异常的机器人行为是否与无线电断连或欠压 (brownout) 同时发生。

<img src="/img/overview/log-files/open-file-1.webp" alt="在 AdvantageScope 中打开已保存的日志文件。" />

_上图所示为英文界面。_

## 5. 查看控制台数据

💬 [控制台](/tab-reference/console)选项卡可用于查看机器人或操控站打印的文本输出和错误日志。控制台数据可以保存在任意一份日志文件中：

- **机器人端日志：** WPILib 的 `DataLogManager` 会自动记录机器人控制台输出。
- **操控站日志：** 在 DS 中，控制台输出和系统事件消息保存在 `DS:/Dscomm/Console` 字段中。

要查看控制台数据：

1. 点击选项卡栏中的 **+** 按钮并选择**控制台**。
2. 从侧边栏将控制台字段（`DS:/Dscomm/Console` 或 `messages`）拖入主视图。
3. 每一行代表一条带时间戳的日志消息。点击任意消息，即可将所有已打开选项卡的同步时间轴跳转到该精确时刻！
4. 使用“过滤”框（或按 `Ctrl+F` / `Cmd+F`）搜索特定消息，或点击调色板图标切换警告和错误的高亮显示。

<img src="/img/tab-reference/console-1.webp" alt="显示日志消息的控制台选项卡。" />

_上图所示为英文界面。_

## 6. 可视化控制器 {#6-visualizing-joysticks}

🎮 [控制器](/tab-reference/joysticks)选项卡可实时呈现最多 6 个游戏控制器的状态，在逼真的控制器图示上显示轴移动、扳机按压、POV 方向键和按钮按下。为确保控制器输入记录在机器人端日志文件中，请按照 👋 [你好，遥测！](/tutorials/hello-telemetry)中的说明，在 `Robot` 构造函数中与 `DataLogManager` 一起初始化 `DriverStation.startDataLog()`。

1. 点击顶部选项卡栏中的 **+** 按钮并选择**控制器**。
2. 在选项卡底部的表格中，为每个控制器 ID（0 到 5）分配对应的布局（例如 **Xbox Controller**、**PS4 Controller** 或 **Generic Joystick**）。
3. 当你拖动日志文件时间轴或从操控站串流实时数据时，按钮会随之亮起，摇杆也会与驾驶员操作同步移动！

<img src="/img/tab-reference/joysticks-1.webp" alt="显示当前控制器按键和摇杆位置的控制器选项卡。" />

_上图所示为英文界面。_

## 下一步？

恭喜！你已经完成了 AdvantageScope 核心教程系列。现在你已经掌握了：

- 在 **👋 [你好，遥测！](/tutorials/hello-telemetry)** 中配置遥测、连接实时数据流以及查看图表/表格。
- 在 **🤖 [踏上赛场](/tutorials/to-the-field)** 中可视化 2D/3D 里程计、轨迹和机构。
- 在 **🕹️ [掌握控制](/tutorials/taking-control)** 中串流实时操控站诊断数据、合并多源日志并回放控制器输入。

继续探索 AdvantageScope 的高级工具和功能：

- **📂 [日志文件](/overview/log-files)：** 了解受支持的日志格式、数据导出和批量下载。
- **🛜 [实时数据源](/overview/live-sources)：** 连接实时数据源（包括调参模式）的详细指南。
- **[选项卡参考](/category/tab-reference)：** 涵盖每种可视化类型功能的参考指南。
- **[更多功能](/category/more-features)：** 有关 AdvantageScope 其他功能的文档与原理说明。
