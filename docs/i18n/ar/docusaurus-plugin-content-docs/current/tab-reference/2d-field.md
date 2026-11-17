---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 ملعب ثنائي الأبعاد {#2d-field}

تعرض علامة تبويب الملعب ثنائي الأبعاد عرضاً مرئياً ثنائي الأبعاد للروبوت فوق خريطة للملعب، كما تتيح لك إظهار بيانات إضافية مثل حالة استهداف الرؤية والوضعيات المرجعية.

<img src="/img/tab-reference/2d-field-1.webp" alt="نظرة عامة على علامة تبويب الملعب ثنائي الأبعاد" />

_تظهر في الصورة أعلاه الواجهة باللغة الإنجليزية._

<details>
<summary>عناصر تحكم المخطط الزمني</summary>

يتيح لك المخطط الزمني التحكم في التشغيل والعرض المرئي؛ إذ يؤدي النقر عليه إلى تحديد وقت معيّن، بينما يؤدي النقر بزر الماوس الأيمن إلى إلغاء التحديد. وتتزامن نقطة الوقت المحددة عبر جميع علامات التبويب، مما يسهّل عليك العثور على الموقع نفسه سريعاً في العروض الأخرى.

تشير الأقسام الصفراء إلى أن الروبوت في وضع التحكم الذاتي (autonomous)، والأقسام الزرقاء إلى وضع التحكم عن بُعد (teleoperated)، والأقسام الرمادية إلى وضع الاختبار (utility).

للتكبير أو التصغير، ضع المؤشر فوق المخطط الزمني ومرّر للأعلى أو للأسفل. يمكنك أيضاً تحديد نطاق زمني بالنقر والسحب مع الضغط على مفتاح `Shift`. وللتحرك يميناً ويساراً، مرّر أفقياً (على الأجهزة المدعومة) أو انقر واسحب على المخطط الزمني. وعند الاتصال المباشر، يؤدي التمرير إلى اليسار إلى إلغاء التثبيت على الوقت الحالي، بينما يعيد التمرير إلى أقصى اليمين تثبيته على الوقت الحالي مجدداً. اضغط على `Ctrl+\` للتكبير إلى الفترة التي يكون فيها الروبوت مفعّلاً.

<img src="/img/tab-reference/timeline.webp" alt="المخطط الزمني" />

</details>

## عناصر التحكم في الكاميرا {#camera-controls}

مرّر للأعلى أو للأسفل فوق الملعب للتكبير والتصغير، وانقر واسحب لتحريك العرض عبر الملعب. انقر بزر الماوس الأيمن في أي مكان على الملعب لفتح قائمة الكاميرا التي تتضمن الخيارات التالية:

- **غير مقفل:** يكون التحريك والتكبير يدوياً.
- **مقفل على الروبوت:** تتحرك الكاميرا تلقائياً لتتبع الروبوت.
- **مقفل على الروبوت والدوران:** تتحرك الكاميرا وتدور تلقائياً لتتبع الروبوت ودورانه.

في أي من وضعي القفل، يمكنك تحريك الكاميرا بحرية بعيداً عن الروبوت، كما يمكنك استخدام أزرار الاتجاه في لوحة التحكم لتدوير الكاميرا في أي وضع.

## إضافة الكائنات {#adding-objects}

للبدء، اسحب حقلاً إلى قسم «وضعيات (Poses)». يمكنك حذف كائن باستخدام زر X، أو إخفاؤه مؤقتاً بالنقر على أيقونة العين أو النقر المزدوج على اسم الحقل. ولإزالة جميع الكائنات، انقر على أيقونة سلة المهملات بجوار عنوان المحور ثم اختر `مسح الكل`. كما يمكنك إعادة ترتيب الكائنات في القائمة بالنقر والسحب.

**لتخصيص أي كائن، انقر على الأيقونة الملونة أو انقر بزر الماوس الأيمن على اسم الحقل.** يدعم AdvantageScope عدداً كبيراً من أنواع الكائنات، ويمكنك تخصيص العديد منها (مثل تغيير الألوان)، بينما يلزم إضافة بعض الكائنات ككائنات تابعة (children) لكائن موجود.

:::tip
للاطلاع على قائمة كاملة بأنواع الكائنات المدعومة، انقر على أيقونة `؟`. تتضمن هذه القائمة أيضاً أنواع البيانات المدعومة وما إذا كان يلزم إضافة الكائن ككائن تابع.
:::

<img src="/img/tab-reference/2d-field-2.webp" alt="ملعب ثنائي الأبعاد مع كائنات" />

## تنسيق البيانات {#data-format}

يجب نشر البيانات الهندسية بصيغة struct أو protobuf مرمّزة بالبايت. يدعم التطبيق أنواعاً هندسية متنوعة ثنائية وثلاثية الأبعاد، بما في ذلك `Pose2d` و`Pose3d` و`Translation2d` و`Translation3d` وغيرها.

تدعم مكتبات عديدة تنسيق struct، بما في ذلك WPILib وAdvantageKit. يوضح المثال البرمجي أدناه كيفية تسجيل بيانات الوضعيات ثنائية الأبعاد بلغة Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

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

- **الملعب:** صورة الملعب المراد استخدامها. يدعم التطبيق جميع ألعاب FRC وFTC الحديثة. لإضافة صورة ملعب مخصصة، راجع صفحة [الأصول المخصصة](/more-features/custom-assets).
- **الاتجاه:** اتجاه صورة الملعب في لوحة العرض.
- **الحجم:** طول ضلع الروبوت (30 أو 27 أو 24 بوصة لـ FRC، و18 أو 16 أو 14 بوصة لـ FTC).

:::info
يمكنك تخصيص نظام الإحداثيات المستخدم في علامة التبويب هذه. راجع صفحة [نظام الإحداثيات](/more-features/coordinate-systems) للتفاصيل.
:::
