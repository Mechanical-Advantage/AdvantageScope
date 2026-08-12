---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 2B saha {#2d-field}

2B saha sekmesi, sahanın bir haritası üzerine çakıştırılmış robotun 2B görselleştirmesini gösterir. Ayrıca görüş hedefleme durumu ve referans pozları gibi ek verileri de gösterebilir.

<img src="/img/tab-reference/2d-field-1.png" alt="2D saha sekmesine genel bakış" />

<details>
<summary>Zaman Çizelgesi Kontrolleri</summary>

Zaman çizelgesi oynatmayı ve görselleştirmeyi kontrol etmek için kullanılır. Zaman çizelgesine tıklamak bir zaman seçer ve sağ tıklamak seçimi kaldırır. Seçilen zaman tüm sekmeler arasında senkronize edilir, bu da bu konumu diğer görünümlerde hızlıca bulmayı kolaylaştırır.

Sarı bölümler robotun otonomda olduğu zamanları, mavi bölümler robotun teleoperasyonda olduğu zamanları ve gri bölümler robotun test modunda olduğu zamanları gösterir.

Yakınlaştırmak için imleci zaman çizelgesinin üzerine getirin ve yukarı veya aşağı kaydırın. `Shift` tuşunu basılı tutarken tıklayıp sürükleyerek bir aralık da seçilebilir. Yatay olarak kaydırarak (desteklenen cihazlarda) veya zaman çizelgesinde tıklayıp sürükleyerek sola ve sağa hareket edin. Canlı bağlandığında sola kaydırmak mevcut zamandan kilidi kaldırır ve en sağa kadar kaydırmak tekrar mevcut zamana kilitler. Robotun etkin olduğu periyoda yakınlaştırmak için `Ctrl+\` tuşlarına basın.

<img src="/img/tab-reference/timeline.png" alt="Zaman çizelgesi" />

</details>

## Nesneler ekleme {#adding-objects}

Başlamak için bir alanı "Pozlar" bölümüne sürükleyin. X düğmesini kullanarak bir nesneyi silin veya göz simgesine tıklayarak ya da alan adına çift tıklayarak geçici olarak gizleyin. Tüm nesneleri kaldırmak için eksen başlığının yanındaki çöp kutusuna ve ardından `Tümünü Temizle` seçeneğine tıklayın. Nesneler listede tıklanıp sürüklenerek yeniden düzenlenebilir.

**Her bir nesneyi özelleştirmek için renkli simgeye tıklayın veya alan adına sağ tıklayın.** AdvantageScope, birçoğu özelleştirilebilen (renkleri değiştirme gibi) çok sayıda nesne türünü destekler. Bazı nesnelerin mevcut bir nesneye alt öge olarak eklenmesi gerekir.

:::tip
Desteklenen nesne türlerinin tam listesini görmek için `?` simgesine tıklayın. Bu liste ayrıca desteklenen veri türlerini ve nesnelerin alt öge olarak eklenmesi gerekip gerekmediğini içerir.
:::

<img src="/img/tab-reference/2d-field-2.png" alt="Nesneler içeren 2D saha" />

## Veri formatı {#data-format}

Geometri verileri bayt kodlu struct veya protobuf olarak yayınlanmalıdır. `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` ve daha fazlası dahil olmak üzere çeşitli 2B ve 3B geometri türleri desteklenmektedir.

WPILib ve AdvantageKit dahil olmak üzere birçok kütüphane struct formatını destekler. Aşağıdaki örnek kod Java'da 2B poz verilerinin nasıl loglanacağını göstermektedir.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

StructPublisher<Pose2d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose2d.struct).publish();
StructArrayPublisher<Pose2d> arrayPublisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyPoseArray", Pose2d.struct).publish();

periodic() {
  publisher.set(poseA);
  arrayPublisher.set(new Pose2d[] {poseA, poseB});
}
```

:::tip
WPILib'in [`Field2d`](https://docs.wpilib.org/tr/stable/docs/software/dashboards/glass/field2d-widget.html) sınıfı birden fazla 2B poz verisi kümesini birlikte loglamak için de kullanılabilir.
:::

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose2d[] {poseA, poseB});
```

</TabItem>
<TabItem value="ftcdashboard" label="FTC Dashboard">

```java
// Bu protokol modern struct formatını desteklemez, ancak poz
// değerleri "x", "y" ve "heading" son eklerini içeren ayrı alanlar
// kullanılarak yayınlanabilir (aşağıda gösterildiği gibi):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // İnç
packet.put("Pose y", 2.8); // İnç
packet.put("Pose heading", 3.14); // Radyan

// Alternatif olarak, yönelimler derece cinsinden yayınlanabilir
packet.put("Pose heading (deg)", 180.0); // Derece

// Diğer telemetri değerlerini buraya ekleyin...

FtcDashboard.getInstance().sendTelemetryPacket(packet)

// Alternatif olarak MultipleTelemetry ve standart SDK telemetrisini kullanın:
// OpMode Başlatma Sırasında:
telemetry = new MultipleTelemetry(telemetry,FtcDashboard.getInstance().getTelemetry());

// Döngü Sırasında:
telemetry.addData("Pose x", 6.3); // İnç
telemetry.addData("Pose y", 2.8); // İnç
telemetry.addData("Pose heading", 3.14); // Radyan

// veya...
telemetry.addData("Pose heading (deg)", 180.0); // Derece

// Diğer telemetri değerlerini buraya ekleyin...
telemetry.update();
```

</TabItem>
</Tabs>

## Yapılandırma {#configuration}

- **Saha:** Kullanılacak saha görseli. Son dönemdeki tüm FRC ve FTC oyunları desteklenmektedir. Özel bir saha görseli eklemek için [Özel Varlıklar](/more-features/custom-assets) bölümüne bakın.
- **Yönelim:** Görüntüleyici panelindeki saha görselinin yönelimi.
- **Boyut:** Robotun kenar uzunluğu (FRC için 30/27/24 inç, FTC için 18/16/14 inç).

:::info
Bu sekmede kullanılan koordinat sistemi özelleştirilebilir. Ayrıntılar için [koordinat sistemi](/more-features/coordinate-systems) sayfasına bakın.
:::
