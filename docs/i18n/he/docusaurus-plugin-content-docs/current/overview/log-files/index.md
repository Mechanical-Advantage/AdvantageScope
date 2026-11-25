# 📂 קובצי יומן {#log-files}

## פורמטים נתמכים {#supported-formats}

- **WPILOG (.wpilog)** - נוצר על ידי [מערכת תיעוד הנתונים המובנית](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) של WPILib, על ידי AdvantageKit ועל ידי ה-FIRST Driver Station. אפשר להשתמש ב-[רישום אוניברסלי](/more-features/universal-logging) כדי ללכוד יומנים חיצוניים (למשל יומני יצרנים) לתוך קובץ WPILOG.
- **Hoot (.hoot)** - נוצר על ידי [מקליט האותות (Signal Logger)](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) ב-Phoenix 6 של CTRE.
- **REVLOG (.revlog)** - נוצר על ידי [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) של REV Robotics.
- **Road Runner (.log)** - נוצר על ידי ספריית [Road Runner](https://github.com/acmerobotics/road-runner) עבור FTC.
- **CSV (.csv)** - ערכים מופרדים בפסיקים, בפורמט התואם לזה ש-AdvantageScope [מייצאת](/overview/log-files/export) במצבים "CSV (טבלה)" או "CSV (רשימה)". פרטים נוספים מופיעים [כאן](#csv-formatting).
- **יומני NI Driver Station (.dslog ו-.dsevents)** - פורמט מדור קודם שנוצר על ידי ה-[FRC Driver Station](https://docs.wpilib.org/en/stable/docs/software/driverstation/driver-station.html) של NI (2010–2026). כשפותחים אחד מהקבצים האלה, AdvantageScope מחפשת אוטומטית את הקובץ המשלים לו.
- **RLOG (.rlog)** - פורמט מדור קודם שנוצר על ידי AdvantageKit 2022.

:::info
כדי לפתוח קובצי יומן של Hoot יש לאשר תחילה את [הסכם הרישיון למשתמשי קצה (EULA)](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt) של CTRE. בפעם הראשונה שתפתחו קובץ Hoot, AdvantageScope תקפיץ חלון לאישור התנאים.
:::

## פתיחת יומנים {#opening-logs}

בשורת התפריטים, לחצו על `קובץ` > `פתיחת יומן(ים)...`, ובחרו קובץ יומן אחד או יותר מהמחשב. אפשר גם פשוט לגרור קובץ יומן מסייר הקבצים ישירות אל הסמל או החלון של AdvantageScope.

:::info
אם פותחים כמה קבצים במקביל, חותמות הזמן שלהם מתיישרות אוטומטית, מה שמאפשר להשוות בקלות בין יומנים ממקורות שונים. בדף [חותמות זמן](/more-features/timestamps) תמצאו פרטים על אפשרויות התצוגה השונות.
:::

<img src="/img/overview/log-files/open-file-1.webp" alt="פתיחת קובץ יומן שמור" />

_הממשק בתמונה מוצג באנגלית._

## הוספת יומנים חדשים {#adding-new-logs}

לאחר שכבר פתחתם קובץ יומן, אפשר להוסיף לתצוגה קובצי יומן נוספים בקלות. חותמות הזמן יתיישרו אוטומטית כדי להסתנכרן עם הנתונים שכבר טעונים.

לחצו בשורת התפריטים על `קובץ` > `הוספת יומן(ים) חדשים...`, ובחרו קובץ אחד או יותר להוספה. השדות של כל יומן יופיעו תחת טבלאות בשם `Log0`, `Log1` וכן הלאה.

## פריסת Driver Station {#driver-station-layout}

AdvantageScope כוללת פריסה מובנית המיועדת לצפייה ביומנים ובנתונים חיים מתוך FIRST Driver Station, עם כרטיסיות מוגדרות מראש עבור פלט המסוף, מדדי תקשורת, מתח סוללה, ניצולת CPU וקלט ג'ויסטיקים.

בעת פתיחת קובץ WPILOG שנוצר על ידי FIRST Driver Station בגרסת שולחן העבודה, AdvantageScope מציעה לפתוח את היומן בחלון נפרד באמצעות פריסת ה-Driver Station. אפשר גם להעביר כל חלון לפריסה זו ידנית על ידי לחיצה על `קובץ` > `איפוס לפריסת DS`. ב-[AdvantageScope Lite](/more-features/advantagescope-lite) עבור FIRST Driver Station, פריסה זו משמשת כברירת מחדל (וניתן לשחזר אותה בלחיצה על `כרטיסיות` > `איפוס לפריסת ברירת המחדל`).

## הורדה מהרובוט {#downloading-from-the-robot}

<details>
<summary>תצורה</summary>

פתחו את חלון ההעדפות דרך `אפליקציה` > `הצגת העדפות...` (Windows/Linux) או `AdvantageScope` > `הגדרות...` (macOS), ועדכנו את כתובת הרובוט ואת תיקיית היומנים.

<img src="/img/prefs_he.webp" alt="תרשים העדפות" height="450" />
</details>

לחצו על `קובץ` > `הורדת יומנים...` כדי לפתוח את חלון ההורדה. הורדת יומנים נתמכת ב-Systemcore וב-roboRIO. אחרי החיבור לרובוט, היומנים הזמינים יופיעו כשהחדש ביותר בראש הרשימה. בחרו קובץ או תיקיית יומן אחת או יותר (אפשר להחזיק Shift וללחוץ לבחירת טווח, או **cmd/ctrl + A** לבחירת הכול), לחצו על סמל החץ ↓ ובחרו איפה לשמור.

:::tip
כשמורידים כמה קבצים יחד, AdvantageScope מדלגת אוטומטית על קבצים שכבר קיימים בתיקיית היעד.
:::

<img src="/img/overview/log-files/open-file-2.webp" alt="הורדת קובצי יומן" height="350" />

_הממשק בתמונה מוצג באנגלית._

## פורמט CSV {#csv-formatting}

שמות העמודות בקובץ CSV חייבים להיות בפורמט "Timestamp, Key, Value" או "Timestamp, (Key), (Key), וכו'". ערכי חותמות הזמן נמדדים בשניות. הרשימה למטה מציגה את הפורמט הצפוי לסוגי הערכים הנפוצים. שימו לב שייצוא של נתוני יומן ל-CSV וייבוא שלהם מחדש הוא תהליך _שמאבד מידע (Lossy)_, כי פורמט CSV אינו תומך בסוגי שדות מורכבים.

- **ערכים בוליאניים:** `true` או `false`
- **מחרוזות:** `"(value)"`
  - דוגמה: `"Hello world"`
- **מערכים:** `[(value); (value); (value)]`
  - דוגמה: `[1; 2; 3]`
- **בייטים:** בסיס שש-עשרוני (הקסדצימלי), מופרדים ב-`-`
  - דוגמה: `4d-41-36-33-32-38`
