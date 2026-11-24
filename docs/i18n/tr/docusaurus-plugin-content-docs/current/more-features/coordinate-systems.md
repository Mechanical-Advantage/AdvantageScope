---
sidebar_position: 4
---

# 📐 Koordinat sistemleri {#coordinate-systems}

AdvantageScope, [🗺️ 2B saha](/tab-reference/2d-field) ve [👀 3B saha](/tab-reference/3d-field) sekmelerinde yaygın olarak kullanılan çeşitli koordinat sistemlerini destekler. AdvantageScope'un kullandığı eksen ve rotasyon kuralları hakkında daha fazla bilgi için [WPILib koordinat sistemi dokümantasyonuna](https://docs.wpilib.org/tr/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system) göz atabilirsiniz.

### Özelleştirme {#customization}

Varsayılan olarak koordinat sistemi, seçtiğiniz saha görseline veya modeline göre otomatik belirlenir. Tüm sahalarda kullanacağınız farklı bir koordinat sistemi seçmek için `Uygulama` > `Tercihleri göster...` (Windows/Linux) veya `AdvantageScope` > `Ayarlar...` (macOS) menüsünden tercihler penceresini açıp “Koordinat sistemi” ayarını değiştirin.

:::tip
Tüm koordinat sistemi seçenekleri hem FRC hem de FTC sahalarıyla uyumludur.
:::

## Merkez/kırmızı (Systemcore) {#center-red}

Aşağıda gösterildiği gibi orijin sahanın merkezindedir ve +X ekseni kırmızı ittifak duvarının aksi yönüne doğru uzanır. **Bu, 2027'den itibaren FRC sahaları ve 2027-2028'den itibaren FTC sahaları için varsayılan koordinat sistemidir.**

<img src="/img/more-features/coordinate-system-center-red.webp" alt="Merkez/kırmızı koordinat sistemi" />

## Mavi duvar {#blue-wall}

Aşağıda gösterildiği gibi orijin mavi ittifak duvarının en sağ köşesindedir ve +X ekseni kırmızı ittifak duvarına bakar. **Bu, 2023'ten 2026'ya kadar FRC sahaları için varsayılan koordinat sistemidir.**

<img src="/img/more-features/coordinate-system-blue-wall.webp" alt="Mavi duvar koordinat sistemi" />

## İttifak duvarı {#alliance-wall}

Aşağıda gösterildiği gibi orijin, _robotun mevcut ittifakının_ ittifak duvarındaki en sağ köşesindedir ve +X ekseni karşı ittifak duvarına bakar. **Bu, 2022'de FRC için varsayılan koordinat sistemidir.**

<img src="/img/more-features/coordinate-system-alliance-wall.webp" alt="İttifak duvarı koordinat sistemi" />

## Merkez/döndürülmüş {#center-rotated}

Aşağıda gösterildiği gibi orijin sahanın merkezindedir ve +X ekseni kırmızı ittifak duvarından bakıldığında sağa doğru yönelir. **Bu, 2024-2025'ten 2026-2027'ye kadar FTC sahaları için varsayılan koordinat sistemidir.**

<img src="/img/more-features/coordinate-system-center-rotated.webp" alt="Merkez/döndürülmüş koordinat sistemi" height="400" />
