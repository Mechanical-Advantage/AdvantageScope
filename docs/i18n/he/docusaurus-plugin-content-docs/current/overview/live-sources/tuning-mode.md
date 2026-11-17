---
sidebar_position: 1
---

# מצב כוונון {#tuning-mode}

חלק מהמקורות החיים מאפשרים כוונון (Tuning) בזמן אמת של ערכים מספריים ובוליאניים. אפשר להשתמש בזה, למשל, כדי [לכוונן מקדמי בקר](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) כשמחוברים ל-NetworkTables (בתנאי שקוד הרובוט תומך בקבלת מקדמים דרך NetworkTables).

כברירת מחדל, כל הערכים ב-AdvantageScope הם לקריאה בלבד. כדי להפעיל או לכבות את מצב הכוונון, **לחצו על סמל המחוון** מימין לשורת החיפוש כשאתם מחוברים למקור חי נתמך. כשהסמל סגול, מצב הכוונון פעיל ואפשר לערוך שדות.

- כדי לערוך **שדה מספרי**, הקלידו ערך חדש בתיבת הטקסט שמימין לשדה בסרגל הצד. הערך יפורסם ברגע שתצאו מהתיבה או תלחצו על "Enter". אם תשאירו את התיבה ריקה, המערכת תחזור להשתמש בערך שמפרסם הרובוט.
- כדי לשנות **שדה בוליאני**, לחצו על העיגול האדום או הירוק שמימין לשדה בסרגל הצד.
- כדי להעתיק את כל הערכים המפורסמים ללוח, **לחצו לחיצה ימנית על סמל המחוון** ובחרו **"העתקת ערכים מכווננים"**.

:::warning
אפשרות זו לא מיועדת לשליטה ברובוט על המגרש. רכיבי לוח בקרה כמו בוררים (Choosers), כפתורי הפעלה וכו' אינם נתמכים.
:::

## כוונון עם AdvantageKit {#tuning-with-advantagekit}

שדות ש-AdvantageKit מפרסמת לתת-הטבלה `AdvantageKit` הם לקריאה בלבד ואי אפשר לערוך אותם. עם זאת, אפשר לפרסם מקוד הרובוט שדות שכן ניתנים לכוונון דרך AdvantageScope. **כל שדה שיפורסם לטבלה "/Tuning" ב-NetworkTables יופיע תחת הטבלה "Tuning" כשמתחברים למקור החי "NetworkTables (AdvantageKit)".**

לדוגמה, כך אפשר לפרסם מספר ניתן לכוונון באמצעות המחלקה [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs):

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
תת-הטבלה `NetworkInputs` **אינה ניתנת לעריכה**, כי AdvantageKit משתמשת בה כדי להקליט ערכי רשת לצורך שמירת יומן ושחזור (Replay). כדי לשנות ערכים בזמן אמת, השתמשו בטבלה `Tuning`.
:::
