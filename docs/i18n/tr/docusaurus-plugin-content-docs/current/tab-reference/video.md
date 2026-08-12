---
sidebar_position: 7
---

# 🎬 Video {#video}

Video sekmesi, ayrı olarak kaydedilmiş bir maç videosuyla log verilerinin yan yana karşılaştırılmasına olanak tanır. Aşağıdaki adımlar bir videonun nasıl yükleneceğini ve log ile nasıl senkronize edileceğini gösterir.

## Videoyu yükleme {#loading-the-video}

AdvantageScope bir video yüklemek için üç seçenek sunar:

1. **Yerel Dosya:** Gri dosya simgesine tıklayın, ardından yüklenecek video dosyasını seçin. En yaygın video formatları desteklenmektedir.
2. **YouTube:** Panoya bir YouTube bağlantısı kopyalayın, ardından kırmızı pano simgesine tıklayın. Birkaç saniye sonra video indirilmeye başlayacaktır.
3. **The Blue Alliance:** Log dosyasına dayalı maç videosunu otomatik olarak yüklemek için mavi TBA simgesine tıklayın. Birden fazla video mevcutsa, açılır menüden indirilecek videoyu seçin. Bu özellik, [thebluealliance.com/account](https://www.thebluealliance.com/account) adresinden alınması ve AdvantageScope tercihler sayfasındaki "TBA API Anahtarı" altına kopyalanması gereken TBA için bir API anahtarı gerektirir.

<img src="/img/tab-reference/video-1.png" alt="Kaynak seçici" />

Bir video seçtikten sonra, sağ alttaki zaman çizelgesi önbelleğe alınan kareleri belirtmek için maviye dönmeye başlar (akıcı oynatma için bu adım gereklidir). Bu özellik, gereken kare dönüştürme işlemi nedeniyle yalnızca maç uzunluğundaki videolar için tasarlanmıştır.

:::warning
YouTube ve TBA video indirmeleri, YouTube'un sunucularındaki değişiklikler nedeniyle beklenmedik şekilde başarısız olabilir. Sorun olması durumunda AdvantageScope'u güncellemeyi veya bunun yerine yerel bir video dosyası kullanmayı deneyin.
:::

:::info
AdvantageScope video dosyalarını işlemek için [FFmpeg](https://ffmpeg.org) gerektirir. Sisteminizin PATH ortam değişkeninde FFmpeg'in geçerli bir kopyası bulunamazsa AdvantageScope, ilk kez bir video yüklerken internetten FFmpeg indirmek için bir bildirim görüntüler. Otomatik FFmpeg kurulumu yalnızca Windows ve macOS'ta desteklenmektedir; Linux kullanıcılarının FFmpeg'i manuel olarak kurmaları ve sistem PATH değişkenine eklemeleri gerekebilir.
:::

## Videoda gezinme {#navigating-the-video}

Bir video başlangıçta yüklendiğinde ve henüz log verileriyle senkronize edilmediğinde video ve log için oynatma kontrolleri hâlâ bağımsızdır. Video oynatımını kontrol etmek için sağ alttaki zaman çizelgesini ve düğmeleri kullanın. Aşağıdaki klavye kısayolları da desteklenmektedir:

- / = oynatmayı başlat/durdur
- → = bir kare ileri git
- ← = bir kare geri git
- \> = beş saniye ileri atla
- < = beş saniye geri atla

<img src="/img/tab-reference/video-2.png" alt="Video kontrolleri" />

## Otomatik senkronizasyon {#automatic-synchronization}

Çoğu maç videosu, maçın otonom periyoduna ait kareler yüklendikten kısa bir süre sonra log ile otomatik olarak senkronize edilecektir. Eylem gerekmez; senkronizasyon başarılı olursa video kontrolleri otomatik olarak kilitlenecektir (aşağıdaki "Oynatma" bölümüne bakın).

:::warning
Otomatik senkronizasyon yalnızca skor kaplamalarını içeren maç videolarında çalışır ve her durumda başarılı olamayabilir. Tüm kareler yüklendikten sonra video kontrolleri otomatik olarak kilitlenmezse manuel senkronizasyon gereklidir.
:::

## Manuel senkronizasyon {#manual-synchronization}

Öncelikle video kontrollerini kullanarak maçta otonom başlangıcı gibi bilinen bir konuma gidin. Ardından log dosyasında videonun mevcut karesiyle hizalanan zamanı seçin.

:::tip
Zaman çizelgesindeki imleç maç periyotlarının başlangıcına ve bitişine kilitlenir, bu da maçın başlangıcını tam olarak seçmeyi kolaylaştırır.
:::

Video ve log hizalandıktan sonra video zaman çizelgesinin yanındaki kilit simgesine tıklayın (veya **↑ veya ↓** tuşlarına basın). Video kontrolleri artık devre dışı bırakılmıştır. Video oynatımının kilidini açmak için kilit simgesine tekrar tıklayın.

<img src="/img/tab-reference/video-3.png" alt="Kilitleme düğmesi" />

## Oynatma {#playback}

Kilitlendikten sonra video oynatımı logda seçilen zamanla hizalanmış olarak kalır. Orijinal video log senkronizasyonunu desteklemek için kareden kareye bir gösterime dönüştürüldüğünden ses oynatımının desteklenmediğini unutmayın.

<details>
<summary>Zaman Çizelgesi Kontrolleri</summary>

Zaman çizelgesi oynatmayı ve görselleştirmeyi kontrol etmek için kullanılır. Zaman çizelgesine tıklamak bir zaman seçer ve sağ tıklamak seçimi kaldırır. Seçilen zaman tüm sekmeler arasında senkronize edilir, bu da bu konumu diğer görünümlerde hızlıca bulmayı kolaylaştırır.

Sarı bölümler robotun otonomda olduğu zamanları, mavi bölümler robotun teleoperasyonda olduğu zamanları ve gri bölümler robotun test modunda olduğu zamanları gösterir.

Yakınlaştırmak için imleci zaman çizelgesinin üzerine getirin ve yukarı veya aşağı kaydırın. `Shift` tuşunu basılı tutarken tıklayıp sürükleyerek bir aralık da seçilebilir. Yatay olarak kaydırarak (desteklenen cihazlarda) veya zaman çizelgesinde tıklayıp sürükleyerek sola ve sağa hareket edin. Canlı bağlandığında sola kaydırmak mevcut zamandan kilidi kaldırır ve en sağa kadar kaydırmak tekrar mevcut zamana kilitler. Robotun etkin olduğu periyoda yakınlaştırmak için `Ctrl+\` tuşlarına basın.

<img src="/img/tab-reference/timeline.png" alt="Zaman çizelgesi" />

</details>

:::tip
İstenirse videonun görünümüyle eşleşmesi için 3B saha görünümünde kamera FOV değeri ayarlanabilir. Detaylar için 👀 [3B saha](/tab-reference/3d-field) sayfasındaki "Kamera Seçenekleri" bölümüne bakın.
:::

<img src="/img/tab-reference/video-4.png" alt="Odometri ile video anlık görüntüsü" />
