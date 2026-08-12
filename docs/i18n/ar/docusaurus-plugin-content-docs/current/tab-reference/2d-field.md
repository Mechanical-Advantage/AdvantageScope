---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 ملعب ثنائي الأبعاد {#2d-field}

تعرض علامة تبويب الملعب ثنائي الأبعاد عرضاً مرئياً ثنائي الأبعاد للروبوت معروضاً فوق خريطة للملعب. كما يمكنها إظهار بيانات إضافية مثل حالة استهداف الرؤية والوضعيات المرجعية.

<img src="/img/tab-reference/2d-field-1.webp" alt="نظرة عامة على علامة تبويب الملعب 2D" />

<details>
<summary>عناصر تحكم المخطط الزمني</summary>

يُستخدم المخطط الزمني للتحكم في التشغيل والعرض المرئي. يؤدي النقر على المخطط الزمني إلى تحديد وقت، ويؤدي النقر بزر الماوس الأيمن إلى إلغاء تحديده. يتم مزامنة الوقت المحدد عبر جميع علامات التبويب، مما يسهل العثور بسرعة على هذا الموقع في العروض الأخرى.

تشير الأقسام الصفراء إلى أن الروبوت في وضع التحكم الذاتي (autonomous)، وتشير الأقسام الزرقاء إلى أن الروبوت في وضع التحكم عن بعد (teleoperated)، وتشير الأقسام الرمادية إلى أن الروبوت في وضع الخدمة/المرافق (utility).

التكبير/التصغير، ضع المؤشر فوق المخطط الزمني وقم بالتمرير للأعلى أو الأسفل. يمكن أيضاً تحديد نطاق بالنقر والسحب أثناء الضغط على مفتاح `Shift`. تحرك يساراً ويميناً بالتمرير أفقيًا (على الأجهزة المدعومة)، أو بالنقر والسحب على المخطط الزمني. عند الاتصال المباشر، يؤدي التمرير إلى اليسار إلى إلغاء القفل من الوقت الحالي، والتمرير حتى أقصى اليمين يقفل على الوقت الحالي مرة أخرى. اضغط على `Ctrl+\` للتكبير إلى الفترة التي يكون فيها الروبوت ممكّناً.

<img src="/img/tab-reference/timeline.webp" alt="الجدول الزمني" />

</details>

## إضافة الكائنات {#adding-objects}

للأدء، اسحب ملعباً إلى قسم "وضعيات (Poses)". احذف كائناً باستخدام زر X، أو أخفه مؤقتاً بالنقر فوق أيقونة العين أو النقر المزدوج على اسم الحقل. لإزالة جميع الكائنات، انقر فوق سلة المهملات بالقرب من عنوان المحور ثم `مسح الكل`. يمكن إعادة ترتيب الكائنات في القائمة بالنقر والسحب.

**لتخصيص كل كائن، انقر فوق الأيقونة الملونة أو انقر بزر الماوس الأيمن على اسم الحقل.** يدعم AdvantageScope عدداً كبيراً من أنواع الكائنات، والتي يمكن تخصيص العديد منها (مثل تغيير الألوان). يجب إضافة بعض الكائنات ككائنات تابعة (children) لكائن موجود.

:::tip
للاطلاع على قائمة كاملة بأنواع الكائنات المدعومة، انقر فوق أيقونة `؟`. تتضمن هذه القائمة أيضاً أنواع البيانات المدعومة وما إذا كان يجب إضافة الكائنات ككائنات تابعة.
:::

<img src="/img/tab-reference/2d-field-2.webp" alt="ملعب 2D مع كائنات" />

## تنسيق البيانات {#data-format}

يجب نشر بيانات الهندسة كـ struct أو protobuf مرمز بالبايت. يتم دعم أنواع هندسية مختلفة ثنائية وثلاثية الأبعاد، بما في ذلك `Pose2d` و `Pose3d` و `Translation2d` و `Translation3d` والمزيد.

تدعم العديد من المكتبات تنسيق struct، بما في ذلك WPILib و AdvantageKit. يظهر كود المثال أدناه كيفية تسجيل بيانات الوضعيات ثنائية الأبعاد في Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

StructPublisher<Pose2d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose2d.struct).publish();
StructArrayPublisher<Pose2d> arrayPublisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyPoseArray", Pose2d.struct).publish();

periodic() {
  publisher.set(poseA);
  arrayPublisher.set(new Pose2d[] {poseA, poseB});
}
```

:::tip
يمكن أيضاً استخدام فئة [`Field2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/field2d-widget.html) من WPILib لتسجيل مجموعات متعددة من بيانات الوضعيات ثنائية الأبعاد معاً.
:::

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose2d[] {poseA, poseB});
```

</TabItem>
<TabItem value="ftcdashboard" label="FTC Dashboard">

```java
// This protocol does not support the modern struct format, but pose
// values can be published using separate fields that include the
// suffixes "x", "y", and "heading" (as shown below):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // Inches
packet.put("Pose y", 2.8); // Inches
packet.put("Pose heading", 3.14); // Radians

// Alternatively, headings can be published in degrees
packet.put("Pose heading (deg)", 180.0); // Degrees

// Add other telemetry values here...

FtcDashboard.getInstance().sendTelemetryPacket(packet)

// Alternately, use MultipleTelemetry and the standard SDK telemetry:
// During OpMode Init:
telemetry = new MultipleTelemetry(telemetry,FtcDashboard.getInstance().getTelemetry());

// During Loop:
telemetry.addData("Pose x", 6.3); // Inches
telemetry.addData("Pose y", 2.8); // Inches
telemetry.addData("Pose heading", 3.14); // Radians

// or...
telemetry.addData("Pose heading (deg)", 180.0); // Degrees

// Add other telemetry values here...
telemetry.update();
```

</TabItem>
</Tabs>

## التكوين {#configuration}

- **الملعب:** صورة الملعب المراد استخدامها. يتم دعم جميع ألعاب FRC و FTC الحديثة. لإضافة صورة ملعب مخصصة، راجع [الأصول المخصصة](/more-features/custom-assets).
- **الاتجاه:** اتجاه صورة الملعب في جزء العرض.
- **الحجم:** طول ضلع الروبوت (30/27/24 بوصة لـ FRC، 18/16/14 بوصة لـ FTC).

:::info
نظام الإحداثيات المستخدم في علامة التبويب هذه قابل للتخصيص. راجع صفحة [نظام الإحداثيات](/more-features/coordinate-systems) للحصول على التفاصيل.
:::
