---
sidebar_position: 11
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📍 Noktalar {#points}

Noktalar sekmesi, istediğiniz noktaların 2B görselleştirmesini sunar. Bu, görüntü işleme verilerinin/hatlarının, mekanizma durumlarının vb. özel görselleştirmelerine olanak tanıyan son derece esnek bir araçtır.

<img src="/img/tab-reference/points-1.webp" alt="Noktalar sekmesi örneği" />

_Yukarıda İngilizce arayüz gösteriliyor._

<details>
<summary>Zaman çizelgesi kontrolleri</summary>

Zaman çizelgesi, oynatmayı ve görselleştirmeyi kontrol etmek için kullanılır. Zaman çizelgesine tıklayarak bir zaman seçebilir, sağ tıklayarak seçimi kaldırabilirsiniz. Seçilen zaman tüm sekmeler arasında senkronize edilir; böylece aynı anı diğer görünümlerde de hızlıca bulabilirsiniz.

Sarı bölümler robotun otonomda, mavi bölümler teleop'ta ve gri bölümler test modunda olduğu zamanları gösterir.

Yakınlaştırmak için imleci zaman çizelgesinin üzerine getirin ve yukarı veya aşağı kaydırın. `Shift` tuşunu basılı tutarken tıklayıp sürükleyerek bir aralık da seçebilirsiniz. Yatay kaydırma yaparak (desteklenen cihazlarda) veya zaman çizelgesi üzerinde tıklayıp sürükleyerek sola ve sağa hareket edebilirsiniz. Canlı bağlantıdayken sola kaydırmak mevcut zamandan kilidi açar, en sağa kadar kaydırmak ise tekrar mevcut zamana kilitler. Robotun etkin olduğu aralığa yakınlaştırmak için `Ctrl+\` tuşlarına basın.

<img src="/img/tab-reference/timeline.webp" alt="Zaman çizelgesi" />

</details>

## Kaynak ekleme {#adding-sources}

Başlamak için bir alanı “Kaynaklar” bölümüne sürükleyin. X düğmesine tıklayarak bir kaynağı silebilir, göz simgesine tıklayarak veya alan adına çift tıklayarak geçici olarak gizleyebilirsiniz. Tüm nesneleri kaldırmak için başlığın yanındaki çöp kutusuna ve ardından `Tümünü temizle` seçeneğine tıklayın. Kaynakların listedeki sırasını tıklayıp sürükleyerek değiştirebilirsiniz.

**Her kaynağı özelleştirmek için renkli simgeye tıklayın veya alan adına sağ tıklayın.** Her kaynağın simgesini, rengini ve boyutunu ayarlayabilirsiniz.

:::tip
Desteklenen kaynak türlerinin tam listesini görmek için `?` simgesine tıklayın. Bu listede desteklenen veri türlerini de bulabilirsiniz.
:::

## Veri formatı {#data-format}

Nokta verileri, `Translation2d[]` türü kullanılarak bayt kodlu (byte-encoded) struct veya protobuf formatında yayınlanmalıdır. WPILib ve AdvantageKit dahil birçok kütüphane bu formatı destekler. Aşağıdaki örnek kod, nokta verilerinin nasıl loglanacağını gösterir.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Telemetry.log("MyTranslations",
  new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::telemetry::Log("MyTranslations", std::vector{
  wpi::math::Translation2d{0_m, 1_m},
  wpi::math::Translation2d{2_m, 3_m}
});
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
from wpimath import Translation2d
import telemetry

telemetry.log(
    "MyTranslations",
    [
        Translation2d(0.0, 1.0),
        Translation2d(2.0, 3.0),
    ],
    element_type=Translation2d,
)
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("MyTranslations",
  new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
Logger.recordOutput("MyTranslations",
  new Translation2d(0.0, 1.0),
  new Translation2d(2.0, 3.0)
);
```

</TabItem>
</Tabs>

## Yapılandırma {#configuration}

Aşağıdaki yapılandırma seçenekleri mevcuttur:

- **Boyutlar:** Görüntüleme alanının boyutu. Burada yayınlanan noktalarla eşleşen herhangi bir birimi kullanabilirsiniz. Görüntü işleme verilerini görüntülerken bu değer kameranın çözünürlüğüdür.
- **Yönelim:** Kullanılacak koordinat sistemi (X ve Y eksenlerinin yönelimi).
- **Orijin:** Koordinat sisteminde orijinin konumu.
