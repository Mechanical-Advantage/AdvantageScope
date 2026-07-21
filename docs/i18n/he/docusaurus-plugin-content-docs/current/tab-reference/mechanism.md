---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ מנגנון

כרטיסיית המנגנון מציגה מנגנון מפרקי שנוצר באמצעות אובייקט [Mechanism2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html) אחד או יותר.

<img src="/img/tab-reference/mechanism-1.png" alt="Overview of mechanism tab" />

<details>
<summary>בקרות ציר זמן</summary>

ציר הזמן משמש לשליטה בניגון בוויזואליזציה. לחיצה על ציר הזמן בוחרת זמן, ולחיצה ימנית מבטלת את הבחירה. הזמן שנבחר מסונכרן בכל הכרטיסיות, מה שמקל על מציאת מיקום זה במהירות בתצוגות אחרות.

מקטעים צהובים מציינים מתי הרובוט באוטונומי, מקטעים כחולים מציינים מתי הרובוט בטלאופ, ומקטעים אפורים מציינים מתי הרובוט במצב שירות.

כדי להתקרב/להתרחק (Zoom), יש להציב את הסמן מעל ציר הזמן ולגלול למעלה או למטה. ניתן לבחור טווח גם על ידי לחיצה וגרירה תוך החזקת מקש `Shift`. מעבר שמאלה וימינה מתבצע על ידי גלילה אופקית (במכשירים נתמכים), או על ידי לחיצה וגרירה על ציר הזמן. בעת התחברות חיה, גלילה שמאלה מבטלת את הנעילה מהזמן הנוכחי, וגלילה עד הסוף ימינה נועלת שוב לזמן הנוכחי. לחיצה על `Ctrl+\` תקרב את התצוגה לפרק הזמן שבו הרובוט מאופשר.

<img src="/img/tab-reference/timeline.png" alt="Timeline" />

</details>

## הוספת מנגנונים

כדי להתחיל, יש לגרור `Mechanism2d` לחלונית הבקרה. ניתן למחוק מנגנון באמצעות לחצן ה-X, או להסתירו זמנית על ידי לחיצה על סמל העין או לחיצה כפולה על שם השדה. להסרת כל המנגנונים, יש ללחוץ על פח האשפה ליד כותרת הציר ולאחר מכן על `ניקוי הכול`. ניתן לסדר מחדש מנגנונים ברשימה על ידי לחיצה וגרירה.

## פרסום נתונים

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

לפרסום נתוני מנגנון תוך שימוש ב-WPILib, יש לשלוח אובייקט `Mechanism2d` ל-NetworkTables (מוצג למטה). אם תיעוד נתונים מופעל, ניתן לצפות במנגנונים גם בהתבסס על קובץ ה-WPILOG שנוצר.

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);
SmartDashboard.putData("MyMechanism", mechanism);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

לפרסום נתוני מנגנון תוך שימוש ב-AdvantageKit, יש לתעד `Mechanism2d` כשדה פלט (מוצג למטה). שימו לב כי קריאה זו מתעדת בלבד את המצב הנוכחי של ה-`Mechanism2d`, כך שיש לקרוא לה בכל מחזור לולאה לאחר עדכון האובייקט.

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);
Logger.recordOutput("MyMechanism", mechanism);
```

</TabItem>
</Tabs>
