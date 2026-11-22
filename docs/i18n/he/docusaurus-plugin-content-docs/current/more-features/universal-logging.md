---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🪐 רישום אוניברסלי עם WPILOG

WPILOG הוא פורמט הרישום הפתוח הסטנדרטי המשמש ברחבי המערכת האקולוגית של WPILib. באמצעות AdvantageScope, פורמט WPILOG יכול לשמש כמכל אוניברסלי עבור מספר קבצים ופורמטים של יומנים. משמעות הדבר היא שקובץ `.wpilog` יחיד יכול להכיל מספר זרמי נתונים המקודדים בכל פורמט הנתמך על ידי AdvantageScope, כולל CSV, יומנים ייעודיים ליצרנים או קובצי WPILOG נוספים.

תכונה זו נועדה לייעל את האבחון על ידי איסוף **כל נתוני האבחון של הרובוט בקובץ יומן אוניברסלי יחיד**; אין צורך להוריד, לשייך או לסנכרן מספר קובצי יומן ממשחק יחיד, גם בעת איסוף נתונים מספריות צד שלישי או משירותים חיצוניים. לדוגמה, קובץ WPILOG יחיד יכול להכיל:

- טלמטריית רובוט סטנדרטית המפורסמת דרך ה-API של `Telemetry` ב-WPILib או NetworkTables.
- אותות התקנים בתדר גבוה הנרשמים על ידי ספריות יצרנים.
- נתוני מצב ממחשבי עזר (coprocessors) ומשירותים חיצוניים הנרשמים ל-CSV או ל-WPILOG.
- ...ועוד!

כל הנתונים הללו מופיעים בעץ מאוחד אחד ב-AdvantageScope, כפי שמוצג להלן בקובץ WPILOG המכיל אותות התקנים שנלכדו ממספר יצרנים.

:::note
ב-Systemcore, [URCL](https://github.com/Mechanical-Advantage/URCL) הוחלפה ב-[status logger](https://docs.revrobotics.com/revlib/logs) הרשמי של REV. רישום אוניברסלי עם AdvantageScope מאפשר ל-status logger הרשמי להקליט נתונים מכל התקני REV לתוך קובץ WPILOG יחיד (בדומה ל-URCL).
:::

<img src="/img/more-features/universal-logging-1.webp" alt="קובץ WPILOG המציג מספר יומני יצרנים בסרגל הצד." />

_הממשק בתמונה מוצג באנגלית._

:::tip
משתמשי AdvantageKit יכולים גם לנצל את דחיסת XZ כדי להקטין משמעותית את גודלם של יומני צד שלישי המאוחסנים בתוך קובץ WPILOG. עיינו בתיעוד של AdvantageKit בנושא מקלטי נתוני יומן לפרטים.
:::

## ניסיוני: רישום יומני יצרנים {#experimental-vendor-logging}

פרויקטי רובוט רבים יוצרים מספר קובצי יומן במקביל: קובץ WPILOG סטנדרטי עבור טלמטריית WPILib/AdvantageKit לצד קבצים קנייניים מספריות של יצרנים. רישום אוניברסלי מבטל פיצול זה על ידי הטמעת יומני היצרנים ישירות לתוך קובץ ה-`.wpilog` הראשי. ראו את ההנחיות להלן עבור WPILib ו-AdvantageKit.

:::warning
מכיוון שגישה זו אינה נתמכת רשמית על ידי היצרנים, יש להפנות בקשות תמיכה אל [דף ה-issues](https://github.com/Mechanical-Advantage/AdvantageScope/issues) של AdvantageScope או אל software@team6328.org. ראו [ייצוא נתוני יצרנים](#exporting-vendor-data) לפרטים על ייצוא קובצי היומן המקוריים לצורך אבחון.
:::

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

הורידו את המחלקה [`VendorLogCapture.java`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.java) ומקמו אותה בפרויקט הרובוט שלכם. מחלקה זו לוכדת אוטומטית נתונים מיומני יצרנים אל תוך ה-`DataLog` הפעיל, ויש להגדיר אותה בבנאי `Robot` כפי שמוצג להלן. עליכם לבחור תיקייה מתאימה (אנו ממליצים על `/home/systemcore/logs/`) לאחסון זמני של יומני היצרנים במהלך הלכידה. ראו את הסעיף [איך זה עובד](#how-it-works) לפרטים.

```java
public Robot() {
  // הפעלת DataLogManager של WPILib כרגיל
  DataLogManager.start();

  // הפעלת לכידת יומני יצרנים מתיקייה זמנית
  // מומלץ לאחסן זמנית יומני יצרנים באחסון הפנימי
  // גם בעת שימוש בכונן USB (יומני היצרנים אינם נשמרים לאחר הלכידה)
  VendorLogCapture.start(DataLogManager.getLog(), "/home/systemcore/logs/");

  // הפעלת מתעד היצרן לאחר הפעלת לכידת היומנים
  // אם ניתן להגדרה, תיקיית הפלט חייבת להתאים לנתיב שלמעלה
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

הורידו את הקבצים [`VendorLogCapture.hpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.hpp) ו-[`VendorLogCapture.cpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.cpp) ומקמו אותם בפרויקט הרובוט שלכם. מחלקה זו לוכדת אוטומטית נתונים מיומני יצרנים אל תוך ה-`DataLog` הפעיל, ויש להגדיר אותה בבנאי `Robot` כפי שמוצג להלן. עליכם לבחור תיקייה מתאימה (אנו ממליצים על `/home/systemcore/logs/`) לאחסון זמני של יומני היצרנים במהלך הלכידה. ראו את הסעיף [איך זה עובד](#how-it-works) לפרטים.

```cpp
Robot::Robot() {
  // הפעלת DataLogManager של WPILib כרגיל
  wpi::DataLogManager::Start();

  // הפעלת לכידת יומני יצרנים מתיקייה זמנית
  // מומלץ לאחסן זמנית יומני יצרנים באחסון הפנימי
  // גם בעת שימוש בכונן USB (יומני היצרנים אינם נשמרים לאחר הלכידה)
  VendorLogCapture::Start(wpi::DataLogManager::GetLog(), "/home/systemcore/logs/");

  // הפעלת מתעד היצרן לאחר הפעלת לכידת היומנים
  // אם ניתן להגדרה, תיקיית הפלט חייבת להתאים לנתיב שלמעלה
  VendorLogger::SetPath("/home/systemcore/logs/");
  VendorLogger::Start();
}
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

הורידו את הקובץ [`vendor_log_capture.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/vendor_log_capture.py) ומקמו אותו בפרויקט הרובוט שלכם. כלי עזר זה לוכד אוטומטית נתונים מיומני יצרנים אל תוך ה-`DataLog` הפעיל, ויש להגדיר אותו ב-`robotInit` כפי שמוצג להלן. עליכם לבחור תיקייה מתאימה (אנו ממליצים על `/home/systemcore/logs/`) לאחסון זמני של יומני היצרנים במהלך הלכידה. ראו את הסעיף [איך זה עובד](#how-it-works) לפרטים.

```python
class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # הפעלת DataLogManager של WPILib כרגיל
        wpilib.DataLogManager.start()

        # הפעלת לכידת יומני יצרנים מתיקייה זמנית
        # מומלץ לאחסן זמנית יומני יצרנים באחסון הפנימי
        # גם בעת שימוש בכונן USB (יומני היצרנים אינם נשמרים לאחר הלכידה)
        VendorLogCapture.start(wpilib.DataLogManager.get_log(), "/home/systemcore/logs/")

        # הפעלת מתעד היצרן לאחר הפעלת לכידת היומנים
        # אם ניתן להגדרה, תיקיית הפלט חייבת להתאים לנתיב שלמעלה
        VendorLogger.set_path("/home/systemcore/logs/")
        VendorLogger.start()
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit (בקרוב)">

לכידת יומני יצרנים מובנית בתוך AdvantageKit וניתנת להפעלה כפי שמוצג להלן. עליכם לבחור תיקייה מתאימה (אנו ממליצים על `/home/systemcore/logs/`) לאחסון זמני של יומני היצרנים במהלך הלכידה. ראו את הסעיף [איך זה עובד](#how-it-works) לפרטים.

```java
public Robot() {
  // הפעלת לכידת יומני יצרנים מתיקייה זמנית
  // מומלץ לאחסן זמנית יומני יצרנים באחסון הפנימי
  // גם בעת שימוש בכונן USB (יומני היצרנים אינם נשמרים לאחר הלכידה)
  Logger.setVendorLogDirectory("/home/systemcore/logs/");

  // הפעלת AdvantageKit כרגיל
  Logger.start();

  // הפעלת מתעד היצרן לאחר מתעד AdvantageKit
  // אם ניתן להגדרה, תיקיית הפלט חייבת להתאים לנתיב שלמעלה
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

:::info
ללא קשר למקלטי נתוני היומן שנבחרו, ניתן לצפות ביומני יצרנים רק על ידי הורדת קובץ WPILOG. הזרמה חיה אינה נתמכת עקב מבנה נתוני היומן שנלכדו.
:::

</TabItem>
</Tabs>

שימו לב שחלק ממתעדי היצרנים מתחילים לכתוב נתונים _מיד_ כאשר נוצר מופע של מחלקת ההתקן המתאימה (למשל `SparkMax`). אנו ממליצים להמתין עם יצירת אובייקטי החומרה עד לסוף הבנאי `Robot` כדי להבטיח שהיומנים יילכדו.

### איך זה עובד {#how-it-works}

1. **לכידה:** תוכנית הרובוט מריצה רישום WPILib סטנדרטי לצד מתעדי היצרנים. כלי עזר קל משקל קורא מעת לעת נתונים חדשים שנכתבו על ידי מתעדי היצרנים ואורז את הנתונים הגולמיים ישירות לתוך זרם ה-`DataLog` הפעיל.
2. **אחסון:** היומן המשולב כולו נשמר בקובץ `.wpilog` יחיד (למשל על כונן USB המחובר ל-Systemcore). קובצי יומן זמניים של יצרנים שנוצרו על הרובוט אינם נשמרים בין הפעלות מחדש, וכך נמנע עומס על האחסון.
3. **ויזואליזציה:** כאשר AdvantageScope פותחת את קובץ ה-`.wpilog`, היא מגלה אוטומטית כל רשומת יומן מוטמעת, מפענחת את תוכנה וממזגת את כל השדות לתוך עץ סרגל הצד לצד הטלמטריה הסטנדרטית.
4. **חילוץ:** אם עליכם לפתוח יומן יצרן לצורך תמיכה או אבחון מתקדם, ניתן לחלץ את קובצי היומן המקוריים ללא אובדן מידע מתוך ה-`.wpilog` כפי שמתואר ב-[ייצוא נתוני יצרנים](#exporting-vendor-data).

נתוני יומן חיצוניים נשמרים בפורמט WPILOG באמצעות רשומה גולמית שמחרוזת הסוג שלה עוקבת אחר המוסכמה `log:<format>`. בעת פענוח אחד משדות אלה, AdvantageScope משרשרת את כל הרשומות הבינאריות עבור אותו פריט בסדר כרונולוגי ומפענחת את המטען המתקבל כיומן עצמאי בפורמט שצוין. האותות המפוענחים ממוזגים לאחר מכן לתוך עץ השדות הראשי ומסתנכרנים אוטומטית עם הנתונים הקיימים.

:::tip
רישום אוניברסלי עם WPILOG אינו מוגבל ליומני יצרנים; כל פורמט רישום התואם ל-AdvantageScope ניתן להטמעה בתוך WPILOG באותה מוסכמה.
:::

### ייצוא נתוני יצרנים {#exporting-vendor-data}

למרות שניתן לעיין בנתונים מיומני יצרנים ישירות ב-AdvantageScope, לעיתים ייתכן שיהיה צורך לחלץ את היומן המקורי כפי שנוצר על ידי הספרייה המקורית (למשל לבדיקה בכלי שירות ייעודיים ליצרן).

כדי לייצא יומן משנה בודד ישירות מתוך AdvantageScope, לחצו לחיצה ימנית על רשומת יומן המשנה בסרגל הצד ובחרו **ייצוא היומן המקורי...**.

לחילוץ באצווה, תוכלו גם להשתמש בסקריפט ה-Python [`extract_vendor_logs.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/extract_vendor_logs.py), המחפש בקובץ `.wpilog` או `.wpilogxz` אחד או יותר את כל יומני היצרנים המשולבים ומייצא אותם לקבצים נפרדים:

```bash
pip3 install robotpy-wpiutil # תלות נדרשת
python3 extract_vendor_logs.py path/to/source.wpilog
```
