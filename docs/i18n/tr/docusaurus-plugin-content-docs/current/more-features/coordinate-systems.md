---
sidebar_position: 3
---

# 📐 Koordinat sistemleri {#coordinate-systems}

AdvantageScope, [🗺️ 2B saha](/tab-reference/2d-field) ve [👀 3B saha](/tab-reference/3d-field) sekmelerinde birkaç yaygın koordinat sistemi için destek içerir. AdvantageScope tarafından kullanılan eksen ve rotasyon kuralları hakkında daha fazla bilgi için lütfen [WPILib koordinat sistemi dokümantasyonuna](https://docs.wpilib.org/tr/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system) bakın.

### Özelleştirme {#customization}

Varsayılan olarak koordinat sistemi seçilen saha görseline/modeline göre otomatik olarak seçilir. Tüm sahalarda kullanılmak üzere farklı bir koordinat sistemi seçmek için `Uygulama` > `Tercihleri göster...` (Windows/Linux) veya `AdvantageScope` > `Ayarlar...` (macOS) seçeneğine tıklayarak tercihler penceresini açın ve "Koordinat sistemi" seçeneğini değiştirin.

:::tip
Tüm koordinat sistemi seçenekleri hem FRC hem de FTC sahaları ile uyumludur.
:::

## Merkez/kırmızı (Systemcore) {#center-red}

Orijin, aşağıda gösterildiği gibi +X ekseni kırmızı ittifak duvarından uzağa bakacak şekilde sahanın merkezindedir. **Bu, 2027'den itibaren FRC sahaları ve 2027-2028'den itibaren FTC sahaları için varsayılan koordinat sistemidir.**

<img src="/img/more-features/coordinate-system-center-red.webp" alt="Merkez/kırmızı koordinat sistemi" />

## Mavi duvar {#blue-wall}

Orijin, aşağıda gösterildiği gibi +X ekseni kırmızı ittifak duvarına bakacak şekilde mavi ittifak duvarının en sağ köşesindedir. **Bu, 2023'ten 2026'ya kadar FRC sahaları için varsayılan koordinat sistemidir.**

<img src="/img/more-features/coordinate-system-blue-wall.webp" alt="Mavi duvar koordinat sistemi" />

## İttifak duvarı {#alliance-wall}

Orijin, aşağıda gösterildiği gibi +X ekseni karşı ittifak duvarına bakacak şekilde _robotun mevcut ittifakı_ için ittifak duvarının en sağ köşesindedir. **Bu, 2022'de FRC için varsayılan koordinat sistemidir.**

<img src="/img/more-features/coordinate-system-alliance-wall.webp" alt="İttifak duvarı koordinat sistemi" />

## Merkez/Döndürülmüş {#center-rotated}

Orijin, aşağıda gösterildiği gibi +X ekseni kırmızı ittifak duvarının perspektifinden sağa bakacak şekilde sahanın merkezindedir. **Bu, 2024-2025'ten 2026-2027'ye kadar FTC sahaları için varsayılan koordinat sistemidir.**

<img src="/img/more-features/coordinate-system-center-rotated.webp" alt="Merkez/döndürülmüş坐标系" height="400" />
