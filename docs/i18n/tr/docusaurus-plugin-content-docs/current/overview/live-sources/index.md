# 🛜 Canlı kaynaklar

AdvantageScope'taki tüm görselleştirmeler, log dosyalarının yanı sıra bir robottan veya simülatörden canlı veri almak üzere tasarlanmıştır. Bu bölüm, gerçek zamanlı veri kaynaklarına nasıl bağlanılacağını açıklamaktadır. AdvantageScope tarafından aşağıdaki canlı veri kaynakları desteklenmektedir:

- **NetworkTables:** Bu, WPILib'in birincil ağ protokolüdür. Detaylar için [WPILib dokümantasyonuna](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html) bakın.
- **NetworkTables (AdvantageKit):** Bu mod, NetworkTables'daki `AdvantageKit` tablosunda yayın yapan AdvantageKit çalıştıran robot kodları ile kullanım için tasarlanmıştır.
- **Systemcore Tanılama:** Bu mod, robot durumu ve cihaz G/Ç gibi tanılama verilerini içeren Systemcore OS tarafından kullanılan yerleşik NetworkTables sunucusuna bağlanır.
- **Phoenix Tanılama:** Bu mod, [Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/) ile CTRE CAN cihazlarından veri akışına izin veren bir Phoenix [tanılama sunucusuna](https://pro.docs.ctr-electronics.com/en/latest/docs/troubleshooting/running-diagnostics.html) bağlanmak için HTTP kullanır. Bu, Phoenix Tuner'daki [grafik çizme özelliğine](https://pro.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) benzer. Daha fazla bilgi için [bu sayfaya](/overview/live-sources/phoenix-diagnostics) bakın.
- **RLOG Sunucusu:** Bu protokol, NetworkTables'a bir alternatif olarak AdvantageKit tarafından desteklenmektedir. Bağlantı varsayılan olarak 5800 portu üzerinden başlatılır.
- **FTC Dashboard:** Bu mod, [FTC Dashboard](https://acmerobotics.github.io/ftc-dashboard) platformuna veri yayınlayan FTC robotlarıyla entegre olur.

:::info
AdvantageScope, Driver Station (DS) uygulamasıyla aynı cihazda çalışırken tanılama verilerini görüntülemek için FIRST Driver Station'a bağlanabilir. Herhangi bir yapılandırma gerekmez (aşağıdaki talimatlara bakın).
:::

## Bağlantıyı başlatma

Canlı bağlantıyı başlatmak için şu adımları izleyin:

- **Robot:** `Dosya` > `Robota bağlan` > `Varsayılan` veya belirli bir canlı kaynağa tıklayın
- **Simülatör:** `Dosya` > `Simülatöre bağlan` > `Varsayılan` veya belirli bir canlı kaynağa tıklayın
- **Driver Station:** `Dosya` > `Driver Station'a bağlan` seçeneğine tıklayın

Pencere başlığı, hedef bağlanana kadar IP adresini ve "Aranıyor" metnini gösterir. AdvantageScope, bağlantı kesildikten sonra aynı ayarları kullanarak otomatik olarak yeniden bağlanmaya çalışır.

## Canlı verileri görüntüleme

Canlı bir kaynağa bağlandığında AdvantageScope, varsayılan olarak tüm sekmeleri mevcut zamana kilitler. 📉 [Çizgi grafik](/tab-reference/line-graph) ve 🔢 [Tablo](/tab-reference/table) gibi görünümler otomatik kaydırılır ve saha ile joystick gibi görünümler her alanın mevcut değerlerini görüntüler. Gezinme çubuğundaki kırmızı ok düğmesine tıklamak bu kilidi açıp kapatır ve geçmiş verilerin görüntülenmesini ve yeniden oynatılmasını sağlar.

<img src="/img/overview/live-sources/open-live-1.png" alt="Live lock/unlock button" />

:::tip
Çizgi grafiğinde veya zaman çizelgesinde sola kaydırmak mevcut zamandan kilidi kaldırır ve en sağa kadar kaydırmak tekrar mevcut zamana kilitler.
:::

## Yapılandırma

`Uygulama` > `Tercihleri göster...` (Windows/Linux) veya `AdvantageScope` > `Ayarlar...` (macOS) seçeneğine tıklayarak tercihler penceresini açın.

<img src="/img/prefs.png" alt="Diagram of preferences" height="350" />

### Robot adresi

[WPILib dokümantasyonunda](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/ip-configurations.html#te-am-ip-notation) açıklandığı şekilde bir 10.TE.AM.2 IP adresi kullanarak robot adresini girin. Systemcore'a USB veya yerleşik Wi-Fi erişim noktası aracılığıyla bağlanırken, doğru statik IP adresini geçici olarak kullanmak için `Dosya` > `Systemcore USB Adresini Kullan`/`Systemcore Wi-Fi Adresini Kullan` seçeneğine tıklayın.

### Canlı mod

Canlı kaynak olarak NetworkTables kullanıldığında aşağıdaki canlı modlar seçilebilir:

- **Düşük Bant Genişliği (Varsayılan):** AdvantageScope yalnızca aktif olarak kullanılan alanlar için sunucudan veri talep eder. Bir alan seçilmeden önce yayınlanan veriler mevcut olmayacaktır. Bu mod, sınırlı ağ bant genişliğine sahip bir ortamda çalışırken veya çok sayıda alan yayınlanırken **şiddetle tavsiye edilir**.
- **Loglama:** AdvantageScope, aktif olarak kullanılıp kullanılmadıklarına bakılmaksızın tüm alanlar için veri talep eder. Bu, canlı veri akışını duraklatarak alanların geriye dönük olarak görüntülenebileceği anlamına gelir (aşağıya bakın). Bu mod genellikle geliştirme sırasında kullanışlıdır, ancak **bant genişliği sınırlı olduğunda KULLANILMAMALIDIR**.

### Canlı verileri sil

Canlı bir bağlantı sırasında veriler, geçmiş verilerin yeniden oynatılmasına izin vermek için yerel olarak saklanır (aşağıdaki "Canlı Verileri Görüntüleme" bölümüne bakın). Çok yüksek bellek kullanımını önlemek için veriler varsayılan olarak 20 dakika sonra silinir. Bellek kullanımını azaltmak için daha kısa bir periyot seçilebilir veya canlı verileri süresiz olarak saklamak için "Hiçbir zaman" seçilebilir.
