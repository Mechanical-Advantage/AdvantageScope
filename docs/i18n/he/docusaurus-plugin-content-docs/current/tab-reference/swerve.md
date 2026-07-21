---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 סווארב

כרטיסיית הסווארב מציגה את המצב של ארבעה מודולי סווארב, כולל וקטורי המהירות, מיקומי סרק, סיבוב הרובוט ומהירויות השלדה.

<img src="/img/tab-reference/swerve-1.png" alt="Overview of swerve tab" />

<details>
<summary>בקרות ציר זמן</summary>

ציר הזמן משמש לשליטה בניגון בוויזואליזציה. לחיצה על ציר הזמן בוחרת זמן, ולחיצה ימנית מבטלת את הבחירה. הזמן שנבחר מסונכרן בכל הכרטיסיות, מה שמקל על מציאת מיקום זה במהירות בתצוגות אחרות.

מקטעים צהובים מציינים מתי הרובוט באוטונומי, מקטעים כחולים מציינים מתי הרובוט בטלאופ, ומקטעים אפורים מציינים מתי הרובוט במצב שירות.

כדי להתקרב/להתרחק (Zoom), יש להציב את הסמן מעל ציר הזמן ולגלול למעלה או למטה. ניתן לבחור טווח גם על ידי לחיצה וגרירה תוך החזקת מקש `Shift`. מעבר שמאלה וימינה מתבצע על ידי גלילה אופקית (במכשירים נתמכים), או על ידי לחיצה וגרירה על ציר הזמן. בעת התחברות חיה, גלילה שמאלה מבטלת את הנעילה מהזמן הנוכחי, וגלילה עד הסוף ימינה נועלת שוב לזמן הנוכחי. לחיצה על `Ctrl+\` תקרב את התצוגה לפרק הזמן שבו הרובוט מאופשר.

<img src="/img/tab-reference/timeline.png" alt="Timeline" />

</details>

## הוספת מקורות

כדי להתחיל, יש לגרור שדה לקטע "מקורות". ניתן למחוק מקור באמצעות לחצן ה-X, או להסתירו זמנית על ידי לחיצה על סמל העין או לחיצה כפולה על שם השדה. להסרת כל המקורות, יש ללחוץ על פח האשפה ליד כותרת הציר ולאחר מכן על `ניקוי הכול`. ניתן לסדר מחדש מקורות ברשימה על ידי לחיצה וגרירה.

**להתאמה אישית של כל מקור, יש ללחוץ על הסמל הצבעוני או לחיצה ימנית על שם השדה.** AdvantageScope תומכת בשלושה סוגי מקורות:

- **מהירויות מודול:** סט של ארבעה מצבי מודולי סווארב, המוצגים כווקטורים בדיאגרמה.
- **מהירויות רובוט:** מהירויות קוויות וזוויות המוצגות במרכז הדיאגרמה.
- **סיבוב:** מיקום זוויתי המשמש לסיבוב הדיאגרמה.

## פורמט נתונים

נתונים צריכים להיות מפורסמים כ-struct או protobuf בקידוד בייט, תוך שימוש בסוגים `SwerveModuleVelocity[]`, `ChassisVelocities`, `Rotation2d`, או `Rotation3d`.

ספריות רבות תומכות בפורמט struct, כולל WPILib ו-AdvantageKit. קוד הדוגמה למטה מציג כיצד לתעד מצבי מודולי סווארב ב-Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
}

StructArrayPublisher<SwerveModuleVelocity> publisher = NetworkTableInstance.getDefault()
.getStructArrayTopic("MyStates", SwerveModuleVelocity.struct).publish();

periodic() {
  publisher.set(states);
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
}

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

## תצורה

אפשרויות התצורה הבאות זמינות:

- **מהירות מקסימלית:** המהירות המקסימלית הניתנת להשגה של המודולים, משמשת להתאמת גודל הווקטורים.
- **גודל מסגרת:** המרחקים בין מודולי הסווארב השמאליים-ימניים והקדמיים-אחוריים. משנה את יחס הגובה-רוחב של דיאגרמת הרובוט.
- **כיוון:** מתאים את הכיוון שאליו מופנית דיאגרמת הרובוט. אפשרות זו שימושית לעיתים מזומנות ליישור עם נתוני תנוחה או סרטוני משחק.

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
