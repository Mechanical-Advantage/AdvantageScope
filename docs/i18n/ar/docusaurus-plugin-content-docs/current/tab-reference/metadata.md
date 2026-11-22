---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 بيانات وصفية {#metadata}

تعرض علامة تبويب البيانات الوصفية القيم المنشورة في جدول `"/Metadata"` المخفي أو عبر AdvantageKit. تظهر مفاتيح البيانات الوصفية إلى اليسار، وتفصل الأعمدة بين البيانات الواردة من مصادر مختلفة (مثل التشغيل الحقيقي وإعادة التشغيل عند استخدام AdvantageKit).

<img src="/img/tab-reference/metadata-1.webp" alt="نظرة عامة على علامة تبويب البيانات الوصفية" />

_تظهر في الصورة أعلاه الواجهة باللغة الإنجليزية._

يوضح المثال البرمجي أدناه كيفية تسجيل البيانات الوصفية.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

في WPILib، سجّل القيم في جدول `"/Metadata"` كسلاسل نصية باستخدام الفئة `Telemetry`.

```java
TelemetryTable metadata = Telemetry.getTable("Metadata");
metadata.log("RobotName", "Darwin");
metadata.log("Platform", "macOS");
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

في WPILib، سجّل القيم في جدول `"/Metadata"` كسلاسل نصية باستخدام الفئة `Telemetry`.

```cpp
wpi::telemetry::TelemetryTable& metadata = wpi::telemetry::GetTable("Metadata");
metadata.Log("RobotName", "Darwin");
metadata.Log("Platform", "macOS");
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

في WPILib، سجّل القيم في جدول `"/Metadata"` كسلاسل نصية باستخدام الوحدة `telemetry`.

```python
import telemetry

metadata = telemetry.get_table("Metadata")
metadata.log("RobotName", "Darwin")
metadata.log("Platform", "macOS")
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

في AdvantageKit، استدعِ الدالة أدناه قبل بدء مسجل البيانات. وتُخزَّن البيانات الوصفية بشكل منفصل عند التشغيل الحقيقي وإعادة التشغيل لتسهيل المقارنة.

```java
Logger.recordMetadata("RobotName", "Darwin");
Logger.recordMetadata("Platform", "macOS");
```

</TabItem>
</Tabs>
