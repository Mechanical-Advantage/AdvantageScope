# 📂 Log dosyaları {#log-files}

## Desteklenen formatlar {#supported-formats}

- **WPILOG (.wpilog)** - WPILib'in [yerleşik veri loglama sistemi](https://docs.wpilib.org/tr/stable/docs/software/telemetry/datalog.html), AdvantageKit ve FIRST Driver Station bu formatta kayıt alır. Harici logları (örneğin üretici loglarını) bir WPILOG dosyasına yakalamak için [evrensel loglama](/more-features/universal-logging) kullanılabilir.
- **Hoot (.hoot)** - CTRE'nin Phoenix 6 [sinyal loglayıcısı](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) bu formatta kayıt alır.
- **REVLOG (.revlog)** - REV Robotics'in [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) aracı bu formatta kayıt alır.
- **Road Runner (.log)** - FTC için geliştirilen [Road Runner](https://github.com/acmerobotics/road-runner) kütüphanesi bu formatta kayıt alır.
- **CSV (.csv)** - AdvantageScope'un “CSV (Tablo)” veya “CSV (Liste)” modlarında [dışa aktardığı](/overview/log-files/export) formatla uyumlu, virgülle ayrılmış değerler dosyasıdır. Ayrıntılar için [buraya](#csv-formatting) göz atın.
- **NI Sürücü İstasyonu logları (.dslog ve .dsevents)** - NI [FRC Sürücü İstasyonu](https://docs.wpilib.org/tr/stable/docs/software/driverstation/driver-station.html) (2010–2026) ile kaydedilen eski formattır. İki log türünden birini açtığınızda AdvantageScope karşılık gelen diğer dosyayı otomatik olarak bulur.
- **RLOG (.rlog)** - AdvantageKit 2022'nin ürettiği eski formattır.

:::info
Hoot log dosyalarını açabilmek için önce CTRE'nin [son kullanıcı lisans sözleşmesini](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt) kabul etmeniz gerekir. Bir Hoot log dosyasını ilk kez açtığınızda AdvantageScope bu koşulları onaylamanız için bir pencere gösterir.
:::

## Logları açma {#opening-logs}

Menü çubuğundan `Dosya` > `Log aç...` seçeneğine tıklayın ve bilgisayarınızdan bir veya daha fazla log dosyası seçin. Bilgisayarınızın dosya yöneticisinden bir log dosyasını doğrudan AdvantageScope simgesinin ya da penceresinin üzerine sürükleyip bırakarak da açabilirsiniz.

:::info
Birden fazla dosyayı aynı anda açarsanız zaman damgaları otomatik olarak hizalanır. Böylece farklı kaynaklardan gelen log dosyalarını kolayca karşılaştırabilirsiniz. Zaman damgası görüntüleme seçenekleri hakkında ayrıntılı bilgi için [Zaman damgaları](/more-features/timestamps) sayfasına göz atın.
:::

<img src="/img/overview/log-files/open-file-1.webp" alt="Kaydedilmiş bir logu açma" />

_Yukarıda İngilizce arayüz gösteriliyor._

## Yeni loglar ekleme {#adding-new-logs}

Bir log dosyası açıkken mevcut görselleştirmeye kolayca başka loglar da ekleyebilirsiniz. Zaman damgaları mevcut verilerle eşleşecek şekilde otomatik olarak yeniden hizalanır.

Menü çubuğundan `Dosya` > `Yeni log ekle...` seçeneğine tıklayıp eklemek istediğiniz bir veya daha fazla log dosyasını seçin. Eklenen her logdaki alanlar `Log0`, `Log1` vb. tabloların altında listelenir.

## Sürücü İstasyonu düzeni {#driver-station-layout}

AdvantageScope, konsol çıktısı, iletişim metrikleri, akü voltajı, CPU kullanımı ve joystick girişleri için önceden yapılandırılmış sekmelerle FIRST Driver Station'dan gelen logları ve canlı verileri görüntülemek üzere tasarlanmış yerleşik bir düzen içerir.

Masaüstünde FIRST Driver Station tarafından oluşturulan bir WPILOG dosyasını açtığınızda, AdvantageScope logu Sürücü İstasyonu düzenini kullanarak ayrı bir pencerede açmak isteyip istemediğinizi sorar. Herhangi bir pencere `Dosya` > `DS düzenine sıfırla` seçeneğine tıklanarak da manuel olarak bu düzene geçirilebilir. FIRST Driver Station için [AdvantageScope Lite](/more-features/advantagescope-lite)'ta bu düzen varsayılan olarak kullanılır (ve `Sekmeler` > `Varsayılan düzene sıfırla` seçeneğine tıklanarak geri yüklenebilir).

## Robottan indirme {#downloading-from-the-robot}

<details>
<summary>Yapılandırma</summary>

`Uygulama` > `Tercihleri göster...` (Windows/Linux) veya `AdvantageScope` > `Ayarlar...` (macOS) yolunu izleyerek tercihler penceresini açın. Robot adresini ve log klasörünü güncelleyin.

<img src="/img/prefs_tr.webp" alt="Tercihler penceresi" height="450" />
</details>

`Dosya` > `Logları indir...` seçeneğine tıklayarak indirme penceresini açın. Log indirme özelliği Systemcore ve roboRIO'da desteklenir. Robota bağlandığınızda mevcut loglar en yenisi en üstte olacak şekilde listelenir. İndirmek istediğiniz bir veya daha fazla log dosyasını ya da klasörü seçin (aralık seçmek için Shift ile tıklayın veya tümünü seçmek için **cmd/ctrl + A** kullanın). Ardından ↓ simgesine tıklayıp kayıt konumunu seçin.

:::tip
Birden fazla dosya indirirken AdvantageScope, hedef klasörde zaten bulunan dosyaları otomatik olarak atlar.
:::

<img src="/img/overview/log-files/open-file-2.webp" alt="Log dosyalarını indirme" height="350" />

_Yukarıda İngilizce arayüz gösteriliyor._

## CSV biçimlendirme {#csv-formatting}

CSV sütun adları “Timestamp, Key, Value” veya “Timestamp, (Key), (Key), vb.” biçiminde olmalıdır. Zaman damgası değerleri saniye cinsindendir. Aşağıdaki listede yaygın veri türleri için beklenen formatı görebilirsiniz. CSV karmaşık alan türlerini desteklemediğinden, log verilerini CSV olarak dışa aktarıp tekrar içe aktarmanın _veri kaybına_ yol açacağını unutmayın.

- **Boolean değerler:** `true` veya `false`
- **Metinler (String):** `"(değer)"`
  - Örnek: `"Hello world"`
- **Diziler (Array):** `[(değer); (değer); (değer)]`
  - Örnek: `[1; 2; 3]`
- **Baytlar:** `-` ile ayrılmış onaltılık (hex) değerler
  - Örnek: `4d-41-36-33-32-38`
