---
title: ما الجديد في عام 2026؟
sidebar_position: 2
draft: true
---

#

<img src="/img/whats-new/banner-light.webp" className="light-only" />
<img src="/img/whats-new/banner-dark.webp" className="dark-only" />

إصدار 2026 من AdvantageScope متاح الآن! تحقق من [وثائق التثبيت](/overview/installation) و [سجل التغييرات الكامل](https://github.com/Mechanical-Advantage/AdvantageScope/releases) للحصول على التفاصيل. يتضمن هذا الإصدار العديد من الميزات الرئيسية الجديدة والتحسينات العديدة عبر التطبيق. تم تصميم العديد من الميزات في هذا الإصدار لتحسين التجربة على أنظمة التحكم الحالية مع التمهيد للانتقال السلس إلى [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) في المواسم القادمة.

**نحن نقدر ملاحظاتك! نرحب بالملاحظات، وطلبات الميزات، وتقارير الأخطاء على [صفحة المشكلات (issues)](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

## ✴️ تجريبي: دعم FTC {#ftc-support}

تجهيزًا للدعم الكامل مع Systemcore في موسم 2027-2028، يضيف هذا الإصدار العديد من الميزات لتحسين التوافق مع نظام التحكم الحالي لـ FIRST Tech Challenge:

- ملاعب FTC ونماذج الروبوت على 🗺️ [ملعب ثنائي الأبعاد](/tab-reference/2d-field) و 👀 [ملعب ثلاثي الأبعاد](/tab-reference/3d-field)
- خيارات جديدة لـ [نظام الإحداثيات](/more-features/coordinate-systems) للتوافق مع [إحداثيات FTC القياسية](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- دعم لملفات سجل [Road Runner](https://rr.brott.dev/docs/v1-0/installation/)
- دعم لتنسيق البث المباشر لـ [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard)

:::tip
يجب على فرق FTC توخي الحذر عند استخدام البرامج التجريبية خلال الموسم الرسمي. لا يزال دعم FTC لـ AdvantageScope قيد التطوير النشط.
:::

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

تدعم العديد من مكتبات التسجيل/القياس عن بعد لـ FTC من طرف ثالث التنسيقات الأخرى المتوافقة مع AdvantageScope، مثل WPILOG و RLOG. يمكن العثور على وثائق هذه المكتبات في المشاريع الخاصة بها؛ لا يوصي مطورو AdvantageScope بأي حل معين لتسجيل بيانات FTC للاستخدام مع AdvantageScope.

:::info
تم تصميم AdvantageScope لتوفير أفضل تجربة عند استخدامه جنباً إلى جنب مع إطار عمل WPILib وأدوات التسجيل المرتبطة به. قد تواجه مشكلات في التوافق أو إمكانيات محدودة عند استخدام حلول تسجيل غير رسمية.

ستُدعم جميع ميزات AdvantageScope رسمياً في FTC بعد الانتقال إلى Systemcore لموسم 2027-2028.
:::

## 🧮 رسم بياني يدعم الوحدات {#unit-aware-graphing}

تمت إعادة تصميم علامة تبويب 📉 [رسم بياني خطي](/tab-reference/line-graph/) لتكون دعامة بالكامل للوحدات. يتيح ذلك العديد من الإمكانيات الجديدة عند رسم الحقول الرقمية بيانياً:

- تسمية دقيقة لمحاور Y وعروض القيم
- تحويل سريع إلى الوحدات المتوافقة (بدون نوافذ منبثقة)
- تحويل ضمني لأنواع الوحدات المتوافقة داخل محور واحد
- عرض دقيق للوحدات [المتكاملة والمفاضلة](/tab-reference/line-graph/#integration-and-differentiation)

تظهر لقطة الشاشة أدناه جميع هذه الميزات في العمل. لاحظ أن المحور الأيسر يتضمن حقولاً ذات وحدات سرعة زاوية مختلفة، ويتضمن المحور الأيمن قيماً تم تفاضلها وعرضها بوحدة غير أصلية (درجات). أصبح تحديد الوحدات أسهل من أي وقت مضى، مع دمج خيارات الوحدات المتوافقة مباشرة في قائمة التحكم لكل محور.

_يمكن العثور على مزيد من المعلومات حول دعم الوحدات في [الوثائق](/tab-reference/line-graph/units)._

<img src="/img/tab-reference/line-graph/units-1.webp" alt="رسم بياني مدرك للوحدات" />

## 🏁 تنزيل سجلات أسرع {#faster-log-downloads}

أصبح [تنزيل السجلات من roboRIO](/overview/log-files/#downloading-from-the-robot) الآن **أسرع بمقدار 2-4 مرات** مقارنة بالإصدارات السابقة. يتم تحقيق ذلك عن طريق الانتقال إلى بروتوكول جديد (FTP) يتيح لـ roboRIO نقل بيانات السجل مع استهلاك أقل لوحدة المعالجة المركزية.

يوضح الجدول أدناه سرعة النقل المقاسة في إصدراي 2025 و 2026 من AdvantageScope أثناء التوصيل عبر الإيثرنت (أقصى نطاق ترددي 100 ميجابت/ثانية). لاحظ أن أداء إصدار 2025 يتأثر بشدة بحمل وحدة المعالجة المركزية على roboRIO.

|                                                                    | 2025 (SFTP) | 2026 (FTP)  | التسريع                                          |
| ------------------------------------------------------------------ | ----------- | ----------- | ------------------------------------------------ |
| حمل عالي لوحدة المعالجة المركزية<br /><sub>كود روبوت معقد</sub>    | 25 ميجابت/ث | 80 ميجابت/ث | <span style={{fontSize: '24px'}}>**3.2x**</span> |
| متوسط حمل وحدة المعالجة المركزية<br /><sub>كود روبوت عادي</sub>    | 40 ميجابت/ث | 90 ميجابت/ث | <span style={{fontSize: '22px'}}>**2.3x**</span> |
| أدنى حمل لوحدة المعالجة المركزية<br /><sub>لا يوجد كود روبوت</sub> | 90 ميجابت/ث | 95 ميجابت/ث | <span style={{fontSize: '20px'}}>**1.1x**</span> |

## 📁 تنزيل السجلات من المجلدات الفرعية {#download-logs-from-subfolders}

تدعم نافذة التنزيل الآن حفظ السجلات المخزنة في مجلدات فرعية. يمكن تنزيل كل مجلد فرعي من السجلات كمجموعة، مما يوفر نهجاً مبسطاً لتنزيل السجلات المُنشأة بواسطة إصدار 2026 من [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) لـ CTRE (الذي يستخدم المجلدات الفرعية كحل بديل لعدم القدرة على تخزين البيانات في ملف سجل واحد).

<img src="/img/whats-new/subfolders.webp" alt="تنزيل المجلدات الفرعية للسجل" height="450" />

## 🌈 خيارات عرض مرئي جديدة {#new-visualization-options}

يتم دعم العديد من خيارات العرض المرئي الجديدة على 🗺️ [ملعب ثنائي الأبعاد](/tab-reference/2d-field) و 👀 [ملعب ثلاثي الأبعاد](/tab-reference/3d-field):

- تتوفر الآن تشكيلة أوسع من ألوان مصدات الروبوت على الملعب ثنائي الأبعاد، ويمكن تكوين كل كائن بلونه الخاص. يتيح ذلك مرونة أكبر عند دمج الأشباح مع كائنات روبوت متعددة.
- عند [عرض الآليات ثنائية الأبعاد على الملعب ثلاثي الأبعاد](/tab-reference/3d-field/#2d-mechanisms)، يمكن الآن وضع الآليات على المستوى YZ بالإضافة إلى المستوى XZ. يتيح ذلك عرضاً أسهل للآليات المعقدة ذات الحركة في محاور متعددة.
- يدعم الملعب ثلاثي الأبعاد الآن تنعيماً اختيارياً ثلاثي الأبعاد لتحسين جودة الحواف المعروضة.

<img src="/img/whats-new/field-viz.jpg" alt="مرئيات ملعب جديدة" />

## 🪵 دعم سجلات CAN من REV Robotics {#rev-robotics-can-log-support}

يمكنك الآن فتح ملفات `.revlog` المُنتجة بواسطة [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) من REV Robotics مباشرة في AdvantageScope. تسجل هذه الملفات إشارات CAN من أجهزة Spark Max و Spark Flex، مما يوفر بديلاً رسمياً لمكتبة [URCL](/more-features/urcl) لـ AdvantageScope.

سيتظل كل من URCL و `StatusLogger` الرسمي متاحين خلال موسم 2026 لضمان انتقال سلس وتوفير تكافؤ الميزات مع المواسم السابقة. سيكون لدينا المزيد من التفاصيل لمشاركتها حول خيارات التسجيل في عام 2027 وما بعده في وقت لاحق.

<img src="/img/whats-new/revlog.webp" alt="مرئيات REVLOG" />

## 💿 استيراد ملفات CSV {#csv-file-imports}

للحصول على عرض مرئي أكثر مرونة للبيانات المُنتجة خارج أطر عمل تسجيل بيانات الروبوت، يتضمن AdvantageScope الآن دعماً أساسياً لاستيراد ملفات CSV. تحقق من [الوثائق](/overview/log-files/#csv-formatting) للحصول على مزيد من التفاصيل حول التنسيقات المدعومة والقيود الأخرى.

<img src="/img/overview/log-files/export-2.webp" alt="بيانات CSV" />

## 🤩 تحسينات جمالية {#aesthetic-improvements}

تم تحديث واجهة المستخدم لـ AdvantageScope على Windows 11 لدعم شريط جانبي شبه شفاف، والذي كان حصرياً في السابق لإصدارات macOS. تتوفر أيضاً أيقونة تطبيق محدثة لـ macOS Tahoe استناداً إلى خامة Liquid Glass من Apple.

<img src="/img/whats-new/windows-ui.webp" alt="واجهة المستخدم لـ Windows" />

## 📋 قوائم مبسطة {#streamlined-menus}

تم تبسيط وتنظيم شريط القوائم وعناصر التحكم ذات الصلة لجعل عناصر التحكم أكثر سهولة وتوافقاً عبر جميع المنصات. تتضمن الميزات البارزة:

- تبديل أسرع بين المصادر المباشرة (مثل NetworkTables و [تشخيصات Phoenix](/overview/live-sources/phoenix-diagnostics))، دون الحاجة إلى فتح نافذة التفضيلات.
- انقر بزر الماوس الأيمن على الشريط الجانبي لنسخ اسم الحقل سريعاً (أو مفتاح الحقل الكامل).
- إعادة تنظيم نافذة التفضيلات، مما يجعل العثور على الخيارات أسهل وأسرع.

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.webp" />
  <img src="/img/whats-new/menus-2.webp" />
  <img src="/img/prefs_ar.webp" />
</div>

## 🐛 تحسينات الاستقرار {#stability-improvements}

يتضمن هذا الإصدار مجموعة متنوعة من إصلاحات الأخطاء وتحسينات الاستقرار عبر التطبيق. يمكن العثور على القائمة الكاملة في [سجل التغييرات](https://github.com/Mechanical-Advantage/AdvantageScope/releases) للإصدار، ولكن بعض الإصلاحات البارزة مدرجة أدناه:

- تم تحسين أداء AdvantageScope بشكل كبير عند بث البيانات لفترات طويلة، خاصة عند استخدام علامة تبويب الرسم البياني الخطي.
- أصبح AdvantageScope الآن أكثر تسامحاً مع بيانات السجل غير العادية، بما في ذلك ملفات السجل الكبيرة وقيم الحقول الكبيرة.
- تم إصلاح العديد من العيوب البصرية عند تصفح بيانات السجل، خاصة عند استخدام الفلاتر على علامة تبويب الرسم البياني الخطي.
- تم إصلاح ترتيب ملفات سجل AdvantageKit في نافذة التنزيل؛ السجلات التي لا تحتوي على طوابع زمنية أصبحت الآن في أسفل القائمة، على غرار التنسيقات الأخرى.
- في علامة تبويب الملعب ثلاثي الأبعاد، يتم الآن عرض كاميرات الروبوت ذات الدوران غير الصفري في محور التدحرج (roll) بشكل صحيح.
- تم تحسين استقرار AdvantageScope XR، خاصة عند التشغيل على iOS/iPadOS 26. بالنسبة للتثبيات دون اتصال بالإنترنت، تحقق من App Store للحصول على التحديثات المتاحة.
