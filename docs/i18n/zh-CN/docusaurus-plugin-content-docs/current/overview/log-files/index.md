# 📂 日志文件 {#log-files}

## 受支持的格式 {#supported-formats}

- **WPILOG (.wpilog)** - 由 WPILib 的 [内置数据日志记录](https://docs.wpilib.org/zh-cn/stable/docs/software/telemetry/datalog.html) 和 AdvantageKit 生成。[URCL](/more-features/urcl) 可用于将来自 REV 电机控制器的信号捕获到 WPILOG 文件中。
- **操控站日志 (.dslog 和 .dsevents)** - 由 [FRC Driver Station](https://docs.wpilib.org/zh-cn/stable/docs/software/driverstation/driver-station.html) 生成。打开任何一种日志类型时，AdvantageScope 都会自动搜索相应的日志文件。
- **Hoot (.hoot)** - 由 CTRE 的 Phoenix 6 [信号日志记录器](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) 生成。
- **REVLOG (.revlog)** - 由 REV Robotics 的 [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) 生成。
- **Road Runner (.log)** - 由 FTC 的 [Road Runner](https://github.com/acmerobotics/road-runner) 库生成。
- **CSV (.csv)** - 逗号分隔值，与 AdvantageScope 在“CSV（表格）”或“CSV（列表）”模式下 [导出](/overview/log-files/export) 的格式匹配。有关详细信息，请参阅 [此处](#csv-formatting)。
- **RLOG (.rlog)** - 旧版格式，由 AdvantageKit 2022 生成。

:::info
只有在同意 CTRE 的 [最终用户许可协议](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt) 后才能打开 Hoot 日志文件。首次打开 Hoot 日志文件时，AdvantageScope 会显示提示以确认同意这些条款。
:::

## 打开日志 {#opening-logs}

在菜单栏中，点击 `文件` > `打开日志...`，然后从本地磁盘中选择一个或多个日志文件。从系统文件浏览器将日志文件拖放到 AdvantageScope 图标或窗口中也可以将其打开。

:::info
如果同时打开多个文件，时间戳将自动对齐。这可以轻松比较来自多个数据源的日志文件。
:::

<img src="/img/overview/log-files/open-file-1.png" alt="打开保存的日志" />

## 追加日志 {#adding-new-logs}

打开日志文件后，可以轻松地将其他日志添加到可视化中。时间戳将自动重新对齐，以与现有数据保持同步。

在菜单栏中，点击 `文件` > `添加新日志...`，然后选择一个或多个日志文件以添加到当前可视化中。来自每个日志的字段将记录在名为 `Log0`、`Log1` 等表格下。

## 从机器人下载 {#downloading-from-the-robot}

<details>
<summary>配置</summary>

点击 `应用程序` > `显示首选项...` (Windows/Linux) 或 `AdvantageScope` > `设置...` (macOS) 打开首选项窗口。更新机器人地址和日志文件夹。

<img src="/img/prefs.png" alt="偏好设置图解" />
</details>

点击 `文件` > `下载日志...` 打开下载窗口。连接到机器人后，可用的日志将显示在列表中，最新日志位于顶部。选择一个或多个要下载的日志文件（按住 shift 点击选择范围或使用 **cmd/ctrl + A** 全选）。然后点击 ↓ 符号并选择保存位置。

:::info
CTRE 的 [信号日志记录器](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) 使用非标准格式，将日志分组在子文件夹中。在列表中选择一个或多个文件夹可以组形式下载日志文件。
:::

:::tip
当下载多个文件时，AdvantageScope 会跳过目标文件夹中已存在的任何文件。
:::

<img src="/img/overview/log-files/open-file-2.png" alt="下载日志文件" />

## CSV 格式化 {#csv-formatting}

CSV 列名必须为“Timestamp, Key, Value”或“Timestamp, (Key), (Key), etc”。时间戳值以秒为单位。下表显示了常见值类型的预期格式。请注意，将日志数据导出并重新导入为 CSV 是 _有损_ 的，因为 CSV 不支持复杂的字段类型。

- **布尔值：** `true` 或 `false`
- **字符串：** `"(value)"`
  - 示例：`"Hello world"`
- **数组：** `[(value); (value); (value)]`
  - 示例：`[1; 2; 3]`
- **字节：** 十六进制，用 `-` 分隔
  - 示例：`4d-41-36-33-32-38`
