---
sidebar_position: 3
---

# 📐 Systèmes de coordonnées

AdvantageScope prend en charge plusieurs systèmes de coordonnées courants sur les onglets [🗺️ Terrain 2D](/tab-reference/2d-field) et [👀 Terrain 3D](/tab-reference/3d-field). Veuillez consulter la [documentation sur le système de coordonnées WPILib](https://docs.wpilib.org/en/stable/docs/software/basic-programming/coordinate-system.html#wpilib-coordinate-system) pour plus d'informations sur les conventions d'axe et de rotation utilisées par AdvantageScope.

### Personnalisation

Par défaut, le système de coordonnées est sélectionné automatiquement en fonction de l'image/modèle de terrain choisi. Pour sélectionner un système de coordonnées différent à utiliser sur tous les terrains, ouvrez la fenêtre des préférences en cliquant sur `Application` > `Afficher les préférences...` (Windows/Linux) ou `AdvantageScope` > `Paramètres...` (macOS) et modifiez l'option « Système de coordonnées ».

:::tip
Toutes les options de système de coordonnées sont compatibles avec les terrains FRC et FTC.
:::

## Centre/rouge (Systemcore) {#centerred-systemcore}

L'origine se trouve au centre du terrain avec l'axe +X pointé à l'opposé du mur d'alliance rouge, comme illustré ci-dessous. **Il s'agit du système de coordonnées par défaut pour les terrains FRC à partir de 2027 et les terrains FTC à partir de 2027-2028.**

<img src="/img/more-features/coordinate-system-center-red.png" alt="Système de coordonnées Centre/rouge" />

## Mur bleu

L'origine se trouve dans le coin le plus à droite du mur d'alliance bleue avec l'axe +X faisant face au mur d'alliance rouge, comme illustré ci-dessous. **Il s'agit du système de coordonnées par défaut pour les terrains FRC de 2023 à 2026.**

<img src="/img/more-features/coordinate-system-blue-wall.png" alt="Système de coordonnées Mur bleu" />

## Mur d'alliance

L'origine se trouve dans le coin le plus à droite du mur d'alliance pour l'_alliance actuelle du robot_ avec l'axe +X faisant face au mur d'alliance opposé, comme illustré ci-dessous. **Il s'agit du système de coordonnées par défaut pour la FRC en 2022.**

<img src="/img/more-features/coordinate-system-alliance-wall.png" alt="Système de coordonnées Mur d'alliance" />

## Centre/pivoté

L'origine se trouve au centre du terrain avec l'axe +X pointé vers la droite du point de vue du mur d'alliance rouge, comme illustré ci-dessous. **Il s'agit du système de coordonnées par défaut pour les terrains FTC de 2024-2025 à 2026-2027.**

<img src="/img/more-features/coordinate-system-center-rotated.png" alt="Système de coordonnées Centre/pivoté" height="400" />
