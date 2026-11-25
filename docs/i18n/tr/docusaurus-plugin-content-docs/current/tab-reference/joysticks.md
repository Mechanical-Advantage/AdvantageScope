---
sidebar_position: 8
---

# 🎮 Joystickler {#joysticks}

Joystickler sekmesi altı adede kadar bağlı kontrolcünün durumunu gösterir. Aşağıdaki görsel, iki Xbox kontrolcüsü ve bir genel joystick içeren örnek bir düzeni gösterir. Basılan her düğme vurgulanır; ayrıca joysticklerin ve diğer eksenlerin durumları da görüntülenir.

<img src="/img/tab-reference/joysticks-1.webp" alt="Joystickler sekmesine genel bakış" />

_Yukarıda İngilizce arayüz gösterilmiştir._

<details>
<summary>Zaman çizelgesi kontrolleri</summary>

Zaman çizelgesi, oynatmayı ve görselleştirmeyi kontrol etmenizi sağlar. Zaman çizelgesine tıklayarak bir anı seçebilir, sağ tıklayarak seçimi kaldırabilirsiniz. Seçilen zaman tüm sekmelerde senkronize edildiği için aynı anı diğer görünümlerde de kolayca bulabilirsiniz.

Sarı bölümler robotun otonomda, mavi bölümler teleop modunda, gri bölümler ise test modunda olduğu aralıkları gösterir.

Yakınlaştırmak için imleci zaman çizelgesinin üzerine getirip yukarı veya aşağı kaydırın. `Shift` tuşunu basılı tutarak tıklayıp sürüklediğinizde belirli bir aralığı da seçebilirsiniz. Yatay kaydırma yaparak (desteklenen cihazlarda) veya zaman çizelgesini tıklayıp sürükleyerek sağa ve sola hareket edebilirsiniz. Canlı bağlantıdayken sola kaydırmak mevcut zamandaki kilidi açar, en sağa kadar kaydırmak ise tekrar mevcut zamana kilitler. Robotun etkin olduğu aralığa yakınlaştırmak için `Ctrl+\` tuşlarına basın.

<img src="/img/tab-reference/timeline.webp" alt="Zaman çizelgesi" />

</details>

## Kontrol paneli {#control-pane}

Sekmenin altındaki tablodan joystick türlerini seçin. Joystick ID'leri 0 ile 5 arasındadır ve Sürücü İstasyonu ile WPILib'deki ID'lerle eşleşir. Joystickler hakkında daha fazla bilgi için [WPILib dokümantasyonuna](https://docs.wpilib.org/tr/stable/docs/software/basic-programming/joystick.html) göz atabilirsiniz.

AdvantageScope, tüm düğmeleri, eksenleri ve POV'leri ızgara düzeninde gösteren “Genel Joystick” (yukarıdaki görselde) dahil olmak üzere yaygın joystick modellerini içerir. Özel bir joystick eklemek için [Özel Varlıklar](/more-features/custom-assets) bölümüne bakın.

:::warning
**Joystick verileri, standart WPILib ile NetworkTables bağlantısı üzerinden ALINAMAZ.** WPILib log dosyaları ([joystick loglaması etkinleştirilmiş](https://docs.wpilib.org/tr/stable/docs/software/telemetry/datalog.html#logging-joystick-data) şekilde), AdvantageKit logları, AdvantageKit canlı akışı ve FIRST Driver Station verileri desteklenir.
:::
