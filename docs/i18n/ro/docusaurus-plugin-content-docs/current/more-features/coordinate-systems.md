---
sidebar_position: 4
---

# 📐 Sisteme de coordonate {#coordinate-systems}

AdvantageScope oferă suport pentru mai multe sisteme de coordonate uzuale în filele [🗺️ Teren 2D](/tab-reference/2d-field) și [👀 Teren 3D](/tab-reference/3d-field). Consultă [documentația sistemului de coordonate WPILib](https://docs.wpilib.org/en/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system) pentru mai multe detalii despre convențiile de axe și rotație folosite de AdvantageScope.

### Personalizare {#customization}

În mod implicit, sistemul de coordonate este ales automat în funcție de imaginea sau modelul de teren selectat. Dacă vrei să folosești un alt sistem de coordonate pe toate terenurile, deschide fereastra de preferințe din `Aplicație` > `Afișează preferințele...` (Windows/Linux) sau `AdvantageScope` > `Setări...` (macOS) și schimbă opțiunea „Sistem de coordonate”.

:::tip
Toate opțiunile pentru sistemul de coordonate sunt compatibile atât cu terenurile FRC, cât și cu cele FTC.
:::

## Centru/roșu (Systemcore) {#center-red}

Originea se află în centrul terenului, cu axa +X orientată în direcția opusă peretelui alianței roșii, ca în imaginea de mai jos. **Acesta este sistemul de coordonate implicit pentru terenurile FRC începând cu 2027 și pentru terenurile FTC începând cu sezonul 2027-2028.**

<img src="/img/more-features/coordinate-system-center-red.webp" alt="Sistem de coordonate centru/roșu" />

## Peretele albastru {#blue-wall}

Originea se află în colțul din dreapta al peretelui alianței albastre, cu axa +X orientată spre peretele alianței roșii, ca în imaginea de mai jos. **Acesta este sistemul de coordonate implicit pentru terenurile FRC din 2023 până în 2026.**

<img src="/img/more-features/coordinate-system-blue-wall.webp" alt="Sistem de coordonate perete albastru" />

## Peretele alianței {#alliance-wall}

Originea se află în colțul din dreapta al peretelui alianței pentru _alianța curentă a robotului_, cu axa +X orientată spre peretele alianței opuse, ca în imaginea de mai jos. **Acesta este sistemul de coordonate implicit pentru FRC în 2022.**

<img src="/img/more-features/coordinate-system-alliance-wall.webp" alt="Sistem de coordonate perete alianță" />

## Centru/rotit {#center-rotated}

Originea se află în centrul terenului, cu axa +X orientată spre dreapta din perspectiva peretelui alianței roșii, ca în imaginea de mai jos. **Acesta este sistemul de coordonate implicit pentru terenurile FTC din 2024-2025 până în 2026-2027.**

<img src="/img/more-features/coordinate-system-center-rotated.webp" alt="Sistem de coordonate centru/rotit" height="400" />
