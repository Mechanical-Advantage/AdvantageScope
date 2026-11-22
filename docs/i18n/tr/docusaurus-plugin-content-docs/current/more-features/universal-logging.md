---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🪐 WPILOG ile evrensel loglama

WPILOG, WPILib ekosisteminde kullanılan standart açık log formatıdır. AdvantageScope ile WPILOG, birden fazla log dosyası ve formatı için evrensel bir kapsayıcı görevi görebilir. Bu, tek bir `.wpilog` dosyasının CSV, üreticiye özel loglar veya ek WPILOG dosyaları dahil olmak üzere AdvantageScope tarafından desteklenen herhangi bir formatta kodlanmış birden fazla veri akışı içerebileceği anlamına gelir.

Bu özellik, **bir robotun tüm tanılama verilerini tek bir evrensel log dosyasında** toplayarak tanılamayı kolaylaştırmak için tasarlanmıştır; üçüncü taraf kütüphanelerden veya harici servislerden veri toplarken bile tek bir maçtan birden fazla log dosyasını indirmenize, ilişkilendirmenize veya senkronize etmenize gerek kalmaz. Örneğin, tek bir WPILOG dosyası şunları içerebilir:

- WPILib'in `Telemetry` API'si veya NetworkTables aracılığıyla yayınlanan standart robot telemetrisi.
- Üretici kütüphaneleri tarafından kaydedilen yüksek frekanslı cihaz sinyalleri.
- Yardımcı işlemcilerden (coprocessor) ve harici servislerden CSV veya WPILOG formatında kaydedilen durum verileri.
- ...ve daha fazlası!

Tüm bu veriler AdvantageScope'ta tek bir birleşik ağaçta görünür; aşağıda birden fazla üretici tarafından yakalanan cihaz sinyallerini içeren bir WPILOG örneği gösterilmiştir.

:::note
Systemcore üzerinde [URCL](https://github.com/Mechanical-Advantage/URCL), yerini resmi REV [durum loglayıcısına](https://docs.revrobotics.com/revlib/logs) bırakmıştır. AdvantageScope ile evrensel loglama, resmi durum loglayıcısının tüm REV cihazlarından gelen verileri tek bir WPILOG dosyasına kaydetmesini sağlar (URCL'e benzer şekilde).
:::

<img src="/img/more-features/universal-logging-1.webp" alt="Kenar çubuğunda birden fazla üretici logu gösteren bir WPILOG dosyası." />

_Yukarıda İngilizce arayüz gösteriliyor._

:::tip
AdvantageKit kullanıcıları, bir WPILOG içinde depolanan üçüncü taraf logların boyutunu önemli ölçüde azaltmak için XZ sıkıştırmasından da yararlanabilir. Ayrıntılar için log veri alıcıları hakkındaki AdvantageKit dokümantasyonuna bakın.
:::

## Deneysel: Üretici loglaması {#experimental-vendor-logging}

Birçok robot projesi aynı anda birden fazla log dosyası oluşturur: WPILib/AdvantageKit telemetrisi için standart bir WPILOG dosyası ve üretici kütüphanelerinden gelen özel dosyalar. Evrensel loglama, bu üretici loglarını doğrudan ana `.wpilog` dosyasına gömerek bu bölünmeyi ortadan kaldırır. WPILib ve AdvantageKit için aşağıdaki talimatlara bakın.

:::warning
Bu yaklaşım üreticiler tarafından resmi olarak desteklenmediğinden, destek talepleri AdvantageScope [issues sayfasına](https://github.com/Mechanical-Advantage/AdvantageScope/issues) veya software@team6328.org adresine yönlendirilmelidir. Tanılama için orijinal log dosyalarını dışa aktarma ayrıntıları için [Üretici Verilerini Dışa Aktarma](#exporting-vendor-data) bölümüne bakın.
:::

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

[`VendorLogCapture.java`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.java) sınıfını indirin ve robot projenize yerleştirin. Bu sınıf, üretici loglarındaki verileri otomatik olarak etkin `DataLog` içine yakalar ve aşağıda gösterildiği gibi `Robot` yapıcı metodunuzda yapılandırılmalıdır. Yakalama sırasında üretici loglarını geçici olarak hazırlamak için uygun bir dizin (`/home/systemcore/logs/` öneririz) seçmelisiniz. Ayrıntılar için [Nasıl Çalışır](#how-it-works) bölümüne bakın.

```java
public Robot() {
  // WPILib'in DataLogManager'ını normal şekilde başlatın
  DataLogManager.start();

  // Geçici bir hazırlık dizininden üretici log yakalamayı etkinleştirin
  // USB sürücü kullanırken bile üretici loglarını dahili depolamada geçici olarak
  // tutmanızı öneririz (üretici logları yakalamadan sonra kalıcı olmaz)
  VendorLogCapture.start(DataLogManager.getLog(), "/home/systemcore/logs/");

  // Log yakalama etkinleştirildikten SONRA üretici loglayıcısını başlatın
  // Yapılandırılabiliyorsa, çıktı dizini yukarıdaki yolla eşleşmelidir
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

[`VendorLogCapture.hpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.hpp) ve [`VendorLogCapture.cpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.cpp) dosyalarını indirin ve robot projenize yerleştirin. Bu sınıf, üretici loglarındaki verileri otomatik olarak etkin `DataLog` içine yakalar ve aşağıda gösterildiği gibi `Robot` yapıcı metodunuzda yapılandırılmalıdır. Yakalama sırasında üretici loglarını geçici olarak hazırlamak için uygun bir dizin (`/home/systemcore/logs/` öneririz) seçmelisiniz. Ayrıntılar için [Nasıl Çalışır](#how-it-works) bölümüne bakın.

```cpp
Robot::Robot() {
  // WPILib'in DataLogManager'ını normal şekilde başlatın
  wpi::DataLogManager::Start();

  // Geçici bir hazırlık dizininden üretici log yakalamayı etkinleştirin
  // USB sürücü kullanırken bile üretici loglarını dahili depolamada geçici olarak
  // tutmanızı öneririz (üretici logları yakalamadan sonra kalıcı olmaz)
  VendorLogCapture::Start(wpi::DataLogManager::GetLog(), "/home/systemcore/logs/");

  // Log yakalama etkinleştirildikten SONRA üretici loglayıcısını başlatın
  // Yapılandırılabiliyorsa, çıktı dizini yukarıdaki yolla eşleşmelidir
  VendorLogger::SetPath("/home/systemcore/logs/");
  VendorLogger::Start();
}
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

[`vendor_log_capture.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/vendor_log_capture.py) dosyasını indirin ve robot projenize yerleştirin. Bu yardımcı araç, üretici loglarındaki verileri otomatik olarak etkin `DataLog` içine yakalar ve aşağıda gösterildiği gibi `robotInit` içinde yapılandırılmalıdır. Yakalama sırasında üretici loglarını geçici olarak hazırlamak için uygun bir dizin (`/home/systemcore/logs/` öneririz) seçmelisiniz. Ayrıntılar için [Nasıl Çalışır](#how-it-works) bölümüne bakın.

```python
class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # WPILib'in DataLogManager'ını normal şekilde başlatın
        wpilib.DataLogManager.start()

        # Geçici bir hazırlık dizininden üretici log yakalamayı etkinleştirin
        # USB sürücü kullanırken bile üretici loglarını dahili depolamada geçici olarak
        # tutmanızı öneririz (üretici logları yakalamadan sonra kalıcı olmaz)
        VendorLogCapture.start(wpilib.DataLogManager.get_log(), "/home/systemcore/logs/")

        # Log yakalama etkinleştirildikten SONRA üretici loglayıcısını başlatın
        # Yapılandırılabiliyorsa, çıktı dizini yukarıdaki yolla eşleşmelidir
        VendorLogger.set_path("/home/systemcore/logs/")
        VendorLogger.start()
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit (Yakında)">

Üretici log yakalama özelliği AdvantageKit'in içine yerleştirilmiştir ve aşağıda gösterildiği gibi etkinleştirilebilir. Yakalama sırasında üretici loglarını geçici olarak hazırlamak için uygun bir dizin (`/home/systemcore/logs/` öneririz) seçmelisiniz. Ayrıntılar için [Nasıl Çalışır](#how-it-works) bölümüne bakın.

```java
public Robot() {
  // Geçici bir hazırlık dizininden üretici log yakalamayı etkinleştirin
  // USB sürücü kullanırken bile üretici loglarını dahili depolamada geçici olarak
  // tutmanızı öneririz (üretici logları yakalamadan sonra kalıcı olmaz)
  Logger.setVendorLogDirectory("/home/systemcore/logs/");

  // AdvantageKit'i normal şekilde başlatın
  Logger.start();

  // AdvantageKit loglayıcısından SONRA üretici loglayıcısını başlatın
  // Yapılandırılabiliyorsa, çıktı dizini yukarıdaki yolla eşleşmelidir
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

:::info
Seçilen log veri alıcılarından bağımsız olarak, üretici logları yalnızca bir WPILOG dosyası indirilerek görüntülenebilir. Yakalanan log verilerinin yapısı nedeniyle canlı akış desteklenmez.
:::

</TabItem>
</Tabs>

Bazı üretici loglayıcıların, ilgili cihaz sınıfı (ör. `SparkMax`) örneklendiğinde _hemen_ veri yazmaya başladığını unutmayın. Logların yakalandığından emin olmak için donanım nesnelerini `Robot` yapıcı metodunun sonuna kadar bekletmenizi öneririz.

### Nasıl çalışır {#how-it-works}

1. **Yakalama:** Robot programı, üretici loglayıcılarla birlikte standart WPILib loglamasını çalıştırır. Hafif bir yardımcı araç, üretici loglayıcılar tarafından yazılan yeni verileri periyodik olarak okur ve ham parçaları doğrudan etkin `DataLog` akışına paketler.
2. **Depolama:** Birleştirilmiş tüm log tek bir `.wpilog` dosyasına kaydedilir (örneğin Systemcore'a bağlı bir USB flash sürücüye). Robotta oluşturulan geçici üretici log dosyaları yeniden başlatmalar arasında kalıcı olmaz, böylece depolama dolmaz.
3. **Görselleştirme:** AdvantageScope `.wpilog` dosyasını açtığında, gömülü tüm log girişlerini otomatik olarak keşfeder, içeriklerini çözer ve tüm alanları standart telemetriyle birlikte kenar çubuğu ağacında birleştirir.
4. **Çıkarma:** Destek veya gelişmiş tanılama için bir üretici logunu açmanız gerekirse, orijinal üretici log dosyaları [Üretici Verilerini Dışa Aktarma](#exporting-vendor-data) bölümünde açıklandığı gibi `.wpilog` dosyasından kayıpsız olarak çıkarılabilir.

Harici log verileri, tür dizesi `log:<format>` kuralını izleyen ham bir giriş kullanılarak WPILOG formatında kaydedilir. AdvantageScope bu alanlardan birini ayrıştırırken, o giriş için tüm ikili kayıtları kronolojik sırayla birleştirir ve elde edilen yükü belirtilen formatta bağımsız bir log olarak çözer. Çözülen sinyaller daha sonra ana alan ağacında birleştirilir ve mevcut verilerle otomatik olarak senkronize edilir.

:::tip
WPILOG ile evrensel loglama yalnızca üretici loglarıyla sınırlı değildir; AdvantageScope ile uyumlu herhangi bir log formatı aynı kuralla bir WPILOG içine gömülebilir.
:::

### Üretici verilerini dışa aktarma {#exporting-vendor-data}

Üretici loglarından gelen veriler doğrudan AdvantageScope'ta incelenebilse de, bazen orijinal kütüphane tarafından üretilen ham logu çıkarmak (örneğin üreticiye özel araçlarda incelemek için) gerekebilir.

Doğrudan AdvantageScope'tan tek bir alt logu dışa aktarmak için kenar çubuğundaki alt log girişine sağ tıklayın ve **Orijinal logu dışa aktar...** seçeneğini seçin.

Toplu çıkarma için, bir veya daha fazla `.wpilog` veya `.wpilogxz` dosyasında tüm entegre üretici loglarını arayan ve bunları ayrı dosyalara aktaran [`extract_vendor_logs.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/extract_vendor_logs.py) Python betiğini de kullanabilirsiniz:

```bash
pip3 install robotpy-wpiutil # Gerekli bağımlılık
python3 extract_vendor_logs.py path/to/source.wpilog
```
