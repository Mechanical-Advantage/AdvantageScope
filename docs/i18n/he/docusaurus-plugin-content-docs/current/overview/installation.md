---
sidebar_position: 1
---

# 📦 התקנה {#installation}

את הגרסה הרשמית והנתמכת של AdvantageScope אפשר להוריד ישירות מ-Team 6328 או דרך המתקין של WPILib. בנוסף, קיימות גם כמה הפצות לא רשמיות.

## Team 6328 {#team-6328}

### הורדות: [יציבה](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest), [גרסה מוקדמת](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

הורדה ישירה של AdvantageScope מ-Team 6328 נותנת לכם:

- את היכולות החדשות ותיקוני הבאגים העדכניים ביותר, לפני שהם מגיעים לערוצים אחרים.
- התראות בתוך האפליקציה כשיוצאת גרסה חדשה להורדה.
- אוסף מובנה של דגמי הרובוטים האחרונים של 6328 לשימוש בכרטיסיית 👀 [מגרש 3D](/tab-reference/3d-field).

:::note
לפני הפעלת קובצי AppImage ב-Ubuntu 23.10 ומעלה, יש להוריד את פרופיל ה-AppArmor מדף ההפצות ולהעתיק אותו לתיקייה `/etc/apparmor.d`.
:::

:::info
כל גרסה ראשית של AdvantageScope יוצאת בינואר, לפני ה-Kickoff של FRC, ומספר הגרסה שלה תואם לשנה (למשל, v26.0.0 יצאה בינואר 2026). בחודשים שלפני השחרור הרשמי יוצאות לפעמים גרסאות אלפא ובטא עבור קבוצות שרוצות להתנסות ביכולות חדשות ולשלוח משוב. **קבוצות שבוחרות להשתמש בגרסאות המוקדמות האלה צריכות לקחת בחשבון שצפויים בהן באגים ובעיות שלא קיימים בגרסה היציבה.**
:::

## WPILib {#wpilib}

### התקנה: [תיעוד WPILib](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

המתקין של WPILib כולל גרסה עדכנית של AdvantageScope, אבל היא עלולה להיות מעט ישנה יותר מהגרסה האחרונה שזמינה להורדה ישירה. הסבר על פתיחת AdvantageScope מתוך גרסת ה-VSCode של WPILib תמצאו [כאן](https://docs.wpilib.org/en/stable/docs/software/dashboards/advantagescope.html).

## הפצות לא רשמיות {#unofficial-distributions}

בנוסף קיימות הפצות לא רשמיות של AdvantageScope ממקורות שונים, שאינן נתמכות רשמית על ידי מפתחי AdvantageScope או WPILib. ההפצות האלו עלולות להיות מעודכנות פחות מהגרסה הרשמית האחרונה, ואם נתקלתם בבעיה פנו ישירות למתחזקים שלהן.

- [**AdvantageScope Lite עבור מערכת הבקרה של REV:**](https://github.com/j5155/AdvantageScope-Lite-FTC) גרסה מותאמת של [AdvantageScope Lite](/more-features/advantagescope-lite) לעבודה עם מערכת הבקרה הקיימת (לפני Systemcore) ב-FTC.
- [**מתקין Homebrew:**](https://formulae.brew.sh/cask/advantagescope) חבילת Homebrew cask להתקנת AdvantageScope משורת הפקודה ב-macOS.
- [**מאגר המשתמשים של Arch (AUR):**](https://aur.archlinux.org/packages/advantagescope) דרך התקנה חלופית עבור מנהל החבילות pacman (הפצת Arch רשמית של AdvantageScope זמינה [כאן](#6328-downloads)).
- [**FRC-Nix:**](https://github.com/frc4451/frc-nix) אוסף של חבילות Nix ומודולים הצהרתיים של NixOS הקשורים ל-FIRST, כולל AdvantageScope, לשימוש עם מנהל החבילות Nix והפצת הלינוקס NixOS.
