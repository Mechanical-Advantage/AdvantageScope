---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 סווארב {#swerve}

כרטיסיית הסווארב מציגה את המצב של ארבעה מודולי סווארב, כולל וקטורי המהירות, מצבי המנוחה (idle), סיבוב הרובוט ומהירויות השלדה.

<img src="/img/tab-reference/swerve-1.webp" alt="סקירה כללית של כרטיסיית סווארב" />

_ממשק באנגלית מוצג למעלה._

<details>
<summary>בקרות ציר זמן</summary>

ציר הזמן משמש לשליטה בניגון ובתצוגה. לחיצה על ציר הזמן בוחרת נקודת זמן, ולחיצה ימנית מבטלת את הבחירה. הזמן שנבחר מסונכרן בין כל הכרטיסיות, כך שקל למצוא מיד את אותה נקודה גם בתצוגות אחרות.

מקטעים צהובים מציינים שהרובוט באוטונומי, מקטעים כחולים מציינים שהוא בטלאופ, ומקטעים אפורים מציינים שהוא במצב שירות.

כדי לעשות זום, ממקמים את הסמן מעל ציר הזמן וגוללים למעלה או למטה. אפשר גם לבחור טווח על ידי לחיצה וגרירה תוך החזקת מקש `Shift`. כדי לזוז שמאלה וימינה, גוללים אופקית (במכשירים תומכים) או לוחצים וגוררים על ציר הזמן. בחיבור חי, גלילה שמאלה משחררת את הנעילה מהזמן הנוכחי, וגלילה עד הסוף ימינה נועלת אליו בחזרה. לחיצה על `Ctrl+\` עושה זום ישירות לזמן שבו הרובוט מאופשר (enabled).

<img src="/img/tab-reference/timeline.webp" alt="ציר זמן" />

</details>

## הוספת מקורות {#adding-sources}

כדי להתחיל, גוררים שדה לאזור "מקורות". אפשר למחוק מקור בעזרת כפתור ה-X, או להסתיר אותו זמנית בלחיצה על סמל העין או בלחיצה כפולה על שם השדה. כדי להסיר את כל המקורות בבת אחת, לוחצים על סמל הפח ליד הכותרת ובוחרים `ניקוי הכול`. אפשר לשנות את סדר המקורות ברשימה על ידי גרירה.

**כדי להתאים אישית כל מקור, לוחצים על הסמל הצבעוני או לוחצים לחיצה ימנית על שם השדה.** AdvantageScope תומכת בשלושה סוגי מקורות:

- **מהירויות מודול:** מערך של ארבעה מצבי מודולי סווארב, שמוצגים כווקטורים בדיאגרמה.
- **מהירויות רובוט:** מהירויות קוויות וזוויתיות שמוצגות במרכז הדיאגרמה.
- **סיבוב:** זווית שמשמשת לסיבוב הדיאגרמה.

:::tip
ניתן להציג מצבי מודולי סווארב גם בכרטיסיות 🗺️ [מגרש 2D](/tab-reference/2d-field) ו-👀 [מגרש 3D](/tab-reference/3d-field).
:::

## פורמט נתונים {#data-format}

יש לפרסם את הנתונים כ-struct או protobuf מקודד בבתים, באמצעות הטיפוסים `SwerveModuleVelocity[]`, `ChassisVelocities`, `Rotation2d`, או `Rotation3d`.

ספריות רבות תומכות בפורמט struct, כולל WPILib ו-AdvantageKit. דוגמת הקוד למטה מראה איך לרשום מצבי מודולי סווארב.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Telemetry.log("MyStates", states);
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
std::array<wpi::math::SwerveModuleVelocity, 4> states{
  wpi::math::SwerveModuleVelocity{},
  wpi::math::SwerveModuleVelocity{},
  wpi::math::SwerveModuleVelocity{},
  wpi::math::SwerveModuleVelocity{}
};

wpi::telemetry::Log("MyStates", states);
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
from wpimath import SwerveModuleVelocity
import telemetry

states = [
    SwerveModuleVelocity(),
    SwerveModuleVelocity(),
    SwerveModuleVelocity(),
    SwerveModuleVelocity(),
]

telemetry.log("MyStates", states, element_type=SwerveModuleVelocity)
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

:::note
בשנת 2027, מבנה הנתונים הזה שונה מ-`SwerveModuleState` ל-`SwerveModuleVelocity`.
עבור קובצי יומן שנוצרו לפני WPILib 2027 ו-Systemcore, הטיפוסים הישנים של `SwerveModuleState` עדיין נתמכים לתצוגה.
:::

## תצורה {#configuration}

אפשרויות ההגדרה הבאות זמינות:

- **מהירות מקסימלית:** המהירות המרבית שהמודולים מסוגלים להגיע אליה; משמשת לקביעת אורך הווקטורים.
- **גודל מסגרת:** המרחקים בין מודולי הסווארב בציר ימין-שמאל ובציר קדימה-אחורה. משנה את יחס הממדים של דיאגרמת הרובוט.
- **כיוון:** משנה את הכיוון שאליו מופנית דיאגרמת הרובוט. שימושי במיוחד כדי להתאים את הדיאגרמה לנתוני תנוחה או לסרטוני משחק.

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
