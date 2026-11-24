# 🧭 Uygulamada gezinme {#app-navigation}

Aşağıdaki ekran görüntüsünde ana AdvantageScope penceresinin temel bölümlerini görebilirsiniz. Görünüm işletim sistemine göre ufak farklılıklar gösterebilir.

<img src="/img/overview/navigation/navigation-1.webp" alt="Gezinme şeması" />

_Yukarıda İngilizce arayüz gösteriliyor._

- Kırmızı bölüm, kullanılabilir alanları listeleyen [kenar çubuğudur](#sidebar).
- Kahverengi bölüm, uygulamayı yönetmenizi ve görünümler arasında geçiş yapmanızı sağlayan [sekme çubuğudur](#tab-bar).
- Mavi bölüm, verilerin görüntülendiği [görüntüleyici panelidir](#viewer-pane).
- Yeşil bölüm, görselleştirmeyi ayarlamanızı sağlayan [kontrol panelidir](#control-pane).

:::tip
Birden fazla log dosyasını aynı anda incelemek için `Dosya` > `Yeni pencere` seçeneğine tıklayın.
:::

## Kenar çubuğu {#sidebar}

Sol tarafta kullanılabilir tabloları ve alanları gösteren kenar çubuğu yer alır. Seçilebilir alanlar _italik_ olarak, yerleşik tablolar (WPILib veya AdvantageKit'ten gelenler) ise <u>altı çizili</u> olarak gösterilir. İç içe tabloları açmak için ok simgesine tıklayın. **Tek bir alanı sürükleyerek** seçebilir ya da **cmd/ctrl tuşunu basılı tutup** birden fazla alana tıklayarak bir grup oluşturabilirsiniz. Seçimi tamamlamak için seçtiğiniz alan grubunu sürüklemeye başlayın.

Bir alanı aramak için arama kutusuna yazmaya başlayın. Açılan listeden istediğiniz alanı seçtiğinizde, ilgili alan kenar çubuğunda vurgulanır ve liste otomatik olarak o alana kaydırılır.

:::info
Kenar çubuğunun sağ kenarından tutup sürükleyerek boyutunu değiştirebilir veya gizleyebilirsiniz. Görünürlüğünü hızlıca açıp kapatmak için kenara çift tıklayın.
:::

## Sekme çubuğu {#tab-bar}

Farklı görünümler arasında geçiş yapmak için sekme çubuğunu (mavi) kullanın. Sol taraftaki 📖 simgesine tıklayarak bu belgelere istediğiniz zaman ulaşabilirsiniz. Mevcut sekme düzenini (ve ilgili ayarları) dışa aktarmak için `Dosya` > `Düzeni dışa aktar...`, bir dosyadan düzen içe aktarmak içinse `Dosya` > `Düzeni içe aktar...` yolunu izleyin.

:::info
Sekmeleri sürükleyip bırakarak yeniden sıralayabilir, üzerine sağ tıklayıp `Sekmeyi yeniden adlandır` seçeneğini seçerek adlarını değiştirebilirsiniz.
:::

Üstteki gezinme düğmeleri (yeşil) sekmeleri yönetmenizi ve oynatmayı kontrol etmenizi sağlar.

- **Artı düğmesi:** Yeni sekme eklemek için bir açılır menü açar.
- **Pencere düğmesi:** Sekmeyi ayrı bir pencereye taşır. Bu özellik sayesinde birden fazla sekmedeki verileri aynı anda yan yana görebilirsiniz.
- **X düğmesi:** Açık olan sekmeyi kapatır.
- **Oynat düğmesi:** Gerçek zamanlı oynatmayı başlatır ve durdurur. _Oynatma hızını değiştirmek veya döngüyü açmak için sağ tıklayın._

## Görüntüleyici paneli {#viewer-pane}

Görüntüleyici paneli, her sekme türü için verilerin ekrana çizildiği alandır. Her sekmenin görüntüleyici paneliyle ilgili ayrıntılar için ilgili sekme belgelerini inceleyin. Sekme çubuğundaki “Sekmeyi ayır” düğmesine tıklayarak bu görünümü ayrı bir pencereye taşıyabilirsiniz.

## Kontrol paneli {#control-pane}

Kontrol paneli, görselleştirilecek alanları seçmek ve diğer ayarları düzenlemek için kullanılır. Her sekmede hangi seçeneklerin bulunduğunu görmek için ilgili sekme belgelerini inceleyin.

:::info
Kontrol panelinin üst kenarından tutup sürükleyerek boyutunu değiştirebilir veya gizleyebilirsiniz. Görünürlüğünü hızlıca açıp kapatmak için kenara çift tıklayın.
:::
