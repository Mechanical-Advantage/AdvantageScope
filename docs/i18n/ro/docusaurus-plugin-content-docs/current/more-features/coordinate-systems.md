---
sidebar_position: 3
---

# 📐 Sisteme de coordonate {#coordinate-systems}

AdvantageScope include suport pentru mai multe sisteme de coordonate comune pe filele [🗺️ Teren 2D](/tab-reference/2d-field) și [👀 Teren 3D](/tab-reference/3d-field). Consultați [documentația sistemului de coordonate WPILib](https://docs.wpilib.org/en/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system) pentru mai multe informații despre convențiile de axe și rotație utilizate de AdvantageScope.

### Personalizare {#customization}

În mod implicit, sistemul de coordonate este selectat automat pe baza imaginii/modelului de teren ales. Pentru a selecta un sistem de coordonate diferit pentru utilizare pe toate terenurile, deschideți fereastra de preferințe dând clic pe `Aplicație` > `Afișează preferințele...` (Windows/Linux) sau `AdvantageScope` > `Setări...` (macOS) și schimbați opțiunea „Sistem de coordonate”.

:::tip
Toate opțiunile sistemului de coordonate sunt compatibile atât cu terenurile FRC, cât și cu cele FTC.
:::

## Centru/roșu (Systemcore) {#center-red}

Originea se află în centrul terenului, cu axa +X orientată în direcția opusă peretelui alianței roșii, așa cum se arată mai jos. **Acesta este sistemul de coordonate implicit pentru terenurile FRC începând cu 2027 și terenurile FTC începând cu 2027-2028.**

<img src="/img/more-features/coordinate-system-center-red.png" alt="Center/red coordinate system" />

## Peretele albastru {#blue-wall}

Originea se află în colțul cel mai din dreapta al peretelui alianței albastre, cu axa +X orientată spre peretele alianței roșii, așa cum se arată mai jos. **Acesta este sistemul de coordonate implicit pentru terenurile FRC din 2023 până în 2026.**

<img src="/img/more-features/coordinate-system-blue-wall.png" alt="Blue wall coordinate system" />

## Peretele alianței {#alliance-wall}

Originea se află în colțul cel mai din dreapta al peretelui alianței pentru _alianța curentă a robotului_, cu axa +X orientată spre peretele alianței opuse, așa cum se arată mai jos. **Acesta este sistemul de coordonate implicit pentru FRC în 2022.**

<img src="/img/more-features/coordinate-system-alliance-wall.png" alt="Alliance wall coordinate system" />

## Centru/rotit {#center-rotated}

Originea se află în centrul terenului, cu axa +X orientată spre dreapta din perspectiva peretelui alianței roșii, așa cum se arată mai jos. **Acesta este sistemul de coordonate implicit pentru terenurile FTC din 2024-2025 până în 2026-2027.**

<img src="/img/more-features/coordinate-system-center-rotated.png" alt="Center/rotated coordinate system" height="400" />
