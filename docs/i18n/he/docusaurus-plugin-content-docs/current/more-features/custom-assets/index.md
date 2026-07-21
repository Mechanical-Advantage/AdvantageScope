# ⚙️ נכסים מותאמים אישית

AdvantageScope משתמשת בסט ברירת מחדל של תמונות מגרש שטוחות, מודלי מגרש, מודלי רובוטים ותצורות בקרים. נכסים פשוטים (כגון מגרשי evergreen) כלולים בהתקנה הראשונית. נכסים מפורטים (כגון מגרשים ספציפיים לעונה) יורדים באופן אוטומטי ברקע בעת התחברות AdvantageScope לאינטרנט. לבדיקת הסטטוס של הורדות אלו, יש ללחוץ על `אפליקציה`/`AdvantageScope` > `סטטוס הורדת נכסים...`.

ניתן להתאים אישית את סט הנכסים להוספת אפשרויות נוספות במידת הרצון. לפתיחת תיקיית נכסי המשתמש, יש ללחוץ על `אפליקציה`/`AdvantageScope` > `הצגת תיקיית נכסים`. הפורמטים הצפויים עבור הנכסים מוגדרים למטה. ראו את סט ברירת המחדל של [נכסים מפורטים](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) ו[נכסים מאוגדים (bundled)](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) לעיון.

:::tip
לטעינת נכסים ממיקום חלופי, יש ללחוץ על `אפליקציה`/`AdvantageScope` > `שימוש בתיקיית נכסים מותאמת אישית`. התיקייה שנבחרה צריכה להיות _תיקיית האב_ שבה ניתן למקם נכסים מרובים בתתי-תיקיות נפרדות. תכונה זו מאפשרת לאחסן נכסים מותאמים אישית תחת בקרת גרסאות לצד קוד הרובוט.
:::

## פורמט כללי

כל הנכסים מאוחסנים בתיקיות עם מוסכמת מתן השמות "TYPE_NAME". ה-NAME המשמש עבור התיקייה אינו מוצג על ידי AdvantageScope. סוגי הנכסים האפשריים הם:

- "Field2d"
- "Field3d"
- "Robot"
- "Joystick"

:::info
שמות תיקיות לדוגמה יהיו "Field2d_2023Field", "Joystick_OperatorButtons", או "Robot_Dozer".
:::

תיקייה זו צריכה להכיל קובץ בשם "config.json" וקובץ נכס אחד או יותר, כפי שמתואר למטה. קובץ התצורה כולל תמיד את שם הנכס להצגה על ידי AdvantageScope. שם זה חייב להיות ייחודי עבור כל סוג נכס.

```json
{
  "name": string // שם ייחודי, נדרש עבור כל סוגי הנכסים
  ... // תצורה תלוית-סוג, מתוארת למטה
}
```

## מודלי רובוט 3D

### מדריך וידאו

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### סקירה כללית

מודל חייב להיכלל בתיקייה עם השם "model.glb". קובצי CAD חייבים להמיר ל-glTF; ראו [דף זה](gltf-convert) לפרטים. קובץ התצורה חייב להיות בפורמט הבא:

```json
{
  "name": string // שם ייחודי, נדרש עבור כל סוגי הנכסים
  "isFTC": boolean // האם המודל מיועד לשימוש במגרשי FTC במקום מגרשי FRC (ברירת מחדל "false")
  "disableSimplification": boolean // האם להשבית את פישוט המודל, אופציונלי
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // רצף סיבובים לאורך צירי x, y ו-z
  "position": [number, number, number] // היסט מיקום במטרים, מופעל לאחר סיבוב
  "cameras": [ // מיקומי מצלמה קבועים, יכול להיות ריק
    {
      "name": string // שם המצלמה
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // רצף סיבובים לאורך צירי x, y ו-z
      "position": [number, number, number] // היסט מיקום במטרים יחסית לרובוט, מופעל לאחר סיבוב
      "resolution": [number, number] // רזולוציה בפיקסלים, משמשת להגדרת יחס הגובה-רוחב הקבוע
      "fov": number // שדה ראייה אופקי במעלות
    }
  ],
  "components": [...] // ראו "רכיבים מפרקיים"
}
```

הדרך הפשוטה ביותר לקביעת ערכי מיקום וסיבוב מתאימים היא ניסוי וטעות. אנו ממליצים להתאים את הסיבוב לפני המיקום מכיוון שהטרנספורמציות מופעלות בסדר זה.

:::info
AdvantageScope מפשטת את הגיאומטריה של המודל באופן אוטומטי לשיפור הביצועים, כאשר רמת הפירוט תלויה ב[מצב הרינדור](/tab-reference/3d-field#rendering-modes) שנבחר. במקרים שבהם פישוט המודל מייצר אפקטים לא רצויים עם נכסים מותאמים אישית, ניתן להשתמש בשני פתרונות:

- להשבתת הסרה אוטומטית של משטחים (mesh) מסוימים, כלול את המחרוזת `NOSIMPLIFY` בשם המשטח.
- להשבתת פישוט מודל עבור מודל רובוט שלם, הגדר את האפשרות `disableSimplification` בתצורה ל-`true`.

:::

### רכיבים מפרקיים

:::warning
הגדרת רכיבים מפרקיים עשויה להיות מורכבת ולגזול זמן רב. מומלץ לשקול ניצול של [התמיכה ב-`Mechanism2d` 3D](/tab-reference/3d-field#2d-mechanisms) ב-AdvantageScope, המציעה גישה יעילה יותר ל**וויזואליזציית מנגנונים במגרש ה-3D**.
:::

מודלי רובוטים יכולים להכיל רכיבים מפרקיים לוויזואליזציה של נתוני מנגנונים (ראו [כאן](/tab-reference/3d-field) לפרטים). מודל ה-glTF הבסיסי לא צריך להכיל רכיבים, ולאחר מכן כל רכיב צריך להיות מיוצא כמודל glTF נפרד. מודלי רכיבים עוקבים אחר מוסכמת מתן השמות "model_INDEX.glb", כך שהרכיב המפרקי הראשון יהיה "model_0.glb"

תצורת הרכיבים מסופקת בקובץ התצורה של הרובוט. מערך של רכיבים צריך להיות מסופק תחת המפתח "components". כאשר לא מסופקות תנוחות רכיבים על ידי המשתמש ב-AdvantageScope, מודלי הרכיבים ימוקמו תוך שימוש בסבבי ומיקום הרובוט ברירת המחדל (ראו לעיל). כאשר תנוחות רכיבים מסופקות על ידי המשתמש, סיבובי ומיקום "איפוס" (zeroed) מופעלים במקום זאת כדי להביא כל רכיב למקור הרובוט. תנוחות המשתמש מופעלות לאחר מכן להזזת כל רכיב למיקום הנכון ברובוט.

:::tip
בעת מיקום רכיבי 3D יחסית לרובוט, מקור מערכת הצירים תואם לתנוחה המפורסמת של הרובוט. שימו לב כי תנוחה זו משתמשת בדרך כלל בגובה של אפס, שהוא מישור הרצפה ולא תחתית הרובוט (bellypan) (עבור תנועת רובוט 2D טיפוסית).
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // רצף סיבובים לאורך צירי x, y ו-z
    "zeroedPosition": [number, number, number] // היסט מיקום במטרים יחסית לרובוט, מופעל לאחר סיבוב
  }
]
```

#### תהליך ההגדרה

לכיול המיקומים של הרכיבים המפרקיים, אנו ממליצים על התהליך הבא:

1. ייצא את מודל הבסיס והרכיבים במיקומי "ברירת המחדל" הנכונים שלהם. כך הם צריכים להיות מרונדרים אם לא מסופקות תנוחות רכיבים ב-AdvantageScope.

2. פרסם תנוחת 2D מאופסת מקוד הרובוט, ולאחר מכן בחר אותה כתנוחת הרובוט ב-AdvantageScope. עבור למגרש 3D "צירים", המציג את מקור המגרש.

3. התאם את הסיבובים הכוללים של הרובוט (לא של הרכיבים) עד שהרובוט המלא מופנה בצורה נכונה. לאחר מכן, התאם את המיקום הכולל להבאת הרובוט המלא למקור. הרכיבים צריכים להיות מרונדרים באותם מיקומי ברירת מחדל לאורך תהליך זה.

4. פרסם מערך של תנוחות 3D מאופסות מקוד הרובוט התואם למספר הרכיבים במודל, ולאחר מכן בחר אותו כסט תנוחות הרכיבים ב-AdvantageScope.

5. התאם את הסיבובים, ולאחריהם את המיקומים, עבור כל רכיב עד שהם מיושרים למקור. לדוגמה, מקטע זרוע ייושר עם הציר במקור בעודו מופנה קדימה לאורך ציר ה-X.

6. פרסם את תנוחות הרכיבים האמיתיות מקוד הרובוט, שיתבססו על המקורות שהוגדרו מחדש עבור כל רכיב. לדוגמה, התנוחה עבור מקטע זרוע תמוקם במפרק הזרוע מופנית בכיוון המקטע.

## בקרים

תמונה חייבת להיכלל בתיקייה עם השם "image.png". קובץ התצורה חייב להיות בפורמט הבא:

```json
{
  "name": string // שם ייחודי, נדרש עבור כל סוגי הנכסים
  "components": [...] // מערך תצורות רכיבים, ראו למטה
}
```

:::info
לחצנים, בקרים וערכי צירים תומכים הן בקישורי [SDL](https://www.libsdl.org) (המשמשים את עמדת הנהגים הנוכחית ב-FIRST Driver Station) והן בקישורי NI (המשמשים את עמדת הנהגים הישנה ב-NI FRC Driver Station). לפחות סט קישורים אחד חייב להיות מסופק עבור כל רכיב.

עבור קישורי NI, AdvantageScope תואמת לאחור עם מפתחות תצורה ישנים ללא קידומת (כגון `sourceIndex`). **כל הבקרים החדשים צריכים להשתמש בקישורי מפורשים של SDL (כגון `sdlSourceIndex`) לתאימות עם עמדת הנהגים הנוכחית ב-FIRST Driver Station.**
:::

### לחצן יחיד / ערך POV

```json
{
  "type": "button"
  "isYellow": boolean
  "isEllipse": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number
  "sdlSourcePov": string // אופציונלי, יכול להיות "up", "right", "down", או "left". אם מסופק, ה-"sdlSourceIndex" יהיה האינדקס של ה-POV לקריאה.

  // קישורים חלופיים עבור NI Driver Station (אופציונלי)
  "niSourceIndex": number
  "niSourcePov": string
}
```

### בקר דו-צירי (Joystick)

```json
{
  "type": "joystick" // בקר (joystick) הנע בשני ממדים
  "isYellow": boolean
  "centerPx": [number, number]
  "radiusPx": number
  "sdlXSourceIndex": number
  "sdlXSourceInverted": boolean // לא הפוך: ימינה = חיובי
  "sdlYSourceIndex": number
  "sdlYSourceInverted": boolean // לא הפוך: למעלה = חיובי
  "sdlButtonSourceIndex": number // אופציונלי

  // קישורים חלופיים עבור NI Driver Station (אופציונלי)
  "niXSourceIndex": number
  "niXSourceInverted": boolean
  "niYSourceIndex": number
  "niYSourceInverted": boolean
  "niButtonSourceIndex": number
}
```

### ציר יחיד

```json
{
  "type": "axis" // ערך ציר יחיד
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
  "sdlSourceRange": [number, number] // מינימום גדול ממקסימום להפיכה

  // קישורים חלופיים עבור NI Driver Station (אופציונלי)
  "niSourceIndex": number,
  "niSourceRange": [number, number]
}
```

### משטח מגע (Touchpad)

```json
{
  "type": "touchpad" // משטח מגע (touchpad)
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
}
```

## תמונות מגרש שטוחות

תמונה חייבת להיכלל בתיקייה עם השם "image.png". היא צריכה להיות מופנית כאשר הברית האדומה משמאל. קובץ התצורה חייב להיות בפורמט הבא:

```json
{
  "name": string // שם ייחודי, נדרש עבור כל סוגי הנכסים
  "isFTC": boolean // האם זהו מגרש FTC במקום מגרש FRC
  "coordinateSystem": // מערכת הצירים כברירת מחדל לשימוש (ראו למטה)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC traditional
      "center-red"       // Systemcore
  "useGrid": boolean // האם לרנדר קווי רשת אם מגרש זה הוא FTC (ברירת מחדל "true")
  "sourceUrl": string // קישור לקובץ המקורי, אופציונלי
  "topLeft": [number, number] // קואורדינטת פיקסלים (מקור בצד שמאל למעלה)
  "bottomRight": [number, number] // קואורדינטת פיקסלים (מקור בצד שמאל למעלה)
  "widthInches": number // רוחב אמיתי של המגרש (הצד הארוך)
  "heightInches": number // גובה אמיתי של המגרש (הצד הקצר)
}
```

## מודלי מגרש 3D

מודל חייב להיכלל בתיקייה עם השם "model.glb". לאחר הפעלת כל הסיבובים, המגרש צריך להיות מופנה כאשר הברית האדומה משמאל. קובצי CAD חייבים להמיר ל-glTF; ראו [דף זה](gltf-convert) לפרטים. מודלי אלמנט משחק עוקבים אחר מוסכמת מתן השמות "model_INDEX.glb" בהתבסס על הסדר שבו הם מופיעים במערך "gamePieces". AprilTags שמוצהרים כאן ממוקמים תמיד תוך שימוש במערכת צירים [מרכז/אדום](/more-features/coordinate-systems#centerred-systemcore), ללא קשר לאפשרויות תצורה אחרות.

קובץ התצורה חייב להיות בפורמט הבא:

```json
{
  "name": string // שם ייחודי, נדרש עבור כל סוגי הנכסים
  "isFTC": boolean // האם זהו מגרש FTC במקום מגרש FRC
  "coordinateSystem": // מערכת הצירים כברירת מחדל לשימוש (ראו למטה)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC traditional
      "center-red"       // Systemcore
  "useGrid": boolean // האם לרנדר קווי רשת אם מגרש זה הוא FTC (ברירת מחדל "true")
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // רצף סיבובים לאורך צירי x, y ו-z
  "widthInches": number // רוחב אמיתי של המגרש (הצד הארוך)
  "heightInches": number // גובה אמיתי של המגרש (הצד הקצר)
  "defaultOrigin": "auto" | "blue" | "red" // מיקום מקור כברירת מחדל, "auto" אם לא צוין
  "driverStations": [
    [number, number] // מיקומי עמדת נהגים (X ו-Y במטרים יחסית למרכז המגרש)
    ...              // עבור FRC, 6 אלמנטים בסדר [B1, B2, B3, R1, R2, R3]. עבור FTC, 4 אלמנטים בסדר [BL, BR, RL, RR].
  ]
  "gamePieces": [ // רשימת סוגי אלמנטי משחק
    {
      "name": string // שם אלמנט המשחק
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // רצף סיבובים לאורך צירי x, y ו-z
      "position": [number, number, number] // היסט מיקום במטרים, מופעל לאחר סיבוב
      "stagedObjects": string[] // שמות אובייקטי אלמנט משחק ערוכים, להסתרה אם מסופקות תנוחות משתמש
    },
    ...
  ],
  "aprilTags": [ // רשימת מודלי AprilTag משלימים (אם אינם חלק ממודל המגרש)
    "variant": string // פורמט ב-"FAMILY-SIZEin" כאשר "FAMILY" הוא "36h11" או "16h5" ו-"SIZE" הוא אורך החלק השחור
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // רצף סיבובים לאורך צירי x, y ו-z
    "position": [number, number, number] // היסט מיקום במטרים, מופעל לאחר סיבוב
  ]
}
```
