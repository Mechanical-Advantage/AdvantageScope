# AdvantageScope XR {#advantagescope-xr}

AdvantageScope XR, 👀 [3B saha](/tab-reference/3d-field) görünümünü artırılmış gerçeklik (AR) ile fiziksel ortama taşıyarak verilerinizi yepyeni yollarla incelemenizi sağlar. Simüle edilmiş bir otonomu gerçek boyutunda izleyin, masaüstü saha modeliyle maç stratejisi kurun, gerçek robotunuzun üzerine tanılama verilerini bindirin ve çok daha fazlasını yapın! Aşağıdaki videoda bu özelliğin farklı kullanım örneklerini görebilirsiniz:

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/gWPhQyB66DQ" title="AdvantageScope XR: Feature Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Gereksinimler {#requirements}

- **Ana Bilgisayar:** Windows, macOS veya Linux üzerinde AdvantageScope masaüstü uygulaması (v4.1.0 veya üzeri). Cihazdaki güvenlik duvarları [devre dışı bırakılmalıdır](https://docs.wpilib.org/tr/stable/docs/networking/networking-introduction/windows-firewall-configuration.html#disabling-windows-firewall).
- **İstemci:** iOS/iPadOS 16 veya üzerini çalıştıran bir iPhone ya da iPad. Herhangi bir uygulama yüklemeniz gerekmez.
- **Ağ:** Her iki cihaz da aynı ağa bağlı olmalıdır (Wi-Fi, USB internet paylaşımı vb.). Aşağıdaki madde dışında bu ağın internete bağlı olması gerekmez.
- **İnternet:** AdvantageScope XR yakın zamanda kullanılmadıysa mobil cihazda internet bağlantısı (örneğin hücresel veri) bulunmalıdır. Bu gereksinimi ortadan kaldırmak için aşağıdaki [çevrimdışı kullanım](#offline-usage) bölümüne göz atın.

:::tip
AdvantageScope XR birçok iPhone ve iPad modelinde çalışır, ancak **LiDAR sensörüne** sahip cihazlarda (iPhone 12 Pro ve sonrası Pro modeller ile 2020 İlkbahar ve sonrası iPad Pro'lar) çok daha kararlı bir deneyim sunar.
:::

<details>
<summary>Diğer platformlar ne olacak?</summary>

AdvantageScope XR yalnızca iOS ve iPadOS üzerinde desteklenir; yakın vadede başka platformlar için destek planlanmıyor. İstemci uygulaması artırılmış gerçeklik, video kaydı ve web tabanlı görüntüleme gibi konularda yerel API'lerle sıkı bir entegrasyon gerektirir. Geliştirme ve destek önceliğinin iOS ve iPadOS'a verilmesinin başlıca nedenleri şunlardır:

- **Tutarlılık:** AdvantageScope XR yüksek sistem kaynağı gerektiren bir uygulamadır. Android cihazlar işlem gücü ve donanım özellikleri açısından çok büyük farklılıklar gösterirken, iPhone ve iPad nesiller boyunca tutarlı bir geliştirme deneyimi sunar. Tüm güncel iOS ve iPadOS cihazları AdvantageScope XR'ı rahatlıkla çalıştırabilir; yeni modeller ise LiDAR gibi ek özelliklerden yararlanır.

- **Erişilebilirlik:** Amerika Birleşik Devletleri'ndeki öğrencilerin sahip olma veya arkadaşlarından kolayca ödünç alma olasılığı en yüksek akıllı telefon hâlâ iPhone'dur ve herhangi bir VR ya da karma gerçeklik başlığından çok daha yaygındır. iOS desteği, AdvantageScope XR'a kolayca erişebilen kullanıcı sayısını en üst düzeye çıkarır.

- **Tablet Desteği:** Birden fazla kişinin ekranı aynı anda görebilmesi için AdvantageScope XR'ı tablette kullanmak büyük avantaj sağlar. iPad dünya genelinde en yaygın tablet olduğu için iPadOS desteği bu deneyimi herkes için daha erişilebilir kılar.

</details>

## Kurulum {#setup}

1. Ana bilgisayarda herhangi bir 3B saha sekmesindeki **“XR” düğmesine tıklayın**. Aynı anda yalnızca tek bir XR oturumu açık olabileceğinden, bu düğmeye tıklamak varsa diğer aktif oturumları sonlandırır.

<img src="/img/tab-reference/3d-field/xr-1.webp" alt="XR düğmesi" height="450" />

_Yukarıda İngilizce arayüz gösteriliyor._

2. QR kodunu ve AR deneyimini özelleştirebileceğiniz [seçenekleri](#options) içeren **XR kontrolleri penceresi** açılır. XR oturumunu iptal etmek ve tüm istemcilerin bağlantısını kesmek için bu pencereyi kapatmanız yeterlidir.

<img src="/img/tab-reference/3d-field/xr-2.webp" alt="XR penceresi" height="350" />

_Yukarıda İngilizce arayüz gösteriliyor._

3. İstemci cihazınızdaki **yerleşik kamera uygulamasıyla** QR kodunu okutun. Herhangi bir uygulama indirmeniz gerekmez.
4. Deneyimi başlatıp ana bilgisayara bağlanmak için ekranda çıkan “AdvantageScope XR” bildirimine, ardından “Aç” seçeneğine dokunun. İstendiğinde AdvantageScope XR'ın **kamera ve yerel ağa** erişmesine izin verin.
5. **Saha modelini kalibre edip konumlandırmak** için cihazdaki yönergeleri izleyin.
6. **Log yeniden oynatma ve canlı akış** dahil olmak üzere saha modelini ana bilgisayardan her zamanki gibi kontrol edin. Saha modelinin durumu istemci cihazında canlı olarak görünür.
7. Hızlıca **video kaydetmek** için ekranın üst kısmındaki “Kaydet” simgesine dokunun. Kaydı durdurmak için simgeye tekrar dokunun, ardından klibi düzenleyip kaydedin.

:::warning
Isı haritaları ve swerve modülü hızları henüz XR'da kullanılamıyor. Diğer tüm nesne türleri destekleniyor.
:::

:::tip
AdvantageScope XR yüksek sistem kaynağı gerektiren bir uygulamadır; 3B sahnenin karmaşıklığına bağlı olarak performans düşüşleri yaşanabilir. Gerekirse daha sade robot modelleri veya daha az nesne kullanmayı deneyin.
:::

## Seçenekler {#options}

XR kontrolleri penceresi, modelin artırılmış gerçeklikte nasıl görüneceğini belirleyen çeşitli seçenekler sunar:

- **Kalibrasyon:**
  - Saha modelini masaüstü kullanıma uygun küçültülmüş boyutta görmek için _Minyatür_ modunu kullanın.
  - Gerçek bir saha bariyerine hizalanmış, birebir ölçekli saha görmek için _Tam boyut_ modunu kullanın. _Mavi ittifak_ ve _Kırmızı ittifak_ arasında geçiş yapmak kalibrasyonun sahanın hangi tarafından yapılacağını belirler, ancak her iki durumda da sahanın tamamı görüntülenir.
- **Akış:**
  - Otonom rutinleri simüle etmek veya log dosyalarını oynatmak gibi biraz gecikmenin sorun olmadığı, daha kararlı bir akış gereken durumlarda _Akıcı_ modunu kullanın.
  - Gerçek bir robotun üzerine veri bindirmek veya simüle edilmiş bir robotu teleop modunda sürmek gibi hafif titremenin kabul edilebildiği gerçek zamanlı kullanımlarda _Düşük gecikme_ modunu kullanın.
- **Zemini göster:** Gerçek bir yüzey üzerine yerleştirmek yerine sahanın altında düz halı/karo zemin modelini gösterir.
- **Sahayı göster:** Saha bariyeri ve oyuna özel öğeler dahil tüm saha modelini gösterir. Özel [oyun objesi nesneleri](/tab-reference/3d-field#game-piece-objects) her zaman görünür.
- **Robotları göster:** Robot modellerini gösterir; gerçek bir robotun üzerine veri bindirirken (örneğin kamera hedefleri veya 2B mekanizmalar) kapatılabilir.

## Çevrimdışı kullanım {#offline-usage}

AdvantageScope XR internet bağlantısı olmadan da çalışır. Uygulamanın çevrimdışı kullanıma hazır olması için aşağıdaki bağlantıyı kullanarak App Store'dan AdvantageScope XR'ı indirin. Masaüstü uygulamasına bağlanmak için iOS kamera uygulamasıyla QR kodunu okutabilir veya AdvantageScope XR uygulamasındaki “Tara” düğmesine dokunabilirsiniz.

[<img src="/img/tab-reference/3d-field/app-store.svg" alt="App Store" />](https://apps.apple.com/us/app/advantagescope-xr/id6739718081)

:::note
İnternet bağlantısı olmadan çalışırken bile ana bilgisayar ve istemci cihaz **aynı ağa bağlı olmalıdır** (örneğin bir robot ağı, özel Wi-Fi ağı veya USB internet paylaşımı).
:::
