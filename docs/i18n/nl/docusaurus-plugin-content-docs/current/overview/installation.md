---
sidebar_position: 1
---

# 📦 Installatie {#installation}

De officieel ondersteunde versie van AdvantageScope is rechtstreeks verkrijgbaar via Team 6328 of via het WPILib-installatieprogramma. Er zijn ook verschillende onofficiële distributies beschikbaar.

## Team 6328 {#team-6328}

### Downloads: [Stabiel](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest), [Prerelease](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

Het rechtstreeks downloaden van AdvantageScope via Team 6328 biedt:

- De nieuwste functies en bugfixes voordat ze via andere kanalen beschikbaar zijn.
- Meldingen in de app wanneer er een nieuwe versie beschikbaar is om te downloaden.
- Een ingebouwde verzameling recente robotmodellen van 6328 voor gebruik op het tabblad 👀 [3D-veld](/tab-reference/3d-field).

:::note
Voordat je AppImage-builds uitvoert op Ubuntu 23.10 of nieuwer, moet je het AppArmor-profiel downloaden van de releases-pagina en dit kopiëren naar /etc/apparmor.d.
:::

:::info
Elke hoofdversie van AdvantageScope wordt uitgebracht in januari vóór de FRC-kickoff, met een versienummer dat overeenkomt met het jaar (bijv. v26.0.0 werd uitgebracht in januari 2026). Bèta- en alfaversies van AdvantageScope kunnen beschikbaar zijn in de maanden voorafgaand aan elke release, voor teams die willen experimenteren met nieuwe functies en feedback willen geven. **Teams die deze prerelease-versies gebruiken, moeten rekening houden met problemen en bugs die niet aanwezig zijn in stabiele versies.**
:::

## WPILib {#wpilib}

### Installatie: [WPILib-documentatie](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

Het WPILib-installatieprogramma bevat een recente release van AdvantageScope, maar kan achterlopen op de nieuwste versie die beschikbaar is voor directe download. Documentatie voor het starten van AdvantageScope vanuit de WPILib-versie van VSCode is [hier](https://docs.wpilib.org/en/stable/docs/software/dashboards/advantagescope.html) te vinden.

## Onofficiële distributies {#unofficial-distributions}

Onofficiële distributies van AdvantageScope zijn verkrijgbaar via verschillende bronnen, die niet officieel worden ondersteund door de ontwikkelaars van AdvantageScope/WPILib. Deze distributies kunnen achterlopen op de nieuwste versie van AdvantageScope die beschikbaar is via officiële bronnen. Neem bij problemen rechtstreeks contact op met de beheerders.

- [**AdvantageScope Lite voor REV Control System:**](https://github.com/j5155/AdvantageScope-Lite-FTC) Een aanpassing van [AdvantageScope Lite](/more-features/advantagescope-lite) voor gebruik op het bestaande (pre-Systemcore) FTC-besturingssysteem.
- [**Homebrew-installatieprogramma:**](https://formulae.brew.sh/cask/advantagescope) Een Homebrew-cask voor het installeren van AdvantageScope via de opdrachtregel op macOS.
- [**Arch User Repository:**](https://aur.archlinux.org/packages/advantagescope) Een alternatieve distributiemethode voor gebruik met de pakketbeheerder pacman (een officiële Arch-distributie van AdvantageScope is [hier](#6328-downloads) beschikbaar).
