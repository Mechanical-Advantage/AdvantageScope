---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ آلية {#mechanism}

تعرض علامة تبويب الآلية آلية مفصلية تم إنشاؤها باستخدام كائن واحد أو أكثر من كائنات [Mechanism2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html).

<img src="/img/tab-reference/mechanism-1.webp" alt="نظرة عامة على علامة تبويب الآلية" />

<details>
<summary>عناصر تحكم المخطط الزمني</summary>

يُستخدم المخطط الزمني للتحكم في التشغيل والعرض المرئي. يؤدي النقر على المخطط الزمني إلى تحديد وقت، ويؤدي النقر بزر الماوس الأيمن إلى إلغاء تحديده. يتم مزامنة الوقت المحدد عبر جميع علامات التبويب، مما يسهل العثور بسرعة على هذا الموقع في العروض الأخرى.

تشير الأقسام الصفراء إلى أن الروبوت في وضع التحكم الذاتي (autonomous)، وتشير الأقسام الزرقاء إلى أن الروبوت في وضع التحكم عن بعد (teleoperated)، وتشير الأقسام الرمادية إلى أن الروبوت في وضع الخدمة/المرافق (utility).

التكبير/التصغير، ضع المؤشر فوق المخطط الزمني وقم بالتمرير للأعلى أو الأسفل. يمكن أيضاً تحديد نطاق بالنقر والسحب أثناء الضغط على مفتاح `Shift`. تحرك يساراً ويميناً بالتمرير أفقيًا (على الأجهزة المدعومة)، أو بالنقر والسحب على المخطط الزمني. عند الاتصال المباشر، يؤدي التمرير إلى اليسار إلى إلغاء القفل من الوقت الحالي، والتمرير حتى أقصى اليمين يقفل على الوقت الحالي مرة أخرى. اضغط على `Ctrl+\` للتكبير إلى الفترة التي يكون فيها الروبوت ممكّناً.

<img src="/img/tab-reference/timeline.webp" alt="الجدول الزمني" />

</details>

## إضافة الآليات {#adding-mechanisms}

للأدء، اسحب `Mechanism2d` إلى جزء التحكم. احذف آلية باستخدام زر X، أو أخفها مؤقتاً بالنقر فوق أيقونة العين أو النقر المزدوج على اسم الحقل. لإزالة جميع الآليات، انقر فوق سلة المهملات بالقرب من عنوان المحور ثم `مسح الكل`. يمكن إعادة ترتيب الآليات في القائمة بالنقر والسحب.

## نشر البيانات {#publishing-data}

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

لنشر بيانات الآليات باستخدام WPILib، أرسل كائن `Mechanism2d` إلى NetworkTables (موضح أدناه). إذا كان تسجيل البيانات ممكّناً، يمكن أيضاً عرض الآليات بناءً على ملف WPILOG المُنشأ.

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);
SmartDashboard.putData("MyMechanism", mechanism);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

لنشر بيانات الآليات باستخدام AdvantageKit، سجل `Mechanism2d` كحقل إخراج (موضح أدناه). لاحظ أن هذا الاستدعاء يسجل الحالة الحالية لـ `Mechanism2d` فقط، لذا يجب استدعاؤه في كل دورة حلقة بعد تحديث الكائن.

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);
Logger.recordOutput("MyMechanism", mechanism);
```

</TabItem>
</Tabs>
