---
sidebar_position: 2
---

# Phoenix tanılama {#phoenix-diagnostics}

AdvantageScope, **kullanıcı kodunda herhangi bir kurulum gerektirmeden** Phoenix 6 cihazlarından gelen sinyallerin canlı akışını destekler. Bu, AdvantageScope'un tanıdık arayüzü ve tüm gücü kullanılarak Phoenix cihazlarının kolayca hata ayıklanmasını ve ayarlanmasını sağlar:

- Birden fazla eksen ve ayrık alan desteği de dahil olmak üzere esnek görselleştirme seçenekleri
- Örtük ve tek tıkla birim dönüştürme dahil birim duyarlı grafikleme için tam destek ([dokümantasyon](/tab-reference/line-graph/units))
- Kolay göz atma için kenar çubuğunda tüm değerlerin canlı önizlemesi
- Aynı anda birden fazla cihazdan grafik çizme ve sinyal önizleme desteği
- Enum değerlerinin insan tarafından okunabilir metinler olarak çözümlenmesi (kontrol modları, köprü durumu, CANcoder mıknatıs durumu vb.)
- Her sinyal için açıklamalar ve birimler içeren entegre kenar çubuğu araç ipuçları
- CAN veriyolu, cihaz ve sinyal türüne göre gruplandırılmış hiyerarşik sinyal organizasyonu
- Yerleşik integral ve türev seçenekleriyle gelişmiş veri analizi ([dokümantasyon](/tab-reference/line-graph/#adjusting-axes))

:::tip
Bağlanmak için menü çubuğundan robota veya simülatöre bağlanırken "Phoenix Tanılama"yı seçin.
:::

<img src="/img/overview/live-sources/phoenix-1.png" alt="Çizgi grafiği ekran görüntüsü" />

AdvantageScope'un 📊 [İstatistikler](/tab-reference/statistics) sekmesi de histogramlar, özel aralıklar ve göreli ve mutlak hata ölçümleri için türetilmiş alanlar desteğiyle Phoenix sinyallerinin gelişmiş analizine olanak tanır:

<img src="/img/overview/live-sources/phoenix-2.png" alt="İstatistikler ekran görüntüsü" />

:::note
Bu özellik, Phoenix güncellemelerinin bir sonucu olarak zaman zaman sorunlar yaşayabilir. Sorunları en aza indirmek için AdvantageScope'un en son sürümünü kullanmanızı öneririz. Aksi takdirde, herhangi bir sorunu bize bildirmek için lütfen [bir sorun açın](https://github.com/Mechanical-Advantage/AdvantageScope/issues).
:::
