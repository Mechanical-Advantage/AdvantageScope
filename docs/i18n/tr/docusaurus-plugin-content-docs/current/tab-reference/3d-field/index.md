import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 👀 3B saha {#3d-field}

3B saha sekmesi, robotun ve sahanın 3B görselleştirmesini gösterir. Normal 2B pozlarla da kullanabilirsiniz; ancak özellikle 3B hesaplamalarla (örneğin AprilTag'lerle konum belirleme) çalışırken çok işinize yarar. Saha odaklı, robot odaklı ve sabit kamera gibi birden fazla kamera görünümü sunar. [AdvantageScope XR](advantagescope-xr) ile bu sekmeyi artırılmış gerçeklik üzerinden de görüntüleyebilirsiniz. Zaman çizelgesi robotun ne zaman etkin olduğunu gösterir ve log verileri arasında gezinmenizi sağlar.

<img src="/img/tab-reference/3d-field/3d-field-1.webp" alt="3B saha sekmesi örneği" />

_Yukarıda İngilizce arayüz gösterilmiştir._

<details>
<summary>Zaman çizelgesi kontrolleri</summary>

Zaman çizelgesi, oynatmayı ve görselleştirmeyi kontrol etmenizi sağlar. Zaman çizelgesine tıklayarak bir anı seçebilir, sağ tıklayarak seçimi kaldırabilirsiniz. Seçilen zaman tüm sekmelerde senkronize edildiği için aynı anı diğer görünümlerde de kolayca bulabilirsiniz.

Sarı bölümler robotun otonomda, mavi bölümler teleop modunda, gri bölümler ise test modunda olduğu aralıkları gösterir.

Yakınlaştırmak için imleci zaman çizelgesinin üzerine getirip yukarı veya aşağı kaydırın. `Shift` tuşunu basılı tutarak tıklayıp sürüklediğinizde belirli bir aralığı da seçebilirsiniz. Yatay kaydırma yaparak (desteklenen cihazlarda) veya zaman çizelgesini tıklayıp sürükleyerek sağa ve sola hareket edebilirsiniz. Canlı bağlantıdayken sola kaydırmak mevcut zamandaki kilidi açar, en sağa kadar kaydırmak ise tekrar mevcut zamana kilitler. Robotun etkin olduğu aralığa yakınlaştırmak için `Ctrl+\` tuşlarına basın.

<img src="/img/tab-reference/timeline.webp" alt="Zaman çizelgesi" />

</details>

:::warning 2026-2027 FTC Sahası
2026-2027 FTC saha modelinde yerleşik AprilTag'ler bulunmaz; çünkü maç sırasında kovan (hive) üzerindeki etiketlerin konumlarının değişmesi beklenir. Takımlar, sahaya dinamik AprilTag nesneleri eklemek için bir `Pose3d[]` ve `number[]` yayınlayabilir. Bu saha için doğru AprilTag boyutu **3,25 inç**tir.
:::

:::warning 2026 FRC Sahası
2026 FRC saha modeli, **kaynaklı (welded)** sahanın AprilTag düzeniyle uyumludur. Kaynaklı ve AndyMark sahaları arasındaki farklar çok küçüktür; ancak AndyMark saha düzenine dayalı AprilTag pozlarını görselleştirirken küçük (~0,5 inç) hizalama farkları görebilirsiniz.
:::

## Nesneler ekleme {#adding-objects}

Başlamak için bir alanı “Pozlar” bölümüne sürükleyin. Bir nesneyi X düğmesiyle silebilir; göz simgesine tıklayarak ya da alan adına çift tıklayarak geçici olarak gizleyebilirsiniz. Tüm nesneleri kaldırmak için bölüm başlığının yanındaki çöp kutusuna ve ardından `Tümünü temizle` seçeneğine tıklayın. Nesneleri listede tıklayıp sürükleyerek yeniden sıralayabilirsiniz.

**Her bir nesneyi özelleştirmek için renkli simgeye tıklayın veya alan adına sağ tıklayın.** AdvantageScope, çoğu özelleştirilebilen (örneğin renkleri ve robot modellerini değiştirebileceğiniz) çok sayıda nesne türünü destekler. Bazı nesnelerin mevcut bir nesnenin altına alt öge olarak eklenmesi gerekir.

:::tip
Desteklenen nesne türlerinin tam listesini görmek için `?` simgesine tıklayın. Bu listede desteklenen veri türlerini ve nesnelerin alt öge olarak eklenmesinin gerekip gerekmediğini de görebilirsiniz.
:::

:::info
AdvantageScope, FTC sahaları için farklı AprilTag boyutlarını destekler. Boyutlar, etrafındaki zorunlu beyaz kenarlık hariç, **AprilTag'in siyah bölümünün kenar uzunluğu** olarak ölçülür.
:::

## Veri formatı {#data-format}

Geometri verileri bayt kodlu struct veya protobuf olarak yayınlanmalıdır. `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` ve daha fazlası dahil olmak üzere çeşitli 2B ve 3B geometri türleri desteklenir.

WPILib ve AdvantageKit dahil birçok kütüphane struct formatını destekler. Aşağıdaki örnek kod, Java'da 3B poz verilerinin nasıl loglanacağını gösterir.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose3d[] {poseA, poseB});
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose3d[] {poseA, poseB});
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
```

</TabItem>
</Tabs>

## Mekanizmalar ve bileşenler {#mechanisms-and-components}

Mekanizma verilerini 2B mekanizmalar veya eklemli 3B bileşenler kullanarak görselleştirebilirsiniz.

### 2B mekanizmalar {#2d-mechanisms}

Bir [`Mechanism2d`](https://docs.wpilib.org/tr/stable/docs/software/dashboards/glass/mech2d-widget.html) kullanarak logladığınız mekanizma verilerini görselleştirmek için mekanizma alanını mevcut bir robot veya hayalet nesnesinin altına ekleyin. Mekanizma, aşağıda gösterildiği gibi basit kutular halinde robotun XZ veya YZ düzlemine yansıtılır. XZ ve YZ düzlemleri arasında geçiş yapmak için dişli simgesine tıklayın veya alan adına sağ tıklayın. Robotun orijini mekanizmanın alt kenarının ortasında yer alır.

<img src="/img/tab-reference/3d-field/3d-field-2.webp" alt="2B mekanizma" />

### 3B bileşenler {#3d-components}

:::warning
3B bileşenleri ayarlamak karmaşık ve zaman alıcı olabilir. 3B sahada mekanizmaları görselleştirmek için daha pratik bir yol sunan, yukarıda açıklanan AdvantageScope `Mechanism2d` desteğini kullanmayı değerlendirebilirsiniz.
:::

Her bileşenin robota göre konumunu temsil eden bir 3B poz dizisi loglayarak mekanizmaları eklemli bileşenlerle görselleştirebilirsiniz. Pozları mevcut bir robot veya hayalet nesnesinin altına ekleyin ve nesne türünü “Bileşen” olarak seçin.

Her bileşen bağımsız olarak hareket edebilir (örneğin asansör taşıyıcısı, kol veya uç efektör (end effector)). AdvantageKit kullanıyorsanız bir `Mechanism2d` nesnesini `Pose3d` dizisine dönüştürmek için [`generate3dMechanism()`](https://docs.advantagekit.org/data-flow/supported-types#mechanisms-output-only) metodunu kullanabilirsiniz. Robotları bileşenlerle yapılandırma hakkında daha fazla bilgi için [Özel varlıklar](/more-features/custom-assets) bölümüne bakın.

<img src="/img/tab-reference/3d-field/3d-field-3.webp" alt="3B mekanizma" />

## Oyun objesi nesneleri {#game-piece-objects}

Her sahada oyun objesi nesne türleri bulunur; böylece robot kodunuzun yayınladığı verileri kullanarak oyun objelerini sahanın herhangi bir yerinde gösterebilirsiniz. Bunun birçok kullanım alanı vardır:

- Basit animasyonlarla simüle edilmiş otonom rutinlerin adımlarını görselleştirme
- Sahada tespit edilen oyun objelerinin konumlarını gösterme
- Oyun objelerinin robotun içinde nerede bulunduğunu belirtme
- Fizik hesaplamalarına dayalı atış yörüngelerini görüntüleme

Bir diğer basit kullanım şekli ise sensör verilerine göre robotun içindeki oyun objelerinin durumunu göstermektir. Örneğin, 2024 robotunda nota yolundaki bir ışın kesme (beam break) sensörü, robotun içinde bir notanın görünmesini sağlayabilir (aşağıda gösterildiği gibi).

<details>
<summary>Kod Örneği</summary>

AdvantageKit KitBot 2024 örnek projesi, robottan Speaker'a doğru giden bir notayı canlandıran basit bir [komut](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/util/NoteVisualizer.java) örneği içerir. Bu komut standart [fırlatma sekansına](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/subsystems/launcher/Launcher.java#L73) dahil edilmiştir ve her nota fırlatıldığında animasyonu tetikler. [Bu video](https://youtube.com/shorts/-HxfDo9f19U?feature=share), farklı oyunlar için otonom rutinleri görselleştirmede oyun objesi animasyonlarının nasıl kullanılabileceğini gösterir.

</details>

<img src="/img/tab-reference/3d-field/3d-field-4.webp" alt="2024 KitBot nota görselleştirmesi" />

## Kamera seçenekleri {#camera-options}

Kamera modunu değiştirmek için 3B saha görünümüne sağ tıklayın. Kamera modu ve konumu ayrılmış her pencere için bağımsız olarak kontrol edilir; böylece kolayca çoklu kamera görünümleri oluşturabilirsiniz.

:::info
Yörünge ve Sürücü İstasyonu kameralarının FOV değerini ayarlamak için saha görünümüne sağ tıklayın ve “FOV ayarla” seçeneğine tıklayın.
:::

### Saha etrafında dön {#orbit-field}

Bu, kamerayı sahaya göre serbestçe hareket ettirebildiğiniz varsayılan kamera modudur. **Sol tık + sürükle** kamerayı döndürür, **sağ tık + sürükle** kamerayı kaydırır. Yakınlaşıp uzaklaşmak için **fare tekerleğini kaydırın**.

:::tip
Kamerayı klavyeyle de kontrol edebilirsiniz. **WASD** tuşları yatay hareket, **IJKL** tuşları döndürme, **E** ve **Q** tuşları ise dikey hareket içindir.
:::

### Robot etrafında dön {#orbit-robot}

Bu mod “Saha etrafında dön” moduyla aynı kontrollere sahiptir, ancak kameranın konumu robota göre kilitlidir. Bu sayede robotun hareketini takip eden çekimler elde edebilirsiniz.

### Sürücü İstasyonu {#driver-station}

Bu mod, kamerayı sürücü istasyonlarından birinin arkasına, tipik göz hizasına kilitler. Görüntülemek istediğiniz istasyonu manuel olarak seçebilir veya log verilerindeki ittifak ve istasyon numarasını kullanmak için “Otomatik” seçeneğini seçebilirsiniz.

:::warning
AdvantageKit 2023 veya daha eski sürümlerle üretilen log verilerini görüntülerken istasyon numarasının otomatik seçimi hatalı olabilir.
:::

### Sabit kamera {#fixed-camera}

Her robot modelinde görüntü işleme (vision) ve sürücü kameraları gibi sabit kameralar tanımlıdır. Bu kameraların sabit konumları, en boy oranları ve FOV değerleri vardır. Bu görünümler genellikle görüntü işleme verilerini kontrol etmek veya sürücü kamerası görünümünü simüle etmek için çok kullanışlıdır. Aşağıdaki örnekte bir sürücü kamerası gösterilmiştir.

<img src="/img/tab-reference/3d-field/3d-field-5.webp" alt="Sabit kamera" />

Bir “Özel kamera konumu” pozu sağlandığında, tüm sabit kameraların yapılandırılmış FOV ve en boy oranları korunarak varsayılan pozlarının yerini alır. Böylece robot kodunuz, taret veya atıcı başlığı üzerine monte edilmiş hareketli bir kameranın konumunu da sağlayabilir.

:::info
Diğer poz verileriyle uyumlu olarak, “Özel kamera konumu” pozu robota göre değil, _sahaya göre_ olmalıdır.
:::

## Yapılandırma {#configuration}

Saha modelini açılır menüden seçebilirsiniz. Son dönemdeki tüm FRC ve FTC oyunları desteklenir. Grafik performansı sınırlı cihazlarda “Evergreen” sahalarını kullanmanızı öneririz. “Eksenler” sahaları ise ölçek için bir saha taslağıyla birlikte yalnızca orijinde XYZ eksenlerini gösterir.

:::info
Bu sekmede kullanılan koordinat sistemini özelleştirebilirsiniz. Ayrıntılar için [koordinat sistemi](/more-features/coordinate-systems) sayfasına bakın.
:::

### İşleme modları {#rendering-modes}

3B saha üç işleme modunu destekler:

- **Sinematik (Sol):** Daha gerçekçi bir görünüm için gölgeler, aydınlatma, yansımalar ve yüksek detaylı 3B modeller kullanır. Güçlü bir GPU gerektirir.
- **Standart (Orta):** Varsayılan moddur; minimum aydınlatma ve basitleştirilmiş 3B modeller kullanır. Çoğu cihazda akıcı çalışır.
- **Düşük güç (Sağ):** Pil tüketimini azaltmak ve düşük donanımlı cihazlarda daha kararlı performans elde etmek için kare hızını, çözünürlüğü ve model detayını düşürür.

<img src="/img/tab-reference/3d-field/3d-field-6.webp" alt="İşleme modlarının karşılaştırılması" />

İşleme modunu yapılandırmak için `Uygulama` > `Tercihleri göster...` (Windows/Linux) veya `AdvantageScope` > `Ayarlar...` (macOS) yolunu izleyerek tercihler penceresini açın. Dizüstü bilgisayarınız şarjda değilken kullanılacak işleme modunu değiştirmek için “3B modu (Pil)” ayarını varsayılandan farklı bir moda alabilirsiniz. Örneğin, yarışma sırasında pil tasarrufu yapmak için bu özellik oldukça yararlıdır.

<img src="/img/prefs_tr.webp" alt="Tercihler diyagramı" height="450" />
