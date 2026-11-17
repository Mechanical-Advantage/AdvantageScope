---
sidebar_position: 1
---

# ✴️ תאימות ל-FTC {#ftc-compatibility}

AdvantageScope כוללת כלים שנועדו לתת חוויית עבודה חלקה כבר במערכת הבקרה הקיימת של FIRST Tech Challenge, ובמקביל להכין את הקרקע למעבר ל-[Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) בעונות הבאות. החל מעונת 2027-2028, לאחר המעבר ל-Systemcore, כל התכונות של AdvantageScope ייתמכו באופן רשמי גם ב-FTC.

## מגרשים ורובוטים {#fields-and-robots}

מגרשי FTC ומודלי רובוטים נתמכים באופן מלא ומובנה.

- **מודלים של מגרשים ורובוטים:** בחרו מגרשי FTC ומודלי רובוטים ישירות מהתפריטים הנפתחים בכרטיסיות 🗺️ [מגרש 2D](/tab-reference/2d-field) ו-👀 [מגרש 3D](/tab-reference/3d-field). כל המגרשים תואמים גם ל-[AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- **מערכות צירים:** ניתן להגדיר את [מערכת הצירים](/more-features/coordinate-systems) בכל מגרש כך שתתאים ל[קואורדינטות הסטנדרטיות של FTC](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html). מערכת זו מופעלת כברירת מחדל במגרשי FTC.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## פורמטים נתמכים {#supported-formats}

בנוסף לפורמטים תואמי WPILib כמו WPILOG ו-NetworkTables, AdvantageScope תומכת באופן מובנה בהזרמת נתונים חיה (Live Streaming) מ-**FTC Dashboard** ובקובצי `.log` של **Road Runner**.

קיימות כמה ספריות טלמטריה ורישום יומנים (Logging) של צד שלישי עבור FTC המפיקות נתונים בפורמטים שנתמכים ב-AdvantageScope. מפתחי AdvantageScope אינם ממליצים על פתרון מסוים על פני אחר, וייתכן שבחלק מהספריות יהיו מגבלות ביכולות הנתמכות.

הרשימה הבאה היא נקודת פתיחה טובה, אך אינה מכסה את כל האפשרויות:

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): יוצרת קובצי יומן לדיבוג של תכנון המסלולים.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/): משדרת טלמטריה חיה שתואמת גם לדשבורד שלה וגם ל-AdvantageScope.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): מאפשרת רישום נתונים מותאם אישית בכמה פורמטים, כולל קובצי יומן ושידור חי.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): שומרת נתונים בפורמט WPILOG באמצעות הערות בקוד (annotations).
- **PsiKit**: מסגרת לרישום יומנים ושחזור (replay) עבור FTC, בהשראת AdvantageKit.

:::warning
בתחרויות, יש להקפיד על עמידה בחוק R704. שירותי טלמטריה של צד שלישי כמו FTC Dashboard אסורים לשימוש מעל רשת ה-Wi-Fi במהלך תחרויות.
:::

### AdvantageScope Lite עבור FTC {#advantagescope-lite-for-ftc}

קיימת הפצה לא רשמית של [AdvantageScope Lite](/more-features/advantagescope-lite) שהותאמה במיוחד ל-FTC: [**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). הפצה זו אינה רשמית ואינה נתמכת על ידי מפתחי AdvantageScope.

בעוד ש-[AdvantageScope Lite](/more-features/advantagescope-lite) הרגילה היא אפליקציית דפדפן שנועדה לפעול על Systemcore וב-FIRST Driver Station, ההפצה הלא רשמית ל-FTC הותאמה לעבודה ישירה על מערכת הבקרה הקיימת של FTC. היא תומכת מובנית בצפייה בנתונים חיים דרך פרוטוקול FTC Dashboard, ללא צורך בתוכנה נוספת.
