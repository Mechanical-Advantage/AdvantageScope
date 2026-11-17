# 📉 Çizgi grafik {#line-graph}

Çizgi grafik, AdvantageScope'un varsayılan görünümüdür. Hem sürekli (sayısal) hem de ayrık alanları destekler.

<img src="/img/tab-reference/line-graph/line-graph-1.webp" alt="Çizgi grafik gösterimi" />

_Yukarıda İngilizce arayüz gösteriliyor._

## Görüntüleyici paneli {#viewer-pane}

Yakınlaştırmak için imleci ana grafiğin üzerine getirin ve yukarı veya aşağı kaydırın. `Shift` tuşunu basılı tutarken tıklayıp sürükleyerek bir aralık da seçebilirsiniz. Yatay kaydırma yaparak (desteklenen cihazlarda) veya grafik üzerinde tıklayıp sürükleyerek sola ve sağa hareket edebilirsiniz. Canlı bağlantıdayken sola kaydırmak mevcut zamandan kilidi açar, en sağa kadar kaydırmak ise tekrar mevcut zamana kilitler.

Grafiğe tıklayarak bir zaman seçebilir, sağ tıklayarak seçimi kaldırabilirsiniz. O andaki her alanın değeri göstergede görünür. Seçilen zaman tüm sekmeler arasında senkronize edilir; böylece aynı anı diğer görünümlerde de hızlıca bulabilirsiniz.

:::tip
Seçilen zaman ile imlecin üzerinde durduğu zaman arasındaki fark grafiğin üzerinde gösterilir, bu da zaman aralıklarını ölçmeyi kolaylaştırır. Zaman damgaları [Zaman Damgaları](/more-features/timestamps) tercihine göre biçimlendirilir.
:::

## Kontrol paneli {#control-pane}

Başlamak için bir alanı üç bölümden birine (sol, sağ veya ayrık) sürükleyin. X düğmesine tıklayarak bir alanı silebilir, göz simgesine tıklayarak veya alan adına çift tıklayarak geçici olarak gizleyebilirsiniz. Tüm alanları kaldırmak için eksen başlığının yanındaki üç noktaya ve ardından `Tümünü temizle` seçeneğine tıklayın. Alanların listedeki sırasını tıklayıp sürükleyerek değiştirebilirsiniz.

Her alanın rengini ve çizgi stilini renkli simgeye tıklayarak veya alan adına sağ tıklayarak özelleştirebilirsiniz. WPILib [kalıcı uyarılar](https://docs.wpilib.org/tr/latest/docs/software/telemetry/persistent-alerts.html) API'sinden gelen verileri, uyarı grubunu ayrık bir alan olarak ekleyerek görselleştirebilirsiniz. Aşağıda örnek bir görselleştirme görebilirsiniz.

<img src="/img/tab-reference/line-graph/line-graph-2.webp" alt="Uyarılar görselleştirmesi" />

:::tip
Robot modunu (otonom, teleop veya test) grafiğin üzerinde göstermek için “Ayrık alanlar”ın yanındaki üç noktaya tıklayıp “Robot modunu göster”i seçin.

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="Robot modu katmanı" />

_Yukarıda İngilizce arayüz gösteriliyor._
:::

### Eksenleri ayarlama {#adjusting-axes}

Varsayılan olarak her eksen, aralığını görünür verilere göre ayarlar. Otomatik aralık belirlemeyi kapatıp aralığı mevcut minimum ve maksimum değerlerine kilitlemek için eksen başlığının yanındaki üç noktaya ve ardından `Ekseni kilitle` seçeneğine tıklayın. Aralığı manuel olarak ayarlamak için `Aralığı düzenle...` seçeneğini seçip istediğiniz değerleri girin.

<img src="/img/tab-reference/line-graph/line-graph-4.webp" alt="Eksen aralığını düzenleme" height="250" />

_Yukarıda İngilizce arayüz gösteriliyor._

### İntegral ve türev {#integration-and-differentiation}

AdvantageScope, değerlerin integralini veya türevini otomatik olarak alabilir. Zaman farkı her zaman saniye cinsinden ölçülür. Eksen başlığının yanındaki üç noktaya tıklayıp `Türevini al` veya `İntegralini al` seçeneğini seçin.

:::info
Türevler bitişik örneklerin [sonlu farkı](https://tr.wikipedia.org/wiki/Sonlu_fark) kullanılarak, integraller ise [yamuk integrali](https://en.wikipedia.org/wiki/Trapezoidal_rule) yöntemiyle hesaplanır.
:::
