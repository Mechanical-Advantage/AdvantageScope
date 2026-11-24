---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 Swerve {#swerve}

Swerve sekmesi; hız vektörleri, boşta konumları, robotun yönelimi (rotasyonu) ve şasi hızları dahil olmak üzere dört swerve modülünün durumunu gösterir.

<img src="/img/tab-reference/swerve-1.webp" alt="Swerve sekmesine genel bakış" />

_Yukarıda İngilizce arayüz gösteriliyor._

<details>
<summary>Zaman çizelgesi kontrolleri</summary>

Zaman çizelgesi, oynatmayı ve görselleştirmeyi kontrol etmek için kullanılır. Zaman çizelgesine tıklayarak bir zaman seçebilir, sağ tıklayarak seçimi kaldırabilirsiniz. Seçilen zaman tüm sekmeler arasında senkronize edilir; böylece aynı anı diğer görünümlerde de hızlıca bulabilirsiniz.

Sarı bölümler robotun otonomda, mavi bölümler teleop'ta ve gri bölümler test modunda olduğu zamanları gösterir.

Yakınlaştırmak için imleci zaman çizelgesinin üzerine getirin ve yukarı veya aşağı kaydırın. `Shift` tuşunu basılı tutarken tıklayıp sürükleyerek bir aralık da seçebilirsiniz. Yatay kaydırma yaparak (desteklenen cihazlarda) veya zaman çizelgesi üzerinde tıklayıp sürükleyerek sola ve sağa hareket edebilirsiniz. Canlı bağlantıdayken sola kaydırmak mevcut zamandan kilidi açar, en sağa kadar kaydırmak ise tekrar mevcut zamana kilitler. Robotun etkin olduğu aralığa yakınlaştırmak için `Ctrl+\` tuşlarına basın.

<img src="/img/tab-reference/timeline.webp" alt="Zaman çizelgesi" />

</details>

## Kaynak ekleme {#adding-sources}

Başlamak için bir alanı “Kaynaklar” bölümüne sürükleyin. X düğmesine tıklayarak bir kaynağı silebilir, göz simgesine tıklayarak veya alan adına çift tıklayarak geçici olarak gizleyebilirsiniz. Tüm kaynakları kaldırmak için başlığın yanındaki çöp kutusuna ve ardından `Tümünü temizle` seçeneğine tıklayın. Kaynakların listedeki sırasını tıklayıp sürükleyerek değiştirebilirsiniz.

**Her kaynağı özelleştirmek için renkli simgeye tıklayın veya alan adına sağ tıklayın.** AdvantageScope üç kaynak türünü destekler:

- **Modül hızları:** Diyagram üzerinde vektörler olarak görüntülenen dört swerve modülü durumundan oluşan küme.
- **Robot hızları:** Diyagramın merkezinde görüntülenen doğrusal ve açısal hızlar.
- **Rotasyon:** Diyagramı döndürmek için kullanılan açısal konum.

## Veri formatı {#data-format}

Veriler, `SwerveModuleVelocity[]`, `ChassisVelocities`, `Rotation2d` veya `Rotation3d` türleri kullanılarak bayt kodlu (byte-encoded) struct veya protobuf formatında yayınlanmalıdır.

WPILib ve AdvantageKit dahil birçok kütüphane struct formatını destekler. Aşağıdaki örnek kod, Java'da swerve modül durumlarının nasıl loglanacağını gösterir.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Telemetry.log("MyStates", states);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

:::note
2027'de bu veri yapısı `SwerveModuleState`'ten `SwerveModuleVelocity` olarak yeniden adlandırıldı.
WPILib 2027 ve Systemcore'dan önce oluşturulan log dosyaları için eski `SwerveModuleState` türleri görselleştirme amacıyla hâlâ desteklenir.
:::

## Yapılandırma {#configuration}

Aşağıdaki yapılandırma seçenekleri mevcuttur:

- **Maksimum hız:** Modüllerin ulaşabileceği maksimum hız; vektörlerin boyutunu ölçeklemek için kullanılır.
- **Çerçeve boyutu:** Sol-sağ ve ön-arka swerve modülleri arasındaki mesafeler. Robot diyagramının en boy oranını değiştirir.
- **Yönelim:** Robot diyagramının baktığı yönü ayarlar. Bu seçenek genellikle poz verileriyle veya maç videolarıyla hizalama yapmak için kullanışlıdır.

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
