---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 元数据 {#metadata}

元数据选项卡显示发布到隐藏的 “/Metadata” 表或通过 AdvantageKit 发布的值。元数据键显示在左侧，列分隔来自不同来源的数据（例如在使用 AdvantageKit 时的原始运行数据和重放数据）。

<img src="/img/tab-reference/metadata-1.webp" alt="元数据标签页概述" />

_上图所示为英文界面。_

下面的示例代码展示了如何使用 Java 记录元数据。

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

在 WPILib 中，值必须发布在 “Metadata” 表中。

```java
Telemetry.getTable("Metadata").putString("Darwin", "macOS");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

在 AdvantageKit 中，在启动记录器之前调用以下方法。原始运行和日志重放的元数据会分别保存，便于比较。

```java
Logger.recordMetadata("Darwin", "macOS");
```

</TabItem>
</Tabs>
