---
sidebar_position: 1
---

# ✴️ Compatibilité FTC {#ftc-compatibility}

AdvantageScope propose des fonctionnalités conçues pour offrir une expérience fluide sur le système de contrôle actuel de la FIRST Tech Challenge, tout en préparant la transition vers [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) pour les prochaines saisons. À partir de la saison 2027-2028 et du passage à Systemcore, l'ensemble des fonctionnalités d'AdvantageScope seront officiellement prises en charge en FTC.

## Terrains et robots {#fields-and-robots}

Les terrains et modèles de robot FTC sont entièrement pris en charge nativement.

- **Modèles de terrain et de robot :** sélectionnez directement les terrains et modèles de robot FTC depuis les menus déroulants des onglets 🗺️ [Terrain 2D](/tab-reference/2d-field) et 👀 [Terrain 3D](/tab-reference/3d-field). Tous ces terrains sont compatibles avec [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- **Systèmes de coordonnées :** configurez le [système de coordonnées](/more-features/coordinate-systems) pour assurer la compatibilité avec les [coordonnées FTC standard](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) sur n'importe quel terrain. Ce système de coordonnées est utilisé par défaut sur les terrains FTC.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## Formats pris en charge {#supported-formats}

AdvantageScope prend en charge nativement la diffusion en direct de **FTC Dashboard** et les fichiers `.log` de **Road Runner**, en plus des formats compatibles WPILib comme WPILOG et NetworkTables.

Plusieurs bibliothèques tierces de journalisation et de télémétrie pour FTC génèrent des données compatibles avec AdvantageScope. L'équipe de développement d'AdvantageScope ne recommande ni n'approuve aucune solution en particulier, et certaines bibliothèques peuvent offrir des fonctionnalités plus limitées.

Voici quelques points de départ (liste non exhaustive) :

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/) : génère des fichiers journaux pour déboguer la planification de trajectoires.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/) : diffuse de la télémétrie en direct compatible à la fois avec son propre tableau de bord et avec AdvantageScope.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver) : permet d'enregistrer des données personnalisées dans plusieurs formats, aussi bien dans des fichiers journaux qu'en diffusion en direct.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log) : enregistre des données au format WPILOG à l'aide d'annotations.
- **PsiKit** : un framework de journalisation et de relecture pour FTC inspiré d'AdvantageKit.

:::warning
En compétition, veillez à respecter la règle R704. Les services de télémesure tiers comme FTC Dashboard sont interdits lorsqu'ils fonctionnent via Wi-Fi pendant les matchs officiels.
:::

### AdvantageScope Lite pour FTC {#advantagescope-lite-for-ftc}

Une version non officielle d'[AdvantageScope Lite](/more-features/advantagescope-lite) optimisée pour FTC est disponible : [**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). Comme il s'agit d'une distribution non officielle, elle n'est pas prise en charge par les développeurs d'AdvantageScope.

Alors que la version standard d'[AdvantageScope Lite](/more-features/advantagescope-lite) est une application web pensée pour Systemcore et la console de pilotage FIRST, cette distribution non officielle est spécialement modifiée pour tourner directement sur le système de contrôle FTC actuel. Elle permet notamment de visualiser des données en direct via le protocole FTC Dashboard sans installer de logiciel supplémentaire.
