---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 Dil desteği {#language-support}

AdvantageScope, dünya çapındaki takımlara yerelleştirilmiş bir deneyim sunmak için birden fazla dili destekler. Şu anda aşağıdaki diller mevcuttur:

- İngilizce (ABD)
- İspanyolca (Latin Amerika)
- Fransızca
- Portekizce (Brezilya)
- Türkçe
- Romence
- İbranice
- Kazakça
- Rusça
- Arapça
- Basitleştirilmiş Çince
- Geleneksel Çince

## Yapılandırma {#configuration}

AdvantageScope'ta görüntüleme dilini değiştirmek için `App` > `Tercihleri Göster...` (Windows/Linux) veya `AdvantageScope` > `Ayarlar...` (macOS) seçeneğine tıklayarak tercihler penceresini açın. "Dil" ayarı altında, desteklenen diller listesinden seçim yapabilir veya işletim sisteminizin diliyle otomatik olarak eşleştirmek için "Sistem Varsayılanı"nı seçebilirsiniz.

<img src="/img/prefs_tr.webp" alt="Tercihler şeması" height="350" />

## Log anahtarları {#logging-keys}

AdvantageScope tarafından desteklenen tüm formatlar, log anahtarları tanımlanırken tam Unicode uyumluluğuna sahiptir. Bu, verileri kendi ana dilinizi kullanarak (aksanlar, özel karakterler ve Latin dışı alfabeler dahil) kaydedebileceğiniz ve verilerin AdvantageScope'ta düzgün bir şekilde kaydedilip görüntüleneceği anlamına gelir.

Aşağıda Türkçe bir anahtarla dize kaydetme örneği verilmiştir:

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SmartDashboard.putString("Sürüş/Sağ motor hızı", "Hızlı");
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

AdvantageScope'un yerelleştirmesi, yapay zekâ ve topluluk iş birliğinin birleşimiyle yürütülmektedir. AdvantageScope hızla gelişen bir proje olduğundan, çevrilen uygulamanın ve belgelerin her dilde senkronize tutulması için yapay zekâ kullanımı zorunludur. Bu, seçtiğiniz dilden bağımsız olarak yeni özelliklerin ve güncellemelerin her zaman eşzamanlı olarak mevcut olduğu anlamına gelir.

En yüksek kalitede çevirileri sağlamak amacıyla sürecimiz, her dil için ayrıntılı sözlükler ve yönergeler oluşturmak üzere FIRST topluluğundaki anadili konuşan kişilerin kapsamlı referans materyallerine dayanır. Bu, çevirilerin yerel takımların aşina olduğu belirli kelime dağarcığına, alıntı kelimelere ve transliterasyonlara uymasına yardımcı olur.

Temel çeviriler, kritik seçimler (FIRST terimleri çevirileri gibi) üzerinde insan denetimi ile yapay zekâ kullanılarak yinelemeli olarak oluşturulur. Bu çeviriler daha sonra ortaya çıkan metnin doğruluğunu sağlamak için FIRST topluluğundaki anadili konuşanlar tarafından gözden geçirilir ve parlatılır. Kullanıcılar ayrıca uygulamadaki mor simgeye tıklayarak çeviriler hakkında geri bildirim sağlayabilirler (İngilizce dışındaki herhangi bir dile ayarlandığında).
