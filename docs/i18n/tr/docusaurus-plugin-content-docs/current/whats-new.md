---
title: 2026'da Neler Yeni?
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-light.png" className="light-only" />
<img src="/img/whats-new/banner-dark.png" className="dark-only" />

AdvantageScope'un 2026 sürümü yayınlandı! Detaylar için [kurulum belgelerini](/overview/installation) ve [tüm değişiklik günlüğünü](https://github.com/Mechanical-Advantage/AdvantageScope/releases) kontrol edin. Bu sürüm, uygulama genelinde birkaç büyük yeni özellik ve çok sayıda iyileştirme içermektedir. Bu sürümdeki özelliklerin birçoğu, gelecekteki sezonlarda [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) sistemine sorunsuz bir geçiş sağlarken mevcut kontrol sistemlerindeki deneyimi iyileştirmek için tasarlanmıştır.

**Geri bildirimlerinize değer veriyoruz! Geri bildirimler, özellik istekleri ve hata raporları [sorunlar sayfasında](https://github.com/Mechanical-Advantage/AdvantageScope/issues) memnuniyetle karşılanır.**

## ✴️ Deneysel: FTC Desteği {#ftc-support}

2027-2028 sezonunda Systemcore ile tam desteğe hazırlık amacıyla, bu sürüm mevcut FIRST Tech Challenge kontrol sistemiyle uyumluluğu artırmak için birkaç özellik eklemektedir:

- 🗺️ [2B saha](/tab-reference/2d-field) ve 👀 [3B saha](/tab-reference/3d-field) sekmelerinde FTC sahaları ve robot modelleri
- [Standart FTC koordinatları](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) ile uyumluluk için yeni [koordinat sistemi](/more-features/coordinate-systems) seçenekleri
- [Road Runner](https://rr.brott.dev/docs/v1-0/installation/) log dosyaları desteği
- [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard) canlı akış formatı desteği

:::tip
FTC takımları resmi sezon boyunca deneysel yazılımları kullanırken dikkatli olmalıdır. AdvantageScope için FTC desteği hâlâ aktif geliştirme aşamasındadır.
:::

<div className="image-gallery">
  <img src="/img/whats-new/ftc-1.jpg" />
  <img src="/img/whats-new/ftc-2.jpg" />
  <img src="/img/whats-new/ftc-3.png" />
  <img src="/img/whats-new/ftc-4.png" />
  <img src="/img/whats-new/ftc-5.png" />
</div>

Birkaç üçüncü taraf FTC loglama/telemetri kütüphanesi, AdvantageScope ile uyumlu WPILOG ve RLOG gibi diğer formatları destekler. Bu kütüphanelerin belgeleri ilgili projelerde bulunabilir; AdvantageScope geliştiricileri, AdvantageScope ile kullanım için özel bir FTC loglama çözümünü önermemekte/tavsiye etmemektedir.

:::info
AdvantageScope, WPILlib çerçevesi ve ilgili loglama araçlarıyla birlikte kullanıldığında en iyi deneyimi sunmak üzere tasarlanmıştır. Resmi olmayan loglama çözümlerini kullanırken uyumluluk sorunlarıyla karşılaşabilir veya sınırlı yeteneklerle karşılaşabilirsiniz.

AdvantageScope'un tüm özellikleri, 2027-2028 sezonunda Systemcore'a geçişten sonra FTC'de resmi olarak desteklenecektir.
:::

## 🧮 Birim Duyarlı Grafikleme {#unit-aware-graphing}

📉 [Çizgi Grafiği](/tab-reference/line-graph/) sekmesi, tamamen birim duyarlı olacak şekilde yeniden tasarlandı. Bu, sayısal alanları grafiklerken birkaç yeni yetenek sağlar:

- Y eksenlerinin ve değer göstergelerinin hassas etiketlenmesi
- Uyumlu birimlere hızlı dönüştürme (açılır pencere yok)
- Tek bir eksen içinde uyumlu birim türlerinin örtük dönüştürülmesi
- [İntegrali ve türevi alınmış](/tab-reference/line-graph/#integration--differentiation) birimlerin doğru gösterimi

Aşağıdaki ekran görüntüsü tüm bu özellikleri çalışırken göstermektedir. Sol eksenin farklı açısal hız birimlerine sahip alanları içerdiğini ve sağ eksenin türevi alınmış ve yerel olmayan bir birimde (derece) görüntülenen değerleri içerdiğini unutmayın. Birim seçimi de her bir eksen için doğrudan kontrol menüsüne entegre edilen uyumlu birim seçenekleriyle artık her zamankinden daha kolay.

_Birim desteği hakkında daha fazla bilgi [dokümantasyonda](/tab-reference/line-graph/units) bulunabilir._

<img src="/img/tab-reference/line-graph/units-1.png" alt="Unit-aware graphing" />

## 🏁 Daha Hızlı Log İndirmeleri {#faster-log-downloads}

[roboRIO'dan log indirme](/overview/log-files/#downloading-from-the-robot) işlemi artık önceki sürümlere göre **2-4 kat daha hızlı**. Bu, roboRIO'nun daha az CPU yükü ile log verilerini aktarmasına olanak tanıyan yeni bir protokole (FTP) geçilerek sağlandı.

Aşağıdaki tablo, Ethernet üzerinden bağlıyken (maksimum 100 Mb/s bant genişliği) AdvantageScope'un 2025 ve 2026 sürümlerinde ölçülen aktarım hızını göstermektedir. 2025 sürümünün performansının roboRIO üzerindeki CPU yükünden ciddi şekilde etkilendiğini unutmayın.

|                                                     | 2025 (SFTP) | 2026 (FTP) | Hızlanma                                         |
| --------------------------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| Yüksek CPU yükü<br /><sub>Karmaşık robot kodu</sub> | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3.2x**</span> |
| Ortalama CPU yükü<br /><sub>Normal robot kodu</sub> | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2.3x**</span> |
| Minimum CPU yükü<br /><sub>Robot kodu yok</sub>     | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1.1x**</span> |

## 📁 Alt Klasörlerden Log İndirme {#download-logs-from-subfolders}

İndirme penceresi artık alt klasörlerde saklanan logların kaydedilmesini desteklemektedir. Log içeren her bir alt klasör bir grup olarak indirilebilir; bu da CTRE'nin [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) 2026 sürümü tarafından oluşturulan logları indirmek için kolaylaştırılmış bir yaklaşım sunar (bu sürüm, tek bir log dosyasında veri saklayamama sorununa çözüm olarak alt klasörleri kullanır).

<img src="/img/whats-new/subfolders.png" alt="Downloading log subfolders" height="450" />

## 🌈 Yeni Görselleştirme Seçenekleri {#new-visualization-options}

🗺️ [2B saha](/tab-reference/2d-field) ve 👀 [3B saha](/tab-reference/3d-field) sekmelerinde birkaç yeni görselleştirme seçeneği desteklenmektedir:

- 2B sahada artık daha çeşitli robot tamponu renkleri mevcuttur ve her nesne kendi rengiyle yapılandırılabilir. Bu, hayaletleri birden fazla robot nesnesiyle birleştirirken daha fazla esneklik sağlar.
- [3B sahada 2B mekanizmaları görselleştirirken](/tab-reference/3d-field#2d-mechanisms), mekanizmalar artık XZ düzleminin yanı sıra YZ düzlemine de yerleştirilebilir. Bu, birden fazla eksende harekete sahip karmaşık mekanizmaların daha kolay görselleştirilmesini sağlar.
- 3B saha artık işlenen kenarların kalitesini artırmak için isteğe bağlı kenar yumuşatmayı desteklemektedir.

<img src="/img/whats-new/field-viz.jpg" alt="New field visualizations" />

## 🪵 REV Robotics CAN Log Desteği {#rev-robotics-can-log-support}

REV Robotics'in [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) yazılımı tarafından üretilen `.revlog` dosyalarını artık doğrudan AdvantageScope'ta açabilirsiniz. Bu dosyalar Spark Max ve Spark Flex cihazlarından gelen CAN sinyallerini kaydederek AdvantageScope'un [URCL](/more-features/urcl) kütüphanesine resmi bir alternatif sunar.

Hem URCL hem de resmi `StatusLogger`, sorunsuz bir geçiş sağlamak ve önceki sezonlarla özellik eşitliğini korumak için 2026 sezonu boyunca mevcut kalacaktır. 2027 ve sonrasındaki loglama seçenekleri hakkında paylaşacak daha fazla ayrıntıya daha sonra sahip olacağız.

<img src="/img/whats-new/revlog.png" alt="REVLOG visualization" />

## 💿 CSV Dosyası İçe Aktarmaları {#csv-file-imports}

Robot loglama çerçevelerinin dışında üretilen verilerin daha esnek görselleştirilmesi için AdvantageScope artık CSV dosyalarını içe aktarmak için temel destek içeriyor. Desteklenen formatlar ve diğer sınırlamalar hakkında daha fazla ayrıntı için [dokümantasyonu](/overview/log-files/#csv-formatting) kontrol edin.

<img src="/img/overview/log-files/export-2.png" alt="CSV data" />

## 🤩 Estetik İyileştirmeler {#aesthetic-improvements}

Windows 11'deki AdvantageScope UI, daha önce yalnızca macOS sürümlerine özel olan yarı saydam bir kenar çubuğunu destekleyecek şekilde güncellendi. macOS Tahoe için Apple'ın Sıvı Cam (Liquid Glass) malzemesini temel alan güncellenmiş bir uygulama simgesi de mevcuttur.

<img src="/img/whats-new/windows-ui.png" alt="Windows UI" />

## 📋 Yalınlaştırılmış Menüler {#streamlined-menus}

Menü çubuğu ve ilgili kontroller, kontrolleri tüm platformlarda daha erişilebilir ve tutarlı hale getirmek için yalınlaştırıldı ve yeniden düzenlendi. Göze çarpan özellikler şunlardır:

- Tercihler penceresini açmaya gerek kalmadan canlı kaynaklar (örneğin NetworkTables ve [Phoenix tanılama](/overview/live-sources/phoenix-diagnostics)) arasında daha hızlı geçiş.
- Bir alanın adını (veya tam alan anahtarını) hızlıca kopyalamak için kenar çubuğuna sağ tıklayın.
- Tercihler penceresinin yeniden düzenlenmesi, seçeneklerin hızlıca bulunmasını kolaylaştırıyor.

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.png" />
  <img src="/img/whats-new/menus-2.png" />
  <img src="/img/prefs.png" />
</div>

## 🐛 Kararlılık İyileştirmeleri {#stability-improvements}

Bu sürüm, uygulama genelinde çeşitli hata düzeltmeleri ve kararlılık iyileştirmeleri içerir. Tam liste sürüm [değişiklik günlüğünde](https://github.com/Mechanical-Advantage/AdvantageScope/releases) bulunabilir, ancak bazı önemli düzeltmeler aşağıda listelenmiştir:

- Özellikle çizgi grafiği sekmesini kullanırken, uzun süreler boyunca veri akışı yaparken AdvantageScope'un performansı büyük ölçüde iyileştirildi.
- AdvantageScope artık büyük log dosyaları ve büyük alan değerleri dahil olmak üzere olağan dışı log verilerine karşı daha toleranslıdır.
- Log verilerine göz atarken, özellikle Çizgi grafik sekmesinde filtreler kullanılırken oluşan çeşitli görsel aksaklıklar düzeltildi.
- İndirme penceresindeki AdvantageKit log dosyalarının sıralaması düzeltildi; zaman damgası olmayan loglar artık diğer formatlara benzer şekilde listenin en altındadır.
- 3B saha sekmesinde, yalpalama (roll) ekseninde sıfır olmayan bir rotasyona sahip robot kameraları artık doğru şekilde görselleştirilmektedir.
- Özellikle iOS/iPadOS 26 üzerinde çalışırken AdvantageScope XR'ın kararlılığı artırıldı. Çevrimdışı kurulumlar için mevcut güncellemeler için App Store'u kontrol edin.
