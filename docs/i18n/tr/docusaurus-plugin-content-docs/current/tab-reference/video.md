---
sidebar_position: 7
---

# 🎬 Video {#video}

Video sekmesi, ayrı olarak kaydedilmiş bir maç videosunu log verileriyle yan yana karşılaştırmanıza olanak tanır. Aşağıdaki adımlar bir videoyu nasıl yükleyeceğinizi ve log ile nasıl senkronize edeceğinizi gösterir.

## Videoyu yükleme {#loading-the-video}

AdvantageScope, video yüklemek için üç seçenek sunar:

1. **Yerel dosya:** Gri dosya simgesine tıklayın, ardından yüklenecek video dosyasını seçin. En yaygın video formatları desteklenir.
2. **YouTube:** Panoya bir YouTube bağlantısı kopyalayın, ardından kırmızı pano simgesine tıklayın. Birkaç saniye sonra video indirilmeye başlar.
3. **The Blue Alliance:** Log dosyasına göre maç videosunu otomatik olarak yüklemek için mavi TBA simgesine tıklayın. Birden fazla video mevcutsa açılır menüden indirilecek videoyu seçin. Bu özellik için [thebluealliance.com/account](https://www.thebluealliance.com/account) adresinden bir TBA API anahtarı almanız ve bunu AdvantageScope tercihlerindeki “TBA API anahtarı” alanına yapıştırmanız gerekir.

<img src="/img/tab-reference/video-1.webp" alt="Kaynak seçici" />

Bir video seçtikten sonra, sağ alttaki zaman çizelgesi önbelleğe alınan kareleri göstermek için maviye dönmeye başlar (akıcı oynatma için bu adım gereklidir). Kare dönüştürme işlemi gerektiği için bu özellik yalnızca maç uzunluğundaki videolar için tasarlanmıştır.

:::warning
YouTube ve TBA üzerinden video indirme işlemleri, YouTube sunucularındaki değişiklikler nedeniyle beklenmedik şekilde başarısız olabilir. Sorun yaşarsanız AdvantageScope'u güncellemeyi veya yerel bir video dosyası kullanmayı deneyin.
:::

:::info
AdvantageScope, video dosyalarını işlemek için [FFmpeg](https://ffmpeg.org) gerektirir. Sisteminizin PATH ortam değişkeninde geçerli bir FFmpeg kopyası bulunamazsa AdvantageScope ilk kez video yüklerken internetten FFmpeg indirmek için sizden onay ister. Otomatik FFmpeg kurulumu yalnızca Windows ve macOS'ta desteklenir; Linux kullanıcılarının FFmpeg'i manuel olarak kurup sistem PATH değişkenine eklemesi gerekebilir.
:::

## Videoda gezinme {#navigating-the-video}

Video ilk yüklendiğinde ve henüz log verileriyle senkronize edilmediğinde, video ve log için oynatma kontrolleri birbirinden bağımsızdır. Video oynatımını kontrol etmek için sağ alttaki zaman çizelgesini ve düğmeleri kullanın. Aşağıdaki klavye kısayolları da desteklenir:

- / = oynatmayı başlat/durdur
- → = bir kare ileri git
- ← = bir kare geri git
- \> = beş saniye ileri atla
- < = beş saniye geri atla

<img src="/img/tab-reference/video-2.webp" alt="Video kontrolleri" />

## Otomatik senkronizasyon {#automatic-synchronization}

Çoğu maç videosu, maçın otonom bölümüne ait kareler yüklendikten kısa bir süre sonra log ile otomatik olarak senkronize edilir. Ek bir işlem yapmanız gerekmez; senkronizasyon başarılı olursa video kontrolleri otomatik olarak kilitlenir (aşağıdaki “Oynatma” bölümüne bakın).

:::warning
Otomatik senkronizasyon yalnızca skor katmanlarını içeren maç videolarında çalışır ve her durumda başarılı olmayabilir. Tüm kareler yüklendikten sonra video kontrolleri otomatik olarak kilitlenmezse manuel senkronizasyon yapmanız gerekir.
:::

## Manuel senkronizasyon {#manual-synchronization}

Öncelikle video kontrollerini kullanarak maçta otonom başlangıcı gibi bilinen bir ana gidin. Ardından log dosyasında videonun mevcut karesiyle eşleşen zamanı seçin.

:::tip
Zaman çizelgesindeki imleç maç bölümlerinin başlangıcına ve bitişine yapışır, bu da maçın başlangıcını tam olarak seçmeyi kolaylaştırır.
:::

Video ve log hizalandıktan sonra video zaman çizelgesinin yanındaki kilit simgesine tıklayın (veya **↑ veya ↓** tuşlarına basın). Video kontrolleri artık devre dışı kalır. Video oynatımının kilidini açmak için kilit simgesine tekrar tıklayın.

<img src="/img/tab-reference/video-3.webp" alt="Kilitleme düğmesi" />

## Oynatma {#playback}

Kilitlendikten sonra video oynatımı logda seçilen zamanla hizalı kalır. Orijinal video log senkronizasyonunu desteklemek için kare kare bir gösterime dönüştürüldüğünden ses oynatımının desteklenmediğini unutmayın.

<details>
<summary>Zaman çizelgesi kontrolleri</summary>

Zaman çizelgesi, oynatmayı ve görselleştirmeyi kontrol etmek için kullanılır. Zaman çizelgesine tıklayarak bir zaman seçebilir, sağ tıklayarak seçimi kaldırabilirsiniz. Seçilen zaman tüm sekmeler arasında senkronize edilir; böylece aynı anı diğer görünümlerde de hızlıca bulabilirsiniz.

Sarı bölümler robotun otonomda, mavi bölümler teleopta ve gri bölümler test modunda olduğu zamanları gösterir.

Yakınlaştırmak için imleci zaman çizelgesinin üzerine getirin ve yukarı veya aşağı kaydırın. `Shift` tuşunu basılı tutarken tıklayıp sürükleyerek bir aralık da seçebilirsiniz. Yatay kaydırma yaparak (desteklenen cihazlarda) veya zaman çizelgesi üzerinde tıklayıp sürükleyerek sola ve sağa hareket edebilirsiniz. Canlı bağlantıdayken sola kaydırmak mevcut zamandan kilidi açar, en sağa kadar kaydırmak ise tekrar mevcut zamana kilitler. Robotun etkin olduğu aralığa yakınlaştırmak için `Ctrl+\` tuşlarına basın.

<img src="/img/tab-reference/timeline.webp" alt="Zaman çizelgesi" />

</details>

:::tip
İsterseniz videonun açısıyla eşleşmesi için 3B saha görünümünde kamera görüş alanını (FOV) ayarlayabilirsiniz. Ayrıntılar için 👀 [3B saha](/tab-reference/3d-field) sayfasındaki “Kamera Seçenekleri” bölümüne bakın.
:::

<img src="/img/tab-reference/video-4.webp" alt="Odometri ile video anlık görüntüsü" />
