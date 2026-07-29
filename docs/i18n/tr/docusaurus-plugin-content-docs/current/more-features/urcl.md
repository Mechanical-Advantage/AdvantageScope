---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 Gayriresmi REV-Uyumlu Loglayıcı (URCL)

:::info
2026'da yeni bir özellik olarak REVLib, Spark Max ve Spark Flex'ten gelen verileri bir REV CAN loguna (`.revlog`) kaydetmek için resmi bir loglama çözümü içerir. Ayrıntılar için [buraya](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) bakın. Bu dosyalar doğrudan AdvantageScope'ta açılabilir, ancak diğer veri kaynaklarıyla tam olarak senkronize edilemez.

AdvantageScope'un _Gayriresmi_ REV-Uyumlu Loglayıcısı (URCL), sorunsuz bir geçiş sağlamak ve önceki sezonlarla özellik eşitliğini korumak için 2026'da da takımların kullanımına sunulmaya devam edecektir. 2027 ve sonrasındaki loglama seçenekleri hakkında paylaşacak daha fazla ayrıntıya daha sonra sahip olacağız.
:::

URCL (**G**ayriresmi **R**EV-**U**yumlu **L**oglayıcı / **U**nofficial **R**EV-**C**ompatible **L**ogger), Spark Max ve Spark Flex cihazlarından gelen verileri otomatik olarak kaydeden Java, C++ ve Python için mevcut bir loglama kütüphanesidir. Bu, CTRE'nin [Tuner X grafik çizme mevcudiyetine](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) ve [Phoenix 6 sinyal loglayıcısına](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) benzer şekilde tüm cihazların canlı grafiklenmesini ve loglanmasını sağlar.

Kurulumdan sonra tüm Spark Max ve Spark Flex cihazlarından gelen periyodik CAN kareleri NetworkTables veya DataLog'a yayınlanır. NetworkTables kullanılırken verileri bir log dosyasına kaydetmek için WPILib'in [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) aracı kullanılabilir. Bu kareler AdvantageScope'ta görüntülenebilir ([Log Dosyalarını Yönetme](/overview/log-files/index.md) ve [Canlı Kaynaklara Bağlanma](/overview/live-sources/index.md) bölümlerine bakın).

- **Tüm sinyaller** otomatik olarak yakalanır, **yeni cihazlar için manuel kurulum gerekmez**.
- Durum karesi periyodu robot döngü periyodundan daha hızlı olsa bile **her kare yakalanır**.
- Kareler, kullanıcı kodundaki geleneksel loglamaya kıyasla [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) ile daha doğru ivme karakterizasyonu sağlayacak şekilde **CAN RX zamanına dayalı zaman damgalarıyla** loglanır (aşağıdaki "SysId Kullanımı" bölümüne bakın).
- Loglama **son derece verimlidir**; işlemler iş parçacıklı olarak çalışır ve çok sayıda cihaz loglanırken bile 20 ms'lik periyodik döngü başına 80µs'nin altında çalışır.
- **REVLib'in tüm işlevleri etkilenmez.**

:::info
Bu kütüphane resmi bir REV aracı olmadığından, destek soruları REV'in destek kişisi yerine URCL [sorunlar sayfasına](https://github.com/Mechanical-Advantage/URCL/issues) veya software@team6328.org adresine yönlendirilmelidir.
:::

## Kurulum

VSCode'daki bağımlılık yöneticisini kullanarak [üçüncü taraf kütüphaneleri](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html) kurma talimatlarını izleyerek URCL vendordep'ini kurun. Alternatif olarak aşağıdaki satıcı JSON URL'sini kullanabilirsiniz:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL varsayılan olarak verilerin WPILib'in DataLogManager'ı etkinleştirilerek bir log dosyasına kaydedilebileceği NetworkTables'a yayın yapar. Alternatif olarak URCL doğrudan bir DataLog'a loglama yapabilir. Loglayıcı aşağıda gösterildiği gibi `robotInit` içinde başlatılmalıdır.

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
URCL'nin AdvantageKit ile uyumluluğu yalnızca kolaylık sağlamak amacıyla sunulmuştur; loga kaydedilen veriler yeniden oynatmada MEVCUT DEĞİLDİR. **REV motor kontrolcülerinin yeniden oynatmayı desteklemek için tanımlanmış girdilere sahip bir G/Ç uygulamasının parçası olmaya devam etmesi gerekir**.
:::

</TabItem>
</Tabs>

Logdaki cihazları daha kolay tanımlamak için, `start()` veya `startExternal()` yöntemine bir harita nesnesi geçirilerek CAN ID'lerine takma adlar atanabilir. Anahtarlar CAN ID'leridir ve değerler logda kullanılacak isimler için metinlerdir. Takma ad atanmayan tüm cihazlar varsayılan isimleri kullanılarak loglanacaktır.

:::warning
CAN kullanımını en aza indirmek için Spark cihazları için çoğu durum karesi ilgili bir getter yöntemi çağrılana kadar **varsayılan olarak devre dışı bırakılır**. Bu devre dışı bırakılmış durum karelerinde yer alan veriler URCL logunda mevcut olmayacaktır.

Daha fazla ayrıntı için [REVLib dokümantasyonunu](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods) kontrol edin. Spark'ı yapılandırırken log dosyasına dahil etmek istediğiniz sinyalleri manuel olarak etkinleştirmek için [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) kullanılmasını öneririz.
:::

## SysId Kullanımı

1. URCL'yi yukarıda gösterildiği gibi kurduktan sonra mekanizma log tüketicisi için `null` kullanarak SysId rutinini yapılandırın. Java için örnek bir gösterim aşağıdadır. Bu yapılandırma alt sistem sınıfı içinde gerçekleştirilebilir.

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// SysId rutinini oluştur
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // URCL tarafından veri kaydedildiği için log tüketicisi yok
    subsystem
  )
);

// Aşağıdaki yöntemler Command nesneleri döndürür
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
    null, // URCL tarafından veri kaydedildiği için log tüketicisi yok
    subsystem
  )
);

// Aşağıdaki yöntemler Command nesneleri döndürür
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. SysId rutinini robot üzerinde çalıştırın. SysId komutları otonom rutinler olarak yapılandırılabilir veya bir düğme tetikleyicisine bağlanabilir.

3. Log dosyasını indirin ve AdvantageScope'ta açın. Menü çubuğunda `Dosya` > `Verileri dışa aktar...` seçeneğine gidin. Formatı "WPILOG" ve alan kümesini "Oluşturulanları Dahil Et" olarak ayarlayın. Kaydet simgesine tıklayın ve logu kaydetmek için bir konum seçin.

:::warning
Robottan gelen log dosyası, _SysId analizörü kullanılarak açılmadan önce_ AdvantageScope tarafından açılmalı ve dışa aktarılmalıdır. Bu, URCL tarafından kaydedilen CAN verilerini SysId ile uyumlu bir formata dönüştürmek için gereklidir.
:::

4. VSCode komut paletinde "WPILib: Start Tool" ifadesini arayıp "SysId"yi seçerek (veya Windows'ta masaüstü başlatıcısını kullanarak) SysId analizörünü açın. "Open data log file..." seçeneğine tıklayarak dışa aktarılan log dosyasını açın.

5. Varsayılan enkoderi kullanarak analizi çalıştırmak için aşağıdaki alanları seçin. İkincil enkoderlerden gelen konum ve hız verileri de kullanılabilir (alternatif, harici, analog, mutlak vb.).

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
SysId tarafından üretilen kazançlar Spark Max/Flex'in bildirmek üzere yapılandırıldığı birimleri kullanacaktır ([`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) ve [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>) kullanarak). Varsayılan olarak bunlar herhangi bir dişli uygulanmamış tur ve RPM'dir. Veriler kaydedilirken kullanılan birimler istenen birimlerle eşleşmiyorsa ölçeklendirme analiz sırasında SysId içinde ayarlanabilir.
:::
