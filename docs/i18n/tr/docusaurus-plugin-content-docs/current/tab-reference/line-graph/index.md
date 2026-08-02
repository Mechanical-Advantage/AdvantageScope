# 📉 Çizgi grafik

Çizgi grafiği, AdvantageScope'taki varsayılan görünümdür. Hem sürekli (sayısal) hem de ayrık alanları destekler.

<img src="/img/tab-reference/line-graph/line-graph-1.png" alt="Line graph demo" />

## Görüntüleyici paneli

Yakınlaştırmak için imleci ana grafiğin üzerine getirin ve yukarı veya aşağı kaydırın. `Shift` tuşunu basılı tutarken tıklayıp sürükleyerek bir aralık da seçilebilir. Yatay olarak kaydırarak (desteklenen cihazlarda) veya grafik üzerinde tıklayıp sürükleyerek sola ve sağa hareket edin. Canlı bağlandığında sola kaydırmak mevcut zamandan kilidi kaldırır ve en sağa kadar kaydırmak tekrar mevcut zamana kilitler.

Grafiğe tıklamak bir zaman seçer ve sağ tıklamak seçimi kaldırır. O zamandaki her alanın değeri göstergede görüntülenir. Seçilen zaman tüm sekmeler arasında senkronize edilir, bu da bu konumu diğer görünümlerde hızlıca bulmayı kolaylaştırır.

:::tip
Seçilen zaman ile üzerine gelinen zaman arasındaki fark grafik üzerinde bir kaplama olarak görüntülenir, bu da zaman aralıklarını ölçmeyi kolaylaştırır.
:::

## Kontrol paneli

Başlamak için bir alanı üç bölümden birine (sol, sağ veya ayrık) sürükleyin. X düğmesini kullanarak bir alanı silin veya göz simgesine tıklayarak ya da alan adına çift tıklayarak geçici olarak gizleyin. Tüm alanları kaldırmak için eksen başlığının yanındaki üç noktaya ve ardından `Tümünü Temizle` seçeneğine tıklayın. Alanlar listede tıklanıp sürüklenerek yeniden düzenlenebilir.

Her alanın rengi ve çizgi stili, renkli simgeye tıklanarak veya alan adına sağ tıklanarak özelleştirilebilir. WPILib [kalıcı uyarılar](https://docs.wpilib.org/tr/latest/docs/software/telemetry/persistent-alerts.html) API'sinden gelen veriler, uyarı grubu ayrık bir alan olarak eklenerek görselleştirilebilir. Örnek bir görselleştirme aşağıda gösterilmiştir.

<img src="/img/tab-reference/line-graph/line-graph-2.png" alt="Alerts visualization" />

:::tip
Robot modunu (otonom, teleoperasyon veya test) çakıştırmak için "Ayrık Alanlar"ın yanındaki üç noktaya tıklayın ve "Robot Modunu Göster" seçeneğine tıklayın.

<img src="/img/tab-reference/line-graph/line-graph-3.png" alt="Robot mode overlay" />
:::

### Eksenleri ayarlama {#adjusting-axes}

Varsayılan olarak her eksen aralığını görünür verilere göre ayarlar. Otomatik aralık belirlemeyi devre dışı bırakmak ve aralığı mevcut minimum ve maksimum değerlerine kilitlemek için eksen başlığının yanındaki üç noktaya ve ardından `Ekseni Kilitle` seçeneğine tıklayın. Aralığı manuel olarak ayarlamak için `Aralığı Düzenle...` seçin ve istenen değerleri girin.

<img src="/img/tab-reference/line-graph/line-graph-4.png" alt="Editing axis range" height="250" />

### İntegral & türev {#integration--differentiation}

Değerler AdvantageScope tarafından otomatik olarak integrali veya türevi alınabilir. Delta zamanı her zaman saniye cinsinden ölçülür. Eksen başlığının yanındaki üç noktaya tıklayın ve ardından `Türev Al` veya `İntegral Al` seçeneğini seçin.

:::info
Türevler bitişik örneklerin [sonlu farkı](https://tr.wikipedia.org/wiki/Sonlu_fark) kullanılarak hesaplanır. İntegraller [yamuk integrali](https://en.wikipedia.org/wiki/Trapezoidal_rule) kullanılarak hesaplanır.
:::
