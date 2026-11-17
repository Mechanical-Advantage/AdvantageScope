---
title: מה חדש ב-2026?
sidebar_position: 2
draft: true
---

#

<img src="/img/whats-new/banner-light.webp" className="light-only" />
<img src="/img/whats-new/banner-dark.webp" className="dark-only" />

גרסת 2026 של AdvantageScope זמינה כעת! פרטים נוספים אפשר למצוא ב[מדריך ההתקנה](/overview/installation) וב[יומן השינויים המלא](https://github.com/Mechanical-Advantage/AdvantageScope/releases). הגרסה הזו כוללת כמה יכולות חדשות מרכזיות ולא מעט שיפורים ברחבי האפליקציה. רבות מהיכולות החדשות נועדו לשפר את העבודה עם מערכות הבקרה הקיימות, ובמקביל להכין את הקרקע למעבר חלק ל-[Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) בעונות הבאות.

**המשוב שלכם חשוב לנו! נשמח לקבל הערות, בקשות לתכונות חדשות ודיווחים על באגים ב[דף ה-issues](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

## ✴️ ניסיוני: תמיכה ב-FTC {#ftc-support}

כהכנה לתמיכה מלאה ב-Systemcore בעונת 2027-2028, גרסה זו מוסיפה כמה יכולות לשיפור התאימות למערכת הבקרה הקיימת של FIRST Tech Challenge:

- מגרשי FTC ודגמי רובוטים ב-🗺️ [מגרש 2D](/tab-reference/2d-field) ו-👀 [מגרש 3D](/tab-reference/3d-field)
- אפשרויות [מערכת צירים](/more-features/coordinate-systems) חדשות לתאימות עם [מערכת הצירים הסטנדרטית ב-FTC](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- תמיכה בקובצי יומן של [Road Runner](https://rr.brott.dev/docs/v1-0/installation/)
- תמיכה בפורמט הסטרימינג החי של [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard)

:::tip
קבוצות FTC מתבקשות לנהוג בזהירות כשמשתמשים בתוכנה ניסיונית במהלך העונה הרשמית — התמיכה ב-FTC ב-AdvantageScope עדיין נמצאת בפיתוח פעיל.
:::

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

כמה ספריות תיעוד וטלמטריה של צד שלישי ב-FTC תומכות בפורמטים נוספים ש-AdvantageScope יודעת לקרוא, כמו WPILOG ו-RLOG. את התיעוד שלהן תמצאו בפרויקטים עצמם; מפתחי AdvantageScope אינם ממליצים על פתרון רישום מסוים לשימוש ב-FTC.

:::info
AdvantageScope מתוכננת לעבוד בצורה המיטבית לצד WPILib וכלי הלוגים שלה. כשמשתמשים בפתרונות רישום לא רשמיים, ייתכנו בעיות תאימות או מגבלות ביכולות.

כל היכולות של AdvantageScope ייתמכו באופן רשמי ב-FTC לאחר המעבר ל-Systemcore בעונת 2027-2028.
:::

## 🧮 גרפים מודעי-יחידות {#unit-aware-graphing}

הכרטיסייה 📉 [גרף קווי](/tab-reference/line-graph/) עוצבה מחדש וכעת היא מודעת ליחידות מידה באופן מלא. השינוי הזה מביא כמה יכולות חדשות כשמציגים שדות מספריים בגרף:

- תיוג מדויק של צירי ה-Y ושל תצוגות הערכים
- המרה מהירה בין יחידות תואמות (בלי חלונות קופצים)
- המרה אוטומטית בין יחידות תואמות על אותו ציר
- תצוגה מדויקת של יחידות [שעברו אינטגרציה או גזירה](/tab-reference/line-graph/#integration-and-differentiation)

בצילום המסך למטה רואים את כל היכולות האלה בפעולה: הציר השמאלי מציג שדות עם יחידות מהירות זוויתית שונות, והציר הימני מציג ערכים שנגזרו ומוצגים ביחידה לא-טבעית להם (מעלות). גם בחירת היחידות פשוטה מתמיד — אפשרויות ההמרה הרלוונטיות מופיעות ישירות בתפריט הבקרה של כל ציר.

_מידע נוסף על תמיכה ביחידות מופיע ב[תיעוד](/tab-reference/line-graph/units)._

<img src="/img/tab-reference/line-graph/units-1.webp" alt="גרפים מודעי-יחידות" />

_הממשק בתמונה מוצג באנגלית._

## 🏁 הורדת יומנים מהירה יותר {#faster-log-downloads}

[הורדת יומנים מה-roboRIO](/overview/log-files/#downloading-from-the-robot) מהירה כעת **פי 2 עד 4** מבעבר, בזכות המעבר לפרוטוקול FTP שמאפשר ל-roboRIO להעביר נתונים עם הרבה פחות עומס על המעבד (CPU).

הטבלה למטה מציגה את מהירות ההעברה שנמדדה בגרסאות 2025 ו-2026 של AdvantageScope בחיבור כבל רשת ישיר (Ethernet, רוחב פס מרבי של 100 מגה-ביט/שנייה). אפשר לראות שביצועי גרסת 2025 נפגעו משמעותית כשמעבד ה-roboRIO היה עמוס.

|                                                 | 2025 (SFTP)      | 2026 (FTP)       | האצה                                               |
| ----------------------------------------------- | ---------------- | ---------------- | -------------------------------------------------- |
| עומס מעבד גבוה<br /><sub>קוד רובוט מורכב</sub>  | 25 מגה-ביט/שנייה | 80 מגה-ביט/שנייה | <span style={{fontSize: '24px'}}>**פי 3.2**</span> |
| עומס מעבד ממוצע<br /><sub>קוד רובוט רגיל</sub>  | 40 מגה-ביט/שנייה | 90 מגה-ביט/שנייה | <span style={{fontSize: '22px'}}>**פי 2.3**</span> |
| עומס מעבד מינימלי<br /><sub>ללא קוד רובוט</sub> | 90 מגה-ביט/שנייה | 95 מגה-ביט/שנייה | <span style={{fontSize: '20px'}}>**פי 1.1**</span> |

## 📁 הורדת יומנים מתתי-תיקיות {#download-logs-from-subfolders}

חלון ההורדה תומך כעת בשמירת יומנים שנמצאים בתוך תתי-תיקיות. אפשר להוריד כל תת-תיקייה כקבוצה אחת — פתרון נוח במיוחד עבור יומנים שנוצרו בגרסת 2026 של [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) מבית CTRE (שמפצלת נתונים לתתי-תיקיות כי היא לא שומרת הכול בקובץ יומן יחיד).

<img src="/img/whats-new/subfolders.webp" alt="הורדת תתי-תיקיות יומן" height="450" />

## 🌈 אפשרויות ויזואליזציה חדשות {#new-visualization-options}

כמה אפשרויות ויזואליזציה חדשות נתמכות כעת ב-🗺️ [מגרש 2D](/tab-reference/2d-field) וב-👀 [מגרש 3D](/tab-reference/3d-field):

- במגרש ה-2D יש עכשיו מבחר גדול יותר של צבעי באמפרים, ואפשר להגדיר צבע נפרד לכל אובייקט — מה שנותן הרבה יותר גמישות כשמשלבים רובוטי רפאים (Ghost) עם כמה רובוטים.
- כשמציגים [מנגנוני 2D במגרש ה-3D](/tab-reference/3d-field/#2d-mechanisms), אפשר למקם אותם כעת גם במישור YZ בנוסף למישור XZ, וכך להציג בקלות מנגנונים מורכבים שזזים בכמה צירים.
- מגרש ה-3D תומך כעת בהחלקת קצוות (Antialiasing) אופציונלית לשיפור חדות הקווים בתצוגה.

<img src="/img/whats-new/field-viz.jpg" alt="הדמיות מגרש חדשות" />

## 🪵 תמיכה ביומן CAN של REV Robotics {#rev-robotics-can-log-support}

כעת אפשר לפתוח ישירות ב-AdvantageScope קובצי `.revlog` שנוצרו על ידי [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) של REV Robotics. הקבצים האלה מקליטים אותות CAN מבקרי Spark Max ו-Spark Flex, ומהווים חלופה רשמית לספריית [URCL](/more-features/urcl) של AdvantageScope.

גם URCL וגם `StatusLogger` הרשמי ימשיכו להיות זמינים לאורך עונת 2026 כדי להבטיח מעבר חלק ותאימות מלאה לעונות קודמות. פרטים נוספים על אפשרויות הרישום ב-2027 ואילך יפורסמו בהמשך.

<img src="/img/whats-new/revlog.webp" alt="הדמיית REVLOG" />

## 💿 ייבוא קובצי CSV {#csv-file-imports}

כדי לאפשר הצגה גמישה יותר של נתונים שלא הגיעו ממערכות רישום של רובוטים, AdvantageScope תומכת כעת ביבוא בסיסי של קובצי CSV. פרטים על הפורמטים הנתמכים והמגבלות מופיעים ב[תיעוד](/overview/log-files/#csv-formatting).

<img src="/img/overview/log-files/export-2.webp" alt="נתוני CSV" />

## 🤩 שיפורים אסתטיים {#aesthetic-improvements}

ממשק המשתמש ב-Windows 11 עודכן עם סרגל צד חצי-שקוף, שעד עכשיו היה זמין רק ב-macOS. בנוסף, ל-macOS Tahoe יש סמל אפליקציה מעודכן בסגנון Liquid Glass של Apple.

<img src="/img/whats-new/windows-ui.webp" alt="ממשק משתמש של Windows" />

## 📋 תפריטים יעילים {#streamlined-menus}

שורת התפריטים והבקרות שלה אורגנו מחדש כדי להפוך את הגישה לכלים למהירה ועקבית יותר בכל הפלטפורמות. בין השיפורים הבולטים:

- מעבר מהיר יותר בין מקורות חיים (כמו NetworkTables ו-[דיאגנוסטיקה Phoenix](/overview/live-sources/phoenix-diagnostics)), בלי צורך לפתוח את חלון ההעדפות.
- לחיצה ימנית בסרגל הצד להעתקה מהירה של שם השדה (או של המפתח המלא שלו).
- ארגון מחדש של חלון ההעדפות, כך שקל יותר למצוא את ההגדרות הדרושות.

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.webp" />
  <img src="/img/whats-new/menus-2.webp" />
  <img src="/img/prefs_he.webp" />
</div>

## 🐛 שיפורי יציבות {#stability-improvements}

גרסה זו כוללת שורה של תיקוני באגים ושיפורי יציבות ברחבי האפליקציה. הרשימה המלאה מופיעה ב[יומן השינויים](https://github.com/Mechanical-Advantage/AdvantageScope/releases), והנה כמה מהתיקונים הבולטים:

- שיפור משמעותי בביצועים בזמן הזרמת נתונים ממושכת, במיוחד בכרטיסיית הגרף הקווי.
- עמידות טובה יותר לנתוני יומן חריגים, כולל קובצי יומן גדולים במיוחד וערכי שדות גדולים.
- תיקון בעיות תצוגה שונות בעת דפדוף בנתוני יומן, במיוחד כשמפעילים מסננים בכרטיסיית הגרף הקווי.
- תיקון סדר קובצי היומן של AdvantageKit בחלון ההורדה — יומנים ללא חותמות זמן מופיעים כעת בתחתית הרשימה, כמו בפורמטים האחרים.
- בכרטיסיית מגרש 3D, מצלמות רובוט עם סיבוב שאינו אפס בציר הגלגול (Roll) מוצגות כעת בצורה תקינה.
- שיפור היציבות של AdvantageScope XR, במיוחד ב-iOS ו-iPadOS 26. בהתקנות לא מקוונות, בדקו אם יש עדכון זמין ב-App Store.
