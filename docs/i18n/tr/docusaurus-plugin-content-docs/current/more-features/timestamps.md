---
sidebar_position: 5
---

# ⏱️ Zaman damgaları {#timestamps}

AdvantageScope; zaman çizelgesi, 📉 [Çizgi grafik](/tab-reference/line-graph), 🔢 [Tablo](/tab-reference/table) ve 💬 [Konsol](/tab-reference/console) dahil olmak üzere tüm görünümlerde özelleştirilebilir zaman damgası görüntüleme seçeneklerini destekler.

## Görüntüleme modları {#display-modes}

Zaman damgası görüntüleme modu tercihler penceresinden yapılandırılabilir:

- **Sıfırdan başlat (Varsayılan):** Logdaki en erken verinin sıfırdan (`+0.0s`) başlaması için tüm zaman damgalarını öteler. Bu modda görüntülenen zaman damgaları, verilerin başlangıcından itibaren geçen süreyi belirtmek için bir `+` sembolü ile ön ek alır.
- **Orijinal:** Zaman damgalarını, log dosyasında kaydedildiği gibi orijinal sayısal değerlerini kullanarak görüntüler ve robot kodu tarafından kullanılan tam değerlerle eşleşir.

:::info
WPILib 2027'den başlayarak, zaman damgaları Systemcore'da ve simülasyonda cihazın açılışından (boot) bu yana geçen süre kullanılarak ölçülür. Ham zaman damgaları rastgele büyük sayılardan başlayabileceğinden, **Sıfırdan başlat** daha sezgisel bir görselleştirme seçeneği olarak sunulmuştur.
:::

## Çoklu log senkronizasyonu {#multi-log-synchronization}

[Birden fazla log dosyası aynı anda açıldığında](/overview/log-files/#opening-logs), AdvantageScope bunların zaman damgalarını senkronize eder ve hizalar. **Sıfırdan başlat** modunda, sıfır noktası yüklenen tüm dosyalar arasındaki en erken zaman damgasına ayarlanır. **Orijinal** modunda, zaman damgaları ilk açılan logun zaman tabanı kullanılarak görüntülenir ve eklenen diğer loglar buna hizalanacak şekilde kaydırılır.

## Özelleştirme {#customization}

Zaman damgası görüntüleme modunu değiştirmek için `App` > `Tercihleri Göster...` (Windows/Linux) veya `AdvantageScope` > `Ayarlar...` (macOS) seçeneğine tıklayarak ya da `Ctrl+,` / `Cmd+,` tuşlarına basarak tercihler penceresini açın. **Zaman damgaları** ayarını istediğiniz seçeneğe güncelleyin.

<img src="/img/prefs_tr.webp" alt="Tercihler diyagramı" height="350" />
