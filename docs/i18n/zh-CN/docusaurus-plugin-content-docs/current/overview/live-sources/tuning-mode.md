---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 调参模式 {#tuning-mode}

某些实时数据源支持对数值和布尔值进行在线调参。例如，连接到 NetworkTables 数据源时，你可以用此功能 [调整控制器增益](https://docs.wpilib.org/zh-cn/stable/docs/software/advanced-controls/introduction/tutorial-intro.html)（前提是机器人代码已支持通过 NetworkTables 接收增益参数）。

默认情况下，AdvantageScope 中的所有字段均为只读。连接到受支持的实时数据源后，**点击搜索栏右侧的滑块图标**即可开启调参模式；图标变为紫色时，表示已进入调参模式，可以开始编辑字段。

- 要编辑 **数值字段**，请在侧边栏该字段右侧的文本框中输入新值，点击输入框外部或按下 `Enter` 键后即会发布。将文本框留空可恢复使用机器人端发布的值。
- 要切换 **布尔字段**，请直接点击侧边栏该字段右侧的红色或绿色圆点。
- 如需将所有已发布的值复制到剪贴板，请**右键点击滑块图标**并选择**“复制调参值”**。

:::tip
对于 iPhone 和 iPad 用户，**AdvantageTune** 是 AdvantageScope 开发团队推出的另一款应用，专门用于在移动设备上调试 NetworkTables 数值。

[<img src="/img/app-store_zh-CN.svg" alt="App Store" />](https://apps.apple.com/cn/app/advantagetune/id6811453643)
:::

## WPILib 可调参数 {#wpilib-tunables}

在 WPILib 中，可以使用 Tunable API 配置数值和布尔值等参数，从而在 AdvantageScope 中实时调整。可调参数只需注册一次，即可在机器人代码中周期性地读取：

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
import org.wpilib.tunable.TunableBoolean;
import org.wpilib.tunable.TunableDouble;
import org.wpilib.tunable.Tunables;

TunableDouble tunableNumber = Tunables.addDouble("MyTunableNumber", 0.0);
TunableBoolean tunableBoolean = Tunables.addBoolean("MyTunableBoolean", false);

// 周期性读取数值
double num = tunableNumber.get();
boolean bool = tunableBoolean.get();
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
#include <wpi/tunables/Tunables.hpp>

wpi::tunables::TunableDouble tunableNumber =
    wpi::tunables::Add<double>("MyTunableNumber", 0.0);
wpi::tunables::TunableBool tunableBoolean =
    wpi::tunables::Add<bool>("MyTunableBoolean", false);

// 周期性读取数值
double num = tunableNumber.Get();
bool boolVal = tunableBoolean.Get();
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import tunables

tunable_number = tunables.add_double("MyTunableNumber", 0.0)
tunable_boolean = tunables.add_boolean("MyTunableBoolean", False)

# 周期性读取数值
num = tunable_number.get()
bool_val = tunable_boolean.get()
```

</TabItem>
</Tabs>

## 使用 AdvantageKit 调参 {#tuning-with-advantagekit}

AdvantageKit 发布到 `AdvantageKit` 子表的字段均为只读输出，无法编辑。不过，你可以在代码中主动发布支持在 AdvantageScope 中调参的字段。**使用“NetworkTables (AdvantageKit)”实时数据源时，所有发布到 NetworkTables `/Tuning` 表的字段都会显示在 `Tuning` 表下。**

例如，可以使用 [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs) 类发布可调参数值：

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::note
请注意，键名必须包含前导斜杠（例如 `/Tuning/MyTunableNumber`，而不是 `Tuning/MyTunableNumber`）。
:::

:::warning
`NetworkInputs` 子表**不可编辑**，因为它专门用于 AdvantageKit 记录网络输入以供日志保存与重放。如需实时调整网络输入参数，请使用 `Tuning` 表。
:::
