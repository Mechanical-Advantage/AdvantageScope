---
sidebar_position: 1
---

# 👋 Merhaba, telemetri!

AdvantageScope'a hoş geldiniz! Telemetri ve veri loglama; robot kodunu anlama, sorunları teşhis etme ve sahada veya saha dışında çözümler üretme yeteneğinizi geliştiren güçlü araçlardır. Bu eğitimler, AdvantageScope'un tüm özelliklerinden yararlanabilmeniz için telemetriye hızlı bir başlangıç yapmanıza yardımcı olmak üzere tasarlanmıştır.

Bu eğitimde şunları öğreneceksiniz:

- Bir Java WPILib projesinde temel robot telemetrisi kurma.
- AdvantageScope'ta canlı veri akışlarına bağlanma.
- Daha sonra erişmek üzere verileri log dosyalarına kaydetme.
- AdvantageScope kullanarak telemetri verilerini görselleştirme.

:::tip Başka bir şey mi arıyorsunuz?

- **FTC Takımları:** Mevcut FIRST Tech Challenge kontrol sistemini kullanıyorsanız ✴️ [FTC Uyumluluğu](/more-features/ftc-compatibility) rehberine göz atın.
- **Web Arayüzü:** AdvantageScope'un tarayıcı tabanlı sürümü doğrudan FIRST Driver Station ve Systemcore web arayüzünde mevcuttur. Ayrıntılar için 💡 [AdvantageScope Lite](/more-features/advantagescope-lite) sayfasına bakın.
- **AdvantageKit:** Simülasyonda deterministik yeniden oynatma için tasarlanmış gelişmiş bir loglama framework'üdür. Ayrıntılar için [belgelere](https://docs.advantagekit.org) bakın. Aşağıda açıklanan WPILib'in yerleşik telemetri API'siyle başlamanızı öneririz.
  :::

## 1. Yeni bir WPILib projesi oluşturun

Başlamak için VS Code'da yeni bir WPILib Java projesi oluşturun:

1. VS Code'u açın.
2. Sağ üstteki WPILib simgesine tıklayın (veya `Ctrl+Shift+P` / `Cmd+Shift+P` tuşlarına basıp **WPILib: Create a new project** yazın).
3. **Template** > **Java** > **Command v3 Robot** (veya **Command v2 Robot**) seçeneğini seçin.
4. Bir klasör seçin, projenize bir ad verin (ör. `HelloTelemetry`) ve takım numaranızı girin.
5. **Enable Desktop Support** seçeneğini işaretleyin ve **Create Project** düğmesine tıklayın.

<img src="/img/tutorials/hello-telemetry-1.webp" alt="VS Code'da WPILib Project Creator kullanarak yeni bir WPILib Java projesi oluşturma." />

_Yukarıda İngilizce arayüz gösteriliyor._

## 2. Veri loglamayı başlatın

WPILib, `DataLogManager` aracılığıyla yerleşik veri loglama sağlar. Başlatıldığında tüm telemetriyi, NetworkTables girişlerini ve Sürücü İstasyonu girişlerini otomatik olarak `.wpilog` dosyalarına kaydeder.

:::info Öneri
Loglar Systemcore'un dahili depolamasına kaydedilebilse de dahili flash bellek sınırlıdır. Systemcore üzerindeki USB bağlantı noktalarından birine standart **FAT32 biçimli bir USB flash sürücü** takmanızı önemle öneririz. `DataLogManager` sürücüyü algılayacak ve tüm logları otomatik olarak doğrudan USB sürücüye yazacaktır.
:::

`src/main/java/first/robot/Robot.java` dosyasını açın ve `Robot()` yapıcı metodu içinde `DataLogManager`'ı başlatın:

```java
public class Robot extends OpModeRobot {
  // ...

  public Robot() {
    // Tüm telemetriyi USB bellekteki bir .wpilog dosyasına kaydetmek için DataLogManager'ı başlatın
    DataLogManager.start();

    // Sürücü İstasyonu verilerini de kaydedin (joystickler, OpMode, etkinleştirme durumu)
    DriverStation.startDataLog(DataLogManager.getLog());
  }

  // ...
}
```

## 3. Telemetri verilerini yayınlayın

WPILib'in `Telemetry` sınıfı, alanları hiyerarşik tablolarda düzenleyerek tek bir kod satırıyla veri yayınlamanızı sağlar. Bu API; sayısal değerler, booleanlar, metinler, diziler ve WPILib [geometri türleri](https://docs.wpilib.org/tr/stable/docs/software/advanced-controls/geometry/index.html) dahil çok çeşitli veri türlerini destekler.

:::info
WPILib'deki `Telemetry` sınıfı, FTC SDK'daki `Telemetry` sınıfından farklıdır. WPILib'in `Telemetry` sınıfı, robot programından dashboardlara, hata ayıklama araçlarına veya log dosyalarına bilgi gönderir. Yerleşik Sürücü İstasyonu ekranını güncellemek için WPILib'in `DriverStationDisplay` sınıfını kullanın.
:::

`src/main/java/first/robot/ExampleTeleop.java` dosyasını güncelleyin:

```java
@Teleop
public class ExampleTeleop implements OpMode {
  // ...

  @Override
  public void periodic() {
    double currentTime = Timer.getTimestamp();
    double sineWave = Math.sin(currentTime * 2.0);

    // Telemetry API'sini kullanarak telemetri değerlerini yayınlayın
    Telemetry.log("Time", currentTime);
    Telemetry.log("SineWave/Value", sineWave);
    Telemetry.log("SineWave/Low", sineWave < 0.5);
  }
}
```

Kodu robotunuza yükleyin (veya VS Code'dan `WPILib: Simulate Robot Code` komutunu çalıştırın). Simülasyonda `Teleoperated` > `ExampleTeleop` > `Enable` seçeneklerine tıklayın.

<img src="/img/tutorials/hello-telemetry-2.webp" alt="Simülatör arayüzünde ExampleTeleop OpMode'unu etkinleştirme." height="200" />

_Yukarıda İngilizce arayüz gösteriliyor._

:::tip
Yeni telemetri verileri yalnızca `Telemetry.log` çağrıldığında yayınlanır. `Robot` sınıfındaki, OpMode'lardaki, alt sistemlerdeki ve mekanizmalardaki periyodik metotlar farklı koşullar altında etkin olabilir; loglama çağrılarını nereye yerleştireceğinize karar verirken API belgelerini dikkatlice inceleyin.
:::

## 4. AdvantageScope'u canlı bağlayın

AdvantageScope masaüstü uygulamasını başlatın. Üst menüden `Dosya` > `Robota bağlan` > `NetworkTables` (veya simülasyon yapıyorsanız `Dosya` > `Simülatöre bağlan`) seçeneğini seçin. Bağlandıktan sonra sol kenar çubuğu `NT:/Telemetry` altında yayınlanan alanlarla dolacaktır.

:::tip Klavye Kısayolları
Robota hızlıca bağlanmak için `Ctrl+K` / `Cmd+K`, simülatöre bağlanmak için `Ctrl+Shift+K` / `Cmd+Shift+K` tuşlarına basın.
:::

<img src="/img/tutorials/hello-telemetry-3.webp" alt="Kenar çubuğu ağacında listelenen alanlarla canlı robot akışına bağlı AdvantageScope." />

_Yukarıda İngilizce arayüz gösteriliyor._

## 5. Telemetri verilerini görselleştirin

### Çizgi grafik

📉 [Çizgi grafik](/tab-reference/line-graph), AdvantageScope'taki varsayılan sekmedir ve sayısal ve ayrık değerlerin gerçek zamanlı çizimini sağlar.

1. Sol kenar çubuğunda `Telemetry` > `SineWave` altına bakın.
2. `Value` alanını kontrol panelindeki “Sol eksen” alanına sürükleyin.
3. `Low` alanını kontrol panelindeki “Ayrık alanlar” alanına sürükleyin.
4. “Ayrık alanlar” yanındaki üç noktaya ve ardından “Robot modunu göster” seçeneğine tıklayın.

Veriler aktıkça sinüs dalgasının ve robot durumunun gerçek zamanlı güncellendiğini göreceksiniz!

:::info Grafikle Etkileşim

- **Duraklat / Kaydır:** Geçmiş verileri görmek için yatay kaydırın veya grafik üzerinde tıklayıp sürükleyin. Sağ üstteki kırmızı ok, canlı otomatik kaydırmanın duraklatıldığını gösterir. Canlı otomatik kaydırmayı açıp kapatmak için oka tıklayın veya `L` tuşuna basın.
- **Yakınlaştır:** Grafik üzerinde yukarı/aşağı kaydırın veya belirli bir zaman aralığına yakınlaştırmak için `Shift` tuşunu basılı tutarak sürükleyin.
- **Değerleri İncele:** Zaman imleci yerleştirmek ve göstergede tam değerleri görmek için grafiğin herhangi bir yerine tıklayın.
  :::

<img src="/img/tutorials/hello-telemetry-4.webp" alt="Sinüs dalgası sinyalini çizen çizgi grafik." />

_Yukarıda İngilizce arayüz gösteriliyor._

### Tablo

🔢 [Tablo](/tab-reference/table) sekmesi, durum ve değer değişikliklerinin kronolojik bir tablosunu görüntüler; geçişleri ve olay dizilerini teşhis etmek için idealdir.

1. Üst sekme çubuğundaki **+** düğmesine tıklayın ve **Tablo**yu seçin.
2. Kenar çubuğundan `NT:/Telemetry/SineWave/Value` ve `NT:/Telemetry/Low` alanlarını tablo görünümüne sürükleyin.
3. Görüntülenen herhangi bir alanın değeri her değiştiğinde otomatik olarak yeni bir satır eklenir.
4. Tüm açık sekmeleri hemen o tam ana atlatmak için herhangi bir satıra tıklayın!

:::tip
Sekmeler, sekme çubuğu kullanılarak yeniden düzenlenebilir ve yeniden adlandırılabilir. Bir sekmeyi ayrı bir pencerede açmak ve birden fazla sekmeyi yan yana görüntülemek için başlık çubuğundaki pencere düğmesine tıklayın.
:::

<img src="/img/tutorials/hello-telemetry-5.webp" alt="Sinüs dalgası verilerini gösteren Tablo sekmesi." />

_Yukarıda İngilizce arayüz gösteriliyor._

### İstatistikler

📊 [İstatistikler](/tab-reference/statistics) sekmesi sayısal değerlerin bir histogramını görüntüler ve bir veya daha fazla alandan gelen verilere ayrıntılı bir bakış sunar.

1. Üst sekme çubuğundaki **+** düğmesine tıklayın ve **İstatistikler**i seçin.
2. Kenar çubuğundan `NT:/Telemetry/SineWave/Value` alanını “Ölçümler” bölümüne sürükleyin.
3. “Veri aralığı”nı `-1` ve `1` olarak, “Adım boyutu”nu `0.1` olarak ayarlayın.
4. Histogram ve özet istatistikleri kullanarak verileri inceleyin.
5. Dahil edilecek veri aralığını ayarlamak için üstteki zaman çizelgesini kaydırın.

<img src="/img/tutorials/hello-telemetry-6.webp" alt="Sinüs dalgası verilerini gösteren İstatistikler sekmesi." />

_Yukarıda İngilizce arayüz gösteriliyor._

## 6. Log dosyalarını indirin ve açın

Testlerden veya bir maçtan sonra, verileri sonradan incelemek için robottan `.wpilog` dosyalarını indirebilirsiniz:

1. Menü çubuğunda `Dosya` > `Logları indir...` seçeneğini seçin.
2. AdvantageScope robota bağlanır ve kaydedilen tüm log dosyalarını listeler (en yeniler en üstte).
3. İncelemek istediğiniz log dosyalarını seçin, indirme (↓) simgesine tıklayın ve bilgisayarınızda bir klasör seçin.
4. İndirilen dosyayı `Dosya` > `Log aç...` ile veya `.wpilog` dosyasını doğrudan AdvantageScope'un içine sürükleyerek açın.

<img src="/img/overview/log-files/open-file-2.webp" alt="Robot depolamasındaki mevcut WPILOG dosyalarını gösteren indirme penceresi." height="350" />

_Yukarıda İngilizce arayüz gösteriliyor._

## Sırada ne var?

Artık temel telemetri ve loglama çalıştığına göre, görselleştirmenizi bir üst seviyeye taşıyın:

- **🤖 [Sahaya: Robot Görselleştirme](/tutorials/to-the-field):** FRC ve FTC saha modellerinde 2B/3B robot konumlarını, yörüngeleri ve mekanizmaları nasıl görselleştireceğinizi öğrenin.
- **[Genel bakış](/category/overview):** Dosya yönetimi, gezinme kısayolları ve canlı akış seçenekleri hakkında kapsamlı bir rehber.
- **[Birim desteği](/tab-reference/line-graph/units):** Daha hassas görselleştirme için loglarınıza birim üst verilerini nasıl entegre edeceğinizi öğrenin.
- **💬 [Konsol](/tab-reference/console):** WPILib'in `DataLogManager` sınıfı tarafından kaydedilen metin loglarını görselleştirin.
- **🔍 [Üst veri](/tab-reference/metadata):** Log dosyalarını tanımlamak ve kategorize etmek için ek bilgiler kaydedin.
- **[Epilogue](https://docs.wpilib.org/tr/stable/docs/software/telemetry/robot-telemetry-with-annotations.html):** Ek açıklamalar (annotations) kullanarak Java'da telemetri kaydedin.
