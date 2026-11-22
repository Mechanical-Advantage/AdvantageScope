---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 中繼資料 {#metadata}

中繼資料分頁會顯示發布至隱藏「/Metadata」表格或透過 AdvantageKit 記錄的數值。左側列出中繼資料的鍵名，右側各欄則區分來自不同來源的資料（例如使用 AdvantageKit 時的實際執行與重播資料）。

<img src="/img/tab-reference/metadata-1.webp" alt="中繼資料分頁概述" />

_上圖所示為英文介面。_

以下範例程式示範如何記錄中繼資料：

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

在 WPILib 中，請使用 `Telemetry` 類別將數值以字串形式記錄至「/Metadata」表格：

```java
TelemetryTable metadata = Telemetry.getTable("Metadata");
metadata.log("RobotName", "Darwin");
metadata.log("Platform", "macOS");
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

在 WPILib 中，請使用 `Telemetry` 類別將數值以字串形式記錄至「/Metadata」表格：

```cpp
wpi::telemetry::TelemetryTable& metadata = wpi::telemetry::GetTable("Metadata");
metadata.Log("RobotName", "Darwin");
metadata.Log("Platform", "macOS");
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

在 WPILib 中，請使用 `telemetry` 模組將數值以字串形式記錄至「/Metadata」表格：

```python
import telemetry

metadata = telemetry.get_table("Metadata")
metadata.log("RobotName", "Darwin")
metadata.log("Platform", "macOS")
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

在 AdvantageKit 中，請於啟動記錄器前呼叫以下方法。實際執行與重播時的中繼資料會分開儲存，方便對照比較。

```java
Logger.recordMetadata("RobotName", "Darwin");
Logger.recordMetadata("Platform", "macOS");
```

</TabItem>
</Tabs>
