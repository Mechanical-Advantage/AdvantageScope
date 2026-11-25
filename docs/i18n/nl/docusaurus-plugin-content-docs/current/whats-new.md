---
title: Wat is er nieuw in 2027?
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-2027-ltr-light.webp" className="light-only" />
<img src="/img/whats-new/banner-2027-ltr-dark.webp" className="dark-only" />

De 2027-versie van AdvantageScope is nu beschikbaar, met volledige ondersteuning voor Systemcore en meer dan **100 nieuwe functies en updates** in de hele applicatie. Bekijk de [installatiedocumentatie](/overview/installation) en het [volledige wijzigingsoverzicht](https://github.com/Mechanical-Advantage/AdvantageScope/releases) voor details. Deze pagina belicht de belangrijkste toevoegingen en verbeteringen in deze release.

**We stellen je feedback op prijs! Feedback, functieverzoeken en bugrapporten zijn welkom op de [issues-pagina](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />

## 🍋‍🟩 Systemcore-compatibiliteit {#systemcore-compatibility}

AdvantageScope 2027 is gebouwd voor naadloze samenwerking met de nieuwe Systemcore-robotcontroller en WPILib 2027:

- Het standaard robotadres is nu `robot.local`, zodat je live kunt verbinden of logs kunt downloaden zonder een teamnummer in te stellen. Systemcore USB- en wifi-adressen zijn ook te selecteren vanuit de menubalk.
- [Logs downloaden](/overview/log-files#downloading-from-the-robot) ondersteunt nu SFTP voor Systemcore naast de bestaande roboRIO-logdownloads.
- Het coördinatensysteem [Midden/rood](/more-features/coordinate-systems#center-red) toegevoegd dat vanaf 2027 op FRC-velden en vanaf 2027-2028 op FTC-velden wordt gebruikt.
- Ondersteuning toegevoegd voor de `Telemetry`- en `Tunables`-API's van WPILib 2027, bijgewerkte meldingskleuren en een nieuwe [voorkeur voor tijdstempelweergave](/more-features/timestamps) om Systemcore-tijdstempels goed leesbaar te houden.
- Een nieuwe live-modus [Systemcore-diagnostiek](/overview/live-sources) maakt rechtstreeks verbinding met de ingebouwde NetworkTables-server van Systemcore om de robotstatus en hardware-I/O te monitoren zonder dat gebruikerscode nodig is.

## 💡 AdvantageScope Lite {#advantagescope-lite}

[AdvantageScope Lite](/more-features/advantagescope-lite) brengt de visualisatie- en analysetools van AdvantageScope rechtstreeks naar je webbrowser. Het is toegankelijk vanuit zowel de Systemcore-webinterface als binnen het FIRST Driver Station, **zonder dat installatie nodig is**.

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/lHsak9Mmx2M" title="AdvantageScope Lite Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 🎮 FIRST Driver Station {#first-driver-station}

AdvantageScope integreert nauw met het nieuwe [FIRST Driver Station](https://docs.wpilib.org/en/latest/docs/software/firstdriverstation) om wedstrijddiagnostiek te stroomlijnen:

- [AdvantageScope Lite](/more-features/advantagescope-lite) is rechtstreeks toegankelijk vanuit het instellingenmenu van het FIRST Driver Station om WPILOG-bestanden van het DS te analyseren.
- Gebruik de desktopapp om realtime wedstrijdstatus, communicatiestatistieken, batterijspanning en joystickinvoer te streamen vanaf een lokaal Driver Station zonder enige configuratie.
- Wanneer je een `.wpilog`-bestand van het Driver Station op de desktop opent, vraagt AdvantageScope om een speciaal venster te openen met vooraf geconfigureerde tabbladen voor console-uitvoer, communicatiestatistieken, stroomverbruik, CPU-gebruik en joysticks ([documentatie](/overview/log-files#driver-station-layout)). Deze indeling wordt ook standaard gebruikt in AdvantageScope Lite voor het Driver Station.
- Bekijk consolelogs van het Driver Station op het tabblad 💬 [Console](/tab-reference/console) met automatische markering van waarschuwingen/fouten en volledige ondersteuning voor [ANSI-escape-sequenties](/tab-reference/console#ansi-formatting) (kleuren en tekststijlen).

<img src="/img/tutorials/taking-control-1.webp" alt="AdvantageScope Lite openen vanuit het FIRST Driver Station" />

_Hierboven zie je de Engelstalige interface._

## 🌐 Taalondersteuning {#language-support}

AdvantageScope is nu beschikbaar in **14 talen** in de desktopapplicatie, documentatiewebsite, mobiele apps en AdvantageScope Lite: Engels (VS), Spaans (Latijns-Amerika), Frans, Nederlands, Portugees (Brazilië), Roemeens, Turks, Russisch, Kazachs, Hebreeuws, Arabisch, Hindi, Vereenvoudigd Chinees en Traditioneel Chinees.

:::info
Vertalingen zijn een doorlopend project gemaakt met behulp van AI en communitybijdragers, en **kunnen onnatuurlijke formuleringen of onnauwkeurigheden bevatten**. Dank aan de teams die al hebben geholpen deze vertalingen na te kijken en te verbeteren! Zie de pagina 🌐 [Taalondersteuning](/overview/language-support) voor details over ons vertaalproces en hoe je feedback kunt geven.
:::

<img src="/img/whats-new/multi-language-1.webp" alt="Tabblad Lijngrafiek in Vereenvoudigd Chinees" />

## 📖 Nieuwe tutorials en documentatie {#new-tutorials-and-documentation}

De documentatie is uitgebreid met een nieuwe driedelige [tutorialreeks](/category/tutorials) om teams op weg te helpen met WPILib 2027 en AdvantageScope:

1. **👋 [Hallo, telemetrie!](/tutorials/hello-telemetry):** `DataLogManager` en de `Telemetry`-API instellen, live verbinden en data analyseren met lijngrafieken, tabellen en statistieken.
2. **🤖 [Het veld op: robotvisualisatie](/tutorials/to-the-field):** 2D/3D-poses, trajecten en `Mechanism2d`-objecten publiceren op FRC- en FTC-velden.
3. **🕹️ [De controle nemen: DS & joysticks](/tutorials/taking-control):** Live Driver Station-diagnostiek streamen, robot- en DS-logs synchroniseren, console-uitvoer bekijken en controllerinvoer visualiseren.

Codevoorbeelden in de hele documentatie zijn ook bijgewerkt met volledige dekking voor de `Telemetry`-API van WPILib in meerdere talen.

<img src="/img/tutorials/to-the-field-4.webp" alt="3D-veldvisualisatie uit de tutorial Het veld op" />

_Hierboven zie je de Engelstalige interface._

## 📱 AdvantageTune {#advantagetune}

AdvantageTune is een nieuwe zelfstandige app voor iPhone en iPad die een lichte mobiele tuning-ervaring biedt als aanvulling op AdvantageScope. Je kunt live [NetworkTables](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html)-topics (inclusief primitieven, arrays, WPILib-structs en Protobufs) rechtstreeks vanaf je telefoon bekijken en aanpassen, zodat iedereen eenvoudig kan meedoen aan het tunen van robotcode.

Zowel AdvantageTune als AdvantageScope vereenvoudigen het terugexporteren van getunede waarden naar de robotcode met knoppen om alle getunede waarden op te slaan in een tekstbestand om ze eenvoudig te delen ([documentatie](/overview/live-sources/tuning-mode)).

[<img src="/img/app-store_nl.svg" alt="App Store" />](https://apps.apple.com/nl/app/advantagetune/id6811453643)

<div className="image-gallery">
  <img src="/img/whats-new/advantagetune-1.webp" alt="AdvantageTune bladerweergave" />
  <img src="/img/whats-new/advantagetune-2.webp" alt="AdvantageTune topic bewerken" />
  <img src="/img/whats-new/advantagetune-3.webp" alt="AdvantageTune struct bewerken" />
  <img src="/img/whats-new/advantagetune-4.webp" alt="AdvantageTune lijst met getunede waarden" />
  <img src="/img/whats-new/advantagetune-5.webp" alt="AdvantageTune zoeken en filteren" />
</div>

_Hierboven zie je de Engelstalige interface._

## 🪐 Universele logging met WPILOG {#wpilog-universal-logging}

Met [universele logging](/more-features/universal-logging) kan één WPILOG-bestand nu dienen als een universele container voor meerdere logstreams en -formaten, waaronder fabrikantspecifieke apparaatlogs, CSV-data en onderliggende WPILOG-bestanden. Universele logging vervangt URCL door een flexibele, fabrikantonafhankelijke aanpak: data uit elke bron wordt automatisch gesynchroniseerd en samengevoegd in één uniforme boomstructuur in de zijbalk. Zie de [documentatie voor universele logging](/more-features/universal-logging#experimental-vendor-logging) voor details over het vastleggen van fabrikantlogs in AdvantageKit en WPILib (binnenkort beschikbaar).

<img src="/img/more-features/universal-logging-1.webp" alt="Een WPILOG-bestand dat meerdere fabrikantlogs in de zijbalk toont" />

_Hierboven zie je de Engelstalige interface._

## 🗺️ Verbeteringen aan de veldtabbladen {#field-tab-improvements}

Er zijn verschillende gebruiksvriendelijkheidsverbeteringen toegevoegd aan de tabbladen 🗺️ [2D-veld](/tab-reference/2d-field) en 👀 [3D-veld](/tab-reference/3d-field):

- Pan en zoom over het 2D-veld, of klik met de rechtermuisknop om de camera te vergrendelen zodat deze de positie en rotatie van de robot volgt ([documentatie](/tab-reference/2d-field#camera-controls)).
- Optie toegevoegd om 2D- en 3D-ghosts te laten vervagen wanneer de velden recentelijk niet zijn bijgewerkt (handig voor het weergeven van vision-poses).
- Tegelrasterlijnen toegevoegd op 2D- en 3D-FTC-velden voor eenvoudigere ruimtelijke oriëntatie.
- AdvantageScope onthoudt nu of het laatst een FRC- of FTC-veld is gebruikt bij het openen van nieuwe 2D- of 3D-veldtabbladen.

<img src="/img/tab-reference/2d-field-1.webp" alt="Overzicht van het tabblad 2D-veld" />

_Hierboven zie je de Engelstalige interface._

## 📉 Verbeteringen aan de lijngrafiek {#line-graph-improvements}

De 📉 [Lijngrafiek](/tab-reference/line-graph) en tijdlijn bevatten verschillende visuele verfijningen voor duidelijkere analyse:

- Het inschakelen van "Robotmodus tonen" toont nu een kleurgecodeerde balk voor autonome, tele-operated, utility- en uitgeschakelde periodes.
- Puntgrafieken schalen automatisch de puntgrootte voor betere zichtbaarheid op elk zoomniveau.
- Handige hints verschijnen op de lijngrafiek en tijdlijn om nieuwe gebruikers te begeleiden bij scroll- en zoomgebaren.
- De weergave en leesbaarheid van grote tijdstempelwaarden op de tijdlijn en lijngrafiekassen zijn verbeterd.

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="Kleurgecodeerde robotmodus-overlay op de lijngrafiek" />

_Hierboven zie je de Engelstalige interface._

## 🤝 Toegankelijkheidsverbeteringen {#accessibility-enhancements}

AdvantageScope 2027 bevat verschillende updates om de applicatie toegankelijker te maken:

- Toetsenbordnavigatie met Tab toegevoegd voor alle invoervelden en beschrijvende tooltips voor alle bedieningselementen in de app.
- AdvantageScope respecteert nu de OS-instellingen voor "minder transparantie" en "minder beweging".
- Booleaanse indicatoren in de zijbalk onderscheiden toestanden nu zonder uitsluitend op kleur te vertrouwen.

## 🥔 Nieuwe eenheidstypen {#new-unit-types}

AdvantageScope's [eenheidsbewuste grafieken](/tab-reference/line-graph/units) zijn uitgebreid met extra eenheidstypen en parseeropties:

- Vermogen (watt, paardenkracht, enz.)
- Verhoudingen (dimensieloos, procent)
- Temperatuur in Kelvin
- Aardappelenergie
- Brits-Engelse eenheidsspelling (bijv. `metres`)
- Achtervoegsels voor WPILib's eenhedenbibliotheek

## 🧱 Stabiliteitsverbeteringen {#stability-improvements}

Deze release bevat talloze bugfixes, prestatieoptimalisaties en stabiliteitsverbeteringen in de hele applicatie. De volledige lijst staat in het [wijzigingsoverzicht](https://github.com/Mechanical-Advantage/AdvantageScope/releases), met enkele opvallende hoogtepunten hieronder:

- Officiële Windows-releases zijn nu digitaal ondertekend, wat de kans op SmartScreen-waarschuwingen tijdens installatie verkleint.
- De prestaties bij het laden en plotten van logs zijn aanzienlijk verbeterd, vooral bij het werken met Hoot (`.hoot`)-logs en grote struct-arrays.
- De verwerking van tijdstempels opgelost bij het bekijken van AdvantageKit-logs samen met hoogfrequente databronnen.
- Het algoritme voor tijdstempelsynchronisatie bij het uitlijnen van logs uit meerdere bronnen is verbeterd.
- De verbindingsbetrouwbaarheid voor [Phoenix-diagnostiek](/overview/live-sources/phoenix-diagnostics) is verbeterd.
- UI-problemen opgelost met de menubalk in losse vensters en de opnamepop-up in [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- UI-teksten en formuleringen in de hele applicatie verfijnd voor meer duidelijkheid.
