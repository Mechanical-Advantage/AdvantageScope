---
sidebar_position: 1
---

# 📦 התקנה

הגרסה הנתמכת באופן רשמי של AdvantageScope זמינה ישירות מ-Team 6328 או דרך מתקין WPILib. מספר הפצות לא רשמיות זמינות גם כן.

## Team 6328 {#team-6328}

### הורדות: [יציבה](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest), [גרסה מוקדמת](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

הורדת AdvantageScope ישירות מ-Team 6328 מספקת:

- את התכונות ותיקוני הבאגים החדשים ביותר לפני שהם זמינים דרך ערוצים אחרים.
- התראות בתוך האפליקציה כאשר גרסה חדשה זמינה להורדה.
- אוסף מובנה של מודלי רובוטים עדכניים של 6328 לשימוש בכרטיסיית 👀 [מגרש 3D](/tab-reference/3d-field).

:::note
לפני הפעלת גרסאות AppImage ב-Ubuntu 23.10 או גרסאות מתקדמות יותר, יש להוריד את פרופיל AppArmor מדף ההפצות ולהעתיק אותו ל-/etc/apparmor.d.
:::

:::info
כל גרסה ראשית של AdvantageScope מופצת בינואר לפני אירוע ה-kickoff של FRC, כאשר מספר הגרסה תואם לשנה (למשל v26.0.0 תופץ בינואר 2026). גרסאות בטא ואלפא של AdvantageScope עשויות להיות זמינות בחודשים שלפני כל הפצה, עבור קבוצות המעוניינות להתנסות בתכונות חדשות ולספק משוב. **קבוצות המשתמשות בגרסאות מוקדמות אלו צריכות לצפות לראות בעיות ובאגים שאינם קיימים בהפצות יציבות.**
:::

## WPILib

### התקנה: [תיעוד WPILib](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

מתקין WPILib כולל גרסה עדכנית של AdvantageScope, אך עשוי לפגר אחרי הגרסה החדשה ביותר הזמינה להורדה ישירה. תיעוד להפעלת AdvantageScope מגרסת WPILib של VSCode ניתן למצוא [כאן](https://docs.wpilib.org/en/stable/docs/software/dashboards/advantagescope.html).

## הפצות לא רשמיות

הפצות לא רשמיות של AdvantageScope זמינות מספר מקורות, אשר אינם נתמכים באופן רשמי על ידי מפתחי AdvantageScope/WPILib. הפצות אלו עשויות לפגר אחרי הגרסה החדשה ביותר של AdvantageScope הזמינה ממקורות רשמיים. יש ליצור קשר ישירות עם המתחזקים במקרה של בעיות.

- [**AdvantageScope Lite עבור מערכת הבקרה של REV:**](https://github.com/j5155/AdvantageScope-Lite-FTC) התאמה של [AdvantageScope Lite](/more-features/advantagescope-lite) לשימוש במערכת הבקרה הקיימת (לפני Systemcore) ב-FTC.
- [**מתקין Homebrew:**](https://formulae.brew.sh/cask/advantagescope) Homebrew cask להתקנת AdvantageScope משורת הפקודה ב-macOS.
- [**מאגר משתמשי Arch:**](https://aur.archlinux.org/packages/advantagescope) שיטת הפצה חלופית לשימוש עם מנהל החבילות pacman (הפצת Arch רשמית של AdvantageScope זמינה [כאן](#6328-downloads)).
