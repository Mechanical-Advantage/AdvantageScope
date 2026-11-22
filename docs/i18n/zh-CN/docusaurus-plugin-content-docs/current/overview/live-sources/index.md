# 🛜 实时数据源 {#live-sources}

除了读取日志文件，AdvantageScope 的所有可视化功能也支持接收来自机器人或模拟器的实时数据。本节介绍如何连接实时数据源，支持的数据源类型如下：

- **NetworkTables：** WPILib 的主力网络通信协议。详情请参阅 [WPILib 文档](https://docs.wpilib.org/zh-cn/stable/docs/software/networktables/index.html)。
- **NetworkTables (AdvantageKit)：** 专为运行 AdvantageKit 的机器人代码设计，该模式会读取发布到 NetworkTables 中 `AdvantageKit` 表的数据。
- **Systemcore 诊断：** 连接到 Systemcore 操作系统内置的 NetworkTables 服务器，获取机器人状态、设备 IO 等诊断数据。
- **Phoenix 诊断：** 通过 HTTP 连接到 Phoenix [诊断服务器](https://pro.docs.ctr-electronics.com/en/latest/docs/troubleshooting/running-diagnostics.html)，实时串流来自 [Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/) CTRE CAN 设备的信号，体验类似 Phoenix Tuner 中的 [绘图功能](https://pro.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html)。详情请参阅 [Phoenix 诊断页面](/overview/live-sources/phoenix-diagnostics)。
- **RLOG 服务器：** AdvantageKit 支持的协议，可作为 NetworkTables 的替代方案，默认通过 5800 端口建立连接。
- **FTC Dashboard：** 适用于将遥测数据发布到 [FTC Dashboard](https://acmerobotics.github.io/ftc-dashboard) 的 FTC 机器人。

:::info
当 AdvantageScope 与 FIRST Driver Station 运行在同一台设备上时，无需任何配置即可直接连接操控站查看诊断数据（操作步骤见下文）。
:::

## 启动连接 {#starting-the-connection}

要建立实时连接，请按以下步骤操作：

- **机器人：** 点击 `文件` > `连接到机器人` > `默认` 或选择特定实时数据源
- **模拟器：** 点击 `文件` > `连接到模拟器` > `默认` 或选择特定实时数据源
- **操控站：** 点击 `文件` > `连接到操控站`

连接成功前，窗口标题栏会显示目标 IP 地址及“搜索中”提示；若连接意外断开，AdvantageScope 会自动沿用当前设置尝试重连。

## 查看实时数据 {#viewing-live-data}

连接实时数据源后，AdvantageScope 默认会将所有选项卡锁定到当前最新时刻：📉 [折线图](/tab-reference/line-graph) 和 🔢 [表格](/tab-reference/table) 等视图会自动滚动，场地和控制器等视图则会实时刷新各字段的当前值。点击导航栏中的红色箭头按钮可以切换锁定状态，方便随时暂停并回放历史数据。

<img src="/img/overview/live-sources/open-live-1.webp" alt="实时锁定/解锁按钮" />

:::tip
在折线图或时间轴中向左滚动即可解除实时锁定；一路向右滚动到底，则会重新锁定到当前时间。
:::

## 配置 {#configuration}

点击 `应用程序` > `首选项...` (Windows/Linux) 或 `AdvantageScope` > `设置...` (macOS) 打开首选项窗口。

<img src="/img/prefs_zh-CN.webp" alt="首选项图解" height="450" />

### 机器人地址 {#robot-address}

请参照 [WPILib 文档](https://docs.wpilib.org/zh-cn/stable/docs/networking/networking-introduction/ip-configurations.html#te-am-ip-notation) 的说明，输入机器人的主机名（例如 `robot.local`）或 IP 地址（例如 `10.TE.AM.2`）。通过 USB 或内置 Wi-Fi 热点连接 Systemcore 时，可点击 `文件` > `使用 Systemcore USB 地址` / `使用 Systemcore Wi-Fi 地址`，临时切换为对应的静态 IP 地址。

### 实时模式 {#live-mode}

选择 NetworkTables 作为实时数据源时，可切换以下两种实时模式：

- **低带宽（默认）：** AdvantageScope 只向服务器请求当前正在使用的字段，选中字段之前已经发布的数据不会保留。在网络带宽受限或机器人发布了大量字段时，**强烈建议**使用此模式。
- **日志记录：** 无论字段是否正在界面中使用，AdvantageScope 都会请求全部字段的数据。这样一来，你可以暂停实时数据流并随时回溯查看此前未选中的字段（见下文）。此模式在开发调试时非常实用，但**切勿在带宽受限时使用**。

### 清除实时数据 {#discard-live-data}

在实时连接过程中，数据会缓存在本地以支持历史回放（参见上文“查看实时数据”）。为避免内存占用过高，默认只保留最近 20 分钟的数据。你也可以在设置中缩短保留时长以节省内存，或选择“从不”以持续保存所有实时数据。
