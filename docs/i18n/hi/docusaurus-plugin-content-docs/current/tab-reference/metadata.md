---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 मेटाडेटा {#metadata}

मेटाडेटा टैब छिपी हुई "/Metadata" टेबल या AdvantageKit के माध्यम से पब्लिश किए गए मान दिखाता है। मेटाडेटा कुंजियाँ (keys) बाईं ओर दिखती हैं, और कॉलम अलग-अलग स्रोतों से आने वाले डेटा को अलग करते हैं (जैसे AdvantageKit इस्तेमाल करते समय रियल और रीप्ले)।

<img src="/img/tab-reference/metadata-1.webp" alt="Overview of metadata tab" />

_ऊपर अंग्रेजी इंटरफ़ेस दिखाया गया है।_

नीचे दिया गया उदाहरण कोड दिखाता है कि Java में मेटाडेटा कैसे लॉग किया जाता है।

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

WPILib में, `Telemetry` क्लास का उपयोग करके "/Metadata" टेबल में मान स्ट्रिंग के रूप में लॉग करें।

```java
TelemetryTable metadata = Telemetry.getTable("Metadata");
metadata.log("RobotName", "Darwin");
metadata.log("Platform", "macOS");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

AdvantageKit में, लॉगर शुरू करने से पहले नीचे दिया गया मेथड कॉल करें। आसान तुलना के लिए रियल और रीप्ले में चलते समय मेटाडेटा अलग-अलग स्टोर होता है।

```java
Logger.recordMetadata("RobotName", "Darwin");
Logger.recordMetadata("Platform", "macOS");
```

</TabItem>
</Tabs>
