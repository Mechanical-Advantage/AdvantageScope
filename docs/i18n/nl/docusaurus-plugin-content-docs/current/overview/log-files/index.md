# 📂 Logbestanden {#log-files}

## Ondersteunde formaten {#supported-formats}

- **WPILOG (.wpilog)** - Aangemaakt door WPILib's [ingebouwde datalogging](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) en AdvantageKit. Met [URCL](/more-features/urcl) kun je signalen van REV-motorcontrollers vastleggen in een WPILOG-bestand.
- **Hoot (.hoot)** - Aangemaakt door CTRE's Phoenix 6 [Signal Logger](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html).
- **REVLOG (.revlog)** - Aangemaakt door REV Robotics' [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger).
- **Road Runner (.log)** - Aangemaakt door de [Road Runner](https://github.com/acmerobotics/road-runner)-bibliotheek voor FTC.
- **CSV (.csv)** - Kommagescheiden waarden in het formaat dat AdvantageScope [exporteert](/overview/log-files/export) via de modi "CSV (tabel)" of "CSV (lijst)". Zie [hier](#csv-formatting) voor de opmaakregels.
- **NI Driver Station-logbestanden (.dslog en .dsevents)** - Verouderd formaat van het NI [FRC Driver Station](https://docs.wpilib.org/en/stable/docs/software/driverstation/driver-station.html) (2010-2026). Open je een van beide bestanden, dan zoekt AdvantageScope automatisch het bijbehorende logbestand erbij.
- **RLOG (.rlog)** - Verouderd formaat van AdvantageKit 2022.

:::info
Hoot-logbestanden kun je pas openen nadat je akkoord bent gegaan met de [gebruiksrechtovereenkomst (EULA)](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt) van CTRE. De eerste keer dat je een Hoot-logbestand opent, vraagt AdvantageScope je om deze voorwaarden te accepteren.
:::

## Logs openen {#opening-logs}

Klik in de menubalk op `Bestand` > `Logbestand(en) openen...` en kies een of meer logbestanden op je computer. Je kunt een logbestand ook vanuit je bestandsverkenner rechtstreeks naar het pictogram of het venster van AdvantageScope slepen om het te openen.

:::info
Open je meerdere bestanden tegelijk, dan lijnt AdvantageScope de tijdstempels automatisch uit. Zo vergelijk je makkelijk logbestanden uit verschillende bronnen. Kijk op de pagina [Tijdstempels](/more-features/timestamps) voor de weergaveopties.
:::

<img src="/img/overview/log-files/open-file-1.webp" alt="Een opgeslagen logbestand openen" />

_Hierboven zie je de Engelstalige interface._

## Nieuwe logs toevoegen {#adding-new-logs}

Heb je al een logbestand openstaan, dan kun je daar makkelijk extra logs aan toevoegen. De tijdstempels worden automatisch opnieuw uitgelijnd zodat ze gelijklopen met de data die al is geladen.

Klik in de menubalk op `Bestand` > `Nieuw(e) logbestand(en) toevoegen...` en selecteer een of meer logbestanden. De velden uit elk nieuw bestand worden ondergebracht in tabellen met de naam `Log0`, `Log1`, enz.

## Downloaden vanaf de robot {#downloading-from-the-robot}

<details>
<summary>Configuratie</summary>

Open het voorkeurenvenster via `App` > `Voorkeuren tonen...` (Windows/Linux) of `AdvantageScope` > `Instellingen...` (macOS) en vul het robotadres en het logpad op de robot in.

<img src="/img/prefs_nl.webp" alt="Diagram van voorkeuren" height="450" />
</details>

Klik op `Bestand` > `Logs downloaden...` om het downloadvenster te openen. Logs downloaden wordt ondersteund op Systemcore en de roboRIO. Zodra er verbinding is met de robot, verschijnen de beschikbare logs met de nieuwste bovenaan. Selecteer een of meer logbestanden of mappen (houd Shift ingedrukt voor een reeks of druk op **cmd/ctrl + A** om alles te selecteren). Klik daarna op het ↓-symbool en kies een opslaglocatie.

:::tip
Download je meerdere bestanden tegelijk, dan slaat AdvantageScope bestanden over die al in de doelmap staan.
:::

<img src="/img/overview/log-files/open-file-2.webp" alt="Logbestanden downloaden" height="350" />

_Hierboven zie je de Engelstalige interface._

## CSV-opmaak {#csv-formatting}

De kolomnamen in een CSV-bestand moeten "Timestamp, Key, Value" of "Timestamp, (Key), (Key), etc" zijn, met tijdstempels in seconden. Hieronder zie je hoe veelvoorkomende waardetypen eruit moeten zien. Houd er rekening mee dat het exporteren en opnieuw importeren via CSV _verliesgevend_ (lossy) is, omdat CSV geen complexe veldtypen ondersteunt.

- **Booleans:** `true` of `false`
- **Strings:** `"(waarde)"`
  - Voorbeeld: `"Hello world"`
- **Arrays:** `[(waarde); (waarde); (waarde)]`
  - Voorbeeld: `[1; 2; 3]`
- **Bytes:** hexadecimaal, gescheiden door `-`
  - Voorbeeld: `4d-41-36-33-32-38`
