---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ מנגנון {#mechanism}

כרטיסיית המנגנון מציגה מנגנון מפרקי שנבנה באמצעות אובייקט [Mechanism2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html) אחד או יותר.

<img src="/img/tab-reference/mechanism-1.webp" alt="סקירה כללית של כרטיסיית מנגנון" />

_ממשק באנגלית מוצג למעלה._

<details>
<summary>בקרות ציר זמן</summary>

ציר הזמן שולט בניגון ובתצוגת הנתונים. לחיצה עליו בוחרת נקודת זמן, ולחיצה ימנית מבטלת את הבחירה. הזמן שנבחר מסונכרן בין כל הכרטיסיות, כך שקל למצוא את אותה נקודה במהירות גם בשאר התצוגות.

מקטעים צהובים מסמנים שהרובוט במצב Auto, מקטעים כחולים מסמנים מצב Teleop, ומקטעים אפורים מסמנים מצב שירות (Utility).

כדי להתקרב או להתרחק (Zoom), מקמו את הסמן מעל ציר הזמן וגללו למעלה או למטה. אפשר גם לבחור טווח זמן על ידי לחיצה וגרירה תוך כדי החזקת `Shift`. כדי לזוז שמאלה וימינה, גללו אופקית (במכשירים תומכים) או לחצו וגררו על ציר הזמן. בחיבור חי, גלילה שמאלה משחררת את הנעילה מהזמן הנוכחי, וגלילה עד הסוף ימינה נועלת אליו שוב. לחיצה על `Ctrl+\` ממקדת את התצוגה לפרק הזמן שבו הרובוט מאופשר (Enabled).

<img src="/img/tab-reference/timeline.webp" alt="ציר זמן" />

</details>

## הוספת מנגנונים {#adding-mechanisms}

כדי להתחיל, גררו שדה `Mechanism2d` אל חלונית הבקרה. אפשר למחוק מנגנון בעזרת כפתור ה-X, או להסתיר אותו זמנית בלחיצה על סמל העין או בלחיצה כפולה על שם השדה. כדי להסיר את כל המנגנונים, לחצו על סמל פח האשפה ליד כותרת הציר ובחרו `ניקוי הכול`. אפשר גם לשנות את סדר המנגנונים ברשימה על ידי לחיצה וגרירה.

## פרסום נתונים {#publishing-data}

כדי לפרסם נתוני מנגנון, תעדו אובייקט `Mechanism2d` באופן מחזורי (כמוצג למטה). שימו לב שקריאה זו שומרת רק את המצב הנוכחי של ה-`Mechanism2d`, ולכן צריך לקרוא לה בכל מחזור לולאה אחרי שהאובייקט מתעדכן.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);

periodic() {
  Telemetry.log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::Mechanism2d mechanism{3, 3};

void Periodic() {
  wpi::telemetry::Log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import wpilib
import telemetry

mechanism = wpilib.Mechanism2d(3, 3)

def periodic():
    telemetry.log("MyMechanism", mechanism)
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);

periodic() {
  Logger.recordOutput("MyMechanism", mechanism);
}
```

:::tip
אפשר להשתמש באנוטציית [@AutoLogOutput](https://docs.advantagekit.org/data-flow/recording-outputs/annotation-logging) של AdvantageKit כדי לתעד את מצב המנגנון אוטומטית בכל מחזור לולאה, בלי לקרוא ידנית ל-`Logger.recordOutput`.
:::

</TabItem>
</Tabs>
