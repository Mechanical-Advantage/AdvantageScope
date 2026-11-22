---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# מצב כוונון {#tuning-mode}

חלק מהמקורות החיים מאפשרים כוונון (Tuning) בזמן אמת של ערכים מספריים ובוליאניים. אפשר להשתמש בזה, למשל, כדי [לכוונן מקדמי בקר](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) כשמחוברים ל-NetworkTables (בתנאי שקוד הרובוט תומך בקבלת מקדמים דרך NetworkTables).

כברירת מחדל, כל הערכים ב-AdvantageScope הם לקריאה בלבד. כדי להפעיל או לכבות את מצב הכוונון, **לחצו על סמל המחוון** מימין לשורת החיפוש כשאתם מחוברים למקור חי נתמך. כשהסמל סגול, מצב הכוונון פעיל ואפשר לערוך שדות.

- כדי לערוך **שדה מספרי**, הקלידו ערך חדש בתיבת הטקסט שמימין לשדה בסרגל הצד. הערך יפורסם ברגע שתצאו מהתיבה או תלחצו על "Enter". אם תשאירו את התיבה ריקה, המערכת תחזור להשתמש בערך שמפרסם הרובוט.
- כדי לשנות **שדה בוליאני**, לחצו על העיגול האדום או הירוק שמימין לשדה בסרגל הצד.
- כדי להעתיק את כל הערכים המפורסמים ללוח, **לחצו לחיצה ימנית על סמל המחוון** ובחרו **"העתקת ערכים מכווננים"**.

:::tip
עבור משתמשי iPhone ו-iPad, אפליקציית **AdvantageTune** היא חלופה שפותחה על ידי מפתחי AdvantageScope לכוונון ערכי NetworkTables ממכשירים ניידים.

[<img src="/img/app-store_he.svg" alt="App Store" />](https://apps.apple.com/il/app/advantagetune/id6811453643?l=he)
:::

## ערכים ניתנים לכוונון (Tunables) ב-WPILib {#wpilib-tunables}

ב-WPILib ניתן להגדיר ערכים כמו מספרים וערכים בוליאניים באמצעות ה-API של Tunable, מה שמאפשר להתאים אותם מ-AdvantageScope בזמן אמת. ערכים הניתנים לכוונון נרשמים פעם אחת וניתן לקרוא אותם באופן מחזורי בקוד הרובוט:

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
import org.wpilib.tunable.TunableBoolean;
import org.wpilib.tunable.TunableDouble;
import org.wpilib.tunable.Tunables;

TunableDouble tunableNumber = Tunables.addDouble("MyTunableNumber", 0.0);
TunableBoolean tunableBoolean = Tunables.addBoolean("MyTunableBoolean", false);

// קריאת הערכים באופן מחזורי
double num = tunableNumber.get();
boolean bool = tunableBoolean.get();
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
#include <wpi/tunables/Tunables.hpp>

wpi::tunables::TunableDouble tunableNumber =
    wpi::tunables::Add<double>("MyTunableNumber", 0.0);
wpi::tunables::TunableBool tunableBoolean =
    wpi::tunables::Add<bool>("MyTunableBoolean", false);

// קריאת הערכים באופן מחזורי
double num = tunableNumber.Get();
bool boolVal = tunableBoolean.Get();
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import tunables

tunable_number = tunables.add_double("MyTunableNumber", 0.0)
tunable_boolean = tunables.add_boolean("MyTunableBoolean", False)

# קריאת הערכים באופן מחזורי
num = tunable_number.get()
bool_val = tunable_boolean.get()
```

</TabItem>
</Tabs>

## כוונון עם AdvantageKit {#tuning-with-advantagekit}

שדות ש-AdvantageKit מפרסמת לתת-הטבלה `AdvantageKit` הם לקריאה בלבד ואי אפשר לערוך אותם. עם זאת, אפשר לפרסם מקוד הרובוט שדות שכן ניתנים לכוונון דרך AdvantageScope. **כל שדה שיפורסם לטבלה "/Tuning" ב-NetworkTables יופיע תחת הטבלה "Tuning" כשמתחברים למקור החי "NetworkTables (AdvantageKit)".**

לדוגמה, כך אפשר לפרסם מספר ניתן לכוונון באמצעות המחלקה [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs):

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
תת-הטבלה `NetworkInputs` **אינה ניתנת לעריכה**, כי AdvantageKit משתמשת בה כדי להקליט ערכי רשת לצורך שמירת יומן ושחזור (Replay). כדי לשנות ערכים בזמן אמת, השתמשו בטבלה `Tuning`.
:::
