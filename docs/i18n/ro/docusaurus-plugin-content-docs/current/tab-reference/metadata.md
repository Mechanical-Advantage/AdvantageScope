---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Metadate {#metadata}

Fila metadate afișează valorile publicate în tabelul ascuns „/Metadata” sau prin AdvantageKit. Cheile de metadate sunt afișate în stânga, iar coloanele separă datele din surse diferite (de exemplu, Real și Reluare când folosești AdvantageKit).

<img src="/img/tab-reference/metadata-1.webp" alt="Prezentare generală a filei metadate" />

_Interfața în limba engleză este ilustrată mai sus._

Codul de exemplu de mai jos arată cum poți înregistra metadatele în Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

În WPILib, înregistrează valorile în tabelul „/Metadata” ca șiruri de caractere folosind clasa `Telemetry`.

```java
TelemetryTable metadata = Telemetry.getTable("Metadata");
metadata.log("RobotName", "Darwin");
metadata.log("Platform", "macOS");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

În AdvantageKit, apelează metoda de mai jos înainte de a porni logger-ul. Metadatele sunt stocate separat pentru rularea reală și reluare, ca să le poți compara ușor.

```java
Logger.recordMetadata("RobotName", "Darwin");
Logger.recordMetadata("Platform", "macOS");
```

</TabItem>
</Tabs>
