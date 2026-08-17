---
sidebar_position: 5
---

# ⏱️ 时间戳 {#timestamps}

AdvantageScope 支持在所有视图中自定义时间戳的显示选项，包括时间轴、📉 [折线图](/tab-reference/line-graph)、🔢 [表格](/tab-reference/table) 和 💬 [控制台](/tab-reference/console)。

## 显示模式 {#display-modes}

时间戳显示模式可以在偏好设置窗口中配置：

- **从零开始（默认）：** 偏移所有时间戳，使日志中最早的数据从零开始（`+0.0s`）。在此模式下显示的时间戳带有 `+` 前缀，表示自数据开始以来经过的时间。
- **原始时间：** 使用日志文件中记录的原始数值显示时间戳，与机器人代码使用的精确值一致。

:::info
从 WPILib 2027 开始，Systemcore 和仿真中均使用自设备启动（boot）以来的时间来测量时间戳。由于原始时间戳可能会从任意大数开始，因此提供了 **从零开始** 作为更直观的查看选项。
:::

## 多日志同步 {#multi-log-synchronization}

当 [同时打开多个日志文件](/overview/log-files/#opening-logs) 时，AdvantageScope 会同步并对齐它们的时间戳。在 **从零开始** 模式下，零点设置为所有已加载文件中最早的时间戳。在 **原始时间** 模式下，时间戳使用第一个打开的日志的时间基准显示，任何其他日志都会进行偏移以与其对齐。

## 自定义 {#customization}

要更改时间戳显示模式，请通过点击 `App` > `显示偏好设置...`（Windows/Linux）或 `AdvantageScope` > `设置...`（macOS），或按下 `Ctrl+,` / `Cmd+,` 打开偏好设置窗口。将 **时间戳** 设置更新为所需选项。

<img src="/img/prefs_zh-CN.webp" alt="偏好设置图表" height="450" />
