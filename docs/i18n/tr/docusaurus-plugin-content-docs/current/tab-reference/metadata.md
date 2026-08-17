---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Üst veri {#metadata}

Üst veri sekmesi, gizli "/Metadata" tablosuna veya AdvantageKit aracılığıyla yayınlanan değerleri gösterir. Üst veri anahtarları solda görüntülenir ve sütunlar farklı kaynaklardan (örneğin AdvantageKit kullanılırken gerçek ve yeniden oynatma) gelen verileri ayırır.

<img src="/img/tab-reference/metadata-1.webp" alt="Üst veri sekmesine genel bakış" />

_Yukarıda İngilizce arayüz gösterilmektedir._

Aşağıdaki örnek kod Java kullanarak üst verilerin nasıl loglanacağını göstermektedir.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

WPILib'de değerler dize olarak "/Metadata" tablosuna loglanmalıdır.

```java
// NetworkTables (aynı zamanda varsayılan olarak DataLog'a da kaydedilir)
StringPublisher publisher = NetworkTableInstance.getDefault()
    .getStringTopic("/Metadata/MyKey").publish();
publisher.set("MyValue");

// DataLog (NetworkTables'a yayınlanmaz)
StringLogEntry entry = new StringLogEntry(DataLogManager.getLog(), "/Metadata/MyKey");
entry.append("MyValue");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

AdvantageKit'te loglayıcıyı başlatmadan önce aşağıdaki yöntemi çağırın. Üst veri, kolay karşılaştırma için gerçek ve yeniden oynatmada çalışırken ayrı olarak saklanır.

```java
Logger.recordMetadata("MyKey", "MyValue");
```

</TabItem>
</Tabs>
