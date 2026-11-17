---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 מגרש 2D {#2d-field}

כרטיסיית מגרש 2D מציגה תצוגה דו-ממדית של הרובוט על גבי מפת המגרש. אפשר להציג בה גם נתונים נוספים, כמו מצב זיהוי המצלמה (vision targeting) ותנוחות ייחוס.

<img src="/img/tab-reference/2d-field-1.webp" alt="סקירה כללית של כרטיסיית מגרש 2D" />

_ממשק באנגלית מוצג למעלה._

<details>
<summary>בקרות ציר זמן</summary>

ציר הזמן שולט בניגון ובתצוגת הנתונים. לחיצה עליו בוחרת נקודת זמן, ולחיצה ימנית מבטלת את הבחירה. הזמן שנבחר מסונכרן בין כל הכרטיסיות, כך שקל למצוא את אותה נקודה במהירות גם בשאר התצוגות.

מקטעים צהובים מסמנים שהרובוט במצב Auto, מקטעים כחולים מסמנים מצב Teleop, ומקטעים אפורים מסמנים מצב שירות (Utility).

כדי להתקרב או להתרחק (Zoom), מקמו את הסמן מעל ציר הזמן וגללו למעלה או למטה. אפשר גם לבחור טווח זמן על ידי לחיצה וגרירה תוך כדי החזקת `Shift`. כדי לזוז שמאלה וימינה, גללו אופקית (במכשירים תומכים) או לחצו וגררו על ציר הזמן. בחיבור חי, גלילה שמאלה משחררת את הנעילה מהזמן הנוכחי, וגלילה עד הסוף ימינה נועלת אליו שוב. לחיצה על `Ctrl+\` ממקדת את התצוגה לפרק הזמן שבו הרובוט מאופשר (Enabled).

<img src="/img/tab-reference/timeline.webp" alt="ציר זמן" />

</details>

## בקרות מצלמה {#camera-controls}

גללו למעלה ולמטה מעל המגרש כדי להתקרב ולהתרחק, ולחצו וגררו כדי להזיז את התצוגה. לחיצה ימנית בכל מקום על המגרש תפתח את תפריט המצלמה עם האפשרויות הבאות:

- **לא נעול:** ההזזה והזום ידניים.
- **נעול (רובוט):** המצלמה זזה אוטומטית כדי לעקוב אחרי הרובוט.
- **נעול (רובוט וסיבוב):** המצלמה זזה ומסתובבת אוטומטית כדי לעקוב אחרי הרובוט והזווית שלו.

בשני מצבי הנעילה עדיין אפשר להזיז את המצלמה בחופשיות הרחק מהרובוט. כפתורי הכיוון בחלונית הבקרה מאפשרים לסובב את המצלמה בכל מצב.

## הוספת אובייקטים {#adding-objects}

כדי להתחיל, גררו שדה אל הקטע "תנוחות". אפשר למחוק אובייקט בעזרת כפתור ה-X, או להסתיר אותו זמנית בלחיצה על סמל העין או בלחיצה כפולה על שם השדה. כדי להסיר את כל האובייקטים, לחצו על סמל פח האשפה ליד כותרת הציר ובחרו `ניקוי הכול`. אפשר גם לשנות את סדר האובייקטים ברשימה על ידי לחיצה וגרירה.

**כדי להתאים אישית כל אובייקט, לחצו על הסמל הצבעוני או לחצו לחיצה ימנית על שם השדה.** AdvantageScope תומכת במגוון רחב של סוגי אובייקטים, ואת רובם אפשר להתאים אישית (למשל לשנות צבעים). חלק מהאובייקטים חייבים להתווסף כצאצאים (children) של אובייקט קיים.

:::tip
לרשימה המלאה של סוגי האובייקטים הנתמכים, לחצו על סמל ה-`?`. הרשימה מציגה גם את סוגי הנתונים הנתמכים והאם האובייקט חייב להיות מוצמד לאובייקט קיים.
:::

<img src="/img/tab-reference/2d-field-2.webp" alt="מגרש 2D עם אובייקטים" />

## פורמט נתונים {#data-format}

נתוני גיאומטריה צריכים להתפרסם בפורמט struct או protobuf בקידוד בינארי (byte-encoded). מגוון סוגי גיאומטריה ב-2D וב-3D נתמכים, כולל `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` ועוד.

ספריות רבות תומכות בפורמט struct, כולל WPILib ו-AdvantageKit. דוגמאות הקוד למטה מראות איך לתעד נתוני תנוחה דו-ממדיים ב-Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose2d[] {poseA, poseB});
```

</TabItem>
<TabItem value="ftcdashboard" label="FTC Dashboard">

```java
// פרוטוקול זה אינו תומך בפורמט struct המודרני, אך ניתן
// לפרסם ערכי תנוחה באמצעות שדות נפרדים הכוללים את
// הסיומות "x", "y", ו-"heading" (כפי שמוצג למטה):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // אינצ'ים
packet.put("Pose y", 2.8); // אינצ'ים
packet.put("Pose heading", 3.14); // רדיאנים

// לחלופין, ניתן לפרסם כיוונים במעלות
packet.put("Pose heading (deg)", 180.0); // מעלות

// הוסיפו כאן ערכי טלמטריה נוספים...

FtcDashboard.getInstance().sendTelemetryPacket(packet)

// לחלופין, השתמשו ב-MultipleTelemetry ובטלמטריה הסטנדרטית של ה-SDK:
// במהלך OpMode Init:
telemetry = new MultipleTelemetry(telemetry,FtcDashboard.getInstance().getTelemetry());

// במהלך Loop:
telemetry.addData("Pose x", 6.3); // אינצ'ים
telemetry.addData("Pose y", 2.8); // אינצ'ים
telemetry.addData("Pose heading", 3.14); // רדיאנים

// או...
telemetry.addData("Pose heading (deg)", 180.0); // מעלות

// הוסיפו כאן ערכי טלמטריה נוספים...
telemetry.update();
```

</TabItem>
</Tabs>

## תצורה {#configuration}

- **מגרש:** תמונת המגרש שתוצג. כל משחקי FRC ו-FTC מהשנים האחרונות נתמכים. להוספת תמונת מגרש מותאמת אישית, ראו [נכסים מותאמים אישית](/more-features/custom-assets).
- **כיוון:** כיוון תמונת המגרש בחלונית התצוגה.
- **גודל:** אורך הצלע של הרובוט (30/27/24 אינצ'ים עבור FRC, ו-18/16/14 אינצ'ים עבור FTC).

:::info
אפשר להתאים אישית את מערכת הצירים של הכרטיסייה הזו. לפרטים נוספים ראו את עמוד [מערכות צירים](/more-features/coordinate-systems).
:::
