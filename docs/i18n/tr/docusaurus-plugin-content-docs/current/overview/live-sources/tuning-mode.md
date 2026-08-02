---
sidebar_position: 1
---

# Ayar modu

Bazı canlı kaynaklar sayısal ve boole değerlerinin canlı ayarlanmasını destekler. Örneğin bu özellik, bir NetworkTables kaynağına bağlıyken [kontrolcü kazançlarını ayarlamak](https://docs.wpilib.org/tr/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) için kullanılabilir. Robot kodunun NetworkTables üzerinden kazanç almayı desteklemesi gerektiğini unutmayın.

Varsayılan olarak AdvantageScope'taki tüm değerler salt okunurdur. Ayar modunu açıp kapatmak için, desteklenen bir canlı kaynağa bağlıyken arama çubuğunun sağındaki **kaydırıcı simgesine tıklayın**. Simge mor olduğunda ayar modu aktiftir ve alan düzenleme etkindir.

- Bir **sayısal alanı** düzenlemek için kenar çubuğundaki alanın sağında bulunan metin kutusunu kullanarak yeni bir değer girin. Değer, girdi seçimi kaldırıldıktan veya "Enter" tuşuna basıldıktan sonra yayınlanır. Robot tarafından yayınlanan değeri kullanmak için metin kutusunu boş bırakın.
- Bir **boole alanını** açıp kapatmak için kenar çubuğundaki alanın sağında bulunan kırmızı veya yeşil daireye tıklayın.

:::warning
Bu özellik robotu sahada kontrol etmek için tasarlanmamıştır. Seçiciler, tetikleyici düğmeler vb. gibi gösterge paneli tarzı girdiler desteklenmez.
:::

## AdvantageKit ile ayarlama

AdvantageKit tarafından `AdvantageKit` alt tablosuna yayınlanan alanlar yalnızca çıkış amaçlıdır ve düzenlenemez. Ancak kullanıcılar, kullanıcı kodundan AdvantageScope'tan ayarlanabilir alanlar yayınlayabilir. **NetworkTables üzerindeki "/Tuning" tablosuna yayınlanan tüm alanlar, "NetworkTables (AdvantageKit)" canlı kaynağı kullanılırken "Tuning" tablosu altında görünecektir.**

Örneğin, ayarlanabilir bir sayı [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs) sınıfı kullanılarak yayınlanabilir:

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
`NetworkInputs` alt tablosu **düzenlenemez**, çünkü AdvantageKit tarafından loglama ve yeniden oynatma amacıyla ağ değerlerini kaydetmek için kullanılır. Ağ girdileriyle gerçek zamanlı olarak etkileşime girmek için `Tuning` tablosunu kullanın.
:::
