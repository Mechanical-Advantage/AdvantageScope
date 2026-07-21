---
sidebar_position: 3
---

# 📐 מערכות צירים

AdvantageScope כוללת תמיכה במספר מערכות צירים נפוצות בכרטיסיות [🗺️ מגרש 2D](/tab-reference/2d-field) ו-[👀 מגרש 3D](/tab-reference/3d-field). אנא עיינו ב[תיעוד מערכת הצירים של WPILib](https://docs.wpilib.org/en/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system) למידע נוסף על מוסכמות הצירים והסיבוב המשמשות ב-AdvantageScope.

### התאמה אישית

כברירת מחדל, מערכת הצירים נבחרת באופן אוטומטי בהתבסס על תמונת/מודל המגרש שנבחרו. לבחירת מערכת צירים שונה לשימוש בכל המגרשים, יש לפתוח את חלון ההעדפות על ידי לחיצה על `אפליקציה` > `הצגת העדפות...` (Windows/Linux) או `AdvantageScope` > `הגדרות...` (macOS) ולשנות את האפשרות "מערכת צירים".

:::tip
כל אפשרויות מערכת הצירים תואמות הן למגרשי FRC והן למגרשי FTC.
:::

## מרכז/אדום (Systemcore) {#centerred-systemcore}

המקור נמצא במרכז המגרש כאשר ציר ה-+X פונה הרחק מקיר הברית האדומה, כפי שמוצג למטה. **זוהי מערכת הצירים כברירת מחדל עבור מגרשי FRC החל מ-2027 ומגרשי FTC החל מ-2027-2028.**

<img src="/img/more-features/coordinate-system-center-red.png" alt="Center/red coordinate system" />

## קיר כחול

המקור נמצא בפינה הימנית ביותר של קיר הברית הכחולה כאשר ציר ה-+X פונה לקיר הברית האדומה, כפי שמוצג למטה. **זוהי מערכת הצירים כברירת מחדל עבור מגרשי FRC מ-2023 עד 2026.**

<img src="/img/more-features/coordinate-system-blue-wall.png" alt="Blue wall coordinate system" />

## קיר הברית

המקור נמצא בפינה הימנית ביותר של קיר הברית עבור _הברית הנוכחית של הרובוט_ כאשר ציר ה-+X פונה לקיר הברית הנגדית, כפי שמוצג למטה. **זוהי מערכת הצירים כברירת מחדל עבור FRC ב-2022.**

<img src="/img/more-features/coordinate-system-alliance-wall.png" alt="Alliance wall coordinate system" />

## מרכז/מסובב

המקור נמצא במרכז המגרש כאשר ציר ה-+X פונה ימינה מזווית הראייה של קיר הברית האדומה, כפי שמוצג למטה. **זוהי מערכת הצירים כברירת מחדל עבור מגרשי FTC מ-2024-2025 עד 2026-2027.**

<img src="/img/more-features/coordinate-system-center-rotated.png" alt="Center/rotated coordinate system" height="400" />
