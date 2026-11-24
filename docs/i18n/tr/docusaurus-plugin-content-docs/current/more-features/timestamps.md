---
sidebar_position: 5
---

# ⏱️ Zaman damgaları {#timestamps}

AdvantageScope; zaman çizelgesi, 📉 [Çizgi grafik](/tab-reference/line-graph), 🔢 [Tablo](/tab-reference/table) ve 💬 [Konsol](/tab-reference/console) dahil olmak üzere tüm görünümlerde özelleştirilebilir zaman damgası görüntüleme seçeneklerini destekler.

## Görüntüleme modları {#display-modes}

Zaman damgası görüntüleme modunu tercihler penceresinden ayarlayabilirsiniz:

- **Sıfırdan başlat (Varsayılan):** Logdaki en eski verinin sıfırdan (`+0.0s`) başlaması için tüm zaman damgalarını kaydırır. Bu modda zaman damgalarının başına, verilerin başlangıcından itibaren geçen süreyi göstermek için bir `+` işareti eklenir.
- **Orijinal:** Zaman damgalarını log dosyasına kaydedildiği orijinal sayısal değerleriyle gösterir; yani robot kodunun kullandığı değerlerle birebir eşleşir.

:::info
WPILib 2027'den itibaren zaman damgaları Systemcore'da ve simülasyonda cihazın açılışından (boot) bu yana geçen süreye göre ölçülür. Ham zaman damgaları çok büyük veya rastgele sayılardan başlayabildiği için **Sıfırdan başlat** modu daha anlaşılır bir görünüm sunar.
:::

## Çoklu log senkronizasyonu {#multi-log-synchronization}

[Birden fazla log dosyasını aynı anda açtığınızda](/overview/log-files/#opening-logs) AdvantageScope bunların zaman damgalarını senkronize edip hizalar. **Sıfırdan başlat** modunda sıfır noktası, yüklü tüm dosyalar arasındaki en eski zaman damgasına göre belirlenir. **Orijinal** modunda ise ilk açılan logun zaman tabanı esas alınır ve diğer loglar buna hizalanacak şekilde kaydırılır.

## Özelleştirme {#customization}

Zaman damgası görüntüleme modunu değiştirmek için `Uygulama` > `Tercihleri göster...` (Windows/Linux) veya `AdvantageScope` > `Ayarlar...` (macOS) menüsünden ya da `Ctrl+,` / `Cmd+,` kısayoluyla tercihler penceresini açın. Ardından **Zaman damgaları** ayarını istediğiniz seçenekle değiştirin.

<img src="/img/prefs_tr.webp" alt="Tercihler diyagramı" height="450" />
