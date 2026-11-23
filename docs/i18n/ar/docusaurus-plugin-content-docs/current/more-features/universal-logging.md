---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🪐 التسجيل الشامل باستخدام WPILOG

WPILOG هو تنسيق التسجيل المفتوح القياسي المستخدم عبر منظومة WPILib بأكملها. مع AdvantageScope، يمكن أن يعمل WPILOG كحاوية شاملة لملفات وتنسيقات سجلات متعددة. يعني هذا أن ملف `.wpilog` واحدًا يمكنه احتواء تدفقات بيانات متعددة مرمّزة بأي تنسيق يدعمه AdvantageScope، بما في ذلك CSV أو السجلات الخاصة بالشركات المصنعة أو ملفات WPILOG إضافية.

صُممت هذه الميزة لتبسيط التشخيص من خلال جمع **جميع بيانات تشخيص الروبوت في ملف سجل شامل واحد**؛ فلا حاجة لتنزيل ملفات سجل متعددة من مباراة واحدة أو ربطها أو مزامنتها، حتى عند جمع البيانات من مكتبات جهات خارجية أو خدمات خارجية. على سبيل المثال، يمكن أن يحتوي ملف WPILOG واحد على:

- بيانات القياس عن بُعد (Telemetry) القياسية للروبوت المنشورة عبر واجهة `Telemetry` في WPILib أو NetworkTables.
- إشارات الأجهزة عالية التردد المسجلة بواسطة مكتبات الشركات المصنعة.
- بيانات الحالة من المعالجات المساعدة (coprocessors) والخدمات الخارجية المسجلة بصيغة CSV أو WPILOG.
- ...والمزيد!

تظهر جميع هذه البيانات في شجرة موحدة واحدة داخل AdvantageScope، كما هو موضح أدناه مع ملف WPILOG يحتوي على إشارات أجهزة التُقطت بواسطة عدة شركات مصنعة.

:::note
على Systemcore، استُبدلت [URCL](https://github.com/Mechanical-Advantage/URCL) بـ [مسجل الحالة](https://docs.revrobotics.com/revlib/logs) الرسمي من REV. يتيح التسجيل الشامل مع AdvantageScope لمسجل الحالة الرسمي تسجيل البيانات من جميع أجهزة REV في ملف WPILOG واحد (بشكل مشابه لـ URCL).
:::

<img src="/img/more-features/universal-logging-1.webp" alt="ملف WPILOG يعرض عدة سجلات لشركات مصنعة في الشريط الجانبي." />

_تظهر في الصورة أعلاه الواجهة باللغة الإنجليزية._

:::tip
يمكن لمستخدمي AdvantageKit أيضًا الاستفادة من ضغط XZ لتقليل حجم سجلات الجهات الخارجية المخزنة داخل ملف WPILOG بشكل ملحوظ. راجع وثائق AdvantageKit حول مستقبلات بيانات السجل لمزيد من التفاصيل.
:::

## ميزة تجريبية: تسجيل الشركات المصنعة {#experimental-vendor-logging}

تُنشئ العديد من مشاريع الروبوتات ملفات سجل متعددة في وقت واحد: ملف WPILOG قياسي لبيانات WPILib/AdvantageKit إلى جانب ملفات خاصة من مكتبات الشركات المصنعة. يلغي التسجيل الشامل هذا الانقسام من خلال تضمين سجلات الشركات المصنعة مباشرة في ملف `.wpilog` الرئيسي. راجع التعليمات أدناه لـ WPILib وAdvantageKit.

:::note
نظرًا لأن هذا النهج غير مدعوم رسميًا من قِبل الشركات المصنعة، يجب توجيه طلبات الدعم إلى [صفحة المشكلات (issues)](https://github.com/Mechanical-Advantage/AdvantageScope/issues) الخاصة بـ AdvantageScope أو إلى software@team6328.org. راجع [تصدير بيانات الشركات المصنعة](#exporting-vendor-data) للاطلاع على تفاصيل تصدير ملفات السجل الأصلية لأغراض التشخيص.
:::

<Tabs groupId="library">
{/*
<TabItem value="wpilib-java" label="Java" default>

نزّل الفئة [`VendorLogCapture.java`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.java) وضعها في مشروع الروبوت الخاص بك. تلتقط هذه الفئة البيانات تلقائيًا من سجلات الشركات المصنعة إلى `DataLog` النشط ويجب تهيئتها في الدالة البانية `Robot` كما هو موضح أدناه. يجب اختيار مجلد مناسب (نوصي بـ `/home/systemcore/logs/`) لتخزين سجلات الشركات المصنعة مؤقتًا أثناء الالتقاط. راجع قسم [آلية العمل](#how-it-works) لمزيد من التفاصيل.

```java
public Robot() {
  // تشغيل DataLogManager في WPILib كالمعتاد
  DataLogManager.start();

  // تفعيل التقاط سجلات الشركات المصنعة من مجلد مرحلي مؤقت
  // نوصي بتخزين سجلات الشركات المصنعة مؤقتًا على وحدة التخزين الداخلية
  // حتى عند استخدام محرك أقراص USB (لا تبقى سجلات الشركات المصنعة بعد الالتقاط)
  VendorLogCapture.start(DataLogManager.getLog(), "/home/systemcore/logs/");

  // تشغيل مسجل الشركة المصنعة بعد تفعيل التقاط السجلات
  // إذا كان قابلًا للتهيئة، يجب أن يتطابق مجلد الإخراج مع المسار أعلاه
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

نزّل الملفين [`VendorLogCapture.hpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.hpp) و[`VendorLogCapture.cpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.cpp) وضعهما في مشروع الروبوت الخاص بك. تلتقط هذه الفئة البيانات تلقائيًا من سجلات الشركات المصنعة إلى `DataLog` النشط ويجب تهيئتها في الدالة البانية `Robot` كما هو موضح أدناه. يجب اختيار مجلد مناسب (نوصي بـ `/home/systemcore/logs/`) لتخزين سجلات الشركات المصنعة مؤقتًا أثناء الالتقاط. راجع قسم [آلية العمل](#how-it-works) لمزيد من التفاصيل.

```cpp
Robot::Robot() {
  // تشغيل DataLogManager في WPILib كالمعتاد
  wpi::DataLogManager::Start();

  // تفعيل التقاط سجلات الشركات المصنعة من مجلد مرحلي مؤقت
  // نوصي بتخزين سجلات الشركات المصنعة مؤقتًا على وحدة التخزين الداخلية
  // حتى عند استخدام محرك أقراص USB (لا تبقى سجلات الشركات المصنعة بعد الالتقاط)
  VendorLogCapture::Start(wpi::DataLogManager::GetLog(), "/home/systemcore/logs/");

  // تشغيل مسجل الشركة المصنعة بعد تفعيل التقاط السجلات
  // إذا كان قابلًا للتهيئة، يجب أن يتطابق مجلد الإخراج مع المسار أعلاه
  VendorLogger::SetPath("/home/systemcore/logs/");
  VendorLogger::Start();
}
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

نزّل الملف [`vendor_log_capture.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/vendor_log_capture.py) وضعه في مشروع الروبوت الخاص بك. يلتقط هذا المساعد البيانات تلقائيًا من سجلات الشركات المصنعة إلى `DataLog` النشط ويجب تهيئته في `robotInit` كما هو موضح أدناه. يجب اختيار مجلد مناسب (نوصي بـ `/home/systemcore/logs/`) لتخزين سجلات الشركات المصنعة مؤقتًا أثناء الالتقاط. راجع قسم [آلية العمل](#how-it-works) لمزيد من التفاصيل.

```python
class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # تشغيل DataLogManager في WPILib كالمعتاد
        wpilib.DataLogManager.start()

        # تفعيل التقاط سجلات الشركات المصنعة من مجلد مرحلي مؤقت
        # نوصي بتخزين سجلات الشركات المصنعة مؤقتًا على وحدة التخزين الداخلية
        # حتى عند استخدام محرك أقراص USB (لا تبقى سجلات الشركات المصنعة بعد الالتقاط)
        VendorLogCapture.start(wpilib.DataLogManager.get_log(), "/home/systemcore/logs/")

        # تشغيل مسجل الشركة المصنعة بعد تفعيل التقاط السجلات
        # إذا كان قابلًا للتهيئة، يجب أن يتطابق مجلد الإخراج مع المسار أعلاه
        VendorLogger.set_path("/home/systemcore/logs/")
        VendorLogger.start()
```

</TabItem>
*/}
<TabItem value="wpilib" label="WPILib">

:::warning
التقاط سجلات الشركات المصنعة عبر DataLogManager غير متاح بعد، لأنه يعتمد على تغييرات في المشروع الأساسي (upstream) لـ WPILib. سنشارك المزيد من المعلومات قريبًا!
:::

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

:::note
تتطلب هذه الميزة الإصدار AdvantageKit v27.0.0-beta-1، الذي سيتوفر قريبًا. يمكنك التحقق من الحالة الحالية عبر [صفحة الإصدارات](https://github.com/Mechanical-Advantage/AdvantageKit/releases) على GitHub.
:::

التقاط سجلات الشركات المصنعة مدمج في AdvantageKit ويمكن تفعيله كما هو موضح أدناه. يجب اختيار مجلد مناسب (نوصي بـ `/home/systemcore/logs/`) لتخزين سجلات الشركات المصنعة مؤقتًا أثناء الالتقاط. راجع قسم [آلية العمل](#how-it-works) لمزيد من التفاصيل.

```java
public Robot() {
  // تفعيل التقاط سجلات الشركات المصنعة من مجلد مرحلي مؤقت
  // نوصي بتخزين سجلات الشركات المصنعة مؤقتًا على وحدة التخزين الداخلية
  // حتى عند استخدام محرك أقراص USB (لا تبقى سجلات الشركات المصنعة بعد الالتقاط)
  Logger.setVendorLogDirectory("/home/systemcore/logs/");

  // تشغيل AdvantageKit كالمعتاد
  Logger.start();

  // تشغيل مسجل الشركة المصنعة بعد مسجل AdvantageKit
  // إذا كان قابلًا للتهيئة، يجب أن يتطابق مجلد الإخراج مع المسار أعلاه
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

:::info
بغض النظر عن مستقبلات بيانات السجل المحددة، لا يمكن عرض سجلات الشركات المصنعة إلا عن طريق تنزيل ملف WPILOG. البث المباشر غير مدعوم بسبب بنية بيانات السجل الملتقطة.
:::

</TabItem>
</Tabs>

لاحظ أن بعض مسجلات الشركات المصنعة تبدأ في كتابة البيانات _فورًا_ عند إنشاء كائن من فئة الجهاز المقابلة (مثل `SparkMax`). نوصي بالانتظار حتى نهاية الدالة البانية `Robot` لإنشاء كائنات الأجهزة لضمان التقاط السجلات.

### آلية العمل {#how-it-works}

1. **الالتقاط:** يشغّل برنامج الروبوت تسجيل WPILib القياسي جنبًا إلى جنب مع مسجلات الشركات المصنعة. يقرأ مساعد خفيف دوريًا البيانات الجديدة المكتوبة بواسطة مسجلات الشركات المصنعة ويحزم الأجزاء الخام مباشرة في تدفق `DataLog` النشط.
2. **التخزين:** يُحفظ السجل المدمج بالكامل في ملف `.wpilog` واحد (مثل محرك أقراص USB متصل بـ Systemcore). لا تبقى ملفات السجل المؤقتة للشركات المصنعة المنشأة على الروبوت بعد إعادة التشغيل، مما يمنع تراكم الملفات في التخزين.
3. **العرض:** عندما يفتح AdvantageScope ملف `.wpilog`، يكتشف تلقائيًا أي إدخالات سجل مضمنة، ويفك تشفير محتواها، ويدمج جميع الحقول في شجرة الشريط الجانبي إلى جانب القياس عن بُعد القياسي.
4. **الاستخراج:** إذا احتجت إلى فتح سجل شركة مصنعة للدعم أو التشخيص المتقدم، يمكن استخراج ملفات السجل الأصلية بدون فقدان من ملف `.wpilog` كما هو موضح في [تصدير بيانات الشركات المصنعة](#exporting-vendor-data).

تُحفظ بيانات السجل الخارجية بتنسيق WPILOG باستخدام إدخال خام يتبع نص نوعه الاصطلاح `log:<format>`. عند تحليل أحد هذه الحقول، يربط AdvantageScope جميع السجلات الثنائية لذلك الإدخال بترتيب زمني ويفك تشفير الحمولة الناتجة كسجل مستقل بالتنسيق المحدد. ثم تُدمج الإشارات المفككة في شجرة الحقول الرئيسية وتُزامن تلقائيًا مع البيانات الموجودة.

:::tip
لا يقتصر التسجيل الشامل باستخدام WPILOG على سجلات الشركات المصنعة؛ إذ يمكن تضمين أي تنسيق تسجيل متوافق مع AdvantageScope داخل ملف WPILOG باستخدام الاصطلاح نفسه.
:::

### تصدير بيانات الشركات المصنعة {#exporting-vendor-data}

على الرغم من إمكانية تصفح البيانات من سجلات الشركات المصنعة مباشرة في AdvantageScope، فقد يكون من الضروري أحيانًا استخراج السجل الأصلي كما أنتجته المكتبة الأصلية (مثلًا لفحصه في أدوات خاصة بالشركة المصنعة).

لتصدير سجل فرعي فردي مباشرة من AdvantageScope، انقر بزر الماوس الأيمن على إدخال السجل الفرعي في الشريط الجانبي وحدد **تصدير السجل الأصلي...**.

للاستخراج المجمع، يمكنك أيضًا استخدام سكربت Python [`extract_vendor_logs.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/extract_vendor_logs.py)، الذي يبحث في ملف `.wpilog` أو `.wpilogxz` واحد أو أكثر عن جميع سجلات الشركات المصنعة المدمجة ويصدّرها إلى ملفات منفصلة:

```bash
pip3 install robotpy-wpiutil # التبعية المطلوبة
python3 extract_vendor_logs.py path/to/source.wpilog
```
