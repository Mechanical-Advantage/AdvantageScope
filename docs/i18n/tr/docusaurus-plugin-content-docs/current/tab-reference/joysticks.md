---
sidebar_position: 8
---

# 🎮 Joystickler {#joysticks}

Joystickler sekmesi altı adede kadar bağlı kontrolcünün durumunu gösterir. Aşağıdaki resim iki Xbox kontrolcüsü ve genel bir joystick içeren örnek bir düzeni göstermektedir. Her düğme basıldığında vurgulanır ve joysticklerin ve diğer eksenlerin durumları görüntülenir.

<img src="/img/tab-reference/joysticks-1.png" alt="Overview of joystick tab" />

<details>
<summary>Zaman Çizelgesi Kontrolleri</summary>

Zaman çizelgesi oynatmayı ve görselleştirmeyi kontrol etmek için kullanılır. Zaman çizelgesine tıklamak bir zaman seçer ve sağ tıklamak seçimi kaldırır. Seçilen zaman tüm sekmeler arasında senkronize edilir, bu da bu konumu diğer görünümlerde hızlıca bulmayı kolaylaştırır.

Sarı bölümler robotun otonomda olduğu zamanları, mavi bölümler robotun teleoperasyonda olduğu zamanları ve gri bölümler robotun test modunda olduğu zamanları gösterir.

Yakınlaştırmak için imleci zaman çizelgesinin üzerine getirin ve yukarı veya aşağı kaydırın. `Shift` tuşunu basılı tutarken tıklayıp sürükleyerek bir aralık da seçilebilir. Yatay olarak kaydırarak (desteklenen cihazlarda) veya zaman çizelgesinde tıklayıp sürükleyerek sola ve sağa hareket edin. Canlı bağlandığında sola kaydırmak mevcut zamandan kilidi kaldırır ve en sağa kadar kaydırmak tekrar mevcut zamana kilitler. Robotun etkin olduğu periyoda yakınlaştırmak için `Ctrl+\` tuşlarına basın.

<img src="/img/tab-reference/timeline.png" alt="Timeline" />

</details>

## Kontrol paneli {#control-pane}

Sekmenin altındaki tabloda joystick türlerini seçin. Joystick ID'leri 0 ile 5 arasında değişir ve Sürücü İstasyonu ile WPILib'deki ID'lerle eşleşir. Joystickler hakkında daha fazla bilgi [WPILib dokümantasyonunda](https://docs.wpilib.org/tr/stable/docs/software/basic-programming/joystick.html) bulunabilir.

AdvantageScope, bir ızgara formatında tüm düğmeleri, eksenleri ve POV'leri içeren bir "Genel Joystick" (yukarıda görülen) dahil olmak üzere bir dizi yaygın joystick içerir. Özel bir joystick eklemek için [Özel Varlıklar](/more-features/custom-assets) bölümüne bakın.

:::warning
**Joystick verileri varsayılan WPILib ile NetworkTables bağlantısı üzerinden MEVCUT DEĞİLDİR.** WPILib log dosyaları ([joystick loglaması etkinleştirilmiş](https://docs.wpilib.org/tr/stable/docs/software/telemetry/datalog.html#logging-joystick-data) olarak), AdvantageKit logları ve AdvantageKit akışı desteklenmektedir.
:::
