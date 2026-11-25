---
title: ما الجديد في 2027؟
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-2027-rtl-light.webp" className="light-only" />
<img src="/img/whats-new/banner-2027-rtl-dark.webp" className="dark-only" />

إصدار 2027 من AdvantageScope متاح الآن، مقدمًا دعمًا كاملاً لـ Systemcore إلى جانب أكثر من **100 ميزة وتحديث جديد** عبر التطبيق. راجع [وثائق التثبيت](/overview/installation) و[سجل التغييرات الكامل](https://github.com/Mechanical-Advantage/AdvantageScope/releases) للاطلاع على التفاصيل. تسلط هذه الصفحة الضوء على أبرز الإضافات والتحسينات في هذا الإصدار.

**نقدّر ملاحظاتك! نرحب بالملاحظات وطلبات الميزات وتقارير الأخطاء على [صفحة المشكلات (issues)](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />

## 🍋‍🟩 التوافق مع Systemcore {#systemcore-compatibility}

صُمم AdvantageScope 2027 للعمل بسلاسة مع وحدة التحكم الجديدة للروبوت Systemcore وWPILib 2027:

- أصبح عنوان الروبوت الافتراضي الآن `robot.local`، مما يتيح لك الاتصال المباشر أو تنزيل السجلات دون إعداد رقم الفريق. كما يمكن اختيار عناوين USB وWi-Fi الخاصة بـ Systemcore من شريط القوائم.
- يدعم [تنزيل السجلات](/overview/log-files#downloading-from-the-robot) الآن بروتوكول SFTP لـ Systemcore إلى جانب تنزيل سجلات roboRIO القديمة.
- أُضيف نظام الإحداثيات [المركز/أحمر](/more-features/coordinate-systems#center-red) المستخدم في ملاعب FRC بدءًا من 2027 وملاعب FTC بدءًا من 2027–2028.
- أُضيف دعم واجهات `Telemetry` و`Tunables` في WPILib 2027، وألوان تنبيهات محدّثة، و[تفضيل جديد لعرض الطوابع الزمنية](/more-features/timestamps) للحفاظ على سهولة قراءة طوابع Systemcore الزمنية.
- يتصل الوضع المباشر الجديد [تشخيصات Systemcore](/overview/live-sources) مباشرة بخادم NetworkTables المدمج في Systemcore لمراقبة حالة الروبوت ومداخل/مخارج الأجهزة دون الحاجة إلى كود مستخدم.

## 💡 AdvantageScope Lite {#advantagescope-lite}

ينقل [AdvantageScope Lite](/more-features/advantagescope-lite) أدوات العرض والتحليل في AdvantageScope مباشرة إلى متصفح الويب الخاص بك. وهو متاح من واجهة ويب Systemcore وداخل FIRST Driver Station **دون الحاجة إلى أي تثبيت**.

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/lHsak9Mmx2M" title="عرض توضيحي لـ AdvantageScope Lite" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 🎮 FIRST Driver Station {#first-driver-station}

يتكامل AdvantageScope بشكل وثيق مع [FIRST Driver Station](https://docs.wpilib.org/en/latest/docs/software/firstdriverstation) الجديد لتبسيط تشخيص المباريات:

- يمكن الوصول إلى [AdvantageScope Lite](/more-features/advantagescope-lite) مباشرة من قائمة إعدادات FIRST Driver Station لتحليل ملفات WPILOG التي ينتجها DS.
- استخدم تطبيق سطح المكتب لبث حالة المباراة ومقاييس الاتصال وجهد البطارية ومدخلات أذرع التحكم في الوقت الفعلي من Driver Station محلي دون أي إعداد.
- عند فتح ملف `.wpilog` الخاص بـ Driver Station على سطح المكتب، يقترح AdvantageScope فتح نافذة مخصصة مهيأة مسبقًا بعلامات تبويب لمخرجات وحدة التحكم ومقاييس الاتصال والطاقة واستخدام المعالج وأذرع التحكم ([الوثائق](/overview/log-files#driver-station-layout)). ويُستخدم هذا التخطيط افتراضيًا أيضًا في AdvantageScope Lite لـ Driver Station.
- اعرض سجلات وحدة تحكم Driver Station في علامة تبويب 💬 [وحدة التحكم](/tab-reference/console) مع تمييز تلقائي للتحذيرات والأخطاء ودعم كامل لـ [تسلسلات هروب ANSI](/tab-reference/console#ansi-formatting) (الألوان وأنماط النص).

<img src="/img/tutorials/taking-control-1.webp" alt="فتح AdvantageScope Lite من FIRST Driver Station" />

_تظهر في الصورة أعلاه الواجهة باللغة الإنجليزية._

## 🌐 دعم اللغات {#language-support}

يتوفر AdvantageScope الآن بـ **14 لغة** عبر تطبيق سطح المكتب وموقع الوثائق وتطبيقات الأجهزة المحمولة وAdvantageScope Lite: الإنجليزية (الولايات المتحدة)، الإسبانية (أمريكا اللاتينية)، الفرنسية، الهولندية، البرتغالية (البرازيل)، الرومانية، التركية، الروسية، الكازاخستانية، العبرية، العربية، الهندية، الصينية المبسطة، والصينية التقليدية.

:::info
الترجمات هي عمل قيد التطوير أُنشئ بدعم الذكاء الاصطناعي ومساهمي المجتمع، و**قد تتضمن عبارات غير طبيعية أو غير دقيقة**. شكرًا للفرق التي ساعدت بالفعل في مراجعة هذه الترجمات وتحسينها! راجع صفحة 🌐 [دعم اللغات](/overview/language-support) للاطلاع على تفاصيل عملية الترجمة وكيفية إرسال الملاحظات.
:::

<img src="/img/whats-new/multi-language-1.webp" alt="علامة تبويب الرسم البياني الخطي بالصينية المبسطة" />

## 📖 دروس تعليمية ووثائق جديدة {#new-tutorials-and-documentation}

توسعت الوثائق لتشمل [سلسلة دروس تعليمية](/category/tutorials) جديدة من ثلاثة أجزاء مصممة لمساعدة الفرق على البدء مع WPILib 2027 وAdvantageScope:

1. **👋 [مرحبًا بالقياس عن بُعد!](/tutorials/hello-telemetry):** إعداد `DataLogManager` وواجهة `Telemetry`، والاتصال المباشر، وتحليل البيانات باستخدام الرسوم البيانية الخطية والجداول والإحصائيات.
2. **🤖 [إلى الملعب: عرض الروبوت](/tutorials/to-the-field):** نشر الوضعيات ثنائية وثلاثية الأبعاد والمسارات وكائنات `Mechanism2d` على ملاعب FRC وFTC.
3. **🕹️ [تولي التحكم: DS وأذرع التحكم](/tutorials/taking-control):** بث تشخيصات Driver Station المباشرة، ومزامنة سجلات الروبوت وDS، وعرض مخرجات وحدة التحكم، وعرض مدخلات وحدات التحكم.

كما حُدّثت أمثلة الكود عبر الوثائق لتغطية كاملة لواجهة `Telemetry` في WPILib عبر عدة لغات برمجة.

<img src="/img/tutorials/to-the-field-4.webp" alt="عرض الملعب ثلاثي الأبعاد من درس إلى الملعب" />

_تظهر في الصورة أعلاه الواجهة باللغة الإنجليزية._

## 📱 AdvantageTune {#advantagetune}

AdvantageTune هو تطبيق مستقل جديد لأجهزة iPhone وiPad يوفر تجربة ضبط محمولة خفيفة الوزن مكملة لـ AdvantageScope. يمكنك عرض وتعديل مواضيع [NetworkTables](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html) المباشرة (بما في ذلك الأنواع الأولية والمصفوفات وهياكل WPILib وProtobufs) مباشرة من هاتفك، مما يسهل على الجميع المشاركة في ضبط كود الروبوت.

يسهّل كل من AdvantageTune وAdvantageScope عملية تصدير القيم المضبوطة إلى كود الروبوت عبر أزرار لحفظ جميع القيم المضبوطة في ملف نصي لسهولة المشاركة ([الوثائق](/overview/live-sources/tuning-mode)).

[<img src="/img/app-store_ar.svg" alt="App Store" />](https://apps.apple.com/ly/app/advantagetune/id6811453643?l=ar)

<div className="image-gallery">
  <img src="/img/whats-new/advantagetune-1.webp" alt="عرض التصفح في AdvantageTune" />
  <img src="/img/whats-new/advantagetune-2.webp" alt="تعديل المواضيع في AdvantageTune" />
  <img src="/img/whats-new/advantagetune-3.webp" alt="تعديل الهياكل في AdvantageTune" />
  <img src="/img/whats-new/advantagetune-4.webp" alt="قائمة القيم المضبوطة في AdvantageTune" />
  <img src="/img/whats-new/advantagetune-5.webp" alt="البحث والتصفية في AdvantageTune" />
</div>

_تظهر في الصورة أعلاه الواجهة باللغة الإنجليزية._

## 🪐 التسجيل الشامل باستخدام WPILOG {#wpilog-universal-logging}

مع [التسجيل الشامل](/more-features/universal-logging)، يمكن لملف WPILOG واحد الآن العمل كحاوية شاملة لتدفقات وتنسيقات سجلات متعددة، بما في ذلك سجلات الأجهزة الخاصة بالشركات المصنعة وبيانات CSV وملفات WPILOG الفرعية. يحل التسجيل الشامل محل URCL بنهج مرن ومستقل عن الشركة المصنعة: تُزامن البيانات من كل مصدر تلقائيًا وتُدمج في شجرة موحدة واحدة في الشريط الجانبي. راجع [وثائق التسجيل الشامل](/more-features/universal-logging#experimental-vendor-logging) للاطلاع على تفاصيل التقاط سجلات الشركات المصنعة في AdvantageKit وWPILib (قريبًا).

<img src="/img/more-features/universal-logging-1.webp" alt="ملف WPILOG يعرض عدة سجلات لشركات مصنعة في الشريط الجانبي" />

_تظهر في الصورة أعلاه الواجهة باللغة الإنجليزية._

## 🗺️ تحسينات علامات تبويب الملعب {#field-tab-improvements}

أُضيفت عدة تحسينات لسهولة الاستخدام إلى علامتَي التبويب 🗺️ [ملعب ثنائي الأبعاد](/tab-reference/2d-field) و👀 [ملعب ثلاثي الأبعاد](/tab-reference/3d-field):

- حرّك وقرّب عبر الملعب ثنائي الأبعاد، أو انقر بزر الماوس الأيمن لقفل الكاميرا لتتبع موضع الروبوت ودورانه ([الوثائق](/tab-reference/2d-field#camera-controls)).
- أُضيف خيار لتلاشي الأشباح ثنائية وثلاثية الأبعاد عندما لا تُحدّث الحقول مؤخرًا (مفيد لعرض وضعيات الرؤية).
- أُضيفت خطوط شبكة البلاط على ملاعب FTC ثنائية وثلاثية الأبعاد لتسهيل المرجعية المكانية.
- يتذكر AdvantageScope الآن ما إذا كان ملعب FRC أو FTC قد استُخدم آخر مرة عند فتح علامات تبويب ملعب ثنائية أو ثلاثية الأبعاد جديدة.

<img src="/img/tab-reference/2d-field-1.webp" alt="نظرة عامة على علامة تبويب الملعب ثنائي الأبعاد" />

_تظهر في الصورة أعلاه الواجهة باللغة الإنجليزية._

## 📉 تحسينات الرسم البياني الخطي {#line-graph-improvements}

يتضمن 📉 [الرسم البياني الخطي](/tab-reference/line-graph) والجدول الزمني عدة تحسينات بصرية لتحليل أوضح:

- يؤدي تفعيل «إظهار وضع الروبوت» الآن إلى عرض شريط مرمز بالألوان لفترات التحكم الذاتي والتحكم عن بُعد والاختبار والتعطيل.
- تضبط الرسوم البيانية بنمط النقاط أحجام النقاط تلقائيًا لرؤية أفضل عند أي مستوى تكبير.
- تظهر تلميحات مفيدة على الرسم البياني الخطي والجدول الزمني لإرشاد المستخدمين الجدد حول إيماءات التمرير والتكبير.
- حُسّن عرض وقراءة قيم الطوابع الزمنية الكبيرة على محاور الجدول الزمني والرسم البياني الخطي.

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="تراكب وضع الروبوت المرمز بالألوان على الرسم البياني الخطي" />

_تظهر في الصورة أعلاه الواجهة باللغة الإنجليزية._

## 🤝 تحسينات إمكانية الوصول {#accessibility-enhancements}

يتضمن AdvantageScope 2027 عدة تحديثات لجعل التطبيق أكثر سهولة في الوصول:

- أُضيف التنقل بلوحة المفاتيح بمفتاح Tab لجميع حقول الإدخال وتلميحات وصفية لجميع عناصر التحكم في التطبيق.
- يحترم AdvantageScope الآن إعدادَي نظام التشغيل «تقليل الشفافية» و«تقليل الحركة».
- تميّز المؤشرات المنطقية في الشريط الجانبي الحالات الآن دون الاعتماد على اللون وحده.

## 🥔 أنواع وحدات جديدة {#new-unit-types}

وُسّعت ميزة [الرسم البياني المدرك للوحدات](/tab-reference/line-graph/units) في AdvantageScope بأنواع وحدات وخيارات تحليل إضافية:

- القدرة (واط، حصان، إلخ)
- النسب (بلا أبعاد، نسبة مئوية)
- درجة الحرارة بالكلفن
- طاقة البطاطس
- تهجئة الوحدات بالإنجليزية البريطانية (مثل `metres`)
- لاحقات مكتبة الوحدات في WPILib

## 🧱 تحسينات الاستقرار {#stability-improvements}

يتضمن هذا الإصدار العديد من إصلاحات الأخطاء وتحسينات الأداء والاستقرار عبر التطبيق. يمكن العثور على القائمة الكاملة في [سجل التغييرات](https://github.com/Mechanical-Advantage/AdvantageScope/releases)، مع أبرز النقاط أدناه:

- أصبحت إصدارات Windows الرسمية موقّعة رقميًا الآن، مما يقلل من تكرار تحذيرات SmartScreen أثناء التثبيت.
- حُسّن أداء تحميل السجلات ورسمها بشكل ملحوظ، خاصة عند العمل مع سجلات Hoot (`.hoot`) ومصفوفات الهياكل الكبيرة.
- أُصلح التعامل مع الطوابع الزمنية عند عرض سجلات AdvantageKit إلى جانب مصادر البيانات عالية التردد.
- حُسّنت خوارزمية مزامنة الطوابع الزمنية متعددة السجلات عند محاذاة السجلات من مصادر متعددة.
- حُسّنت موثوقية الاتصال لـ [تشخيصات Phoenix](/overview/live-sources/phoenix-diagnostics).
- أُصلحت مشكلات واجهة المستخدم في شريط القوائم على النوافذ المنبثقة ونافذة التسجيل المنبثقة في [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- نُقّحت نصوص وصياغات واجهة المستخدم في جميع أنحاء التطبيق لتحسين الوضوح.
