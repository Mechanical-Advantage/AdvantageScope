# Log verilerini dışa aktarma

AdvantageScope, log verilerini CSV, WPILOG veya MCAP dosyası olarak dışa aktarmak için esnek bir sistem içerir. Dışa aktarma işlevleri, bir log dosyası görüntülenirken veya bir canlı veri kaynağına bağlıyken çalışır. Olası kullanım durumları şunlardır:

- Başka uygulamalarda analiz etmek üzere bir WPILOG dosyasını CSV veya MCAP'e dönüştürme.
- Daha sonra erişmek üzere NetworkTables verilerine dayalı bir WPILOG dosyası dışa aktarma.
- Dosya boyutunu küçültmek için sınırlı sayıda alana sahip (ve yinelenen değerleri kaldırılmış) bir WPILOG kaydetme.

Dışa aktarma seçeneklerini görüntülemek için `Dosya` > `Verileri dışa aktar...` seçeneğine tıklayın.

<img src="/img/overview/log-files/export-1.png" alt="Export options" height="250" />

:::tip
Burada açıklanan tam log dışa aktarımına ek olarak, 💬 [Konsol](/tab-reference/console) sekmesi konsol verilerinin bir metin dosyasına dışa aktarılmasına olanak tanır.
:::

:::warning
**SysId İçin Veri Dışa Aktarma**

SysId, AdvantageScope'un varsayılan dışa aktarma seçenekleriyle uyumsuz ek zaman damgası verileri gerektirdiğinden, [SysId](https://docs.wpilib.org/tr/stable/docs/software/advanced-controls/system-identification/introduction.html) uygulamasında kullanılmak üzere **simülasyonda üretilen** log verilerini dışa aktarmak için bu özelliğin kullanılmasını önermiyoruz. **Simülasyon _dışında_ üretilen** log verilerinin SysId'de kullanılmak üzere minimum veri kaybıyla dışa aktarılabileceğini unutmayın (bununla birlikte maksimum doğruluk doğrudan SysId'de _orijinal_ veri logu kullanılarak elde edilebilir).

_Bu uyarı, "AdvantageKit döngüleri" seçeneği seçilerek hiçbir veri kaybı olmadan dışa aktarılabilen AdvantageKit tarafından üretilen loglar için **geçerli değildir**. Detaylar için [bu sayfaya](https://docs.advantagekit.org/data-flow/sysid-compatibility) bakın._
:::

## Seçenekler

Dışa aktarma sırasında aşağıdaki seçenekler sunulur:

- **Format:** Dışa aktarılan dosyanın genel formatını ayarlar. Aşağıdaki seçeneklere bakın.
  - _CSV (Tablo):_ Her satırın ayrı bir zaman damgasını temsil ettiği ve her sütunun bir alanı (artı zaman damgası değeri için bir sütun) temsil ettiği virgülle ayrılmış değerler. Her satır birden fazla alandaki bir değeri temsil edebilir.
  - _CSV (Liste):_ Her satırın zaman damgası, anahtar ve değer sütunlarıyla tek bir alandaki değeri temsil ettiği virgülle ayrılmış değerler.
  - _WPILOG:_ AdvantageScope'ta tekrar açılabilen standart WPILOG dosyası.
  - _MCAP:_ [Foxglove](https://foxglove.dev) uygulamasında açılabilen standart [MCAP](https://mcap.dev) dosyası.
- **Zaman damgaları:** Yalnızca "CSV (Tablo)" içindir. Yeni satır oluşturma yöntemini ayarlar. Aşağıdaki seçeneklere bakın.
  - _Tüm değişiklikler:_ Yalnızca alan değerleri güncellendiğinde yeni satırlar/girdiler oluşturur. Dışa aktarmanın dosya boyutunu en aza indirir.
  - _Sabit periyot:_ Sabit bir aralıkla yeni satırlar/girdiler oluşturur; zaman damgası senkronizasyonu olmayan loglar için yararlıdır (birçok alan benzer, ancak aynı olmayan zaman damgalarıyla loglandığında). Örnek noktaları arasında bir değişiklik olup olmadığına bakılmaksızın tüm değerlerin dahil edildiğini unutmayın.
  - _AdvantageKit döngüleri:_ Her AdvantageKit senkronize döngü periyodu için yeni bir satır/girdi oluşturur. Döngü periyotları arasında bir değişiklik olup olmadığına bakılmaksızın tüm değerlerin dahil edildiğini unutmayın.
- **Periyot:** Yalnızca "Sabit periyot" seçildiğinde. Her örnek arasındaki periyodu milisaniye cinsinden ayarlar. Genellikle bu, robot kodunun döngü periyoduyla eşleşmelidir.
- **Ön ekler:** Boşsa tüm alanları dahil eder. Aksi takdirde, yalnızca sağlanan ön eklerle eşleşen alanları dahil eder (virgülle ayrılmış). Aşağıdaki örneklere bakın.
  - "_/DriverStation/Joystick0_": "/DriverStation/Joystick0" ile başlayan tüm alanları (ilk joystick'ten gelen veriler) dahil et.
  - "_Flywheels,DS:enabled_": "/Flywheels" veya "DS:enabled" ile başlayan tüm alanları (volandan gelen tüm veriler artı robotun etkin durumu) dahil et.
  - "_Drive/LeftPosition,Drive/RightPosition_": Yalnızca "/Drive/LeftPosition" ve "/Drive/RightPosition" alanlarını dahil et.
- **Alan kümesi:** Aşağıdaki seçeneklere bakın. Oluşturulan alanlar, karmaşık türleri ayrıştırmak için AdvantageScope tarafından oluşturulur ve kenar çubuğunda gri metinle görüntülenir. Bu, dizilerin, struct'ların ve diğer şemaların bireysel bileşenlerini içerir.
  - _Oluşturulanları dahil et:_ Oluşturulan alanları da içeren tüm görüntülenebilir alanları dışa aktarır. Dışa aktarılan veriler karmaşık türleri ayrıştırma yeteneğine sahip olmayan bir uygulamada açılacaksa önerilir.
  - _Yalnızca orijinaller:_ Oluşturulan alanları hariç tutarak yalnızca orijinal log dosyasında bulunan alanları dışa aktarır. Dışa aktarılan veriler AdvantageScope'ta veya karmaşık türleri ayrıştırabilen başka bir uygulamada açılacaksa önerilir.

Zaman damgaları "Tüm değişiklikler" olarak ayarlanmış "CSV (Tablo)" formatında AdvantageScope'tan dışa aktarılan örnek bir CSV dosyası aşağıda gösterilmiştir:

<img src="/img/overview/log-files/export-2.png" alt="CSV table" />
