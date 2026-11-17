# Log verilerini dışa aktarma {#exporting-log-data}

AdvantageScope, log verilerini CSV, WPILOG veya MCAP dosyası olarak dışa aktarmak için esnek bir sistem sunar. Bu özelliği hem kayıtlı bir log dosyasını incelerken hem de canlı bir veri kaynağına bağlıyken kullanabilirsiniz. Dışa aktarmayı şu gibi amaçlarla kullanabilirsiniz:

- Başka uygulamalarda analiz etmek için bir WPILOG dosyasını CSV veya MCAP’e dönüştürmek
- Daha sonra tekrar incelemek üzere NetworkTables verilerinden bir WPILOG dosyası oluşturmak
- Dosya boyutunu küçültmek için yalnızca belirli alanları içeren (ve tekrarlayan değerlerin temizlendiği) bir WPILOG kaydetmek

Dışa aktarma seçeneklerini görmek için `Dosya` > `Verileri dışa aktar...` yolunu izleyin.

<img src="/img/overview/log-files/export-1.webp" alt="Dışa aktarma seçenekleri" />

_Yukarıda İngilizce arayüz gösterilmektedir._

:::tip
Buradaki tam log dışa aktarma özelliğine ek olarak, 💬 [Konsol](/tab-reference/console) sekmesinden konsol verilerini de bir metin dosyası olarak dışa aktarabilirsiniz.
:::

:::warning
**SysId için veri dışa aktarma**

SysId, AdvantageScope’un varsayılan dışa aktarma seçenekleriyle uyuşmayan ek zaman damgası verilerine ihtiyaç duyduğundan, **simülasyonda üretilen** log verilerini [SysId](https://docs.wpilib.org/tr/stable/docs/software/advanced-controls/system-identification/introduction.html) için bu özellik üzerinden dışa aktarmanızı önermeyiz. **Simülasyon _dışında_ üretilen** log verilerini ise çok az veri kaybıyla SysId için dışa aktarabilirsiniz (yine de en yüksek doğruluk için _orijinal_ log dosyasını doğrudan SysId’de kullanmanız daha iyidir).

_Bu uyarı AdvantageKit’in ürettiği loglar için **geçerli değildir**; “AdvantageKit döngüleri” seçeneğini seçerek bu logları hiçbir veri kaybı olmadan dışa aktarabilirsiniz. Ayrıntılar için [bu sayfaya](https://docs.advantagekit.org/data-flow/sysid-compatibility) göz atın._
:::

## Seçenekler {#options}

Dışa aktarma penceresinde şu seçenekler bulunur:

- **Format:** Dışa aktarılacak dosyanın genel formatını belirler:
  - _CSV (Tablo):_ Her satırın ayrı bir zaman damgasını, her sütunun ise bir alanı (ve zaman damgası değerini) temsil ettiği virgülle ayrılmış dosya formatıdır. Tek bir satırda birden fazla alanın değeri yer alabilir.
  - _CSV (Liste):_ Her satırın zaman damgası, anahtar ve değer sütunlarıyla tek bir alanın değerini temsil ettiği virgülle ayrılmış dosya formatıdır.
  - _WPILOG:_ AdvantageScope’ta yeniden açılabilen standart WPILOG dosyasıdır.
  - _MCAP:_ [Foxglove](https://foxglove.dev) uygulamasında açılabilen standart [MCAP](https://mcap.dev) dosyasıdır.
- **Zaman damgaları:** Yalnızca “CSV (Tablo)” için geçerlidir. Yeni satırların nasıl oluşturulacağını belirler:
  - _Tüm değişiklikler:_ Yalnızca alan değerleri güncellendiğinde yeni satır oluşturur. Çıktı dosyasının boyutunu en aza indirir.
  - _Sabit periyot:_ Sabit aralıklarla yeni satır oluşturur. Zaman damgası senkronizasyonu olmayan loglar için (birçok alanın benzer ama birebir aynı olmayan zaman damgalarıyla kaydedildiği durumlarda) kullanışlıdır. Örnek noktaları arasında değer değişmese bile tüm değerler dosyaya dahil edilir.
  - _AdvantageKit döngüleri:_ Her AdvantageKit senkronize döngü periyodu için yeni bir satır oluşturur. Döngü periyotları arasında değer değişmese bile tüm değerler dosyaya dahil edilir.
- **Periyot (ms):** Yalnızca “Sabit periyot” seçildiğinde görünür. Örnekler arasındaki süreyi milisaniye cinsinden ayarlar. Genellikle robot kodunuzun döngü süresiyle aynı olmalıdır.
- **Ön ekler:** Boş bırakılırsa tüm alanlar dahil edilir. Değer girerseniz yalnızca belirttiğiniz ön eklerle (virgülle ayrılmış) eşleşen alanlar dışa aktarılır. Örnekler:
  - “_/DriverStation/Joystick0_”: “/DriverStation/Joystick0” ile başlayan tüm alanları (ilk joystick verilerini) dahil eder.
  - “_Flywheels,DS:enabled_”: “/Flywheels” veya “DS:enabled” ile başlayan tüm alanları (volan verilerini ve robotun etkin durumunu) dahil eder.
  - “_Drive/LeftPosition,Drive/RightPosition_”: Yalnızca “/Drive/LeftPosition” ve “/Drive/RightPosition” alanlarını dahil eder.
- **Alan kümesi:** Aşağıdaki iki seçenekten birini seçebilirsiniz. Oluşturulan alanlar, karmaşık veri türlerini parçalamak için AdvantageScope’un ürettiği alanlardır ve kenar çubuğunda gri renkte görünür (dizilerin, struct’ların ve diğer şemaların tekil bileşenleri gibi).
  - _Oluşturulanları dahil et:_ Oluşturulan alanlar dahil görüntülenebilen tüm alanları dışa aktarır. Çıktı dosyasını karmaşık veri türlerini ayrıştıramayan bir uygulamada açacaksanız bu seçeneği kullanın.
  - _Yalnızca orijinaller:_ Oluşturulan alanları hariç tutarak yalnızca orijinal log dosyasında bulunan alanları dışa aktarır. Çıktı dosyasını AdvantageScope’ta veya karmaşık türleri ayrıştırabilen başka bir uygulamada açacaksanız bu seçeneği kullanın.

Zaman damgaları “Tüm değişiklikler” olarak ayarlanmış “CSV (Tablo)” formatında AdvantageScope’tan dışa aktarılan örnek bir CSV dosyasını aşağıda görebilirsiniz:

<img src="/img/overview/log-files/export-2.webp" alt="CSV tablosu" />
