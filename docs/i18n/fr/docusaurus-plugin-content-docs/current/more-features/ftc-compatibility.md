---
sidebar_position: 1
---

# ✴️ Compatibilité FTC {#ftc-compatibility}

AdvantageScope inclut des fonctionnalités permettant d'offrir une expérience fluide sur le système de contrôle existant de la FIRST Tech Challenge, tout en préparant la transition vers [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) lors des prochaines saisons. Toutes les fonctionnalités d'AdvantageScope seront officiellement prises en charge dans FTC après la transition vers Systemcore à partir de la saison 2027-2028.

## Terrains et robots {#fields-and-robots}

Les terrains et les modèles de robot FTC sont entièrement pris en charge de manière native.

- **Modèles de terrain et de robot :** Sélectionnez les terrains et les modèles de robot FTC sur les onglets 🗺️ [Terrain 2D](/tab-reference/2d-field) et 👀 [Terrain 3D](/tab-reference/3d-field) directement depuis les menus déroulants. Tous les terrains sont compatibles avec [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- **Systèmes de coordonnées :** Configurez le [système de coordonnées](/more-features/coordinate-systems) pour la compatibilité avec les [coordonnées FTC standard](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) sur n'importe quel terrain. Ce système de coordonnées est utilisé par défaut sur les terrains FTC.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## Formats pris en charge {#supported-formats}

AdvantageScope inclut une prise en charge native du format de diffusion en direct de **FTC Dashboard** et des fichiers `.log` de **Road Runner**, en plus des formats compatibles WPILib tels que WPILOG et NetworkTables.

Plusieurs bibliothèques de journalisation et de télémesure FTC tierces produisent des données dans des formats compatibles avec AdvantageScope. Les développeurs d'AdvantageScope n'approuvent ni ne recommandent aucune solution de journalisation FTC particulière, et vous pouvez rencontrer des capacités limitées lors de l'utilisation de certaines solutions de journalisation.

La liste ci-dessous constitue un point de départ, mais n'est pas exhaustive :

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/) : Génère des fichiers journaux pour déboguer la logique de planification de trajectoire.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/) : Diffuse des données de télémesure en direct compatibles à la fois avec son propre tableau de bord et AdvantageScope.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver) : Permet la journalisation personnalisée des données vers plusieurs formats, notamment les fichiers journaux et la diffusion en direct.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log) : Enregistre les données au format WPILOG à l'aide d'annotations.
- **PsiKit** : Un framework de journalisation et de relecture pour FTC inspiré d'AdvantageKit.

:::warning
Les équipes doivent veiller à respecter la règle R704 lors des compétitions. Les services de télémesure tiers tels que FTC Dashboard sont interdits lorsqu'ils sont connectés par Wi-Fi lors des compétitions.
:::

### AdvantageScope Lite pour FTC {#advantagescope-lite-for-ftc}

Une distribution non officielle d'[AdvantageScope Lite](/more-features/advantagescope-lite) optimisée pour FTC est disponible : [**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). Cette distribution n'est pas officielle et n'est pas prise en charge par les développeurs d'AdvantageScope.

Alors que la version standard d'[AdvantageScope Lite](/more-features/advantagescope-lite) est une application web conçue pour être utilisée sur Systemcore et la console de pilotage FIRST, la distribution FTC non officielle est spécifiquement modifiée pour être utilisée directement sur le système de contrôle FTC existant. Elle prend en charge de manière native la visualisation des données en direct via le protocole FTC Dashboard sans nécessiter de logiciel supplémentaire.
