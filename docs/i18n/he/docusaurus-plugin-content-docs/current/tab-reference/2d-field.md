---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 מגרש 2D

כרטיסיית מגרש ה-2D מציגה ויזואליזציה דו-ממדית של הרובוט על גבי מפת המגרש. היא יכולה להציג גם נתונים נוספים כמו סטטוס כיוון מצלמה ותנוחות ייחוס.

<img src="/img/tab-reference/2d-field-1.png" alt="Overview of 2D field tab" />

<details>
<summary>בקרות ציר זמן</summary>

ציר הזמן משמש לשליטה בניגון בוויזואליזציה. לחיצה על ציר הזמן בוחרת זמן, ולחיצה ימנית מבטלת את הבחירה. הזמן שנבחר מסונכרן בכל הכרטיסיות, מה שמקל על מציאת מיקום זה במהירות בתצוגות אחרות.

מקטעים צהובים מציינים מתי הרובוט באוטונומי, מקטעים כחולים מציינים מתי הרובוט בטלאופ, ומקטעים אפורים מציינים מתי הרובוט במצב שירות.

כדי להתקרב/להתרחק (Zoom), יש להציב את הסמן מעל ציר הזמן ולגלול למעלה או למטה. ניתן לבחור טווח גם על ידי לחיצה וגרירה תוך החזקת מקש `Shift`. מעבר שמאלה וימינה מתבצע על ידי גלילה אופקית (במכשירים נתמכים), או על ידי לחיצה וגרירה על ציר הזמן. בעת התחברות חיה, גלילה שמאלה מבטלת את הנעילה מהזמן הנוכחי, וגלילה עד הסוף ימינה נועלת שוב לזמן הנוכחי. לחיצה על `Ctrl+\` תקרב את התצוגה לפרק הזמן שבו הרובוט מאופשר.

<img src="/img/tab-reference/timeline.png" alt="Timeline" />

</details>

## הוספת אובייקטים

כדי להתחיל, יש לגרור שדה לקטע "תנוחות". ניתן למחוק אובייקט באמצעות לחצן ה-X, או להסתירו זמנית על ידי לחיצה על סמל העין או לחיצה כפולה על שם השדה. להסרת כל האובייקטים, יש ללחוץ על פח האשפה ליד כותרת הציר ולאחר מכן על `ניקוי הכול`. ניתן לסדר מחדש אובייקטים ברשימה על ידי לחיצה וגרירה.

**להתאמה אישית של כל אובייקט, יש ללחוץ על הסמל הצבעוני או לחיצה ימנית על שם השדה.** AdvantageScope תומכת במספר רב של סוגי אובייקטים, שרבים מהם ניתן להתאים אישית (כגון שינוי צבעים). אובייקטים מסוימים חייבים להתווסף כילדים לאובייקט קיים.

:::tip
לצפייה ברשימה המלאה של סוגי אובייקטים נתמכים, יש ללחוץ על סמל ה-`?`. רשימה זו כוללת גם את סוגי הנתונים הנתמכים והאם האובייקטים חייבים להתווסף כילדים.
:::

<img src="/img/tab-reference/2d-field-2.png" alt="2D field with objects" />

## פורמט נתונים

נתוני גיאומטריה צריכים להיות מפורסמים כ-struct או protobuf בקידוד בייט. סוגי גיאומטריה 2D ו-3D שונים נתמכים, כולל `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d`, ועוד.

ספריות רבות תומכות בפורמט struct, כולל WPILib ו-AdvantageKit. קוד הדוגמה למטה מציג כיצד לתעד נתוני תנוחת 2D ב-Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

StructPublisher<Pose2d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose2d.struct).publish();
StructArrayPublisher<Pose2d> arrayPublisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyPoseArray", Pose2d.struct).publish();

periodic() {
  publisher.set(poseA);
  arrayPublisher.set(new Pose2d[] {poseA, poseB});
}
```

:::tip
המחלקה [`Field2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/field2d-widget.html) של WPILib יכולה לשמש גם לתיעוד של מספר סטים של נתוני תנוחת 2D יחד.
:::

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
// לפרסם ערכי תנוחה תוך שימוש בשדות נפרדים הכוללים את
// הסיומות "x", "y", ו-"heading" (כפי שמוצג למטה):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // אינצ'ים
packet.put("Pose y", 2.8); // אינצ'ים
packet.put("Pose heading", 3.14); // רדיאנים

// לחלופין, ניתן לפרסם כיוונים במעלות
packet.put("Pose heading (deg)", 180.0); // מעלות

// יש להוסיף ערכי טלמטריה נוספים כאן...

FtcDashboard.getInstance().sendTelemetryPacket(packet)

// לחלופין, יש להשתמש ב-MultipleTelemetry ובטלמטריה הסטנדרטית של ה-SDK:
// במהלך OpMode Init:
telemetry = new MultipleTelemetry(telemetry,FtcDashboard.getInstance().getTelemetry());

// במהלך Loop:
telemetry.addData("Pose x", 6.3); // אינצ'ים
telemetry.addData("Pose y", 2.8); // אינצ'ים
telemetry.addData("Pose heading", 3.14); // רדיאנים

// או...
telemetry.addData("Pose heading (deg)", 180.0); // מעלות

// יש להוסיף ערכי טלמטריה נוספים כאן...
telemetry.update();
```

</TabItem>
</Tabs>

## תצורה

- **מגרש:** תמונת המגרש לשימוש. כל משחקי FRC ו-FTC העדכניים נתמכים. להוספת תמונת מגרש מותאמת אישית, ראו [נכסים מותאמים אישית](/more-features/custom-assets).
- **כיוון:** כיוון תמונת המגרש בחלונית התצוגה.
- **גודל:** אורך הצלע של הרובוט (30/27/24 אינצ'ים עבור FRC, 18/16/14 אינצ'ים עבור FTC).

:::info
מערכת הצירים המשמשת בכרטיסייה זו ניתנת להתאמה אישית. ראו דף [מערכת צירים](/more-features/coordinate-systems) לפרטים.
:::
