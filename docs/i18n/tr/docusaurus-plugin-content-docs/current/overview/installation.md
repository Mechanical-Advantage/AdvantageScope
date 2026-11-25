---
sidebar_position: 1
---

# 📦 Kurulum {#installation}

AdvantageScope'un resmi olarak desteklenen sürümünü doğrudan Takım 6328'den veya WPILib yükleyicisi üzerinden indirebilirsiniz. Bunun yanında çeşitli resmi olmayan dağıtımlar da bulunur.

## Takım 6328 {#team-6328}

### İndirmeler: [Kararlı](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest), [Ön sürüm](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

AdvantageScope'u doğrudan Takım 6328'den indirdiğinizde şu avantajlara sahip olursunuz:

- Diğer kanallara ulaşmadan önce en yeni özellikler ve hata düzeltmeleri
- İndirilebilir yeni bir sürüm çıktığında uygulama içi bildirimler
- 👀 [3B saha](/tab-reference/3d-field) sekmesinde kullanabileceğiniz güncel 6328 robot modellerinden oluşan yerleşik bir koleksiyon

:::info
AdvantageScope'un her ana sürümü, FRC sezon açılışından (kickoff) önce ocak ayında, yıla karşılık gelen bir sürüm numarasıyla yayınlanır (örneğin v26.0.0, Ocak 2026'da yayınlandı). Yeni özellikleri denemek ve geri bildirim vermek isteyen takımlar için her ana sürüm öncesindeki aylarda alfa ve beta sürümleri de paylaşılabilir. **Bu ön sürümleri kullanan takımların kararlı sürümlerde olmayan sorunlarla ve hatalarla karşılaşabileceğini unutmayın.**
:::

## WPILib {#wpilib}

### Kurulum: [WPILib dokümantasyonu](https://docs.wpilib.org/tr/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

WPILib yükleyicisi AdvantageScope'un güncel bir sürümünü içerir, ancak doğrudan indirilebilen en son sürümün biraz gerisinde kalabilir. AdvantageScope'u WPILib VS Code üzerinden nasıl başlatacağınızı [buradaki belgede](https://docs.wpilib.org/tr/stable/docs/software/dashboards/advantagescope.html) görebilirsiniz.

## Resmi olmayan dağıtımlar {#unofficial-distributions}

AdvantageScope'un resmi olmayan dağıtımları da çeşitli kaynaklarda mevcuttur; ancak AdvantageScope veya WPILib geliştiricileri bu dağıtımları resmi olarak desteklemez. Bu dağıtımlar, resmi kaynaklardaki en güncel AdvantageScope sürümünün gerisinde kalabilir. Bir sorun yaşarsanız lütfen doğrudan ilgili dağıtımın geliştiricileriyle iletişime geçin.

- [**REV Kontrol Sistemi için AdvantageScope Lite:**](https://github.com/j5155/AdvantageScope-Lite-FTC) Mevcut (Systemcore öncesi) FTC kontrol sisteminde kullanılmak üzere [AdvantageScope Lite](/more-features/advantagescope-lite) uygulamasının bir uyarlamasıdır.
- [**Homebrew Yükleyicisi:**](https://formulae.brew.sh/cask/advantagescope) macOS'ta komut satırından AdvantageScope kurmak için kullanılan bir Homebrew cask paketidir.
- [**Arch Kullanıcı Deposu (AUR):**](https://aur.archlinux.org/packages/advantagescope) pacman paket yöneticisiyle kullanabileceğiniz alternatif bir dağıtım yöntemidir (AdvantageScope'un resmi Arch dağıtımına [buradan](#6328-downloads) ulaşabilirsiniz).
- [**FRC-Nix:**](https://github.com/frc4451/frc-nix) Nix paket yöneticisi ve NixOS Linux dağıtımı için AdvantageScope'u da içeren, FIRST ile ilgili bir dizi Nix paketi ve bildirimsel NixOS modülüdür.
