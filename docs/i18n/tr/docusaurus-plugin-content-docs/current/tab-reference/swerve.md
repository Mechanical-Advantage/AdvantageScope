---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 Swerve {#swerve}

Swerve sekmesi; vektör hızları, boşta olma konumları, robot rotasyonu ve şasi hızları dahil olmak üzere dört swerve modülünün durumunu gösterir.

<img src="/img/tab-reference/swerve-1.png" alt="Swerve sekmesine genel bakış" />

<details>
<summary>Zaman Çizelgesi Kontrolleri</summary>

Zaman çizelgesi oynatmayı ve görselleştirmeyi kontrol etmek için kullanılır. Zaman çizelgesine tıklamak bir zaman seçer ve sağ tıklamak seçimi kaldırır. Seçilen zaman tüm sekmeler arasında senkronize edilir, bu da bu konumu diğer görünümlerde hızlıca bulmayı kolaylaştırır.

Sarı bölümler robotun otonomda olduğu zamanları, mavi bölümler robotun teleoperasyonda olduğu zamanları ve gri bölümler robotun test modunda olduğu zamanları gösterir.

Yakınlaştırmak için imleci zaman çizelgesinin üzerine getirin ve yukarı veya aşağı kaydırın. `Shift` tuşunu basılı tutarken tıklayıp sürükleyerek bir aralık da seçilebilir. Yatay olarak kaydırarak (desteklenen cihazlarda) veya zaman çizelgesinde tıklayıp sürükleyerek sola ve sağa hareket edin. Canlı bağlandığında sola kaydırmak mevcut zamandan kilidi kaldırır ve en sağa kadar kaydırmak tekrar mevcut zamana kilitler. Robotun etkin olduğu periyoda yakınlaştırmak için `Ctrl+\` tuşlarına basın.

<img src="/img/tab-reference/timeline.png" alt="Zaman çizelgesi" />

</details>

## Kaynaklar ekleme {#adding-sources}

Başlamak için bir alanı "Kaynaklar" bölümüne sürükleyin. X düğmesini kullanarak bir kaynağı silin veya göz simgesine tıklayarak ya da alan adına çift tıklayarak geçici olarak gizleyin. Tüm kaynakları kaldırmak için eksen başlığının yanındaki çöp kutusuna ve ardından `Tümünü Temizle` seçeneğine tıklayın. Kaynaklar listede tıklanıp sürüklenerek yeniden düzenlenebilir.

**Her kaynağı özelleştirmek için renkli simgeye tıklayın veya alan adına sağ tıklayın.** AdvantageScope üç kaynak türünü destekler:

- **Modül Hızları:** Diyagram üzerinde vektörler olarak görüntülenen dört swerve modülü durumlarından oluşan bir küme.
- **Robot Hızları:** Diyagramın merkezinde görüntülenen doğrusal ve açısal hızlar.
- **Rotasyon:** Diyagramı döndürmek için kullanılan açısal konum.

## Veri formatı {#data-format}

Veriler `SwerveModuleVelocity[]`, `ChassisVelocities`, `Rotation2d` veya `Rotation3d` türleri kullanılarak bayt kodlu struct veya protobuf olarak yayınlanmalıdır.

WPILib ve AdvantageKit dahil birçok kütüphane struct formatını destekler. Aşağıdaki örnek kod Java'da swerve modül durumlarının nasıl loglanacağını göstermektedir.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
}

StructArrayPublisher<SwerveModuleVelocity> publisher = NetworkTableInstance.getDefault()
.getStructArrayTopic("MyStates", SwerveModuleVelocity.struct).publish();

periodic() {
  publisher.set(states);
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
}

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

## Yapılandırma {#configuration}

Aşağıdaki yapılandırma seçenekleri mevcuttur:

- **Maksimum Hız:** Vektörlerin boyutunu ayarlamak için kullanılan modüllerin ulaşabileceği maksimum hız.
- **Şasi Boyutu:** Sol-sağ ve ön-arka swerve modülleri arasındaki mesafeler. Robot diyagramının en boy oranını değiştirir.
- **Yönelim:** Robot diyagramının yönlendirildiği yönü ayarlar. Bu seçenek genellikle poz verileriyle veya maç videolarıyla hizalamak için kullanışlıdır.

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
