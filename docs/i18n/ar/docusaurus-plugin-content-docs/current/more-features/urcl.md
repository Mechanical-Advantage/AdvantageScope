---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 مسجل متوافق مع REV غير رسمي {#unofficial-rev-compatible-logger}

:::info
جديد في عام 2026، يتضمن REVLib حل تسجيل رسمي لحفظ البيانات من Spark Max و Spark Flex إلى سجل REV CAN (`.revlog`). راجع التفاصيل [هنا](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger). يمكن فتح هذه الملفات مباشرة في AdvantageScope، ولكن لا يمكن مزامنتها بدقة مع مصادر البيانات الأخرى.

سيكون المسجل المتوافق مع REV _غير الرسمي_ (URCL) لـ AdvantageScope متاحاً أيضاً للفرق في عام 2026 لضمان انتقال سلس وتوفير تكافؤ الميزات مع المواسم السابقة. سيكون لدينا المزيد من التفاصيل لمشاركتها حول خيارات التسجيل في عام 2027 وما بعده في وقت لاحق.
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) هي مكتبة تسجيل متاحة لـ Java و C++ و Python والتي تقوم بتسجيل البيانات تلقائياً من Spark Max و Spark Flex. يتيح ذلك رسم البيانات مباشرة وتسجيل جميع الأجهزة بشكل مشابه لـ [ميزة رسم Tuner X](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) و [مسجل إشارات Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) لـ CTRE.

بعد الإعداد، يتم نشر إطارات CAN الدورية من جميع أجهزة Spark Max و Spark Flex إلى NetworkTables أو DataLog. عند استخدام NetworkTables، يمكن استخدام [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) الخاص بـ WPILib لالتقاط البيانات في ملف سجل. تكون هذه الإطارات قابلة للعرض في AdvantageScope (راجع [إدارة ملفات السجل](/overview/log-files) و [الاتصال بالمصادر المباشرة](/overview/live-sources)).

- **جميع الإشارات** يتم التقاطها تلقائياً، مع **عدم وجود إعداد يدوي للأجهزة الجديدة**.
- **كل إطار يتم التقاطه**، حتى عندما تكون فترة إطار الحالة أسرع من دورة حلقة الروبوت.
- يتم تسجيل الإطارات بـ **طوابع زمنية بناءً على وقت استلام CAN RX**، مما يتيح توصيف تسارع أكثر دقة باستخدام [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) مقارنة بالتسجيل التقليدي في كود المستخدم (راجع "استخدام SysId" أدناه).
- التسجيل **كفء للغاية**؛ العمليات تدار عبر مسارات منفصلة (threaded) وتعمل لأقل من 80 ميكروثانية لكل دورة دورية سعتها 20 مللي ثانية، حتى عند تسجيل عدد كبير من الأجهزة.
- **جميع وظائف REVLib لا تتأثر.**

:::info
نظراً لأن هذه المكتبة ليست أداة رسمية من REV، يجب توجيه استفسارات الدعم إلى [صفحة مشكلات URCL](https://github.com/Mechanical-Advantage/URCL/issues) أو software@team6328.org بدلاً من جهة اتصال دعم REV.
:::

## الإعداد {#setup}

قم بتثبيت vendordep لـ URCL باتباع التعليمات لتثبيت [مكتبات الطرف الثالث](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html) باستخدام مدير التبعيات في VSCode. بدلاً من ذلك، يمكنك استخدام عنوان URL التالي لـ vendor JSON:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

ينشر URCL إلى NetworkTables بشكل افتراضي، حيث يمكن حفظ البيانات في ملف سجل عن طريق تمكين DataLogManager الخاص بـ WPILib. بدلاً من ذلك، يمكن لـ URCL التسجيل مباشرة إلى DataLog. يجب بدء مسجل البيانات في `robotInit`، كما هو موضح أدناه.

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // If publishing to NetworkTables and DataLog
  DataLogManager.start();
  URCL.start();

  // If logging only to DataLog
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // If publishing to NetworkTables and DataLog
  frc::DataLogManager::Start();
  URCL::Start();

  // If logging only to DataLog
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
        # If publishing to NetworkTables and DataLog
        wpilib.DataLogManager.start()
        urcl.start()

        # If logging only to DataLog
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
يتم توفير توافق URCL مع AdvantageKit للراحة فقط؛ البيانات المسجلة في السجل غير متاحة في إعادة التشغيل (replay). **يجب أن تظل محركات تشغيل REV جزءاً من تطبيق IO مع مدخلات محددة لدعم إعادة التشغيل**.
:::

</TabItem>
</Tabs>

لتحديد الأجهزة بسهولة أكبر في السجل، يمكن تعيين معرفات CAN إلى أسماء مستعارة عن طريق تمرير كائن خريطة (map) إلى طريقة `start()` أو `startExternal()`. المفاتيح هي معرفات CAN والقيم هي نصوص للأسماء المستخدمة في السجل. أي أجهزة لم يتم تعيين اسم مستعار لها سيتم تسجيلها باستخدام أسمائها الافتراضية.

:::warning
تقليلاً لاستخدام ناقل CAN، يتم **تعطيل معظم إطارات الحالة لأجهزة Spark بشكل افتراضي** حتى يتم استدعاء طريقة المكتسب (getter) المرتبطة بها. أي بيانات تتضمنها إطارات الحالة المعطلة هذه لن تكون متاحة في سجل URCL.

لمزيد من التفاصيل، تحقق من [وثائق REVLib](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods). نوصي باستخدام [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) عند تكوين Spark لتمكين أي إشارات ترغب في تضمينها في ملف السجل يدوياً.
:::

## استخدام SysId {#sysid-usage}

1. بعد إعداد URCL كما هو موضح أعلاه، قم بتكوين روتين SysId باستخدام `null` للمستهلك سجل الآلية. يظهر مثال أدناه لـ Java. يمكن تنفيذ هذا التكوين داخل فئة النظام الفرعي.

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// Create the SysId routine
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // No log consumer, since data is recorded by URCL
    subsystem
  )
);

// The methods below return Command objects
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
// Create the SysId routine
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(
    null, null, null,
    (state) -> Logger.recordOutput("SysIdTestState", state.toString())
  ),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // No log consumer, since data is recorded by URCL
    subsystem
  )
);

// The methods below return Command objects
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. قم بتشغيل روتين SysId على الروبوت. يمكن تكوين أوامر SysId كروتينات ذاتية (auto) أو توصيلها بمشغل زر.

3. قم بتنزيل ملف السجل وافتحه في AdvantageScope. في شريط القوائم، انتقل إلى `ملف` > `تصدير البيانات...`. اضبط التنسيق على "WPILOG« ومجموعة الحقول على »تضمين المُنشأة". انقر فوق أيقونة الحفظ واختر موقعاً لحفظ السجل.

:::warning
يجب فتح ملف السجل من الروبوت وتصديره بواسطة AdvantageScope _قبل فتحه باستخدام محلل SysId_. هذا مطلوب لتحويل بيانات CAN المسجلة بواسطة URCL إلى تنسيق متوافق مع SysId.
:::

4. افتح محلل SysId بالبحث عن "WPILib: Start Tool" في لوحة أوامر VSCode واختيار "SysId" (أو باستخدام مشغل سطح المكتب على Windows). افتح ملف السجل المُصدر بالنقر فوق "Open data log file..."

5. اختر الحقول التالية أدناه لتشغيل التحليل باستخدام المشفر (encoder) الافتراضي. يمكن أيضاً استخدام بيانات الموضع والسرعة من المشفرات الثانوية (بديلة، خارجية، تناظرية، مطلقة، إلخ).

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
ستستخدم الكاسب المكتسبة (gains) الناتجة عن SysId الوحدات التي تم تكوين Spark Max/Flex للإبلاغ عنها (باستخدام [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) و [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>)). بشكل افتراضي، هذه هي الدورات والدورة في الدقيقة (RPM) بدون تطبيق تروس. إذا كانت الوحدات المستخدمة عند تسجيل البيانات لا تطلب الوحدات المرغوبة، يمكن ضبط القياس في SysId أثناء التحليل.
:::
