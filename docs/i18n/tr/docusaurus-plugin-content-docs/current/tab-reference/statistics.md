---
sidebar_position: 6
---

# 📊 İstatistikler {#statistics}

İstatistikler sekmesi, zaman içindeki değişikliklerden ziyade genel eğilimleri analiz ederek sayısal alanların derin istatistiksel analizine olanak tanır. Seçilen alanlar bir histogram ve çeşitli standart istatistiksel ölçümler kullanılarak analiz edilir.

<img src="/img/tab-reference/statistics-1.png" alt="Overview of statistics tab" />

## Kontrol paneli {#control-pane}

Başlamak için bir alanı "Ölçümler" bölümüne sürükleyin. X düğmesini kullanarak bir alanı silin veya göz simgesine tıklayarak ya da alan adına çift tıklayarak geçici olarak gizleyin. Tüm alanları kaldırmak için eksen başlığının yanındaki üç noktaya ve ardından `Tümünü Temizle` seçeneğine tıklayın. Alanlar listede tıklanıp sürüklenerek yeniden düzenlenebilir.

Alanlar arasındaki farkı analiz etmek için bir alanı "Referans" moduna geçirin ve ek diğer alanları alt ögeler olarak ekleyin. Alt ögeler "Göreli Hata" ve "Mutlak Hata" modları arasında değiştirilebilir.

:::info
Her alanın rengi, renkli simgeye tıklanarak veya alan adına sağ tıklanarak özelleştirilebilir.
:::

### Yapılandırma {#configuration}

**Zaman Aralığı** seçeneği, log dosyasının hangi bölümlerinin analiz için kullanılacağını seçer:

- _Görünür Aralık:_ Zaman çizelgesinde görünen zaman aralığını analiz eder.
- _Tüm Log:_ Log dosyasının tüm aralığını analiz eder.
- _Etkin:_ Robotun etkin olduğu zaman aralıklarını analiz eder.
- _Otonom:_ Robotun otonomda olduğu zaman aralıklarını analiz eder.
- _Teleop:_ Robotun teleoperasyonda olduğu zaman aralıklarını analiz eder.
- _Canlı: 30 Saniye:_ En son 30 saniyeyi analiz eder (bir canlı kaynağa bağlıyken).
- _Canlı: 10 Saniye:_ En son 10 saniyeyi analiz eder (bir canlı kaynağa bağlıyken).

**Veri Aralığı** seçeneği, histogramda görüntülenecek minimum ve maksimum değerleri seçer. Bu aralığın dışındaki veriler gösterilmez, ancak istatistiksel ölçümler için kullanılmaya devam eder.

**Adım Boyutu** seçeneği, her bir histogram aralığının boyutunu seçer. Daha küçük değerler daha ayrıntılı grafikler üretir, ancak aynı zamanda daha fazla gürültüyü ortaya çıkarır.

## Görüntüleyici paneli {#viewer-pane}

### Histogram {#histogram}

Histogram, belirli aralık dahilinde her bir aralığa düşen örneklerin sayısını gösterir. Belirtilen aralığın dışındaki verilerin atıldığını (ayrı bir aralıkta gruplandırılmak yerine) unutmayın.

### İstatistiksel ölçümler {#statistical-measures}

İstatistiksel ölçümler tablosu, sağlanan alanlar için hesaplanan her bir ölçüm değerini gösterir. Her ölçüm hakkında daha fazla bilgi aşağıda verilmiştir.

#### Özet {#summary}

- **Count:** Üretilen ayrık örneklerin sayısı.
- **Min:** Verideki en küçük değer.
- **Max:** Verideki en büyük değer.

#### Merkez {#center}

- [**Mean:**](https://tr.wikipedia.org/wiki/Aritmetik_ortalama) Verilerin aritmetik ortalaması (basit ortalama).
- [**Median:**](https://tr.wikipedia.org/wiki/Medyan) Verilerin "orta" değeri veya %50 yüzdelik dilimi.
- [**Mode:**](https://tr.wikipedia.org/wiki/Mod)>) Verilerde en sık rastlanan değer.
- [**Geometrik Ortalama:**](https://tr.wikipedia.org/wiki/Geometrik_ortalama) Toplam yerine değerlerin çarpımı kullanılarak hesaplanan bir merkez ölçümü. Üstel büyüme oranlarını (döngüler arasındaki yüzde değişimi gibi) ölçerken geçerlidir.
- [**Harmonik Ortalama:**](https://tr.wikipedia.org/wiki/Harmonik_ortalama) Değerlerin çarpmaya göre terslerinin toplamı kullanılarak hesaplanan bir merkez ölçümü. Oranları veya hızları ölçerken geçerlidir.
- [**Karesel Ortalama:**](https://tr.wikipedia.org/wiki/Karek%C3%B6k_ortalama) Değerlerin kareleri kullanılarak hesaplanan bir merkez ölçümü. Periyodik hareket gibi hem pozitif hem negatif değerlere sahip verileri ölçerken geçerlidir.

#### Yayılım {#spread}

- [**Standart Sapma:**](https://tr.wikipedia.org/wiki/Standart_sapma) Düşük değerin daha az varyasyonu belirttiği en yaygın istatistiksel varyasyon ölçümü. Verilerin %68'i ortalamanın bir standart sapması içinde kalır.
- [**Ortalama Mutlak Sapma:**](https://en.wikipedia.org/wiki/Average_absolute_deviation) Her bir değer ile ortalama arasındaki ortalama mesafe. Bu, standart sapmaya bir alternatiftir.
- [**Çeyrekler Açıklığı:**](https://tr.wikipedia.org/wiki/%C3%87eyrekler_a%C3%A7%C4%B1kl%C4%B1%C4%9F%C4%B1) Üçüncü ve birinci çeyrekler (%75 yüzdelik dilim ve %25 yüzdelik dilim) arasındaki fark, aykırı değerlerden standart sapma veya ortalama mutlak sapmaya göre daha az etkilenir.
- [**Çarpıklık:**](https://tr.wikipedia.org/wiki/%C3%87arp%C4%B1kl%C4%B1k) Verilerin asimetrik eğikliğinin bir ölçümü. Negatif değer sola doğru bir kuyruk belirtir, pozitif değer sağa doğru bir kuyruk belirtir ve sıfır değeri simetrik bir dağılımı gösterir.

#### Yüzdelikler {#percentiles}

[Yüzdelikler](https://tr.wikipedia.org/wiki/Y%C3%BCzdebirlik), verilen diğer değerlerin yüzdesinin altında kaldığı değerleri ölçer. Örneğin, değerlerin %10'u 10. yüzdelik dilimin altında kalır. Aşağıdaki yüzdelikler ayrıca şu şekilde bilinir:

- 25. Yüzdelik = 1. çeyrek (Q1)
- 50. Yüzdelik = 2. çeyrek (Q2) = medyan
- 75. Yüzdelik = 3. çeyrek (Q3)
