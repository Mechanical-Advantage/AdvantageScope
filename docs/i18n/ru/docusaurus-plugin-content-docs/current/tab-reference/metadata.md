---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Метаданные {#metadata}

Вкладка метаданных показывает значения, опубликованные в скрытую таблицу «/Metadata» или через AdvantageKit. Ключи метаданных отображаются слева, а столбцы разделяют данные из разных источников (например, реальный запуск и повтор при использовании AdvantageKit).

<img src="/img/tab-reference/metadata-1.webp" alt="Обзор вкладки метаданных" />

_Выше показан интерфейс на английском языке._

Пример кода ниже показывает, как логировать метаданные.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

В WPILib логируйте значения в таблицу «/Metadata» в виде строк с помощью класса `Telemetry`.

```java
TelemetryTable metadata = Telemetry.getTable("Metadata");
metadata.log("RobotName", "Darwin");
metadata.log("Platform", "macOS");
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

В WPILib логируйте значения в таблицу `/Metadata` в виде строк с помощью функции `wpi::telemetry::GetTable`:

```cpp
wpi::telemetry::TelemetryTable& metadata = wpi::telemetry::GetTable("Metadata");
metadata.Log("RobotName", "Darwin");
metadata.Log("Platform", "macOS");
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

В WPILib логируйте значения в таблицу «/Metadata» в виде строк с помощью модуля `telemetry`.

```python
import telemetry

metadata = telemetry.get_table("Metadata")
metadata.log("RobotName", "Darwin")
metadata.log("Platform", "macOS")
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
