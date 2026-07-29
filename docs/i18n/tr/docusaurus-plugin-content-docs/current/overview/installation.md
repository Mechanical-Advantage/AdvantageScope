---
sidebar_position: 1
---

# 📦 Kurulum

AdvantageScope'un resmi olarak desteklenen sürümü doğrudan Takım 6328'den veya WPILib yükleyicisi aracılığıyla edinilebilir. Çeşitli resmi olmayan dağıtımlar da mevcuttur.

## Takım 6328 {#team-6328}

### İndirmeler: [Kararlı](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest), [Ön Sürüm](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

AdvantageScope'u doğrudan Takım 6328'den indirmek aşağıdakileri sağlar:

- Diğer kanallardan sunulmadan önce en son özellikleri ve hata düzeltmelerini.
- İndirilecek yeni bir sürüm olduğunda uygulama içi uyarıları.
- 👀 [3B saha](/tab-reference/3d-field) sekmesinde kullanılmak üzere son 6328 robot modellerinin yerleşik bir koleksiyonunu.

:::note
Ubuntu 23.10 veya sonraki sürümlerde AppImage derlemelerini çalıştırmadan önce, sürümler sayfasından AppArmor profilini indirmeli ve /etc/apparmor.d dizinine kopyalamalısınız.
:::

:::info
AdvantageScope'un her bir ana sürümü, FRC başlangıcından (kickoff) önce Ocak ayında, yıla karşılık gelen bir sürüm numarasıyla yayınlanır (örneğin v26.0.0, Ocak 2026'da yayınlanacaktır). AdvantageScope'un beta ve alfa sürümleri, yeni özellikleri denemek ve geri bildirim sağlamak isteyen takımlar için her sürüm öncesindeki aylarda mevcut olabilir. **Bu ön sürümleri kullanan takımlar, kararlı sürümlerde bulunmayan sorunlar ve hatalarla karşılaşmayı beklemelidir.**
:::

## WPILib

### Kurulum: [WPILib Dokümantasyonu](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

WPILib yükleyicisi AdvantageScope'un yakın tarihli bir sürümünü içerir, ancak doğrudan indirme için mevcut olan en son sürümün gerisinde kalabilir. AdvantageScope'u VSCode'un WPILib sürümünden başlatma dokümantasyonu [burada](https://docs.wpilib.org/en/stable/docs/software/dashboards/advantagescope.html) bulunabilir.

## Resmi Olmayan Dağıtımlar

AdvantageScope'un resmi olmayan dağıtımları, AdvantageScope/WPILib geliştiricileri tarafından resmi olarak desteklenmeyen çeşitli kaynaklardan edinilebilir. Bu dağıtımlar resmi kaynaklardan edinilebilen en son AdvantageScope sürümünün gerisinde kalabilir. Sorun olması durumunda lütfen doğrudan bakımı yapan kişilerle iletişime geçin.

- [**REV Kontrol Sistemi için AdvantageScope Lite:**](https://github.com/j5155/AdvantageScope-Lite-FTC) Mevcut (Systemcore öncesi) FTC kontrol sisteminde kullanılmak üzere [AdvantageScope Lite](/more-features/advantagescope-lite) uygulamasının bir uyarlaması.
- [**Homebrew Yükleyicisi:**](https://formulae.brew.sh/cask/advantagescope) macOS'ta komut satırından AdvantageScope kurmak için bir Homebrew cask'i.
- [**Arch Kullanıcı Deposu (AUR):**](https://aur.archlinux.org/packages/advantagescope) pacman paket yöneticisi ile kullanım için alternatif bir dağıtım yöntemi (AdvantageScope'un resmi Arch dağıtımı [burada](#6328-downloads) mevcuttur).
