---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 بيانات وصفية {#metadata}

تعرض علامة تبويب البيانات الوصفية القيم المنشورة في جدول "/Metadata" المخفي أو من خلال AdvantageKit. تُعرض مفاتيح البيانات الوصفية إلى اليسار، وتفصل الأعمدة البيانات من المصادر المختلفة (مثل حقيقي وإعادة عند استخدام AdvantageKit).

<img src="/img/tab-reference/metadata-1.png" alt="نظرة عامة على علامة تبويب البيانات الوصفية" />

يظهر كود المثال أدناه كيفية تسجيل البيانات الوصفية باستخدام Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

في WPILib، يجب تسجيل القيم في جدول "/Metadata" كنصوص.

```java
// NetworkTables (also saved to DataLog by default)
StringPublisher publisher = NetworkTableInstance.getDefault()
    .getStringTopic("/Metadata/MyKey").publish();
publisher.set("MyValue");

// DataLog (not published to NetworkTables)
StringLogEntry entry = new StringLogEntry(DataLogManager.getLog(), "/Metadata/MyKey");
entry.append("MyValue");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

في AdvantageKit، استدعِ الطريقة أدناه قبل بدء مسجل البيانات. يتم تخزين البيانات الوصفية بشكل منفصل عند التشغيل في الحقيقي وإعادة التشغيل لسلاسة المقارنة.

```java
Logger.recordMetadata("MyKey", "MyValue");
```

</TabItem>
</Tabs>
