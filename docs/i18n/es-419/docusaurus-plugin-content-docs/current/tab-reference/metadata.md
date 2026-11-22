---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Metadatos {#metadata}

La pestaña de metadatos muestra los valores publicados en la tabla oculta `"/Metadata"` o mediante AdvantageKit. Las claves aparecen a la izquierda, y las columnas separan los datos según su origen (por ejemplo, ejecución real y repetición cuando usas AdvantageKit).

<img src="/img/tab-reference/metadata-1.webp" alt="Descripción general de la pestaña de metadatos" />

_En la imagen de arriba se muestra la interfaz en inglés._

El siguiente ejemplo muestra cómo registrar metadatos.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

En WPILib, usa la clase `Telemetry` para registrar valores como cadenas de texto en la tabla `"/Metadata"`.

```java
TelemetryTable metadata = Telemetry.getTable("Metadata");
metadata.log("RobotName", "Darwin");
metadata.log("Platform", "macOS");
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

En WPILib, usa la clase `Telemetry` para registrar valores como cadenas de texto en la tabla `"/Metadata"`.

```cpp
wpi::telemetry::TelemetryTable& metadata = wpi::telemetry::GetTable("Metadata");
metadata.Log("RobotName", "Darwin");
metadata.Log("Platform", "macOS");
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

En WPILib, usa el módulo `telemetry` para registrar valores como cadenas de texto en la tabla `"/Metadata"`.

```python
import telemetry

metadata = telemetry.get_table("Metadata")
metadata.log("RobotName", "Darwin")
metadata.log("Platform", "macOS")
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

En AdvantageKit, llama al siguiente método antes de iniciar el registrador. Los metadatos de la ejecución real y los de la reproducción se guardan por separado para que puedas compararlos fácilmente.

```java
Logger.recordMetadata("RobotName", "Darwin");
Logger.recordMetadata("Platform", "macOS");
```

</TabItem>
</Tabs>
