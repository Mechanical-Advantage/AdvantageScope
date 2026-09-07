---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 Onofficiële REV-compatibele logger {#unofficial-rev-compatible-logger}

:::info
Nieuw in 2026: REVLib bevat een officiële loggingoplossing voor het opslaan van data van de Spark Max en Spark Flex naar een REV CAN-logbestand (`.revlog`). Zie [hier](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) voor details. Deze bestanden kunnen rechtstreeks in AdvantageScope worden geopend, maar kunnen niet nauwkeurig worden gesynchroniseerd met andere databronnen.

De _onofficiële_ REV-compatibele logger (URCL) van AdvantageScope blijft in 2026 ook beschikbaar voor teams om een soepele overgang te garanderen en functiepariteit met voorgaande seizoenen te bieden. We zullen op een later moment meer details delen over loggingopties in 2027 en daarna.
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) is een loggingbibliotheek die beschikbaar is voor Java, C++ en Python en die automatisch data registreert van de Spark Max en Spark Flex. Dit maakt live plotten en loggen van alle apparaten mogelijk, vergelijkbaar met CTRE's [Tuner X-plotfunctie](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) en [Phoenix 6-signaallogger](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html).

Na de installatie worden periodieke CAN-frames van alle Spark Max- en Spark Flex-apparaten gepubliceerd naar NetworkTables of DataLog. Bij gebruik van NetworkTables kan WPILib's [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) worden gebruikt om de data vast te leggen in een logbestand. Deze frames kunnen worden bekeken in AdvantageScope (zie [Logbestanden beheren](/overview/log-files) en [Verbinden met live-bronnen](/overview/live-sources)).

- **Alle signalen** worden automatisch vastgelegd, **zonder handmatige installatie voor nieuwe apparaten**.
- **Elk frame wordt vastgelegd**, zelfs wanneer de periode van het statusframe sneller is dan de loop-cyclus van de robot.
- Frames worden gelogd met **tijdstempels gebaseerd op de CAN RX-tijd**, wat een nauwkeurigere versnellingskarakterisering met [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) mogelijk maakt in vergelijking met traditionele logging in gebruikerscode (zie "SysId-gebruik" hieronder).
- Logging is **zeer efficiënt**; bewerkingen zijn 'threaded' en duren minder dan 80 µs per periodieke cyclus van 20 ms, zelfs bij het loggen van een groot aantal apparaten.
- **Alle functies van REVLib blijven onaangetast.**

:::info
Aangezien deze bibliotheek geen officiële REV-tool is, moeten ondersteuningsvragen worden gericht aan de URCL [issues-pagina](https://github.com/Mechanical-Advantage/URCL/issues) of software@team6328.org in plaats van aan het ondersteuningscontact van REV.
:::

## Installatie {#setup}

Installeer de URCL-vendordep door de instructies te volgen voor het installeren van [externe bibliotheken](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html) met behulp van het afhankelijkheidsbeheer in VSCode. Als alternatief kun je de volgende vendor-JSON-URL gebruiken:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL publiceert standaard naar NetworkTables, waar data kan worden opgeslagen in een logbestand door WPILib's DataLogManager in te schakelen. Als alternatief kan URCL rechtstreeks naar een DataLog loggen. De logger moet worden gestart in `robotInit`, zoals hieronder weergegeven.

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // Bij publiceren naar NetworkTables en DataLog
  DataLogManager.start();
  URCL.start();

  // Bij alleen loggen naar DataLog
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // Bij publiceren naar NetworkTables en DataLog
  frc::DataLogManager::Start();
  URCL::Start();

  // Bij alleen loggen naar DataLog
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
        # Bij publiceren naar NetworkTables en DataLog
        wpilib.DataLogManager.start()
        urcl.start()

        # Bij alleen loggen naar DataLog
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
URCL-compatibiliteit met AdvantageKit wordt alleen voor het gemak geboden; de data die in het logbestand is vastgelegd, is NIET beschikbaar bij herhaling. **REV-motorcontrollers moeten nog steeds deel uitmaken van een IO-implementatie met gedefinieerde inputs om herhaling te ondersteunen**.
:::

</TabItem>
</Tabs>

Om apparaten gemakkelijker te identificeren in het logbestand, kunnen CAN-ID's worden toegewezen aan aliassen door een map-object door te geven aan de methode `start()` of `startExternal()`. De sleutels zijn CAN-ID's en de waarden zijn strings voor de namen die in het logbestand moeten worden gebruikt. Alle apparaten waaraan geen alias is toegewezen, worden gelogd met hun standaardnamen.

:::warning
Om het CAN-gebruik te minimaliseren, zijn de meeste statusframes voor Spark-apparaten **standaard uitgeschakeld** totdat een bijbehorende getter-methode wordt aangeroepen. Alle data in deze uitgeschakelde statusframes zal niet beschikbaar zijn in het URCL-logbestand.

Raadpleeg de [REVLib-documentatie](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods) voor meer details. We raden aan de [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) te gebruiken bij het configureren van de Spark om handmatig alle signalen in te schakelen die je in het logbestand wilt opnemen.
:::

## SysId-gebruik {#sysid-usage}

1. Na het instellen van URCL zoals hierboven getoond, configureer je de SysId-routine met `null` voor de mechanismelog-consument. Hieronder wordt een voorbeeld voor Java getoond. Deze configuratie kan worden uitgevoerd binnen de subsystem-klasse.

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// Maak de SysId-routine aan
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // Geen logconsument, aangezien data wordt vastgelegd door URCL
    subsystem
  )
);

// De onderstaande methoden retourneren Command-objecten
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
    null, // Geen logconsument, aangezien data wordt vastgelegd door URCL
    subsystem
  )
);

// De onderstaande methoden retourneren Command-objecten
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. Voer de SysId-routine uit op de robot. De SysId-commando's kunnen worden geconfigureerd als automatische routines of worden gekoppeld aan een knoptrigger.

3. Download het logbestand en open het in AdvantageScope. Ga in de menubalk naar `Bestand` > `Data exporteren...`. Stel het formaat in op "WPILOG" en de veldset op "Gegenereerde opnemen". Klik op het pictogram voor opslaan en kies een locatie om het logbestand op te slaan.

:::warning
Het logbestand van de robot moet worden geopend en geëxporteerd door AdvantageScope _voordat het wordt geopend met de SysId-analyzer_. Dit is vereist om de door URCL geregistreerde CAN-data te converteren naar een formaat dat compatibel is met SysId.
:::

4. Open de SysId-analyzer door te zoeken naar "WPILib: Start Tool" in het VSCode-opdrachtpalet en "SysId" te kiezen (of gebruik het opstartprogramma op het bureaublad in Windows). Open het geëxporteerde logbestand door op "Open data log file..." te klikken.

5. Kies de onderstaande velden om de analyse uit te voeren met de standaard encoder. Positie- en snelheidsdata van secundaire encoders kunnen ook worden gebruikt (alternatief, extern, analoog, absoluut, enz.).

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
De versterkingen die door SysId worden geproduceerd, gebruiken de eenheden die de Spark Max/Flex is geconfigureerd om te rapporteren (met behulp van [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) en [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>)). Dit zijn standaard rotaties en RPM zonder overbrenging. Als de eenheden die zijn gebruikt bij het registreren van data niet overeenkomen met de gewenste eenheden, kan de schaal tijdens de analyse worden aangepast in SysId.
:::
