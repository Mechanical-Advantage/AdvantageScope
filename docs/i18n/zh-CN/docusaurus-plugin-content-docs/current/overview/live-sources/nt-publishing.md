---
sidebar_position: 3
---

# 发布 NetworkTables 数据

AdvantageScope 支持将存储在日志文件中的 NetworkTables 数据发布回 NetworkTables 服务器（例如仿真器或机器人）。可能的使用场景包括：

- 在仿真中重放比赛以进行调试。
- 在真实机器人上模拟协处理器的数据。
- 使用真实的比赛数据调试驾驶员仪表盘应用程序。

此功能需要包含完整 NetworkTables 数据捕获的日志文件，可使用 WPILib 的 [内置数据日志记录器](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) 生成。请注意，AdvantageKit 不支持此功能，因为它在仿真中提供了更完整的确定性重放。

## 入门指南

要开始发布，必须打开一个包含 NetworkTables 数据的日志文件。然后按以下步骤操作：

- **发布到机器人：** 点击 `文件` > `发布 NT 数据` > `连接到机器人`。
- **发布到仿真器：** 点击 `文件` > `发布 NT 数据` > `连接到模拟器`。

窗口顶部将显示“搜索中”或“发布中”文本，以指示数据发布的状态。在断开连接后，AdvantageScope 会尝试使用相同的设置自动重新连接。

所有字段将使用许多 AdvantageScope 选项卡所使用的 _已选时间戳_ 下的存储值进行发布。这允许通过与 AdvantageScope 内部重放相同的机制进行实时网络重放。有关更多详细信息，请参阅 [应用导航](/overview/navigation)。如果没有选择时间戳，则使用 _悬停时间戳_ 下的存储值发布字段。

要停止发布，点击 `文件` > `发布 NT 数据` > `停止发布`。

## 过滤字段

默认情况下，AdvantageScope 会发布日志文件中存储的所有 NetworkTables 字段（服务器发布的元话题除外）。某些使用场景（例如模拟协处理器）仅需要发布限定的字段集或子表。要调整允许的字段前缀集，请点击 `应用程序` > `显示首选项...` (Windows/Linux) 或 `AdvantageScope` > `设置...` (macOS) 打开首选项窗口。

“NT 发布前缀”选项可设置发布到 NetworkTables 的字段的允许前缀。如果留空，则包含所有字段。否则，可以提供以逗号分隔的前缀或字段列表。请参阅以下示例：

- “_SmartDashboard_”：包含“SmartDashboard”表中的所有字段。
- “_SmartDashboard/Auto Selector_”：仅包含“SmartDashboard/Auto Selector”表。
- “_limelight/tx,limelight/ty_”：仅包含“limelight/tx”和“limelight/ty”字段。

## 限制

:::warning

- 字段每 20 毫秒发布一次，因此原本以更高频率发布的 NetworkTables 数据将会跳过采样。
- 不会保留发布样品的原始时间戳。在时间轴上来回拖动或以不同速度重放时，保留原始时间戳是不可能的。
  :::
