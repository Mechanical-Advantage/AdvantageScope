# המרת קובצי Onshape ו-STEP ל-glTF {#converting-onshape-and-step-files-to-gltf}

תצוגת ה-3D ב-AdvantageScope תומכת במודלים מותאמים אישית למגרשים ולרובוטים, שאותם ניתן להתקין לפי ההוראות [כאן](/more-features/custom-assets). כל המודלים חייבים להיות בפורמט [glTF](https://www.khronos.org/gltf/), שנבחר בזכות היעילות שלו באחסון ובטעינה. שימו לב ש-AdvantageScope משתמשת בגרסה הבינארית של הפורמט (`.glb`), האורזת את כל המשאבים בקובץ אחד, ולא בקובץ ה-JSON הנפרד (`.gltf`).

## המרת Onshape ל-STEP {#converting-onshape-to-step}

למרות ש-Onshape מאפשרת לייצא ישירות ל-glTF, פעולה זו יוצרת לרוב קבצים כבדים מאוד שקשה לעבוד איתם. לכן, מומלץ לייצא מ-Onshape לקובץ STEP, ובהמשך להמיר אותו ל-glTF לפי השלבים הבאים:

1. פתחו את הקובץ ב-Onshape, לחצו לחיצה ימנית על המכלול הראשי (assembly) ובחרו "Export...":

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="בחירת האפשרות &quot;Export...&quot;" />

2. בחלון האפשרויות שנפתח, ודאו שפורמט הייצוא מוגדר כ-"STEP" ולחצו על "Export":

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="חלון אפשרויות הייצוא" />

3. המתינו שהקובץ יומר ויירד למחשב. התהליך עשוי להימשך כמה דקות.

## המרת STEP ל-glTF {#converting-step-to-gltf}

1. הורידו את [CAD Assistant](https://www.opencascade.com/products/cad-assistant/), תוכנה חינמית שממירה בין מגוון רחב של פורמטים תלת-ממדיים, כולל STEP ו-glTF.

2. פתחו את CAD Assistant ובחרו את קובץ ה-STEP שברצונכם להמיר:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="פתיחת קובץ STEP ב-CAD Assistant" />

3. המתינו לטעינת קובץ ה-STEP. גם שלב זה עשוי להימשך כמה דקות.

4. לחצו על סמל ה-"Save":

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="לחיצה על סמל &quot;Save&quot;" />

5. בחרו היכן לשמור את הקובץ, ולאחר מכן שנו בתפריט הנפתח את פורמט הייצוא ל-"glb":

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="שינוי פורמט הייצוא" />

6. לחצו על סמל גלגל השיניים וסמנו את האפשרות "Merge faces within the same part":

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="סימון האפשרות &quot;Merge faces within the same part&quot;" />

7. לחצו שוב על סמל ה-"Save" והמתינו לסיום הייצוא:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="לחיצה על סמל &quot;Save&quot;" />
