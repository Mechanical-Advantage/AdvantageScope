---
sidebar_position: 5
---

# 💬 控制台 {#console}

控制台视图用于查看包含控制台输出的单个字符串字段。以下是一些常用的推荐字段：

- **DS:/Dscomm/Console** — 由 FIRST Driver Station 保存。
- **messages** — 由 WPILib 内置日志系统在调用 [`DataLogManager.log`](<https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/wpilibj/DataLogManager.html#log(java.lang.String)>) 方法时保存。
- **/RealOutputs/Console** — 机器人实际运行时由 AdvantageKit 自动保存（照常使用 `System.out.println` 即可）。
- **/ReplayOutputs/Console** — 日志重放时由 AdvantageKit 自动保存（照常使用 `System.out.println` 即可）。

将所需字段拖入主视图即可开始查看，每一行代表该字段的一次更新。对于 WPILib 日志，每保存一行文本就会生成一条新行；对于 AdvantageKit 日志，则是每个循环周期生成一条新行。

<img src="/img/tab-reference/console-1.webp" alt="控制台视图" />

_上图所示为英文界面。_

:::info
点击调色板图标可开启或关闭警告与错误消息的高亮显示。对于 WPILib 和 AdvantageKit 日志，包含“warning”或“error”字样的消息会自动高亮。
:::

这里的控件与 🔢 [表格](../tab-reference/table) 选项卡类似。选中的时间会在所有选项卡之间同步。点击某一行即可选中该时间点，将鼠标悬停在行上则可在所有可见的弹出窗口中预览该时刻的数据。点击 ↓ 按钮可跳转到所选时间（或输入框中指定的时间）。时间戳及跳转输入框的格式均遵循[时间戳](/more-features/timestamps)首选项设置。

在“过滤”输入框中输入文本，即可仅显示包含该文本的行；按下 `Ctrl+F` 可快速聚焦到“过滤”输入框。在过滤文本开头加上“!”可从主视图中 _排除_ 匹配的消息。

## ANSI 格式化 {#ansi-formatting}

控制台渲染器支持使用标准 ANSI 转义序列来设置文本格式与颜色：

- **文本样式：** 粗体（bold）、暗淡（dim）、斜体（italic）和下划线（underline）
- **前景色和背景色：** 16 种标准颜色（普通与高亮度）
- **8 位和 24 位颜色：** 256 色调色板与 24 位 RGB 真彩色
- **选择性重置：** 重置指定样式或颜色，同时保留其他样式不变

:::tip
点击保存图标可将控制台数据导出为文本文件。
:::
