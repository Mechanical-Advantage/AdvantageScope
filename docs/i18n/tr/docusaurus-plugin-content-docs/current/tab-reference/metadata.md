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

WPILib'de `Telemetry` sınıfını kullanarak değerleri "/Metadata" tablosuna dize olarak loglayın.

```java
TelemetryTable metadata = Telemetry.getTable("Metadata");
metadata.log("RobotName", "Darwin");
metadata.log("Platform", "macOS");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

AdvantageKit'te loglayıcıyı başlatmadan önce aşağıdaki yöntemi çağırın. Üst veri, kolay karşılaştırma için gerçek ve yeniden oynatmada çalışırken ayrı olarak saklanır.

```java
Logger.recordMetadata("RobotName", "Darwin");
Logger.recordMetadata("Platform", "macOS");
```

</TabItem>
</Tabs>
