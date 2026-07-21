---
title: Quoi de neuf en 2026?
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-light.png" className="light-only" />
<img src="/img/whats-new/banner-dark.png" className="dark-only" />

La version 2026 d'AdvantageScope est maintenant disponible! Consultez la [documentation d'installation](/overview/installation) et le [journal complet des modifications](https://github.com/Mechanical-Advantage/AdvantageScope/releases) pour plus de détails. Cette version inclut plusieurs nouvelles fonctionnalités majeures et de nombreuses améliorations dans toute l'application. Bon nombre de ces fonctionnalités sont conçues pour améliorer l'expérience sur les systèmes de contrôle existants tout en préparant une transition en douceur vers [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) lors des prochaines saisons.

**Nous accordons de la valeur à vos commentaires! Les commentaires, demandes de fonctionnalités et rapports de bogues sont les bienvenus sur la [page des problèmes](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

## ✴️ Expérimental : Prise en charge de FTC {#ftc-support}

En préparation d'une prise en charge complète de Systemcore pour la saison 2027-2028, cette version ajoute plusieurs fonctionnalités pour améliorer la compatibilité avec le système de contrôle FIRST Tech Challenge existant :

- Les terrains et modèles de robots FTC sur le 🗺️ [Terrain 2D](/tab-reference/2d-field) et le 👀 [Terrain 3D](/tab-reference/3d-field)
- De nouvelles options de [système de coordonnées](/more-features/coordinate-systems) pour la compatibilité avec les [coordonnées FTC standard](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- La prise en charge des fichiers journaux [Road Runner](https://rr.brott.dev/docs/v1-0/installation/)
- La prise en charge du format de diffusion en direct [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard)

:::tip
Les équipes FTC doivent faire preuve de prudence lors de l'utilisation de logiciels expérimentaux pendant la saison officielle. La prise en charge de FTC pour AdvantageScope est toujours en développement actif.
:::

<div className="image-gallery">
  <img src="/img/whats-new/ftc-1.jpg" />
  <img src="/img/whats-new/ftc-2.jpg" />
  <img src="/img/whats-new/ftc-3.png" />
  <img src="/img/whats-new/ftc-4.png" />
  <img src="/img/whats-new/ftc-5.png" />
</div>

Plusieurs bibliothèques de journalisation/télémesure FTC tierces prennent en charge d'autres formats compatibles avec AdvantageScope, tels que WPILOG et RLOG. La documentation de ces bibliothèques se trouve dans les projets respectifs; les développeurs d'AdvantageScope n'approuvent ni ne recommandent aucune solution de journalisation FTC particulière pour une utilisation avec AdvantageScope.

:::info
AdvantageScope est conçue pour offrir la meilleure expérience lorsqu'elle est utilisée avec le framework WPILib et les outils de journalisation associés. Vous pouvez rencontrer des problèmes de compatibilité ou des capacités limitées lors de l'utilisation de solutions de journalisation non officielles.

Toutes les fonctionnalités d'AdvantageScope seront officiellement prises en charge dans FTC après la transition vers Systemcore pour la saison 2027-2028.
:::

## 🧮 Graphiques avec unités {#unit-aware-graphing}

L'onglet 📉 [Graphique linéaire](/tab-reference/line-graph/) a été repensé pour prendre entièrement en compte les unités. Cela permet plusieurs nouvelles capacités lors du tracé de champs numériques :

- L'étiquetage précis des axes Y et de l'affichage des valeurs
- La conversion rapide vers des unités compatibles (sans fenêtre surgissante)
- La conversion implicite des types d'unités compatibles au sein d'un seul axe
- L'affichage précis des unités [intégrées et différenciées](/tab-reference/line-graph/#integration--differentiation)

La capture d'écran ci-dessous montre toutes ces fonctionnalités en action. Notez que l'axe gauche comprend des champs avec différentes unités de vitesse angulaire, et que l'axe droit comprend des valeurs différenciées et affichées dans une unité non native (degrés). La sélection des unités est également plus facile que jamais, avec des options d'unités compatibles intégrées directement dans le menu de contrôle de chaque axe.

_Plus d'informations sur la prise en charge des unités se trouvent dans la [documentation](/tab-reference/line-graph/units)._

<img src="/img/tab-reference/line-graph/units-1.png" alt="Graphiques avec unités" />

## 🏁 Téléchargements de journaux plus rapides {#faster-log-downloads}

Le [téléchargement des journaux depuis la roboRIO](/overview/log-files/#downloading-from-the-robot) est maintenant **2 à 4 fois plus rapide** que dans les versions précédentes. Cela est réalisé en passant à un nouveau protocole (FTP) qui permet à la roboRIO de transférer des données de journal avec moins de charge CPU.

Le tableau ci-dessous montre la vitesse de transfert mesurée sur les versions 2025 et 2026 d'AdvantageScope lors d'une connexion via Ethernet (bande passante maximale de 100 Mb/s). Notez que les performances de la version 2025 sont fortement impactées par la charge CPU sur la roboRIO.

|                                                       | 2025 (SFTP) | 2026 (FTP) | Accélération                                     |
| ----------------------------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| Charge CPU élevée<br /><sub>Code robot complexe</sub> | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3,2x**</span> |
| Charge CPU moyenne<br /><sub>Code robot normal</sub>  | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2,3x**</span> |
| Charge CPU minimale<br /><sub>Sans code robot</sub>   | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1,1x**</span> |

## 📁 Télécharger les journaux depuis des sous-dossiers {#download-logs-from-subfolders}

La fenêtre de téléchargement prend désormais en charge l'enregistrement des journaux stockés dans des sous-dossiers. Chaque sous-dossier de journaux peut être téléchargé sous forme de groupe, offrant une approche simplifiée pour télécharger les journaux générés par la version 2026 du [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) de CTRE (qui utilise des sous-dossiers pour contourner l'impossibilité de stocker des données dans un seul fichier journal).

<img src="/img/whats-new/subfolders.png" alt="Téléchargement des sous-dossiers de journaux" height="450" />

## 🌈 Nouvelles options de visualisation {#new-visualization-options}

Plusieurs nouvelles options de visualisation sont prises en charge sur le 🗺️ [Terrain 2D](/tab-reference/2d-field) et le 👀 [Terrain 3D](/tab-reference/3d-field) :

- Une plus grande variété de couleurs de pare-chocs de robot est désormais disponible sur le terrain 2D, et chaque objet peut être configuré avec sa propre couleur. Cela permet une plus grande flexibilité lors de la combinaison de fantômes avec plusieurs objets de robot.
- Lors de la [visualisation de mécanismes 2D sur le terrain 3D](/tab-reference/3d-field/#2d-mechanisms), les mécanismes peuvent désormais être placés sur le plan YZ en plus du plan XZ. Cela permet une visualisation plus facile de mécanismes complexes avec des mouvements sur plusieurs axes.
- Le terrain 3D prend désormais en charge l'anticrénelage optionnel pour améliorer la qualité des bords rendus.

<img src="/img/whats-new/field-viz.jpg" alt="Nouvelles visualisations de terrain" />

## 🪵 Prise en charge des journaux REV Robotics CAN {#rev-robotics-can-log-support}

Vous pouvez désormais ouvrir des fichiers `.revlog` produits par le [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) de REV Robotics directement dans AdvantageScope. Ces fichiers enregistrent les signaux CAN des appareils Spark Max et Spark Flex, offrant une alternative officielle à la bibliothèque [URCL](/more-features/urcl) d'AdvantageScope.

URCL et le `StatusLogger` officiel resteront tous deux disponibles pendant la saison 2026 pour assurer une transition en douceur et offrir une parité de fonctionnalités avec les saisons précédentes. Nous aurons plus de détails à partager sur les options de journalisation en 2027 et au-delà à une date ultérieure.

<img src="/img/whats-new/revlog.png" alt="Visualisation REVLOG" />

## 💿 Importations de fichiers CSV {#csv-file-imports}

Pour une visualisation plus flexible des données produites en dehors des frameworks de journalisation de robot, AdvantageScope inclut désormais une prise en charge de base pour l'importation de fichiers CSV. Consultez la [documentation](/overview/log-files/#csv-formatting) pour plus de détails sur les formats pris en charge et d'autres limitations.

<img src="/img/overview/log-files/export-2.png" alt="Données CSV" />

## 🤩 Améliorations esthétiques {#aesthetic-improvements}

L'interface utilisateur d'AdvantageScope sur Windows 11 a été mise à jour pour prendre en charge une barre latérale translucide, qui était auparavant exclusive aux versions macOS. Une icône d'application mise à jour est également disponible pour macOS Tahoe basée sur le matériau Liquid Glass d'Apple.

<img src="/img/whats-new/windows-ui.png" alt="Interface utilisateur Windows" />

## 📋 Menus simplifiés {#streamlined-menus}

La barre de menu et les contrôles associés ont été simplifiés et réorganisés pour rendre les contrôles plus accessibles et cohérents sur toutes les plates-formes. Les fonctionnalités notables incluent :

- Un basculement plus rapide entre les sources en direct (par exemple NetworkTables et les [Diagnostics Phoenix](/overview/live-sources/phoenix-diagnostics)), sans avoir besoin d'ouvrir la fenêtre des préférences.
- Faites un clic droit sur la barre latérale pour copier rapidement le nom d'un champ (ou la clé de champ complète).
- La réorganisation de la fenêtre des préférences, ce qui rend les options plus faciles à trouver rapidement.

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.png" />
  <img src="/img/whats-new/menus-2.png" />
  <img src="/img/prefs.png" />
</div>

## 🐛 Améliorations de la stabilité {#stability-improvements}

Cette version comprend une variété de corrections de bogues et d'améliorations de la stabilité dans toute l'application. La liste complète se trouve dans le [journal des modifications](https://github.com/Mechanical-Advantage/AdvantageScope/releases) de la version, mais certaines corrections notables sont énumérées ci-dessous :

- Les performances d'AdvantageScope lors de la diffusion de données pendant de longues périodes ont été grandement améliorées, en particulier lors de l'utilisation de l'onglet graphique linéaire.
- AdvantageScope est désormais plus tolérante aux données de journal inhabituelles, y compris les grands fichiers journaux et les grandes valeurs de champ.
- Divers dysfonctionnements visuels ont été corrigés lors de la navigation dans les données de journal, en particulier lors de l'utilisation de filtres sur l'onglet graphique linéaire.
- L'ordre des fichiers journaux AdvantageKit dans la fenêtre de téléchargement a été corrigé; les journaux sans horodatage sont désormais en bas de la liste, de manière similaire aux autres formats.
- Sur l'onglet terrain 3D, les caméras du robot avec une rotation non nulle sur l'axe du roulis sont désormais visualisées correctement.
- La stabilité d'AdvantageScope XR a été améliorée, en particulier lors de l'exécution sur iOS/iPadOS 26. Pour les installations hors ligne, consultez l'App Store pour les mises à jour disponibles.
