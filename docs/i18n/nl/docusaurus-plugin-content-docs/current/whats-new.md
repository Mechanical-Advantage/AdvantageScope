---
title: Wat is er nieuw in 2026?
sidebar_position: 2
draft: true
---

#

<img src="/img/whats-new/banner-light.webp" className="light-only" />
<img src="/img/whats-new/banner-dark.webp" className="dark-only" />

De 2026-versie van AdvantageScope is nu uit! Bekijk de [installatiedocumentatie](/overview/installation) en de [volledige changelog](https://github.com/Mechanical-Advantage/AdvantageScope/releases) voor alle details. Deze release brengt een aantal grote nieuwe functies en flinke verbeteringen door de hele applicatie heen. Veel van deze vernieuwingen maken het werken met de huidige besturingssystemen prettiger en bereiden tegelijk een soepele overstap naar [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) in komende seizoenen voor.

**We horen graag wat je ervan vindt! Feedback, functieverzoeken en bugrapporten zijn welkom op de [issues-pagina](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

## ✴️ Experimenteel: FTC-ondersteuning {#ftc-support}

Als opstap naar volledige ondersteuning voor Systemcore in het seizoen 2027-2028 voegt deze release een aantal functies toe die de samenwerking met het huidige besturingssysteem van FIRST Tech Challenge verbeteren:

- FTC-velden en -robotmodellen op het 🗺️ [2D-veld](/tab-reference/2d-field) en 👀 [3D-veld](/tab-reference/3d-field)
- Nieuwe opties voor het [coördinatenstelsel](/more-features/coordinate-systems) die aansluiten op de [standaard FTC-coördinaten](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- Ondersteuning voor logbestanden van [Road Runner](https://rr.brott.dev/docs/v1-0/installation/)
- Ondersteuning voor het live-streamingformaat van [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard)

:::tip
Wees als FTC-team voorzichtig met experimentele software tijdens het officiële seizoen. De FTC-ondersteuning voor AdvantageScope is nog volop in ontwikkeling.
:::

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

Meerdere externe FTC-bibliotheken voor logging en telemetrie ondersteunen ook andere formaten waar AdvantageScope mee overweg kan, zoals WPILOG en RLOG. De documentatie van die bibliotheken vind je bij de projecten zelf; de ontwikkelaars van AdvantageScope raden geen specifieke FTC-loggingoplossing aan.

:::info
AdvantageScope werkt het best samen met het WPILib-framework en de bijbehorende loggingtools. Gebruik je een onofficiële loggingoplossing, dan kun je tegen compatibiliteitsproblemen of beperkingen aanlopen.

Vanaf de overstap naar Systemcore in het seizoen 2027-2028 worden alle functies van AdvantageScope officieel ondersteund in FTC.
:::

## 🧮 Eenheidsbewuste grafieken {#unit-aware-graphing}

Het tabblad 📉 [Lijngrafiek](/tab-reference/line-graph/) is helemaal opnieuw ontworpen zodat het volledig eenheidsbewust is. Dat geeft je allerlei nieuwe mogelijkheden bij het plotten van numerieke velden:

- Nauwkeurige labels bij de Y-assen en waardeweergaven
- Snel omrekenen naar compatibele eenheden zonder pop-upvensters
- Automatische conversie van compatibele eenheidstypen op dezelfde as
- Correcte weergave van [geïntegreerde en gedifferentieerde](/tab-reference/line-graph/#integration-and-differentiation) eenheden

In de schermafbeelding hieronder zie je al deze functies in actie. De linkeras bevat velden met verschillende eenheden voor hoeksnelheid, en op de rechteras staan gedifferentieerde waarden die in een andere eenheid (graden) worden weergegeven. Eenheden kiezen is nu ook makkelijker dan ooit: de compatibele opties staan direct in het bedieningsmenu van elke as.

_Meer informatie over eenheidsondersteuning vind je in de [documentatie](/tab-reference/line-graph/units)._

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Eenheidsbewuste grafieken" />

_Hierboven zie je de Engelstalige interface._

## 🏁 Snellere logdownloads {#faster-log-downloads}

[Logs downloaden vanaf de roboRIO](/overview/log-files/#downloading-from-the-robot) gaat nu **2-4x sneller** dan in eerdere versies. Dat komt door de overstap naar een nieuw protocol (FTP), waarmee de roboRIO logdata met minder CPU-belasting kan versturen.

De tabel hieronder toont de gemeten overdrachtssnelheden in de 2025- en 2026-versie van AdvantageScope via een Ethernet-kabel (maximale bandbreedte van 100 Mb/s). Je ziet dat de snelheid van de 2025-versie flink inzakt zodra de CPU van de roboRIO zwaarder belast wordt.

|                                                            | 2025 (SFTP) | 2026 (FTP) | Versnelling                                      |
| ---------------------------------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| Hoge CPU-belasting<br /><sub>Complexe robotcode</sub>      | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3,2x**</span> |
| Gemiddelde CPU-belasting<br /><sub>Normale robotcode</sub> | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2,3x**</span> |
| Minimale CPU-belasting<br /><sub>Geen robotcode</sub>      | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1,1x**</span> |

## 📁 Logs downloaden uit submappen {#download-logs-from-subfolders}

In het downloadvenster kun je nu ook logs opslaan die in submappen staan. Elke submap wordt als één geheel gedownload. Dat maakt het een stuk handiger om logs binnen te halen van de 2026-versie van CTRE's [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html), die submappen gebruikt omdat data niet in één enkel logbestand kan worden opgeslagen.

<img src="/img/whats-new/subfolders.webp" alt="Logsubmappen downloaden" height="450" />

## 🌈 Nieuwe visualisatieopties {#new-visualization-options}

Het 🗺️ [2D-veld](/tab-reference/2d-field) en 👀 [3D-veld](/tab-reference/3d-field) hebben er een aantal nieuwe visualisatieopties bij gekregen:

- Op het 2D-veld heb je nu keuze uit meer bumperkleuren, en elk object kan een eigen kleur krijgen. Dat geeft meer vrijheid wanneer je ghosts combineert met meerdere robotobjecten.
- Als je [2D-mechanismen op het 3D-veld visualiseert](/tab-reference/3d-field/#2d-mechanisms), kun je ze naast het XZ-vlak nu ook op het YZ-vlak plaatsen. Zo breng je complexe mechanismen die over meerdere assen bewegen makkelijker in beeld.
- Het 3D-veld ondersteunt nu optionele antialiasing voor strakkere, minder kartelige randen.

<img src="/img/whats-new/field-viz.jpg" alt="Nieuwe veldvisualisaties" />

## 🪵 Ondersteuning voor REV Robotics CAN-logbestanden {#rev-robotics-can-log-support}

Je kunt `.revlog`-bestanden van REV Robotics' [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) nu rechtstreeks openen in AdvantageScope. Deze bestanden leggen CAN-signalen van Spark Max- en Spark Flex-controllers vast en vormen een officieel alternatief voor de [URCL](/more-features/urcl)-bibliotheek van AdvantageScope.

Zowel URCL als de officiële `StatusLogger` blijven tijdens het seizoen 2026 beschikbaar voor een soepele overgang en behoud van alle bekende functies. Over de loggingopties voor 2027 en daarna delen we later meer details.

<img src="/img/whats-new/revlog.webp" alt="REVLOG-visualisatie" />

## 💿 CSV-bestanden importeren {#csv-file-imports}

Wil je data bekijken die niet uit een robotloggingframework komt? AdvantageScope biedt nu basisondersteuning voor het importeren van CSV-bestanden. Kijk in de [documentatie](/overview/log-files/#csv-formatting) voor de ondersteunde formaten en beperkingen.

<img src="/img/overview/log-files/export-2.webp" alt="CSV-data" />

## 🤩 Visuele verbeteringen {#aesthetic-improvements}

Op Windows 11 heeft AdvantageScope nu een halfdoorzichtige zijbalk, een detail dat voorheen alleen op macOS beschikbaar was. Voor macOS Tahoe is er bovendien een nieuw app-pictogram ontworpen op basis van Apple's Liquid Glass-materiaal.

<img src="/img/whats-new/windows-ui.webp" alt="Windows-interface" />

## 📋 Gestroomlijnde menu's {#streamlined-menus}

We hebben de menubalk en bijbehorende bediening opgeschoond en opnieuw ingedeeld, zodat alles op elk platform logischer en makkelijker te bereiken is:

- Wissel sneller tussen live-bronnen (zoals NetworkTables en [Phoenix-diagnostiek](/overview/live-sources/phoenix-diagnostics)), zonder dat je het voorkeurenvenster hoeft te openen.
- Klik met de rechtermuisknop in de zijbalk om snel de naam van een veld of de volledige veldsleutel te kopiëren.
- Een opnieuw ingedeeld voorkeurenvenster waarin je instellingen sneller terugvindt.

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.webp" />
  <img src="/img/whats-new/menus-2.webp" />
  <img src="/img/prefs_nl.webp" />
</div>

## 🐛 Stabiliteitsverbeteringen {#stability-improvements}

Deze release zit ook vol bugfixes en stabiliteitsverbeteringen door de hele applicatie heen. De complete lijst staat in de [changelog](https://github.com/Mechanical-Advantage/AdvantageScope/releases); hieronder een paar opvallende verbeteringen:

- De prestaties bij langdurig streamen van data zijn flink verbeterd, vooral op het tabblad Lijngrafiek.
- AdvantageScope gaat nu beter om met ongewone logdata, zoals hele grote logbestanden en omvangrijke veldwaarden.
- Verschillende visuele haperingen bij het bladeren door logdata zijn opgelost, met name bij het gebruik van filters op het tabblad Lijngrafiek.
- De sortering van AdvantageKit-logbestanden in het downloadvenster klopt weer: logs zonder tijdstempel staan nu onderaan de lijst, net als bij andere formaten.
- Op het tabblad 3D-veld worden robotcamera's met een roll-rotatie ongelijk aan nul nu correct weergegeven.
- AdvantageScope XR is stabieler geworden, vooral onder iOS/iPadOS 26. Gebruik je een offline installatie, controleer dan de App Store op updates.
