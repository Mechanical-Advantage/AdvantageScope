---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Метадеректер {#metadata}

Метадеректер қойындысы жасырын «/Metadata» кестесіне немесе AdvantageKit арқылы жарияланған мәндерді көрсетеді. Метадеректер кілттері сол жақта көрсетіледі, ал бағандар әртүрлі дереккөздерден алынған деректерді бөледі (мысалы, AdvantageKit пайдаланған кезде нақты және қайталау).

<img src="/img/tab-reference/metadata-1.webp" alt="Метадеректер қойындысының шолуы" />

_Жоғарыда ағылшын тіліндегі интерфейс көрсетілген._

Төмендегі мысал коды Java арқылы метадеректерді қалай журналдау керектігін көрсетеді.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

WPILib ішінде мәндер «/Metadata» кестесіне жолдар ретінде журналдануы тиіс.

```java
// NetworkTables (әдепкі бойынша DataLog жүйесіне де сақталады)
StringPublisher publisher = NetworkTableInstance.getDefault()
    .getStringTopic("/Metadata/MyKey").publish();
publisher.set("MyValue");

// DataLog (NetworkTables жүйесінде жарияланбайды)
StringLogEntry entry = new StringLogEntry(DataLogManager.getLog(), "/Metadata/MyKey");
entry.append("MyValue");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

AdvantageKit ішінде журналдаушыны іске қоспас бұрын төмендегі әдісті шақырыңыз. Оңай салыстыру үшін метадеректер нақты және қайталау режимдерінде орындау кезінде бөлек сақталады.

```java
Logger.recordMetadata("MyKey", "MyValue");
```

</TabItem>
</Tabs>
