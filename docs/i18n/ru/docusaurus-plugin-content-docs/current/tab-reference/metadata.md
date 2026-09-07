---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Метаданные {#metadata}

Вкладка метаданных показывает значения, опубликованные в скрытую таблицу "/Metadata" или через AdvantageKit. Ключи метаданных отображаются слева, а столбцы разделяют данные из разных источников (например, реальный и повтор при использовании AdvantageKit).

<img src="/img/tab-reference/metadata-1.webp" alt="Обзор вкладки метаданных" />

_Выше показан интерфейс на английском языке._

Пример кода ниже показывает, как логировать метаданные на Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

В WPILib логируйте значения в таблицу "/Metadata" в виде строк с помощью класса `Telemetry`.

```java
TelemetryTable metadata = Telemetry.getTable("Metadata");
metadata.log("RobotName", "Darwin");
metadata.log("Platform", "macOS");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

В AdvantageKit вызовите метод ниже перед запуском логгера. Метаданные сохраняются отдельно при работе в реальном режиме и режиме повтора для удобного сравнения.

```java
Logger.recordMetadata("RobotName", "Darwin");
Logger.recordMetadata("Platform", "macOS");
```

</TabItem>
</Tabs>
