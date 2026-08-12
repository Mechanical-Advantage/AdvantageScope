---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 سويرف {#swerve}

تعرض علامة تبويب سويرف حالة أربعة موديولات سويرف، بما في ذلك متجهات السرعة، ومواضع الخمول، ودوران الروبوت، وسرعات الهيكل (chassis).

<img src="/img/tab-reference/swerve-1.png" alt="نظرة عامة على علامة تبويب سويرف" />

<details>
<summary>عناصر تحكم المخطط الزمني</summary>

يُستخدم المخطط الزمني للتحكم في التشغيل والعرض المرئي. يؤدي النقر على المخطط الزمني إلى تحديد وقت، ويؤدي النقر بزر الماوس الأيمن إلى إلغاء تحديده. يتم مزامنة الوقت المحدد عبر جميع علامات التبويب، مما يسهل العثور بسرعة على هذا الموقع في العروض الأخرى.

تشير الأقسام الصفراء إلى أن الروبوت في وضع التحكم الذاتي (autonomous)، وتشير الأقسام الزرقاء إلى أن الروبوت في وضع التحكم عن بعد (teleoperated)، وتشير الأقسام الرمادية إلى أن الروبوت في وضع الخدمة/المرافق (utility).

التكبير/التصغير، ضع المؤشر فوق المخطط الزمني وقم بالتمرير للأعلى أو الأسفل. يمكن أيضاً تحديد نطاق بالنقر والسحب أثناء الضغط على مفتاح `Shift`. تحرك يساراً ويميناً بالتمرير أفقيًا (على الأجهزة المدعومة)، أو بالنقر والسحب على المخطط الزمني. عند الاتصال المباشر، يؤدي التمرير إلى اليسار إلى إلغاء القفل من الوقت الحالي، والتمرير حتى أقصى اليمين يقفل على الوقت الحالي مرة أخرى. اضغط على `Ctrl+\` للتكبير إلى الفترة التي يكون فيها الروبوت ممكّناً.

<img src="/img/tab-reference/timeline.png" alt="الجدول الزمني" />

</details>

## إضافة المصادر {#adding-sources}

للأدء، اسحب حقلاً إلى قسم «المصادر». احذف مصدراً باستخدام زر X، أو أخفه مؤقتاً بالنقر فوق أيقونة العين أو النقر المزدوج على اسم الحقل. لإزالة جميع المصادر، انقر فوق سلة المهملات بالقرب من عنوان المحور ثم `مسح الكل`. يمكن إعادة ترتيب المصادر في القائمة بالنقر والسحب.

**لتخصيص كل مصدر، انقر فوق الأيقونة الملونة أو انقر بزر الماوس الأيمن على اسم الحقل.** يدعم AdvantageScope ثلاثة أنواع من المصادر:

- **سرعات الموديولا:** مجموعة من أربع حالات لموديولات سويرف، تعود كمتجهات على الرسم البياني.
- **سرعات الروبوت:** السرعات الخطية والزاوية المعروضة في مركز الرسم البياني.
- **الدوران:** الموضع الزاوي المستخدم لتدوير الرسم البياني.

## تنسيق البيانات {#data-format}

يجب نشر البيانات كـ struct أو protobuf مرمز بالبايت، باستخدام أنواع `SwerveModuleVelocity[]` أو `ChassisVelocities` أو `Rotation2d` أو `Rotation3d`.

تدعم العديد من المكتبات تنسيق struct، بما في ذلك WPILib و AdvantageKit. يظهر كود المثال أدناه كيفية تسجيل حالات موديولات سويرف في Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
}

StructArrayPublisher<SwerveModuleVelocity> publisher = NetworkTableInstance.getDefault()
.getStructArrayTopic("MyStates", SwerveModuleVelocity.struct).publish();

periodic() {
  publisher.set(states);
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
}

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

## التكوين {#configuration}

تتوفر خيارات التكوين التالية:

- **السرعة القصوى:** أقصى سرعة يمكن للموديولات تحقيقها، وتحُستخدم لضبط حجم المتجهات.
- **حجم الإطار:** المسافات بين موديولات سويرف يسار-يمين وأمام-خلف. يغير نسبة الأبعاد للرسم البياني للروبوت.
- **الاتجاه:** يضبط الاتجاه الذي يوجه إليه الرسم البياني للروبوت. غالباً ما يكون هذا الخيار مفيداً للمحاذاة مع بيانات الوضعيات أو فيديوهات المباريات.

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
