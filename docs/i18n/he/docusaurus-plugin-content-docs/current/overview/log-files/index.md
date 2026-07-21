# 📂 קובצי יומן

## פורמטים נתמכים

- **WPILOG (.wpilog)** - מופק על ידי [תיעוד הנתונים המובנה](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) של WPILib ו-AdvantageKit. ניתן להשתמש ב-[URCL](/more-features/urcl) כדי ללכוד אותות מבקרי המנוע של REV לקובץ WPILOG.
- **יומנים של Driver Station (.dslog ו-.dsevents)** - מופקים על ידי ה-[FRC Driver Station](https://docs.wpilib.org/en/stable/docs/software/driverstation/driver-station.html). AdvantageScope מחפשת באופן אוטומטי את קובץ היומן התואם בעת פתיחת כל אחד מסוגי היומנים.
- **Hoot (.hoot)** - מופק על ידי [מקליט האותות](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) Phoenix 6 של CTRE.
- **REVLOG (.revlog)** - מופק על ידי [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) של REV Robotics.
- **Road Runner (.log)** - מופק על ידי ספריית [Road Runner](https://github.com/acmerobotics/road-runner) עבור FTC.
- **CSV (.csv)** - ערכים מופרדים בפסיקים, התואמים לפורמט [שמיוצא](/overview/log-files/export) על ידי AdvantageScope במצבים "CSV (טבלה)" או "CSV (רשימה)". לעיון בפרטים, ראו [כאן](#csv-formatting).
- **RLOG (.rlog)** - פורמט ישן, מופק על ידי AdvantageKit 2022.

:::info
קובצי יומן של Hoot ניתנים לפתיחה רק לאחר הסכמה ל[הסכם רישיון משתמש קצה](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt) של CTRE. AdvantageScope מציגה הודעה לאישור התנאים הללו בעת פתיחת קובץ יומן של Hoot בפעם הראשונה.
:::

## פתיחת יומנים

בסרגל התפריטים, יש ללחוץ על `קובץ` > `פתיחת יומן(ים)...`, ולאחר מכן לבחור קובץ יומן אחד או יותר מהדיסק המקומי. גרירת קובץ יומן בדפדפן הקבצים של המערכת אל הסמל או החלון של AdvantageScope תגרום גם היא לפתיחתו.

:::info
אם מספר קבצים נפתחים בו-זמנית, חותמות הזמן ייושרו באופן אוטומטי. דבר זה מאפשר השוואה קלה של קובצי יומן ממקורות מרובים.
:::

<img src="/img/overview/log-files/open-file-1.png" alt="Opening a saved log" />

## הוספת יומנים חדשים

לאחר פתיחת קובץ יומן, ניתן להוסיף בקלות יומנים נוספים לוויזואליזציה. חותמות הזמן ייושרו מחדש באופן אוטומטי לסנכרון עם הנתונים הקיימים.

בסרגל התפריטים, יש ללחוץ על `קובץ` > `הוספת יומן(ים) חדשים...`, ולאחר מכן לבחור קובץ יומן אחד או יותר להוספה לוויזואליזציה הנוכחית. השדות מכל יומן יוקלטו תחת טבלאות בשם `Log0`, `Log1`, וכו'.

## הורדה מהרובוט {#downloading-from-the-robot}

<details>
<summary>תצורה</summary>

יש לפתוח את חלון ההעדפות על ידי לחיצה על `אפליקציה` > `הצגת העדפות...` (Windows/Linux) או `AdvantageScope` > `הגדרות...` (macOS). יש לעדכן את כתובת הרובוט ותיקיית היומנים.

<img src="/img/prefs.png" alt="Diagram of preferences" height="350" />
</details>

יש ללחוץ על `קובץ` > `הורדת יומנים...` כדי לפתוח את חלון ההורדה. לאחר התחברות לרובוט, היומנים הזמינים מוצגים כאשר החדש ביותר בחלק העליון. יש לבחור קובץ יומן אחד או יותר להורדה (shift-click לבחירת טווח או **cmd/ctrl + A** לבחירת הכול). לאחר מכן יש ללחוץ על הסמל ↓ ולבחור מיקום שמירה.

:::info
[מקליט האותות](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) של CTRE משתמש בפורמט לא סטנדרטי המקבץ יומנים בתתי-תיקיות. יש לבחור תיקייה אחת או יותר ברשימה כדי להוריד את קובצי היומן כקבוצה.
:::

:::tip
בעת הורדת קבצים מרובים, AdvantageScope מדלגת על קבצים שכבר קיימים בתיקיית היעד.
:::

<img src="/img/overview/log-files/open-file-2.png" alt="Downloading log files" height="350" />

## פורמט CSV {#csv-formatting}

שמות העמודות בקובץ CSV חייבים להיות "Timestamp, Key, Value" או "Timestamp, (Key), (Key), וכו'". ערכי חותמות הזמן מבוטאים בשניות. הרשימה למטה מציגה את הפורמט הצפוי של סוגי ערכים נפוצים. שימו לב כי ייצוא וייבוא מחדש של נתוני יומן כ-CSV הוא _בעל אובדן נתונים (lossy)_, מכיוון ש-CSV אינו תומך בסוגי שדות מורכבים.

- **ערכים בוליאניים:** `true` או `false`
- **מחרוזות:** `"(value)"`
  - דוגמה: `"Hello world"`
- **מערכים:** `[(value); (value); (value)]`
  - דוגמה: `[1; 2; 3]`
- **בייטים:** בסיס שש-עשרוני (הקסדצימלי), מופרדים ב-`-`
  - דוגמה: `4d-41-36-33-32-38`
