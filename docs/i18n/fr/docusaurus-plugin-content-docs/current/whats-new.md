---
title: Quoi de neuf en 2026?
sidebar_position: 2
draft: true
---

#

<img src="/img/whats-new/banner-light.webp" className="light-only" />
<img src="/img/whats-new/banner-dark.webp" className="dark-only" />

La version 2026 d'AdvantageScope est maintenant disponible! Consultez le [guide d'installation](/overview/installation) et le [journal complet des modifications](https://github.com/Mechanical-Advantage/AdvantageScope/releases) pour en savoir plus. Cette mise à jour apporte plusieurs nouveautés majeures ainsi que de nombreuses améliorations dans toute l'application. Plusieurs de ces ajouts visent à améliorer votre expérience sur les systèmes de contrôle actuels tout en préparant une transition fluide vers [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) pour les prochaines saisons.

**Vos retours sont essentiels! N'hésitez pas à partager vos commentaires, suggestions et rapports de bogues sur la [page des problèmes](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

## ✴️ Expérimental : prise en charge de FTC {#ftc-support}

En prévision d'une prise en charge complète de Systemcore pour la saison 2027-2028, cette version ajoute plusieurs fonctionnalités pour améliorer la compatibilité avec le système de contrôle actuel de FIRST Tech Challenge :

- Les terrains et modèles de robots FTC dans les onglets 🗺️ [Terrain 2D](/tab-reference/2d-field) et 👀 [Terrain 3D](/tab-reference/3d-field)
- De nouvelles options de [système de coordonnées](/more-features/coordinate-systems) compatibles avec les [coordonnées FTC standard](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html)
- La prise en charge des fichiers journaux [Road Runner](https://rr.brott.dev/docs/v1-0/installation/)
- La prise en charge du format de diffusion en direct [FTC Dashboard](https://github.com/acmerobotics/ftc-dashboard)

:::tip
Les équipes FTC doivent rester prudentes lorsqu'elles utilisent des logiciels expérimentaux en saison officielle. La prise en charge de FTC dans AdvantageScope est toujours en cours de développement.
:::

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

Plusieurs bibliothèques FTC tierces de journalisation et de télémétrie gèrent d'autres formats compatibles avec AdvantageScope, comme WPILOG et RLOG. Vous trouverez leur documentation dans leurs dépôts respectifs; l'équipe d'AdvantageScope ne recommande ni ne privilégie aucune solution de journalisation FTC en particulier.

:::info
AdvantageScope offre la meilleure expérience lorsqu'elle est utilisée avec le framework WPILib et ses outils de journalisation. Vous pourriez rencontrer des problèmes de compatibilité ou des limites fonctionnelles avec des solutions de journalisation non officielles.

Toutes les fonctionnalités d'AdvantageScope seront officiellement prises en charge en FTC après la transition vers Systemcore pour la saison 2027-2028.
:::

## 🧮 Graphiques avec unités {#unit-aware-graphing}

L'onglet 📉 [Graphique linéaire](/tab-reference/line-graph/) a été entièrement repensé pour gérer les unités automatiquement. Cela ouvre plusieurs possibilités lorsque vous tracez des champs numériques :

- Étiquetage précis des axes Y et des valeurs affichées
- Conversion rapide vers des unités compatibles (sans fenêtre contextuelle)
- Conversion automatique des unités compatibles sur un même axe
- Affichage exact des unités après [intégration et dérivation](/tab-reference/line-graph/#integration-and-differentiation)

La capture d'écran ci-dessous illustre toutes ces nouveautés. Remarquez que l'axe gauche regroupe des champs exprimés dans diverses unités de vitesse angulaire, tandis que l'axe droit affiche des valeurs dérivées dans une autre unité que celle d'origine (en degrés). Il est aussi plus simple que jamais de choisir vos unités grâce aux options intégrées directement dans le menu de contrôle de chaque axe.

_Pour en savoir plus sur la gestion des unités, consultez la [documentation](/tab-reference/line-graph/units)._

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Graphiques avec unités" />

_L'interface en anglais est illustrée ci-dessus._

## 🏁 Téléchargements de journaux plus rapides {#faster-log-downloads}

Le [téléchargement des journaux depuis la roboRIO](/overview/log-files/#downloading-from-the-robot) est désormais **2 à 4 fois plus rapide** qu'auparavant. Ce gain vient du passage au protocole FTP, qui demande moins de ressources CPU à la roboRIO lors du transfert.

Le tableau ci-dessous compare les vitesses de transfert mesurées entre les versions 2025 et 2026 d'AdvantageScope par câble Ethernet (bande passante maximale de 100 Mb/s). On constate que la version 2025 était fortement ralentie lorsque le processeur de la roboRIO était sollicité.

|                                                       | 2025 (SFTP) | 2026 (FTP) | Gain                                             |
| ----------------------------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| Charge CPU élevée<br /><sub>Code robot complexe</sub> | 25 Mb/s     | 80 Mb/s    | <span style={{fontSize: '24px'}}>**3,2x**</span> |
| Charge CPU moyenne<br /><sub>Code robot normal</sub>  | 40 Mb/s     | 90 Mb/s    | <span style={{fontSize: '22px'}}>**2,3x**</span> |
| Charge CPU minimale<br /><sub>Sans code robot</sub>   | 90 Mb/s     | 95 Mb/s    | <span style={{fontSize: '20px'}}>**1,1x**</span> |

## 📁 Téléchargement de journaux depuis des sous-dossiers {#download-logs-from-subfolders}

La fenêtre de téléchargement permet maintenant de récupérer des journaux rangés dans des sous-dossiers. Chaque sous-dossier peut être téléchargé d'un seul bloc, ce qui simplifie grandement la récupération des fichiers produits par la version 2026 du [Signal Logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) de CTRE (qui répartit ses données dans des sous-dossiers faute de pouvoir tout stocker dans un seul fichier).

<img src="/img/whats-new/subfolders.webp" alt="Téléchargement des sous-dossiers de journaux" height="450" />

## 🌈 Nouvelles options de visualisation {#new-visualization-options}

Les onglets 🗺️ [Terrain 2D](/tab-reference/2d-field) et 👀 [Terrain 3D](/tab-reference/3d-field) gagnent plusieurs options de visualisation :

- Le terrain 2D propose davantage de couleurs de pare-chocs, et chaque objet peut recevoir sa propre couleur. Il devient ainsi beaucoup plus facile de distinguer vos fantômes de vos différents robots.
- Lors de la [visualisation de mécanismes 2D sur le terrain 3D](/tab-reference/3d-field/#2d-mechanisms), vous pouvez maintenant placer vos mécanismes sur le plan YZ en plus du plan XZ, ce qui facilite l'observation des mécanismes se déplaçant sur plusieurs axes.
- Le terrain 3D propose désormais un anticrénelage optionnel pour lisser les contours des modèles 3D.

<img src="/img/whats-new/field-viz.jpg" alt="Nouvelles visualisations de terrain" />

## 🪵 Prise en charge des journaux CAN REV Robotics {#rev-robotics-can-log-support}

Vous pouvez maintenant ouvrir directement dans AdvantageScope les fichiers `.revlog` générés par le [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) de REV Robotics. Ces fichiers enregistrent les signaux CAN des contrôleurs Spark Max et Spark Flex, offrant une alternative officielle à la bibliothèque [URCL](/more-features/urcl) d'AdvantageScope.

URCL et `StatusLogger` resteront tous deux disponibles pendant la saison 2026 pour assurer une transition en douceur et conserver les mêmes fonctionnalités que les saisons précédentes. Nous communiquerons plus tard sur les options de journalisation pour 2027 et les saisons suivantes.

<img src="/img/whats-new/revlog.webp" alt="Visualisation REVLOG" />

## 💿 Importation de fichiers CSV {#csv-file-imports}

Pour visualiser plus facilement des données qui ne proviennent pas d'un framework de journalisation robotique, AdvantageScope prend désormais en charge l'importation de fichiers CSV. Consultez la [documentation](/overview/log-files/#csv-formatting) pour connaître les formats acceptés et les limites actuelles.

<img src="/img/overview/log-files/export-2.webp" alt="Données CSV" />

## 🤩 Améliorations esthétiques {#aesthetic-improvements}

Sous Windows 11, l'interface d'AdvantageScope adopte une barre latérale translucide, jusque-là réservée à macOS. Une nouvelle icône d'application est également proposée pour macOS Tahoe, inspirée du style Liquid Glass d'Apple.

<img src="/img/whats-new/windows-ui.webp" alt="Interface utilisateur Windows" />

## 📋 Menus simplifiés {#streamlined-menus}

La barre de menus et les contrôles associés ont été simplifiés et réorganisés pour être plus accessibles et cohérents sur toutes les plateformes. Parmi les principales améliorations :

- Passage plus rapide d'une source en direct à l'autre (par exemple NetworkTables et [Diagnostics Phoenix](/overview/live-sources/phoenix-diagnostics)), sans devoir ouvrir les préférences.
- Clic droit dans la barre latérale pour copier rapidement le nom d'un champ ou sa clé complète.
- Réorganisation de la fenêtre des préférences pour retrouver chaque option en un clin d'œil.

<div className="image-gallery">
  <img src="/img/whats-new/menus-1.webp" />
  <img src="/img/whats-new/menus-2.webp" />
  <img src="/img/prefs_fr.webp" />
</div>

## 🐛 Améliorations de la stabilité {#stability-improvements}

Cette version apporte de nombreuses corrections de bogues et améliorations de stabilité dans toute l'application. Vous trouverez la liste complète dans le [journal des modifications](https://github.com/Mechanical-Advantage/AdvantageScope/releases), mais voici quelques correctifs importants :

- Amélioration nette des performances lors de la diffusion de données en direct sur de longues périodes, en particulier dans l'onglet Graphique linéaire.
- Meilleure tolérance aux données inhabituelles, notamment aux fichiers journaux très volumineux et aux champs contenant de grandes quantités de données.
- Correction de plusieurs anomalies d'affichage lors de la navigation dans les journaux, surtout avec les filtres de l'onglet Graphique linéaire.
- Correction du tri des fichiers journaux AdvantageKit dans la fenêtre de téléchargement : les journaux sans horodatage apparaissent désormais en bas de la liste, comme pour les autres formats.
- Dans l'onglet Terrain 3D, les caméras du robot présentant une rotation non nulle sur l'axe de roulis s'affichent maintenant correctement.
- Amélioration de la stabilité d'AdvantageScope XR, notamment sous iOS/iPadOS 26. Pour les installations hors ligne, pensez à vérifier les mises à jour disponibles sur l'App Store.
