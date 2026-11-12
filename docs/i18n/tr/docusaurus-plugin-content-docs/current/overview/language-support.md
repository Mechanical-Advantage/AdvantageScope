---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 Dil desteği {#language-support}

AdvantageScope, dünya çapındaki takımlara yerelleştirilmiş bir deneyim sunmak için birden fazla dili destekler. Aşağıdaki diller şu anda mevcuttur ve AdvantageScope belgeleri, masaüstü uygulaması, mobil uygulamalar (AdvantageScope XR ve AdvantageTune) ile AdvantageScope Lite (Systemcore üzerinde ve FIRST Driver Station'da) tarafından desteklenmektedir:

- İngilizce (ABD)
- İspanyolca (Latin Amerika)
- Fransızca
- Felemenkçe
- Portekizce (Brezilya)
- Romence
- Türkçe
- Rusça
- Kazakça
- İbranice
- Arapça
- Hintçe
- Basitleştirilmiş Çince
- Geleneksel Çince

## Yapılandırma {#configuration}

AdvantageScope'ta görüntüleme dilini değiştirmek için `App` > `Tercihleri Göster...` (Windows/Linux) veya `AdvantageScope` > `Ayarlar...` (macOS) seçeneğine tıklayarak tercihler penceresini açın. "Dil" ayarı altında, desteklenen diller listesinden seçim yapabilir veya işletim sisteminizin diliyle otomatik olarak eşleştirmek için "Sistem Varsayılanı"nı seçebilirsiniz.

<img src="/img/prefs_tr.webp" alt="Tercihler şeması" height="450" />

## Log anahtarları {#logging-keys}

AdvantageScope tarafından desteklenen tüm formatlar, log anahtarları tanımlanırken tam Unicode uyumluluğuna sahiptir. Bu, verileri tercih ettiğiniz dili kullanarak (aksanlar, özel karakterler ve Latin dışı alfabeler dahil) kaydedebileceğiniz ve verilerin AdvantageScope'ta düzgün bir şekilde kaydedilip görüntüleneceği anlamına gelir.

Aşağıda Türkçe bir anahtarla dize kaydetme örneği verilmiştir:

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Telemetry.log("Sürüş/Sağ motor hızı", "Hızlı");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("Sürüş/Sağ motor hızı", "Hızlı");
```

</TabItem>
</Tabs>

:::tip Birim desteği
Birim üst verilerini iletme hakkında daha fazla ayrıntı için [birim desteği](/tab-reference/line-graph/units) sayfasına bakın. AdvantageScope'ta seçilen dilden bağımsız olarak birim adları SI simgeleri veya İngilizce (Amerikan veya İngiliz İngilizcesi yazımı) kullanılarak sağlanmalıdır.
:::

## Geliştirme {#development}

AdvantageScope'un yerelleştirmesi, yapay zekâ ve topluluk iş birliğinin birleşimiyle oluşturulmaktadır. AdvantageScope hızla gelişen bir proje olduğundan, çevrilen uygulamanın ve belgelerin her dilde senkronize tutulması için yapay zekâ kullanımı zorunludur. Bu, seçtiğiniz dilden bağımsız olarak yeni özelliklerin ve güncellemelerin her zaman eşzamanlı olarak mevcut olduğu anlamına gelir.

Sürecimiz, yerel ekiplerin aşina olduğu belirli kelime dağarcığına, alıntı sözcüklere ve transliterasyonlara uyacak şekilde tasarlanmıştır. Bununla birlikte, yapay zekâ çevirileri genellikle doğal olmayan ifadeler veya başka yanlışlıklar içerir. Geri bildirimlerinizi memnuniyetle karşılıyoruz; uygulamadaki mor simgeye tıklayarak çeviriler hakkında geri bildirim sağlayabilirsiniz (İngilizce dışındaki herhangi bir dile ayarlandığında).
