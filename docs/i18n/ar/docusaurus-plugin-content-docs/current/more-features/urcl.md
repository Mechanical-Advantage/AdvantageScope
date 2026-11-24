---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 مسجل متوافق مع REV غير رسمي {#unofficial-rev-compatible-logger}

:::info
جديد في عام 2026: يتضمن REVLib حل تسجيل رسمي لحفظ البيانات من Spark Max وSpark Flex إلى سجل REV CAN (`.revlog`). راجع التفاصيل [هنا](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger). يمكنك فتح هذه الملفات مباشرةً في AdvantageScope، لكن لا يمكن مزامنتها بدقة مع مصادر البيانات الأخرى.

وسيظل المسجل المتوافق مع REV _غير الرسمي_ (URCL) الخاص بـ AdvantageScope متاحًا للفرق في عام 2026 لضمان انتقال سلس وتوفير تكافؤ في الميزات مع المواسم السابقة. وسنشارك المزيد من التفاصيل حول خيارات التسجيل لعام 2027 وما بعده في وقت لاحق.
:::

مكتبة URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) هي مكتبة تسجيل متاحة للغات Java وC++ وPython، تسجّل البيانات تلقائيًا من وحدتي Spark Max وSpark Flex، مما يتيح لك رسم البيانات مباشرةً وتسجيل جميع الأجهزة على غرار [ميزة الرسم في Tuner X](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) و[مسجل إشارات Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) من CTRE.

بعد الإعداد، تُنشَر إطارات CAN الدورية من جميع أجهزة Spark Max وSpark Flex إلى NetworkTables أو DataLog. وعند استخدام NetworkTables، يمكنك الاستعانة بـ [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) من WPILib لحفظ البيانات في ملف سجل. ويمكنك عرض هذه الإطارات في AdvantageScope (راجع [إدارة ملفات السجل](/overview/log-files) و[الاتصال بالمصادر المباشرة](/overview/live-sources)).

- **جميع الإشارات** تُلتقَط تلقائيًا، **دون الحاجة إلى إعداد يدوي للأجهزة الجديدة**.
- **يُلتقَط كل إطار**، حتى عندما تكون فترة إطار الحالة أسرع من دورة حلقة الروبوت.
- تُسجَّل الإطارات **بطوابع زمنية تستند إلى وقت استقبال CAN RX**، مما يتيح توصيف التسارع بدقة أكبر باستخدام [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) مقارنةً بالتسجيل التقليدي في كود المستخدم (راجع «استخدام SysId» أدناه).
- التسجيل **عالي الكفاءة**؛ إذ تعمل العمليات في خيوط تنفيذ منفصلة (threaded) وتستغرق أقل من 80 ميكروثانية لكل دورة مدتها 20 مللي ثانية، حتى عند تسجيل عدد كبير من الأجهزة.
- **تبقى جميع وظائف REVLib دون أي تأثر.**

:::info
نظرًا لأن هذه المكتبة ليست أداة رسمية من REV، يُرجى توجيه استفسارات الدعم إلى [صفحة مشكلات URCL](https://github.com/Mechanical-Advantage/URCL/issues) أو إلى البريد الإلكتروني software@team6328.org بدلًا من التواصل مع دعم REV.
:::

## الإعداد {#setup}

ثبّت تبعية المورد (vendordep) الخاصة بـ URCL باتباع تعليمات تثبيت [مكتبات الطرف الثالث](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html) عبر مدير التبعيات في VSCode. وبدلًا من ذلك، يمكنك استخدام عنوان URL التالي لملف vendor JSON:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

ينشر URCL إلى NetworkTables افتراضيًا، حيث يمكنك حفظ البيانات في ملف سجل عبر تفعيل DataLogManager في WPILib. وبدلًا من ذلك، يمكن لـ URCL التسجيل مباشرةً في DataLog. وينبغي بدء المسجل في `robotInit`، كما هو موضح أدناه.

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // عند النشر إلى NetworkTables وDataLog
  DataLogManager.start();
  URCL.start();

  // عند التسجيل إلى DataLog فقط
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // عند النشر إلى NetworkTables وDataLog
  frc::DataLogManager::Start();
  URCL::Start();

  // عند التسجيل إلى DataLog فقط
  URCL::Start(frc::DataLogManager::GetLog());
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import urcl
import wpilib

class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # عند النشر إلى NetworkTables وDataLog
        wpilib.DataLogManager.start()
        urcl.start()

        # عند التسجيل إلى DataLog فقط
        urcl.start(wpilib.DataLogManager.getLog())
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
public Robot() {
  // ...
  Logger.registerURCL(URCL.startExternal());
  Logger.start();
}
```

:::warning
يتوفر توافق URCL مع AdvantageKit للتسهيل فقط؛ فالبيانات المسجلة في السجل غير متاحة في إعادة التشغيل (replay). **يجب أن تظل متحكمات محركات REV جزءًا من تطبيق IO مع مدخلات محددة لدعم إعادة التشغيل.**
:::

</TabItem>
</Tabs>

لتسهيل التعرف على الأجهزة في السجل، يمكنك ربط معرفات CAN بأسماء مستعارة عبر تمرير كائن خريطة (map) إلى الدالة `start()` أو `startExternal()`. تمثل المفاتيح معرفات CAN، بينما تمثل القيم النصوص المستخدمة بوصفها أسماءً في السجل؛ أما الأجهزة التي لم يُعيَّن لها اسم مستعار فستُسجَّل بأسمائها الافتراضية.

:::warning
لتقليل استهلاك ناقل CAN، تكون **معظم إطارات الحالة لأجهزة Spark معطّلة افتراضيًا** حتى يُستدعى تابع الجلب (getter) المرتبط بها. ولن تتوفر أي بيانات مضمنة في إطارات الحالة المعطّلة هذه ضمن سجل URCL.

لمزيد من التفاصيل، راجع [وثائق REVLib](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods). ونوصي باستخدام [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) عند تهيئة Spark لتفعيل أي إشارات ترغب في تضمينها في ملف السجل يدويًا.
:::

## استخدام SysId {#sysid-usage}

1. بعد إعداد URCL كما هو موضح أعلاه، هيّئ روتين SysId بتمرير `null` لمُستقبِل سجل الآلية. يوضح المثال التالي ذلك بلغة Java، ويمكن تنفيذ هذه التهيئة داخل فئة النظام الفرعي.

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// إنشاء روتين SysId
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // لا يوجد مُستقبِل سجل، لأن URCL يتولى تسجيل البيانات
    subsystem
  )
);

// تُعيد التوابع أدناه كائنات Command
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
// إنشاء روتين SysId
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(
    null, null, null,
    (state) -> Logger.recordOutput("SysIdTestState", state.toString())
  ),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // لا يوجد مُستقبِل سجل، لأن URCL يتولى تسجيل البيانات
    subsystem
  )
);

// تُعيد التوابع أدناه كائنات Command
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. شغّل روتين SysId على الروبوت. ويمكنك تهيئة أوامر SysId كروتينات تحكم ذاتي أو ربطها بزر تشغيل.

3. نزّل ملف السجل وافتحه في AdvantageScope. من شريط القوائم، انتقل إلى `ملف` > `تصدير البيانات...`، واضبط التنسيق على «WPILOG» ومجموعة الحقول على «تضمين المُنشأة»، ثم انقر على أيقونة الحفظ واختر موقعًا لحفظ السجل.

:::warning
يجب فتح ملف السجل المأخوذ من الروبوت وتصديره عبر AdvantageScope _قبل فتحه باستخدام محلل SysId_؛ وذلك لتحويل بيانات CAN المسجلة بواسطة URCL إلى تنسيق متوافق مع SysId.
:::

4. افتح محلل SysId بالبحث عن «WPILib: Start Tool» في لوحة أوامر VSCode واختيار «SysId» (أو باستخدام مشغل سطح المكتب على Windows)، ثم افتح ملف السجل المُصدَّر بالنقر على «Open data log file...».

5. اختر الحقول التالية أدناه لتشغيل التحليل باستخدام المشفر (encoder) الافتراضي. كما يمكنك استخدام بيانات الموضع والسرعة من المشفرات الثانوية (البديلة أو الخارجية أو التناظرية أو المطلقة، إلخ).

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
ستستخدم المكاسب (gains) الناتجة عن SysId الوحدات التي هُيِّئ Spark Max/Flex للإبلاغ بها (باستخدام [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) و[`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>)). وبشكل افتراضي، تكون هذه الوحدات هي الدورات (rotations) والدورة في الدقيقة (RPM) دون تطبيق نسب تروس. وإذا كانت الوحدات المستخدمة عند تسجيل البيانات لا تطابق الوحدات المرغوبة، فيمكنك ضبط التحجيم في SysId أثناء التحليل.
:::
