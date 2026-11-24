---
sidebar_position: 5
---

# ⏱️ 时间戳 {#timestamps}

AdvantageScope 支持在所有视图中自定义时间戳的显示方式，包括时间轴、📉 [折线图](/tab-reference/line-graph)、🔢 [表格](/tab-reference/table) 和 💬 [控制台](/tab-reference/console)。

## 显示模式 {#display-modes}

你可以在首选项窗口中配置时间戳的显示模式：

- **从零开始（默认）：** 平移所有时间戳，让日志中最早的数据从零开始 (`+0.0s`)。该模式下，时间戳会带有 `+` 前缀，表示自数据起点以来经过的时间。
- **原始时间：** 直接按日志文件中记录的原始数值显示时间戳，与机器人代码里使用的数值完全一致。

:::info
从 WPILib 2027 开始，Systemcore 和仿真环境中的时间戳均以设备开机 (boot) 后的运行时长来计量。由于原始时间戳往往从一个较大的随机数值开始，软件默认提供 **从零开始** 模式，方便你更直观地查看数据。
:::

## 多日志同步 {#multi-log-synchronization}

当你 [同时打开多个日志文件](/overview/log-files/#opening-logs) 时，AdvantageScope 会自动同步并对齐它们的时间戳。在 **从零开始** 模式下，零点会设为所有已加载文件中最早的时间戳；在 **原始时间** 模式下，系统会以第一个打开的日志作为时间基准，其余日志则会相应平移以与之对齐。

## 自定义 {#customization}

要更改时间戳显示模式，请点击 `应用程序` > `首选项...` (Windows/Linux) 或 `AdvantageScope` > `设置...` (macOS)，或者直接按下 `Ctrl+,` / `Cmd+,` 打开首选项窗口，然后将 **时间戳** 设置为你需要的选项。

<img src="/img/prefs_zh-CN.webp" alt="首选项图解" height="450" />
