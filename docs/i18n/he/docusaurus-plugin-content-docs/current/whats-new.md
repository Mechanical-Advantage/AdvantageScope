---
title: מה חדש ב-2026?
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-light.png" className="light-only" />
<img src="/img/whats-new/banner-dark.png" className="dark-only" />

גרסת 2026 של AdvantageScope זמינה כעת! ניתן לעיין ב[תיעוד ההתקנה](/overview/installation) וב[יומן השינויים המלא](https://github.com/Mechanical-Advantage/AdvantageScope/releases) לפרטים נוספים. גרסה זו כוללת מספר תכונות חדשות מרכזיות ושיפורים רבים ברחבי האפליקציה. תכונות רבות בגרסה זו נועדו לשפר את חוויית השימוש במערכות הבקרה הקיימות, תוך הכנת מעבר חלק ל-[Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) בעונות הבאות.

**אנו מעריכים את המשוב שלכם! משוב, בקשות לתכונות ודיווחים על באגים יתקבלו בברכה ב[דף ה-issues](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

## ✴️ ניסיוני: תמיכה ב-FTC {#ftc-support}

כהכנה לתמיכה מלאה ב-Systemcore בעונת 2027-2028, גרסה זו מוסיפה מספר תכונות לשיפור התאימות עם מערכת הבקרה הקיימת של FIRST Tech Challenge:

- מגרשי FTC ומודלי רובוטים ב-🗺️ [מגרש 2D](/tab-reference/2d-field) ו-👀 [מגרש 3D](/tab-reference/3d-field)
- אפשרויות [מערכת צירים](/more-features/coordinate-systems) חדשות לתאימות עם [איפוס הצירים הסטנדרטי ב-FTC](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- תמיכה בקובצי יומן של [Road Runner](https://rr.brott.dev/docs/v1-0/installation/)
- תמיכה בפורמט הסטרימינג החי של [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard)

:::tip
על קבוצות FTC לנהוג בזהירות בעת שימוש תוכנה ניסיונית במהלך העונה הרשמית. התמיכה ב-FTC עבור AdvantageScope עדיין נמצאת בפיתוח פעיל.
:::

<div className="image-gallery">
  <img src="/img/whats-new/ftc-1.jpg" />
  <img src="/img/whats-new/ftc-2.jpg" />
  <img src="/img/whats-new/ftc-3.png" />
  <img src="/img/whats-new/ftc-4.png" />
  <img src="/img/whats-new/ftc-5.png" />
</div>

מספר ספריות תיעוד/טלמטריה של צד שלישי ב-FTC תומכות בפורמטים אחרים התואמים ל-AdvantageScope, כגון WPILOG ו-RLOG. תיעוד של ספריות אלה ניתן למצוא בפרויקטים הרלוונטיים; מפתחי AdvantageScope אינם ממליצים על פתרון רישום יומן מסוים עבור FTC לשימוש עם AdvantageScope.

:::info
AdvantageScope מתוכננת לספק את החוויה הטובה ביותר בעת שימוש לצד מסגרת WPILib וכלי הרישום הנלווים לה. ייתכן שתיתקלו בבעיות תאימות או מימוש מוגבל בעת שימוש בפתרונות רישום יומן לא רשמיים.

כל התכונות של AdvantageScope נתמכות באופן רשמי ב-FTC לאחר המעבר ל-Systemcore בעונת 2027-2028.
:::

## 🧮 גרפים מודעי-יחידות {#unit-aware-graphing}

הכרטיסייה 📉 [גרף קווי](/tab-reference/line-graph/) עודכנה מחדש כדי להיות מודעת לחלוטין ליחידות. דבר זה מאפשר מספר יכולות חדשות בעת יצירת גרפים עבור שדות נומריים:

- תיוג מדויק של צירי Y ותצוגות ערכים
- המרה מהירה ליחידות תואמות (ללא חלונות קופצים)
- המרה מרומזת של סוגי יחידות תואמים בתוך ציר יחיד
- תצוגה מדויקת של יחידות [שעברו אינטגרציה ונגזרו](/tab-reference/line-graph/#integration--differentiation)

צילום המסך למטה מציג את כל התכונות הללו בפעולה. שימו לב שהציר השמאלי כולל שדות עם יחידות מהירות זוויתית שונות, והציר הימני כולל ערכים שנגזרו ומוצגים ביחידה שאינה מובנית (מעלות). בחירת יחידות קלה יותר מאי פעם, כאשר אפשרויות יחידה תואמות משולבות ישירות בתפריט הבקרה עבור כל ציר.

_מידע נוסף על תמיכה ביחידות ניתן למצוא ב[תיעוד](/tab-reference/line-graph/units)._

<img src="/img/tab-reference/line-graph/units-1.png" alt="Unit-aware graphing" />

## 🏁 הורדת יומנים מהירה יותר {#faster-log-downloads}

[הורדת יומנים מ-roboRIO](/overview/log-files/#downloading-from-the-robot) מהירה כעת **פי 2-4** בהשוואה לגרסאות קודמות. דבר זה מושג על ידי מעבר לפרוטוקול חדש (FTP) המאפשר ל-roboRIO להעביר נתוני יומן עם פחות עומס מעבד (CPU).

הטבלה למטה מציגה את מהירות ההעברה שנמדדה בגרסאות 2025 ו-2026 של AdvantageScope בעת חיבור באמצעות כבל Ethernet (רוחב פס מקסימלי של 100 מגה-ביט/שנייה). שימו לב שביצועי גרסת 2025 הושפעו קשות מעומס המעבד ב-roboRIO.

|                                                 | 2025 (SFTP)      | 2026 (FTP)       | האצה                                               |
| ----------------------------------------------- | ---------------- | ---------------- | -------------------------------------------------- |
| עומס מעבד גבוה<br /><sub>קוד רובוט מורכב</sub>  | 25 מגה-ביט/שנייה | 80 מגה-ביט/שנייה | <span style={{fontSize: '24px'}}>**פי 3.2**</span> |
| עומס מעבד ממוצע<br /><sub>קוד רובוט רגיל</sub>  | 40 מגה-ביט/שנייה | 90 מגה-ביט/שנייה | <span style={{fontSize: '22px'}}>**פי 2.3**</span> |
| עומס מעבד מינימלי<br /><sub>ללא קוד רובוט</sub> | 90 מגה-ביט/שנייה | 95 מגה-ביט/שנייה | <span style={{fontSize: '20px'}}>**פי 1.1**</span> |

## 📁 הורדת יומנים מתתי-תיקיות {#download-logs-from-subfolders}

חלון ההורדה תומך כעת בשמירת יומנים המאוחסנים בתתי-תיקיות. כל תת-תיקייה של יומנים ניתנת להורדה כקבוצה, מה שמספק גישה יעילה להורדת יומנים שנוצרו על ידי גרסת 2026 של [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) מבית CTRE (המשתמשת בתתי-תיקיות כפתרון לעקיפת המגבלה של שמירת נתונים בקובץ יומן יחיד).

<img src="/img/whats-new/subfolders.png" alt="Downloading log subfolders" height="450" />

## 🌈 אפשרויות ויזואליזציה חדשות {#new-visualization-options}

מספר אפשרויות ויזואליזציה חדשות נתמכות כעת ב-🗺️ [מגרש 2D](/tab-reference/2d-field) וב-👀 [מגרש 3D](/tab-reference/3d-field):

- מגוון רחב יותר של צבעי באמפרים (Bumpers) לרובוט זמין כעת במגרש ה-2D, וכל אובייקט ניתן להגדרה עם צבע משלו. דבר זה מאפשר גמישות רבה יותר בעת שילוב רובוטי רפאים עם אובייקטי רובוט מרובים.
- בעת [ויזואליזציית מנגנוני 2D במגרש ה-3D](/tab-reference/3d-field/#2d-mechanisms), ניתן כעת למקם מנגנונים במישור YZ בנוסף למישור XZ. דבר זה מאפשר ויזואליזציה קלה יותר של מנגנונים מורכבים עם תנועה בצירים מרובים.
- מגרש ה-3D תומך כעת בהחלקת קצוות (anti-aliasing) אופציונלית לשיפור איכות הקצוות המרונדרים.

<img src="/img/whats-new/field-viz.jpg" alt="New field visualizations" />

## 🪵 תמיכה ביומן CAN של REV Robotics {#rev-robotics-can-log-support}

ניתן כעת לפתוח קובצי `.revlog` שנוצרו על ידי [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) של REV Robotics ישירות ב-AdvantageScope. קבצים אלו מקליטים אותות CAN מכשירי Spark Max ו-Spark Flex, ומציעים חלופה רשמית לספריית [URCL](/more-features/urcl) של AdvantageScope.

הן URCL והן `StatusLogger` הרשמי יישארו זמינים במהלך עונת 2026 כדי להבטיח מעבר חלק ולספק תאימות תכונות לעונות קודמות. יהיו לנו פרטים נוספים לשתף על אפשרויות רישום יומן ב-2027 ואילך במועד מאוחר יותר.

<img src="/img/whats-new/revlog.png" alt="REVLOG visualization" />

## 💿 ייבוא קובצי CSV {#csv-file-imports}

לוויזואליזציה גמישה יותר של נתונים שנוצרו מחוץ למסגרות רישום היומנים של רובוטים, AdvantageScope כוללת כעת תמיכה בסיסית לייבוא קובצי CSV. ניתן לעיין ב[תיעוד](/overview/log-files/#csv-formatting) לפרטים נוספים על פורמטים נתמכים ומגבלות אחרות.

<img src="/img/overview/log-files/export-2.png" alt="CSV data" />

## 🤩 שיפורים אסתטיים {#aesthetic-improvements}

ממשק המשתמש של AdvantageScope ב-Windows 11 עודכן לתמיכה בסרגל צד חצי-שקוף, שהיה רכיב בלעדי לגרסאות macOS בגרסאות קודמות. סמל אפליקציה מעודכן זמין גם עבור macOS Tahoe בהתבסס על חומר Liquid Glass של Apple.

<img src="/img/whats-new/windows-ui.png" alt="Windows UI" />

## 📋 תפריטים יעילים {#streamlined-menus}

סרגל התפריטים והבקרות הקשורות אליו יעלו ואורגנו מחדש כדי להפוך את הבקרות לנגישות ועקביות יותר בכל הפלטפורמות. התכונות הבולטות כוללות:

- מעבר מהיר יותר בין מקורות חיים (כגון NetworkTables ו-[דיאגנוסטיקה Phoenix](/overview/live-sources/phoenix-diagnostics)), ללא צורך בפתיחת חלון ההעדפות.
- לחיצה ימנית על סרגל הצד להעתקה מהירה של שם שדה (או מפתח השדה המלא).
- ארגון מחדש של חלון ההעדפות, ההופך את האפשרויות לקלות יותר למציאה מהירה.

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.png" />
  <img src="/img/whats-new/menus-2.png" />
  <img src="/img/prefs.png" />
</div>

## 🐛 שיפורי יציבות {#stability-improvements}

גרסה זו כוללת מגוון תיקוני באגים ושיפורי יציבות ברחבי האפליקציה. הרשימה המלאה נמצאת ב[יומן השינויים](https://github.com/Mechanical-Advantage/AdvantageScope/releases) של הגרסה, אך כמה תיקונים בולטים מפורטים למטה:

- הביצועים של AdvantageScope בעת הזרמת נתונים לפרקי זמן ארוכים שופרו מאוד, במיוחד בעת שימוש בכרטיסיית הגרף הקווי.
- AdvantageScope כעת סלחנית יותר לנתוני יומן יוצאי דופן, כולל קובצי יומן גדולים וערכי שדה גדולים.
- תקלות ויזואליות שונות תוקנו בעת עיון בנתוני יומן, במיוחד בעת שימוש במסננים בכרטיסיית הגרף הקווי.
- סדר קובצי היומן של AdvantageKit בחלון ההורדה תוקן; יומנים ללא חותמות זמן נמצאים כעת בתחתית הרשימה, בדומה לפורמטים אחרים.
- בכרטיסיית מגרש ה-3D, מצלמות רובוט עם סיבוב שאינו אפס בציר הגלגול (roll) מיוצגות כעת בצורה נכונה.
- היציבות של AdvantageScope XR שופרה, במיוחד בעת הפעלה ב-iOS/iPadOS 26. עבור התקנות לא מקוונות, יש לבדוק ב-App Store אם קיימים עדכונים זמינים.
