# 🛜 Canlı kaynaklar {#live-sources}

AdvantageScope'taki tüm görselleştirmeler, log dosyalarının yanı sıra bir robottan veya simülatörden gelen canlı verileri de gösterecek şekilde tasarlanmıştır. Bu bölümde gerçek zamanlı veri kaynaklarına nasıl bağlanacağınızı bulabilirsiniz. AdvantageScope şu canlı veri kaynaklarını destekler:

- **NetworkTables:** WPILib'in temel ağ protokolüdür. Ayrıntılar için [WPILib belgelerine](https://docs.wpilib.org/tr/stable/docs/software/networktables/index.html) göz atabilirsiniz.
- **NetworkTables (AdvantageKit):** NetworkTables'taki `AdvantageKit` tablosuna veri yayınlayan AdvantageKit tabanlı robot kodları için tasarlanmıştır.
- **Systemcore tanılama:** Robot durumu ve cihaz G/Ç gibi tanılama verilerini içeren, Systemcore işletim sisteminin yerleşik NetworkTables sunucusuna bağlanır.
- **Phoenix tanılama:** [Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/) kullanan CTRE CAN cihazlarından veri akışı almak için HTTP üzerinden bir Phoenix [tanılama sunucusuna](https://pro.docs.ctr-electronics.com/en/latest/docs/troubleshooting/running-diagnostics.html) bağlanır. Bu özellik, Phoenix Tuner'daki [grafik çizme özelliğine](https://pro.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) benzer. Daha fazla bilgi için [ilgili sayfaya](/overview/live-sources/phoenix-diagnostics) göz atabilirsiniz.
- **RLOG sunucusu:** AdvantageKit'in NetworkTables'a alternatif olarak desteklediği protokoldür. Bağlantı varsayılan olarak 5800 portu üzerinden kurulur.
- **FTC Dashboard:** [FTC Dashboard](https://acmerobotics.github.io/ftc-dashboard) üzerine veri yayınlayan FTC robotlarıyla entegre çalışır.

:::info
AdvantageScope, Sürücü İstasyonu (DS) uygulamasıyla aynı bilgisayarda çalışırken tanılama verilerini görmek için FIRST Sürücü İstasyonu'na bağlanabilir. Bunun için herhangi bir ek ayar gerekmez (aşağıdaki adımları izlemeniz yeterlidir).
:::

## Bağlantıyı başlatma {#starting-the-connection}

Canlı bağlantıyı başlatmak için:

- **Robot:** `Dosya` > `Robota bağlan` > `Varsayılan` yolunu izleyin veya listeden belirli bir canlı kaynak seçin.
- **Simülatör:** `Dosya` > `Simülatöre bağlan` > `Varsayılan` yolunu izleyin veya listeden belirli bir canlı kaynak seçin.
- **Sürücü İstasyonu:** `Dosya` > `Sürücü İstasyonuna bağlan` seçeneğine tıklayın.

Hedefe bağlanana kadar pencere başlığında IP adresi ve “Aranıyor” yazısı görünür. Bağlantı koparsa AdvantageScope aynı ayarlarla otomatik olarak yeniden bağlanmayı dener.

## Canlı verileri görüntüleme {#viewing-live-data}

Canlı bir kaynağa bağlandığınızda AdvantageScope, varsayılan olarak tüm sekmeleri o anki zamana kilitler. 📉 [Çizgi grafik](/tab-reference/line-graph) ve 🔢 [Tablo](/tab-reference/table) gibi görünümler otomatik olarak kayar; saha ve joystick gibi görünümler ise her alanın güncel değerini gösterir. Gezinme çubuğundaki kırmızı ok düğmesine tıklayarak bu kilidi açabilir, geçmiş verileri inceleyip yeniden oynatabilirsiniz.

<img src="/img/overview/live-sources/open-live-1.webp" alt="Canlı kilitleme/kilidi açma düğmesi" />

:::tip
Çizgi grafikte veya zaman çizelgesinde sola kaydırdığınızda mevcut zamana olan kilit açılır; en sağa kaydırdığınızda ise tekrar kilitlenir.
:::

## Yapılandırma {#configuration}

`Uygulama` > `Tercihleri göster...` (Windows/Linux) veya `AdvantageScope` > `Ayarlar...` (macOS) yolunu izleyerek tercihler penceresini açın.

<img src="/img/prefs_tr.webp" alt="Tercihler penceresi" height="450" />

### Robot adresi {#robot-address}

[WPILib belgelerinde](https://docs.wpilib.org/tr/stable/docs/networking/networking-introduction/ip-configurations.html#te-am-ip-notation) anlatıldığı gibi robot adresini bir ana bilgisayar adı (örneğin `robot.local`) veya IP adresi (örneğin `10.TE.AM.2`) olarak girin. Systemcore'a USB veya yerleşik Wi-Fi erişim noktası üzerinden bağlanırken doğru statik IP adresini geçici olarak kullanmak için `Dosya` > `Systemcore USB adresini kullan` / `Systemcore Wi-Fi adresini kullan` seçeneğine tıklayın.

### Canlı mod {#live-mode}

Canlı kaynak olarak NetworkTables kullanıyorsanız şu iki moddan birini seçebilirsiniz:

- **Düşük bant genişliği (Varsayılan):** AdvantageScope sunucudan yalnızca o anda kullandığınız alanların verilerini ister. Bir alanı seçmeden önce yayınlanan veriler görünmez. Ağ bant genişliğinin kısıtlı olduğu ortamlarda veya çok sayıda alan yayınlandığında bu modu kullanmanız **kesinlikle önerilir**.
- **Loglama:** AdvantageScope, o anda kullanıp kullanmadığınıza bakmaksızın tüm alanlar için veri ister. Böylece canlı akışı duraklatıp diğer alanları da geriye dönük olarak inceleyebilirsiniz (yukarıdaki “Canlı verileri görüntüleme” bölümüne bakın). Bu mod geliştirme sırasında oldukça kullanışlıdır, ancak **bant genişliği kısıtlıysa KULLANILMAMALIDIR**.

### Canlı veriyi temizle {#discard-live-data}

Canlı bağlantı sırasında, geçmiş verileri yeniden oynatabilmeniz için veriler yerel olarak tutulur (yukarıdaki “Canlı verileri görüntüleme” bölümüne bakın). Bellek kullanımının aşırı artmasını önlemek için bu veriler varsayılan olarak 20 dakika sonra atılır. Bellek kullanımını azaltmak için daha kısa bir süre seçebilir ya da canlı verileri süresiz tutmak için “Asla”yı seçebilirsiniz.
