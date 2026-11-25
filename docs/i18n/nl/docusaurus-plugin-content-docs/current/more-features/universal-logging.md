---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🪐 Universele logging met WPILOG

WPILOG is het standaard open logformaat dat in het hele WPILib-ecosysteem wordt gebruikt. Met AdvantageScope kan WPILOG dienen als een universele container voor meerdere logbestanden en -formaten. Dit betekent dat één enkel `.wpilog`-bestand meerdere datastromen kan bevatten in elk formaat dat door AdvantageScope wordt ondersteund, inclusief CSV, fabrikantspecifieke logs of extra WPILOG-bestanden.

Deze functie is ontworpen om diagnostiek te stroomlijnen door **alle diagnostische data van een robot in één universeel logbestand** te verzamelen; je hoeft niet langer meerdere logbestanden van één wedstrijd te downloaden, te koppelen of te synchroniseren, zelfs niet wanneer je data verzamelt van bibliotheken van derden of externe services. Eén enkel WPILOG-bestand kan bijvoorbeeld bevatten:

- Standaard robottelemetrie gepubliceerd via WPILib's `Telemetry`-API of NetworkTables.
- Hoogfrequente apparaatsignalen gelogd door bibliotheken van fabrikanten.
- Statusdata van coprocessors en externe services gelogd naar CSV of WPILOG.
- ...en meer!

Al deze data verschijnt in één overzichtelijke boomstructuur in AdvantageScope, zoals hieronder weergegeven met een WPILOG die apparaatsignalen bevat die door meerdere fabrikanten zijn vastgelegd.

:::note
Op Systemcore is [URCL](https://github.com/Mechanical-Advantage/URCL) vervangen door de officiële REV [statuslogger](https://docs.revrobotics.com/revlib/logs). Met universele logging in AdvantageScope kan de officiële statuslogger data van alle REV-apparaten vastleggen in één WPILOG-bestand (vergelijkbaar met URCL).
:::

<img src="/img/more-features/universal-logging-1.webp" alt="Een WPILOG-bestand dat meerdere fabrikantlogs in de zijbalk toont." />

_Hierboven zie je de Engelstalige interface._

:::tip
Gebruikers van AdvantageKit kunnen ook profiteren van XZ-compressie om de bestandsgrootte van logs van derden binnen een WPILOG aanzienlijk te verkleinen. Raadpleeg de AdvantageKit-documentatie over logdata-ontvangers voor details.
:::

## Experimenteel: Fabrikantlogging {#experimental-vendor-logging}

Veel robotprojecten genereren tegelijkertijd meerdere logbestanden: een standaard WPILOG-bestand voor WPILib/AdvantageKit-telemetrie naast eigen bestanden van fabrikantbibliotheken. Universele logging heft deze splitsing op door die fabrikantlogs rechtstreeks in het hoofd-`.wpilog`-bestand op te nemen. Bekijk de instructies hieronder voor WPILib en AdvantageKit.

:::warning
Omdat deze aanpak niet officieel door fabrikanten wordt ondersteund, moeten ondersteuningsverzoeken worden gericht aan de [issues-pagina](https://github.com/Mechanical-Advantage/AdvantageScope/issues) van AdvantageScope of aan software@team6328.org. Zie [Fabrikantdata exporteren](#exporting-vendor-data) voor meer informatie over het exporteren van de oorspronkelijke logbestanden voor diagnostiek.
:::

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

Download de klasse [`VendorLogCapture.java`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.java) en plaats deze in je robotproject. Deze klasse legt automatisch data uit fabrikantlogs vast in de actieve `DataLog` en moet worden geconfigureerd in je `Robot`-constructor zoals hieronder weergegeven. Kies een geschikte map (we raden `/home/systemcore/logs/` aan) om fabrikantlogs tijdelijk op te slaan tijdens het vastleggen. Zie het onderdeel [Hoe het werkt](#how-it-works) voor details.

```java
public Robot() {
  // Start WPILib's DataLogManager normaal
  DataLogManager.start();

  // Schakel het vastleggen van fabrikantlogs in vanuit een tijdelijke map
  // We raden aan fabrikantlogs tijdelijk op de interne opslag te plaatsen,
  // zelfs bij gebruik van een USB-stick (fabrikantlogs blijven niet behouden na het vastleggen)
  VendorLogCapture.start(DataLogManager.getLog(), "/home/systemcore/logs/");

  // Start de fabrikantlogger NADAT het vastleggen van logs is ingeschakeld
  // Indien instelbaar, moet de uitvoermap overeenkomen met het bovenstaande pad
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

Download de bestanden [`VendorLogCapture.hpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.hpp) en [`VendorLogCapture.cpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.cpp) en plaats ze in je robotproject. Deze klasse legt automatisch data uit fabrikantlogs vast in de actieve `DataLog` en moet worden geconfigureerd in je `Robot`-constructor zoals hieronder weergegeven. Kies een geschikte map (we raden `/home/systemcore/logs/` aan) om fabrikantlogs tijdelijk op te slaan tijdens het vastleggen. Zie het onderdeel [Hoe het werkt](#how-it-works) voor details.

```cpp
Robot::Robot() {
  // Start WPILib's DataLogManager normaal
  wpi::DataLogManager::Start();

  // Schakel het vastleggen van fabrikantlogs in vanuit een tijdelijke map
  // We raden aan fabrikantlogs tijdelijk op de interne opslag te plaatsen,
  // zelfs bij gebruik van een USB-stick (fabrikantlogs blijven niet behouden na het vastleggen)
  VendorLogCapture::Start(wpi::DataLogManager::GetLog(), "/home/systemcore/logs/");

  // Start de fabrikantlogger NADAT het vastleggen van logs is ingeschakeld
  // Indien instelbaar, moet de uitvoermap overeenkomen met het bovenstaande pad
  VendorLogger::SetPath("/home/systemcore/logs/");
  VendorLogger.Start();
}
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

Download het bestand [`vendor_log_capture.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/vendor_log_capture.py) en plaats het in je robotproject. Deze helper legt automatisch data uit fabrikantlogs vast in de actieve `DataLog` en moet worden geconfigureerd in `robotInit` zoals hieronder weergegeven. Kies een geschikte map (we raden `/home/systemcore/logs/` aan) om fabrikantlogs tijdelijk op te slaan tijdens het vastleggen. Zie het onderdeel [Hoe het werkt](#how-it-works) voor details.

```python
class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # Start WPILib's DataLogManager normaal
        wpilib.DataLogManager.start()

        # Schakel het vastleggen van fabrikantlogs in vanuit een tijdelijke map
        # We raden aan fabrikantlogs tijdelijk op de interne opslag te plaatsen,
        # zelfs bij gebruik van een USB-stick (fabrikantlogs blijven niet behouden na het vastleggen)
        VendorLogCapture.start(wpilib.DataLogManager.get_log(), "/home/systemcore/logs/")

        # Start de fabrikantlogger NADAT het vastleggen van logs is ingeschakeld
        # Indien instelbaar, moet de uitvoermap overeenkomen met het bovenstaande pad
        VendorLogger.set_path("/home/systemcore/logs/")
        VendorLogger.start()
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit (Binnenkort)">

Het vastleggen van fabrikantlogs is ingebouwd in AdvantageKit en kan worden ingeschakeld zoals hieronder weergegeven. Kies een geschikte map (we raden `/home/systemcore/logs/` aan) om fabrikantlogs tijdelijk op te slaan tijdens het vastleggen. Zie het onderdeel [Hoe het werkt](#how-it-works) voor details.

```java
public Robot() {
  // Schakel het vastleggen van fabrikantlogs in vanuit een tijdelijke map
  // We raden aan fabrikantlogs tijdelijk op de interne opslag te plaatsen,
  // zelfs bij gebruik van een USB-stick (fabrikantlogs blijven niet behouden na het vastleggen)
  Logger.setVendorLogDirectory("/home/systemcore/logs/");

  // Start AdvantageKit normaal
  Logger.start();

  // Start de fabrikantlogger NADAT de AdvantageKit-logger is gestart
  // Indien instelbaar, moet de uitvoermap overeenkomen met het bovenstaande pad
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

:::info
Ongeacht de gekozen logdata-ontvangers kunnen fabrikantlogs alleen worden bekeken door een WPILOG-bestand te downloaden. Live streaming wordt niet ondersteund vanwege de structuur van de vastgelegde logdata.
:::

</TabItem>
</Tabs>

Let op: sommige fabrikantloggers beginnen _meteen_ met schrijven zodra de bijbehorende apparaatklasse (bijv. `SparkMax`) wordt geïnstantieerd. We raden aan te wachten met het instantiëren van hardwareobjecten tot het einde van de `Robot`-constructor om er zeker van te zijn dat alle logs worden vastgelegd.

### Hoe het werkt {#how-it-works}

1. **Vastleggen:** Het robotprogramma voert standaard WPILib-logging uit naast fabrikantloggers. Een lichte helper leest periodiek nieuwe data uit die door de fabrikantloggers is geschreven en verpakt de ruwe blokken rechtstreeks in de actieve `DataLog`-stream.
2. **Opslag:** Het volledige gecombineerde logbestand wordt opgeslagen in één `.wpilog`-bestand (bijv. op een USB-stick aangesloten op Systemcore). Tijdelijke fabrikantlogbestanden die op de robot zijn aangemaakt, blijven niet behouden na herstart, wat opslagophoping voorkomt.
3. **Visualisatie:** Wanneer AdvantageScope het `.wpilog`-bestand opent, detecteert de app automatisch alle ingebedde logitems, decodeert de inhoud en voegt alle velden samen in de zijbalk naast de standaardtelemetrie.
4. **Extractie:** Als je een fabrikantlogbestand moet openen voor ondersteuning of geavanceerde diagnostiek, kunnen de originele fabrikantlogbestanden zonder verlies worden geëxtraheerd uit het `.wpilog`-bestand zoals beschreven in [Fabrikantdata exporteren](#exporting-vendor-data).

Externe logdata wordt opgeslagen in het WPILOG-formaat via een ruw item waarvan de typestring de conventie `log:<formaat>` volgt. Bij het parsen van zo'n veld voegt AdvantageScope alle binaire records voor dat item in chronologische volgorde samen en decodeert de resulterende payload als een zelfstandig logbestand in het opgegeven formaat. De gedecodeerde signalen worden vervolgens samengevoegd in de hoofdboom en automatisch gesynchroniseerd met de bestaande data.

:::tip
Universele logging met WPILOG is niet beperkt tot fabrikantlogs; elk logformaat dat compatibel is met AdvantageScope kan met dezelfde conventie in een WPILOG worden ingebed.
:::

### Fabrikantdata exporteren {#exporting-vendor-data}

Hoewel data uit fabrikantlogs rechtstreeks in AdvantageScope kan worden bekeken, kan het soms nodig zijn om het originele logbestand te extraheren zoals het door de oorspronkelijke bibliotheek is geproduceerd (bijv. voor inspectie in fabrikantspecifieke hulpprogramma's).

Om een afzonderlijk onderliggend logbestand rechtstreeks vanuit AdvantageScope te exporteren, klik je met de rechtermuisknop op het onderliggende logitem in de zijbalk en selecteer je **Origineel logbestand exporteren...**.

Voor batch-extractie kun je ook het Python-script [`extract_vendor_logs.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/extract_vendor_logs.py) gebruiken, dat een of meer `.wpilog`- of `.wpilogxz`-bestanden doorzoekt op alle geïntegreerde fabrikantlogs en ze exporteert naar afzonderlijke bestanden:

```bash
pip3 install robotpy-wpiutil # Vereiste afhankelijkheid
python3 extract_vendor_logs.py path/to/source.wpilog
```
