---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 Înregistrator neoficial compatibil REV

:::info
Nou în 2026, REVLib include o soluție oficială de logare pentru salvarea datelor de la Spark Max și Spark Flex într-un log CAN REV (`.revlog`). Consultați [aici](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) pentru detalii. Aceste fișiere pot fi deschise direct în AdvantageScope, dar nu pot fi sincronizate precis cu alte surse de date.

Înregistratorul neoficial compatibil REV (URCL) al AdvantageScope va rămâne de asemenea disponibil echipelor în 2026 pentru a asigura o tranziție lină și a oferi paritate de caracteristici cu sezoanele anterioare. Vom avea mai multe detalii de împărtășit despre opțiunile de logare în 2027 și ulterior la o dată viitoare.
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) este o bibliotecă de logare disponibilă pentru Java, C++ și Python care înregistrează automat date de la Spark Max și Spark Flex. Aceasta permite reprezentarea grafică live și logarea tuturor dispozitivelor, similar cu [funcția de reprezentare grafică Tuner X](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) și [înregistratorul de semnale Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) de la CTRE.

După configurare, cadrele periodice CAN de la toate dispozitivele Spark Max și Spark Flex sunt publicate în NetworkTables sau DataLog. Când utilizați NetworkTables, [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) din WPILib poate fi utilizat pentru a captura datele într-un fișier log. Aceste cadre pot fi vizualizate în AdvantageScope (consultați [Gestionarea fișierelor log](/overview/log-files) și [Conectarea la surse live](/overview/live-sources)).

- **Toate semnalele** sunt capturate automat, fără **nicio configurare manuală pentru dispozitive noi**.
- **Fiecare cadru este capturat**, chiar și atunci când perioada cadrelor de stare este mai rapidă decât ciclul de buclă al robotului.
- Cadrele sunt înregistrate cu **marcaje de timp bazate pe timpul de recepție CAN (RX)**, permițând o caracterizare mai precisă a accelerației cu [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) comparativ cu logarea tradițională în codul utilizatorului (consultați „Utilizarea SysId” mai jos).
- Logarea este **extrem de eficientă**; operațiunile sunt gestionate pe fire de execuție separate și rulează sub 80µs pe ciclu periodic de 20ms, chiar și la logarea unui număr mare de dispozitive.
- **Toate funcțiile REVLib rămân neafectate.**

:::info
Deoarece această bibliotecă nu este un instrument oficial REV, întrebările de suport ar trebui trimise pe [pagina de probleme URCL](https://github.com/Mechanical-Advantage/URCL/issues) sau la software@team6328.org, mai degrabă decât la contactul de suport REV.
:::

## Configurare

Instalați dependența vendor URCL urmând instrucțiunile pentru instalarea [bibliotecilor terțe](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html) folosind managerul de dependențe din VSCode. Alternativ, puteți utiliza următorul URL vendor JSON:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL publică în NetworkTables în mod implicit, unde datele pot fi salvate într-un fișier log prin activarea DataLogManager din WPILib. Alternativ, URCL poate înregistra direct într-un DataLog. Înregistratorul ar trebui pornit în `robotInit`, așa cum se arată mai jos.

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
Compatibilitatea URCL cu AdvantageKit este furnizată doar din motive de comoditate; datele înregistrate în log NU sunt disponibile în reluare. **Motoarele REV trebuie să facă parte în continuare dintr-o implementare IO cu intrări definite pentru a suporta reluarea**.
:::

</TabItem>
</Tabs>

Pentru a identifica mai ușor dispozitivele din log, ID-urile CAN pot fi atribuite unor alias-uri prin transmiterea unui obiect de tip map metodei `start()` sau `startExternal()`. Cheile sunt ID-uri CAN, iar valorile sunt șiruri de caractere pentru numele care urmează să fie utilizate în log. Orice dispozitive cărora nu li se atribuie un alias vor fi înregistrate folosind numele lor implicite.

:::warning
Pentru a minimiza utilizarea CAN, majoritatea cadrelor de stare pentru dispozitivele Spark sunt **dezactivate în mod implicit** până când este apelată o metodă getter asociată. Orice date incluse în aceste cadre de stare dezactivate nu vor fi disponibile în logul URCL.

Pentru mai multe detalii, verificați [documentația REVLib](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods). Recomandăm utilizarea [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) la configurarea Spark pentru a activa manual orice semnale pe care doriți să le includeți în fișierul log.
:::

## Utilizarea SysId

1. După configurarea URCL așa cum este arătat mai sus, configurați rutina SysId folosind `null` pentru consumatorul de log al mecanismului. Un exemplu este prezentat mai jos pentru Java. Această configurare poate fi efectuată în cadrul clasei subsistemului.

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

2. Rulați rutina SysId pe robot. Comenzile SysId pot fi configurate ca rutine autonome sau conectate la un buton de declanșare.

3. Descărcați fișierul log și deschideți-l în AdvantageScope. În bara de meniu, mergeți la `Fișier` > `Exportă datele...`. Setați formatul la „WPILOG” și setul de câmpuri la „Inclusiv cele generate”. Dați clic pe pictograma de salvare și alegeți o locație pentru a salva logul.

:::warning
Fișierul log de pe robot trebuie deschis și exportat de AdvantageScope _înainte de a-l deschide folosind analizorul SysId_. Acest lucru este necesar pentru a converti datele CAN înregistrate de URCL într-un format compatibil cu SysId.
:::

4. Deschideți analizorul SysId căutând „WPILib: Start Tool” în paleta de comenzi VSCode și alegând „SysId” (sau folosind lansatorul de pe desktop pe Windows). Deschideți fișierul log exportat dând clic pe „Open data log file...”

5. Alegeți următoarele câmpuri de mai jos pentru a rula analiza folosind encoderul implicit. Datele de poziție și viteză de la encoderii secundari pot fi de asemenea utilizate (alternativi, externi, analogici, absoluți etc.).

   - Poziție = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Viteză = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Tensiune = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
Amplificările produse de SysId vor utiliza unitățile pe care Spark Max/Flex este configurat să le raporteze (folosind [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) și [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>)). În mod implicit, acestea sunt rotații și RPM fără raport de transmisie aplicat. Dacă unitățile utilizate la înregistrarea datelor nu se potrivesc cu unitățile dorite, scalarea poate fi ajustată în SysId în timpul analizei.
:::
