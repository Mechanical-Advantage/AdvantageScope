---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Метаданные {#metadata}

Вкладка метаданных показывает значения, опубликованные в скрытую таблицу "/Metadata" или через AdvantageKit. Ключи метаданных отображаются слева, а столбцы разделяют данные из разных источников (например, реальный и повтор при использовании AdvantageKit).

<img src="/img/tab-reference/metadata-1.webp" alt="Обзор вкладки метаданных" />

Пример кода ниже показывает, как логировать метаданные на Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

В WPILib значения должны логироваться в таблицу "/Metadata" в виде строк.

```java
// NetworkTables (также сохраняется в DataLog по умолчанию)
StringPublisher publisher = NetworkTableInstance.getDefault()
    .getStringTopic("/Metadata/MyKey").publish();
publisher.set("MyValue");

// DataLog (не публикуется в NetworkTables)
StringLogEntry entry = new StringLogEntry(DataLogManager.getLog(), "/Metadata/MyKey");
entry.append("MyValue");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

В AdvantageKit вызовите метод ниже перед запуском логгера. Метаданные сохраняются отдельно при работе в реальном режиме и режиме повтора для удобного сравнения.

```java
Logger.recordMetadata("MyKey", "MyValue");
```

</TabItem>
</Tabs>
