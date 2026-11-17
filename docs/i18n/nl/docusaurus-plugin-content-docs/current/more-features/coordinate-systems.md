---
sidebar_position: 4
---

# 📐 Coördinatenstelsels {#coordinate-systems}

AdvantageScope ondersteunt verschillende veelgebruikte coördinatenstelsels op de tabbladen [🗺️ 2D-veld](/tab-reference/2d-field) en [👀 3D-veld](/tab-reference/3d-field). Meer informatie over hoe de assen en rotaties werken vind je in de [WPILib-documentatie over coördinatenstelsels](https://docs.wpilib.org/en/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system).

### Aanpassen {#customization}

Standaard kiest AdvantageScope automatisch het coördinatenstelsel dat bij de gekozen veldafbeelding of het gekozen veldmodel past. Wil je op alle velden hetzelfde vaste coördinatenstelsel gebruiken? Open dan de voorkeuren via `App` > `Voorkeuren tonen...` (Windows/Linux) of `AdvantageScope` > `Instellingen...` (macOS) en wijzig de optie "Coördinatenstelsel".

:::tip
Alle coördinatenstelsels werken op zowel FRC- als FTC-velden.
:::

## Midden/rood (Systemcore) {#center-red}

De oorsprong ligt in het midden van het veld en de +X-as wijst van de rode alliantiemuur af, zoals je hieronder ziet. **Dit is het standaard coördinatenstelsel voor FRC-velden vanaf 2027 en FTC-velden vanaf 2027-2028.**

<img src="/img/more-features/coordinate-system-center-red.webp" alt="Coördinatenstelsel Midden/rood" />

## Blauwe muur {#blue-wall}

De oorsprong ligt in de uiterst rechtse hoek van de blauwe alliantiemuur en de +X-as wijst naar de rode alliantiemuur, zoals je hieronder ziet. **Dit is het standaard coördinatenstelsel voor FRC-velden van 2023 tot 2026.**

<img src="/img/more-features/coordinate-system-blue-wall.webp" alt="Coördinatenstelsel Blauwe muur" />

## Alliantiemuur {#alliance-wall}

De oorsprong ligt in de uiterst rechtse hoek van de alliantiemuur van _de huidige alliantie van de robot_ en de +X-as wijst naar de tegenoverliggende alliantiemuur, zoals je hieronder ziet. **Dit is het standaard coördinatenstelsel voor FRC in 2022.**

<img src="/img/more-features/coordinate-system-alliance-wall.webp" alt="Coördinatenstelsel Alliantiemuur" />

## Midden/geroteerd {#center-rotated}

De oorsprong ligt in het midden van het veld en de +X-as wijst naar rechts vanuit het perspectief van de rode alliantiemuur, zoals je hieronder ziet. **Dit is het standaard coördinatenstelsel voor FTC-velden van 2024-2025 tot 2026-2027.**

<img src="/img/more-features/coordinate-system-center-rotated.webp" alt="Coördinatenstelsel Midden/geroteerd" height="400" />
