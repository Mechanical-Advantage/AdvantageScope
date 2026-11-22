---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Ayar modu {#tuning-mode}

Bazı canlı kaynaklar sayısal ve boolean değerlerin canlı olarak ayarlanmasını destekler. Örneğin bir NetworkTables kaynağına bağlıyken [kontrolcü kazançlarını ayarlamak](https://docs.wpilib.org/tr/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) için bu özelliği kullanabilirsiniz. Elbette robot kodunun da NetworkTables üzerinden kazanç almayı desteklemesi gerekir.

Varsayılan olarak AdvantageScope'taki tüm değerler salt okunurdur. Ayar modunu açıp kapatmak için desteklenen bir canlı kaynağa bağlıyken arama çubuğunun sağındaki **kaydırıcı simgesine tıklayın**. Simge mor renge döndüğünde ayar modu etkindir ve alanları düzenleyebilirsiniz.

- Bir **sayısal alanı** düzenlemek için kenar çubuğundaki alanın sağında yer alan metin kutusuna yeni değeri yazın. Kutu dışına tıkladığınızda veya “Enter” tuşuna bastığınızda değer yayınlanır. Robotun yayınladığı değeri kullanmaya devam etmek için metin kutusunu boş bırakın.
- Bir **boolean alanı** değiştirmek için kenar çubuğundaki alanın sağında yer alan kırmızı veya yeşil daireye tıklayın.
- Yayınlanan tüm değerleri panoya kopyalamak için **kaydırıcı simgesine sağ tıklayıp** **“Ayarlanan değerleri kopyala”**yı seçin.

:::tip
iPhone ve iPad kullanıcıları için **AdvantageTune**, AdvantageScope geliştiricileri tarafından mobil cihazlardan NetworkTables değerlerini ayarlamak için oluşturulmuş alternatif bir seçenektir.

[<img src="/img/app-store_tr.svg" alt="App Store" />](https://apps.apple.com/tr/app/advantagetune/id6811453643?l=tr)
:::

## WPILib Tunables {#wpilib-tunables}

WPILib'de sayılar ve booleanlar gibi değerler Tunable API kullanılarak yapılandırılabilir ve AdvantageScope üzerinden gerçek zamanlı olarak ayarlanabilir. Ayarlanabilir değerler bir kez kaydedilir ve robot kodunda periyodik olarak okunabilir:

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
import org.wpilib.tunable.TunableBoolean;
import org.wpilib.tunable.TunableDouble;
import org.wpilib.tunable.Tunables;

TunableDouble tunableNumber = Tunables.addDouble("MyTunableNumber", 0.0);
TunableBoolean tunableBoolean = Tunables.addBoolean("MyTunableBoolean", false);

// Değerleri periyodik olarak okuyun
double num = tunableNumber.get();
boolean bool = tunableBoolean.get();
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
#include <wpi/tunables/Tunables.hpp>

wpi::tunables::TunableDouble tunableNumber =
    wpi::tunables::Add<double>("MyTunableNumber", 0.0);
wpi::tunables::TunableBool tunableBoolean =
    wpi::tunables::Add<bool>("MyTunableBoolean", false);

// Değerleri periyodik olarak okuyun
double num = tunableNumber.Get();
bool boolVal = tunableBoolean.Get();
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import tunables

tunable_number = tunables.add_double("MyTunableNumber", 0.0)
tunable_boolean = tunables.add_boolean("MyTunableBoolean", False)

# Değerleri periyodik olarak okuyun
num = tunable_number.get()
bool_val = tunable_boolean.get()
```

</TabItem>
</Tabs>

## AdvantageKit ile ayarlama {#tuning-with-advantagekit}

AdvantageKit'in `AdvantageKit` alt tablosuna yayınladığı alanlar yalnızca çıktı amaçlıdır ve düzenlenemez. Ancak kendi kodunuzdan AdvantageScope üzerinden ayarlanabilen alanlar yayınlayabilirsiniz. **NetworkTables'daki “/Tuning” tablosuna yayınlanan tüm alanlar, “NetworkTables (AdvantageKit)” canlı kaynağı kullanılırken “Tuning” tablosunun altında görünür.**

Örneğin [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs) sınıfını kullanarak ayarlanabilir bir sayı yayınlayabilirsiniz:

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
`NetworkInputs` alt tablosu **düzenlenemez**; çünkü AdvantageKit bu tabloyu loglama ve yeniden oynatma amacıyla ağ değerlerini kaydetmek için kullanır. Ağ girdileriyle gerçek zamanlı etkileşim kurmak için `Tuning` tablosunu kullanın.
:::
