---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 URCL (非官方 REV 兼容日志记录器) {#unofficial-rev-compatible-logger}

:::info
从 2026 版本起，REVLib 提供了官方日志方案，可将 Spark Max 和 Spark Flex 的数据保存为 REV CAN 日志 (`.revlog`)。详情请参阅 [此处](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger)。这些文件可以直接在 AdvantageScope 中打开，但无法与其他数据源精确同步。

为了帮助队伍平滑过渡并保持与往年赛季一致的功能体验，AdvantageScope 的 _非官方_ REV 兼容日志记录器 (URCL) 在 2026 赛季仍将继续提供。关于 2027 赛季及以后的日志方案，我们将在后续公布更多细节。
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) 是一个适用于 Java、C++ 和 Python 的日志库，能够自动记录来自 Spark Max 和 Spark Flex 的数据。借助它，你可以像使用 CTRE 的 [Tuner X 绘图功能](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) 和 [Phoenix 6 信号日志记录器](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) 一样，对所有设备进行实时绘图和日志记录。

配置完成后，所有 Spark Max 和 Spark Flex 设备的周期性 CAN 帧都会发布到 NetworkTables 或 DataLog。如果使用 NetworkTables，可以配合 WPILib 的 [DataLogManager](https://docs.wpilib.org/zh-cn/stable/docs/software/telemetry/datalog.html) 将数据保存至日志文件。随后你就可以在 AdvantageScope 中查看这些帧数据（参阅 [管理日志文件](/overview/log-files) 和 [连接到实时数据源](/overview/live-sources)）。

- **自动捕获所有信号**，添加 **新设备时无需手动配置**。
- **捕获每一帧数据**，即便状态帧周期比机器人循环周期更快也不会遗漏。
- 日志帧采用 **基于 CAN RX 时间的时间戳**；与在用户代码中进行传统日志记录相比，这能让你在使用 [SysId](https://docs.wpilib.org/zh-cn/stable/docs/software/pathplanning/system-identification/introduction.html) 时获得更准确的加速度表征（见下文“SysId 使用”）。
- 日志记录 **非常高效**：操作采用多线程执行，即使同时记录大量设备，每个 20 毫秒周期的运行耗时也低于 80 微秒。
- **不会影响 REVLib 的任何功能。**

:::info
由于该库并非 REV 官方工具，如果你遇到问题或需要技术支持，请前往 URCL 的 [issues 页面](https://github.com/Mechanical-Advantage/URCL/issues) 提交反馈，或发送邮件至 software@team6328.org，切勿联系 REV 官方客服。
:::

## 设置 {#setup}

在 VSCode 中使用依赖项管理器，按照安装 [第三方库](https://docs.wpilib.org/zh-cn/stable/docs/software/vscode-overview/3rd-party-libraries.html) 的步骤安装 URCL 供应商依赖 (vendordep)。你也可以使用以下 vendor JSON URL：

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL 默认将数据发布到 NetworkTables，你可以启用 WPILib 的 DataLogManager 将其保存到日志文件；或者，也可以让 URCL 直接写入 DataLog。请在 `robotInit` 中启动日志记录器，如下所示：

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
URCL 对 AdvantageKit 的兼容仅出于使用便利考虑，记录到日志中的数据 **无法用于重放 (replay)**。**如需支持重放，REV 电机控制器仍必须纳入带有明确输入定义的 IO 实现中。**
:::

</TabItem>
</Tabs>

为了方便在日志中识别设备，你可以在调用 `start()` 或 `startExternal()` 方法时传入一个映射对象，为 CAN ID 分配别名。映射的键为 CAN ID，值为日志中使用的名称字符串；未分配别名的设备则会使用默认名称记录。

:::warning
为了尽量降低 CAN 总线负载，Spark 设备的大多数状态帧 **默认处于禁用状态**，只有在调用对应的 getter 方法后才会启用。这些默认禁用的状态帧所包含的数据在 URCL 日志中将无法获取。

更多详情请参阅 [REVLib 文档](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods)。我们建议你在配置 Spark 时使用 [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig)，手动启用所有需要写入日志文件的信号。
:::

## SysId 使用 {#sysid-usage}

1. 按照上文配置好 URCL 后，在创建 SysId 例程时将机构日志回调 (mechanism log consumer) 设为 `null`。下方为 Java 示例，该配置可写在子系统类内部。

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// 创建 SysId 例程
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // 无需日志回调，数据由 URCL 记录
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
    null, // 无需日志回调，数据由 URCL 记录
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

2. 在机器人上运行 SysId 例程。你可以将 SysId 命令设为自动例程，或绑定到按键触发器上。

3. 下载日志文件并在 AdvantageScope 中打开。在菜单栏点击 `文件` > `导出数据...`，将格式设为“WPILOG”，字段集设为“包含生成字段”。点击保存图标并选择保存位置。

:::warning
机器人日志文件必须先通过 AdvantageScope 打开并导出，_然后再使用 SysId 分析器打开_。这一步用于将 URCL 记录的 CAN 数据转换为 SysId 兼容的格式。
:::

4. 在 VSCode 命令面板中搜索“WPILib: Start Tool”并选择“SysId”（或在 Windows 上使用桌面启动器）以打开 SysId 分析器，然后点击“Open data log file...”打开导出的日志文件。

5. 选择以下字段即可使用默认编码器运行分析。你也可以改用来自辅助编码器（备用编码器、外部编码器、模拟编码器、绝对编码器等）的位置和速度数据。

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
SysId 计算出的增益将沿用 Spark Max/Flex 配置的报告单位（通过 [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) 和 [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>) 设置）。默认情况下，这两个单位分别为未应用传动比的圈数 (rotations) 和 RPM。如果记录数据时使用的单位与目标单位不一致，你可以在 SysId 分析过程中调整缩放比例。
:::
