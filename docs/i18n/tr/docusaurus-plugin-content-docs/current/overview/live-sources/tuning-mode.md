---
sidebar_position: 1
---

# Ayar modu {#tuning-mode}

Bazı canlı kaynaklar sayısal ve boolean değerlerin canlı olarak ayarlanmasını destekler. Örneğin bir NetworkTables kaynağına bağlıyken [kontrolcü kazançlarını ayarlamak](https://docs.wpilib.org/tr/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) için bu özelliği kullanabilirsiniz. Elbette robot kodunun da NetworkTables üzerinden kazanç almayı desteklemesi gerekir.

Varsayılan olarak AdvantageScope’taki tüm değerler salt okunurdur. Ayar modunu açıp kapatmak için desteklenen bir canlı kaynağa bağlıyken arama çubuğunun sağındaki **kaydırıcı simgesine tıklayın**. Simge mor renge döndüğünde ayar modu etkindir ve alanları düzenleyebilirsiniz.

- Bir **sayısal alanı** düzenlemek için kenar çubuğundaki alanın sağında yer alan metin kutusuna yeni değeri yazın. Kutu dışına tıkladığınızda veya “Enter” tuşuna bastığınızda değer yayınlanır. Robotun yayınladığı değeri kullanmaya devam etmek için metin kutusunu boş bırakın.
- Bir **boolean alanı** değiştirmek için kenar çubuğundaki alanın sağında yer alan kırmızı veya yeşil daireye tıklayın.
- Yayınlanan tüm değerleri panoya kopyalamak için **kaydırıcı simgesine sağ tıklayıp** **“Ayarlanan değerleri kopyala”**yı seçin.

:::warning
Bu özellik robotu sahada sürmek veya kontrol etmek için tasarlanmamıştır. Seçiciler (chooser), tetikleyici düğmeler vb. dashboard tarzı girdiler desteklenmez.
:::

## AdvantageKit ile ayarlama {#tuning-with-advantagekit}

AdvantageKit’in `AdvantageKit` alt tablosuna yayınladığı alanlar yalnızca çıktı amaçlıdır ve düzenlenemez. Ancak kendi kodunuzdan AdvantageScope üzerinden ayarlanabilen alanlar yayınlayabilirsiniz. **NetworkTables’daki “/Tuning” tablosuna yayınlanan tüm alanlar, “NetworkTables (AdvantageKit)” canlı kaynağı kullanılırken “Tuning” tablosunun altında görünür.**

Örneğin [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs) sınıfını kullanarak ayarlanabilir bir sayı yayınlayabilirsiniz:

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
`NetworkInputs` alt tablosu **düzenlenemez**; çünkü AdvantageKit bu tabloyu loglama ve yeniden oynatma amacıyla ağ değerlerini kaydetmek için kullanır. Ağ girdileriyle gerçek zamanlı etkileşim kurmak için `Tuning` tablosunu kullanın.
:::
