---
sidebar_position: 3
---

# 📐 Koordinat sistemleri

AdvantageScope, [🗺️ 2B saha](/tab-reference/2d-field) ve [👀 3B saha](/tab-reference/3d-field) sekmelerinde birkaç yaygın koordinat sistemi için destek içerir. AdvantageScope tarafından kullanılan eksen ve rotasyon kuralları hakkında daha fazla bilgi için lütfen [WPILib koordinat sistemi dokümantasyonuna](https://docs.wpilib.org/en/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system) bakın.

### Özelleştirme

Varsayılan olarak koordinat sistemi seçilen saha görseline/modeline göre otomatik olarak seçilir. Tüm sahalarda kullanılmak üzere farklı bir koordinat sistemi seçmek için `Uygulama` > `Tercihleri göster...` (Windows/Linux) veya `AdvantageScope` > `Ayarlar...` (macOS) seçeneğine tıklayarak tercihler penceresini açın ve "Koordinat sistemi" seçeneğini değiştirin.

:::tip
Tüm koordinat sistemi seçenekleri hem FRC hem de FTC sahaları ile uyumludur.
:::

## Merkez/kırmızı (Systemcore) {#centerred-systemcore}

Orijin, aşağıda gösterildiği gibi +X ekseni kırmızı ittifak duvarından uzağa bakacak şekilde sahanın merkezindedir. **Bu, 2027'den itibaren FRC sahaları ve 2027-2028'den itibaren FTC sahaları için varsayılan koordinat sistemidir.**

<img src="/img/more-features/coordinate-system-center-red.png" alt="Center/red coordinate system" />

## Mavi duvar

Orijin, aşağıda gösterildiği gibi +X ekseni kırmızı ittifak duvarına bakacak şekilde mavi ittifak duvarının en sağ köşesindedir. **Bu, 2023'ten 2026'ya kadar FRC sahaları için varsayılan koordinat sistemidir.**

<img src="/img/more-features/coordinate-system-blue-wall.png" alt="Blue wall coordinate system" />

## İttifak duvarı

Orijin, aşağıda gösterildiği gibi +X ekseni karşı ittifak duvarına bakacak şekilde _robotun mevcut ittifakı_ için ittifak duvarının en sağ köşesindedir. **Bu, 2022'de FRC için varsayılan koordinat sistemidir.**

<img src="/img/more-features/coordinate-system-alliance-wall.png" alt="Alliance wall coordinate system" />

## Merkez/Döndürülmüş

Orijin, aşağıda gösterildiği gibi +X ekseni kırmızı ittifak duvarının perspektifinden sağa bakacak şekilde sahanın merkezindedir. **Bu, 2024-2025'ten 2026-2027'ye kadar FTC sahaları için varsayılan koordinat sistemidir.**

<img src="/img/more-features/coordinate-system-center-rotated.png" alt="Center/rotated coordinate system" height="400" />
