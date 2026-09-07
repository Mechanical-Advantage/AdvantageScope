# 📂 Logbestanden {#log-files}

## Ondersteunde formaten {#supported-formats}

- **WPILOG (.wpilog)** - Geproduceerd door WPILib's [ingebouwde datalogging](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) en AdvantageKit. [URCL](/more-features/urcl) kan worden gebruikt om signalen van REV-motorcontrollers vast te leggen in een WPILOG-bestand.
- **Hoot (.hoot)** - Geproduceerd door CTRE's Phoenix 6 [signaallogger](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html).
- **REVLOG (.revlog)** - Geproduceerd door REV Robotics' [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger).
- **Road Runner (.log)** - Geproduceerd door de [Road Runner](https://github.com/acmerobotics/road-runner)-bibliotheek voor FTC.
- **CSV (.csv)** - Kommagescheiden waarden, overeenkomend met het formaat dat door AdvantageScope wordt [geëxporteerd](/overview/log-files/export) in de modi "CSV (tabel)" of "CSV (lijst)". Zie [hier](#csv-formatting) voor details.
- **NI Driver Station-logbestanden (.dslog en .dsevents)** - Verouderd, geproduceerd door het NI [FRC Driver Station](https://docs.wpilib.org/en/stable/docs/software/driverstation/driver-station.html) (2010-2026). AdvantageScope zoekt automatisch naar het bijbehorende logbestand bij het openen van een van beide logtypen.
- **RLOG (.rlog)** - Verouderd, geproduceerd door AdvantageKit 2022.

:::info
Hoot-logbestanden kunnen alleen worden geopend nadat je akkoord bent gegaan met de [gebruiksrechtovereenkomst (EULA)](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt) van CTRE. AdvantageScope toont een melding om de akkoordverklaring met deze voorwaarden te bevestigen wanneer een Hoot-logbestand voor het eerst wordt geopend.
:::

## Logs openen {#opening-logs}

Klik in de menubalk op `Bestand` > `Logbestand(en) openen...` en kies vervolgens een of meer logbestanden van de lokale schijf. Het slepen van een logbestand vanuit de systeembestandsbrowser naar het pictogram of venster van AdvantageScope zorgt er ook voor dat het wordt geopend.

:::info
Als er meerdere bestanden tegelijk worden geopend, worden de tijdstempels automatisch uitgelijnd. Dit maakt het eenvoudig om logbestanden van meerdere bronnen te vergelijken. Zie de pagina [Tijdstempels](/more-features/timestamps) voor details over weergaveopties voor tijdstempels.
:::

<img src="/img/overview/log-files/open-file-1.webp" alt="Een opgeslagen logbestand openen" />

_De Engelstalige interface wordt hierboven weergegeven._

## Nieuwe logs toevoegen {#adding-new-logs}

Na het openen van een logbestand kunnen eenvoudig extra logs aan de visualisatie worden toegevoegd. Tijdstempels worden automatisch opnieuw uitgelijnd om te synchroniseren met bestaande data.

Klik in de menubalk op `Bestand` > `Nieuw(e) logbestand(en) toevoegen...` en kies vervolgens een of meer logbestanden om toe te voegen aan de huidige visualisatie. De velden uit elk logbestand worden geregistreerd onder tabellen met de naam `Log0`, `Log1`, enz.

## Downloaden vanaf de robot {#downloading-from-the-robot}

<details>
<summary>Configuratie</summary>

Open het voorkeurenvenster door te klikken op `App` > `Voorkeuren tonen...` (Windows/Linux) of `AdvantageScope` > `Instellingen...` (macOS). Werk het robotadres en het logpad bij.

<img src="/img/prefs_nl.webp" alt="Diagram van voorkeuren" height="450" />
</details>

Klik op `Bestand` > `Logs downloaden...` om het downloadvenster te openen. Het downloaden van logs wordt ondersteund op Systemcore en de roboRIO. Zodra er verbinding is met de robot, worden de beschikbare logs getoond met de nieuwste bovenaan. Selecteer een of meer logbestanden om te downloaden (shift-klik om een bereik te selecteren of **cmd/ctrl + A** om alles te selecteren). Klik vervolgens op het ↓-symbool en selecteer een opslaglocatie.

:::info
CTRE's [signaallogger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) gebruikt een niet-standaard formaat dat logs in submappen groepeert. Selecteer een of meer mappen in de lijst om de logbestanden als groep te downloaden.
:::

:::tip
Bij het downloaden van meerdere bestanden slaat AdvantageScope bestanden over die al in de doelmap bestaan.
:::

<img src="/img/overview/log-files/open-file-2.webp" alt="Logbestanden downloaden" height="350" />

_De Engelstalige interface wordt hierboven weergegeven._

## CSV-opmaak {#csv-formatting}

CSV-kolomnamen moeten "Timestamp, Key, Value" of "Timestamp, (Key), (Key), etc" zijn. Tijdstempelwaarden zijn in seconden. De onderstaande lijst toont het verwachte formaat van veelvoorkomende waardetypen. Merk op dat het exporteren en opnieuw importeren van logdata als CSV _met verlies_ (lossy) is, aangezien CSV geen complexe veldtypen ondersteunt.

- **Booleans:** `true` of `false`
- **Strings:** `"(waarde)"`
  - Voorbeeld: `"Hello world"`
- **Arrays:** `[(waarde); (waarde); (waarde)]`
  - Voorbeeld: `[1; 2; 3]`
- **Bytes:** hexadecimaal, gescheiden door `-`
  - Voorbeeld: `4d-41-36-33-32-38`
