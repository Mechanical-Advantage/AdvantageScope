# 📂 日志文件 {#log-files}

## 受支持的格式 {#supported-formats}

- **WPILOG (.wpilog)** - 由 WPILib [内置数据日志记录功能](https://docs.wpilib.org/zh-cn/stable/docs/software/telemetry/datalog.html) 与 AdvantageKit 生成。也可搭配 [URCL](/more-features/urcl) 将 REV 电机控制器的信号采集到 WPILOG 文件中。
- **Hoot (.hoot)** - 由 CTRE Phoenix 6 [信号日志记录器](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) 生成。
- **REVLOG (.revlog)** - 由 REV Robotics [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) 生成。
- **Road Runner (.log)** - 由 FTC 的 [Road Runner](https://github.com/acmerobotics/road-runner) 库生成。
- **CSV (.csv)** - 逗号分隔值文件，格式需与 AdvantageScope 在“CSV (表格)”或“CSV (列表)”模式下 [导出](/overview/log-files/export) 的文件一致。详情请参阅 [下文](#csv-formatting)。
- **NI 操控站日志 (.dslog 和 .dsevents)** - 旧版格式，由 NI [FRC Driver Station](https://docs.wpilib.org/zh-cn/stable/docs/software/driverstation/driver-station.html) (2010–2026) 生成。打开其中任意一种文件时，AdvantageScope 都会自动查找对应的另一份日志文件。
- **RLOG (.rlog)** - 旧版格式，由 AdvantageKit 2022 生成。

:::info
打开 Hoot 日志文件前，必须先同意 CTRE 的 [最终用户许可协议](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt)。首次打开 Hoot 日志文件时，AdvantageScope 会弹出确认提示。
:::

## 打开日志 {#opening-logs}

在菜单栏中点击 `文件` > `打开日志...`，然后从本地磁盘选择一个或多个日志文件；也可以直接将日志文件从系统文件管理器拖放到 AdvantageScope 图标或窗口中打开。

:::info
如果同时打开多个文件，时间戳会自动对齐，方便你对比不同来源的日志数据。有关时间戳显示选项的详情，请参阅 [时间戳](/more-features/timestamps) 页面。
:::

<img src="/img/overview/log-files/open-file-1.webp" alt="打开保存的日志" />

_上图所示为英文界面。_

## 追加日志 {#adding-new-logs}

打开日志文件后，你还可以随时向当前视图中追加更多日志，时间戳会自动重新对齐以保持数据同步。

在菜单栏中点击 `文件` > `添加新日志...`，选择一个或多个日志文件即可加入当前视图。每个新日志的字段会分别归类在 `Log0`、`Log1` 等表下。

## 从机器人下载 {#downloading-from-the-robot}

<details>
<summary>配置</summary>

点击 `应用程序` > `显示首选项...` (Windows/Linux) 或 `AdvantageScope` > `设置...` (macOS) 打开首选项窗口，更新机器人地址和日志路径。

<img src="/img/prefs_zh-CN.webp" alt="首选项图解" height="450" />
</details>

点击 `文件` > `下载日志...` 打开下载窗口（支持 Systemcore 和 roboRIO）。连接机器人后，列表会按时间倒序列出可用日志，最新的排在最上方。勾选一个或多个日志文件或文件夹（按住 Shift 点击可连续多选，或按 **Cmd/Ctrl + A** 全选），然后点击 ↓ 图标并选择保存位置。

:::tip
批量下载多个文件时，AdvantageScope 会自动跳过目标文件夹中已存在的文件。
:::

<img src="/img/overview/log-files/open-file-2.webp" alt="下载日志文件" height="350" />

_上图所示为英文界面。_

## CSV 格式化 {#csv-formatting}

CSV 列名必须为“Timestamp, Key, Value”或“Timestamp, (Key), (Key), etc”，时间戳单位为秒。常见数据类型的格式要求如下。请注意，将日志数据导出为 CSV 再重新导入是*有损*操作，因为 CSV 无法表达复杂字段类型。

- **布尔值：** `true` 或 `false`
- **字符串：** `"(value)"`
  - 示例：`"Hello world"`
- **数组：** `[(value); (value); (value)]`
  - 示例：`[1; 2; 3]`
- **字节：** 十六进制，用 `-` 分隔
  - 示例：`4d-41-36-33-32-38`
