# 📂 ملفات السجل {#log-files}

## التنسيقات المدعومة {#supported-formats}

- **WPILOG (.wpilog)** - ينتجه [نظام تسجيل البيانات المدمج](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) في WPILib و AdvantageKit و FIRST Driver Station. ويمكن استخدام [التسجيل الشامل](/more-features/universal-logging) لالتقاط السجلات الخارجية (مثل سجلات الشركات المصنعة) في ملف WPILOG.
- **Hoot (.hoot)** - ينتجه [مسجل الإشارات](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) Phoenix 6 من CTRE.
- **REVLOG (.revlog)** - ينتجه [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) من REV Robotics.
- **Road Runner (.log)** - تنتجه مكتبة [Road Runner](https://github.com/acmerobotics/road-runner) لـ FTC.
- **CSV (.csv)** - قيم مفصولة بفواصل، تطابق التنسيق الذي [يصدّره](/overview/log-files/export) AdvantageScope في وضعَي «CSV (جدول)» أو «CSV (قائمة)». راجع [هنا](#csv-formatting) للاطلاع على التفاصيل.
- **سجلات NI Driver Station (.dslog و .dsevents)** - تنسيق قديم، ينتجه [FRC Driver Station](https://docs.wpilib.org/en/stable/docs/software/driverstation/driver-station.html) من NI (2010–2026). يبحث AdvantageScope تلقائيًا عن ملف السجل المقابل عند فتح أي من نوعَي السجلات.
- **RLOG (.rlog)** - تنسيق قديم، ينتجه AdvantageKit 2022.

:::info
لا يمكن فتح ملفات سجل Hoot إلا بعد الموافقة على [اتفاقية ترخيص المستخدم النهائي](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt) الخاصة بـ CTRE. يعرض AdvantageScope نافذة لتأكيد الموافقة على هذه الشروط عند فتح ملف سجل Hoot للمرة الأولى.
:::

## فتح السجلات {#opening-logs}

في شريط القوائم، انقر على `ملف` > `فتح السجل (سجلات)...`، ثم اختر ملف سجل واحدًا أو أكثر من القرص المحلي. كما يمكنك سحب ملف سجل من متصفح ملفات النظام إلى أيقونة AdvantageScope أو نافذته لفتحه.

:::info
عند فتح عدة ملفات في وقت واحد، تُحاذَى الطوابع الزمنية تلقائيًا، مما يتيح لك مقارنة ملفات السجل من مصادر متعددة بسهولة. راجع صفحة [الطوابع الزمنية](/more-features/timestamps) للاطلاع على تفاصيل خيارات عرض الطوابع الزمنية.
:::

<img src="/img/overview/log-files/open-file-1.webp" alt="فتح سجل محفوظ" />

_تظهر في الصورة أعلاه الواجهة باللغة الإنجليزية._

## إضافة سجلات جديدة {#adding-new-logs}

بعد فتح ملف سجل، يمكنك بسهولة إضافة سجلات أخرى إلى العرض؛ إذ تُعاد محاذاة الطوابع الزمنية تلقائيًا للمزامنة مع البيانات الحالية.

في شريط القوائم، انقر على `ملف` > `إضافة سجل جديد...`، ثم اختر ملف سجل واحدًا أو أكثر لإضافته إلى العرض الحالي. تُسجَّل الحقول من كل سجل ضمن جداول مسماة `Log0` و `Log1` وهكذا.

## تخطيط محطة السائق {#driver-station-layout}

يتضمن AdvantageScope تخطيطًا مدمجًا مصممًا لعرض السجلات والبيانات المباشرة من FIRST Driver Station، مع علامات تبويب مهيأة مسبقًا لمخرجات وحدة التحكم ومقاييس الاتصال وجهد البطارية واستخدام المعالج وإدخالات أذرع التحكم.

عند فتح ملف WPILOG تم إنشاؤه بواسطة FIRST Driver Station على سطح المكتب، يسألك AdvantageScope عما إذا كنت تريد فتح السجل في نافذة منفصلة باستخدام تخطيط محطة السائق. كما يمكن تبديل أي نافذة إلى هذا التخطيط يدويًا بالنقر على `ملف` > `إعادة التعيين إلى تخطيط DS`. في [AdvantageScope Lite](/more-features/advantagescope-lite) الخاص بـ FIRST Driver Station، يُستخدم هذا التخطيط افتراضيًا (ويمكن استعادته بالنقر على `علامات التبويب` > `إعادة التعيين إلى التخطيط الافتراضي`).

## التنزيل من الروبوت {#downloading-from-the-robot}

<details>
<summary>التكوين</summary>

افتح نافذة التفضيلات بالنقر على `التطبيق` > `إظهار التفضيلات...` (Windows/Linux) أو `AdvantageScope` > `الإعدادات...` (macOS). حدّث عنوان الروبوت ومجلد السجلات.

<img src="/img/prefs_ar.webp" alt="مخطط التفضيلات" height="450" />
</details>

انقر على `ملف` > `تنزيل السجلات...` لفتح نافذة التنزيل. تنزيل السجلات مدعوم على Systemcore و roboRIO. بمجرد الاتصال بالروبوت، تُعرض السجلات المتاحة مع أحدثها في الأعلى. حدد ملف سجل واحدًا أو مجلدًا أو أكثر لتنزيله (انقر مع الضغط على Shift لتحديد نطاق، أو اضغط **cmd/ctrl + A** لتحديد الكل). ثم انقر على الرمز ↓ وحدد موقع الحفظ.

:::tip
عند تنزيل ملفات متعددة، يتخطى AdvantageScope أي ملف موجود بالفعل في المجلد الوجهة.
:::

<img src="/img/overview/log-files/open-file-2.webp" alt="تنزيل ملفات السجل" height="350" />

_تظهر في الصورة أعلاه الواجهة باللغة الإنجليزية._

## تنسيق CSV {#csv-formatting}

يجب أن تكون أسماء أعمدة CSV إما «Timestamp, Key, Value» أو «Timestamp, (Key), (Key), etc». وتكون قيم الطوابع الزمنية بالثواني. تعرض القائمة أدناه التنسيق المتوقع لأنواع القيم الشائعة. لاحظ أن تصدير بيانات السجل وإعادة استيرادها كملف CSV عملية _تُفقد جزءًا من البيانات_ (lossy)، نظرًا لأن CSV لا يدعم أنواع الحقول المعقدة.

- **منطقي (Booleans):** `true` أو `false`
- **نصوص (Strings):** `"(value)"`
  - مثال: `"Hello world"`
- **مصفوفات (Arrays):** `[(value); (value); (value)]`
  - مثال: `[1; 2; 3]`
- **بايت (Bytes):** سداسي عشر، مفصول بـ `-`
  - مثال: `4d-41-36-33-32-38`
