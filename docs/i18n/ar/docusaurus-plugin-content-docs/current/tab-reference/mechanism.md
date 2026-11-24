---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ آلية {#mechanism}

تعرض علامة تبويب الآلية آليةً مفصليةً أُنشئت باستخدام كائن واحد أو أكثر من كائنات [Mechanism2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html).

<img src="/img/tab-reference/mechanism-1.webp" alt="نظرة عامة على علامة تبويب الآلية" />

_تظهر في الصورة أعلاه الواجهة باللغة الإنجليزية._

<details>
<summary>عناصر تحكم المخطط الزمني</summary>

يتيح لك المخطط الزمني التحكم في التشغيل والعرض المرئي؛ إذ يؤدي النقر عليه إلى تحديد وقت معيّن، بينما يؤدي النقر بزر الماوس الأيمن إلى إلغاء التحديد. وتتزامن نقطة الوقت المحددة عبر جميع علامات التبويب، مما يسهّل عليك العثور على الموقع نفسه سريعًا في العروض الأخرى.

تشير الأقسام الصفراء إلى أن الروبوت في وضع التحكم الذاتي (autonomous)، والأقسام الزرقاء إلى وضع التحكم عن بُعد (teleoperated)، والأقسام الرمادية إلى وضع الاختبار (utility).

للتكبير أو التصغير، ضع المؤشر فوق المخطط الزمني ومرّر للأعلى أو للأسفل. يمكنك أيضًا تحديد نطاق زمني بالنقر والسحب مع الضغط على مفتاح `Shift`. وللتحرك يمينًا ويسارًا، مرّر أفقيًا (على الأجهزة المدعومة) أو انقر واسحب على المخطط الزمني. وعند الاتصال المباشر، يؤدي التمرير إلى اليسار إلى إلغاء التثبيت على الوقت الحالي، بينما يعيد التمرير إلى أقصى اليمين تثبيته على الوقت الحالي مجددًا. اضغط على `Ctrl+\` للتكبير إلى الفترة التي يكون فيها الروبوت مفعّلًا.

<img src="/img/tab-reference/timeline.webp" alt="المخطط الزمني" />

</details>

## إضافة الآليات {#adding-mechanisms}

للبدء، اسحب كائن `Mechanism2d` إلى لوحة التحكم. يمكنك حذف آلية باستخدام زر X، أو إخفاؤها مؤقتًا بالنقر على أيقونة العين أو النقر المزدوج على اسم الحقل. ولإزالة جميع الآليات، انقر على أيقونة سلة المهملات بجوار عنوان المحور ثم اختر `مسح الكل`. كما يمكنك إعادة ترتيب الآليات في القائمة بالنقر والسحب.

## نشر البيانات {#publishing-data}

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

لنشر بيانات الآليات باستخدام WPILib، سجّل كائن `Mechanism2d` دوريًا باستخدام `Telemetry` (كما هو موضح أدناه). لاحظ أن هذا الاستدعاء يسجل الحالة الحالية لـ `Mechanism2d` فقط، لذا يجب استدعاؤه في كل دورة حلقة بعد تحديث الكائن.

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);

periodic() {
  Telemetry.log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

لنشر بيانات الآليات باستخدام AdvantageKit، سجّل كائن `Mechanism2d` دوريًا كحقل إخراج (كما هو موضح أدناه). لاحظ أن هذا الاستدعاء يسجل الحالة الحالية لـ `Mechanism2d` فقط، لذا يجب استدعاؤه في كل دورة حلقة بعد تحديث الكائن.

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);

periodic() {
  Logger.recordOutput("MyMechanism", mechanism);
}
```

:::tip
يمكنك استخدام التعليق التوضيحي [@AutoLogOutput](https://docs.advantagekit.org/data-flow/recording-outputs/annotation-logging) في AdvantageKit لتسجيل حالة الآلية تلقائيًا في كل دورة حلقة دون الحاجة إلى استدعاء `Logger.recordOutput`.
:::

</TabItem>
</Tabs>
