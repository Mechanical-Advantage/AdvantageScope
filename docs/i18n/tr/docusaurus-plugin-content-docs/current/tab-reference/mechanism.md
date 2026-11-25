---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ Mekanizma {#mechanism}

Mekanizma sekmesi, bir veya daha fazla [Mechanism2d](https://docs.wpilib.org/tr/stable/docs/software/dashboards/glass/mech2d-widget.html) nesnesiyle oluşturulan eklemli bir mekanizmayı görüntüler.

<img src="/img/tab-reference/mechanism-1.webp" alt="Mekanizma sekmesine genel bakış" />

_Yukarıda İngilizce arayüz gösterilmiştir._

<details>
<summary>Zaman çizelgesi kontrolleri</summary>

Zaman çizelgesi, oynatmayı ve görselleştirmeyi kontrol etmenizi sağlar. Zaman çizelgesine tıklayarak bir anı seçebilir, sağ tıklayarak seçimi kaldırabilirsiniz. Seçilen zaman tüm sekmelerde senkronize edildiği için aynı anı diğer görünümlerde de kolayca bulabilirsiniz.

Sarı bölümler robotun otonomda, mavi bölümler teleop modunda, gri bölümler ise test modunda olduğu aralıkları gösterir.

Yakınlaştırmak için imleci zaman çizelgesinin üzerine getirip yukarı veya aşağı kaydırın. `Shift` tuşunu basılı tutarak tıklayıp sürüklediğinizde belirli bir aralığı da seçebilirsiniz. Yatay kaydırma yaparak (desteklenen cihazlarda) veya zaman çizelgesini tıklayıp sürükleyerek sağa ve sola hareket edebilirsiniz. Canlı bağlantıdayken sola kaydırmak mevcut zamandaki kilidi açar, en sağa kadar kaydırmak ise tekrar mevcut zamana kilitler. Robotun etkin olduğu aralığa yakınlaştırmak için `Ctrl+\` tuşlarına basın.

<img src="/img/tab-reference/timeline.webp" alt="Zaman çizelgesi" />

</details>

## Mekanizmalar ekleme {#adding-mechanisms}

Başlamak için bir `Mechanism2d` nesnesini kontrol paneline sürükleyin. Bir mekanizmayı X düğmesiyle silebilir; göz simgesine tıklayarak ya da alan adına çift tıklayarak geçici olarak gizleyebilirsiniz. Tüm mekanizmaları kaldırmak için eksen başlığının yanındaki çöp kutusuna ve ardından `Tümünü temizle` seçeneğine tıklayın. Mekanizmaları listede tıklayıp sürükleyerek yeniden sıralayabilirsiniz.

## Veri yayınlama {#publishing-data}

Mekanizma verilerini yayınlamak için periyodik olarak bir `Mechanism2d` nesnesi loglayın (aşağıda gösterildiği gibi). Bu çağrının yalnızca `Mechanism2d` nesnesinin o anki durumunu kaydettiğini unutmayın; bu yüzden nesne güncellendikten sonra her döngü periyodunda çağrılmalıdır.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);

periodic() {
  Telemetry.log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::Mechanism2d mechanism{3, 3};

void Periodic() {
  wpi::telemetry::Log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import wpilib
import telemetry

mechanism = wpilib.Mechanism2d(3, 3)

def periodic():
    telemetry.log("MyMechanism", mechanism)
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);

periodic() {
  Logger.recordOutput("MyMechanism", mechanism);
}
```

:::tip
AdvantageKit'in [@AutoLogOutput](https://docs.advantagekit.org/data-flow/recording-outputs/annotation-logging) anotasyonunu kullanarak, `Logger.recordOutput` çağrısı yapmadan mekanizmanın durumunu her döngü periyodunda otomatik olarak loglayabilirsiniz.
:::

</TabItem>
</Tabs>
