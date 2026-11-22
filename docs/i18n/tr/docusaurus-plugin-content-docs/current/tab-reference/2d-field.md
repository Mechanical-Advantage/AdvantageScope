---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 2B saha {#2d-field}

2B saha sekmesi, robotun 2B görselleştirmesini bir saha haritası üzerinde gösterir. Ayrıca kamera hedefleme durumu ve referans pozları gibi ek verileri de görüntüleyebilirsiniz.

<img src="/img/tab-reference/2d-field-1.webp" alt="2B saha sekmesine genel bakış" />

_Yukarıda İngilizce arayüz gösterilmiştir._

<details>
<summary>Zaman çizelgesi kontrolleri</summary>

Zaman çizelgesi, oynatmayı ve görselleştirmeyi kontrol etmenizi sağlar. Zaman çizelgesine tıklayarak bir anı seçebilir, sağ tıklayarak seçimi kaldırabilirsiniz. Seçilen zaman tüm sekmelerde senkronize edildiği için aynı anı diğer görünümlerde de kolayca bulabilirsiniz.

Sarı bölümler robotun otonomda, mavi bölümler teleop modunda, gri bölümler ise test modunda olduğu aralıkları gösterir.

Yakınlaştırmak için imleci zaman çizelgesinin üzerine getirip yukarı veya aşağı kaydırın. `Shift` tuşunu basılı tutarak tıklayıp sürüklediğinizde belirli bir aralığı da seçebilirsiniz. Yatay kaydırma yaparak (desteklenen cihazlarda) veya zaman çizelgesini tıklayıp sürükleyerek sağa ve sola hareket edebilirsiniz. Canlı bağlantıdayken sola kaydırmak mevcut zamandaki kilidi açar, en sağa kadar kaydırmak ise tekrar mevcut zamana kilitler. Robotun etkin olduğu aralığa yakınlaştırmak için `Ctrl+\` tuşlarına basın.

<img src="/img/tab-reference/timeline.webp" alt="Zaman çizelgesi" />

</details>

## Kamera kontrolleri {#camera-controls}

Yakınlaşıp uzaklaşmak için sahanın üzerinde yukarı veya aşağı kaydırın. Sahayı kaydırmak için tıklayıp sürükleyin. Aşağıdaki seçenekleri içeren kamera menüsünü açmak için sahanın herhangi bir yerine sağ tıklayın:

- **Kilitsiz**: Kaydırma ve yakınlaştırma manueldir.
- **Robota kilitli**: Kamera, robotu takip etmek için otomatik olarak kayar.
- **Robota ve rotasyona kilitli**: Kamera, robotu ve rotasyonunu takip etmek için otomatik olarak kayar ve döner.

Her iki kilitli modda da kamerayı robottan uzağa serbestçe kaydırabilirsiniz. Kontrol panelindeki yönelim düğmelerini kullanarak kamerayı her modda döndürebilirsiniz.

## Nesneler ekleme {#adding-objects}

Başlamak için bir alanı “Pozlar” bölümüne sürükleyin. Bir nesneyi X düğmesiyle silebilir; göz simgesine tıklayarak ya da alan adına çift tıklayarak geçici olarak gizleyebilirsiniz. Tüm nesneleri kaldırmak için eksen başlığının yanındaki çöp kutusuna ve ardından `Tümünü temizle` seçeneğine tıklayın. Nesneleri listede tıklayıp sürükleyerek yeniden sıralayabilirsiniz.

**Her bir nesneyi özelleştirmek için renkli simgeye tıklayın veya alan adına sağ tıklayın.** AdvantageScope, çoğu özelleştirilebilen (örneğin renkleri değiştirilebilen) çok sayıda nesne türünü destekler. Bazı nesnelerin mevcut bir nesnenin alt ögesi olarak eklenmesi gerekir.

:::tip
Desteklenen nesne türlerinin tam listesini görmek için `?` simgesine tıklayın. Bu listede desteklenen veri türlerini ve nesnelerin alt öge olarak eklenmesinin gerekip gerekmediğini de görebilirsiniz.
:::

<img src="/img/tab-reference/2d-field-2.webp" alt="Nesneler içeren 2B saha" />

## Veri formatı {#data-format}

Geometri verileri bayt kodlu struct veya protobuf olarak yayınlanmalıdır. `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` ve daha fazlası dahil olmak üzere çeşitli 2B ve 3B geometri türleri desteklenir.

WPILib ve AdvantageKit dahil birçok kütüphane struct formatını destekler. Aşağıdaki örnek kod, Java'da 2B poz verilerinin nasıl loglanacağını gösterir.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

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

- **Saha:** Kullanılacak saha görseli. Son dönemdeki tüm FRC ve FTC oyunları desteklenir. Özel bir saha görseli eklemek için [Özel Varlıklar](/more-features/custom-assets) bölümüne bakın.
- **Yönelim:** Görüntüleyici panelindeki saha görselinin yönelimi.
- **Boyut:** Robotun kenar uzunluğu (FRC için 30/27/24 inç, FTC için 18/16/14 inç).

:::info
Bu sekmede kullanılan koordinat sistemini özelleştirebilirsiniz. Ayrıntılar için [koordinat sistemi](/more-features/coordinate-systems) sayfasına bakın.
:::
