---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 中繼資料 {#metadata}

中繼資料分頁顯示發布到隱藏的「/Metadata」表格或透過 AdvantageKit 發布的數值。中繼資料鍵名顯示在左側，各欄分隔來自不同來源的資料（例如使用 AdvantageKit 時的真實與重播資料）。

<img src="/img/tab-reference/metadata-1.webp" alt="中繼資料分頁概述" />

_上圖所示為英文介面。_

下面的範例程式碼展示了如何使用 Java 記錄中繼資料。

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

在 WPILib 中，數值必須作為字串記錄到「/Metadata」表格中。

```java
// NetworkTables（預設也會儲存到 DataLog）
StringPublisher publisher = NetworkTableInstance.getDefault()
    .getStringTopic("/Metadata/MyKey").publish();
publisher.set("MyValue");

// DataLog（不發布到 NetworkTables）
StringLogEntry entry = new StringLogEntry(DataLogManager.getLog(), "/Metadata/MyKey");
entry.append("MyValue");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

在 AdvantageKit 中，請在啟動記錄器之前呼叫下面的方法。在真實運作與重播中執行時，中繼資料會分開儲存以便於比較。

```java
Logger.recordMetadata("MyKey", "MyValue");
```

</TabItem>
</Tabs>
