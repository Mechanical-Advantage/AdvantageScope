---
sidebar_position: 3
---

# NetworkTables Verilerini Yayınlama

AdvantageScope, bir log dosyasında saklanan NetworkTables verilerini bir simülatör veya robot gibi bir NetworkTables sunucusuna tekrar yayınlamayı destekler. Olası kullanım durumları şunlardır:

- Hata ayıklama için maçları simülasyonda yeniden oynatma.
- Gerçek bir robot üzerinde bir yan işlemciden gelen verileri taklit etme.
- Gerçekçi maç verilerini kullanarak sürücü gösterge paneli uygulamalarında hata ayıklama.

Bu özellik, NetworkTables verilerinin tam bir kaydını içeren bir log dosyası gerektirir; bu kayıt WPILib'in [yerleşik veri loglayıcısı](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) kullanılarak oluşturulabilir. AdvantageKit'in bunun yerine simülasyonda daha eksiksiz deterministik yeniden oynatmaya olanak tanıdığından bu özelliği desteklemediğini unutmayın.

## Başlarken

Yayınlamaya başlamak için NetworkTables verilerini içeren bir log dosyası açık olmalıdır. Ardından şu adımları izleyin:

- **Robota Yayınla:** `Dosya` > `NT verilerini yayınla` > `Robota bağlan` seçeneğine tıklayın.
- **Simülatöre Yayınla:** `Dosya` > `NT verilerini yayınla` > `Simülatöre bağlan` seçeneğine tıklayın.

Pencerenin üst kısmı, veri yayınlama durumunu belirtmek için "Aranıyor" veya "Yayınlanıyor" metnini gösterir. AdvantageScope, bağlantı kesildikten sonra aynı ayarları kullanarak otomatik olarak yeniden bağlanmaya çalışır.

Tüm alanlar, birçok AdvantageScope sekmesi tarafından kullanılan _seçili zaman damgasındaki_ saklanan değerleri kullanılarak yayınlanacaktır. Bu, AdvantageScope içindeki oynatmayla aynı mekanizma aracılığıyla gerçek zamanlı ağ oynatılmasına olanak tanır. Daha fazla ayrıntı için [Uygulama Navigasyonu](/overview/navigation) bölümüne bakın. Bir zaman damgası seçilmemişse, alanlar _üzerine gelinen zaman damgasındaki_ saklanan değerleri kullanılarak yayınlanır.

Yayınlamayı durdurmak için `Dosya` > `NT verilerini yayınla` > `Yayınlamayı durdur` seçeneğine tıklayın.

## Alanları Filtreleme

Varsayılan olarak AdvantageScope, log dosyasında saklanan tüm NetworkTables alanlarını yayınlar (sunucu tarafından yayınlanan meta başlıklar hariç). Bir yan işlemciyi taklit etmek gibi bazı kullanım durumları, yalnızca sınırlı bir alan veya alt tablo kümesinin yayınlanmasını gerektirir. İzin verilen alan ön ekleri kümesini ayarlamak için `Uygulama` > `Tercihleri göster...` (Windows/Linux) veya `AdvantageScope` > `Ayarlar...` (macOS) seçeneğine tıklayarak tercihler penceresini açın.

"NT Yayınlama Ön ekleri" seçeneği, NetworkTables'a yayınlanan alanlar için izin verilen ön ekleri ayarlar. Boş bırakılırsa tüm alanlar dahil edilir. Aksi takdirde, virgülle ayrılmış bir ön ek veya alan listesi sağlanabilir. Aşağıdaki örneklere bakın.

- "_SmartDashboard_": "SmartDashboard" tablosundaki tüm alanları dahil et.
- "_SmartDashboard/Auto Selector_": Yalnızca "SmartDashboard/Auto Selector" tablosunu dahil et.
- "_limelight/tx,limelight/ty_": Yalnızca "limelight/tx" ve "limelight/ty" alanlarını dahil et.

## Sınırlamalar

:::warning

- Alanlar her 20 ms'de bir yayınlanır, bu nedenle orijinal olarak daha yüksek bir frekansta yayınlanan NetworkTables verileri örnekleri atlayacaktır.
- Yayınlanan örneklerin zaman damgaları korunmaz. Zaman içinde ileri geri gezinirken veya farklı hızlarda oynatırken bu imkansız olurdu.
  :::
