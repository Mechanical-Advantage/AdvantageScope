---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 URCL (Бейресми REV-үйлесімді тіркеуші) {#unofficial-rev-compatible-logger}

:::info
2026 жылғы жаңалық ретінде REVLib құрамына Spark Max және Spark Flex құрылғыларының деректерін REV CAN журналына (`.revlog`) сақтауға арналған ресми журналдау шешімі қосылды. Толығырақ [осы жерден](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) қараңыз. Бұл файлдарды AdvantageScope ішінде тікелей ашуға болады, бірақ оларды басқа дереккөздермен дәл синхрондау мүмкін емес.

Жаңа жүйеге біртіндеп өтуді қамтамасыз ету және алдыңғы маусымдардағы мүмкіндіктерді сақтау үшін AdvantageScope қолданбасының _Бейресми_ REV-үйлесімді тіркеушісі (URCL) 2026 жылы да командаларға қолжетімді болады. 2027 жылдан бастап қолданылатын журналдау мүмкіндіктері туралы қосымша ақпарат кейінірек жарияланады.
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) — Spark Max және Spark Flex құрылғыларынан деректерді автоматты түрде жазатын, Java, C++ және Python тілдеріне арналған журналдау кітапханасы. Ол CTRE компаниясының [Tuner X график салу мүмкіндігіне](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) және [Phoenix 6 сигнал журналдаушысына](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) ұқсас, барлық құрылғыны тікелей графикке шығаруға және журналға жазуға мүмкіндік береді.

Баптаудан кейін барлық Spark Max және Spark Flex құрылғыларының мерзімді CAN кадрлары NetworkTables немесе DataLog жүйесіне жарияланады. NetworkTables пайдаланған кезде деректерді журнал файлына жазу үшін WPILib кітапханасының [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) модулін қолдануға болады. Бұл кадрларды AdvantageScope бағдарламасында қарауға болады ([Журнал файлдарын басқару](/overview/log-files) және [Тікелей дереккөздерге қосылу](/overview/live-sources) бөлімдерін қараңыз).

- **Барлық сигналдар** автоматты түрде жазылады; **жаңа құрылғыларды қолмен баптаудың қажеті жоқ**.
- Күй кадрының кезеңі робот циклінен жылдам болса да, **әрбір кадр жазылады**.
- Кадрлар **CAN RX уақытына негізделген уақыт белгілерімен** жазылады, бұл пайдаланушы кодындағы дәстүрлі журналдаумен салыстырғанда [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) арқылы үдеуді неғұрлым дәл сипаттауға мүмкіндік береді (төмендегі «SysId пайдалану» бөлімін қараңыз).
- Журналдау **жоғары тиімділікпен** жұмыс істейді: операциялар бөлек ағында орындалады және құрылғылар саны көп болғанның өзінде 20 мс мерзімді циклде 80 мкс-тан аз уақыт алады.
- **REVLib кітапханасының барлық функциясы бұрынғыдай жұмыс істей береді.**

:::info
Бұл кітапхана ресми REV құралы болмағандықтан, қолдау сұрауларын REV қолдау қызметіне емес, URCL [мәселелер бетіне](https://github.com/Mechanical-Advantage/URCL/issues) немесе software@team6328.org мекенжайына жіберу керек.
:::

## Баптау {#setup}

VSCode ішіндегі тәуелділіктер менеджері арқылы [үшінші тарап кітапханаларын](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html) орнату нұсқаулығына сүйеніп, URCL vendordep кітапханасын орнатыңыз. Немесе келесі vendor JSON URL мекенжайын пайдалануға болады:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL әдепкі бойынша NetworkTables жүйесіне жариялайды, мұнда WPILib кітапханасының DataLogManager модулін қосу арқылы деректерді журнал файлына сақтауға болады. Немесе URCL тікелей DataLog жүйесіне де жаза алады. Журналдаушы төменде көрсетілгендей `robotInit` ішінде іске қосылуы керек.

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
URCL кітапханасының AdvantageKit жүйесімен үйлесімділігі тек ыңғайлылық үшін берілген; журналға жазылған деректер қайта ойнатуда (replay) ҚОЛЖЕТІМСІЗ. **Қайта ойнатуды қолдау үшін REV мотор контроллерлері әлі де кірістері анықталған IO іске асыруының бөлігі болуы тиіс**.
:::

</TabItem>
</Tabs>

Журналдағы құрылғыларды оңайырақ ажырату үшін `start()` немесе `startExternal()` әдісіне map нысанын беру арқылы CAN ID идентификаторларына лақап аттар тағайындауға болады. Кілттер — CAN ID мәндері, ал мәндер — журналда қолданылатын атау жолдары. Лақап ат тағайындалмаған құрылғылар әдепкі атауларымен жазылады.

:::warning
CAN жүктемесін барынша азайту үшін Spark құрылғыларына арналған күй кадрларының көбі тиісті геттер (getter) әдісі шақырылғанға дейін **әдепкі бойынша өшірілген**. Осы өшірілген күй кадрларына кіретін кез келген деректер URCL журналында қолжетімді болмайды.

Қосымша мәліметтер алу үшін [REVLib құжаттамасын](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods) қараңыз. Журнал файлына қосқыңыз келетін сигналдарды қолмен қосу үшін Spark құрылғысын баптау кезінде [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) пайдалануды ұсынамыз.
:::

## SysId пайдалану {#sysid-usage}

1. Жоғарыда көрсетілгендей URCL баптағаннан кейін, механизм журналын тұтынушы ретінде `null` мәнін беріп, SysId процедурасын конфигурациялаңыз. Төменде Java үшін мысал көрсетілген. Бұл конфигурацияны ішкі жүйе (subsystem) класының ішінде жасауға болады.

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

// Төмендегі әдістер Command нысандарын қайтарады
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

// Төмендегі әдістер Command нысандарын қайтарады
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. Роботта SysId процедурасын орындаңыз. SysId командаларын авто процедуралар ретінде баптауға немесе түйме триггеріне байлауға болады.

3. Журнал файлын жүктеп алып, оны AdvantageScope бағдарламасында ашыңыз. Мәзір жолағында `Файл` > `Деректерді экспорттау...` тармағына өтіңіз. Пішімді «WPILOG» күйіне, ал өрістер жиынтығын «Генерацияланғандарды қосу» күйіне орнатыңыз. Сақтау белгішесін басып, журналды сақтайтын орынды таңдаңыз.

:::warning
Роботтан алынған журнал файлы _SysId талдағышында ашылмас бұрын_ AdvantageScope арқылы ашылып, экспортталуы тиіс. Бұл URCL жазған CAN деректерін SysId жүйесімен үйлесімді пішімге түрлендіру үшін қажет.
:::

4. VSCode командалар палитрасынан «WPILib: Start Tool» пәрменін іздеп, «SysId» тармағын таңдау арқылы SysId талдағышын ашыңыз (немесе Windows жүйесінде жұмыс үстеліндегі іске қосу құралын пайдаланыңыз). «Open data log file...» түймесін басып, экспортталған журнал файлын ашыңыз.

5. Әдепкі энкодерді пайдаланып талдауды орындау үшін төмендегі өрістерді таңдаңыз. Қосымша энкодерлерден (баламалы, сыртқы, аналогтық, абсолюттік және т.б.) алынған позиция мен жылдамдық деректерін де пайдалануға болады.

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
SysId есептейтін коэффициенттер Spark Max/Flex құрылғысы беретіндей етіп бапталған өлшем бірліктерін пайдаланады ([`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) және [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>) арқылы). Әдепкі бойынша, бұл — редуктор ескерілмеген айналымдар мен айн/мин (RPM). Егер деректерді жазу кезінде пайдаланылған өлшем бірліктері қажетті бірліктерге сәйкес келмесе, талдау барысында SysId ішінде масштабтауды реттеуге болады.
:::
