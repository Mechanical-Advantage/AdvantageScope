---
title: מה חדש ב-2027?
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-2027-rtl-light.webp" className="light-only" />
<img src="/img/whats-new/banner-2027-rtl-dark.webp" className="dark-only" />

גרסת 2027 של AdvantageScope זמינה כעת, ומביאה תמיכה מלאה ב-Systemcore לצד יותר מ-**100 תכונות ועדכונים חדשים** ברחבי האפליקציה. עיינו ב[מדריך ההתקנה](/overview/installation) וב[רשימת השינויים המלאה](https://github.com/Mechanical-Advantage/AdvantageScope/releases) לפרטים נוספים. דף זה מדגיש את התוספות והשיפורים המרכזיים בגרסה זו.

**אנו מעריכים את המשוב שלכם! הערות, בקשות לתכונות ודיווחים על באגים יתקבלו בברכה ב[דף ה-issues](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />

## 🍋‍🟩 תאימות ל-Systemcore {#systemcore-compatibility}

AdvantageScope 2027 בנויה לפעולה חלקה עם בקר הרובוט החדש Systemcore ו-WPILib 2027:

- כתובת הרובוט המוגדרת כברירת מחדל היא כעת `robot.local`, מה שמאפשר להתחבר בשידור חי או להוריד יומנים ללא הגדרת מספר קבוצה. ניתן לבחור גם כתובות USB ו-Wi-Fi של Systemcore משורת התפריטים.
- [הורדת יומנים](/overview/log-files#downloading-from-the-robot) תומכת כעת ב-SFTP עבור Systemcore לצד הורדת יומנים מדור קודם של roboRIO.
- נוספה מערכת הצירים [מרכז/אדום](/more-features/coordinate-systems#center-red) המשמשת במגרשי FRC החל מ-2027 ובמגרשי FTC החל מעונת 2027–2028.
- נוספה תמיכה בממשקי ה-API של `Telemetry` ו-`Tunables` ב-WPILib 2027, צבעי התראה מעודכנים ו[העדפת תצוגת חותמות זמן](/more-features/timestamps) חדשה כדי לשמור על קריאות חותמות הזמן של Systemcore.
- מצב חי חדש של [דיאגנוסטיקה של Systemcore](/overview/live-sources) מתחבר ישירות לשרת ה-NetworkTables המובנה של Systemcore לניטור מצב הרובוט וקלט/פלט חומרה ללא צורך בקוד משתמש.

## 💡 AdvantageScope Lite {#advantagescope-lite}

[AdvantageScope Lite](/more-features/advantagescope-lite) מביאה את כלי הוויזואליזציה והניתוח של AdvantageScope ישירות לדפדפן האינטרנט שלכם. היא נגישה הן מממשק הווב של Systemcore והן מתוך FIRST Driver Station **ללא צורך בהתקנה**.

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/lHsak9Mmx2M" title="הדגמת AdvantageScope Lite" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 🎮 FIRST Driver Station {#first-driver-station}

AdvantageScope משתלבת באופן הדוק עם [FIRST Driver Station](https://docs.wpilib.org/en/latest/docs/software/firstdriverstation) החדשה כדי לייעל את אבחון המשחקים:

- [AdvantageScope Lite](/more-features/advantagescope-lite) נגישה ישירות מתפריט ההגדרות של FIRST Driver Station לניתוח קובצי WPILOG שנוצרו על ידי ה-DS.
- השתמשו באפליקציית שולחן העבודה כדי להזרים בזמן אמת את מצב המשחק, מדדי תקשורת, מתח סוללה וקלט ג'ויסטיקים מ-Driver Station מקומי ללא כל הגדרה.
- פתיחת קובץ `.wpilog` של Driver Station בגרסת שולחן העבודה מציעה לפתוח חלון ייעודי המוגדר מראש עם כרטיסיות לפלט מסוף, מדדי תקשורת, הספק, ניצולת CPU וג'ויסטיקים ([תיעוד](/overview/log-files#driver-station-layout)). פריסה זו משמשת כברירת מחדל גם ב-AdvantageScope Lite עבור ה-Driver Station.
- צפו ביומני המסוף של ה-Driver Station בכרטיסיית 💬 [מסוף](/tab-reference/console) עם הדגשה אוטומטית של אזהרות/שגיאות ותמיכה מלאה ב[רצפי בריחה של ANSI](/tab-reference/console#ansi-formatting) (צבעים וסגנונות טקסט).

<img src="/img/tutorials/taking-control-1.webp" alt="פתיחת AdvantageScope Lite מתוך FIRST Driver Station" />

_הממשק בתמונה מוצג באנגלית._

## 🌐 תמיכה בשפות {#language-support}

AdvantageScope זמינה כעת ב-**14 שפות** באפליקציית שולחן העבודה, באתר התיעוד, באפליקציות המובייל וב-AdvantageScope Lite: אנגלית (ארה"ב), ספרדית (אמריקה הלטינית), צרפתית, הולנדית, פורטוגזית (ברזיל), רומנית, טורקית, רוסית, קזחית, עברית, ערבית, הינדי, סינית פשוטה וסינית מסורתית.

:::info
התרגומים הם עבודה בתהליך שנוצרה בתמיכת בינה מלאכותית ותורמים מהקהילה, ו**עשויים לכלול ניסוחים לא טבעיים או אי-דיוקים**. תודה לקבוצות שכבר עזרו לסקור ולשפר תרגומים אלה! עיינו בדף 🌐 [תמיכה בשפות](/overview/language-support) לפרטים על תהליך התרגום שלנו וכיצד לשלוח משוב.
:::

<img src="/img/whats-new/multi-language-1.webp" alt="כרטיסיית גרף קווי בסינית פשוטה" />

## 📖 מדריכים ותיעוד חדשים {#new-tutorials-and-documentation}

התיעוד הורחב עם [סדרת מדריכים](/category/tutorials) חדשה בת שלושה חלקים שנועדה לעזור לקבוצות להתחיל עם WPILib 2027 ו-AdvantageScope:

1. **👋 [שלום, טלמטריה!](/tutorials/hello-telemetry):** הגדרת `DataLogManager` ו-`Telemetry` API, התחברות בשידור חי וניתוח נתונים באמצעות גרפים קוויים, טבלאות וסטטיסטיקה.
2. **🤖 [אל המגרש: ויזואליזציית רובוט](/tutorials/to-the-field):** פרסום תנוחות 2D/3D, מסלולים מתוכננים ואובייקטי `Mechanism2d` במגרשי FRC ו-FTC.
3. **🕹️ [לוקחים שליטה: DS וג'ויסטיקים](/tutorials/taking-control):** הזרמת דיאגנוסטיקה חיה של Driver Station, סנכרון יומני רובוט ו-DS, צפייה בפלט המסוף והצגת קלט בקרים.

דוגמאות הקוד ברחבי התיעוד עודכנו גם הן עם כיסוי מלא של `Telemetry` API של WPILib במספר שפות תכנות.

<img src="/img/tutorials/to-the-field-4.webp" alt="ויזואליזציית מגרש 3D מתוך המדריך אל המגרש" />

_הממשק בתמונה מוצג באנגלית._

## 📱 AdvantageTune {#advantagetune}

AdvantageTune היא אפליקציה עצמאית חדשה ל-iPhone ול-iPad המספקת חוויית כוונון ניידת וקלת משקל המשלימה את AdvantageScope. תוכלו לצפות ולשנות נושאי [NetworkTables](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html) חיים (כולל ערכים פרימיטיביים, מערכים, מבני WPILib ו-Protobufs) ישירות מהטלפון, מה שמקל על כולם לקחת חלק בכוונון קוד הרובוט.

הן AdvantageTune והן AdvantageScope מייעלות את תהליך ייצוא הערכים המכווננים בחזרה לקוד הרובוט באמצעות כפתורים לשמירת כל הערכים המכווננים בקובץ טקסט לשיתוף קל ([תיעוד](/overview/live-sources/tuning-mode)).

[<img src="/img/app-store_he.svg" alt="App Store" />](https://apps.apple.com/il/app/advantagetune/id6811453643?l=he)

<div className="image-gallery">
  <img src="/img/whats-new/advantagetune-1.webp" alt="תצוגת עיון ב-AdvantageTune" />
  <img src="/img/whats-new/advantagetune-2.webp" alt="עריכת נושאים ב-AdvantageTune" />
  <img src="/img/whats-new/advantagetune-3.webp" alt="עריכת מבנים ב-AdvantageTune" />
  <img src="/img/whats-new/advantagetune-4.webp" alt="רשימת ערכים מכווננים ב-AdvantageTune" />
  <img src="/img/whats-new/advantagetune-5.webp" alt="חיפוש וסינון ב-AdvantageTune" />
</div>

_הממשק בתמונה מוצג באנגלית._

## 🪐 רישום אוניברסלי עם WPILOG {#wpilog-universal-logging}

באמצעות [רישום אוניברסלי](/more-features/universal-logging), קובץ WPILOG יחיד יכול כעת לשמש כמכל אוניברסלי עבור מספר זרמי נתונים ופורמטים של יומנים, כולל יומני התקנים ייעודיים ליצרנים, נתוני CSV וקובצי WPILOG משניים. הרישום האוניברסלי מחליף את URCL בגישה גמישה ובלתי תלויה ביצרן: נתונים מכל מקור מסונכרנים אוטומטית וממוזגים לעץ מאוחד אחד בסרגל הצד. עיינו ב[תיעוד הרישום האוניברסלי](/more-features/universal-logging#experimental-vendor-logging) לפרטים על לכידת יומני יצרנים ב-AdvantageKit וב-WPILib (בקרוב).

<img src="/img/more-features/universal-logging-1.webp" alt="קובץ WPILOG המציג מספר יומני יצרנים בסרגל הצד" />

_הממשק בתמונה מוצג באנגלית._

## 🗺️ שיפורים בכרטיסיות המגרש {#field-tab-improvements}

מספר שיפורי שימושיות נוספו לכרטיסיות 🗺️ [מגרש 2D](/tab-reference/2d-field) ו-👀 [מגרש 3D](/tab-reference/3d-field):

- הזיזו והתקרבו ברחבי מגרש ה-2D, או לחצו לחיצה ימנית כדי לנעול את המצלמה כך שתעקוב אחר מיקום הרובוט והסיבוב שלו ([תיעוד](/tab-reference/2d-field#camera-controls)).
- נוספה אפשרות לעמעום רובוטי רפאים ב-2D וב-3D כאשר השדות לא התעדכנו לאחרונה (שימושי להצגת תנוחות ראייה ממוחשבת).
- נוספו קווי רשת אריחים במגרשי FTC ב-2D וב-3D להתמצאות מרחבית קלה יותר.
- AdvantageScope זוכרת כעת אם נעשה שימוש לאחרונה במגרש FRC או FTC בעת פתיחת כרטיסיות מגרש 2D או 3D חדשות.

<img src="/img/tab-reference/2d-field-1.webp" alt="סקירת כרטיסיית מגרש 2D" />

_הממשק בתמונה מוצג באנגלית._

## 📉 שיפורים בגרף הקווי {#line-graph-improvements}

ה-📉 [גרף קווי](/tab-reference/line-graph) וציר הזמן כוללים מספר ליטושים חזותיים לניתוח ברור יותר:

- הפעלת "הצגת מצב רובוט" מציגה כעת סרגל מקודד-צבע עבור שלבי אוטונומי, Teleop, שירות ומושבת.
- גרפים בסגנון נקודות מתאימים אוטומטית את גודל הנקודות לנראות טובה יותר בכל רמת זום.
- רמזים מועילים מופיעים בגרף הקווי ובציר הזמן כדי להדריך משתמשים חדשים במחוות גלילה וזום.
- שופרו העיבוד והקריאות של ערכי חותמות זמן גדולים על צירי ציר הזמן והגרף הקווי.

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="שכבת מצב רובוט מקודדת-צבע על הגרף הקווי" />

_הממשק בתמונה מוצג באנגלית._

## 🤝 שיפורי נגישות {#accessibility-enhancements}

AdvantageScope 2027 כוללת מספר עדכונים שהופכים את האפליקציה לנגישה יותר:

- נוסף ניווט מקלדת באמצעות Tab לכל שדות הקלט ותיאורי כלים (tooltips) מפורטים לכל הפקדים ברחבי האפליקציה.
- AdvantageScope מכבדת כעת את הגדרות מערכת ההפעלה "הפחתת שקיפות" ו"הפחתת תנועה".
- מחוונים בוליאניים בסרגל הצד מבחינים כעת בין מצבים מבלי להסתמך על צבע בלבד.

## 🥔 סוגי יחידות חדשים {#new-unit-types}

ה[גרפים מודעי-היחידות](/tab-reference/line-graph/units) של AdvantageScope הורחבו עם סוגי יחידות ואפשרויות פענוח נוספים:

- הספק (וואט, כוחות סוס וכו')
- יחסים (חסר ממד, אחוזים)
- טמפרטורה בקלווין
- אנרגיית תפוח אדמה
- איות יחידות באנגלית בריטית (למשל `metres`)
- סיומות עבור ספריית היחידות של WPILib

## 🧱 שיפורי יציבות {#stability-improvements}

גרסה זו כוללת תיקוני באגים רבים, אופטימיזציות ביצועים ושיפורי יציבות ברחבי האפליקציה. הרשימה המלאה זמינה ב[רשימת השינויים](https://github.com/Mechanical-Advantage/AdvantageScope/releases), עם הדגשים בולטים להלן:

- גרסאות Windows רשמיות חתומות כעת דיגיטלית, מה שמפחית את תדירות אזהרות SmartScreen במהלך ההתקנה.
- שופרו משמעותית ביצועי טעינת היומנים והשרטוט, במיוחד בעבודה עם יומני Hoot (`.hoot`) ומערכי מבנים גדולים.
- תוקן הטיפול בחותמות זמן בעת צפייה ביומני AdvantageKit יחד עם מקורות נתונים בתדר גבוה.
- שופר אלגוריתם סנכרון חותמות הזמן של יומנים מרובים בעת יישור יומנים ממקורות שונים.
- שופרה אמינות החיבור עבור [דיאגנוסטיקה Phoenix](/overview/live-sources/phoenix-diagnostics).
- תוקנו בעיות ממשק עם שורת התפריטים בחלונות צפים ועם חלונית ההקלטה ב-[AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- לוטשו טקסטים וניסוחי ממשק ברחבי האפליקציה לשיפור הבהירות.
