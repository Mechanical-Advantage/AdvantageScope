---
sidebar_position: 5
---

# 💬 Konsol

Konsol görünümü, konsol verilerini içeren tek bir metin alanını görüntülemek için tasarlanmıştır. Önerilen bazı alanlar aşağıda listelenmiştir.

- **DS:/Dscomm/Console** - FIRST Sürücü İstasyonu tarafından kaydedilir.
- **messages** - [`DataLogManager.log`](<https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/wpilibj/DataLogManager.html#log(java.lang.String)>) yöntemine yapılan çağrılara dayalı olarak WPILib'in yerleşik loglaması tarafından kaydedilir.
- **/RealOutputs/Console** - Robot çalışması sırasında AdvantageKit tarafından otomatik olarak kaydedilir (normal şekilde `System.out.println` kullanın).
- **/ReplayOutputs/Console** - Log yeniden oynatma sırasında AdvantageKit tarafından otomatik olarak kaydedilir (normal şekilde `System.out.println` kullanın).

Başlamak için istenen alanı ana görünüme sürükleyin. Her satır alandaki bir güncellemeyi temsil eder. WPILib logları için kaydedilen her satır için yeni bir satır oluşturulur. AdvantageKit logları için her döngü periyodu için yeni bir satır oluşturulur.

<img src="/img/tab-reference/console-1.png" alt="Console view" />

:::info
Uyarı ve hata mesajları için vurgulamayı açıp kapatmak üzere renk paleti simgesine tıklayın. WPILib ve AdvantageKit logları için "warning" veya "error" metnini içeren mesajlar vurgulanır.
:::

Kontroller 🔢 [Tablo](../tab-reference/table) sekmesine benzer. Seçilen zaman tüm sekmeler arasında senkronize edilir. Bir satırı seçmek için tıklayın veya görünür herhangi bir ayrılmış pencerede önizlemek için bir satırın üzerine gelin. ↓ düğmesine tıklamak seçilen zamana (veya kutuya girilen zamana) atlar.

Yalnızca filtre metnini içeren satırları görüntülemek için "Filtre" girdisine metin girin. "Filtre" girdisini hızlıca seçmek için `Ctrl+F` tuşlarına basın. Eşleşen mesajları ana görünümden _hariç tutmak_ için filtre metninin başına bir "!" ekleyin.

:::tip
Konsol verilerini bir metin dosyasına dışa aktarmak için kaydet simgesine tıklayın.
:::
