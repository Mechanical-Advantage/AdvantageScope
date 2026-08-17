# Birim desteği {#unit-support}

Çizgi grafik sekmesi birim duyarlıdır, yani sayısal değerler uyumlu birim türleri arasında kolayca dönüştürülebilir. Birim bilgisi mevcut olduğunda, tüm sayısal değerler eksenlerde veya göstergelerde görüntülendiğinde doğru şekilde etiketlenir. Birim bilgilerini yayınlama hakkında daha fazla bilgi için [buraya](#supported-formats) bakın. AdvantageScope birimler arasında hızlıca dönüşüm yapmak için birkaç araç sunar:

- Uyumlu birim türlerine sahip **aynı eksene alanlar** eklenirken AdvantageScope her iki alanı da otomatik olarak aynı birime dönüştürür. Bu, Y ekseninin ve göstergenin etiketlenmesine yansıtılır.
- **Alternatif birimlere hızlıca geçiş yapmak** için eksen başlığının yanındaki üç noktaya tıklayın. Bu liste, seçilen alanlarla uyumlu en yaygın birimleri içerir.
- Doğru integral veya türev birimlerini görmek için **integral veya türevi** ([dokümantasyon](/tab-reference/line-graph/#integration-and-differentiation)) etkinleştirin. Taban birim, yerel olmayan birimlerde filtrelemeyi desteklemek için menü kullanılarak ayarlanabilir.

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Birim duyarlı grafikleme" />

_Yukarıda İngilizce arayüz gösterilmektedir._

## Desteklenen formatlar {#supported-formats}

AdvantageScope, her alan hakkında birim bilgisi sağlamak için birkaç yöntemi destekler. En yaygın birimler desteklenmektedir; tam bir liste için [manuel dönüştürmeyi](#manual-conversion) yapılandırırken açılır menüyü kontrol edin.

(2) ve (3) için birim türleri dizeler kullanılarak ayrıştırılır. AdvantageScope, yaygın kısaltmalar dahil olmak üzere her birim için birden fazla adı (örneğin `ft` ve `feet` ifadelerinin ikisi de uygundur) ve hem Amerikan hem de İngiliz İngilizcesi yazımlarını (örneğin `meters` ve `metres`) destekler. AdvantageScope'ta seçilen dilden bağımsız olarak birim adlarının SI simgeleri veya İngilizce kullanılarak sağlanması gerektiğini unutmayın. Bir birim adı beklendiği gibi ayrıştırılmıyorsa lütfen [bir sorun açın](https://github.com/Mechanical-Advantage/AdvantageScope/issues).

:::tip
Birimlerin doğru şekilde ayrıştırılıp ayrıştırılmadığından emin değil misiniz? Çizgi grafiğine bir alan eklerken Y ekseninde bir birim türünün görüntülenip görüntülenmediğini kontrol edin.
:::

### 🥇 Struct birimleri {#struct-units}

AdvantageScope, `Rotation2d` ve `Translation3d` gibi yaygın yapılandırılmış veri türleri için yerel birimleri otomatik olarak kullanır. Uygulanabilir değerleri bu formatları kullanarak yayınlamak **veri yayınlamanın her zaman en iyi yoludur** ve geometri verilerini görselleştirirken maksimum uyumluluk sağlar.

### 🥈 Alan üst verisi {#field-metadata}

WPILOG ve NetworkTables formatları, her alan için ek "üst veri" yayınlamayı destekler. AdvantageScope, birim türü için bir dize adı içeren "unit" veya "units" adlı JSON alanlarını arar (boşluklar, camel-case, pascal-case veya snake-case kullanarak). Her alanın üst verisini kontrol etmek için imleci kenar çubuğundaki alan adının üzerine getirin.

:::tip
AdvantageKit, açıklama loglaması dahil olmak üzere girdileri ve çıktıları loglarken birim üst verisi desteği içerir. Ayrıntılar için dokümantasyonu [buradan](https://docs.advantagekit.org/data-flow/supported-types#units) kontrol edin.
:::

### 🥉 Alan adlandırması {#field-naming}

Bir geri dönüş seçeneği olarak AdvantageScope, her alanın adını ayrıştırarak doğru birim türünü belirlemeye çalışır. **Birim türü bir son ek olarak dahil edilmelidir.** AdvantageScope çeşitli adlandırma düzenlerini destekler. Bazı geçerli seçenekler aşağıda listelenmiştir:

- **Camel/pascal-case**, `PositionMeters`, `velocityRadPerSec` ve `TimestampS` gibi
- **Snake-case**, `position_meters`, `velocity_rad_per_sec` ve `timestamp_s` gibi
- **Boşluk ayırıcıları**, `position meters`, `velocity rad per sec` ve `timestamp s` gibi

Snake-case veya boşluk ayırıcıları kullanılırken adlandırma büyük/küçük harfe _duyarlı değildir_.

:::tip
Birimler yanlış ayrıştırılırsa, birim bilgilerini yok saymak için `Manuel Birimler` > `Otomatik Birimleri Devre Dışı Bırak` seçeneğine tıklayın. Ardından alternatif birimlere geçmek için manuel dönüştürme kullanılabilir.
:::

## Manuel dönüştürme {#manual-conversion}

Birim üst verisi mevcut olmadığında veya yanlış olduğunda, eksenler birimler arasında dönüştürme yapmak (veya birim üst verisini tamamen yok saymak) için manuel olarak da yapılandırılabilir.

Manuel dönüştürmeyi yapılandırmak için eksen başlığının yanındaki üç noktaya ve ardından `Manuel Birimler` > `Dönüştürmeyi Düzenle...` seçeneğine tıklayın. Birim türünü, kaynak birimi ve hedef birimi seçin. Her değer ayrıca "Ekstra Faktör" ile çarpılarak özel dönüştürmelere olanak tanır (dişli oranları, açısal-doğrusal dönüştürmeler veya AdvantageScope tarafından sağlanmayan diğer birimler gibi). Faktör ayrıca `1.5*pi` gibi matematiksel bir ifade kullanılarak da girilebilir.

:::tip
Birim dönüştürmeyi hızlıca etkinleştirmek veya devre dışı bırakmak için eksen başlığının yanındaki üç noktaya tıklayın ve `Son Ön Ayarlar` veya `Birimleri Sıfırla` seçeneğini seçin.
:::

<img src="/img/tab-reference/line-graph/units-2.webp" alt="Birim dönüşümünü düzenleme" height="250" />

_Yukarıda İngilizce arayüz gösterilmektedir._
