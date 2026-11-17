# Birim desteği {#unit-support}

Çizgi grafik sekmesi birim duyarlıdır; yani sayısal değerleri uyumlu birim türleri arasında kolayca dönüştürebilirsiniz. Birim bilgisi mevcut olduğunda tüm sayısal değerler eksenlerde veya göstergelerde doğru şekilde etiketlenir. Birim bilgisi yayınlama hakkında daha fazla bilgi için [buraya](#supported-formats) bakın. AdvantageScope, birimler arasında hızlıca dönüşüm yapmak için birkaç araç sunar:

- **Aynı eksene uyumlu birim türlerine sahip alanlar** eklediğinizde AdvantageScope her iki alanı da otomatik olarak aynı birime dönüştürür. Bu dönüşüm Y ekseninin ve göstergenin etiketlenmesine yansır.
- **Alternatif birimlere hızlıca geçmek** için eksen başlığının yanındaki üç noktaya tıklayın. Bu liste, seçilen alanlarla uyumlu en yaygın birimleri içerir.
- Doğru integral veya türev birimlerini görmek için **integral veya türevi** ([dokümantasyon](/tab-reference/line-graph/#integration-and-differentiation)) etkinleştirin. Orijinalinden farklı birimlerde filtrelemeyi desteklemek için taban birimi menüden ayarlayabilirsiniz.

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Birim duyarlı grafikleme" />

_Yukarıda İngilizce arayüz gösteriliyor._

## Desteklenen formatlar {#supported-formats}

AdvantageScope, her alan için birim bilgisi sağlamanın birkaç yöntemini destekler. En yaygın birimler desteklenir; tam liste için [manuel dönüştürmeyi](#manual-conversion) yapılandırırken açılır menüyü kontrol edin.

(2) ve (3) için birim türleri metin (string) üzerinden ayrıştırılır. AdvantageScope, yaygın kısaltmalar dahil olmak üzere her birim için birden fazla adı (örneğin `ft` ve `feet` ifadelerinin ikisi de uygundur) ve hem Amerikan hem de İngiliz İngilizcesi yazımlarını (örneğin `meters` ve `metres`) destekler. AdvantageScope'ta seçtiğiniz dilden bağımsız olarak birim adlarının SI simgeleri veya İngilizce olması gerektiğini unutmayın. Bir birim adı beklendiği gibi ayrıştırılmıyorsa lütfen [bir sorun açın](https://github.com/Mechanical-Advantage/AdvantageScope/issues).

:::tip
Birimlerin doğru ayrıştırılıp ayrıştırılmadığından emin değil misiniz? Çizgi grafiğe bir alan eklerken Y ekseninde bir birim türünün görünüp görünmediğini kontrol edin.
:::

### 🥇 Struct birimleri {#struct-units}

AdvantageScope, `Rotation2d` ve `Translation3d` gibi yaygın yapılandırılmış veri türleri için varsayılan birimleri otomatik olarak kullanır. Uygulanabilir değerleri bu formatlarla yayınlamak **veri yayınlamanın her zaman en iyi yoludur** ve geometri verilerini görselleştirirken en yüksek uyumluluğu sağlar.

### 🥈 Alan üst verisi {#field-metadata}

WPILOG ve NetworkTables formatları, her alan için ek “üst veri” yayınlamayı destekler. AdvantageScope, birim türü için metin içeren “unit” veya “units” adlı JSON alanlarını arar (boşluk, camel-case, pascal-case veya snake-case kullanabilirsiniz). Her alanın üst verisini kontrol etmek için imleci kenar çubuğundaki alan adının üzerine getirin.

:::tip
WPILib'de `Telemetry.log()` kullanarak `Measure` nesnelerini logladığınızda birim üst verileri otomatik olarak eklenir. Birim üst verilerini `Telemetry.setProperty("fieldName", "unit", "\"volts\"")` kullanarak açıkça da yapılandırabilirsiniz.

AdvantageKit de girdileri ve çıktıları loglarken birim üst verisini destekler (ayrıntılar için [buraya](https://docs.advantagekit.org/data-flow/supported-types#units) bakın).
:::

### 🥉 Alan adlandırması {#field-naming}

Alternatif bir yöntem olarak AdvantageScope, her alanın adını ayrıştırarak doğru birim türünü belirlemeye çalışır. **Birim türü bir son ek olarak yer almalıdır.** AdvantageScope çeşitli adlandırma düzenlerini destekler. Geçerli seçeneklerden bazıları şunlardır:

- **Camel/pascal-case:** `PositionMeters`, `velocityRadPerSec` ve `TimestampS` gibi
- **Snake-case:** `position_meters`, `velocity_rad_per_sec` ve `timestamp_s` gibi
- **Boşlukla ayrılmış:** `position meters`, `velocity rad per sec` ve `timestamp s` gibi

Snake-case veya boşluklu adlandırmalarda büyük/küçük harf duyarlılığı _yoktur_.

:::tip
Birimler yanlış ayrıştırılırsa birim bilgisini yok saymak için `Manuel birimler` > `Otomatik birimleri devre dışı bırak` seçeneğine tıklayın. Ardından alternatif birimlere geçmek için manuel dönüştürmeyi kullanabilirsiniz.
:::

## Manuel dönüştürme {#manual-conversion}

Birim üst verisi mevcut olmadığında veya hatalı olduğunda, birimler arasında dönüştürme yapmak (veya birim üst verisini tamamen yok saymak) için eksenleri manuel olarak da yapılandırabilirsiniz.

Manuel dönüştürmeyi ayarlamak için eksen başlığının yanındaki üç noktaya ve ardından `Manuel birimler` > `Dönüşümü düzenle...` seçeneğine tıklayın. Birim türünü, kaynak birimi ve hedef birimi seçin. Her değer ayrıca “Ekstra faktör” ile çarpılır; böylece dişli oranları, açısal-doğrusal dönüşümler veya AdvantageScope'ta yer almayan diğer birimler için özel dönüştürmeler yapabilirsiniz. Faktörü `1.5*pi` gibi matematiksel bir ifadeyle de girebilirsiniz.

:::tip
Birim dönüştürmeyi hızlıca açıp kapatmak için eksen başlığının yanındaki üç noktaya tıklayın ve `Son önayarlar` veya `Birimleri sıfırla` seçeneğini seçin.
:::

<img src="/img/tab-reference/line-graph/units-2.webp" alt="Birim dönüşümünü düzenleme" height="250" />

_Yukarıda İngilizce arayüz gösteriliyor._
