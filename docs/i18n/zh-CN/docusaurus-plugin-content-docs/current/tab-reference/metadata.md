---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 元数据 {#metadata}

元数据选项卡用于显示发布到隐藏的 `/Metadata` 表中或通过 AdvantageKit 记录的数据。左侧显示元数据键名，各列则分别展示来自不同数据源的数值（例如在使用 AdvantageKit 时对比“原始运行”与“重放”数据）。

<img src="/img/tab-reference/metadata-1.webp" alt="元数据选项卡概览" />

_上图所示为英文界面。_

下面的示例代码展示了如何记录元数据。

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

在 WPILib 中，使用 `Telemetry` 类将字符串值记录到 `/Metadata` 表中。

```java
TelemetryTable metadata = Telemetry.getTable("Metadata");
metadata.log("RobotName", "Darwin");
metadata.log("Platform", "macOS");
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

在 WPILib 中，使用 `Telemetry` 类将字符串值记录到 `/Metadata` 表中。

```cpp
wpi::telemetry::TelemetryTable& metadata = wpi::telemetry::GetTable("Metadata");
metadata.Log("RobotName", "Darwin");
metadata.Log("Platform", "macOS");
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

在 WPILib 中，使用 `telemetry` 模块将字符串值记录到 `/Metadata` 表中。

```python
import telemetry

metadata = telemetry.get_table("Metadata")
metadata.log("RobotName", "Darwin")
metadata.log("Platform", "macOS")
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

在 AdvantageKit 中，请在启动日志记录器之前调用以下方法。原始运行和重放时的元数据会分别保存，方便对比查看。

```java
Logger.recordMetadata("RobotName", "Darwin");
Logger.recordMetadata("Platform", "macOS");
```

</TabItem>
</Tabs>
