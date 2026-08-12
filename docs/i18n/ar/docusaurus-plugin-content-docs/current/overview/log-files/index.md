# 📂 ملفات السجل {#log-files}

## التنسيقات المدعومة {#supported-formats}

- **WPILOG (.wpilog)** - يُنتج بواسطة [تسجيل البيانات المدمج](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) لـ WPILib و AdvantageKit. يمكن استخدام [URCL](/more-features/urcl) لالتقاط الإشارات من أجهزة تحكم محركات REV إلى ملف WPILOG.
- **سجلات محطة السائق (.dslog و .dsevents)** - تُنتج بواسطة [FRC Driver Station](https://docs.wpilib.org/en/stable/docs/software/driverstation/driver-station.html). يفيض AdvantageScope بالبحث تلقائياً عن ملف السجل المقابل عند فتح أي من نوعي السجلات.
- **Hoot (.hoot)** - يُنتج بواسطة [مسجل الإشارات](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) Phoenix 6 لـ CTRE.
- **REVLOG (.revlog)** - يُنتج بواسطة [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) لـ REV Robotics.
- **Road Runner (.log)** - يُنتج بواسطة مكتبة [Road Runner](https://github.com/acmerobotics/road-runner) لـ FTC.
- **CSV (.csv)** - قيم مفصولة بفواصل، تطابق التنسيق [المُصدر](/overview/log-files/export) بواسطة AdvantageScope في وضعي "CSV (جدول)« أو »CSV (قائمة)". راجع [هنا](#csv-formatting) للحصول على التفاصيل.
- **RLOG (.rlog)** - قديم، يُنتج بواسطة AdvantageKit 2022.

:::info
لا يمكن فتح ملفات سجل Hoot إلا بعد الموافقة على [اتفاقية ترخيص المستخدم النهائي](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt) لـ CTRE. يعرض AdvantageScope مطالبة لتأكيد الموافقة على هذه الشروط عند فتح ملف سجل Hoot للمرة الأولى.
:::

## فتح السجلات {#opening-logs}

في شريط القوائم، انقر فوق `ملف` > `فتح السجل (سجلات)...`، ثم اختر ملف سجل واحد أو أكثر من القرص المحلي. يؤدي سحب ملف سجل من متصفح ملفات النظام إلى أيقونة أو نافذة AdvantageScope أيضاً إلى فتحه.

:::info
إذا تم فتح ملفات متعددة في وقت واحد، سيتم محاذاة الطوابع الزمنية تلقائياً. يتيح ذلك سهولة مقارنة ملفات السجل من مصادر متعددة.
:::

<img src="/img/overview/log-files/open-file-1.webp" alt="فتح سجل محفوظ" />

## إضافة سجلات جديدة {#adding-new-logs}

بعد فتح ملف سجل، يمكن إضافة سجلات إضافية بسهولة إلى العرض المرئي. سيتم إعادة محاذاة الطوابع الزمنية تلقائياً للمزامنة مع البيانات الحالية.

في شريط القوائم، انقر فوق `ملف` > `إضافة سجل (سجلات) جديد...`، ثم اختر ملف سجل واحد أو أكثر لإضافته إلى العرض المرئي الحالي. سيتم تسجيل الحقول من كل سجل تحت جداول تسمى `Log0` و `Log1` وإلخ.

## التنزيل من الروبوت {#downloading-from-the-robot}

<details>
<summary>التكوين</summary>

افتح نافذة التفضيلات بالنقر فوق `التطبيق` > `إظهار التفضيلات...` (Windows/Linux) أو `AdvantageScope` > `الإعدادات...` (macOS). قم بتحديث عنوان الروبوت ومجلد السجل.

<img src="/img/prefs_ar.webp" alt="مخطط تفضيلي" height="350" />
</details>

انقر فوق `ملف` > `تنزيل السجلات...` لفتح نافذة التنزيل. بمجرد الاتصال بالروبوت، تُعرض السجلات المتاحة مع إظهار الأحدث في الأعلى. حدد ملف سجل واحد أو أكثر لتنزيله (shift-click لتحديد نطاق أو **cmd/ctrl + A** لتحديد الكل). بعد ذلك انقر فوق رمز ↓ واختر موقع الحفظ.

:::info
يستخدم [مسجل الإشارات](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) الخاص بـ CTRE تنسيقاً غير قياسي يجمع السجلات في مجلدات فرعية. حدد مجلداً واحداً أو أكثر في القائمة لتنزيل ملفات السجل كمجموعة.
:::

:::tip
عند تنزيل ملفات متعددة، يتخطى AdvantageScope أي ملفات موجودة بالفعل في المجلد الوجهة.
:::

<img src="/img/overview/log-files/open-file-2.webp" alt="تنزيل ملفات السجل" height="350" />

## تنسيق CSV {#csv-formatting}

يجب أن تكون أسماء أعمدة CSV إما "Timestamp, Key, Value« أو »Timestamp, (Key), (Key), etc". تكون قيم الطوابع الزمنية بالثواني. تعرض القائمة أدناه التنسيق المتوقع لأنواع القيم الشائعة. لاحظ أن تصدير وإعادة استيراد بيانات السجل كملف CSV هو أمر _فقداني_ (lossy)، نظرًا لأن CSV لا يدعم أنواع الحقول المعقدة.

- **منطقي (Booleans):** `true` أو `false`
- **نصوص (Strings):** `"(value)"`
  - مثال: `"Hello world"`
- **مصفوفات (Arrays):** `[(value); (value); (value)]`
  - مثال: `[1; 2; 3]`
- **بايت (Bytes):** سداسي عشر، مفصول بـ `-`
  - مثال: `4d-41-36-33-32-38`
