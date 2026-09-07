---
sidebar_position: 1
---

# ✴️ FTC-compatibiliteit {#ftc-compatibility}

AdvantageScope bevat functies om een soepele ervaring te bieden op het bestaande besturingssysteem van FIRST Tech Challenge, terwijl een overgang naar [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) in toekomstige seizoenen wordt voorbereid. Alle functies van AdvantageScope worden officieel ondersteund in FTC na de overgang naar Systemcore vanaf het seizoen 2027-2028.

## Velden en robots {#fields-and-robots}

FTC-velden en -robotmodellen worden standaard volledig ondersteund.

- **Veld- en robotmodellen:** Selecteer FTC-velden en -robotmodellen op de tabbladen 🗺️ [2D-veld](/tab-reference/2d-field) en 👀 [3D-veld](/tab-reference/3d-field) rechtstreeks vanuit de vervolgkeuzemenu's. Alle velden zijn compatibel met [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- **Coördinatenstelsels:** Configureer het [coördinatenstelsel](/more-features/coordinate-systems) voor compatibiliteit met [standaard FTC-coördinaten](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) op elk veld. Dit coördinatenstelsel wordt standaard gebruikt op FTC-velden.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## Ondersteunde formaten {#supported-formats}

AdvantageScope biedt native ondersteuning voor het live-streamingformaat van **FTC Dashboard** en `.log`-bestanden van **Road Runner**, naast met WPILib compatibele formaten zoals WPILOG en NetworkTables.

Verschillende externe FTC-logging- en telemetriebibliotheken produceren data in formaten die compatibel zijn met AdvantageScope. De AdvantageScope-ontwikkelaars bevelen geen specifieke FTC-loggingoplossing aan, en je kunt beperkte mogelijkheden tegenkomen bij het gebruik van sommige loggingoplossingen.

De onderstaande lijst biedt een uitgangspunt, maar is niet uitputtend:

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): Genereert logbestanden om padplanningslogica te debuggen.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/): Streamt live-telemetrie die compatibel is met zowel het eigen dashboard als AdvantageScope.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): Maakt aangepaste datalogging mogelijk naar meerdere formaten, waaronder logbestanden en live-streaming.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): Slaat data op in het WPILOG-formaat met behulp van annotaties.
- **PsiKit**: Een logging- en herhalingsframework voor FTC geïnspireerd op AdvantageKit.

:::warning
Teams moeten ervoor zorgen dat ze tijdens wedstrijden aan regel R704 voldoen. Externe telemetriediensten zoals FTC Dashboard zijn verboden wanneer er tijdens wedstrijden verbinding wordt gemaakt via wifi.
:::

### AdvantageScope Lite voor FTC {#advantagescope-lite-for-ftc}

Er is een onofficiële distributie van [AdvantageScope Lite](/more-features/advantagescope-lite) beschikbaar die is geoptimaliseerd voor FTC: [**AdvantageScope Lite voor REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). Deze distributie is onofficieel en wordt niet ondersteund door de ontwikkelaars van AdvantageScope.

Terwijl de standaard [AdvantageScope Lite](/more-features/advantagescope-lite) een web-app is die is ontworpen voor gebruik op Systemcore en het FIRST Driver Station, is de onofficiële FTC-distributie specifiek aangepast voor direct gebruik op het bestaande FTC-besturingssysteem. Het biedt native ondersteuning voor het live bekijken van data via het FTC Dashboard-protocol zonder dat er aanvullende software nodig is.
