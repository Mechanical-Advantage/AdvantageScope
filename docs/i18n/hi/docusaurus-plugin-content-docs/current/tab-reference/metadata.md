---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 मेटाडेटा {#metadata}

मेटाडेटा टैब छिपी हुई "/Metadata" तालिका या AdvantageKit के माध्यम से पब्लिश किए गए मानों को दिखाता है। मेटाडेटा कुंजियाँ बाईं ओर प्रदर्शित होती हैं, और कॉलम विभिन्न स्रोतों से डेटा को अलग करते हैं (उदा. AdvantageKit का उपयोग करते समय रियल और रीप्ले)।

<img src="/img/tab-reference/metadata-1.webp" alt="Overview of metadata tab" />

_ऊपर अंग्रेजी इंटरफ़ेस दिखाया गया है।_

नीचे दिया गया उदाहरण कोड दिखाता है कि Java का उपयोग करके मेटाडेटा कैसे लॉग किया जाए।

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

WPILib में, मानों को स्ट्रिंग्स के रूप में "/Metadata" तालिका में लॉग किया जाना चाहिए।

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

AdvantageKit में, लॉगर शुरू करने से पहले नीचे दी गई विधि को कॉल करें। आसान तुलना के लिए रियल और रीप्ले में चलते समय मेटाडेटा अलग से संग्रहीत किया जाता है।

```java
Logger.recordMetadata("MyKey", "MyValue");
```

</TabItem>
</Tabs>
