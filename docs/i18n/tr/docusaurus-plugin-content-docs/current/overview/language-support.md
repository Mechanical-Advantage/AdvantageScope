---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 Dil desteği {#language-support}

AdvantageScope, dünyanın dört bir yanındaki takımlara kendi dillerinde bir deneyim sunmak için birden fazla dili destekler. Aşağıdaki diller şu anda AdvantageScope belgelerinde, masaüstü uygulamasında, mobil uygulamalarda (AdvantageScope XR ve AdvantageTune) ve AdvantageScope Lite'ta (Systemcore üzerinde ve FIRST Driver Station'da) kullanılabilir:

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

AdvantageScope çevirilerini incelemeye ve geliştirmeye yardımcı olduğu için FRC Team 6907 The G.O.A.T. ekibine teşekkür ederiz!

## Yapılandırma {#configuration}

AdvantageScope'un arayüz dilini değiştirmek için `Uygulama` > `Tercihleri göster...` (Windows/Linux) veya `AdvantageScope` > `Ayarlar...` (macOS) yolunu izleyerek tercihler penceresini açın. “Dil” ayarından desteklenen dillerden birini seçebilir veya işletim sisteminizin dilini otomatik olarak kullanmak için “Sistem varsayılanı”nı tercih edebilirsiniz.

<img src="/img/prefs_tr.webp" alt="Tercihler penceresi" height="450" />

## Log anahtarları {#logging-keys}

AdvantageScope'un desteklediği tüm formatlar, log anahtarları tanımlanırken tam Unicode uyumluluğu sunar. Yani verilerinizi kendi dilinizde (Türkçe karakterler, aksanlar, özel simgeler ve Latin dışı alfabeler dahil) kaydedebilirsiniz; AdvantageScope bunları sorunsuz bir şekilde saklar ve görüntüler.

Aşağıda Türkçe bir anahtarla metin (string) kaydetme örneğini görebilirsiniz:

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Telemetry.log("Sürüş/SağMotorHızı", "Hızlı");
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::telemetry::Log("Sürüş/SağMotorHızı", "Hızlı");
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import telemetry

telemetry.log("Sürüş/SağMotorHızı", "Hızlı")
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("Sürüş/SağMotorHızı", "Hızlı");
```

</TabItem>
</Tabs>

:::tip Birim desteği
Birim üst verilerini nasıl ileteceğinizi öğrenmek için [birim desteği](/tab-reference/line-graph/units) sayfasını inceleyebilirsiniz. AdvantageScope'ta seçtiğiniz dilden bağımsız olarak, birim adlarını SI simgeleriyle veya İngilizce (Amerikan ya da İngiliz yazımıyla) belirtmeniz gerekir.
:::

## Geliştirme {#development}

AdvantageScope'un yerelleştirmesi, yapay zekâ ve topluluk katkılarının birleşimiyle hazırlanır. AdvantageScope çok hızlı gelişen bir proje olduğu için, uygulamanın ve belgelerin tüm dillerde güncel kalabilmesi adına yapay zekâdan yararlanmak gerekir. Bu sayede hangi dili seçerseniz seçin, yeni özelliklere ve güncellemelere herkesle aynı anda ulaşabilirsiniz.

Çeviri sürecimiz, yerel takımların günlük hayatta kullandığı terimlere ve alıntı kelimelere uyum sağlayacak şekilde tasarlanmıştır. Yine de **yapay zekâ çevirilerinde zaman zaman doğal durmayan ifadeler veya hatalar bulunabilir**. Geri bildirimleriniz bizim için çok değerli; uygulama İngilizce dışında bir dile ayarlıyken uygulamadaki mor simgeye veya belge başlık çubuğundaki geri bildirim bağlantısına tıklayarak çevirilerle ilgili görüşlerinizi paylaşabilirsiniz.
