---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 URCL (Бейресми REV-үйлесімді тіркеуші)

:::info
2026 жылдың жаңалығы ретінде, REVLib құрамына Spark Max және Spark Flex құрылғыларынан деректерді REV CAN журналына (`.revlog`) сақтауға арналған ресми журналдау шешімі кіреді. Толығырақ [осы жерден](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) қараңыз. Бұл файлдарды AdvantageScope ішінде тікелей ашуға болады, бірақ басқа дереккөздермен дәл синхрондау мүмкін емес.

AdvantageScope бағдарламасының _Бейресми_ REV-үйлесімді тіркеушісі (URCL) біркелкі өтуді қамтамасыз ету және өткен маусымдармен мүмкіндіктер паритетін қамтамасыз ету үшін 2026 жылы да командаларға қолжетімді болып қала береді. Біз 2027 жылдан бастап журналдау опциялары туралы қосымша мәліметтермен кейінірек бөлісетін боламыз.
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) — бұл Spark Max және Spark Flex құрылғыларынан деректерді автоматты түрде жазатын Java, C++ және Python үшін қолжетімді журналдау кітапханасы. Бұл CTRE компаниясының [Tuner X график салу мүмкіндігіне](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) және [Phoenix 6 сигнал журналдаушысына](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) ұқсас барлық құрылғыларды тікелей графикке салуды және журналдауды қамтамасыз етеді.

Баптаудан кейін барлық Spark Max және Spark Flex құрылғыларынан мерзімді CAN кадрлары NetworkTables немесе DataLog жүйесіне жарияланады. NetworkTables пайдаланған кезде деректерді журнал файласына түсіру үшін WPILib кітапханасының [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) модулін пайдалануға болады. Бұл кадрларды AdvantageScope бағдарламасында қарауға болады ([Журнал файлдарын басқару](/overview/log-files) және [Тікелей дереккөздерге қосылу](/overview/live-sources) бөлімдерін қараңыз).

- **Барлық сигналдар** автоматты түрде түсіріледі, **жаңа құрылғылар үшін қолмен баптау талап етілмейді**.
- Статус кадрының кезеңі робот циклінен жылдам болса да, **әрбір кадр түсіріледі**.
- Кадрлар **CAN RX уақытына негізделген уақыт белгілерімен** журналданады, бұл пайдаланушы кодындағы дәстүрлі журналдаумен салыстырғанда [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) арқылы үдеуді неғұрлым дәл сипаттауға мүмкіндік береді (төмендегі «SysId пайдалану» бөлімін қараңыз).
- Журналдау **жоғары тиімділікке ие**; операциялар ағындарға бөлінген және тіпті көптеген құрылғыларды журналдау кезінде де 20 мс мерзімді циклде 80 мкс-тан аз уақыт ішінде орындалады.
- **REVLib кітапханасының барлық функциялары әсерсіз қалады.**

:::info
Бұл кітапхана ресми REV құралы болмағандықтан, қолдау сұрауларын REV қолдау қызметіне емес, URCL [мәселелер бетіне](https://github.com/Mechanical-Advantage/URCL/issues) немесе software@team6328.org мекенжайына жіберу керек.
:::

## Баптау

VSCode ішіндегі тәуелділіктер менеджерін пайдаланып [үшінші тарап кітапханаларын](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html) орнату нұсқауларын орындай отырып, URCL vendordep кітапханасын орнатыңыз. Балама ретінде келесі vendor JSON URL мекенжайын пайдалануға болады:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL әдепкі бойынша NetworkTables жүйесіне жариялайды, мұнда WPILib кітапханасының DataLogManager модулін қосу арқылы деректерді журнал файласына сақтауға болады. Балама ретінде URCL тікелей DataLog жүйесіне журналдай алады. Журналдаушы төменде көрсетілгендей `robotInit` ішінде іске қосылуы керек.

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // NetworkTables жүйесіне және DataLog жүйесіне жариялау кезінде
  DataLogManager.start();
  URCL.start();

  // Тек DataLog жүйесіне журналдау кезінде
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // NetworkTables жүйесіне және DataLog жүйесіне жариялау кезінде
  frc::DataLogManager::Start();
  URCL::Start();

  // Тек DataLog жүйесіне журналдау кезінде
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
        # NetworkTables жүйесіне және DataLog жүйесіне жариялау кезінде
        wpilib.DataLogManager.start()
        urcl.start()

        # Тек DataLog жүйесіне журналдау кезінде
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
AdvantageKit жүйесімен URCL үйлесімділігі тек ыңғайлылық үшін қамтамасыз етілген; журналға жазылған деректер қайталауда (replay) ҚОЛДАНЫЛМАЙДЫ. **Қайталауды қолдау үшін REV мотор контроллерлері әлі де анықталған енгізулері бар IO іске асырылуының бөлігі болуы керек**.
:::

</TabItem>
</Tabs>

Журналдағы құрылғыларды оңайырақ сәйкестендіру үшін `start()` немесе `startExternal()` әдісіне map объектісін беру арқылы CAN ID идентификаторларына лақап аттар тағайындауға болады. Кілттер CAN ID, ал мәндер — журналда пайдаланылатын атауларға арналған жолдар. Лақап ат тағайындалмаған кез келген құрылғылар өздерінің әдепкі атауларын пайдаланып журналданады.

:::warning
CAN пайдалануды барынша азайту үшін Spark құрылғыларына арналған статус кадрларының көбі байланысты геттер (getter) әдісі шақырылғанға дейін **әдепкі бойынша өшірілген**. Бұл өшірілген статус кадрларына кіретін кез келген деректер URCL журналында қолжетімді болмайды.

Қосымша мәліметтер алу үшін [REVLib құжаттамасын](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods) тексеріңіз. Журнал файлына қосуды қалайтын кез келген сигналдарды қолмен қосу үшін Spark құрылғысын конфигурациялау кезінде [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) пайдалануды ұсынамыз.
:::

## SysId пайдалану

1. Жоғарыда көрсетілгендей URCL баптағаннан кейін, механизм журналын тұтынушы үшін `null` пайдаланып SysId процедурасын конфигурациялаңыз. Төменде Java үшін мысал көрсетілген. Бұл конфигурацияны ішкі жүйе (subsystem) класы ішінде орындауға болады.

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// SysId процедурасын жасау
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // Журнал тұтынушысы жоқ, себебі деректерді URCL жазады
    subsystem
  )
);

// Төмендегі әдістер Command объектілерін қайтарады
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
// SysId процедурасын жасау
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(
    null, null, null,
    (state) -> Logger.recordOutput("SysIdTestState", state.toString())
  ),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // Журнал тұтынушысы жоқ, себебі деректерді URCL жазады
    subsystem
  )
);

// Төмендегі әдістер Command объектілерін қайтарады
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. Роботта SysId процедурасын орындаңыз. SysId командаларын авто процедуралар ретінде конфигурациялауға немесе түйме триггеріне қосуға болады.

3. Журнал файлын жүктеп алып, оны AdvantageScope бағдарламасында ашыңыз. Мәзір жолағында «Файл» > «Деректерді экспорттау...» тармағына өтіңіз. Пішімді «WPILOG» күйіне, ал өрістер жиынтығын «Генерацияланғандарды қосу» күйіне орнатыңыз. Сақтау белгішесін басып, журналды сақтау орнын таңдаңыз.

:::warning
Роботтан алынған журнал файлы _SysId талдағышын пайдаланып ашпас бұрын_ AdvantageScope арқылы ашылуы және экспортталуы керек. Бұл URCL жазған CAN деректерін SysId жүйесімен үйлесімді пішімге түрлендіру үшін қажет.
:::

4. VSCode командалар палитрасынан «WPILib: Start Tool» іздеп, «SysId» таңдау арқылы SysId талдағышын ашыңыз (немесе Windows жүйесінде жұмыс үстелінің іске қосу құралын пайдаланыңыз). «Open data log file...» басып, экспортталған журнал файлын ашыңыз.

5. Әдепкі энкодерді пайдаланып талдауды орындау үшін төмендегі өрістерді таңдаңыз. Қосымша энкодерлерден (баламалы, сыртқы, аналогтық, абсолюттік т.б.) позиция мен жылдамдық деректерін де пайдалануға болады.

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
SysId өндіретін коэффициенттер Spark Max/Flex беретіндей конфигурацияланған өлшем бірліктерін пайдаланады ([`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) және [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>) пайдаланып). Әдепкі бойынша, бұл редуктор қолданылмаған айналымдар мен айн/мин (RPM). Деректерді жазу кезінде пайдаланылған өлшем бірліктері қажетті өлшем бірліктеріне сәйкес келмесе, талдау кезінде SysId ішінде масштабтауды реттеуге болады.
:::
