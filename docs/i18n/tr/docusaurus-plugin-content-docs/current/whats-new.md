---
title: 2026'da neler yeni?
sidebar_position: 2
draft: true
---

#

<img src="/img/whats-new/banner-light.webp" className="light-only" />
<img src="/img/whats-new/banner-dark.webp" className="dark-only" />

AdvantageScope'un 2026 sürümü çıktı! Ayrıntılar için [kurulum belgelerine](/overview/installation) ve [değişiklik günlüğünün tamamına](https://github.com/Mechanical-Advantage/AdvantageScope/releases) göz atabilirsiniz. Bu sürüm, uygulama genelinde önemli yeni özellikler ve pek çok iyileştirme getiriyor. Yeniliklerin büyük bölümü mevcut kontrol sistemlerindeki deneyimi geliştirirken, gelecek sezonlarda [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) sistemine geçişi de kolaylaştırmak üzere tasarlandı.

**Görüşleriniz bizim için çok önemli! Geri bildirimlerinizi, özellik isteklerinizi ve hata raporlarınızı [GitHub Issues sayfasında](https://github.com/Mechanical-Advantage/AdvantageScope/issues) paylaşabilirsiniz.**

## ✴️ Deneysel: FTC desteği {#ftc-support}

2027-2028 sezonunda Systemcore ile gelecek tam desteğe hazırlık olarak, bu sürüm mevcut FIRST Tech Challenge kontrol sistemiyle uyumluluğu artıran çeşitli yenilikler ekliyor:

- 🗺️ [2B saha](/tab-reference/2d-field) ve 👀 [3B saha](/tab-reference/3d-field) sekmelerinde FTC sahaları ve robot modelleri
- [Standart FTC koordinatlarıyla](/more-features/coordinate-systems) uyumlu yeni [koordinat sistemi](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) seçenekleri
- [Road Runner](https://rr.brott.dev/docs/v1-0/installation/) log dosyaları için destek
- [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard) canlı veri akışı formatı desteği

:::tip
FTC takımlarının resmi sezon boyunca deneysel yazılımları kullanırken dikkatli olması gerekir. AdvantageScope'un FTC desteği hâlâ aktif olarak geliştiriliyor.
:::

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

Çeşitli üçüncü taraf FTC loglama ve telemetri kütüphaneleri, AdvantageScope ile uyumlu WPILOG ve RLOG gibi formatlarda çıktı üretebilir. Bu kütüphanelerin dokümantasyonuna kendi proje sayfalarından ulaşabilirsiniz; AdvantageScope geliştiricileri belirli bir FTC loglama çözümünü özel olarak önermez.

:::info
AdvantageScope en iyi deneyimi WPILib ve ilgili loglama araçlarıyla birlikte sunar. Resmi olmayan loglama çözümlerini kullanırken uyumluluk sorunları yaşayabilir veya bazı özelliklerden yararlanamayabilirsiniz.

2027-2028 sezonunda Systemcore'a geçildikten sonra AdvantageScope'un tüm özellikleri FTC'de resmi olarak desteklenecektir.
:::

## 🧮 Birim duyarlı grafikleme {#unit-aware-graphing}

📉 [Çizgi grafik](/tab-reference/line-graph/) sekmesi artık tamamen birim duyarlı olacak şekilde baştan tasarlandı. Sayısal alanların grafiğini çizerken şu yeni özelliklerden yararlanabilirsiniz:

- Y eksenlerinin ve değer göstergelerinin doğru birimlerle etiketlenmesi
- Açılır pencere açmadan uyumlu birimlere hızlı dönüştürme
- Aynı eksen içindeki uyumlu birim türlerinin otomatik dönüştürülmesi
- [İntegrali ve türevi alınmış](/tab-reference/line-graph/#integration-and-differentiation) birimlerin doğru gösterimi

Aşağıdaki ekran görüntüsünde tüm bu özelliklerin bir arada nasıl çalıştığını görebilirsiniz. Sol eksende farklı açısal hız birimlerine sahip alanların yer aldığına, sağ eksende ise türevi alınmış ve orijinalinden farklı bir birimde (derece) gösterilen değerlerin bulunduğuna dikkat edin. Her eksenin kendi menüsüne doğrudan eklenen uyumlu birim seçenekleri sayesinde birim seçmek de artık her zamankinden daha kolay.

_Birim desteği hakkında daha fazla bilgi için [ilgili dokümantasyona](/tab-reference/line-graph/units) göz atabilirsiniz._

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Birim duyarlı grafikleme" />

_Yukarıda İngilizce arayüz gösterilmektedir._

## 🏁 Daha hızlı log indirmeleri {#faster-log-downloads}

[roboRIO'dan log indirme](/overview/log-files/#downloading-from-the-robot) işlemi artık önceki sürümlere göre **2-4 kat daha hızlı**. Bu hız artışı, roboRIO'nun daha düşük CPU yüküyle log verisi aktarmasını sağlayan yeni FTP protokolüne geçilmesiyle elde edildi.

Aşağıdaki tabloda, AdvantageScope'un 2025 ve 2026 sürümlerinde Ethernet üzerinden (maksimum 100 Mb/s bant genişliğiyle) ölçülen aktarım hızlarını görebilirsiniz. 2025 sürümünün performansının roboRIO üzerindeki CPU yükünden ciddi şekilde etkilendiğine dikkat edin.

|                                                     | 2025 (SFTP) | 2026 (FTP) | Hızlanma                                         |
| --------------------------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| Yüksek CPU yükü<br /><sub>Karmaşık robot kodu</sub> | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3.2x**</span> |
| Ortalama CPU yükü<br /><sub>Normal robot kodu</sub> | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2.3x**</span> |
| Minimum CPU yükü<br /><sub>Robot kodu yok</sub>     | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1.1x**</span> |

## 📁 Alt klasörlerden log indirme {#download-logs-from-subfolders}

İndirme penceresi artık alt klasörlerde tutulan logları da destekliyor. Log içeren her alt klasörü tek seferde indirebilirsiniz; bu da CTRE'nin verileri tek bir log dosyasında toplayamama sorununu aşmak için alt klasörleri kullanan [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) 2026 sürümünün ürettiği logları indirmeyi çok daha pratik hale getiriyor.

<img src="/img/whats-new/subfolders.webp" alt="Log alt klasörlerini indirme" height="450" />

## 🌈 Yeni görselleştirme seçenekleri {#new-visualization-options}

🗺️ [2B saha](/tab-reference/2d-field) ve 👀 [3B saha](/tab-reference/3d-field) sekmelerine çeşitli yeni görselleştirme seçenekleri eklendi:

- 2B sahada artık daha fazla robot tamponu rengi seçeneği var ve her nesneye ayrı renk atanabiliyor. Bu sayede hayalet modelleri birden fazla robot nesnesiyle birleştirirken çok daha esnek çalışabilirsiniz.
- [3B sahada 2B mekanizmaları görselleştirirken](/tab-reference/3d-field#2d-mechanisms), mekanizmaları artık XZ düzleminin yanı sıra YZ düzlemine de yerleştirebilirsiniz. Bu, birden fazla eksende hareket eden karmaşık mekanizmaları incelemeyi kolaylaştırır.
- 3B sahada kenar kalitesini artırmak için isteğe bağlı kenar yumuşatma (antialiasing) desteği eklendi.

<img src="/img/whats-new/field-viz.jpg" alt="Yeni saha görselleştirmeleri" />

## 🪵 REV Robotics CAN log desteği {#rev-robotics-can-log-support}

REV Robotics'in [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) aracıyla oluşturulan `.revlog` dosyalarını artık doğrudan AdvantageScope'ta açabilirsiniz. Spark Max ve Spark Flex cihazlarından gelen CAN sinyallerini kaydeden bu dosyalar, AdvantageScope'un [URCL](/more-features/urcl) kütüphanesine resmi bir alternatif sunuyor.

Sorunsuz bir geçiş sağlamak ve önceki sezonlardaki tüm özellikleri korumak için hem URCL hem de resmi `StatusLogger` 2026 sezonu boyunca kullanılabilir olacak. 2027 ve sonrası için loglama seçenekleriyle ilgili ayrıntıları ilerleyen dönemde paylaşacağız.

<img src="/img/whats-new/revlog.webp" alt="REVLOG görselleştirmesi" />

## 💿 CSV dosyalarını içe aktarma {#csv-file-imports}

Robot loglama kütüphaneleri dışında üretilen verileri de kolayca görselleştirebilmeniz için AdvantageScope artık CSV dosyalarını içe aktarmaya yönelik temel destek sunuyor. Desteklenen formatlar ve kısıtlamalar için [ilgili dokümantasyona](/overview/log-files/#csv-formatting) bakabilirsiniz.

<img src="/img/overview/log-files/export-2.webp" alt="CSV verileri" />

## 🤩 Estetik iyileştirmeler {#aesthetic-improvements}

Windows 11'deki AdvantageScope arayüzü, daha önce yalnızca macOS sürümlerinde bulunan yarı saydam kenar çubuğunu destekleyecek şekilde güncellendi. Ayrıca macOS Tahoe için Apple'ın Liquid Glass tasarım diline uygun yenilenmiş bir uygulama simgesi eklendi.

<img src="/img/whats-new/windows-ui.webp" alt="Windows kullanıcı arayüzü" />

## 📋 Yalınlaştırılmış menüler {#streamlined-menus}

Menü çubuğu ve ilgili kontroller, tüm platformlarda daha erişilebilir ve tutarlı bir deneyim sunmak için sadeleştirilip yeniden düzenlendi. Öne çıkan yenilikler şunlar:

- Tercihler penceresini açmaya gerek kalmadan canlı kaynaklar (örneğin NetworkTables ve [Phoenix tanılama](/overview/live-sources/phoenix-diagnostics)) arasında hızlı geçiş.
- Kenar çubuğuna sağ tıklayarak bir alanın adını (veya tam alan anahtarını) tek tıkla kopyalama.
- Seçeneklerin çok daha hızlı bulunmasını sağlayan yenilenmiş Tercihler penceresi düzeni.

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.webp" />
  <img src="/img/whats-new/menus-2.webp" />
  <img src="/img/prefs_tr.webp" />
</div>

## 🐛 Kararlılık iyileştirmeleri {#stability-improvements}

Bu sürüm, uygulama genelinde pek çok hata düzeltmesi ve kararlılık iyileştirmesi içeriyor. Tam listeyi sürümün [değişiklik günlüğünde](https://github.com/Mechanical-Advantage/AdvantageScope/releases) bulabilirsiniz; öne çıkan bazı düzeltmeler ise şöyle:

- Özellikle çizgi grafik sekmesi kullanılırken uzun süreli canlı veri akışındaki performans büyük ölçüde iyileştirildi.
- AdvantageScope artık büyük log dosyaları ve alışılmadık derecede büyük alan değerleri dahil olmak üzere sıra dışı log verilerine karşı daha dayanıklı.
- Log verileri incelenirken (özellikle çizgi grafik sekmesinde filtreler kullanılırken) ortaya çıkan çeşitli görsel hatalar giderildi.
- İndirme penceresindeki AdvantageKit log dosyalarının sıralaması düzeltildi; zaman damgası olmayan loglar artık diğer formatlarda olduğu gibi listenin en altında yer alıyor.
- 3B saha sekmesinde, yalpalama (roll) ekseninde sıfır olmayan açıya sahip robot kameraları artık doğru şekilde görüntüleniyor.
- AdvantageScope XR'ın kararlılığı özellikle iOS/iPadOS 26 üzerinde artırıldı. Çevrimdışı kurulumlar için App Store'daki güncellemeleri kontrol etmeyi unutmayın.
