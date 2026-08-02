import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 👀 3B saha {#3d-field}

3B saha, robotun ve sahanın 3B görselleştirmesini gösterir. Normal 2B pozlarla kullanılabilir, ancak özellikle 3B hesaplamalarıyla çalışırken (AprilTag'ler ile konum belirleme gibi) son derece yararlıdır. Sahaya göre, robota göre ve sabit dahil olmak üzere birden fazla kamera görünümü mevcuttur. [AdvantageScope XR](advantagescope-xr) bu sekmenin artırılmış gerçeklik kullanılarak görselleştirilmesine olanak tanır. Zaman çizelgesi robotun ne zaman etkin olduğunu gösterir ve log verileri arasında gezinmek için kullanılabilir.

<img src="/img/tab-reference/3d-field/3d-field-1.png" alt="Example of 3D field tab" />

<details>
<summary>Zaman Çizelgesi Kontrolleri</summary>

Zaman çizelgesi oynatmayı ve görselleştirmeyi kontrol etmek için kullanılır. Zaman çizelgesine tıklamak bir zaman seçer ve sağ tıklamak seçimi kaldırır. Seçilen zaman tüm sekmeler arasında senkronize edilir, bu da bu konumu diğer görünümlerde hızlıca bulmayı kolaylaştırır.

Sarı bölümler robotun otonomda olduğu zamanları, mavi bölümler robotun teleoperasyonda olduğu zamanları ve gri bölümler robotun test modunda olduğu zamanları gösterir.

Yakınlaştırmak için imleci zaman çizelgesinin üzerine getirin ve yukarı veya aşağı kaydırın. `Shift` tuşunu basılı tutarken tıklayıp sürükleyerek bir aralık da seçilebilir. Yatay olarak kaydırarak (desteklenen cihazlarda) veya zaman çizelgesinde tıklayıp sürükleyerek sola ve sağa hareket edin. Canlı bağlandığında sola kaydırmak mevcut zamandan kilidi kaldırır ve en sağa kadar kaydırmak tekrar mevcut zamana kilitler. Robotun etkin olduğu periyoda yakınlaştırmak için `Ctrl+\` tuşlarına basın.

<img src="/img/tab-reference/timeline.png" alt="Timeline" />

</details>

:::warning
2026 FRC saha modeli, **kaynaklı** saha için AprilTag düzeniyle tutarlıdır. Kaynaklı ve AndyMark sahaları arasındaki farklar çok küçüktür, ancak AndyMark saha düzenine dayalı AprilTag pozları görselleştirilirken küçük (~0.5 inç) hizalama hataları olabilir.
:::

## Nesneler ekleme {#adding-objects}

Başlamak için bir alanı "Pozlar" bölümüne sürükleyin. X düğmesini kullanarak bir nesneyi silin veya göz simgesine tıklayarak ya da alan adına çift tıklayarak geçici olarak gizleyin. Tüm nesneleri kaldırmak için eksen başlığının yanındaki çöp kutusuna ve ardından `Tümünü Temizle` seçeneğine tıklayın. Nesneler listede tıklanıp sürüklenerek yeniden düzenlenebilir.

**Her bir nesneyi özelleştirmek için renkli simgeye tıklayın veya alan adına sağ tıklayın.** AdvantageScope, birçoğu özelleştirilebilen (renkleri ve robot modellerini değiştirme gibi) çok sayıda nesne türünü destekler. Bazı nesnelerin mevcut bir nesneye alt öge olarak eklenmesi gerekir.

:::tip
Desteklenen nesne türlerinin tam listesini görmek için `?` simgesine tıklayın. Bu liste ayrıca desteklenen veri türlerini ve nesnelerin alt öge olarak eklenmesi gerekip gerekmediğini içerir.
:::

:::info
AdvantageScope, FTC sahaları için AprilTag'lerin çeşitli boyutlarını destekler. Boyutlar, gerekli beyaz kenarlık hariç, **AprilTag'in siyah bölümünün kenar uzunluğu** olarak ölçülür.
:::

## Veri formatı {#data-format}

Geometri verileri bayt kodlu struct veya protobuf olarak yayınlanmalıdır. `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` ve daha fazlası dahil olmak üzere çeşitli 2B ve 3B geometri türleri desteklenmektedir.

WPILib ve AdvantageKit dahil olmak üzere birçok kütüphane struct formatını destekler. Aşağıdaki örnek kod Java'da 3B poz verilerinin nasıl loglanacağını göstermektedir.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

StructPublisher<Pose3d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose3d.struct).publish();
StructArrayPublisher<Pose3d> arrayPublisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyPoseArray", Pose3d.struct).publish();

periodic() {
  publisher.set(poseA);
  arrayPublisher.set(new Pose3d[] {poseA, poseB});
}
```

:::tip
WPILib'in [`Field2d`](https://docs.wpilib.org/tr/stable/docs/software/dashboards/glass/field2d-widget.html) sınıfı birden fazla 2B poz verisi kümesini birlikte loglamak için de kullanılabilir.
:::

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

## Mekanizmalar & bileşenler {#mechanisms-and-components}

Mekanizma verileri 2B mekanizmalar veya eklemli 3B bileşenler kullanılarak görselleştirilebilir.

### 2B mekanizmalar {#2d-mechanisms}

Bir [`Mechanism2d`](https://docs.wpilib.org/tr/stable/docs/software/dashboards/glass/mech2d-widget.html) kullanılarak loglanan mekanizma verilerini görselleştirmek için mekanizma alanını mevcut bir robot veya hayalet nesnesine ekleyin. Mekanizma, aşağıda gösterildiği gibi basit kutular kullanılarak robotun XZ veya YZ düzlemine yansıtılır. XZ ve YZ düzlemleri arasında geçiş yapmak için dişli simgesine tıklayın veya alan adına sağ tıklayın. Robotun orijini mekanizmanın alt kenarında merkezlenmiştir.

<img src="/img/tab-reference/3d-field/3d-field-2.png" alt="2D mechanism" />

### 3B bileşenler {#3d-components}

:::warning
3B bileşenlerin kurulumu karmaşık ve zaman alıcı olabilir. 3B sahada mekanizmaları görselleştirmek için daha kolaylaştırılmış bir yaklaşım sunan yukarıda açıklandığı gibi AdvantageScope'un `Mechanism2d` desteğinden yararlanmayı düşünün.
:::

Mekanizmalar, her bileşenin robota göre konumlarını temsil eden bir 3B poz kümesi loglanarak eklemli bileşenlerle görselleştirilebilir. Pozları mevcut bir robot veya hayalet nesnesine ekleyin ve nesne türünü "Bileşen" olarak ayarlayın.

Her bileşen bağımsız olarak hareket ettirilebilir (asansör taşıyıcısı, kol veya uç işlevci gibi). AdvantageKit kullanıcıları, bir Mechanism2d'yi bir Pose3d nesneleri dizisine dönüştürmek için [`generate3dMechanism()`](https://docs.advantagekit.org/data-flow/supported-types#mechanisms-output-only) yöntemini kullanmayı düşünmelidir. Robotların bileşenlerle yapılandırılması hakkında daha fazla bilgi için [Özel Varlıklar](/more-features/custom-assets) bölümüne bakın.

<img src="/img/tab-reference/3d-field/3d-field-3.png" alt="3D mechanism" />

## Oyun objesi nesneleri {#game-piece-objects}

Her saha bir dizi oyun objesi nesne türü içerir; bu da oyun objelerinin robot kodu tarafından yayınlanan veriler kullanılarak sahadaki herhangi bir konumda işlenmesine olanak tanır. Bunun aşağıdakiler dahil çeşitli uygulamaları vardır:

- Basit animasyonlar kullanarak simüle edilmiş otonom rutinlerin eylemlerini görselleştirme
- Sahada tespit edilen oyun objelerinin konumlarını gösterme
- Oyun objelerinin robot içindeki konumlarını belirtme
- Fizik hesaplamalarına dayalı atış yörüngelerini görüntüleme

Başka bir basit kullanım durumu, sensör verilerine dayalı olarak robot içindeki oyun objelerinin durumunu göstermektir. Örneğin, bir 2024 robotu için nota yolu içindeki bir ışın kesme sensörü bir notanın görünmesine neden olabilir (aşağıda gösterildiği gibi).

<details>
<summary>Kod Örneği</summary>

AdvantageKit KitBot 2024 örnek projesi, robottan hoparlöre seyahat eden bir notayı hareket ettiren basit bir [komut](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/util/NoteVisualizer.java) örneği içerir. Bu komut standart [fırlatma sırasına](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/subsystems/launcher/Launcher.java#L73) dahil edilmiştir ve ne zaman bir nota serbest bırakılsa animasyonu tetikler. [Bu video](https://youtube.com/shorts/-HxfDo9f19U?feature=share), oyun objesi animasyonlarının birkaç farklı oyun için otonom rutinleri görselleştirmek üzere nasıl kullanılabileceğini göstermektedir.

</details>

<img src="/img/tab-reference/3d-field/3d-field-4.png" alt="2024 KitBot note visualization" />

## Kamera seçenekleri {#camera-options}

Seçilen kamera modunu değiştirmek için işlenen saha görünümüne sağ tıklayın. Kamera modu ve konumu her ayrılmış pencere için bağımsız olarak kontrol edilir, bu da çoklu kamera görünümlerinin kolayca oluşturulmasına olanak tanır.

:::info
Yörünge ve Sürücü İstasyonu kameralarının FOV değerini ayarlamak için işlenen saha görünümüne sağ tıklayın ve "FOV Düzenle..."ye tıklayın.
:::

### Yörünge saha {#orbit-field}

Bu, kameranın sahaya göre serbestçe hareket ettirilebildiği varsayılan kamera modudur. **Sol tıkla + sürükle** kamerayı döndürür ve **sağ tıkla + sürükle** kamerayı kaydırır. Yakınlaştırmak ve uzaklaştırmak için **kaydırın**.

:::tip
Kamera klavye kullanılarak da kontrol edilebilir. **WASD** tuşları ötelemek, **IJKL** tuşları döndürmek ve **E** ile **Q** tuşları dikey olarak ötelemek için kullanılır.
:::

### Yörünge robot {#orbit-robot}

Bu mod "Yörünge Saha" moduyla aynı kontrollere sahiptir, ancak kameranın konumu robota göre kilitlenmiştir. Bu, robotun hareketinin takip çekimlerine olanak tanır.

### Sürücü İstasyonu {#driver-station}

Bu mod, kamerayı sürücü istasyonlarından birinin arkasına tipik göz hizasında kilitler. Görüntülenecek istasyonu manuel olarak seçin veya log verilerinde saklanan ittifak ve istasyon numarasını kullanmak için "Otomatik"yi seçin.

:::warning
İstasyon numarasının otomatik seçimi AdvantageKit 2023 veya öncesi tarafından üretilen log verileri görüntülenirken yanlış olabilir.
:::

### Sabit kamera {#fixed-camera}

Her robot modeli, görüş ve sürücü kameraları gibi bir dizi sabit kamera ile yapılandırılmıştır. Bu kameralar sabit konumlara, en boy oranlarına ve FOV değerlerine sahiptir. Bu görünümler genellikle görüş verilerini kontrol etmek veya bir sürücü kamerası görünümünü simüle etmek için kullanışlıdır. Aşağıdaki örnekte bir sürücü kamerası gösterilmektedir.

<img src="/img/tab-reference/3d-field/3d-field-5.png" alt="Fixed camera" />

Bir "Kamera Geçersiz Kılma" pozisyonu sağlanırsa, yapılandırılmış FOV değerlerini ve en boy oranlarını korurken tüm sabit kameraların varsayılan pozlarının yerini alır. Bu, robot kodunun bir taret veya atıcı başlığı üzerine monte edilmiş bir kamera gibi hareketli bir kameranın konumunu sağlamasına olanak tanır.

:::info
Diğer poz verileriyle tutarlı olarak, "Kamera Geçersiz Kılma" pozu robota göre değil, _sahaya göre_ olmalıdır.
:::

## Yapılandırma {#configuration}

Saha modeli açılır menü kullanılarak yapılandırılabilir. Son dönemdeki tüm FRC ve FTC oyunları desteklenmektedir. Sınırlı grafik performansına sahip cihazlar için "Evergreen" sahalarını kullanmanızı öneririz. "Eksenler" sahaları, ölçek için bir saha taslağı ile yalnızca orijinde XYZ eksenlerini görüntüler.

:::info
Bu sekmede kullanılan koordinat sistemi özelleştirilebilir. Ayrıntılar için [koordinat sistemi](/more-features/coordinate-systems) sayfasına bakın.
:::

### İşleme modları {#rendering-modes}

3B saha üç işleme modunu destekler:

- **Sinematik:** Daha gerçekçi bir görünüm için gölgeler, aydınlatma, yansımalar ve yüksek detaylı 3B modeller kullanarak işleyin. Oldukça güçlü bir GPU gerektirir.
- **Standart (Varsayılan):** Minimum aydınlatma ve basitleştirilmiş 3B modellerle işleyin. Çoğu cihazda iyi çalışır.
- **Düşük Güç:** Pil tüketimini azaltmak ve alt seviye cihazlarda daha tutarlı performans sağlamak için kare hızını, çözünürlüğü ve model detayını düşürün.

<img src="/img/tab-reference/3d-field/3d-field-6.png" alt="Comparion of rendering modes" />

İşleme modunu yapılandırmak için `Uygulama` > `Tercihleri göster...` (Windows/Linux) veya `AdvantageScope` > `Ayarlar...` (macOS) seçeneğine tıklayarak tercihler penceresini açın. "3B modu (Pil)" ayarı, şarj olmuyorken bir dizüstü bilgisayarda kullanılan işleme modunu geçersiz kılmak için varsayılandan değiştirilebilir. Örneğin bu, yarışmadayken pili korumak için kullanılabilir.

<img src="/img/prefs.png" alt="Diagram of preferences" height="350" />
