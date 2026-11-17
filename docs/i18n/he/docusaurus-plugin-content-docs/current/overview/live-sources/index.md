# 🛜 מקורות חיים {#live-sources}

כל הוויזואליזציות ב-AdvantageScope בנויות לקבל נתונים חיים מרובוט או מסימולטור, בנוסף לקריאת קובצי יומן. בחלק זה נסביר איך להתחבר למקורות נתונים בזמן אמת. AdvantageScope תומכת במקורות החיים הבאים:

- **NetworkTables:** פרוטוקול הרשת המרכזי של WPILib. לפרטים נוספים עיינו ב[תיעוד של WPILib](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html).
- **NetworkTables (AdvantageKit):** מצב המיועד לעבודה עם קוד רובוט שמריץ AdvantageKit, אשר מפרסמת לטבלה `AdvantageKit` ב-NetworkTables.
- **דיאגנוסטיקה של Systemcore:** מתחבר לשרת ה-NetworkTables המובנה של מערכת ההפעלה Systemcore, ומספק נתוני אבחון כמו מצב הרובוט וקלט/פלט (IO) של ההתקנים.
- **דיאגנוסטיקה של Phoenix:** משתמש ב-HTTP כדי להתחבר ל[שרת האבחון](https://pro.docs.ctr-electronics.com/en/latest/docs/troubleshooting/running-diagnostics.html) של Phoenix, ומאפשר להזרים נתונים מהתקני CTRE CAN עם [Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/), בדומה לתכונת ה-[plotting](https://pro.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) ב-Phoenix Tuner. למידע נוסף ראו [בדף הזה](/overview/live-sources/phoenix-diagnostics).
- **שרת RLOG:** פרוטוקול שנתמך על ידי AdvantageKit כחלופה ל-NetworkTables. כברירת מחדל, החיבור מתבצע בפורט 5800.
- **FTC Dashboard:** מתחבר לרובוטי FTC שמפרסמים נתונים ל-[FTC Dashboard](https://acmerobotics.github.io/ftc-dashboard).

:::info
כשמריצים את AdvantageScope על אותו מחשב שבו פועלת אפליקציית ה-FIRST Driver Station, אפשר להתחבר אליה ישירות כדי לצפות בנתוני אבחון, בלי צורך בהגדרות מיוחדות (ראו הוראות למטה).
:::

## התחלת החיבור {#starting-the-connection}

כדי להתחיל חיבור חי, בצעו את השלבים הבאים:

- **רובוט:** לחצו על `קובץ` > `התחברות לרובוט` > `ברירת מחדל` (או בחרו מקור חי מסוים)
- **סימולטור:** לחצו על `קובץ` > `התחברות לסימולטור` > `ברירת מחדל` (או בחרו מקור חי מסוים)
- **Driver Station:** לחצו על `קובץ` > `התחברות ל-Driver Station`

בכותרת החלון יופיעו כתובת ה-IP והטקסט "מחפש" עד שהחיבור ייווצר. אם החיבור מתנתק, AdvantageScope מנסה להתחבר מחדש אוטומטית עם אותן הגדרות.

## צפייה בנתונים חיים {#viewing-live-data}

בזמן חיבור למקור חי, AdvantageScope נועלת כברירת מחדל את כל הכרטיסיות לזמן הנוכחי. תצוגות כמו 📉 [גרף קווי](/tab-reference/line-graph) ו-🔢 [טבלה](/tab-reference/table) נגללות אוטומטית, ותצוגות כמו מגרש וג'ויסטיקים מראות את הערכים העדכניים של כל שדה. לחיצה על כפתור החץ האדום בסרגל הניווט מפעילה ומבטלת את הנעילה הזו, וכך אפשר לעבור לצפות ולנגן נתונים שכבר עברו.

<img src="/img/overview/live-sources/open-live-1.webp" alt="לחצן נעילה/שחרור בשידור חי" />

:::tip
גלילה שמאלה בגרף הקווי או בציר הזמן משחררת את הנעילה מהזמן הנוכחי, וגלילה עד הסוף ימינה מחזירה את הנעילה לזמן אמת.
:::

## תצורה {#configuration}

פתחו את חלון ההעדפות דרך `אפליקציה` > `הצגת העדפות...` (Windows/Linux) או `AdvantageScope` > `הגדרות...` (macOS).

<img src="/img/prefs_he.webp" alt="תרשים העדפות" height="450" />

### כתובת הרובוט {#robot-address}

הזינו את כתובת הרובוט כשם מארח (למשל `robot.local`) או ככתובת IP (למשל <span dir="ltr">`10.TE.AM.2`</span>), כפי שמוסבר ב[תיעוד של WPILib](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/ip-configurations.html#te-am-ip-notation). כשמתחברים ל-Systemcore דרך USB או דרך נקודת הגישה המובנית של ה-Wi-Fi, אפשר ללחוץ על `קובץ` > `שימוש בכתובת Systemcore USB` / `שימוש בכתובת Systemcore Wi-Fi` כדי להשתמש זמנית בכתובת ה-IP הסטטית המתאימה.

### מצב חי {#live-mode}

כשמשתמשים ב-NetworkTables כמקור חי, אפשר לבחור בין שני מצבים:

- **רוחב פס נמוך (ברירת מחדל):** AdvantageScope מבקשת מהשרת נתונים רק עבור שדות שנמצאים כרגע בשימוש פעיל. נתונים שפורסמו לפני שבחרתם שדה לא יהיו זמינים. מצב זה **מומלץ מאוד** כשרוחב הפס ברשת מוגבל, או כשהרובוט מפרסם כמות גדולה של שדות.
- **רישום יומן:** AdvantageScope מבקשת נתונים עבור כל השדות, בלי קשר לשאלה אם הם בשימוש כרגע. כך אפשר להשהות את הזרם החי ולחזור אחורה לצפות גם בשדות שלא היו פתוחים בזמן אמת (ראו למעלה). המצב הזה שימושי מאוד בזמן פיתוח, אבל **אסור להשתמש בו כשרוחב הפס מוגבל**.

### מחיקת נתונים חיים {#discard-live-data}

במהלך חיבור חי, הנתונים נשמרים מקומית כדי שאפשר יהיה לנגן אחורה נתונים שכבר עברו (ראו "צפייה בנתונים חיים" למעלה). כדי למנוע צריכת זיכרון גבוהה מדי, נתונים ישנים נמחקים כברירת מחדל אחרי 20 דקות. אפשר לבחור פרק זמן קצר יותר כדי לחסוך בזיכרון, או לבחור "אף פעם" כדי לשמור נתונים חיים בלי הגבלת זמן.
