---
sidebar_position: 1
---

# ✴️ FTC-compatibiliteit {#ftc-compatibility}

AdvantageScope werkt nu al soepel samen met het huidige besturingssysteem van de FIRST Tech Challenge en bereidt je tegelijk voor op de overstap naar [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) in de komende seizoenen. Vanaf seizoen 2027-2028, na de overgang naar Systemcore, worden alle functies van AdvantageScope officieel voor FTC ondersteund.

## Velden en robots {#fields-and-robots}

FTC-velden en robotmodellen zijn standaard ingebouwd.

- **Veld- en robotmodellen:** Selecteer FTC-velden en robotmodellen direct via de dropdownmenu's op de tabbladen 🗺️ [2D-veld](/tab-reference/2d-field) en 👀 [3D-veld](/tab-reference/3d-field). Alle velden werken ook met [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- **Coördinatenstelsels:** Stel het [coördinatenstelsel](/more-features/coordinate-systems) zo in dat het aansluit op de [standaard FTC-coördinaten](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html). Op FTC-velden staat dit stelsel standaard al goed ingesteld.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## Ondersteunde formaten {#supported-formats}

AdvantageScope ondersteunt standaard het live-streamingformaat van **FTC Dashboard** en `.log`-bestanden van **Road Runner**, naast WPILib-formaten zoals WPILOG en NetworkTables.

Er zijn verschillende externe logging- en telemetriebibliotheken voor FTC die data in een compatibel formaat opslaan. De ontwikkelaars van AdvantageScope raden geen specifieke FTC-bibliotheek aan; houd er wel rekening mee dat sommige oplossingen beperktere mogelijkheden bieden.

De lijst hieronder geeft een overzicht om mee te beginnen, maar is niet compleet:

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): Genereert logbestanden om padplanning te debuggen.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/): Streamt live-telemetrie die zowel met het eigen dashboard als met AdvantageScope werkt.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): Laat je eigen data loggen naar verschillende formaten, zowel in logbestanden als via live-streaming.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): Slaat data op in het WPILOG-formaat met behulp van annotaties.
- **PsiKit**: Een logging- en replayframework voor FTC, geïnspireerd op AdvantageKit.

:::warning
Let erop dat je tijdens wedstrijden voldoet aan regel R704. Externe telemetriediensten zoals FTC Dashboard zijn tijdens wedstrijden verboden als je via wifi verbonden bent.
:::

### AdvantageScope Lite voor FTC {#advantagescope-lite-for-ftc}

Er is ook een onofficiële versie van [AdvantageScope Lite](/more-features/advantagescope-lite) die speciaal voor FTC is aangepast: [**AdvantageScope Lite voor REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). Deze versie is onofficieel en wordt niet door de ontwikkelaars van AdvantageScope ondersteund.

De gewone [AdvantageScope Lite](/more-features/advantagescope-lite) is een webapp voor Systemcore en het FIRST Driver Station, terwijl deze onofficiële FTC-versie speciaal is aangepast om direct op het huidige FTC-besturingssysteem te draaien. Je kunt er zonder extra software live data mee bekijken via het FTC Dashboard-protocol.
