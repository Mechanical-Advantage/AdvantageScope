---
title: 2027'deki yenilikler neler?
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-2027-ltr-light.webp" className="light-only" />
<img src="/img/whats-new/banner-2027-ltr-dark.webp" className="dark-only" />

AdvantageScope'un 2027 sürümü, tam Systemcore desteğinin yanı sıra uygulama genelinde **100'den fazla yeni özellik ve güncelleme** ile artık yayında. Ayrıntılar için [kurulum belgelerine](/overview/installation) ve [tam değişiklik günlüğüne](https://github.com/Mechanical-Advantage/AdvantageScope/releases) göz atın. Bu sayfa, bu sürümdeki başlıca yenilikleri ve iyileştirmeleri öne çıkarır.

**Geri bildirimlerinize değer veriyoruz! Görüşlerinizi, özellik isteklerinizi ve hata raporlarınızı [issues sayfasında](https://github.com/Mechanical-Advantage/AdvantageScope/issues) paylaşabilirsiniz.**

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />

## 🍋‍🟩 Systemcore uyumluluğu {#systemcore-compatibility}

AdvantageScope 2027, yeni Systemcore robot kontrolcüsü ve WPILib 2027 ile sorunsuz çalışacak şekilde tasarlandı:

- Varsayılan robot adresi artık `robot.local`; böylece takım numarası yapılandırmadan canlı bağlanabilir veya log indirebilirsiniz. Systemcore USB ve Wi-Fi adresleri de menü çubuğundan seçilebilir.
- [Log indirme](/overview/log-files#downloading-from-the-robot) artık eski roboRIO log indirmelerinin yanı sıra Systemcore için SFTP'yi de destekler.
- 2027'den itibaren FRC sahaları ve 2027-2028'den itibaren FTC sahaları tarafından kullanılan [Merkez/kırmızı](/more-features/coordinate-systems#center-red) koordinat sistemi eklendi.
- WPILib 2027'nin `Telemetry` ve `Tunables` API'leri için destek, güncellenmiş uyarı renkleri ve Systemcore zaman damgalarının kolay okunmasını sağlayan yeni bir [zaman damgası görüntüleme tercihi](/more-features/timestamps) eklendi.
- Yeni bir [Systemcore tanılama](/overview/live-sources) canlı modu, kullanıcı kodu gerektirmeden robot durumunu ve donanım G/Ç'lerini izlemek için doğrudan Systemcore'un yerleşik NetworkTables sunucusuna bağlanır.

## 💡 AdvantageScope Lite {#advantagescope-lite}

[AdvantageScope Lite](/more-features/advantagescope-lite), AdvantageScope'un görselleştirme ve analiz araçlarını doğrudan web tarayıcınıza getirir. Hem Systemcore web arayüzünden hem de FIRST Driver Station içinden **kurulum gerektirmeden** erişilebilir.

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/lHsak9Mmx2M" title="AdvantageScope Lite Demosu" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 🎮 FIRST Driver Station {#first-driver-station}

AdvantageScope, maç tanılamasını kolaylaştırmak için yeni [FIRST Driver Station](https://docs.wpilib.org/tr/latest/docs/software/firstdriverstation) ile yakından entegre olur:

- DS tarafından üretilen WPILOG dosyalarını analiz etmek için FIRST Driver Station ayarlar menüsünden doğrudan [AdvantageScope Lite](/more-features/advantagescope-lite)'a erişilebilir.
- Yerel bir Driver Station'dan gerçek zamanlı maç durumunu, iletişim metriklerini, akü voltajını ve joystick girişlerini sıfır yapılandırmayla aktarmak için masaüstü uygulamasını kullanın.
- Masaüstünde bir Driver Station `.wpilog` dosyasını açtığınızda, konsol çıktısı, iletişim metrikleri, güç, CPU kullanımı ve joystickler için önceden yapılandırılmış sekmelerle ayrı bir pencere açmanız önerilir ([belgeler](/overview/log-files#driver-station-layout)). Bu düzen, Driver Station için AdvantageScope Lite'ta da varsayılan olarak kullanılır.
- Otomatik uyarı/hata vurgulama ve [ANSI kaçış dizileri](/tab-reference/console#ansi-formatting) (renkler ve metin stilleri) için tam destekle Driver Station konsol loglarını 💬 [Konsol](/tab-reference/console) sekmesinde görüntüleyin.

<img src="/img/tutorials/taking-control-1.webp" alt="FIRST Driver Station'dan AdvantageScope Lite'ı açma" />

_Yukarıda İngilizce arayüz gösteriliyor._

## 🌐 Çoklu dil desteği {#language-support}

AdvantageScope artık masaüstü uygulamasında, belge sitesinde, mobil uygulamalarda ve AdvantageScope Lite'ta **14 dilde** kullanılabilir: İngilizce (ABD), İspanyolca (Latin Amerika), Fransızca, Felemenkçe, Portekizce (Brezilya), Romence, Türkçe, Rusça, Kazakça, İbranice, Arapça, Hintçe, Basitleştirilmiş Çince ve Geleneksel Çince.

:::info
Çeviriler, yapay zekâ ve topluluk katkıcılarının desteğiyle hazırlanmakta olan bir çalışmadır ve **doğal olmayan ifadeler veya hatalar içerebilir**. Bu çevirileri incelemeye ve iyileştirmeye şimdiden yardımcı olan takımlara teşekkür ederiz! Çeviri sürecimiz ve geri bildirim gönderme hakkında ayrıntılar için 🌐 [Dil Desteği](/overview/language-support) sayfasına bakın.
:::

<img src="/img/whats-new/multi-language-1.webp" alt="Basitleştirilmiş Çince Çizgi grafik sekmesi" />

## 📖 Yeni eğitimler ve belgeler {#new-tutorials-and-documentation}

Belgeler, takımların WPILib 2027 ve AdvantageScope ile başlamasına yardımcı olmak için tasarlanmış üç bölümlük yeni bir [eğitim serisiyle](/category/tutorials) genişletildi:

1. **👋 [Merhaba, Telemetri!](/tutorials/hello-telemetry):** `DataLogManager` ve `Telemetry` API'sini kurma, canlı bağlanma ve çizgi grafikler, tablolar ve istatistiklerle veri analizi.
2. **🤖 [Sahaya: Robot Görselleştirme](/tutorials/to-the-field):** FRC ve FTC sahalarında 2B/3B pozları, yörüngeleri ve `Mechanism2d` nesnelerini yayınlama.
3. **🕹️ [Kontrolü Ele Alma: DS ve Joystickler](/tutorials/taking-control):** Canlı Driver Station tanılaması aktarma, robot ve DS loglarını senkronize etme, konsol çıktısını görüntüleme ve kontrolcü girişlerini görselleştirme.

Belgelerdeki kod örnekleri de birden fazla dilde WPILib'in `Telemetry` API'sini tam kapsayacak şekilde güncellendi.

<img src="/img/tutorials/to-the-field-4.webp" alt="Sahaya eğitiminden 3B saha görselleştirmesi" />

_Yukarıda İngilizce arayüz gösteriliyor._

## 📱 AdvantageTune {#advantagetune}

AdvantageTune, AdvantageScope'u tamamlamak için hafif bir mobil ayar deneyimi sunan yeni, bağımsız bir iPhone ve iPad uygulamasıdır. Canlı [NetworkTables](https://docs.wpilib.org/tr/stable/docs/software/networktables/index.html) konularını (temel türler, diziler, WPILib struct'ları ve Protobuf'lar dahil) doğrudan telefonunuzdan görüntüleyip değiştirebilir, böylece herkesin robot kodunu ayarlamaya katılmasını kolaylaştırabilirsiniz.

Hem AdvantageTune hem de AdvantageScope, ayarlanan tüm değerleri kolayca paylaşmak için bir metin dosyasına kaydeden düğmelerle ayarlanan değerleri robot koduna geri aktarma sürecini kolaylaştırır ([belgeler](/overview/live-sources/tuning-mode)).

[<img src="/img/app-store_tr.svg" alt="App Store" />](https://apps.apple.com/tr/app/advantagetune/id6811453643?l=tr)

<div className="image-gallery">
  <img src="/img/whats-new/advantagetune-1.webp" alt="AdvantageTune göz atma görünümü" />
  <img src="/img/whats-new/advantagetune-2.webp" alt="AdvantageTune konu düzenleme" />
  <img src="/img/whats-new/advantagetune-3.webp" alt="AdvantageTune struct düzenleme" />
  <img src="/img/whats-new/advantagetune-4.webp" alt="AdvantageTune ayarlanan değerler listesi" />
  <img src="/img/whats-new/advantagetune-5.webp" alt="AdvantageTune arama ve filtreleme" />
</div>

_Yukarıda İngilizce arayüz gösteriliyor._

## 🪐 WPILOG evrensel loglama {#wpilog-universal-logging}

[Evrensel loglama](/more-features/universal-logging) ile tek bir WPILOG dosyası artık üreticiye özel cihaz logları, CSV verileri ve alt WPILOG dosyaları dahil birden fazla log akışı ve formatı için evrensel bir kapsayıcı görevi görebilir. Evrensel loglama, URCL'in yerini esnek, üreticiden bağımsız bir yaklaşımla alır: her kaynaktan gelen veriler otomatik olarak senkronize edilir ve kenar çubuğunda tek bir birleşik ağaçta birleştirilir. AdvantageKit ve WPILib'de (yakında) üretici log yakalama ayrıntıları için [evrensel loglama belgelerine](/more-features/universal-logging#experimental-vendor-logging) bakın.

<img src="/img/more-features/universal-logging-1.webp" alt="Kenar çubuğunda birden fazla üretici logu gösteren bir WPILOG dosyası" />

_Yukarıda İngilizce arayüz gösteriliyor._

## 🗺️ Saha sekmesi iyileştirmeleri {#field-tab-improvements}

🗺️ [2B saha](/tab-reference/2d-field) ve 👀 [3B saha](/tab-reference/3d-field) sekmelerine çeşitli kullanılabilirlik iyileştirmeleri eklendi:

- 2B sahada kaydırın ve yakınlaştırın veya kamerayı robotun konumunu ve rotasyonunu takip edecek şekilde kilitlemek için sağ tıklayın ([belgeler](/tab-reference/2d-field#camera-controls)).
- Alanlar yakın zamanda güncellenmediğinde 2B ve 3B hayaletlerin soluklaşmasını sağlayan bir seçenek eklendi (görüntü işleme pozlarını görselleştirmek için kullanışlıdır).
- Daha kolay uzamsal referans için 2B ve 3B FTC sahalarına karo ızgara çizgileri eklendi.
- AdvantageScope artık yeni 2B veya 3B saha sekmeleri açarken en son FRC mi yoksa FTC sahasının mı kullanıldığını hatırlar.

<img src="/img/tab-reference/2d-field-1.webp" alt="2B saha sekmesi genel görünümü" />

_Yukarıda İngilizce arayüz gösteriliyor._

## 📉 Çizgi grafik iyileştirmeleri {#line-graph-improvements}

📉 [Çizgi grafik](/tab-reference/line-graph) ve zaman çizelgesi, daha net analiz için çeşitli görsel iyileştirmeler içerir:

- “Robot modunu göster” etkinleştirildiğinde artık otonom, teleop, test ve devre dışı dönemler için renk kodlu bir çubuk görüntülenir.
- Nokta stilindeki grafikler, her yakınlaştırma düzeyinde daha iyi görünürlük için nokta boyutlarını otomatik olarak ölçekler.
- Yeni kullanıcılara kaydırma ve yakınlaştırma hareketlerinde rehberlik etmek için çizgi grafikte ve zaman çizelgesinde faydalı ipuçları görünür.
- Zaman çizelgesi ve çizgi grafik eksenlerindeki büyük zaman damgası değerlerinin işlenmesi ve okunabilirliği iyileştirildi.

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="Çizgi grafik üzerinde renk kodlu robot modu katmanı" />

_Yukarıda İngilizce arayüz gösteriliyor._

## 🤝 Erişilebilirlik iyileştirmeleri {#accessibility-enhancements}

AdvantageScope 2027, uygulamayı daha erişilebilir kılmak için çeşitli güncellemeler içerir:

- Tüm girişler için klavyeyle Tab gezinmesi ve uygulama genelindeki tüm kontroller için açıklayıcı araç ipuçları eklendi.
- AdvantageScope artık işletim sistemi düzeyindeki “saydamlığı azalt” ve “hareketi azalt” ayarlarına uyar.
- Kenar çubuğundaki boolean göstergeleri artık yalnızca renge bağlı kalmadan durumları ayırt eder.

## 🥔 Yeni birim türleri {#new-unit-types}

AdvantageScope'un [birim duyarlı grafikleme](/tab-reference/line-graph/units) özelliği ek birim türleri ve ayrıştırma seçenekleriyle genişletildi:

- Güç (watt, beygir gücü vb.)
- Oranlar (boyutsuz, yüzde)
- Kelvin cinsinden sıcaklık
- Patates enerjisi
- İngiliz İngilizcesi birim yazımları (ör. `metres`)
- WPILib'in birim kütüphanesi için son ekler

## 🧱 Kararlılık iyileştirmeleri {#stability-improvements}

Bu sürüm, uygulama genelinde çok sayıda hata düzeltmesi, performans optimizasyonu ve kararlılık iyileştirmesi içerir. Tam liste sürüm [değişiklik günlüğünde](https://github.com/Mechanical-Advantage/AdvantageScope/releases) bulunabilir; öne çıkanlar aşağıdadır:

- Resmi Windows sürümleri artık dijital olarak imzalanmıştır; bu da kurulum sırasında SmartScreen uyarılarının sıklığını azaltır.
- Özellikle Hoot (`.hoot`) logları ve büyük struct dizileriyle çalışırken log yükleme ve grafik çizme performansı önemli ölçüde iyileştirildi.
- Yüksek frekanslı veri kaynaklarıyla birlikte AdvantageKit loglarını görüntülerken zaman damgası işleme sorunu düzeltildi.
- Birden fazla kaynaktan gelen logları hizalarken çoklu log zaman damgası senkronizasyon algoritması iyileştirildi.
- [Phoenix tanılama](/overview/live-sources/phoenix-diagnostics) için bağlantı güvenilirliği iyileştirildi.
- Ayrılmış pencerelerdeki menü çubuğu ve [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr) içindeki kayıt açılır penceresiyle ilgili arayüz sorunları düzeltildi.
- Netliği artırmak için uygulama genelindeki arayüz metinleri ve ifadeler iyileştirildi.
