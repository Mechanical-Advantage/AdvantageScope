---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 Unofficial REV-Compatible Logger {#unofficial-rev-compatible-logger}

:::info
חדש ב-2026: ספריית REVLib כוללת פתרון רשמי לשמירת נתונים מבקרי Spark Max ו-Spark Flex לקובץ יומן REV CAN (`.revlog`). לפרטים נוספים ראו [כאן](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger). אפשר לפתוח קבצים אלה ישירות ב-AdvantageScope, אך לא ניתן לסנכרן אותם במדויק מול מקורות נתונים אחרים.

כלי ה-**U**nofficial **R**EV-**C**ompatible **L**ogger (URCL) של AdvantageScope יישאר זמין לקבוצות גם ב-2026 כדי לאפשר מעבר חלק ולשמור על תאימות לעונות קודמות. פרטים נוספים על אפשרויות התיעוד ב-2027 ואילך יפורסמו בהמשך.
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) היא ספריית רישום יומנים עבור Java, C++ ו-Python, שמקליטה אוטומטית נתונים מבקרי Spark Max ו-Spark Flex. כך אפשר לשרטט ולתעד בזמן אמת את כל הבקרים, בדומה ל[כלי השרטוט ב-Tuner X](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) ול[מקליט האותות של Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) מבית CTRE.

לאחר ההגדרה, הודעות ה-CAN המחזוריות מכל בקרי ה-Spark Max וה-Spark Flex מפורסמות ל-NetworkTables או ל-DataLog. אם משתמשים ב-NetworkTables, אפשר להשתמש ב-[DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) של WPILib כדי לשמור את הנתונים לקובץ יומן. בנתונים הללו ניתן לצפות ב-AdvantageScope (ראו [ניהול קובצי יומן](/overview/log-files) ו[התחברות למקורות חיים](/overview/live-sources)).

- **כל האותות** נקלטים אוטומטית, **ללא צורך בהגדרה ידנית עבור מכשירים חדשים**.
- **כל הודעת CAN נשמרת**, גם כאשר קצב השידור שלה מהיר יותר מזמן המחזור של לולאת הרובוט.
- ההודעות מתועדות עם **חותמות זמן המבוססות על זמן הקבלה ב-CAN (CAN RX)**, מה שמאפשר אפיון תאוצה מדויק יותר ב-[SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) לעומת רישום רגיל בקוד המשתמש (ראו "שימוש ב-SysId" בהמשך).
- הרישום **יעיל במיוחד**: העיבוד רץ ברקע בתהליכונים נפרדים (threads) וצורך פחות מ-80 מיקרו-שניות בכל מחזור של 20 ms, גם עם כמות גדולה של בקרים.
- **כל הפונקציות של REVLib ממשיכות לפעול כרגיל ללא השפעה.**

:::info
מכיוון שזו אינה ספרייה רשמית של REV, שאלות ותמיכה יש להפנות ל[דף ה-issues של URCL](https://github.com/Mechanical-Advantage/URCL/issues) או לכתובת software@team6328.org, ולא לתמיכה של REV.
:::

## הגדרה {#setup}

התקינו את ה-vendordep של URCL לפי ההוראות להתקנת [ספריות צד שלישי](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html) במנהל התלויות של VSCode, או הוסיפו ישירות את כתובת ה-JSON הבאה:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

כברירת מחדל, URCL מפרסמת ל-NetworkTables, ומשם ניתן לשמור את הנתונים לקובץ יומן באמצעות DataLogManager של WPILib. לחלופין, URCL יכולה לכתוב ישירות ל-DataLog. יש להפעיל את ההקלטה בתוך `robotInit`, כפי שמוצג בדוגמאות הבאות:

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // פרסום ל-NetworkTables ול-DataLog
  DataLogManager.start();
  URCL.start();

  // רישום ל-DataLog בלבד
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // פרסום ל-NetworkTables ול-DataLog
  frc::DataLogManager::Start();
  URCL::Start();

  // רישום ל-DataLog בלבד
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
        # פרסום ל-NetworkTables ול-DataLog
        wpilib.DataLogManager.start()
        urcl.start()

        # רישום ל-DataLog בלבד
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
התאימות של URCL ל-AdvantageKit נועדה לנוחות בלבד; הנתונים שנשמרים ביומן אינם זמינים לשחזור (replay). **בקרי מנוע של REV חייבים עדיין להיות מוגדרים בתוך מימוש IO עם קלטים (inputs) מסודרים כדי לתמוך בשחזור.**
:::

</TabItem>
</Tabs>

כדי לזהות מכשירים בקלות רבה יותר ביומן, אפשר לתת כינויים (aliases) למזהי ה-CAN על ידי העברת מילון/מפה (map) למתודה `start()` או `startExternal()`. המפתחות הם מזהי ה-CAN, והערכים הם השמות שיופיעו ביומן. מכשיר שלא הוגדר לו כינוי יופיע תחת שם ברירת המחדל שלו.

:::warning
כדי לצמצם עומס על אפיק ה-CAN, רוב הודעות הסטטוס (status frames) של בקרי Spark **מושבתות כברירת מחדל** עד שקוראים למתודת ה-getter המתאימה. נתונים שנמצאים בהודעות מושבתות לא יופיעו ביומן של URCL.

לפרטים נוספים, עיינו ב[תיעוד של REVLib](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods). מומלץ להשתמש ב-[`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) בעת הגדרת ה-Spark כדי להפעיל ידנית את כל האותות שתרצו לשמור ביומן.
:::

## שימוש ב-SysId {#sysid-usage}

1. לאחר הגדרת URCL כמתואר למעלה, הגדירו את שגרת ה-SysId עם `null` במקום גורם שקורא את היומן (log consumer) של המנגנון. לדוגמה ב-Java, מתוך מחלקת תת-המערכת (subsystem):

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// יצירת שגרת SysId
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // ללא צרכן יומן, כי הנתונים מוקלטים על ידי URCL
    subsystem
  )
);

// המתודות הבאות מחזירות אובייקטי Command
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
    null, // ללא צרכן יומן, כי הנתונים מוקלטים על ידי URCL
    subsystem
  )
);

// המתודות הבאות מחזירות אובייקטי Command
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. הריצו את שגרת ה-SysId על הרובוט. אפשר לשייך את פקודות ה-SysId למצב האוטונומי או להפעיל אותן בלחיצת כפתור.

3. הורידו את קובץ היומן מהרובוט ופתחו אותו ב-AdvantageScope. בתפריט העליון, בחרו ב-`קובץ` > `ייצוא נתונים...`. הגדירו את הפורמט ל-"WPILOG" ואת סט השדות ל-"לכלול שדות שנוצרו". לחצו על סמל השמירה ובחרו היכן לשמור את הקובץ.

:::warning
חובה לפתוח את קובץ היומן ולייצא אותו מתוך AdvantageScope _לפני שפותחים אותו בכלי הניתוח של SysId_. שלב זה נחוץ כדי להמיר את נתוני ה-CAN שתיעדה URCL לפורמט ש-SysId יודע לקרוא.
:::

4. פתחו את כלי הניתוח של SysId על ידי חיפוש "WPILib: Start Tool" בפלטת הפקודות ב-VSCode ובחירה ב-"SysId" (או דרך קיצור הדרך בשולחן העבודה ב-Windows). פתחו את הקובץ המיוצא בלחיצה על "Open data log file...".

5. בחרו בשדות הבאים כדי להריץ את הניתוח עם המקודד (encoder) הראשי. אפשר להשתמש גם בנתוני מיקום ומהירות ממקודדים משניים (חלופי, חיצוני, אנלוגי, מוחלט וכו'):

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
המקדמים (gains) שיפיק SysId יתבססו על היחידות שה-Spark Max/Flex מוגדר לדווח (באמצעות [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) ו-[`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>)). כברירת מחדל מדובר בסיבובים ובסל"ד ללא יחס תמסורת. אם היחידות בהקלטה שונות מהיחידות הרצויות, אפשר לשנות את קנה המידה בתוך SysId בזמן הניתוח.
:::
