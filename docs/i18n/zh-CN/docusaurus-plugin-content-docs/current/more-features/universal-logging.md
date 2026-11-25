---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🪐 使用 WPILOG 进行通用日志记录 {#universal-logging-with-wpilog}

WPILOG 是 WPILib 生态系统中通用的标准开放日志格式。借助 AdvantageScope，WPILOG 可以作为多种日志文件和格式的通用容器。这意味着单个 `.wpilog` 文件就能包含多个以 AdvantageScope 支持的任意格式编码的数据流，包括 CSV、厂商专用日志或其他 WPILOG 文件。

该功能旨在简化诊断流程，**将机器人的所有诊断数据收集到单个通用日志文件中**；即使需要从第三方库或外部服务采集数据，也无需再在单场比赛后下载、关联或同步多个日志文件。例如，单个 WPILOG 文件可以包含：

- 通过 WPILib 的 `Telemetry` API 或 NetworkTables 发布的标准机器人遥测数据。
- 厂商库记录的高频设备信号。
- 来自协处理器和外部服务、记录为 CSV 或 WPILOG 的状态数据。
- ……以及更多内容！

所有这些数据都会在 AdvantageScope 中显示在同一个统一的树形结构下，如下图所示，一个 WPILOG 文件中同时包含了多个厂商采集的设备信号。

:::note
在 Systemcore 上，[URCL](https://github.com/Mechanical-Advantage/URCL) 已被官方的 REV [状态日志记录器](https://docs.revrobotics.com/revlib/logs)取代。通过 AdvantageScope 的通用日志记录功能，官方状态日志记录器可以将所有 REV 设备的数据记录到单个 WPILOG 文件中（类似于 URCL）。
:::

<img src="/img/more-features/universal-logging-1.webp" alt="侧边栏中显示多个厂商日志的 WPILOG 文件。" />

_上图所示为英文界面。_

:::tip
AdvantageKit 用户还可以利用 XZ 压缩，大幅减小存储在 WPILOG 中的第三方日志体积。详情请参阅 AdvantageKit 文档中关于日志数据接收器的部分。
:::

## 实验性功能：厂商日志记录 {#experimental-vendor-logging}

许多机器人项目会同时生成多个日志文件：一个用于 WPILib/AdvantageKit 遥测的标准 WPILOG 文件，以及来自厂商库的专有文件。通用日志记录消除了这种拆分，直接将这些厂商日志嵌入主 `.wpilog` 文件中。请参阅下方针对 WPILib 和 AdvantageKit 的说明。

:::note
由于此方法未获厂商官方支持，如需支持请前往 AdvantageScope 的 [Issues 页面](https://github.com/Mechanical-Advantage/AdvantageScope/issues)或发送邮件至 software@team6328.org。有关如何导出原始日志文件以进行诊断的详情，请参阅[导出厂商数据](#exporting-vendor-data)。
:::

<Tabs groupId="library">
{/*
<TabItem value="wpilib-java" label="Java" default>

下载 [`VendorLogCapture.java`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.java) 类并将其放入你的机器人项目中。该类会自动将厂商日志数据采集到当前活动的 `DataLog` 中，应如下所示在 `Robot` 构造函数中进行配置。你必须选择一个合适的目录（推荐使用 `/home/systemcore/logs/`）用于在采集期间临时暂存厂商日志。详情请参阅[工作原理](#how-it-works)部分。

```java
public Robot() {
  // 正常启动 WPILib 的 DataLogManager
  DataLogManager.start();

  // 启用从临时暂存目录采集厂商日志
  // 即使使用 U 盘，我们也建议将厂商日志暂存在内部存储上
  // （厂商日志在采集后不会持久保留）
  VendorLogCapture.start(DataLogManager.getLog(), "/home/systemcore/logs/");

  // 在启用日志采集之后再启动厂商日志记录器
  // 如果支持配置，输出目录必须与上方路径一致
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

下载 [`VendorLogCapture.hpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.hpp) 和 [`VendorLogCapture.cpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.cpp) 文件并将其放入你的机器人项目中。该类会自动将厂商日志数据采集到当前活动的 `DataLog` 中，应如下所示在 `Robot` 构造函数中进行配置。你必须选择一个合适的目录（推荐使用 `/home/systemcore/logs/`）用于在采集期间临时暂存厂商日志。详情请参阅[工作原理](#how-it-works)部分。

```cpp
Robot::Robot() {
  // 正常启动 WPILib 的 DataLogManager
  wpi::DataLogManager::Start();

  // 启用从临时暂存目录采集厂商日志
  // 即使使用 U 盘，我们也建议将厂商日志暂存在内部存储上
  // （厂商日志在采集后不会持久保留）
  VendorLogCapture::Start(wpi::DataLogManager::GetLog(), "/home/systemcore/logs/");

  // 在启用日志采集之后再启动厂商日志记录器
  // 如果支持配置，输出目录必须与上方路径一致
  VendorLogger::SetPath("/home/systemcore/logs/");
  VendorLogger::Start();
}
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

下载 [`vendor_log_capture.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/vendor_log_capture.py) 文件并将其放入你的机器人项目中。该辅助模块会自动将厂商日志数据采集到当前活动的 `DataLog` 中，应如下所示在 `robotInit` 中进行配置。你必须选择一个合适的目录（推荐使用 `/home/systemcore/logs/`）用于在采集期间临时暂存厂商日志。详情请参阅[工作原理](#how-it-works)部分。

```python
class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # 正常启动 WPILib 的 DataLogManager
        wpilib.DataLogManager.start()

        # 启用从临时暂存目录采集厂商日志
        # 即使使用 U 盘，我们也建议将厂商日志暂存在内部存储上
        # （厂商日志在采集后不会持久保留）
        VendorLogCapture.start(wpilib.DataLogManager.get_log(), "/home/systemcore/logs/")

        # 在启用日志采集之后再启动厂商日志记录器
        # 如果支持配置，输出目录必须与上方路径一致
        VendorLogger.set_path("/home/systemcore/logs/")
        VendorLogger.start()
```

</TabItem>
*/}
<TabItem value="wpilib" label="WPILib">

:::warning
通过 DataLogManager 进行厂商日志采集的功能暂不可用，因为该功能依赖 WPILib 的上游更改。我们很快会分享更多信息！
:::

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

:::note
此功能需要 AdvantageKit v27.0.0-beta-1，该版本即将发布。你可以在 GitHub 的[发布页面](https://github.com/Mechanical-Advantage/AdvantageKit/releases)查看当前状态。
:::

厂商日志采集已内置于 AdvantageKit 中，可按如下方式启用。你必须选择一个合适的目录（推荐使用 `/home/systemcore/logs/`）用于在采集期间临时暂存厂商日志。详情请参阅[工作原理](#how-it-works)部分。

```java
public Robot() {
  // 启用从临时暂存目录采集厂商日志
  // 即使使用 U 盘，我们也建议将厂商日志暂存在内部存储上
  // （厂商日志在采集后不会持久保留）
  Logger.setVendorLogDirectory("/home/systemcore/logs/");

  // 正常启动 AdvantageKit
  Logger.start();

  // 在启动 AdvantageKit 日志记录器之后再启动厂商日志记录器
  // 如果支持配置，输出目录必须与上方路径一致
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

:::info
无论选择哪种日志数据接收器，厂商日志都只能通过下载 WPILOG 文件来查看。由于所采集日志数据的结构限制，不支持实时串流。
:::

</TabItem>
</Tabs>

请注意，部分厂商日志记录器会在实例化对应设备类（例如 `SparkMax`）时*立即*开始写入数据。我们建议等到 `Robot` 构造函数的末尾再实例化硬件对象，以确保日志能够被完整采集。

### 工作原理 {#how-it-works}

1. **采集：** 机器人程序同时运行标准 WPILib 日志记录和厂商日志记录器。一个轻量级辅助程序会定期读取厂商日志记录器写入的新数据，并将原始数据块直接打包到当前活动的 `DataLog` 数据流中。
2. **存储：** 整个合并后的日志保存为单个 `.wpilog` 文件（例如保存在连接到 Systemcore 的 U 盘上）。机器人上创建的临时厂商日志文件不会在重启后保留，从而避免占用过多存储空间。
3. **可视化：** 当 AdvantageScope 打开 `.wpilog` 文件时，它会自动发现所有内嵌的日志条目、解码其内容，并将所有字段与标准遥测数据一起合并到侧边栏树形结构中。
4. **提取：** 如果你需要打开厂商日志以获取技术支持或进行高级诊断，可以按照[导出厂商数据](#exporting-vendor-data)中的说明从 `.wpilog` 中无损提取原始厂商日志文件。

外部日志数据使用类型字符串遵循 `log:<format>` 约定的原始条目保存到 WPILOG 格式中。解析此类字段时，AdvantageScope 会按时间顺序拼接该条目的所有二进制记录，并将生成的载荷作为指定格式的独立日志进行解码。解码后的信号随后会合并到主字段树中，并与现有数据自动同步。

:::tip
使用 WPILOG 进行通用日志记录并不局限于厂商日志；任何与 AdvantageScope 兼容的日志格式都可以使用相同的约定嵌入 WPILOG 中。
:::

### 导出厂商数据 {#exporting-vendor-data}

虽然可以直接在 AdvantageScope 中浏览厂商日志数据，但有时也可能需要提取由原始库生成的原始厂商日志（例如在厂商专用工具中进行检查）。

如需直接从 AdvantageScope 导出单个子日志，请在侧边栏中右键点击该子日志条目，然后选择**导出原始日志...**。

如需批量提取，还可以使用 [`extract_vendor_logs.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/extract_vendor_logs.py) Python 脚本，它会在一个或多个 `.wpilog` 或 `.wpilogxz` 文件中搜索所有集成的厂商日志，并将其导出为独立文件：

```bash
pip3 install robotpy-wpiutil # 必需依赖
python3 extract_vendor_logs.py path/to/source.wpilog
```
