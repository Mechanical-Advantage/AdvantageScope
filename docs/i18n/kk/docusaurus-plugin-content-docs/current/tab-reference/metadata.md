---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Метадеректер {#metadata}

Метадеректер қойындысы жасырын «/Metadata» кестесіне немесе AdvantageKit арқылы жарияланған мәндерді көрсетеді. Метадеректер кілттері сол жақта, ал әртүрлі дереккөздерден алынған деректер (мысалы, AdvantageKit пайдаланған кездегі нақты орындау мен қайта ойнату) бөлек бағандарда көрсетіледі.

<img src="/img/tab-reference/metadata-1.webp" alt="Метадеректер қойындысының шолуы" />

_Жоғарыда ағылшын тіліндегі интерфейс көрсетілген._

Төмендегі мысал кодында Java тілінде метадеректерді қалай журналдау керектігі көрсетілген.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

WPILib кітапханасында `Telemetry` класын пайдаланып, мәндерді «/Metadata» кестесіне жол түрінде журналдаңыз.

```java
TelemetryTable metadata = Telemetry.getTable("Metadata");
metadata.log("RobotName", "Darwin");
metadata.log("Platform", "macOS");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

AdvantageKit ішінде журналдаушыны іске қоспас бұрын төмендегі әдісті шақырыңыз. Салыстыру ыңғайлы болуы үшін нақты орындау мен қайта ойнату кезіндегі метадеректер бөлек сақталады.

```java
Logger.recordMetadata("RobotName", "Darwin");
Logger.recordMetadata("Platform", "macOS");
```

</TabItem>
</Tabs>
