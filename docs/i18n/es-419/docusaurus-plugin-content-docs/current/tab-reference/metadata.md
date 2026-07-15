---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Metadatos

La pestaña de metadatos muestra los valores publicados en la tabla oculta "/Metadata" o a través de AdvantageKit. Las claves de metadatos se muestran a la izquierda, y las columnas separan los datos de diferentes fuentes (por ejemplo, real y repetición cuando se usa AdvantageKit).

<img src="/img/tab-reference/metadata-1.png" alt="Resumen de la pestaña de metadatos" />

El código de ejemplo a continuación muestra cómo registrar metadatos usando Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

En WPILib, los valores deben registrarse en la tabla "/Metadata" como cadenas de texto.

```java
// NetworkTables (también guardado en DataLog por defecto)
StringPublisher publisher = NetworkTableInstance.getDefault()
    .getStringTopic("/Metadata/MyKey").publish();
publisher.set("MyValue");

// DataLog (no publicado en NetworkTables)
StringLogEntry entry = new StringLogEntry(DataLogManager.getLog(), "/Metadata/MyKey");
entry.append("MyValue");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

En AdvantageKit, llama al método a continuación antes de iniciar el registrador. Los metadatos se almacenan por separado cuando se ejecutan en tiempo real y en reproducción para una fácil comparación.

```java
Logger.recordMetadata("MyKey", "MyValue");
```

</TabItem>
</Tabs>
