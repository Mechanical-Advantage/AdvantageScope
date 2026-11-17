---
sidebar_position: 4
---

# 📐 Systèmes de coordonnées {#coordinate-systems}

AdvantageScope prend en charge plusieurs systèmes de coordonnées courants dans les onglets [🗺️ Terrain 2D](/tab-reference/2d-field) et [👀 Terrain 3D](/tab-reference/3d-field). Pour en savoir plus sur les conventions d'axes et de rotation utilisées par AdvantageScope, consultez la [documentation WPILib sur le système de coordonnées](https://docs.wpilib.org/fr/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system).

### Personnalisation {#customization}

Par défaut, le système de coordonnées s'adapte automatiquement à l'image ou au modèle de terrain sélectionné. Si vous souhaitez imposer un même système de coordonnées sur tous les terrains, ouvrez les préférences via `App` > `Afficher les préférences...` (Windows/Linux) ou `AdvantageScope` > `Paramètres...` (macOS) et modifiez l'option « Système de coordonnées ».

:::tip
Toutes les options de système de coordonnées sont compatibles aussi bien avec les terrains FRC que FTC.
:::

## Centre/rouge (Systemcore) {#center-red}

L'origine est placée au centre du terrain, avec l'axe +X dirigé à l'opposé du mur de l'alliance rouge, comme illustré ci-dessous. **C'est le système de coordonnées par défaut pour les terrains FRC à partir de 2027 et les terrains FTC à partir de la saison 2027-2028.**

<img src="/img/more-features/coordinate-system-center-red.webp" alt="Système de coordonnées centre/rouge" />

## Mur bleu {#blue-wall}

L'origine se situe dans le coin le plus à droite du mur de l'alliance bleue, avec l'axe +X pointant vers le mur de l'alliance rouge, comme illustré ci-dessous. **C'est le système de coordonnées par défaut pour les terrains FRC de 2023 à 2026.**

<img src="/img/more-features/coordinate-system-blue-wall.webp" alt="Système de coordonnées mur bleu" />

## Mur d'alliance {#alliance-wall}

L'origine se trouve dans le coin le plus à droite du mur de l'alliance _actuelle du robot_, avec l'axe +X pointant vers le mur d'alliance opposé, comme illustré ci-dessous. **C'est le système de coordonnées par défaut pour la FRC en 2022.**

<img src="/img/more-features/coordinate-system-alliance-wall.webp" alt="Système de coordonnées mur d'alliance" />

## Centre/pivoté {#center-rotated}

L'origine est placée au centre du terrain, avec l'axe +X pointant vers la droite lorsqu'on regarde depuis le mur de l'alliance rouge, comme illustré ci-dessous. **C'est le système de coordonnées par défaut pour les terrains FTC de 2024-2025 à 2026-2027.**

<img src="/img/more-features/coordinate-system-center-rotated.webp" alt="Système de coordonnées centre/pivoté" height="400" />
