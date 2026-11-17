---
sidebar_position: 5
---

# 💬 Konsol {#console}

Konsol sekmesi, konsol verilerini içeren tek bir metin alanını görüntülemek için tasarlanmıştır. Önerilen başlıca alanlar aşağıdadır:

- **DS:/Dscomm/Console** - FIRST Sürücü İstasyonu'nun kaydettiği konsol çıktısı.
- **messages** - [`DataLogManager.log`](<https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/wpilibj/DataLogManager.html#log(java.lang.String)>) metoduna yapılan çağrıları WPILib'in yerleşik loglama sistemi buraya kaydeder.
- **/RealOutputs/Console** - Robot çalışırken AdvantageKit bunu otomatik olarak kaydeder (her zamanki gibi `System.out.println` kullanabilirsiniz).
- **/ReplayOutputs/Console** - Log tekrar oynatılırken AdvantageKit bunu otomatik olarak kaydeder (her zamanki gibi `System.out.println` kullanabilirsiniz).

Başlamak için istediğiniz alanı ana görünüme sürükleyin. Her satır, alandaki bir güncellemeyi gösterir. WPILib loglarında kaydedilen her satır için yeni bir satır oluşturulur; AdvantageKit loglarında ise her döngü periyodu için yeni bir satır eklenir.

<img src="/img/tab-reference/console-1.webp" alt="Konsol görünümü" />

_Yukarıda İngilizce arayüz gösterilmiştir._

:::info
Uyarı ve hata mesajlarını vurgulamayı açıp kapatmak için renk paleti simgesine tıklayın. WPILib ve AdvantageKit loglarında “warning” veya “error” metnini içeren mesajlar vurgulanır.
:::

Kontroller 🔢 [Tablo](../tab-reference/table) sekmesine benzer. Seçilen zaman tüm sekmelerde senkronize edilir. Bir satırı seçmek için üzerine tıklayın ya da açık olan ayrılmış pencerelerde önizlemek için fareyi satırın üzerine getirin. ↓ düğmesine tıkladığınızda seçilen zamana (veya kutuya girdiğiniz zamana) atlanır. Zaman damgaları ve atlama girişleri [Zaman Damgaları](/more-features/timestamps) tercihine göre biçimlendirilir.

Yalnızca filtre metnini içeren satırları görüntülemek için “Filtrele” kutusuna metin yazın. “Filtrele” kutusunu hızlıca seçmek için `Ctrl+F` tuşlarına basın. Eşleşen mesajları ana görünümden _hariç tutmak_ için filtre metninin başına bir “!” ekleyin.

## ANSI biçimlendirme {#ansi-formatting}

Konsol görünümü, standart ANSI kaçış dizileriyle biçimlendirme ve renk kodlarını destekler:

- **Metin stilleri:** Kalın, soluk, italik ve altı çizili
- **Ön plan ve arka plan renkleri:** Standart 16 renk (normal ve yüksek yoğunluklu)
- **8 bit ve 24 bit renkler:** 256 renk paleti ve 24 bit RGB
- **Seçici sıfırlama:** Diğer stilleri koruyarak belirli stilleri veya renkleri sıfırlama

:::tip
Konsol verilerini bir metin dosyasına aktarmak için kaydet simgesine tıklayın.
:::
