---
sidebar_position: 4
---

# 📐 Coördinatenstelsels {#coordinate-systems}

AdvantageScope biedt ondersteuning voor verschillende veelgebruikte coördinatenstelsels op de tabbladen [🗺️ 2D-veld](/tab-reference/2d-field) en [👀 3D-veld](/tab-reference/3d-field). Raadpleeg de [WPILib-documentatie over coördinatenstelsels](https://docs.wpilib.org/en/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system) voor meer informatie over de door AdvantageScope gebruikte as- en rotatieconventies.

### Aanpassing {#customization}

Standaard wordt het coördinatenstelsel automatisch geselecteerd op basis van de gekozen veldafbeelding of het veldmodel. Om een ander coördinatenstelsel te selecteren voor gebruik op alle velden, open je het voorkeurenvenster door te klikken op `App` > `Voorkeuren tonen...` (Windows/Linux) of `AdvantageScope` > `Instellingen...` (macOS) en wijzig je de optie "Coördinatenstelsel".

:::tip
Alle opties voor het coördinatenstelsel zijn compatibel met zowel FRC- als FTC-velden.
:::

## Midden/rood (Systemcore) {#center-red}

De oorsprong bevindt zich in het midden van het veld, waarbij de +X-as van de rode alliantiemuur af wijst, zoals hieronder weergegeven. **Dit is het standaard coördinatenstelsel voor FRC-velden vanaf 2027 en FTC-velden vanaf 2027-2028.**

<img src="/img/more-features/coordinate-system-center-red.webp" alt="Coördinatenstelsel Midden/rood" />

## Blauwe muur {#blue-wall}

De oorsprong bevindt zich in de uiterst rechtse hoek van de blauwe alliantiemuur, waarbij de +X-as naar de rode alliantiemuur wijst, zoals hieronder weergegeven. **Dit is het standaard coördinatenstelsel voor FRC-velden van 2023 tot 2026.**

<img src="/img/more-features/coordinate-system-blue-wall.webp" alt="Coördinatenstelsel Blauwe muur" />

## Alliantiemuur {#alliance-wall}

De oorsprong bevindt zich in de uiterst rechtse hoek van de alliantiemuur voor de _huidige alliantie van de robot_, waarbij de +X-as naar de tegenoverliggende alliantiemuur wijst, zoals hieronder weergegeven. **Dit is het standaard coördinatenstelsel voor FRC in 2022.**

<img src="/img/more-features/coordinate-system-alliance-wall.webp" alt="Coördinatenstelsel Alliantiemuur" />

## Midden/geroteerd {#center-rotated}

De oorsprong bevindt zich in het midden van het veld, waarbij de +X-as naar rechts wijst vanuit het perspectief van de rode alliantiemuur, zoals hieronder weergegeven. **Dit is het standaard coördinatenstelsel voor FTC-velden van 2024-2025 tot 2026-2027.**

<img src="/img/more-features/coordinate-system-center-rotated.webp" alt="Coördinatenstelsel Midden/geroteerd" height="400" />
