---
sidebar_position: 3
---

# NetworkTables verilerini yayınlama {#publishing-networktables-data}

AdvantageScope, bir log dosyasında saklanan NetworkTables verilerini bir simülatör veya robot gibi bir NetworkTables sunucusuna geri yayınlayabilir. Bunu şu gibi amaçlarla kullanabilirsiniz:

- Hata ayıklamak için maçları simülasyonda yeniden oynatmak
- Gerçek bir robotta yardımcı işlemciden (coprocessor) gelen verileri taklit etmek
- Gerçekçi maç verileriyle sürücü gösterge paneli uygulamalarını test etmek ve hata ayıklamak

Bu özellik için NetworkTables verilerinin tam kaydını içeren bir log dosyası gerekir; bunu WPILib’in [yerleşik veri loglayıcısı](https://docs.wpilib.org/tr/stable/docs/software/telemetry/datalog.html) ile oluşturabilirsiniz. AdvantageKit bu özelliği desteklemez; çünkü onun yerine simülasyonda çok daha kapsamlı, deterministik yeniden oynatma imkânı sunar.

## Başlarken {#getting-started}

Veri yayınlamaya başlamak için önce NetworkTables verileri içeren bir log dosyası açın. Ardından:

- **Robota yayınla:** `Dosya` > `NT verilerini yayınla` > `Robota bağlan` seçeneğine tıklayın.
- **Simülatöre yayınla:** `Dosya` > `NT verilerini yayınla` > `Simülatöre bağlan` seçeneğine tıklayın.

Pencerenin üst kısmında veri yayınının durumunu göstermek için “Aranıyor” veya “Yayınlanıyor” yazısı görünür. Bağlantı koparsa AdvantageScope aynı ayarlarla otomatik olarak yeniden bağlanmayı dener.

Tüm alanlar, birçok AdvantageScope sekmesinin kullandığı _seçili zaman damgasındaki_ değerleriyle yayınlanır. Böylece AdvantageScope içindeki oynatma mekanizmasını kullanarak ağ üzerinden gerçek zamanlı oynatma yapabilirsiniz. Ayrıntılar için [Uygulama gezinmesi](/overview/navigation) sayfasına göz atabilirsiniz. Eğer hiçbir zaman damgası seçili değilse, alanlar _üzerine gelinen zaman damgasındaki_ değerleriyle yayınlanır.

Yayınlamayı durdurmak için `Dosya` > `NT verilerini yayınla` > `Yayınlamayı durdur` seçeneğine tıklayın.

## Alanları filtreleme {#filtering-fields}

Varsayılan olarak AdvantageScope, log dosyasındaki tüm NetworkTables alanlarını yayınlar (sunucunun yayınladığı meta başlıklar hariç). Ancak yardımcı işlemciyi taklit etmek gibi bazı senaryolarda yalnızca belirli alanları veya alt tabloları yayınlamak isteyebilirsiniz. İzin verilen alan ön eklerini ayarlamak için `Uygulama` > `Tercihleri göster...` (Windows/Linux) veya `AdvantageScope` > `Ayarlar...` (macOS) yolunu izleyerek tercihler penceresini açın.

“NT yayın ön ekleri” ayarı, NetworkTables’a yayınlanacak alanların ön eklerini belirler. Boş bırakırsanız tüm alanlar yayınlanır. İsterseniz virgülle ayrılmış bir ön ek veya alan listesi girebilirsiniz. Aşağıdaki örneklere göz atın:

- “_Telemetry_”: “Telemetry” tablosundaki tüm alanları dahil eder.
- “_Telemetry/Drive_”: Yalnızca “Telemetry/Drive” tablosunu dahil eder.
- “_limelight/tx,limelight/ty_”: Yalnızca “limelight/tx” ve “limelight/ty” alanlarını dahil eder.

## Sınırlamalar {#limitations}

:::warning

- Alanlar her 20 ms’de bir yayınlanır; dolayısıyla daha yüksek frekansta kaydedilmiş NetworkTables verilerinde bazı örnekler atlanır.
- Yayınlanan örneklerin zaman damgaları korunmaz. Zaman içinde ileri geri sararken veya farklı hızlarda oynatırken bu zaten mümkün değildir.
  :::
