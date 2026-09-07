---
title: Wat is er nieuw in 2026?
sidebar_position: 2
draft: true
---

#

<img src="/img/whats-new/banner-light.webp" className="light-only" />
<img src="/img/whats-new/banner-dark.webp" className="dark-only" />

De 2026-versie van AdvantageScope is nu beschikbaar! Bekijk de [installatiedocumentatie](/overview/installation) en de [volledige changelog](https://github.com/Mechanical-Advantage/AdvantageScope/releases) voor details. Deze release bevat diverse grote nieuwe functies en talrijke verbeteringen in de hele applicatie. Veel van de functies in deze release zijn ontworpen om de ervaring op bestaande besturingssystemen te verbeteren, terwijl een soepele overgang naar [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) in toekomstige seizoenen wordt voorbereid.

**We waarderen je feedback! Feedback, functieverzoeken en foutmeldingen zijn welkom op de [issues-pagina](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

## ✴️ Experimenteel: FTC-ondersteuning {#ftc-support}

Ter voorbereiding op volledige ondersteuning met Systemcore in het seizoen 2027-2028 voegt deze release verschillende functies toe om de compatibiliteit met het bestaande besturingssysteem van FIRST Tech Challenge te verbeteren:

- FTC-velden en -robotmodellen op het 🗺️ [2D-veld](/tab-reference/2d-field) en 👀 [3D-veld](/tab-reference/3d-field)
- Nieuwe opties voor het [coördinatenstelsel](/more-features/coordinate-systems) voor compatibiliteit met [standaard FTC-coördinaten](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- Ondersteuning voor [Road Runner](https://rr.brott.dev/docs/v1-0/installation/)-logbestanden
- Ondersteuning voor het live-streamingformaat van [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard)

:::tip
FTC-teams moeten voorzichtig zijn bij het gebruik van experimentele software tijdens het officiële seizoen. FTC-ondersteuning voor AdvantageScope is nog in actieve ontwikkeling.
:::

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

Verschillende externe FTC-logging-/telemetriebibliotheken ondersteunen andere formaten die compatibel zijn met AdvantageScope, zoals WPILOG en RLOG. Documentatie van deze bibliotheken is te vinden in de respectievelijke projecten; de AdvantageScope-ontwikkelaars bevelen geen specifieke FTC-loggingoplossing aan voor gebruik met AdvantageScope.

:::info
AdvantageScope is ontworpen om de beste ervaring te bieden wanneer het wordt gebruikt naast het WPILib-framework en bijbehorende loggingtools. Je kunt compatibiliteitsproblemen of beperkte mogelijkheden tegenkomen bij het gebruik van onofficiële loggingoplossingen.

Alle functies van AdvantageScope worden officieel ondersteund in FTC na de overgang naar Systemcore voor het seizoen 2027-2028.
:::

## 🧮 Eenheidsbewuste grafieken {#unit-aware-graphing}

Het tabblad 📉 [Lijngrafiek](/tab-reference/line-graph/) is opnieuw ontworpen om volledig eenheidsbewust te zijn. Dit maakt verschillende nieuwe mogelijkheden mogelijk bij het plotten van numerieke velden:

- Precieze labeling van Y-assen en waardeweergaven
- Snelle conversie naar compatibele eenheden (geen pop-upvensters)
- Impliciete conversie van compatibele eenheidstypen binnen één as
- Nauwkeurige weergave van [geïntegreerde en gedifferentieerde](/tab-reference/line-graph/#integration-and-differentiation) eenheden

De onderstaande schermafbeelding toont al deze functies in actie. Merk op dat de linkeras velden met verschillende hoeksnelheidseenheden bevat, en de rechteras waarden bevat die zijn gedifferentieerd en worden weergegeven in een niet-native eenheid (graden). Het selecteren van eenheden is ook eenvoudiger dan ooit tevoren, met compatibele eenheidsopties die direct zijn geïntegreerd in het bedieningsmenu voor elke as.

_Meer informatie over eenheidsondersteuning is te vinden in de [documentatie](/tab-reference/line-graph/units)._

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Eenheidsbewuste grafieken" />

_De Engelstalige interface wordt hierboven weergegeven._

## 🏁 Snellere logdownloads {#faster-log-downloads}

[Het downloaden van logs vanaf de roboRIO](/overview/log-files/#downloading-from-the-robot) is nu **2-4x sneller** dan in eerdere releases. Dit wordt bereikt door over te schakelen naar een nieuw protocol (FTP) waarmee de roboRIO logdata kan overdragen met minder CPU-overhead.

De onderstaande tabel toont de gemeten overdrachtssnelheid op de releases 2025 en 2026 van AdvantageScope bij verbinding via Ethernet (maximale bandbreedte van 100 Mb/s). Merk op dat de prestaties van de 2025-release ernstig worden beïnvloed door de CPU-belasting op de roboRIO.

|                                                            | 2025 (SFTP) | 2026 (FTP) | Versnelling                                      |
| ---------------------------------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| Hoge CPU-belasting<br /><sub>Complexe robotcode</sub>      | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3,2x**</span> |
| Gemiddelde CPU-belasting<br /><sub>Normale robotcode</sub> | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2,3x**</span> |
| Minimale CPU-belasting<br /><sub>Geen robotcode</sub>      | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1,1x**</span> |

## 📁 Logs downloaden uit submappen {#download-logs-from-subfolders}

Het downloadvenster ondersteunt nu het opslaan van logs die zijn opgeslagen in submappen. Elke submap met logs kan als groep worden gedownload, wat een gestroomlijnde aanpak biedt voor het downloaden van logs die zijn gegenereerd door de 2026-release van CTRE's [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) (die submappen gebruikt als tijdelijke oplossing voor het niet kunnen opslaan van data in één enkel logbestand).

<img src="/img/whats-new/subfolders.webp" alt="Logsubmappen downloaden" height="450" />

## 🌈 Nieuwe visualisatieopties {#new-visualization-options}

Verschillende nieuwe visualisatieopties worden ondersteund op het 🗺️ [2D-veld](/tab-reference/2d-field) en 👀 [3D-veld](/tab-reference/3d-field):

- Een bredere variëteit aan bumperkleuren voor robots is nu beschikbaar op het 2D-veld, en elk object kan worden geconfigureerd met zijn eigen kleur. Dit biedt meer flexibiliteit bij het combineren van ghosts met meerdere robotobjecten.
- Bij het [visualiseren van 2D-mechanismen op het 3D-veld](/tab-reference/3d-field/#2d-mechanisms) kunnen mechanismen nu naast het XZ-vlak ook op het YZ-vlak worden geplaatst. Dit maakt eenvoudige visualisatie mogelijk van complexe mechanismen met beweging in meerdere assen.
- Het 3D-veld ondersteunt nu optionele antialiasing om de kwaliteit van gerenderde randen te verbeteren.

<img src="/img/whats-new/field-viz.jpg" alt="Nieuwe veldvisualisaties" />

## 🪵 Ondersteuning voor REV Robotics CAN-logbestanden {#rev-robotics-can-log-support}

Je kunt nu `.revlog`-bestanden die zijn geproduceerd door REV Robotics' [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) rechtstreeks openen in AdvantageScope. Deze bestanden registreren CAN-signalen van Spark Max- en Spark Flex-apparaten en bieden een officieel alternatief voor de [URCL](/more-features/urcl)-bibliotheek van AdvantageScope.

Zowel URCL als de officiële `StatusLogger` blijven beschikbaar tijdens het seizoen 2026 om een soepele overgang te garanderen en functiepariteit met voorgaande seizoenen te bieden. We zullen op een later tijdstip meer details delen over loggingopties in 2027 en daarna.

<img src="/img/whats-new/revlog.webp" alt="REVLOG-visualisatie" />

## 💿 CSV-bestandsimport {#csv-file-imports}

Voor flexibelere visualisatie van data die buiten robotloggingframeworks is geproduceerd, bevat AdvantageScope nu basisfunctionaliteit voor het importeren van CSV-bestanden. Bekijk de [documentatie](/overview/log-files/#csv-formatting) voor meer details over ondersteunde formaten en andere beperkingen.

<img src="/img/overview/log-files/export-2.webp" alt="CSV-data" />

## 🤩 Esthetische verbeteringen {#aesthetic-improvements}

De gebruikersinterface van AdvantageScope op Windows 11 is bijgewerkt om een doorzichtige zijbalk te ondersteunen, wat voorheen exclusief was voor macOS-releases. Er is ook een bijgewerkt app-pictogram beschikbaar voor macOS Tahoe op basis van Apple's Liquid Glass-materiaal.

<img src="/img/whats-new/windows-ui.webp" alt="Windows UI" />

## 📋 Gestroomlijnde menu's {#streamlined-menus}

De menubalk en bijbehorende bedieningselementen zijn gestroomlijnd en gereorganiseerd om de bediening toegankelijker en consistenter te maken op alle platforms. Opvallende functies zijn onder meer:

- Sneller wisselen tussen live-bronnen (bijv. NetworkTables en [Phoenix-diagnostiek](/overview/live-sources/phoenix-diagnostics)), zonder het voorkeurenvenster te hoeven openen.
- Klik met de rechtermuisknop op de zijbalk om snel de naam van een veld (of de volledige veldsleutel) te kopiëren.
- Reorganisatie van het voorkeurenvenster, waardoor opties sneller te vinden zijn.

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.webp" />
  <img src="/img/whats-new/menus-2.webp" />
  <img src="/img/prefs_nl.webp" />
</div>

## 🐛 Stabiliteitsverbeteringen {#stability-improvements}

Deze release bevat een verscheidenheid aan bugfixes en stabiliteitsverbeteringen in de hele applicatie. De volledige lijst is te vinden in de release-[changelog](https://github.com/Mechanical-Advantage/AdvantageScope/releases), maar enkele opmerkelijke fixes worden hieronder vermeld:

- De prestaties van AdvantageScope bij het streamen van data gedurende lange perioden zijn aanzienlijk verbeterd, vooral bij het gebruik van het tabblad Lijngrafiek.
- AdvantageScope is nu toleranter voor ongebruikelijke logdata, waaronder grote logbestanden en grote veldwaarden.
- Verschillende visuele glitches zijn verholpen bij het bladeren door logdata, vooral bij het gebruik van filters op het tabblad Lijngrafiek.
- De volgorde van AdvantageKit-logbestanden in het downloadvenster is gecorrigeerd; logs zonder tijdstempels staan nu onderaan de lijst, vergelijkbaar met andere formaten.
- Op het tabblad 3D-veld worden robotcamera's met een niet-nul-rotatie in de rol-as nu correct gevisualiseerd.
- De stabiliteit van AdvantageScope XR is verbeterd, vooral bij gebruik op iOS/iPadOS 26. Controleer voor offline-installaties de App Store op beschikbare updates.
