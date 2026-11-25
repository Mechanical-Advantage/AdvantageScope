---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 سويرف {#swerve}

تعرض علامة تبويب سويرف حالة أربعة موديولات سويرف، بما في ذلك متجهات السرعة، ومواضع الخمول، ودوران الروبوت، وسرعات الهيكل (chassis).

<img src="/img/tab-reference/swerve-1.webp" alt="نظرة عامة على علامة تبويب سويرف" />

_تظهر في الصورة أعلاه الواجهة باللغة الإنجليزية._

<details>
<summary>عناصر تحكم المخطط الزمني</summary>

يُستخدم المخطط الزمني للتحكم في التشغيل والعرض المرئي. يؤدي النقر على المخطط الزمني إلى تحديد وقت معيّن، والنقر بزر الماوس الأيمن إلى إلغاء تحديده. كما يتزامن الوقت المحدد عبر جميع علامات التبويب، مما يسهّل العثور على هذا الموضع بسرعة في العروض الأخرى.

تشير المقاطع الصفراء إلى أن الروبوت في وضع التحكم الذاتي (autonomous)، والمقاطع الزرقاء إلى أنه في وضع التحكم عن بعد (teleoperated)، والمقاطع الرمادية إلى أنه في وضع الاختبار (utility).

للتكبير أو التصغير، ضع المؤشر فوق المخطط الزمني ومرّر للأعلى أو للأسفل. يمكنك أيضًا تحديد نطاق بالنقر والسحب أثناء الضغط على مفتاح `Shift`. تحرّك يسارًا ويمينًا بالتمرير الأفقي (على الأجهزة المدعومة)، أو بالنقر والسحب على المخطط الزمني. عند الاتصال المباشر، يؤدي التمرير إلى اليسار إلى إلغاء القفل عن الوقت الحالي، بينما يعيد التمرير حتى أقصى اليمين قفله على الوقت الحالي مجددًا. اضغط على `Ctrl+\` للتكبير إلى الفترة التي يكون فيها الروبوت ممكّنًا.

<img src="/img/tab-reference/timeline.webp" alt="المخطط الزمني" />

</details>

## إضافة المصادر {#adding-sources}

للبدء، اسحب حقلًا إلى قسم «المصادر». احذف مصدرًا باستخدام زر X، أو أخفه مؤقتًا بالنقر على أيقونة العين أو النقر المزدوج على اسم الحقل. لإزالة جميع المصادر، انقر على سلة المهملات بجانب عنوان المحور ثم اختر `مسح الكل`. يمكنك إعادة ترتيب المصادر في القائمة بالنقر والسحب.

**لتخصيص كل مصدر، انقر على الأيقونة الملونة أو انقر بزر الماوس الأيمن على اسم الحقل.** يدعم AdvantageScope ثلاثة أنواع من المصادر:

- **سرعات الموديولات:** مجموعة من أربع حالات لموديولات سويرف، تُعرض كمتجهات على الرسم البياني.
- **سرعات الروبوت:** السرعات الخطية والزاوية المعروضة في مركز الرسم البياني.
- **الدوران:** الموضع الزاوي المستخدم لتدوير الرسم البياني.

:::tip
يمكن أيضًا عرض حالات موديولات سويرف في علامتَي التبويب 🗺️ [ملعب ثنائي الأبعاد](/tab-reference/2d-field) و👀 [ملعب ثلاثي الأبعاد](/tab-reference/3d-field).
:::

## تنسيق البيانات {#data-format}

يجب نشر البيانات بصيغة struct أو protobuf مرمّزة بالبايت، باستخدام الأنواع `SwerveModuleVelocity[]` أو `ChassisVelocities` أو `Rotation2d` أو `Rotation3d`.

تدعم مكتبات عديدة تنسيق struct، بما في ذلك WPILib وAdvantageKit. ويوضح المثال البرمجي أدناه كيفية تسجيل حالات موديولات سويرف.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Telemetry.log("MyStates", states);
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
std::array<wpi::math::SwerveModuleVelocity, 4> states{
  wpi::math::SwerveModuleVelocity{},
  wpi::math::SwerveModuleVelocity{},
  wpi::math::SwerveModuleVelocity{},
  wpi::math::SwerveModuleVelocity{}
};

wpi::telemetry::Log("MyStates", states);
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
from wpimath import SwerveModuleVelocity
import telemetry

states = [
    SwerveModuleVelocity(),
    SwerveModuleVelocity(),
    SwerveModuleVelocity(),
    SwerveModuleVelocity(),
]

telemetry.log("MyStates", states, element_type=SwerveModuleVelocity)
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

:::note
في عام 2027، أُعيدت تسمية بنية البيانات هذه من `SwerveModuleState` إلى `SwerveModuleVelocity`.
أما ملفات السجلات المنشأة قبل WPILib 2027 وSystemcore، فلا تزال تدعم أنواع `SwerveModuleState` القديمة للعرض المرئي.
:::

## التكوين {#configuration}

تتوفر خيارات التكوين التالية:

- **السرعة القصوى:** أقصى سرعة يمكن للموديولات بلوغها، وتُستخدم لضبط حجم المتجهات.
- **حجم الإطار:** المسافات بين موديولات سويرف (يسار-يمين وأمام-خلف)، وتغيّر نسبة أبعاد الرسم البياني للروبوت.
- **الاتجاه:** يضبط الاتجاه الذي يشير إليه الرسم البياني للروبوت، وغالبًا ما يفيد في المحاذاة مع بيانات الوضعيات أو فيديوهات المباريات.

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
