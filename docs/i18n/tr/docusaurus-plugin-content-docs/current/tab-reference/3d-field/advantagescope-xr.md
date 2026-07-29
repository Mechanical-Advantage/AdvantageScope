# AdvantageScope XR

AdvantageScope XR, 👀 [3B saha](/tab-reference/3d-field) görünümünü artırılmış gerçeklikte hayata geçirerek verileri yepyeni yollarla görselleştirmenizi sağlar. Gerçek boyutta simüle edilmiş bir otonomu görün, bir masaüstü saha modeliyle maç stratejisini inceleyin, tanılama bilgilerini gerçek bir robot üzerine çakıştırın ve çok daha fazlasını yapın! Aşağıdaki video bu özelliğin çeşitli kullanım durumlarını göstermektedir:

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/gWPhQyB66DQ" title="AdvantageScope XR: Feature Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Gereksinimler

- **Ana Bilgisayar:** Windows, macOS veya Linux üzerinde AdvantageScope masaüstü uygulaması (v4.1.0 veya üzeri). Cihazdaki tüm güvenlik duvarları [devre dışı bırakılmalıdır](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/windows-firewall-configuration.html#disabling-windows-firewall).
- **İstemci:** iOS/iPadOS 16 veya üzerini çalıştıran bir iPhone veya iPad. Herhangi bir uygulama kurulumu gerekmez.
- **Ağ:** Her iki cihaz da aynı ağa bağlı olmalıdır (Wi-Fi, USB internet paylaşımı vb.). Aşağıdaki gereksinime tabi olarak, bu ağın internete bağlı olması gerekmez.
- **İnternet:** AdvantageScope XR son zamanlarda kullanılmadıysa, mobil cihazın bir internet bağlantısı olmalıdır (örneğin hücresel veri). Bu gereksinimi ortadan kaldırmak için aşağıdaki [çevrimdışı kullanım](#offline-usage) bölümünü kontrol edin.

:::tip
AdvantageScope XR birçok iPhone ve iPad modelinde desteklenir, ancak **LiDAR sensörüne** sahip cihazlar için daha kararlıdır. Buna iPhone Pro (iPhone 12 Pro ile başlayan) ve iPad Pro (2020 baharı veya sonrası) dahildir.
:::

<details>
<summary>Diğer platformlar ne olacak?</summary>

AdvantageScope XR yalnızca iOS ve iPadOS üzerinde desteklenmektedir. Alternatif platformları desteklemek için yakın bir plan bulunmamaktadır. İstemci uygulaması artırılmış gerçeklik, video kaydı, web işleme ve daha fazlası için yerel API'lerle sıkı bir entegrasyon gerektirir. iOS ve iPadOS, çeşitli nedenlerle geliştirme ve destek önceliği alır:

- **Tutarlılık:** AdvantageScope XR talepkar bir uygulamadır. Android cihazlar işlem gücü ve özellikler bakımından büyük farklılıklar gösterirken, iPhone ve iPad nesiller boyunca tutarlı bir geliştirme deneyimi sunar. Tüm yeni iOS ve iPadOS cihazları AdvantageScope XR'ı çalıştıracak kadar güçlüdür ve daha yeni cihazlar AdvantageScope'un kullanabileceği ek özellikleri (LiDAR gibi) destekler.

- **Erişilebilirlik:** iPhone, Amerika Birleşik Devletleri'ndeki öğrencilerin sahip olma veya akranlarından kolayca erişebilme olasılığı en yüksek akıllı telefon olmaya devam etmektedir ve herhangi bir VR veya karma gerçeklik kulaklığı modelinden daha yaygın olarak mevcuttur. iOS'u desteklemek, AdvantageScope XR'a kolay erişimi olan kullanıcı sayısını en üst düzeye çıkarır.

- **Tablet Desteği:** Kullanıcılar AdvantageScope XR'ı bir tablette çalıştırmaktan yararlanabilirler, çünkü tabletler birden fazla kişinin aynı anda görmesini kolaylaştıran daha büyük bir ekran sunar. iPad dünya çapında en yaygın kullanılan tablettir, bu nedenle iPadOS'u desteklemek tablet deneyimini olabildiğince erişilebilir hale getirir.

</details>

## Kurulum

1. Ana bilgisayarda, herhangi bir 3B saha sekmesindeki **"XR" düğmesine tıklayın**. Aynı anda yalnızca bir XR ana bilgisayar oturumu aktif olabilir, bu nedenle bu düğmeye tıklamak diğer tüm aktif oturumları kesecektir.

<img src="/img/tab-reference/3d-field/xr-1.png" alt="XR button" height="450" />

2. QR kodu ve AR deneyimini özelleştirmek için [seçenekler](#options) içeren **XR kontrolleri penceresi** açılacaktır. XR oturumunu iptal etmek ve tüm istemcilerin bağlantısını kesmek için kontroller penceresini kapatın.

<img src="/img/tab-reference/3d-field/xr-2.png" alt="XR window" height="350" />

3. İstemci cihazındaki **yerleşik kamera uygulamasını** kullanarak QR kodunu tarayın. Herhangi bir uygulama kurulumu gerekmez.
4. Deneyimi başlatmak ve ana bilgisayara bağlanmak için "AdvantageScope XR"a ve ardından "Aç"a dokunun. İstendiğinde AdvantageScope XR'ın **kamera ve yerel ağa** erişmesine izin verin.
5. **Saha modelini kalibre etmek ve konumlandırmak** için cihazdaki talimatları izleyin.
6. **Log yeniden oynatma ve canlı akış** dahil olmak üzere ana bilgisayarı kullanarak saha modelini normal şekilde kontrol edin. Saha modelinin durumu istemci cihazında canlı olarak görüntülenir.
7. Hızlıca **bir video kaydetmek** için ekranın üst kısmındaki "Kaydet" simgesine dokunun. Kaydı durdurmak için tekrar dokunun, ardından klibi düzenleyin ve kaydedin.

:::warning
Isı haritaları ve swerve modülü hızları henüz XR'da mevcut değildir. Diğer tüm nesne türleri desteklenmektedir.
:::

:::tip
AdvantageScope XR talepkar bir uygulamadır ve 3B sahnenin karmaşıklığına bağlı olarak performans sorunları yaşayabilir. Gerekirse daha basit robot modelleri veya daha az nesne kullanmayı düşünün.
:::

## Seçenekler {#options}

XR kontrolleri penceresi, modelin artırılmış gerçeklikte nasıl görüntüleneceğini kontrol eden birkaç seçenek sunar:

- **Kalibrasyon:**
  - Sahanın masaüstü kullanımına uygun ölçeklendirilmiş bir versiyonunu görselleştirmek için _Minyatür_ seçeneğini seçin.
  - Sahanın gerçek bir saha bariyerine göre konumlandırılmış, doğru ölçeklendirmeye sahip versiyonunu görselleştirmek için _Tam Boyut_ seçeneğini seçin. _Mavi İttifak_ ve _Kırmızı İttifak_ arasında geçiş yapmak kalibrasyon için sahanın hangi tarafının kullanılacağını kontrol eder, ancak her durumda tüm saha görselleştirilir.
- **Akış:**
  - Otonom rutinleri simüle etmek veya log dosyalarını yeniden oynatmak gibi daha güvenilir akış karşılığında gecikmenin kabul edilebilir olduğu uygulamalar için _Akıcı_ seçeneğini seçin.
  - Gerçek bir robot üzerine veri çakıştırmak veya teleoperasyonda simüle edilmiş bir robotu sürmek gibi biraz titremenin kabul edilebilir olduğu gerçek zamanlı uygulamalar için _Düşük Gecikme_ seçeneğini seçin.
- **Zemini Göster:** Gerçek bir yüzey üzerine çakıştırmak yerine sahanın altında düz halı/fayans modelini görüntüleyin.
- **Sahayı Göster:** Saha bariyeri ve oyuna özel öğeler dahil olmak üzere saha modelini görüntüleyin. Özel [oyun objesi nesneleri](/tab-reference/3d-field#game-piece-objects) her zaman görüntülenir.
- **Robotları Göster:** Robot modellerini görüntüleyin; gerçek bir robot üzerine veri çakıştırırken (kamera hedefleri veya 2B mekanizmalar gibi) devre dışı bırakılabilir.

## Çevrimdışı kullanım {#offline-usage}

AdvantageScope XR bir internet bağlantısı gerektirmez. Uygulamanın çevrimdışı olarak kullanılabilir olduğundan emin olmak için aşağıdaki bağlantıyı kullanarak App Store'dan AdvantageScope XR'ı indirin. AdvantageScope masaüstü uygulamasına bağlanmak için iOS kamera uygulamasını kullanarak QR kodunu tarayın veya AdvantageScope XR uygulamasındaki "Tara" düğmesine dokunun.

[<img src="/img/tab-reference/3d-field/app-store.svg" alt="App Store" />](https://apps.apple.com/us/app/advantagescope-xr/id6739718081)

:::note
İnternet bağlantısı olmadan çalışırken bile, ana bilgisayar ve istemci cihazlar **aynı ağa bağlı olmalıdır** (bir robot, özel Wi-Fi ağı veya USB internet paylaşımı gibi).
:::
