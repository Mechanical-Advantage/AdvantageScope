# 🛜 实时数据源 {#live-sources}

AdvantageScope 中的所有可视化功能除了处理日志文件外，均旨在接收来自机器人或仿真器的实时数据。本节描述如何连接到实时数据源。AdvantageScope 支持以下实时数据源：

- **NetworkTables:** 这是 WPILib 的主要网络协议。有关更多详细信息，请参阅 [WPILib 文档](https://docs.wpilib.org/zh-cn/stable/docs/software/networktables/index.html)。
- **NetworkTables (AdvantageKit):** 此模式专为运行 AdvantageKit 的机器人代码设计，该代码发布到 NetworkTables 中的 `AdvantageKit` 表。
- **Systemcore Diagnostics:** 此模式连接到 Systemcore OS 使用的内置 NetworkTables 服务器，其中包括机器人状态和设备 IO 等诊断数据。
- **Phoenix Diagnostics:** 此模式使用 HTTP 连接到 Phoenix [诊断服务器](https://pro.docs.ctr-electronics.com/en/latest/docs/troubleshooting/running-diagnostics.html)，允许通过 [Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/) 从 CTRE CAN 设备串流数据。这类似于 Phoenix Tuner 中的 [绘图功能](https://pro.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html)。有关更多信息，请参阅 [此页面](/overview/live-sources/phoenix-diagnostics)。
- **RLOG Server:** 该协议由 AdvantageKit 支持，作为 NetworkTables 的替代方案。默认在 5800 端口发起连接。
- **FTC Dashboard:** 此模式集成了发布数据到 [FTC Dashboard](https://acmerobotics.github.io/ftc-dashboard) 的 FTC 机器人。

:::info
当与 DS 应用程序在同一台设备上运行时，AdvantageScope 可以连接到 FIRST Driver Station 以查看诊断数据。无需进行任何配置（请参阅下文说明）。
:::

## 启动连接 {#starting-the-connection}

要启动实时连接，请按以下步骤操作：

- **机器人：** 点击 `文件` > `连接到机器人` > `默认` 或特定的实时数据源
- **仿真器：** 点击 `文件` > `连接到模拟器` > `默认` 或特定的实时数据源
- **操控站：** 点击 `文件` > `连接到操控站`

窗口标题将显示 IP 地址和“搜索中”文本，直到目标连接成功。在断开连接后，AdvantageScope 会尝试使用相同设置自动重新连接。

## 查看实时数据 {#viewing-live-data}

当连接到实时数据源时，AdvantageScope 默认将所有选项卡锁定到当前时间。诸如 📉 [折线图](/tab-reference/line-graph) 和 🔢 [表格](/tab-reference/table) 等视图会自动滚动，而场地和控制器等视图则显示每个字段的当前值。点击导航栏中的红色箭头按钮可以切换此锁定，从而允许查看和重放过去的数据。

<img src="/img/overview/live-sources/open-live-1.png" alt="实时锁定/解锁按钮" />

:::tip
在折线图或时间轴中向左滚动会解锁与当前时间的关联，而一路向右滚动将重新锁定到当前时间。
:::

## 配置 {#configuration}

点击 `应用程序` > `显示首选项...` (Windows/Linux) 或 `AdvantageScope` > `设置...` (macOS) 打开首选项窗口。

<img src="/img/prefs.png" alt="首选项图解" height="350" />

### 机器人地址 {#robot-address}

按照 [WPILib 文档](https://docs.wpilib.org/zh-cn/stable/docs/networking/networking-introduction/ip-configurations.html#te-am-ip-notation) 中所述，使用 10.TE.AM.2 格式的 IP 地址输入机器人地址。通过 USB 或内置 Wi-Fi 热点连接到 Systemcore 时，点击 `文件` > `使用 Systemcore USB 地址`/`使用 Systemcore Wi-Fi 地址` 以临时使用正确的静态 IP 地址。

### 实时模式 {#live-mode}

当使用 NetworkTables 作为实时数据源时，可以选择以下实时模式：

- **低带宽（默认）：** AdvantageScope 仅向服务器请求当前正在被使用的字段的数据。选择某个字段之前发布的数据将不可用。当在网络带宽有限的环境中运行或发布大量字段时，**强烈建议**使用此模式。
- **日志记录：** 无论是否正在使用，AdvantageScope 都会请求所有字段的数据。这意味着可以通过暂停实时数据流来回顾过去的字段（见下文）。此模式通常在开发期间非常有用，但**不应在带宽受限时使用**。

### 丢弃实时数据 {#discard-live-data}

在实时连接期间，数据被存储在本地以允许重放过去的数据（参阅上文“查看实时数据”）。为避免过高的内存占用，默认在 20 分钟后丢弃数据。可以选择更短的时间段以减少内存使用，或者选择“从不”以无限期存储实时数据。
