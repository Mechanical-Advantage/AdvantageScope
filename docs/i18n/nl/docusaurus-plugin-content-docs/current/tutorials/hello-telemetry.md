---
sidebar_position: 1
---

# 👋 Hallo, telemetrie!

Welkom bij AdvantageScope! Telemetrie en datalogging zijn krachtige hulpmiddelen waarmee je robotcode beter kunt begrijpen, problemen kunt opsporen en oplossingen kunt doorvoeren op en naast het veld. Deze tutorials zijn ontworpen om je op weg te helpen met telemetrie, zodat je alle mogelijkheden van AdvantageScope kunt benutten.

In deze tutorial leer je hoe je:

- Basistelemetrie voor de robot instelt in een Java WPILib-project.
- Verbindt met live datastreams in AdvantageScope.
- Data vastlegt in logbestanden om later te bekijken.
- Telemetriedata visualiseert met AdvantageScope.

:::tip Op zoek naar iets anders?

- **FTC-teams:** Als je het huidige FIRST Tech Challenge-besturingssysteem gebruikt, bekijk dan de handleiding ✴️ [FTC-compatibiliteit](/more-features/ftc-compatibility).
- **Webinterface:** Een browserversie van AdvantageScope is rechtstreeks beschikbaar in het FIRST Driver Station en de Systemcore-webinterface. Zie 💡 [AdvantageScope Lite](/more-features/advantagescope-lite) voor details.
- **AdvantageKit:** Een geavanceerd loggingframework ontworpen voor deterministische replay in simulatie. Raadpleeg de [documentatie](https://docs.advantagekit.org) voor details. We raden aan te beginnen met de ingebouwde telemetrie-API van WPILib, die hieronder wordt beschreven.
  :::

## 1. Maak een nieuw WPILib-project

Om te beginnen maak je een nieuw WPILib Java-project aan in VS Code:

1. Open VS Code.
2. Klik op het WPILib-pictogram rechtsboven (of druk op `Ctrl+Shift+P` / `Cmd+Shift+P` en typ **WPILib: Create a new project**).
3. Kies **Template** > **Java** > **Command v3 Robot** (of **Command v2 Robot**).
4. Kies een map, geef je project een naam (bijv. `HelloTelemetry`) en vul je teamnummer in.
5. Vink **Enable Desktop Support** aan en klik op **Create Project**.

<img src="/img/tutorials/hello-telemetry-1.webp" alt="Een nieuw WPILib Java-project aanmaken in VS Code met de WPILib Project Creator." />

_Hierboven zie je de Engelstalige interface._

## 2. Initialiseer datalogging

WPILib biedt ingebouwde datalogging via `DataLogManager`. Zodra deze is gestart, legt hij automatisch alle telemetrie, NetworkTables-items en Driver Station-invoer vast in `.wpilog`-bestanden.

:::info Aanbeveling
Hoewel logs kunnen worden opgeslagen op de interne opslag van Systemcore, is het interne flashgeheugen beperkt. We raden sterk aan om een standaard **FAT32-geformatteerde USB-stick** in een van de USB-poorten van Systemcore te steken. `DataLogManager` detecteert de USB-stick en schrijft automatisch alle logs rechtstreeks naar de USB-stick.
:::

Open `src/main/java/first/robot/Robot.java` en initialiseer `DataLogManager` in de `Robot()`-constructor:

```java
public class Robot extends OpModeRobot {
  // ...

  public Robot() {
    // Start DataLogManager om alle telemetrie op te slaan in een .wpilog-bestand op de USB-stick
    DataLogManager.start();

    // Leg ook Driver Station-data vast (joysticks, OpMode, inschakelstatus)
    DriverStation.startDataLog(DataLogManager.getLog());
  }

  // ...
}
```

## 3. Publiceer telemetriedata

Met de klasse `Telemetry` van WPILib kun je met één regel code data publiceren en velden ordenen in hiërarchische tabellen. Deze API ondersteunt allerlei datatypen, waaronder numerieke waarden, booleans, strings, arrays en WPILib-[geometrietypen](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/geometry/index.html).

:::info
De klasse `Telemetry` in WPILib verschilt van de klasse `Telemetry` in de FTC SDK. De klasse `Telemetry` van WPILib stuurt informatie vanuit het robotprogramma naar dashboards, debugtools of logbestanden. Gebruik de klasse `DriverStationDisplay` van WPILib om het ingebouwde Driver Station-scherm bij te werken.
:::

Werk `src/main/java/first/robot/ExampleTeleop.java` bij:

```java
@Teleop
public class ExampleTeleop implements OpMode {
  // ...

  @Override
  public void periodic() {
    double currentTime = Timer.getTimestamp();
    double sineWave = Math.sin(currentTime * 2.0);

    // Publiceer telemetriewaarden via de Telemetry-API
    Telemetry.log("Time", currentTime);
    Telemetry.log("SineWave/Value", sineWave);
    Telemetry.log("SineWave/Low", sineWave < 0.5);
  }
}
```

Deploy de code naar je robot (of voer `WPILib: Simulate Robot Code` uit vanuit VS Code). Klik in simulatie op `Teleoperated` > `ExampleTeleop` > `Enable`.

<img src="/img/tutorials/hello-telemetry-2.webp" alt="De ExampleTeleop OpMode inschakelen in de simulator-GUI." height="200" />

_Hierboven zie je de Engelstalige interface._

:::tip
Nieuwe telemetriedata wordt alleen gepubliceerd wanneer `Telemetry.log` wordt aangeroepen. Periodieke methoden in de klasse `Robot`, OpModes, subsystemen en mechanismen kunnen onder verschillende omstandigheden actief zijn; bekijk de API-documentatie zorgvuldig wanneer je bepaalt waar je logaanroepen plaatst.
:::

## 4. Verbind AdvantageScope live

Start de desktopapp van AdvantageScope. Kies in het bovenste menu `Bestand` > `Verbinden met robot` > `NetworkTables` (of `Bestand` > `Verbinden met simulator` als je simuleert). Zodra er verbinding is, wordt de linkerzijbalk gevuld met gepubliceerde velden onder `NT:/Telemetry`.

:::tip Sneltoetsen
Druk op `Ctrl+K` / `Cmd+K` om snel verbinding te maken met de robot, of op `Ctrl+Shift+K` / `Cmd+Shift+K` om te verbinden met de simulator.
:::

<img src="/img/tutorials/hello-telemetry-3.webp" alt="AdvantageScope verbonden met de live robotstream met velden weergegeven in de zijbalk." />

_Hierboven zie je de Engelstalige interface._

## 5. Visualiseer telemetriedata

### Lijngrafiek

De 📉 [Lijngrafiek](/tab-reference/line-graph) is het standaardtabblad in AdvantageScope en biedt realtime grafieken van numerieke en discrete waarden.

1. Kijk in de linkerzijbalk onder `Telemetry` > `SineWave`.
2. Sleep `Value` naar het gebied "Linkeras" van het bedieningspaneel.
3. Sleep `Low` naar het gebied "Discrete velden" van het bedieningspaneel.
4. Klik op de drie puntjes naast "Discrete velden" en vervolgens op "Robotmodus tonen".

Je ziet de sinusgolf en de robotstatus in realtime bijwerken zodra er data binnenkomt!

:::info Omgaan met de grafiek

- **Pauzeren / Scrubben:** Scroll horizontaal of klik en sleep over de grafiek om eerdere data te bekijken. De rode pijl rechtsboven geeft aan dat live automatisch scrollen is gepauzeerd. Klik op de pijl of druk op `L` om live automatisch scrollen aan of uit te zetten.
- **Zoomen:** Scroll omhoog/omlaag boven de grafiek, of houd `Shift` ingedrukt terwijl je sleept om in te zoomen op een specifiek tijdsvenster.
- **Waarden inspecteren:** Klik ergens op de grafiek om een tijdcursor te plaatsen en exacte waarden in de legenda te zien.
  :::

<img src="/img/tutorials/hello-telemetry-4.webp" alt="Lijngrafiek die het sinusgolfsignaal plot." />

_Hierboven zie je de Engelstalige interface._

### Tabel

Het tabblad 🔢 [Tabel](/tab-reference/table) toont een chronologische spreadsheet van status- en waardeveranderingen, ideaal om overgangen en gebeurtenisreeksen te analyseren.

1. Klik op de knop **+** in de bovenste tabbladbalk en kies **Tabel**.
2. Sleep vanuit de zijbalk `NT:/Telemetry/SineWave/Value` en `NT:/Telemetry/Low` naar de tabelweergave.
3. Er wordt automatisch een nieuwe rij toegevoegd telkens wanneer een weergegeven veld van waarde verandert.
4. Klik op een willekeurige rij om alle geopende tabbladen direct naar dat exacte tijdstip te laten springen!

:::tip
Tabbladen kunnen worden herschikt en hernoemd via de tabbladbalk. Klik op de vensterknop in de titelbalk om een tabblad in een los venster te openen en meerdere tabbladen naast elkaar te bekijken.
:::

<img src="/img/tutorials/hello-telemetry-5.webp" alt="Tabblad Tabel met sinusgolfdata." />

_Hierboven zie je de Engelstalige interface._

### Statistieken

Het tabblad 📊 [Statistieken](/tab-reference/statistics) toont een histogram van numerieke waarden en geeft een gedetailleerd beeld van data uit een of meer velden.

1. Klik op de knop **+** in de bovenste tabbladbalk en kies **Statistieken**.
2. Sleep vanuit de zijbalk `NT:/Telemetry/SineWave/Value` naar de sectie "Metingen".
3. Stel "Databereik" in op `-1` en `1`, en stel "Stapgrootte" in op `0,1`.
4. Bekijk de data met behulp van het histogram en de samenvattende statistieken.
5. Scroll over de tijdlijn bovenaan om het bereik van de opgenomen data aan te passen.

<img src="/img/tutorials/hello-telemetry-6.webp" alt="Tabblad Statistieken met sinusgolfdata." />

_Hierboven zie je de Engelstalige interface._

## 6. Logbestanden downloaden en openen

Na het testen of na een wedstrijd kun je `.wpilog`-bestanden downloaden van de robot om de data achteraf te bekijken:

1. Selecteer in de menubalk `Bestand` > `Logs downloaden...`.
2. AdvantageScope maakt verbinding met de robot en toont alle vastgelegde logbestanden (nieuwste bovenaan).
3. Selecteer het gewenste logbestand (of de gewenste bestanden), klik op het downloadpictogram (↓) en kies een map op je computer.
4. Open het gedownloade bestand via `Bestand` > `Logbestand(en) openen...` of door het `.wpilog`-bestand rechtstreeks naar AdvantageScope te slepen.

<img src="/img/overview/log-files/open-file-2.webp" alt="Het downloadvenster met beschikbare WPILOG-bestanden op de robotopslag." height="350" />

_Hierboven zie je de Engelstalige interface._

## Wat nu?

Nu je basistelemetrie en logging hebt draaien, kun je je visualisatie naar een hoger niveau tillen:

- **🤖 [Het veld op: robotvisualisatie](/tutorials/to-the-field):** Leer hoe je 2D/3D-robotposities, trajecten en mechanismen visualiseert op FRC- en FTC-veldmodellen.
- **[Overzicht](/category/overview):** Een uitgebreide handleiding over bestandsbeheer, navigatiesneltoetsen en opties voor live streaming.
- **[Ondersteuning voor eenheden](/tab-reference/line-graph/units):** Hoe je eenheidsmetadata in je logs opneemt voor nauwkeurigere visualisatie.
- **💬 [Console](/tab-reference/console):** Visualiseer tekstlogs die door WPILib's `DataLogManager` zijn opgeslagen.
- **🔍 [Metadata](/tab-reference/metadata):** Sla extra informatie op om logbestanden te herkennen en te categoriseren.
- **[Epilogue](https://docs.wpilib.org/en/stable/docs/software/telemetry/robot-telemetry-with-annotations.html):** Leg telemetrie in Java vast met behulp van annotaties.
