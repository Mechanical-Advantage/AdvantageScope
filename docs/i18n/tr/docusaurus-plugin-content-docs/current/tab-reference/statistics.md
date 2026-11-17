---
sidebar_position: 6
---

# 📊 İstatistikler {#statistics}

İstatistikler sekmesi, sayısal alanların zaman içindeki değişimlerinden ziyade genel eğilimlerini derinlemesine analiz etmenizi sağlar. Seçilen alanlar bir histogram ve çeşitli standart istatistiksel ölçümler kullanılarak analiz edilir.

<img src="/img/tab-reference/statistics-1.webp" alt="İstatistikler sekmesine genel bakış" />

_Yukarıda İngilizce arayüz gösteriliyor._

## Kontrol paneli {#control-pane}

Başlamak için bir alanı “Ölçümler” bölümüne sürükleyin. X düğmesine tıklayarak bir alanı silebilir, göz simgesine tıklayarak veya alan adına çift tıklayarak geçici olarak gizleyebilirsiniz. Tüm alanları kaldırmak için başlığın yanındaki çöp kutusuna ve ardından `Tümünü temizle` seçeneğine tıklayın. Alanların listedeki sırasını tıklayıp sürükleyerek değiştirebilirsiniz.

Alanlar arasındaki farkı analiz etmek için bir alanı “Referans” moduna geçirin ve diğer alanları alt öge olarak ekleyin. Alt ögeleri “Bağıl hata” ve “Mutlak hata” modları arasında değiştirebilirsiniz.

:::info
Her alanın rengini renkli simgeye tıklayarak veya alan adına sağ tıklayarak özelleştirebilirsiniz.
:::

### Yapılandırma {#configuration}

**Zaman aralığı** seçeneği, log dosyasının hangi bölümlerinin analiz edileceğini belirler:

- _Görünür aralık:_ Zaman çizelgesinde görünen zaman aralığını analiz eder.
- _Tam log:_ Log dosyasının tüm aralığını analiz eder.
- _Etkin:_ Robotun etkin olduğu zaman aralıklarını analiz eder.
- _Otonom:_ Robotun otonomda olduğu zaman aralıklarını analiz eder.
- _Teleop:_ Robotun teleopta olduğu zaman aralıklarını analiz eder.
- _Canlı: 30 saniye:_ En son 30 saniyeyi analiz eder (canlı bir kaynağa bağlıyken).
- _Canlı: 10 saniye:_ En son 10 saniyeyi analiz eder (canlı bir kaynağa bağlıyken).

**Veri aralığı** seçeneği, histogramda görüntülenecek minimum ve maksimum değerleri belirler. Bu aralığın dışındaki veriler grafikte gösterilmez ancak istatistiksel ölçümlerde kullanılmaya devam eder.

**Adım boyutu** seçeneği, her histogram aralığının boyutunu belirler. Daha küçük değerler daha ayrıntılı grafikler üretir, ancak verideki gürültüyü de daha fazla ortaya çıkarır.

## Görüntüleyici paneli {#viewer-pane}

### Histogram {#histogram}

Histogram, belirlenen aralık içinde her bir dilime düşen örnek sayısını gösterir. Belirtilen aralığın dışındaki verilerin ayrı bir dilimde gruplanmak yerine dışarıda bırakıldığını unutmayın.

### İstatistiksel ölçümler {#statistical-measures}

İstatistiksel ölçümler tablosu, seçilen alanlar için hesaplanan her bir ölçümün değerini gösterir. Her ölçüm hakkında daha fazla bilgiyi aşağıda bulabilirsiniz.

#### Özet {#summary}

- **Sayı:** Üretilen ayrık örneklerin sayısı.
- **Min:** Verideki en küçük değer.
- **Maks:** Verideki en büyük değer.

#### Merkez {#center}

- [**Ortalama:**](https://tr.wikipedia.org/wiki/Aritmetik_ortalama) Verilerin aritmetik ortalaması (basit ortalama).
- [**Medyan:**](https://tr.wikipedia.org/wiki/Medyan) Verilerin “orta” değeri veya %50 yüzdelik dilimi.
- [**Mod:**](https://tr.wikipedia.org/wiki/Mod) Verilerde en sık rastlanan değer.
- [**Geometrik ortalama:**](https://tr.wikipedia.org/wiki/Geometrik_ortalama) Toplam yerine değerlerin çarpımı kullanılarak hesaplanan merkez ölçümü. _Üstel büyüme oranlarını_ (döngüler arasındaki yüzde değişimi gibi) ölçerken uygundur.
- [**Harmonik ortalama:**](https://tr.wikipedia.org/wiki/Harmonik_ortalama) Değerlerin çarpmaya göre terslerinin toplamı kullanılarak hesaplanan merkez ölçümü. _Oranları veya hızları_ ölçerken uygundur.
- [**Karesel ortalama:**](https://tr.wikipedia.org/wiki/Karek%C3%B6k_ortalama) Değerlerin kareleri kullanılarak hesaplanan merkez ölçümü. Periyodik hareket gibi hem _pozitif hem negatif değerlere_ sahip verileri ölçerken uygundur.

#### Yayılım {#spread}

- [**Standart sapma:**](https://tr.wikipedia.org/wiki/Standart_sapma) En yaygın istatistiksel yayılım ölçümüdür; düşük değer daha az değişkenlik anlamına gelir. Normal dağılmış verilerde, verilerin yaklaşık %68'i ortalamanın bir standart sapması içinde kalır.
- [**Medyan mutlak sapma:**](https://en.wikipedia.org/wiki/Median_absolute_deviation) Verilerin medyanından mutlak sapmaların medyanıdır. Aykırı değerlere karşı standart sapmadan daha dayanıklı bir istatistiksel yayılım ölçümüdür.
- [**Çeyrekler açıklığı:**](https://tr.wikipedia.org/wiki/%C3%87eyrekler_a%C3%A7%C4%B1kl%C4%B1%C4%9F%C4%B1) Üçüncü ve birinci çeyrekler (%75 ve %25 yüzdelik dilimleri) arasındaki farktır; aykırı değerlerden standart sapmaya göre daha az etkilenir.
- [**Çarpıklık:**](https://tr.wikipedia.org/wiki/%C3%87arp%C4%B1kl%C4%B1k) Verilerin asimetrik eğikliğinin ölçümüdür. Negatif değer sola doğru bir kuyruk, pozitif değer sağa doğru bir kuyruk belirtir; sıfır değeri ise simetrik bir dağılıma işaret eder.

#### Yüzdelikler {#percentiles}

[Yüzdelikler](https://tr.wikipedia.org/wiki/Y%C3%BCzdebirlik), diğer değerlerin belirli bir yüzdesinin altında kaldığı değerleri ölçer. Örneğin, değerlerin %10'u 10. yüzdelik dilimin altında kalır. Aşağıdaki yüzdelikler şu adlarla da bilinir:

- 25. Yüzdelik = 1. çeyrek (Q1)
- 50. Yüzdelik = 2. çeyrek (Q2) = medyan
- 75. Yüzdelik = 3. çeyrek (Q3)
