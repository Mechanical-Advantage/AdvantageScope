# המרת קובצי Onshape ו-STEP ל-glTF

תצוגת ה-3D של AdvantageScope מקבלת מודלים מותאמים אישית עבור מגרשים ורובוטים, אותם ניתן להתקין תוך שימוש בתהליך המתואר [כאן](/more-features/custom-assets). כל המודלים חייבים להשתמש בפורמט הקבצים [glTF](https://www.khronos.org/gltf/), שנבחר בשל יעילותו בעת אחסון וטעינת מודלים. שימו לב כי AdvantageScope משתמשת בגרסה הבינארית (.glb), הכוללת את כל המשאבים בקובץ יחיד, ולא בפורמט ה-JSON הטהור (.gltf).

## המרת Onshape ל-STEP

בעוד Onshape כוללת אפשרות ייצוא ל-glTF, נתון זה מייצר לעיתים מזומנות קבצים גדולים מאוד שקשה לנהלם. במקום זאת, מומלץ לייצא מ-Onshape ל-STEP, ולאחר מכן לעקוב אחר ההוראות בקטע הבא להמרה ל-glTF.

1. לאחר פתיחת קובץ ה-Onshape, יש ללחוץ בלחיצה ימנית על המכלול הראשי (assembly) ולבחור "Export...":

<img src="/img/more-features/custom-assets/gltf-convert-1.png" alt="Selecting the &quot;Export...&quot; option" />

2. בחלון הקופץ של האפשרויות, ודאו כי פורמט הייצוא הוא "STEP" ולחצו על "Export":

<img src="/img/more-features/custom-assets/gltf-convert-2.png" alt="Export options pop-up" />

3. המתינו להמרת הקובץ ולהורדתו. נתון זה עשוי לקחת מספר דקות.

## המרת STEP ל-glTF

1. הורידו את [CAD Assistant](https://www.opencascade.com/products/cad-assistant/). אפליקציה חינמית זו מסוגלת להמיר בין פורמטי 3D רבים, כולל STEP ו-glTF.

2. פתחו את CAD Assistant ובחרו את קובץ ה-STEP להמרה:

<img src="/img/more-features/custom-assets/gltf-convert-3.png" alt="Opening STEP file in CAD Assistant" />

3. המתינו לייבוא קובץ ה-STEP. נתון זה עשוי לקחת מספר דקות.

4. לחצו על סמל ה-"Save":

<img src="/img/more-features/custom-assets/gltf-convert-4.png" alt="Clicking the &quot;Save&quot; icon" />

5. בחרו מיקום שמירה, ולאחר מכן השתמשו בתפריט הנפתח כדי להחליף את פורמט הייצוא ל-"glb":

<img src="/img/more-features/custom-assets/gltf-convert-5.png" alt="Switching the export format" />

6. לחצו על סמל גלגל השיניים, ולאחר מכן הפעילו את "Merge faces within the same part":

<img src="/img/more-features/custom-assets/gltf-convert-6.png" alt="Enabling &quot;Merge faces within the same part&quot;" />

7. לחצו על סמל ה-"Save" והמתינו לסיום הייצוא:

<img src="/img/more-features/custom-assets/gltf-convert-7.png" alt="Clicking the &quot;Save&quot; icon" />
