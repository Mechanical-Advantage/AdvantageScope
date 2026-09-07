---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Metadata {#metadata}

Het tabblad metadata toont waarden die zijn gepubliceerd naar de verborgen tabel "/Metadata" of via AdvantageKit. De metadatasleutels worden aan de linkerkant weergegeven, en de kolommen scheiden data van verschillende bronnen (bijv. echt en herhaling bij gebruik van AdvantageKit).

<img src="/img/tab-reference/metadata-1.webp" alt="Overzicht van tabblad metadata" />

_De Engelstalige interface wordt hierboven weergegeven._

De onderstaande voorbeeldcode laat zien hoe je metadata logt met behulp van Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

In WPILib moeten de waarden als strings naar de tabel "/Metadata" worden gelogd.

```java
// NetworkTables (standaard ook opgeslagen in DataLog)
StringPublisher publisher = NetworkTableInstance.getDefault()
    .getStringTopic("/Metadata/MyKey").publish();
publisher.set("MyValue");

// DataLog (niet gepubliceerd naar NetworkTables)
StringLogEntry entry = new StringLogEntry(DataLogManager.getLog(), "/Metadata/MyKey");
entry.append("MyValue");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

Roep in AdvantageKit de onderstaande methode aan voordat je de logger start. Metadata wordt apart opgeslagen bij het uitvoeren in 'echt' en 'herhaling' voor eenvoudige vergelijking.

```java
Logger.recordMetadata("MyKey", "MyValue");
```

</TabItem>
</Tabs>
