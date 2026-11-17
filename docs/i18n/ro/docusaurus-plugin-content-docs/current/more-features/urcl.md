---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 Înregistrator neoficial compatibil REV {#unofficial-rev-compatible-logger}

:::info
Începând cu 2026, REVLib include o soluție oficială de logging pentru salvarea datelor de la Spark Max și Spark Flex într-un log CAN REV (`.revlog`). Consultă [documentația REVLib](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) pentru detalii. Aceste fișiere pot fi deschise direct în AdvantageScope, dar nu pot fi sincronizate precis cu alte surse de date.

Înregistratorul neoficial compatibil REV (URCL) din AdvantageScope rămâne disponibil echipelor și în 2026, pentru o tranziție lină și aceleași funcționalități ca în sezoanele anterioare. Vom reveni mai târziu cu detalii despre opțiunile de logging pentru 2027 și sezoanele următoare.
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) este o bibliotecă de logging disponibilă pentru Java, C++ și Python care înregistrează automat date de la Spark Max și Spark Flex. Aceasta permite reprezentarea grafică live și salvarea datelor de la toate dispozitivele, similar cu [funcția de reprezentare grafică Tuner X](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) și [înregistratorul de semnale Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) de la CTRE.

După configurare, cadrele periodice CAN de la toate dispozitivele Spark Max și Spark Flex sunt publicate în NetworkTables sau DataLog. Când folosești NetworkTables, poți utiliza [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) din WPILib ca să salvezi datele într-un fișier log. Poți vizualiza aceste cadre în AdvantageScope (consultă [Gestionarea fișierelor log](/overview/log-files) și [Conectarea la surse live](/overview/live-sources)).

- **Toate semnalele** sunt capturate automat, fără **nicio configurare manuală pentru dispozitive noi**.
- **Fiecare cadru este capturat**, chiar și atunci când perioada cadrelor de stare este mai rapidă decât ciclul de buclă al robotului.
- Cadrele sunt înregistrate cu **marcaje de timp bazate pe timpul de recepție CAN (RX)**, permițând o caracterizare mai precisă a accelerației cu [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) comparativ cu logarea tradițională în codul utilizatorului (vezi „Utilizarea SysId” mai jos).
- Logarea este **extrem de eficientă**; operațiunile rulează pe fire de execuție separate și durează sub 80 µs pe fiecare ciclu periodic de 20 ms, chiar și când înregistrezi un număr mare de dispozitive.
- **Toate funcțiile REVLib rămân neafectate.**

:::info
Deoarece această bibliotecă nu este un instrument oficial REV, dacă ai nevoie de ajutor, deschide un tichet pe [pagina de probleme URCL](https://github.com/Mechanical-Advantage/URCL/issues) sau scrie la software@team6328.org, în loc să contactezi suportul REV.
:::

## Configurare {#setup}

Instalează dependența vendor URCL urmând instrucțiunile pentru instalarea [bibliotecilor terțe](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html) din managerul de dependențe din VSCode. Alternativ, poți folosi următorul URL vendor JSON:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL publică în NetworkTables în mod implicit, de unde datele pot fi salvate într-un fișier log prin activarea DataLogManager din WPILib. Alternativ, URCL poate înregistra direct într-un DataLog. Pornește loggerul în `robotInit`, ca în exemplele de mai jos.

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // If publishing to NetworkTables and DataLog
  DataLogManager.start();
  URCL.start();

  // If logging only to DataLog
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // If publishing to NetworkTables and DataLog
  frc::DataLogManager::Start();
  URCL::Start();

  // If logging only to DataLog
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
        # If publishing to NetworkTables and DataLog
        wpilib.DataLogManager.start()
        urcl.start()

        # If logging only to DataLog
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
Compatibilitatea URCL cu AdvantageKit este oferită doar pentru comoditate; datele înregistrate în log NU sunt disponibile în replay (reluare). **Controllerele de motoare REV trebuie să facă parte în continuare dintr-o implementare IO cu intrări definite pentru a suporta reluarea**.
:::

</TabItem>
</Tabs>

Ca să identifici mai ușor dispozitivele din log, poți asocia aliasuri ID-urilor CAN transmițând un obiect de tip map metodei `start()` sau `startExternal()`. Cheile sunt ID-urile CAN, iar valorile sunt șiruri de caractere cu numele pe care vrei să le vezi în log. Dispozitivele fără alias vor fi înregistrate cu numele lor implicite.

:::warning
Pentru a minimiza utilizarea magistralei CAN, majoritatea cadrelor de stare pentru dispozitivele Spark sunt **dezactivate în mod implicit** până când este apelată o metodă getter asociată. Datele incluse în aceste cadre de stare dezactivate nu vor fi disponibile în logul URCL.

Pentru mai multe detalii, consultă [documentația REVLib](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods). Îți recomandăm să folosești [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) când configurezi Spark, ca să activezi manual semnalele pe care vrei să le incluzi în fișierul log.
:::

## Utilizarea SysId {#sysid-usage}

1. După ce ai configurat URCL ca mai sus, configurează rutina SysId folosind `null` pentru consumatorul de log al mecanismului. Mai jos ai un exemplu în Java. Poți face această configurare direct în clasa subsistemului.

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// Create the SysId routine
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // No log consumer, since data is recorded by URCL
    subsystem
  )
);

// The methods below return Command objects
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
// Create the SysId routine
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(
    null, null, null,
    (state) -> Logger.recordOutput("SysIdTestState", state.toString())
  ),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // No log consumer, since data is recorded by URCL
    subsystem
  )
);

// The methods below return Command objects
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. Rulează rutina SysId pe robot. Comenzile SysId pot fi configurate ca rutine autonome sau asociate unui buton.

3. Descarcă fișierul log și deschide-l în AdvantageScope. Din bara de meniu, mergi la `Fișier` > `Exportă datele...`. Setează formatul la „WPILOG” și setul de câmpuri la „Inclusiv cele generate”. Dă clic pe pictograma de salvare și alege unde să salvezi logul.

:::warning
Fișierul log de pe robot trebuie deschis și exportat din AdvantageScope _înainte de a-l deschide în analizorul SysId_. Acest pas este necesar pentru a converti datele CAN înregistrate de URCL într-un format compatibil cu SysId.
:::

4. Deschide analizorul SysId căutând „WPILib: Start Tool” în paleta de comenzi VSCode și alegând „SysId” (sau din scurtătura de pe desktop pe Windows). Încarcă fișierul log exportat dând clic pe „Open data log file...”

5. Alege câmpurile de mai jos pentru a rula analiza folosind encoderul implicit. Poți folosi și datele de poziție și viteză de la encoderii secundari (alternativi, externi, analogici, absoluți etc.).

   - Poziție = `NT:/URCL/<Device>/MotorPositionRotations`
   - Viteză = `NT:/URCL/<Device>/MotorVelocityRPM`
   - Tensiune = `NT:/URCL/<Device>/AppliedOutputVoltage`

:::tip
Valorile de câștig (gains) calculate de SysId vor folosi unitățile pe care Spark Max/Flex este configurat să le raporteze (prin [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) și [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>)). În mod implicit, acestea sunt rotații și RPM fără raport de transmisie aplicat. Dacă unitățile folosite la înregistrarea datelor nu corespund cu unitățile dorite, poți ajusta scalarea în SysId în timpul analizei.
:::
