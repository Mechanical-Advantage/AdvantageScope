---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 URCL (Onofficiële REV-compatibele logger) {#unofficial-rev-compatible-logger}

:::info
Nieuw in 2026: REVLib heeft nu een eigen officiële logger waarmee je data van de Spark Max en Spark Flex opslaat in een REV CAN-logbestand (`.revlog`). Meer informatie vind je [hier](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger). Je kunt deze bestanden direct openen in AdvantageScope, maar je kunt ze niet nauwkeurig synchroniseren met andere databronnen.

De _onofficiële_ REV-compatibele logger (URCL) van AdvantageScope blijft in 2026 gewoon beschikbaar voor een soepele overgang en om dezelfde functies te blijven bieden als in eerdere seizoenen. Later delen we meer informatie over de loggingopties voor 2027 en verder.
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) is een loggingbibliotheek voor Java, C++ en Python die automatisch data van de Spark Max en Spark Flex vastlegt. Zo kun je alle apparaten live plotten en loggen, vergelijkbaar met de [plotfunctie van Tuner X](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) en de [Phoenix 6-signaallogger](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) van CTRE.

Na het instellen stuurt URCL automatisch de periodieke CAN-frames van alle Spark Max- en Spark Flex-apparaten door naar NetworkTables of DataLog. Gebruik je NetworkTables, dan kun je de data met WPILib's [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) opslaan in een logbestand. Die frames bekijk je daarna in AdvantageScope (zie [Logbestanden beheren](/overview/log-files) en [Verbinden met live-bronnen](/overview/live-sources)).

- **Alle signalen** worden automatisch vastgelegd, **zonder dat je nieuwe apparaten apart hoeft in te stellen**.
- **Elk frame wordt opgeslagen**, zelfs als de statusframes sneller binnenkomen dan de loop-cyclus van de robot.
- Frames krijgen een **tijdstempel op basis van de CAN RX-tijd**, wat een veel nauwkeurigere versnellingskarakterisering in [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) oplevert dan gewoon loggen in gebruikerscode (zie "SysId gebruiken" hieronder).
- Loggen is **erg efficiënt**: het draait in een aparte thread en kost minder dan 80 µs per cyclus van 20 ms, zelfs met veel apparaten.
- **Alle functies van REVLib blijven gewoon werken.**

:::info
Omdat dit geen officiële tool van REV is, kun je vragen of problemen het beste melden op de [issues-pagina van URCL](https://github.com/Mechanical-Advantage/URCL/issues) of mailen naar software@team6328.org in plaats van contact op te nemen met REV.
:::

## Installatie {#setup}

Installeer de URCL-vendordep in VSCode volgens de instructies voor [externe bibliotheken](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html), of gebruik direct deze vendor-JSON-URL:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

Standaard stuurt URCL data naar NetworkTables, waarna je het met WPILib's DataLogManager in een logbestand kunt opslaan. Je kunt URCL ook rechtstreeks naar een DataLog laten schrijven. Start de logger in `robotInit`, zoals hieronder:

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // Als je naar NetworkTables én DataLog wilt publiceren
  DataLogManager.start();
  URCL.start();

  // Als je alleen naar DataLog wilt loggen
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // Als je naar NetworkTables én DataLog wilt publiceren
  frc::DataLogManager::Start();
  URCL::Start();

  // Als je alleen naar DataLog wilt loggen
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
        # Als je naar NetworkTables én DataLog wilt publiceren
        wpilib.DataLogManager.start()
        urcl.start()

        # Als je alleen naar DataLog wilt loggen
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
URCL-compatibiliteit met AdvantageKit is er puur voor het gemak; de gelogde data is NIET beschikbaar tijdens replay. **REV-motorcontrollers moeten nog steeds in een IO-implementatie met gedefinieerde inputs zitten als je replay wilt gebruiken.**
:::

</TabItem>
</Tabs>

Om apparaten makkelijker te herkennen in het logbestand, kun je aliassen koppelen aan CAN-ID's door een map-object mee te geven aan `start()` of `startExternal()`. De keys zijn de CAN-ID's en de values zijn de namen (strings) die je in het logbestand wilt zien. Apparaten zonder alias krijgen gewoon hun standaardnaam.

:::warning
Om de CAN-bus niet te overbelasten staan de meeste statusframes van Spark-apparaten **standaard uit** totdat je de bijbehorende getter-methode aanroept. Data uit uitgeschakelde statusframes komt niet in het URCL-logbestand terecht.

Bekijk de [REVLib-documentatie](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods) voor meer uitleg. We raden aan om bij het configureren van je Spark [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) te gebruiken om handmatig alle signalen aan te zetten die je wilt loggen.
:::

## SysId gebruiken {#sysid-usage}

1. Nadat je URCL hebt ingesteld zoals hierboven beschreven, maak je de SysId-routine aan met `null` als logconsument (_log consumer_) voor het mechanisme. Hieronder zie je een voorbeeld in Java, dat je bijvoorbeeld in je subsystem-klasse kunt zetten.

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// Maak de SysId-routine aan
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // Geen logconsument, omdat URCL de data al vastlegt
    subsystem
  )
);

// De methoden hieronder geven Command-objecten terug
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
// Maak de SysId-routine aan
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(
    null, null, null,
    (state) -> Logger.recordOutput("SysIdTestState", state.toString())
  ),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // Geen logconsument, omdat URCL de data al vastlegt
    subsystem
  )
);

// De methoden hieronder geven Command-objecten terug
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. Voer de SysId-routine uit op de robot. Je kunt de SysId-commando's als autonome routines instellen of aan een knop koppelen.

3. Download het logbestand en open het in AdvantageScope. Ga in de menubalk naar `Bestand` > `Data exporteren...`. Zet het formaat op "WPILOG" en de veldset op "Gegenereerde opnemen". Klik op het opslagicoon en kies waar je het bestand wilt opslaan.

:::warning
Open en exporteer het logbestand eerst via AdvantageScope _voordat je het opent in de SysId-analyzer_. Anders worden de CAN-gegevens van URCL niet omgezet naar een formaat dat SysId kan lezen.
:::

4. Open de SysId-analyzer door in het opdrachtpalet van VSCode te zoeken naar "WPILib: Start Tool" en "SysId" te kiezen (of via het bureaubladpictogram op Windows). Open je geëxporteerde logbestand via "Open data log file...".

5. Kies de volgende velden om de analyse met de standaardencoder uit te voeren. Je kunt ook positie- en snelheidsdata van een secundaire encoder gebruiken (alternate, external, analog, absolute, enzovoort).

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
De gains die SysId berekent gebruiken dezelfde eenheden als de Spark Max/Flex rapporteert (ingesteld met [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) en [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>)). Standaard zijn dat rotaties en RPM zonder overbrenging. Komen de gelogde eenheden niet overeen met wat je wilt, dan kun je de schaal tijdens de analyse in SysId aanpassen.
:::
