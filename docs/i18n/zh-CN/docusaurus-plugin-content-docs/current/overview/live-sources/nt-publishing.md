---
sidebar_position: 3
---

# 发布 NetworkTables 数据 {#publishing-networktables-data}

AdvantageScope 支持将日志文件中记录的 NetworkTables 数据重新发布回 NetworkTables 服务器（如模拟器或机器人）。常见用途包括：

- 在仿真环境中重放真实比赛过程以辅助调试。
- 在真机上模拟协处理器发出的数据。
- 使用真实的比赛数据调试驾驶员仪表盘应用。

使用此功能需要一份完整记录了 NetworkTables 数据的日志文件，可通过 WPILib 的 [内置数据日志记录器](https://docs.wpilib.org/zh-cn/stable/docs/software/telemetry/datalog.html) 生成。请注意，AdvantageKit 不支持此功能，因为 AdvantageKit 本身已在仿真中提供了更完善的确定性重放机制。

## 入门指南 {#getting-started}

开始发布前，请先打开一个包含 NetworkTables 数据的日志文件，然后按以下步骤操作：

- **发布到机器人：** 点击 `文件` > `发布 NT 数据` > `连接到机器人`。
- **发布到模拟器：** 点击 `文件` > `发布 NT 数据` > `连接到模拟器`。

窗口顶部会显示“搜索中”或“发布中”以提示当前状态。连接断开后，AdvantageScope 会自动沿用相同设置尝试重连。

发布的所有字段均取自 AdvantageScope 各选项卡共用的**已选时间戳**对应的历史值，这样就能像本地回放一样控制实时网络回放（详情请参阅 [应用导航](/overview/navigation)）。如果当前未选中任何时间戳，则会发布**悬停时间戳**对应的值。

如需停止发布，请点击 `文件` > `发布 NT 数据` > `停止发布`。

## 过滤字段 {#filtering-fields}

默认情况下，AdvantageScope 会发布日志中存储的所有 NetworkTables 字段（服务器发布的元话题除外）。在某些场景下（例如模拟协处理器），你可能只想发布部分字段或子表。此时可以点击 `应用程序` > `显示首选项...` (Windows/Linux) 或 `AdvantageScope` > `设置...` (macOS) 打开首选项窗口进行调整。

通过“NT 发布前缀”选项，你可以限定允许发布到 NetworkTables 的字段前缀。留空表示包含全部字段；否则可填写以逗号分隔的前缀或字段列表，示例如下：

- “_Telemetry_”：包含“Telemetry”表中的所有字段。
- “_Telemetry/Drive_”：仅包含“Telemetry/Drive”子表。
- “_limelight/tx,limelight/ty_”：仅包含“limelight/tx”和“limelight/ty”这两个字段。

## 限制 {#limitations}

:::warning

- 字段每 20 毫秒发布一次，因此原始发布频率更高的 NetworkTables 数据会出现跳帧（部分采样点被跳过）。
- 发布时不会保留采样点的原始时间戳——在时间轴上来回拖动或变速回放时，保留原始时间戳本身也无法实现。
  :::
