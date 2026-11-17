---
sidebar_position: 1
---

# ✴️ FTC Uyumluluğu {#ftc-compatibility}

AdvantageScope, gelecekteki sezonlarda [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller)'a geçişe zemin hazırlarken, mevcut FIRST Tech Challenge kontrol sisteminde sorunsuz bir deneyim sunacak özellikler içerir. 2027-2028 sezonunda Systemcore'a geçilmesiyle birlikte AdvantageScope'un tüm özellikleri FTC'de resmi olarak desteklenecek.

## Sahalar ve robotlar {#fields-and-robots}

FTC sahaları ve robot modelleri yerleşik olarak tam desteklenir.

- **Saha ve Robot Modelleri:** 🗺️ [2B saha](/tab-reference/2d-field) ve 👀 [3B saha](/tab-reference/3d-field) sekmelerindeki açılır menülerden FTC sahalarını ve robot modellerini doğrudan seçebilirsiniz. Tüm sahalar [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr) ile uyumludur.
- **Koordinat Sistemleri:** Herhangi bir sahada [standart FTC koordinatlarıyla](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) uyum sağlamak için [koordinat sistemini](/more-features/coordinate-systems) ayarlayabilirsiniz. FTC sahalarında bu koordinat sistemi varsayılan olarak kullanılır.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## Desteklenen formatlar {#supported-formats}

AdvantageScope; WPILOG ve NetworkTables gibi WPILib uyumlu formatların yanı sıra **FTC Dashboard** canlı yayın formatını ve **Road Runner** `.log` dosyalarını da yerleşik olarak destekler.

Çeşitli üçüncü taraf FTC loglama ve telemetri kütüphaneleri, AdvantageScope ile uyumlu formatlarda veri üretir. AdvantageScope geliştiricileri belirli bir FTC loglama çözümünü önermez veya onaylamaz; ayrıca bazı çözümleri kullanırken özelliklerin kısıtlı olduğunu görebilirsiniz.

Aşağıdaki liste başlangıç için fikir verir ancak piyasadaki tüm araçları kapsamaz:

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): Yol planlama mantığında hata ayıklamak için log dosyaları oluşturur.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/): Hem kendi paneliyle hem de AdvantageScope ile uyumlu canlı telemetri yayını yapar.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): Log dosyaları ve canlı yayın dahil olmak üzere birden fazla formata özel veri loglaması sağlar.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): Ek açıklamalar (annotations) kullanarak verileri WPILOG formatında kaydeder.
- **PsiKit**: AdvantageKit'ten esinlenen, FTC için geliştirilmiş bir loglama ve yeniden oynatma (replay) çerçevesi.

:::warning
Takımlar yarışma sırasında R704 kuralına uymaya dikkat etmelidir. Yarışmalarda Wi-Fi üzerinden FTC Dashboard gibi üçüncü taraf telemetri servislerine bağlanmak yasaktır.
:::

### FTC için AdvantageScope Lite {#advantagescope-lite-for-ftc}

AdvantageScope Lite'ın FTC için optimize edilmiş resmi olmayan bir dağıtımı vardır: [**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). Bu dağıtım resmi değildir ve AdvantageScope geliştiricileri bu dağıtıma destek vermez.

Standart [AdvantageScope Lite](/more-features/advantagescope-lite), Systemcore ve FIRST Sürücü İstasyonu'nda kullanılmak üzere tasarlanmış bir web uygulamasıyken; bu resmi olmayan FTC dağıtımı doğrudan mevcut FTC kontrol sisteminde çalışacak şekilde uyarlanmıştır. Ek bir yazılıma ihtiyaç duymadan FTC Dashboard protokolü üzerinden canlı veri görüntülemeyi doğrudan destekler.
