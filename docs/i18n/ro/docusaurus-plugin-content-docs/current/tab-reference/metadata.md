---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Metadate {#metadata}

Fila metadate afișează valorile publicate în tabelul ascuns „/Metadata” sau prin AdvantageKit. Cheile de metadate sunt afișate în stânga, iar coloanele separă datele din surse diferite (de ex. real și reluare când se utilizează AdvantageKit).

<img src="/img/tab-reference/metadata-1.png" alt="Overview of metadata tab" />

Codul de exemplu de mai jos arată cum se înregistrează metadatele folosind Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

În WPILib, valorile trebuie înregistrate în tabelul „/Metadata” ca șiruri de caractere (strings).

```java
// NetworkTables (also saved to DataLog by default)
StringPublisher publisher = NetworkTableInstance.getDefault()
    .getStringTopic("/Metadata/MyKey").publish();
publisher.set("MyValue");

// DataLog (not published to NetworkTables)
StringLogEntry entry = new StringLogEntry(DataLogManager.getLog(), "/Metadata/MyKey");
entry.append("MyValue");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

În AdvantageKit, apelați metoda de mai jos înainte de a porni înregistratorul (logger). Metadatele sunt stocate separat când se rulează în modul real și reluare pentru o comparare ușoară.

```java
Logger.recordMetadata("MyKey", "MyValue");
```

</TabItem>
</Tabs>
