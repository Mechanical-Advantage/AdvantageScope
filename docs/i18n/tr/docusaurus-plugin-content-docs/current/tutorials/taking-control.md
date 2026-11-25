---
sidebar_position: 3
---

# 🕹️ Kontrolü ele alma: DS ve joystickler

Sürücü girişlerini ve iletişim sağlığını anlamak, sahadaki sorunları ayıklarken kritik öneme sahiptir. AdvantageScope, [FIRST Driver Station](https://docs.wpilib.org/tr/latest/docs/software/firstdriverstation) ile sorunsuz entegrasyon sunarak canlı tanılamayı izlemenize, Sürücü İstasyonu loglarını incelemenize ve kontrolcü girişlerini görselleştirmenize olanak tanır.

Bu eğitimde şunları öğreneceksiniz:

- Doğrudan **FIRST Driver Station** üzerinden AdvantageScope'a erişme.
- Canlı Sürücü İstasyonu tanılamasına bağlanma.
- **Robot üzerindeki logları** **Sürücü İstasyonu logları** ile karşılaştırma ve senkronize etme.
- **💬 Konsol** sekmesinde konsol çıktılarını ve hata mesajlarını görüntüleme.
- **🎮 Joystickler** sekmesinde joystick girişlerini ve kontrolcü düzenlerini görselleştirme.

## 1. FIRST Driver Station'dan AdvantageScope'a erişme

💡 [AdvantageScope Lite](/more-features/advantagescope-lite) doğrudan FIRST Driver Station'a entegre edilmiştir. ⚙️ simgesine ve ardından “Open Log Viewer in Browser” seçeneğine tıklayarak erişebilirsiniz.

<img src="/img/tutorials/taking-control-1.webp" alt="FIRST Driver Station içindeki &quot;Open Log Viewer In Browser&quot; düğmesi" />

_Yukarıda İngilizce arayüz gösteriliyor._

## 2. Sürücü İstasyonuna canlı bağlanma

FIRST Driver Station ile aynı dizüstü bilgisayarda çalışırken, AdvantageScope masaüstü uygulaması da Sürücü İstasyonu durumu hakkında canlı telemetri ve tanılama akışı sağlayabilir:

1. Hem FIRST Driver Station'ı hem de AdvantageScope'u başlatın.
2. Üst menüden `Dosya` > `Sürücü İstasyonuna bağlan` seçeneğini seçin.
3. AdvantageScope; gerçek zamanlı maç durumunu, akü voltajını, joystick durumlarını vb. aktarmak için yerel Sürücü İstasyonu servisine bağlanacaktır.
4. Canlı DS tanılamasını görüntülemek için 📉 [Çizgi grafik](/tab-reference/line-graph) veya 🔢 [Tablo](/tab-reference/table) sekmesini açın.

:::tip
Canlı kaynak olarak Sürücü İstasyonuna hızlıca bağlanmak için `Ctrl+Option+Shift+K` (macOS) veya `Ctrl+Alt+Shift+K` (Windows/Linux) klavye kısayolunu da kullanabilirsiniz.
:::

## 3. Sürücü İstasyonu logları ve robot üzerindeki loglar

Bir maç veya antrenman seansı sonrasında robot davranışını teşhis ederken göz önünde bulundurulması gereken iki ana log türü vardır:

| Log Türü                     | Kaynak                               | Kaydedilen Veriler                                                                                                                                                   |
| :--------------------------- | :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Robot Üzerindeki Loglar**  | `DataLogManager` ile Systemcore      | Yüksek frekanslı telemetri (50+ Hz), robot durumu, joystick durumu, sensör ölçümleri, motor akımları, PID kontrolcü durumları, poz tahminleri ve mekanizma verileri. |
| **Sürücü İstasyonu Logları** | Sürücü İstasyonu Dizüstü Bilgisayarı | Ağ gidiş-dönüş süresi (gecikme), paket kaybı %, radyo ping'i, akü voltajı, robot kontrolcüsü CPU %, konsol verileri, robot durumu ve joystick durumu.                |

:::important Robot Üzerindeki Loglar Genellikle Tercih Edilir
**Robot üzerindeki loglar** doğrudan kaynakta zengin, yüksek frekanslı telemetri kaydettiğinden, robot davranışını, kontrol döngülerini ve otonom yolları incelemek için genellikle tercih edilir. Ancak **DS logları**, robotun kendi başına ölçemediği kritik harici ağ ve maç olaylarını yakalar.

Joystick verileri [aşağıda](#6-visualizing-joysticks) gösterildiği gibi **her iki logda da** yakalanır.
:::

## 4. Birden fazla logu birleştirme ve senkronize etme

AdvantageScope, birden fazla kaynaktan gelen logları tek bir zaman çizelgesinde açmanıza ve senkronize etmenize olanak tanır:

1. `Dosya` > `Log aç...` seçeneğini kullanarak robot üzerindeki log dosyanızı açın (veya `.wpilog` dosyasını doğrudan AdvantageScope'un içine sürükleyin).
2. Menü çubuğunda `Dosya` > `Yeni log ekle...` seçeneğini seçin ve ilgili Sürücü İstasyonu logunu seçin.
3. AdvantageScope her iki logu otomatik olarak senkronize bir zaman çizelgesinde hizalayacaktır! Her logdaki alanlar ayrı tablolar altında düzenlenir (ör. `Log0` ve `Log1`).
4. Artık beklenmedik bir robot davranışının bir radyo kesintisi veya voltaj düşüşüyle (brownout) çakışıp çakışmadığını görmek için robot telemetrisini (motor akımı veya poz tahminleri gibi) doğrudan Sürücü İstasyonu sinyallerinin (paket kaybı veya akü voltajı gibi) üzerine 📉 [Çizgi grafik](/tab-reference/line-graph) sekmesinde yerleştirebilirsiniz.

<img src="/img/overview/log-files/open-file-1.webp" alt="AdvantageScope'ta kayıtlı log dosyalarını açma." />

_Yukarıda İngilizce arayüz gösteriliyor._

## 5. Konsol verilerini görüntüleme

💬 [Konsol](/tab-reference/console) sekmesi, robot veya Sürücü İstasyonu tarafından yazdırılan metin çıktılarını ve hata loglarını görüntülemenizi sağlar. Konsol verileri her iki log dosyasına da kaydedilebilir:

- **Robot Üzerindeki Loglar:** WPILib'in `DataLogManager` sınıfı robot konsol çıktısını otomatik olarak kaydeder.
- **Sürücü İstasyonu Logları:** DS'de konsol çıktısı ve sistem olay mesajları `DS:/Dscomm/Console` alanına kaydedilir.

Konsol verilerini görüntülemek için:

1. Sekme çubuğundaki **+** düğmesine tıklayın ve **Konsol**u seçin.
2. Kenar çubuğundan konsol alanını (`DS:/Dscomm/Console` veya `messages`) ana görünüme sürükleyin.
3. Her satır, zaman damgasıyla birlikte bir log mesajını temsil eder. Tüm açık sekmelerdeki senkronize zaman çizelgesini o tam ana atlatmak için herhangi bir mesaja tıklayın!
4. Belirli mesajları aramak için “Filtrele” kutusunu kullanın (veya `Ctrl+F` / `Cmd+F` tuşlarına basın) ya da uyarı ve hata vurgulamayı açıp kapatmak için renk paleti simgesine tıklayın.

<img src="/img/tab-reference/console-1.webp" alt="Log mesajlarını gösteren Konsol sekmesi." />

_Yukarıda İngilizce arayüz gösteriliyor._

## 6. Joystickleri görselleştirme {#6-visualizing-joysticks}

🎮 [Joystickler](/tab-reference/joysticks) sekmesi, gerçekçi kontrolcü düzenleri üzerinde eksen hareketlerini, tetik çekmelerini, POV yönlerini ve düğme basımlarını göstererek 6 adede kadar oyun kontrolcüsünün gerçek zamanlı görsel temsilini sağlar. Joystick girişlerinin robot üzerindeki log dosyanıza kaydedildiğinden emin olmak için, 👋 [Merhaba, Telemetri!](/tutorials/hello-telemetry) sayfasında gösterildiği gibi `Robot` yapıcı metodunuzda `DataLogManager` ile birlikte `DriverStation.startDataLog()` metodunu başlatın.

1. Üst sekme çubuğundaki **+** düğmesine tıklayın ve **Joystickler**i seçin.
2. Sekmenin altındaki tabloda her joystick ID'sini (0'dan 5'e kadar) uygun düzene atayın (ör. **Xbox Kontrolcüsü**, **PS4 Kontrolcüsü** veya **Genel Joystick**).
3. Bir log dosyasında gezinirken veya Sürücü İstasyonundan canlı veri aktarırken, düğmeler yanacak ve analog çubuklar sürücünün eylemleriyle senkronize şekilde hareket edecektir!

<img src="/img/tab-reference/joysticks-1.webp" alt="Aktif kontrolcü düğme basımlarını ve analog çubuk konumlarını gösteren Joystickler sekmesi." />

_Yukarıda İngilizce arayüz gösteriliyor._

## Sırada ne var?

Tebrikler! Temel AdvantageScope eğitim serisini tamamladınız. Artık şunları nasıl yapacağınızı biliyorsunuz:

- **👋 [Merhaba, Telemetri!](/tutorials/hello-telemetry)** içinde telemetri kurma, canlı akışlara bağlanma ve grafikleri/tabloları görüntüleme.
- **🤖 [Sahaya](/tutorials/to-the-field)** içinde 2B/3B odometriyi, yörüngeleri ve mekanizmaları görselleştirme.
- **🕹️ [Kontrolü Ele Alma](/tutorials/taking-control)** içinde Sürücü İstasyonu tanılamasını aktarma, çok kaynaklı logları birleştirme ve joystick girişlerini yeniden oynatma.

AdvantageScope'un gelişmiş araçlarını ve özelliklerini keşfetmeye devam edin:

- **📂 [Log dosyaları](/overview/log-files):** Desteklenen log formatları, veri dışa aktarma ve toplu indirmeler hakkında bilgi edinin.
- **🛜 [Canlı kaynaklar](/overview/live-sources):** Ayar modu dahil canlı kaynaklara bağlanma hakkında ayrıntılı rehber.
- **[Sekme referansı](/category/tab-reference):** Her görselleştirme türünün özellikleri hakkında başvuru rehberleri.
- **[Daha fazla özellik](/category/more-features):** AdvantageScope'un ek özellikleri hakkında dokümantasyon ve teori.
