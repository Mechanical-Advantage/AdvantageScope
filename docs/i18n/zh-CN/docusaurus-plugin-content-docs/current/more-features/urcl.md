---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 Unofficial REV-Compatible Logger {#unofficial-rev-compatible-logger}

:::info
2026 版本新增了 REVLib 包含的官方日志记录解决方案，用于将来自 Spark Max 和 Spark Flex 的数据保存到 REV CAN 日志 (`.revlog`) 中。有关详细信息，请参阅 [此处](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger)。这些文件可以直接在 AdvantageScope 中打开，但无法与其他数据源精确同步。

AdvantageScope 的 _非官方_ REV 兼容日志记录器 (URCL) 在 2026 赛季也将继续面向队伍提供，以确保平滑过渡并提供与以往赛季相同的功能。我们将在稍后分享关于 2027 赛季及以后日志选项的更多细节。
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) 是一个适用于 Java、C++ 和 Python 的日志记录库，可自动记录来自 Spark Max 和 Spark Flex 的数据。这使得能够实现类似于 CTRE 的 [Tuner X 绘图功能](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) 和 [Phoenix 6 信号日志记录器](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) 的所有设备的实时绘图和日志记录。

设置完成后，来自所有 Spark Max 和 Spark Flex 设备的周期性 CAN 帧都会发布到 NetworkTables 或 DataLog。当使用 NetworkTables 时，WPILib 的 [DataLogManager](https://docs.wpilib.org/zh-cn/stable/docs/software/telemetry/datalog.html) 可用于将数据捕获到日志文件中。这些帧可在 AdvantageScope 中查看（参阅 [管理日志文件](/overview/log-files) 和 [连接到实时数据源](/overview/live-sources)）。

- **自动捕获所有信号**，**新设备无需手动设置**。
- **捕获每一个帧**，即使状态帧周期比机器人循环周期更快。
- 记录的帧带有 **基于 CAN RX 时间的时间戳**，与用户代码中的传统日志记录相比，能够使用 [SysId](https://docs.wpilib.org/zh-cn/stable/docs/software/pathplanning/system-identification/introduction.html) 实现更准确的加速度表征（见下文“SysId 使用”）。
- 日志记录 **高度高效**；操作采用多线程，每个 20 毫秒周期运行时间低于 80µs，即使在记录大量设备时也是如此。
- **REVLib 的所有功能均不受影响。**

:::info
由于此库不是官方 REV 工具，支持咨询应提交至 URCL 的 [issues 页面](https://github.com/Mechanical-Advantage/URCL/issues) 或发送至 software@team6328.org，而不是 REV 的支持联系方式。
:::

## 设置 {#setup}

在 VSCode 中使用依赖项管理器，按照安装 [第三方库](https://docs.wpilib.org/zh-cn/stable/docs/software/vscode-overview/3rd-party-libraries.html) 的说明安装 URCL vendordep。或者，可以使用以下 vendor JSON URL：

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL 默认发布到 NetworkTables，在其中可以通过启用 WPILib 的 DataLogManager 将数据保存到日志文件。或者，URCL 可以直接记录到 DataLog。日志记录器应在 `robotInit` 中启动，如下所示。

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // 如果发布到 NetworkTables 和 DataLog
  DataLogManager.start();
  URCL.start();

  // 如果仅记录到 DataLog
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // 如果发布到 NetworkTables 和 DataLog
  frc::DataLogManager::Start();
  URCL::Start();

  // 如果仅记录到 DataLog
  URCL::Start(frc::DataLogManager::GetLog());
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import urcl
import wpilib

class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # 如果发布到 NetworkTables 和 DataLog
        wpilib.DataLogManager.start()
        urcl.start()

        # 如果仅记录到 DataLog
        urcl.start(wpilib.DataLogManager.getLog())
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
public Robot() {
  // ...
  Logger.registerURCL(URCL.startExternal());
  Logger.start();
}
```

:::warning
与 AdvantageKit 的 URCL 兼容性仅为方便起见而提供；记录到日志的数据在重放中 **不可用**。**REV 电机控制器仍必须是具有已定义输入的 IO 实现的一部分，以支持重放**。
:::

</TabItem>
</Tabs>

为了更轻松地在日志中标识设备，可以通过向 `start()` 或 `startExternal()` 方法传递映射对象来为 CAN ID 分配别名。键是 CAN ID，值是在日志中使用的名称字符串。未分配别名的任何设备将使用其默认名称进行记录。

:::warning
为了最大程度减少 CAN 使用率，Spark 大多数状态帧 **默认处于禁用状态**，直到调用关联的 getter 方法。这些已禁用的状态帧中包含的任何数据在 URCL 日志中都将不可用。

有关更多详细信息，请查看 [REVLib 文档](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods)。我们建议在配置 Spark 时使用 [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) 以手动启用希望在日志文件中包含的任何信号。
:::

## SysId 使用 {#sysid-usage}

1. 按照如上所示设置 URCL 后，为机构日志消费者使用 `null` 配置 SysId 例程。下面显示了 Java 的示例。此配置可在子系统类内部进行。

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// 创建 SysId 例程
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // 没有日志消费者，因为数据由 URCL 记录
    subsystem
  )
);

// 下面的方法返回 Command 对象
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
// 创建 SysId 例程
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(
    null, null, null,
    (state) -> Logger.recordOutput("SysIdTestState", state.toString())
  ),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // 没有日志消费者，因为数据由 URCL 记录
    subsystem
  )
);

// 下面的方法返回 Command 对象
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. 在机器人上运行 SysId 例程。SysId 命令可以配置为自动例程或连接到按键触发器。

3. 下载日志文件并在 AdvantageScope 中打开它。在菜单栏中，转到 `文件` > `导出数据...`。将格式设置为 “WPILOG”，并将字段集设置为“包含生成字段”。点击保存图标并选择保存日志的位置。

:::warning
机器人日志文件必须在 _使用 SysId 分析器打开它之前_ 由 AdvantageScope 打开并导出。这是将 URCL 记录的 CAN 数据转换为与 SysId 兼容格式所必需的。
:::

4. 通过在 VSCode 命令面板中搜索 “WPILib: Start Tool”并选择“SysId”（或在 Windows 上使用桌面启动器）来打开 SysId 分析器。点击“Open data log file...”打开导出的日志文件。

5. 选择以下字段以使用默认编码器运行分析。也可以使用来自辅助编码器（替代编码器、外部编码器、模拟编码器、绝对编码器等）的位置和速度数据。

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
SysId 生成的增益将使用配置 Spark Max/Flex 报告的单位（使用 [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) 和 [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>)）。默认情况下，这些是没有应用齿轮比的圈数 (rotations) 和 RPM。如果记录数据时使用的单位与所需单位不匹配，可以在分析期间在 SysId 中调整缩放比例。
:::
