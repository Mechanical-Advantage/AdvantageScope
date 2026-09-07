---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 מטא-דאטה {#metadata}

כרטיסיית המטא-דאטה מציגה ערכים שפורסמו לטבלה המוסתרת "/Metadata" או דרך AdvantageKit. מפתחות המטא-דאטה מוצגים משמאל, והעמודות מפרידות נתונים ממקורות שונים (למשל אמיתי ושחזור בעת שימוש ב-AdvantageKit).

<img src="/img/tab-reference/metadata-1.webp" alt="סקירה כללית של כרטיסיית מטא-דאטה" />

_ממשק באנגלית מוצג למעלה._

קוד הדוגמה למטה מציג כיצד לתעד מטא-דאטה ב-Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

ב-WPILib, ערכים חייבים להיות מפורסמים בטבלה "Metadata".

```java
Telemetry.getTable("Metadata").putString("Darwin", "macOS");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

ב-AdvantageKit, יש לקרוא למתודה למטה לפני הפעלת מקליט היומנים (logger). מטא-דאטה מאוחסן בנפרד בעת הפעלה באמיתי ובשחזור להשוואה קלה.

```java
Logger.recordMetadata("Darwin", "macOS");
```

</TabItem>
</Tabs>
