---
sidebar_position: 1
---

# ✴️ FTC Uyumluluğu {#ftc-compatibility}

AdvantageScope, gelecekteki sezonlarda [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller)'a geçişe zemin hazırlarken, mevcut FIRST Tech Challenge kontrol sisteminde sorunsuz bir deneyim sağlamak için özellikler içerir. AdvantageScope'un tüm özellikleri, 2027-2028 sezonundan itibaren Systemcore'a geçişin ardından FTC'de resmi olarak desteklenecektir.

## Sahalar ve robotlar {#fields-and-robots}

FTC sahaları ve robot modelleri yerel olarak tam desteklenmektedir.

- **Saha ve Robot Modelleri:** 🗺️ [2B saha](/tab-reference/2d-field) ve 👀 [3B saha](/tab-reference/3d-field) sekmelerindeki açılır menülerden doğrudan FTC sahalarını ve robot modellerini seçin. Tüm sahalar [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr) ile uyumludur.
- **Koordinat Sistemleri:** Herhangi bir sahada [standart FTC koordinatları](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) ile uyumluluk için [koordinat sistemini](/more-features/coordinate-systems) yapılandırın. Bu koordinat sistemi, FTC sahalarında varsayılan olarak kullanılır.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## Desteklenen formatlar {#supported-formats}

AdvantageScope; WPILOG ve NetworkTables gibi WPILib uyumlu formatlara ek olarak, **FTC Dashboard** canlı yayın formatı ve **Road Runner** `.log` dosyaları için yerel destek içerir.

Birkaç üçüncü taraf FTC loglama ve telemetri kütüphanesi, AdvantageScope ile uyumlu formatlarda veri üretir. AdvantageScope geliştiricileri belirli bir FTC loglama çözümünü onaylamamakta veya tavsiye etmemektedir; bazı loglama çözümlerini kullanırken sınırlı yeteneklerle karşılaşabilirsiniz.

Aşağıdaki liste bir başlangıç noktası sağlar ancak kapsamlı değildir:

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): Yol planlama mantığında hata ayıklamak için log dosyaları oluşturur.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/): Hem kendi paneliyle hem de AdvantageScope ile uyumlu canlı telemetri yayını yapar.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): Log dosyaları ve canlı yayın dahil olmak üzere birden fazla formata özel veri loglaması sağlar.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): Ek açıklamalar (annotations) kullanarak verileri WPILOG formatında kaydeder.
- **PsiKit**: AdvantageKit'ten esinlenen, FTC için bir loglama ve yeniden oynatma çerçevesi.

:::warning
Takımlar yarışmadayken R704 kuralına uymaya özen göstermelidir. FTC Dashboard gibi üçüncü taraf telemetri servislerinin yarışmalarda Wi-Fi üzerinden bağlanması yasaktır.
:::

### FTC için AdvantageScope Lite {#advantagescope-lite-for-ftc}

AdvantageScope Lite'ın FTC için optimize edilmiş resmi olmayan bir dağıtımı mevcuttur: [**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). Bu dağıtım resmi değildir ve AdvantageScope geliştiricileri tarafından desteklenmemektedir.

Standart [AdvantageScope Lite](/more-features/advantagescope-lite), Systemcore ve FIRST Sürücü İstasyonunda kullanılmak üzere tasarlanmış bir web uygulamasıyken, resmi olmayan FTC dağıtımı mevcut FTC kontrol sisteminde doğrudan kullanılmak üzere özel olarak değiştirilmiştir. Ek bir yazılıma ihtiyaç duymadan FTC Dashboard protokolü üzerinden canlı veri görüntülemeyi yerel olarak destekler.
