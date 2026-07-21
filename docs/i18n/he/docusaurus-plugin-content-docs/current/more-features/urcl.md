---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 Unofficial REV-Compatible Logger

:::info
חדש ב-2026, REVLib כוללת פתרון תיעוד רשמי לשמירת נתונים מ-Spark Max ו-Spark Flex ליומן REV CAN (`.revlog`). ראו [כאן](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) לפרטים. קבצים אלה ניתנים לפתיחה ישירות ב-AdvantageScope, אך אינם ניתנים לסנכרון מדויק למקורות נתונים אחרים.

ה-**U**nofficial **R**EV-**C**ompatible **L**ogger (URCL) של AdvantageScope יישאר זמין גם הוא לקבוצות ב-2026 כדי להבטיח מעבר חלק ולספק תאימות תכונות לעונות קודמות. יהיו לנו פרטים נוספים לשתף על אפשרויות תיעוד ב-2027 ואילך במועד מאוחר יותר.
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) היא ספריית תיעוד הזמינה עבור Java, C++, ו-Python אשר מקליטה באופן אוטומטי נתונים מ-Spark Max ו-Spark Flex. דבר זה מאפשר שרטוט ותיעוד חי של כל המכשירים בדומה ל[תכונת השרטוט ב-Tuner X](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) ו[מקליט האותות Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) מבית CTRE.

לאחר ההגדרה, פריימי CAN מחזוריים מכל מכשירי Spark Max ו-Spark Flex מפורסמים ל-NetworkTables או ל-DataLog. בעת שימוש ב-NetworkTables, ניתן להשתמש ב-[DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) של WPILib ללכידת הנתונים לקובץ יומן. פריימים אלה ניתנים לצפייה ב-AdvantageScope (ראו [ניהול קובצי יומן](/overview/log-files) ו-[התחברות למקורות חיים](/overview/live-sources)).

- **כל האותות** נלכדים באופן אוטומטי, **ללא הגדרה ידנית עבור מכשירים חדשים**.
- **כל פריים נלכד**, גם כאשר פרק הזמן של פריים הסטטוס מהיר יותר ממחזור לולאת הרובוט.
- פריימים מתועדים עם **חותמות זמן המבוססות על זמן ה-CAN RX**, מה שמאפשר אפיון תאוצה מדויק יותר עם [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) בהשוואה לתיעוד מסורתי בקוד המשתמש (ראו "שימוש ב-SysId" למטה).
- התיעוד הוא **יעיל ביותר**; הפעולות מבוצעות בתהליכונים (threaded) ופועלות מתחת ל-80 מיקרו-שניות לכל מחזור מחזורי של 20 מ"ש, גם בעת תיעוד מספר רב של מכשירים.
- **כל הפונקציות של REVLib אינן מושפעות.**

:::info
מכיוון שספרייה זו אינה כלי רשמי של REV, פניות תמיכה צריכות להיות מופנות ל[דף ה-issues](https://github.com/Mechanical-Advantage/URCL/issues) של URCL או ל-software@team6328.org ולא לאנשי הקשר של תמיכת REV.
:::

## הגדרה

יש להתקין את ה-vendordep של URCL בהתאם להוראות להתקנת [ספריות צד שלישי](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html) תוך שימוש במנהל התלויות ב-VSCode. כחלופה, ניתן להשתמש בכתובת ה-URL הבאה של vendor JSON:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL מפרסמת ל-NetworkTables כברירת מחדל, שבה ניתן לשמור נתונים לקובץ יומן על ידי הפעלת DataLogManager של WPILib. כחלופה, URCL יכולה לתעד ישירות ל-DataLog. יש להפעיל את מקליט היומנים ב-`robotInit`, כפי שמוצג למטה.

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // אם מפרסמים ל-NetworkTables ול-DataLog
  DataLogManager.start();
  URCL.start();

  // אם מתעדים ל-DataLog בלבד
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // אם מפרסמים ל-NetworkTables ול-DataLog
  frc::DataLogManager::Start();
  URCL::Start();

  // אם מתעדים ל-DataLog בלבד
  URCL::Start(frc::DataLogManager::GetLog());
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import urcl
import wpilib

class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # אם מפרסמים ל-NetworkTables ול-DataLog
        wpilib.DataLogManager.start()
        urcl.start()

        # אם מתעדים ל-DataLog בלבד
        urcl.start(wpilib.DataLogManager.getLog())
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
public Robot() {
  // ...
  Logger.registerURCL(URCL.startExternal());
  Logger.start();
}
```

:::warning
תאימות URCL עם AdvantageKit מסופקת לצורכי נוחות בלבד; הנתונים שהוקלטו ליומו אינם זמינים בשחזור. **מנועי בקרת REV חייבים עדיין להיות חלק ממימוש IO עם קלטים מוגדרים לתמיכה בשחזור**.
:::

</TabItem>
</Tabs>

לזיהוי קל יותר של מכשירים ביומן, ניתן לשייך מזהי CAN לכינויים (aliases) על ידי העברת אובייקט מפה (map) למתודה `start()` או `startExternal()`. המפתחות הם מזהי CAN והערכים הם מחרוזות עבור השמות לשימוש ביומן. כל מכשיר שלא שויך לו כינוי יתועד תוך שימוש בשמות ברירת המחדל שלו.

:::warning
למזעור שימוש ב-CAN, רוב פריימי הסטטוס עבור מכשירי Spark **מושבתים כברירת מחדל** עד לקריאה למתודת getter קשורה. כל נתון הכלול בפריימי סטטוס מושבתים אלה לא יהיה זמין ביומן ה-URCL.

לפרטים נוספים, עיינו ב[תיעוד REVLib](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods). אנו ממליצים להשתמש ב-[`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) בעת הגדרת ה-Spark להפעלה ידנית של אותות שתרצו לכלול בקובץ היומן.
:::

## שימוש ב-SysId

1. לאחר הגדרת URCL כפי שמוצג לעיל, יש להגדיר את שגרת SysId תוך שימוש ב-`null` עבור צרכן יומן המנגנון. דוגמה מוצגת למטה עבור Java. הגדרה זו ניתנת לביצוע בתוך מחלקת תת-המערכת (subsystem).

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// יצירת שגרת SysId
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // ללא צרכן יומן, מכיוון שהנתונים מוקלטים על ידי URCL
    subsystem
  )
);

// המתודות למטה מחזירות אובייקטי Command
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
// יצירת שגרת SysId
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(
    null, null, null,
    (state) -> Logger.recordOutput("SysIdTestState", state.toString())
  ),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // ללא צרכן יומן, מכיוון שהנתונים מוקלטים על ידי URCL
    subsystem
  )
);

// המתודות למטה מחזירות אובייקטי Command
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. הרץ את שגרת ה-SysId ברובוט. פקודות SysId ניתנות להגדרה כשגרות אוטונומיות או מחוברות ללחצן הפעלה.

3. הורד את קובץ היומן ופתח אותו ב-AdvantageScope. בסרגל התפריטים, עבור ל-`קובץ` > `ייצוא נתונים...`. הגדר את הפורמט ל-"WPILOG" ואת סט השדות ל-"לכלול שדות מיוצרים". לחץ על סמל השמירה ובחר מיקום לשמירת היומן.

:::warning
קובץ היומן מהרובוט חייב להיפתח ולהיות מיוצא על ידי AdvantageScope _לפני פתיחתו באמצעות מנתח ה-SysId_. דבר זה נדרש להמרת נתוני ה-CAN שהוקלטו על ידי URCL לפורמט התואם ל-SysId.
:::

4. פתח את מנתח ה-SysId על ידי חיפוש "WPILib: Start Tool" בפלטת הפקודות ב-VSCode ובחירה ב-"SysId" (או שימוש במפעיל שולחן העבודה ב-Windows). פתח את קובץ היומן המיוצא על ידי לחיצה על "Open data log file..."

5. בחר את השדות הבאים למטה להרצת הניתוח תוך שימוש במקודד (encoder) ברירת המחדל. נתוני מיקום ומהירות ממקודדים משניים יכולים לשמש גם כן (חלופי, חיצוני, אנלוגי, מוחלט, וכו').

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
המקדמים שמופקים על ידי SysId ישתמשו ביחידות שה-Spark Max/Flex מוגדר לדווח (תוך שימוש ב-[`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) וב-[`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>)). כברירת מחדל, אלו סיבובים ו-RPM ללא הפעלת תמסורת. אם היחידות המשמשות בעת הקלטת נתונים אינן תואמות ליחידות הרצויות, ניתן להתאים את קנה המידה ב-SysId במהלך הניתוח.
:::
