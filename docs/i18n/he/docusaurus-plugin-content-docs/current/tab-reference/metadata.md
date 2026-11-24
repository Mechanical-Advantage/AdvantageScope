---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 מטא-דאטה {#metadata}

כרטיסיית המטא-דאטה מציגה ערכים שפורסמו לטבלה המוסתרת "/Metadata" או דרך AdvantageKit. מפתחות המטא-דאטה מופיעים משמאל, והעמודות מפרידות בין מקורות שונים (למשל `אמיתי` ו`שחזור` כשמשתמשים ב-AdvantageKit).

<img src="/img/tab-reference/metadata-1.webp" alt="סקירה כללית של כרטיסיית מטא-דאטה" />

_ממשק באנגלית מוצג למעלה._

דוגמת הקוד למטה מראה איך לרשום מטא-דאטה ב-Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

ב-WPILib, רושמים ערכים לטבלה "/Metadata" כמחרוזות באמצעות המחלקה `Telemetry`.

```java
TelemetryTable metadata = Telemetry.getTable("Metadata");
metadata.log("RobotName", "Darwin");
metadata.log("Platform", "macOS");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

ב-AdvantageKit, קוראים למתודה שלמטה לפני שמפעילים את ה-logger. המטא-דאטה נשמר בנפרד בהרצה אמיתית ובשחזור, כדי שאפשר יהיה להשוות ביניהם בקלות.

```java
Logger.recordMetadata("RobotName", "Darwin");
Logger.recordMetadata("Platform", "macOS");
```

</TabItem>
</Tabs>
