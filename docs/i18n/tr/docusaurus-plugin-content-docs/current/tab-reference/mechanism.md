---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ Mekanizma

Mekanizma sekmesi, bir veya daha fazla [Mechanism2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html) nesnesi ile oluşturulmuş eklemli bir mekanizmayı görüntüler.

<img src="/img/tab-reference/mechanism-1.png" alt="Overview of mechanism tab" />

<details>
<summary>Zaman Çizelgesi Kontrolleri</summary>

Zaman çizelgesi oynatmayı ve görselleştirmeyi kontrol etmek için kullanılır. Zaman çizelgesine tıklamak bir zaman seçer ve sağ tıklamak seçimi kaldırır. Seçilen zaman tüm sekmeler arasında senkronize edilir, bu da bu konumu diğer görünümlerde hızlıca bulmayı kolaylaştırır.

Sarı bölümler robotun otonomda olduğu zamanları, mavi bölümler robotun teleoperasyonda olduğu zamanları ve gri bölümler robotun test modunda olduğu zamanları gösterir.

Yakınlaştırmak için imleci zaman çizelgesinin üzerine getirin ve yukarı veya aşağı kaydırın. `Shift` tuşunu basılı tutarken tıklayıp sürükleyerek bir aralık da seçilebilir. Yatay olarak kaydırarak (desteklenen cihazlarda) veya zaman çizelgesinde tıklayıp sürükleyerek sola ve sağa hareket edin. Canlı bağlandığında sola kaydırmak mevcut zamandan kilidi kaldırır ve en sağa kadar kaydırmak tekrar mevcut zamana kilitler. Robotun etkin olduğu periyoda yakınlaştırmak için `Ctrl+\` tuşlarına basın.

<img src="/img/tab-reference/timeline.png" alt="Timeline" />

</details>

## Mekanizmalar ekleme

Başlamak için bir `Mechanism2d` nesnesini kontrol paneline sürükleyin. X düğmesini kullanarak bir mekanizmayı silin veya göz simgesine tıklayarak ya da alan adına çift tıklayarak geçici olarak gizleyin. Tüm mekanizmaları kaldırmak için eksen başlığının yanındaki çöp kutusuna ve ardından `Tümünü Temizle` seçeneğine tıklayın. Mekanizmalar listede tıklanıp sürüklenerek yeniden düzenlenebilir.

## Veri yayınlama

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

WPILib kullanarak mekanizma verilerini yayınlamak için NetworkTables'a bir `Mechanism2d` nesnesi gönderin (aşağıda gösterilmiştir). Veri loglaması etkinleştirilmişse, mekanizmalar oluşturulan WPILOG dosyasına dayalı olarak da görüntülenebilir.

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);
SmartDashboard.putData("MyMechanism", mechanism);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

AdvantageKit kullanarak mekanizma verilerini yayınlamak için bir `Mechanism2d` nesnesini bir çıktı alanı olarak kaydedin (aşağıda gösterilmiştir). Bu çağrının yalnızca `Mechanism2d` nesnesinin mevcut durumunu kaydettiğini unutmayın, bu nedenle nesne güncellendikten sonra her döngü periyodunda çağrılmalıdır.

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);
Logger.recordOutput("MyMechanism", mechanism);
```

</TabItem>
</Tabs>
