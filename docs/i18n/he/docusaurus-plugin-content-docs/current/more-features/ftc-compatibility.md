---
sidebar_position: 1
---

# ✴️ תאימות ל-FTC {#ftc-compatibility}

AdvantageScope כוללת תכונות המספקות חוויה חלקה במערכת הבקרה הקיימת של FIRST Tech Challenge, תוך הכנת המעבר אל [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) בעונות הבאות. כל תכונות AdvantageScope ייתמכו באופן רשמי ב-FTC לאחר המעבר אל Systemcore החל מעונת 2027-2028.

## מגרשים ורובוטים {#fields-and-robots}

מגרשי FTC ודגמי רובוטים נתמכים באופן מלא ומובנה.

- **דגמי מגרש ורובוט:** בחרו מגרשי FTC ודגמי רובוטים בכרטיסיות 🗺️ [מגרש 2D](/tab-reference/2d-field) ו-👀 [מגרש 3D](/tab-reference/3d-field) ישירות מהתפריטים הנפתחים. כל המגרשים תואמים ל-[AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- **מערכות צירים:** הגדירו את [מערכת הצירים](/more-features/coordinate-systems) לתאימות עם [קואורדינטות FTC סטנדרטיות](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) בכל מגרש. מערכת צירים זו משמשת כברירת מחדל במגרשי FTC.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## פורמטים נתמכים {#supported-formats}

AdvantageScope כוללת תמיכה מובנית בפורמט הסטרימינג החי של **FTC Dashboard** ובקובצי `.log` של **Road Runner**, בנוסף לפורמטים התואמים ל-WPILib כגון WPILOG ו-NetworkTables.

מספר ספריות טלמטריה ותיעוד יומנים של צד שלישי עבור FTC מפיקות נתונים בפורמטים התואמים ל-AdvantageScope. מפתחי AdvantageScope אינם ממליצים על פתרון רישום יומן מסוים עבור FTC, וייתכן שתיתקלו ביכולות מוגבלות בעת שימוש בחלק מפתרונות הרישום.

הרשימה להלן מספקת נקודת התחלה אך אינה ממצה:

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): מפיקה קובצי יומן לניפוי שגיאות של לוגיקת תכנון מסלול.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/): מזרימה טלמטריה חיה התואמת הן ללוח הבקרה שלה והן ל-AdvantageScope.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): מאפשרת רישום נתונים מותאם אישית למספר פורמטים, כולל קובצי יומן וסטרימינג חי.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): שומרת נתונים בפורמט WPILOG באמצעות הערות (annotations).
- **PsiKit**: מסגרת רישום יומנים ושחזור (replay) עבור FTC בהשראת AdvantageKit.

:::warning
על הקבוצות להקפיד לפעול בהתאם לחוק R704 במהלך תחרויות. שירותי טלמטריה של צד שלישי כגון FTC Dashboard אסורים בחיבור אלחוטי (Wi-Fi) בתחרויות.
:::

### AdvantageScope Lite עבור FTC {#advantagescope-lite-for-ftc}

הפצה לא רשמית של [AdvantageScope Lite](/more-features/advantagescope-lite) המותאמת ל-FTC זמינה: [**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). הפצה זו אינה רשמית ואינה נתמכת על ידי מפתחי AdvantageScope.

בעוד ש-[AdvantageScope Lite](/more-features/advantagescope-lite) הסטנדרטית היא אפליקציית רשת המיועדת לשימוש ב-Systemcore וב-Driver Station של FIRST, ההפצה הלא רשמית ל-FTC מותאמת במיוחד לשימוש ישיר במערכת הבקרה הקיימת של FTC. היא תומכת באופן מובנה בצפייה בנתונים חיים באמצעות פרוטוקול FTC Dashboard ללא צורך בתוכנה נוספת.
