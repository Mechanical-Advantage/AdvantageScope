---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 מטא-דאטה

כרטיסיית המטא-דאטה מציגה ערכים שפורסמו לטבלה המוסתרת "/Metadata" או דרך AdvantageKit. מפתחות המטא-דאטה מוצגים משמאל, והעמודות מפרידות נתונים ממקורות שונים (למשל אמיתי ושחזור בעת שימוש ב-AdvantageKit).

<img src="/img/tab-reference/metadata-1.png" alt="Overview of metadata tab" />

קוד הדוגמה למטה מציג כיצד לתעד מטא-דאטה ב-Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

ב-WPILib, הערכים חייבים להיות מתועדים לטבלה "/Metadata" כמחרוזות.

```java
// NetworkTables (נשמר ב-DataLog כברירת מחדל)
StringPublisher publisher = NetworkTableInstance.getDefault()
    .getStringTopic("/Metadata/MyKey").publish();
publisher.set("MyValue");

// DataLog (אינו מפורסם ל-NetworkTables)
StringLogEntry entry = new StringLogEntry(DataLogManager.getLog(), "/Metadata/MyKey");
entry.append("MyValue");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

ב-AdvantageKit, יש לקרוא למתודה למטה לפני הפעלת מקליט הלוגים (logger). מטא-דאטה מאוחסן בנפרד בעת הפעלה באמיתי ובשחזור להשוואה קלה.

```java
Logger.recordMetadata("MyKey", "MyValue");
```

</TabItem>
</Tabs>
