---
sidebar_position: 2
---

# Phoenix tanılama {#phoenix-diagnostics}

AdvantageScope, **kullanıcı kodunda hiçbir kurulum gerektirmeden** Phoenix 6 cihazlarından gelen sinyalleri canlı olarak aktarabilir. Böylece AdvantageScope'un tanıdık arayüzünü ve tüm araçlarını kullanarak Phoenix cihazlarınızda kolayca hata ayıklama ve ince ayar yapabilirsiniz:

- Tablolar ve istatistiksel analiz dahil esnek görselleştirme seçenekleri
- Otomatik ve tek tıkla birim dönüştürme dahil birim duyarlı grafikleme için tam destek ([belgeler](/tab-reference/line-graph/units))
- Enum değerlerinin okunabilir metinlere dönüştürülmesi (kontrol modları, köprü durumu, CANcoder mıknatıs durumu vb.)
- Her sinyal için açıklamalar ve birimler içeren kenar çubuğu ipuçları
- CAN veriyolu, cihaz ve sinyal türüne göre gruplandırılmış hiyerarşik sinyal düzeni
- Yerleşik integral ve türev seçenekleriyle gelişmiş veri analizi ([belgeler](/tab-reference/line-graph/#adjusting-axes))

:::tip
Bağlanmak için menü çubuğundan robota veya simülatöre bağlanırken “Phoenix tanılama”yı seçin.
:::

<img src="/img/overview/live-sources/phoenix-1.webp" alt="Çizgi grafik ekran görüntüsü" />

AdvantageScope'un 📊 [İstatistikler](/tab-reference/statistics) sekmesi de histogramlar, özel aralıklar ve göreli/mutlak hata ölçümleri için türetilmiş alanlarla Phoenix sinyalleri üzerinde gelişmiş analiz yapmanıza olanak tanır:

<img src="/img/overview/live-sources/phoenix-2.webp" alt="İstatistikler ekran görüntüsü" />

_Yukarıda İngilizce arayüz gösteriliyor._

:::note
Bu özellik, Phoenix güncellemeleri nedeniyle zaman zaman sorun çıkarabilir. Sorun yaşama ihtimalini azaltmak için AdvantageScope'un en güncel sürümünü kullanmanızı öneririz. Yine de bir problemle karşılaşırsanız lütfen [bir issue açarak](https://github.com/Mechanical-Advantage/AdvantageScope/issues) bize bildirin.
:::
