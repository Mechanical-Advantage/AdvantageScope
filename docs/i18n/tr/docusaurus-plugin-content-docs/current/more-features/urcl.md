---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 Gayriresmi REV uyumlu loglayıcı (URCL) {#unofficial-rev-compatible-logger}

:::info
REVLib, 2026 itibarıyla Spark Max ve Spark Flex'ten gelen verileri bir REV CAN loguna (`.revlog`) kaydetmek için resmi bir loglama çözümü sunar. Detaylar için [buraya](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) bakabilirsiniz. Bu dosyaları doğrudan AdvantageScope'ta açabilirsiniz ancak diğer veri kaynaklarıyla tam olarak senkronize edemezsiniz.

AdvantageScope'un _Gayriresmi_ REV Uyumlu Loglayıcısı (URCL), sorunsuz bir geçiş sağlamak ve önceki sezonlardaki tüm özellikleri korumak için 2026'da da takımların kullanımına açık kalacak. 2027 ve sonrasındaki loglama seçenekleriyle ilgili detayları ilerleyen tarihlerde paylaşacağız.
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger / Gayriresmi REV Uyumlu Loglayıcı), Spark Max ve Spark Flex cihazlarından gelen verileri otomatik olarak kaydeden, Java, C++ ve Python için geliştirilmiş bir loglama kütüphanesidir. CTRE'nin [Tuner X grafik çizme özelliğine](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) ve [Phoenix 6 sinyal loglayıcısına](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) benzer şekilde tüm cihazların canlı grafiğe dökülmesini ve loglanmasını sağlar.

Kurulumdan sonra tüm Spark Max ve Spark Flex cihazlarından gelen periyodik CAN kareleri NetworkTables'a veya DataLog'a aktarılır. NetworkTables kullanıyorsanız verileri bir log dosyasına kaydetmek için WPILib'in [DataLogManager](https://docs.wpilib.org/tr/stable/docs/software/telemetry/datalog.html) aracından yararlanabilirsiniz. Bu kareleri AdvantageScope'ta görüntüleyebilirsiniz (detaylar için [Log dosyalarını yönetme](/overview/log-files/index.md) ve [Canlı kaynaklara bağlanma](/overview/live-sources/index.md) sayfalarına bakın).

- **Tüm sinyaller** otomatik olarak yakalanır, **yeni cihazlar için manuel kurulum gerekmez**.
- Durum karesi periyodu robot döngü periyodundan daha hızlı olsa bile **her kare yakalanır**.
- Kareler, kullanıcı kodundaki geleneksel loglamaya kıyasla [SysId](https://docs.wpilib.org/tr/stable/docs/software/pathplanning/system-identification/introduction.html) ile daha doğru ivme karakterizasyonu sağlayacak şekilde **CAN RX zamanına dayalı zaman damgalarıyla** loglanır (aşağıdaki “SysId kullanımı” bölümüne bakın).
- Loglama **son derece verimlidir**; işlemler ayrı bir iş parçacığında yürütülür ve çok sayıda cihaz loglanırken bile 20 ms'lik periyodik döngüde 80 µs'nin altında süre harcar.
- **REVLib'in hiçbir işlevi bundan etkilenmez.**

:::info
Bu kütüphane resmi bir REV aracı olmadığından, destek sorularınızı REV'in destek ekibi yerine URCL [sorunlar sayfasına](https://github.com/Mechanical-Advantage/URCL/issues) veya software@team6328.org adresine iletmelisiniz.
:::

## Kurulum {#setup}

VSCode'daki bağımlılık yöneticisini kullanarak [üçüncü taraf kütüphaneleri](https://docs.wpilib.org/tr/stable/docs/software/vscode-overview/3rd-party-libraries.html) kurma adımlarını izleyerek URCL vendordep'ini projenize ekleyin. Alternatif olarak aşağıdaki vendordep JSON URL'sini de kullanabilirsiniz:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL varsayılan olarak verileri NetworkTables'a yayınlar; burada WPILib'in DataLogManager'ını etkinleştirerek verileri bir log dosyasına kaydedebilirsiniz. İsterseniz URCL'nin doğrudan bir DataLog'a kayıt yapmasını da sağlayabilirsiniz. Loglayıcıyı aşağıda gösterildiği gibi `robotInit` içinde başlatın.

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // NetworkTables ve DataLog'a yayın yapılıyorsa
  DataLogManager.start();
  URCL.start();

  // Yalnızca DataLog'a loglama yapılıyorsa
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // NetworkTables ve DataLog'a yayın yapılıyorsa
  frc::DataLogManager::Start();
  URCL::Start();

  // Yalnızca DataLog'a loglama yapılıyorsa
  URCL::Start(frc::DataLogManager::GetLog());
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import urcl
import wpilib

class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # NetworkTables ve DataLog'a yayın yapılıyorsa
        wpilib.DataLogManager.start()
        urcl.start()

        # Yalnızca DataLog'a loglama yapılıyorsa
        urcl.start(wpilib.DataLogManager.getLog())
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
public Robot() {
  // ...
  Logger.registerURCL(URCL.startExternal());
  Logger.start();
}
```

:::warning
URCL'nin AdvantageKit ile uyumluluğu yalnızca kolaylık sağlamak içindir; loga kaydedilen veriler yeniden oynatmada (replay) KULLANILAMAZ. **REV motor kontrolcüleri, yeniden oynatmayı desteklemek için hâlâ tanımlı girdilere sahip bir IO sınıfının parçası olmalıdır.**
:::

</TabItem>
</Tabs>

Logdaki cihazları daha kolay tanımak için, `start()` veya `startExternal()` metoduna bir map nesnesi vererek CAN ID'lerine takma adlar atayabilirsiniz. Anahtarlar CAN ID'leri, değerler ise logda kullanılacak isimleri içeren metinlerdir. Takma ad atanmayan cihazlar varsayılan isimleriyle loglanır.

:::warning
CAN kullanımını en aza indirmek için Spark cihazlarındaki çoğu durum karesi, ilgili bir getter metodu çağrılana kadar **varsayılan olarak devre dışıdır**. Devre dışı bırakılmış bu durum karelerindeki veriler URCL loguna kaydedilmez.

Daha fazla detay için [REVLib dokümantasyonuna](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods) göz atın. Spark'ı yapılandırırken log dosyasına eklemek istediğiniz sinyalleri manuel olarak etkinleştirmek için [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) kullanmanızı öneririz.
:::

## SysId kullanımı {#sysid-usage}

1. URCL'yi yukarıda gösterildiği gibi kurduktan sonra, mekanizma log alıcısı (log consumer) için `null` vererek SysId rutinini yapılandırın. Aşağıda Java için bir örnek verilmiştir. Bu yapılandırmayı alt sistem sınıfı içinde yapabilirsiniz.

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// SysId rutinini oluştur
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // Veriler URCL ile kaydedildiği için log alıcısı (log consumer) yok
    subsystem
  )
);

// Aşağıdaki metotlar Command nesneleri döndürür
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
// SysId rutinini oluştur
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(
    null, null, null,
    (state) -> Logger.recordOutput("SysIdTestState", state.toString())
  ),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // Veriler URCL ile kaydedildiği için log alıcısı (log consumer) yok
    subsystem
  )
);

// Aşağıdaki metotlar Command nesneleri döndürür
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. SysId rutinini robot üzerinde çalıştırın. SysId komutlarını otonom rutin olarak ayarlayabilir veya bir düğme tetikleyicisine bağlayabilirsiniz.

3. Log dosyasını indirin ve AdvantageScope'ta açın. Menü çubuğunda `Dosya` > `Verileri dışa aktar...` yolunu izleyin. Formatı “WPILOG”, alan kümesini ise “Oluşturulanları dahil et” olarak seçin. Kaydet simgesine tıklayıp logu kaydedeceğiniz konumu seçin.

:::warning
Robottan aldığınız log dosyasını, _SysId analizöründe açmadan önce_ AdvantageScope ile açıp dışa aktarmalısınız. Bu adım, URCL'nin kaydettiği CAN verilerini SysId ile uyumlu bir formata dönüştürmek için gereklidir.
:::

4. VSCode komut paletinde “WPILib: Start Tool” ifadesini aratıp “SysId”yi seçerek (veya Windows'ta masaüstü başlatıcısını kullanarak) SysId analizörünü açın. “Open data log file...” düğmesine tıklayarak dışa aktardığınız log dosyasını seçin.

5. Varsayılan enkoderi kullanarak analizi çalıştırmak için aşağıdaki alanları seçin. İkincil enkoderlerden gelen konum ve hız verileri de kullanılabilir (alternatif, harici, analog, mutlak vb.).

   - Position = `NT:/URCL/<Device>/MotorPositionRotations`
   - Velocity = `NT:/URCL/<Device>/MotorVelocityRPM`
   - Voltage = `NT:/URCL/<Device>/AppliedOutputVoltage`

:::tip
SysId'nin ürettiği kazanç değerleri, Spark Max/Flex'in raporlamak üzere ayarlandığı birimleri kullanır ([`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) ve [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>) metotlarıyla). Varsayılan olarak bunlar herhangi bir dişli oranı uygulanmamış tur ve RPM değerleridir. Veriler kaydedilirken kullanılan birimler istediğiniz birimlerle eşleşmiyorsa, analiz sırasında SysId içinden ölçeklendirme ayarı yapabilirsiniz.
:::
