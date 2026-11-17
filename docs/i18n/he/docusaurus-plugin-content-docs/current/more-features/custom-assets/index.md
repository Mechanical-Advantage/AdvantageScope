# ⚙️ נכסים מותאמים אישית {#custom-assets}

AdvantageScope מגיעה עם מאגר ברירת מחדל של תמונות מגרש שטוחות, מודלי מגרש, מודלי רובוטים ופריסות ג'ויסטיקים. נכסים בסיסיים (כמו מגרשי אימון כלליים) כלולים בהתקנה הראשונית, בעוד שנכסים מפורטים (כמו מגרשים של עונות ספציפיות) יורדים אוטומטית ברקע כשיש חיבור לאינטרנט. כדי לבדוק את מצב ההורדות, לחצו על `אפליקציה`/`AdvantageScope` > `סטטוס הורדת נכסים...`.

אם תרצו להוסיף נכסים משלכם, פתחו את תיקיית נכסי המשתמש דרך `אפליקציה`/`AdvantageScope` > `הצגת תיקיית נכסים`. הפורמטים הנדרשים מפורטים בהמשך. תוכלו להיעזר במאגר ברירת המחדל של [הנכסים המפורטים](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) ושל [הנכסים המובנים](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) כדוגמה.

:::tip
כדי לטעון נכסים מתיקייה אחרת, בחרו `אפליקציה`/`AdvantageScope` > `שימוש בתיקיית נכסים מותאמת אישית`. יש לבחור ב_תיקיית האב_ שבתוכה נמצאים הנכסים השונים בתתי-תיקיות נפרדות. כך תוכלו לשמור נכסים מותאמים אישית תחת בקרת גרסאות (Git) יחד עם קוד הרובוט.
:::

## פורמט כללי {#general-format}

כל נכס נשמר בתיקייה שנקראת לפי התבנית "TYPE_NAME". חלק ה-NAME של שם התיקייה אינו מוצג בתוך AdvantageScope. סוגי הנכסים האפשריים הם:

- "Field2d"
- "Field3d"
- "Robot"
- "Joystick"

:::info
דוגמאות לשמות תיקיות תקינים: "Field2d_2023Field", "Joystick_OperatorButtons" או "Robot_Dozer".
:::

כל תיקייה כזו חייבת להכיל קובץ בשם "config.json" וקובץ נכס אחד או יותר, כפי שמפורט למטה. קובץ ההגדרות תמיד כולל את שם הנכס שיוצג ב-AdvantageScope, ושם זה חייב להיות ייחודי בתוך כל סוג נכס. ניתן להוסיף גם אובייקט "locales" הממפה קודי שפה (למשל "es-419", "fr", "zh-CN") לשמות מתורגמים. אם השפה שנבחרה לא מופיעה או שאובייקט "locales" חסר, יוצג השם שבשדה "name" הראשי.

```json
{
  "name": string, // שם ברירת מחדל ייחודי, חובה לכל סוגי הנכסים
  "locales": { [locale: string]: string } // שמות מתורגמים אופציונליים לפי קודי שפה (למשל "es-419", "fr")
  ... // הגדרות תלויות-סוג, כפי שמפורט בהמשך
}
```

## מודלי רובוט 3D {#3d-robot-models}

### מדריך וידאו {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### סקירה כללית {#overview}

התיקייה חייבת לכלול קובץ מודל בשם "model.glb". יש להמיר קובצי CAD לפורמט glTF (למדריך המלא ראו [כאן](gltf-convert)). קובץ ה-"config.json" צריך להיות בפורמט הבא:

```json
{
  "name": string // שם ייחודי, חובה לכל סוגי הנכסים
  "locales": { [locale: string]: string } // תרגומים אופציונליים לשם הנכס
  "isFTC": boolean // האם המודל מיועד למגרשי FTC במקום FRC (ברירת מחדל "false")
  "disableSimplification": boolean // האם לבטל פישוט גיאומטרי של המודל, אופציונלי
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // רצף סיבובים סביב צירי x, y ו-z
  "position": [number, number, number] // היסט מיקום במטרים, מופעל לאחר הסיבובים
  "cameras": [ // מיקומי מצלמה קבועים, יכול להיות ריק
    {
      "name": string // שם המצלמה
      "locales": { [locale: string]: string } // תרגומים אופציונליים לשם המצלמה
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // רצף סיבובים סביב צירי x, y ו-z
      "position": [number, number, number] // היסט מיקום במטרים ביחס לרובוט, מופעל לאחר הסיבובים
      "resolution": [number, number] // רזולוציה בפיקסלים, לקביעת יחס הגובה-רוחב הקבוע
      "fov": number // שדה ראייה אופקי במעלות
    }
  ],
  "components": [...] // ראו "רכיבים מפרקיים"
}
```

הדרך הפשוטה ביותר למצוא את ערכי המיקום והסיבוב הנכונים היא בניסוי וטעייה. מומלץ לכוון קודם את הסיבוב ורק אחר כך את המיקום, מכיוון שהטרנספורמציות מופעלות בסדר הזה.

:::info
כדי לשפר את הביצועים, AdvantageScope מפשטת אוטומטית את הגיאומטריה של המודלים, בהתאם ל[מצב הרינדור](/tab-reference/3d-field#rendering-modes) שנבחר. אם הפישוט גורם לבעיות במודל מותאם אישית, יש שתי דרכים לעקוף זאת:

- כדי למנוע הסרה אוטומטית של חלק (mesh) מסוים, הוסיפו את המחרוזת `NOSIMPLIFY` לשם שלו.
- כדי לבטל את הפישוט עבור מודל הרובוט כולו, הגדירו `disableSimplification` ל-`true` בקובץ התצורה.

:::

### רכיבים מפרקיים {#articulated-components}

:::warning
הגדרת רכיבים מפרקיים יכולה להיות מורכבת ולגזול זמן רב. שקלו להשתמש ב[תמיכה התלת-ממדית ב-`Mechanism2d`](/tab-reference/3d-field#2d-mechanisms) של AdvantageScope, שמציעה דרך פשוטה ומהירה יותר ל**הצגת מנגנונים במגרש ה-3D**.
:::

מודלי רובוטים יכולים לכלול רכיבים מפרקיים להצגת תנועה של מנגנונים (ראו פרטים [כאן](/tab-reference/3d-field)). מודל הבסיס (glTF) צריך להכיל רק את גוף הרובוט ללא הרכיבים הנעים, וכל רכיב מיוצא לקובץ glTF נפרד. שמות קובצי הרכיבים נקבעים לפי התבנית "model_INDEX.glb" — לדוגמה, הרכיב המפרקי הראשון ייקרא "model_0.glb".

הגדרות הרכיבים נכתבות בקובץ התצורה של הרובוט, כמערך תחת המפתח "components". כאשר לא נשלחות תנוחות רכיבים מתוך AdvantageScope, הרכיבים ממוקמים לפי סיבוב ומיקום ברירת המחדל של הרובוט (ראו למעלה). כאשר כן מסופקות תנוחות רכיבים, מופעלים קודם ערכי ה-"zeroed" (איפוס) כדי להביא כל רכיב אל ראשית הצירים של הרובוט, ורק לאחר מכן מופעלת התנוחה שסיפק המשתמש כדי להזיז אותו למקומו האמיתי על הרובוט.

:::tip
כשממקמים רכיבי 3D ביחס לרובוט, ראשית הצירים היא התנוחה המפורסמת של הרובוט. שימו לב שתנוחה זו נמצאת לרוב בגובה אפס — כלומר על מישור הרצפה ולא בתחתית השלדה (bellypan), כמקובל בתנועת רובוט דו-ממדית.
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // רצף סיבובים סביב צירי x, y ו-z
    "zeroedPosition": [number, number, number] // היסט מיקום במטרים ביחס לרובוט, מופעל לאחר הסיבובים
  }
]
```

#### תהליך ההגדרה {#setup-process}

כדי לכייל את המיקומים של הרכיבים המפרקיים, מומלץ לעבוד לפי השלבים הבאים:

1. ייצאו את מודל הבסיס ואת הרכיבים במצב "ברירת המחדל" שלהם — כלומר, במיקום שבו הם אמורים להופיע כשאין תנוחות רכיבים.

2. פרסמו מקוד הרובוט תנוחת 2D מאופסת ובחרו בה כתנוחת הרובוט ב-AdvantageScope. עברו למגרש ה-3D "Axes" (צירים), שמציג את ראשית הצירים של המגרש.

3. כוונו את הסיבובים הכלליים של הרובוט (לא של הרכיבים) עד שגוף הרובוט פונה לכיוון הנכון, ולאחר מכן כוונו את המיקום הכללי כדי להביא אותו לראשית הצירים. לאורך שלב זה, הרכיבים אמורים להישאר במיקום ברירת המחדל שלהם ביחס לרובוט.

4. פרסמו מקוד הרובוט מערך של תנוחות 3D מאופסות כמספר הרכיבים במודל, ובחרו בו כסט תנוחות הרכיבים ב-AdvantageScope.

5. עבור כל רכיב, כוונו קודם את הסיבובים ואחר כך את המיקום, עד שהרכיב מיושר לראשית הצירים. לדוגמה, זרוע תיושר כך שציר הסיבוב שלה נמצא בראשית הצירים והיא פונה קדימה לאורך ציר ה-X.

6. פרסמו מקוד הרובוט את תנוחות הרכיבים האמיתיות, שיתבססו מעתה על הראשית החדשה שהוגדרה לכל רכיב. לדוגמה, תנוחה שממקמת את הזרוע במפרק שלה ומכוונת אותה בכיוון הזרוע.

## ג'ויסטיקים {#joysticks}

התיקייה חייבת לכלול תמונה בשם "image.png". קובץ התצורה צריך להיות בפורמט הבא:

```json
{
  "name": string // שם ייחודי, חובה לכל סוגי הנכסים
  "locales": { [locale: string]: string } // תרגומים אופציונליים לשם הנכס
  "components": [...] // מערך הגדרות רכיבים, ראו בהמשך
}
```

:::info
לחצנים, ג'ויסטיקים וצירים תומכים הן במיפויי [SDL](https://www.libsdl.org) (שבהם משתמשת ה-FIRST Driver Station הנוכחית) והן במיפויי NI (שבהם השתמשה ה-NI FRC Driver Station הישנה). יש לספק לפחות סט מיפויים אחד לכל רכיב.

עבור מיפויי NI, AdvantageScope שומרת על תאימות לאחור עם מפתחות התצורה הישנים ללא קידומת (כמו `sourceIndex`). **בכל ג'ויסטיק חדש יש להשתמש במיפויי SDL מפורשים (כמו `sdlSourceIndex`) כדי להבטיח תאימות ל-FIRST Driver Station הנוכחית.**
:::

### לחצן יחיד / ערך POV {#single-button-pov-value}

```json
{
  "type": "button"
  "isYellow": boolean
  "isEllipse": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number
  "sdlSourcePov": string // אופציונלי: "up", "right", "down" או "left". אם מוגדר, "sdlSourceIndex" הוא אינדקס ה-POV לקריאה.

  // מיפויים חלופיים עבור NI Driver Station (אופציונלי)
  "niSourceIndex": number
  "niSourcePov": string
}
```

### ג'ויסטיק דו-צירי {#two-axis-joystick}

```json
{
  "type": "joystick" // ג'ויסטיק שנע בשני ממדים
  "isYellow": boolean
  "centerPx": [number, number]
  "radiusPx": number
  "sdlXSourceIndex": number
  "sdlXSourceInverted": boolean // לא הפוך: ימינה = חיובי
  "sdlYSourceIndex": number
  "sdlYSourceInverted": boolean // לא הפוך: למעלה = חיובי
  "sdlButtonSourceIndex": number // אופציונלי

  // מיפויים חלופיים עבור NI Driver Station (אופציונלי)
  "niXSourceIndex": number
  "niXSourceInverted": boolean
  "niYSourceIndex": number
  "niYSourceInverted": boolean
  "niButtonSourceIndex": number
}
```

### ציר יחיד {#single-axis}

```json
{
  "type": "axis" // ערך של ציר בודד
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
  "sdlSourceRange": [number, number] // מינימום גדול ממקסימום כדי להפוך כיוון

  // מיפויים חלופיים עבור NI Driver Station (אופציונלי)
  "niSourceIndex": number,
  "niSourceRange": [number, number]
}
```

### משטח מגע (Touchpad) {#touchpad}

```json
{
  "type": "touchpad" // משטח מגע
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
}
```

## תמונות מגרש שטוחות {#flat-field-images}

התיקייה חייבת לכלול תמונה בשם "image.png", כשהברית האדומה נמצאת בצד שמאל. קובץ התצורה צריך להיות בפורמט הבא:

```json
{
  "name": string // שם ייחודי, חובה לכל סוגי הנכסים
  "locales": { [locale: string]: string } // תרגומים אופציונליים לשם הנכס
  "isFTC": boolean // האם זהו מגרש FTC במקום מגרש FRC
  "coordinateSystem": // מערכת הצירים כברירת מחדל (ראו בהמשך)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC מסורתי
      "center-red"       // Systemcore
  "useGrid": boolean // האם להציג קווי רשת במגרש FTC (ברירת מחדל "true")
  "sourceUrl": string // קישור לקובץ המקורי, אופציונלי
  "topLeft": [number, number] // קואורדינטה בפיקסלים (הראשית בפינה השמאלית העליונה)
  "bottomRight": [number, number] // קואורדינטה בפיקסלים (הראשית בפינה השמאלית העליונה)
  "widthInches": number // הרוחב האמיתי של המגרש באינצ'ים (הצד הארוך)
  "heightInches": number // הגובה האמיתי של המגרש באינצ'ים (הצד הקצר)
}
```

## מודלי מגרש 3D {#3d-field-models}

התיקייה חייבת לכלול קובץ מודל בשם "model.glb". לאחר הפעלת כל הסיבובים, המגרש צריך להיות מכוון כך שהברית האדומה בצד שמאל. יש להמיר קובצי CAD ל-glTF (לפרטים ראו [כאן](gltf-convert)). מודלי אביזרי המשחק נקראים לפי התבנית "model_INDEX.glb", בהתאם לסדר הופעתם במערך "gamePieces". תגי AprilTag שמוגדרים כאן ממוקמים תמיד לפי מערכת הצירים [מרכז/אדום](/more-features/coordinate-systems#center-red), ללא קשר להגדרות אחרות.

קובץ התצורה צריך להיות בפורמט הבא:

```json
{
  "name": string // שם ייחודי, חובה לכל סוגי הנכסים
  "locales": { [locale: string]: string } // תרגומים אופציונליים לשם הנכס
  "isFTC": boolean // האם זהו מגרש FTC במקום מגרש FRC
  "coordinateSystem": // מערכת הצירים כברירת מחדל (ראו בהמשך)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC מסורתי
      "center-red"       // Systemcore
  "useGrid": boolean // האם להציג קווי רשת במגרש FTC (ברירת מחדל "true")
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // רצף סיבובים סביב צירי x, y ו-z
  "widthInches": number // הרוחב האמיתי של המגרש באינצ'ים (הצד הארוך)
  "heightInches": number // הגובה האמיתי של המגרש באינצ'ים (הצד הקצר)
  "defaultOrigin": "auto" | "blue" | "red" // מיקום ראשית הצירים כברירת מחדל, "auto" אם לא צוין
  "driverStations": [
    [number, number] // מיקומי עמדות נהגים (X ו-Y במטרים ביחס למרכז המגרש)
    ...              // עבור FRC: 6 איברים בסדר [B1, B2, B3, R1, R2, R3]. עבור FTC: 4 איברים בסדר [BL, BR, RL, RR].
  ]
  "gamePieces": [ // רשימת סוגי אביזרי משחק
    {
      "name": string // שם אביזר המשחק
      "locales": { [locale: string]: string } // תרגומים אופציונליים לשם אביזר המשחק
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // רצף סיבובים סביב צירי x, y ו-z
      "position": [number, number, number] // היסט מיקום במטרים, מופעל לאחר הסיבובים
      "stagedObjects": string[] // שמות אובייקטים של אביזרי משחק במגרש להסתרה אם סופקו תנוחות משתמש
    },
    ...
  ],
  "aprilTags": [ // רשימת מודלי AprilTag משלימים (אם אינם חלק ממודל המגרש)
    "variant": string // בפורמט "FAMILY-SIZEin" כאשר "FAMILY" הוא "36h11" או "16h5" ו-"SIZE" הוא אורך החלק השחור
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // רצף סיבובים סביב צירי x, y ו-z
    "position": [number, number, number] // היסט מיקום במטרים, מופעל לאחר הסיבובים
  ]
}
```
