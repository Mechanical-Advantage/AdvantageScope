---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Üst veri {#metadata}

Üst veri sekmesi, gizli “/Metadata” tablosuna veya AdvantageKit üzerinden yayınlanan değerleri gösterir. Üst veri anahtarları solda listelenir; sütunlar ise farklı kaynaklardan (örneğin AdvantageKit kullanırken gerçek robot ve yeniden oynatma) gelen verileri ayırır.

<img src="/img/tab-reference/metadata-1.webp" alt="Üst veri sekmesine genel bakış" />

_Yukarıda İngilizce arayüz gösteriliyor._

Aşağıdaki örnek kod, Java kullanarak üst verilerin nasıl loglanacağını gösterir.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

WPILib'de `Telemetry` sınıfını kullanarak değerleri “/Metadata” tablosuna metin (string) olarak loglayın.

```java
TelemetryTable metadata = Telemetry.getTable("Metadata");
metadata.log("RobotName", "Darwin");
metadata.log("Platform", "macOS");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

AdvantageKit'te loglayıcıyı başlatmadan önce aşağıdaki metodu çağırın. Üst veri, gerçek çalışma ve yeniden oynatma sırasında kolayca karşılaştırılabilmesi için ayrı olarak saklanır.

```java
Logger.recordMetadata("RobotName", "Darwin");
Logger.recordMetadata("Platform", "macOS");
```

</TabItem>
</Tabs>
