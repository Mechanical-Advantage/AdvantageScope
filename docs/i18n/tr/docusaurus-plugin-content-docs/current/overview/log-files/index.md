# 📂 Log dosyaları

## Desteklenen formatlar

- **WPILOG (.wpilog)** - WPILib'in [yerleşik veri loglaması](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) ve AdvantageKit tarafından üretilir. REV motor kontrolcülerinden gelen sinyalleri bir WPILOG dosyasına kaydetmek için [URCL](/more-features/urcl) kullanılabilir.
- **Sürücü İstasyonu logları (.dslog ve .dsevents)** - [FRC Sürücü İstasyonu](https://docs.wpilib.org/en/stable/docs/software/driverstation/driver-station.html) tarafından üretilir. AdvantageScope, her iki log türü açıldığında karşılık gelen log dosyasını otomatik olarak arar.
- **Hoot (.hoot)** - CTRE'nin Phoenix 6 [sinyal loglayıcısı](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) tarafından üretilir.
- **REVLOG (.revlog)** - REV Robotics'in [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) yazılımı tarafından üretilir.
- **Road Runner (.log)** - FTC için [Road Runner](https://github.com/acmerobotics/road-runner) kütüphanesi tarafından üretilir.
- **CSV (.csv)** - AdvantageScope tarafından "CSV (Tablo)" veya "CSV (Liste)" modlarında [dışa aktarılan](/overview/log-files/export) formatla eşleşen virgülle ayrılmış değerler. Detaylar için [buraya](#csv-formatting) bakın.
- **RLOG (.rlog)** - Eski, AdvantageKit 2022 tarafından üretilmiş.

:::info
Hoot log dosyaları yalnızca CTRE'nin [son kullanıcı lisans sözleşmesini](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt) kabul ettikten sonra açılabilir. AdvantageScope, bir Hoot log dosyasını ilk kez açarken bu koşullara kabulü onaylamak için bir bildirim görüntüler.
:::

## Logları açma

Menü çubuğunda `Dosya` > `Log aç...` seçeneğine tıklayın, ardından yerel diskten bir veya daha fazla log dosyası seçin. Sistem dosya tarayıcısından bir log dosyasını AdvantageScope simgesine veya penceresine sürüklemek de dosyanın açılmasını sağlar.

:::info
Birden fazla dosya aynı anda açılırsa, zaman damgaları otomatik olarak hizalanacaktır. Bu, birden fazla kaynaktan gelen log dosyalarının kolayca karşılaştırılmasını sağlar.
:::

<img src="/img/overview/log-files/open-file-1.png" alt="Opening a saved log" />

## Yeni loglar ekleme

Bir log dosyası açtıktan sonra görselleştirmeye kolayca ek loglar eklenebilir. Zaman damgaları mevcut verilerle senkronize edilmek üzere otomatik olarak yeniden hizalanacaktır.

Menü çubuğunda `Dosya` > `Yeni log ekle...` seçeneğine tıklayın, ardından mevcut görselleştirmeye eklemek için bir veya daha fazla log dosyası seçin. Her logdaki alanlar `Log0`, `Log1` vb. olarak adlandırılan tablolar altında kaydedilecektir.

## Robottan indirme {#downloading-from-the-robot}

<details>
<summary>Yapılandırma</summary>

`Uygulama` > `Tercihleri göster...` (Windows/Linux) veya `AdvantageScope` > `Ayarlar...` (macOS) seçeneğine tıklayarak tercihler penceresini açın. Robot adresini ve log klasörünü güncelleyin.

<img src="/img/prefs.png" alt="Diagram of preferences" height="350" />
</details>

`Dosya` > `Logları indir...` seçeneğine tıklayarak indirme penceresini açın. Robota bağlandıktan sonra mevcut loglar en yenisi en üstte olacak şekilde gösterilir. İndirmek için bir veya daha fazla log dosyası seçin (bir aralık seçmek için shift-tıkla veya tümünü seçmek için **cmd/ctrl + A** kullanın). Ardından ↓ simgesine tıklayın ve bir kaydetme konumu seçin.

:::info
CTRE'nin [sinyal loglayıcısı](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html), logları alt klasörlerde gruplayan standart olmayan bir format kullanır. Log dosyalarını bir grup olarak indirmek için listedeki bir veya daha fazla klasörü seçin.
:::

:::tip
Birden fazla dosya indirirken AdvantageScope, hedef klasörde zaten mevcut olan tüm dosyaları atlar.
:::

<img src="/img/overview/log-files/open-file-2.png" alt="Downloading log files" height="350" />

## CSV biçimlendirme {#csv-formatting}

CSV sütun adları "Timestamp, Key, Value" veya "Timestamp, (Key), (Key), vb." olmalıdır. Zaman damgası değerleri saniye cinsindendir. Aşağıdaki liste yaygın değer türlerinin beklenen formatını göstermektedir. CSV karmaşık alan türlerini desteklemediğinden, log verilerini bir CSV olarak dışa aktarmanın ve yeniden içe aktarmanın _kayıplı_ olduğunu unutmayın.

- **Boole Değerleri:** `true` veya `false`
- **Metinler (String):** `"(değer)"`
  - Örnek: `"Hello world"`
- **Diziler (Array):** `[(değer); (değer); (değer)]`
  - Örnek: `[1; 2; 3]`
- **Baytlar:** `-` ile ayrılmış onaltılık
  - Örnek: `4d-41-36-33-32-38`
