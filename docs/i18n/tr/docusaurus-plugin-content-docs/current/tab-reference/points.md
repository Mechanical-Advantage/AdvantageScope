---
sidebar_position: 11
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📍 Noktalar {#points}

Noktalar sekmesi keyfi noktaların 2B görselleştirmesini gösterir. Bu, görüş verilerinin/borularının, mekanizma durumlarının vb. özel görselleştirmelerine olanak tanıyan son derece esnek bir araçtır.

<img src="/img/tab-reference/points-1.webp" alt="Nokta sekmesi örneği" />

<details>
<summary>Zaman Çizelgesi Kontrolleri</summary>

Zaman çizelgesi oynatmayı ve görselleştirmeyi kontrol etmek için kullanılır. Zaman çizelgesine tıklamak bir zaman seçer ve sağ tıklamak seçimi kaldırır. Seçilen zaman tüm sekmeler arasında senkronize edilir, bu da bu konumu diğer görünümlerde hızlıca bulmayı kolaylaştırır.

Sarı bölümler robotun otonomda olduğu zamanları, mavi bölümler robotun teleoperasyonda olduğu zamanları ve gri bölümler robotun test modunda olduğu zamanları gösterir.

Yakınlaştırmak için imleci zaman çizelgesinin üzerine getirin ve yukarı veya aşağı kaydırın. `Shift` tuşunu basılı tutarken tıklayıp sürükleyerek bir aralık da seçilebilir. Yatay olarak kaydırarak (desteklenen cihazlarda) veya zaman çizelgesinde tıklayıp sürükleyerek sola ve sağa hareket edin. Canlı bağlandığında sola kaydırmak mevcut zamandan kilidi kaldırır ve en sağa kadar kaydırmak tekrar mevcut zamana kilitler. Robotun etkin olduğu periyoda yakınlaştırmak için `Ctrl+\` tuşlarına basın.

<img src="/img/tab-reference/timeline.webp" alt="Zaman çizelgesi" />

</details>

## Kaynaklar ekleme {#adding-sources}

Başlamak için bir alanı "Kaynaklar" bölümüne sürükleyin. X düğmesini kullanarak bir kaynağı silin veya göz simgesine tıklayarak ya da alan adına çift tıklayarak geçici olarak gizleyin. Tüm nesneleri kaldırmak için eksen başlığının yanındaki çöp kutusuna ve ardından `Tümünü Temizle` seçeneğine tıklayın. Kaynaklar listede tıklanıp sürüklenerek yeniden düzenlenebilir.

**Her kaynağı özelleştirmek için renkli simgeye tıklayın veya alan adına sağ tıklayın.** Her kaynağın simgesi, rengi ve boyutu ayarlanabilir.

:::tip
Desteklenen kaynak türlerinin tam listesini görmek için `?` simgesine tıklayın. Bu liste ayrıca desteklenen veri türlerini de içerir.
:::

## Veri formatı {#data-format}

Nokta verileri, `Translation2d[]` türü kullanılarak bayt kodlu struct veya protobuf olarak yayınlanmalıdır. WPILib ve AdvantageKit dahil birçok kütüphane bu formatı destekler. Aşağıdaki örnek kod Java'da nokta verilerinin nasıl loglanacağını göstermektedir.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
StructArrayPublisher<Translation2d> publisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyTranslations", Translation2d.struct).publish();

periodic() {
  publisher.set(new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
  publisher.set(
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  );
}
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

- **Boyutlar:** Görüntüleme alanının boyutu. Bu, yayınlanan noktalarla eşleşen herhangi bir birimi kullanabilir. Görüş verilerini görüntülerken bu, kameranın çözünürlüğüdür.
- **Yönelim:** Kullanılacak koordinat sistemi (X ve Y eksenlerinin yönelimi).
- **Orijin:** Koordinat sisteminde orijinin konumu.
