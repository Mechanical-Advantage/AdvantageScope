---
title: Nouveautés de 2027
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-2027-ltr-light.webp" className="light-only" />
<img src="/img/whats-new/banner-2027-ltr-dark.webp" className="dark-only" />

La version 2027 d'AdvantageScope est maintenant disponible ! Consultez la [documentation d'installation](/overview/installation) et le [journal des modifications complet](https://github.com/Mechanical-Advantage/AdvantageScope/releases) pour plus de détails. Cette version apporte plusieurs nouveautés majeures et de nombreuses améliorations dans toute l'application. C'est également la première version d'AdvantageScope à prendre entièrement en charge Systemcore.

**Vos retours sont précieux ! Vos commentaires, suggestions de fonctionnalités et rapports de bogues sont les bienvenus sur la [page des problèmes](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />

## 🍋‍🟩 Compatibilité Systemcore {#systemcore-compatibility}

AdvantageScope 2027 est conçu pour fonctionner de manière fluide avec le nouveau contrôleur de robot Systemcore et WPILib 2027 :

- L'adresse par défaut du robot est désormais `robot.local`, vous permettant de vous connecter en direct ou de télécharger des journaux sans configurer de numéro d'équipe. Les adresses USB et Wi-Fi de Systemcore peuvent également être sélectionnées depuis la barre de menus.
- Le [téléchargement des journaux](/overview/log-files#downloading-from-the-robot) prend désormais en charge SFTP pour Systemcore en plus de l'ancien téléchargement de journaux roboRIO.
- Ajout du système de coordonnées [Centre/rouge](/more-features/coordinate-systems#center-red) utilisé par les terrains FRC à partir de 2027 et les terrains FTC à partir de 2027-2028.
- Prise en charge des API `Telemetry` et `Tunables` de WPILib 2027, mise à jour des couleurs d'alerte et ajout d'une nouvelle [préférence d'affichage de l'horodatage](/more-features/timestamps) pour garder les horodatages de Systemcore faciles à lire.
- Un nouveau mode en direct [Diagnostics Systemcore](/overview/live-sources) se connecte directement au serveur NetworkTables intégré de Systemcore pour surveiller l'état du robot et les E/S matérielles sans aucun code utilisateur requis.

## 💡 AdvantageScope Lite {#advantagescope-lite}

[AdvantageScope Lite](/more-features/advantagescope-lite) apporte les outils de visualisation et d'analyse d'AdvantageScope directement dans votre navigateur web. Il est accessible depuis l'interface web de Systemcore ainsi que dans la FIRST Driver Station, **sans aucune installation requise**.

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/lHsak9Mmx2M" title="Démonstration d'AdvantageScope Lite" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 🎮 FIRST Driver Station {#first-driver-station}

AdvantageScope s'intègre étroitement avec la nouvelle [FIRST Driver Station](https://docs.wpilib.org/fr/latest/docs/software/firstdriverstation) pour simplifier les diagnostics de match :

- [AdvantageScope Lite](/more-features/advantagescope-lite) est accessible directement depuis le menu des paramètres de la FIRST Driver Station pour analyser les fichiers WPILOG produits par la DS.
- Utilisez l'application de bureau pour diffuser en temps réel l'état du match, les métriques de communication, la tension de la batterie et les entrées des manettes depuis une console de pilotage locale sans aucune configuration.
- L'ouverture d'un fichier `.wpilog` de la console de pilotage sur ordinateur vous propose d'ouvrir une fenêtre dédiée préconfigurée avec des onglets pour la sortie console, les métriques de communication, l'alimentation, l'utilisation du processeur et les manettes ([documentation](/overview/log-files#driver-station-layout)). Cette disposition est également utilisée par défaut dans AdvantageScope Lite pour la Driver Station.
- Consultez les journaux de console de la Driver Station dans l'onglet 💬 [Console](/tab-reference/console) avec mise en évidence automatique des avertissements/erreurs et prise en charge complète des [séquences d'échappement ANSI](/tab-reference/console#ansi-formatting) (couleurs et styles de texte).

<img src="/img/tutorials/taking-control-1.webp" alt="Ouverture d'AdvantageScope Lite depuis la FIRST Driver Station" />

_L'interface en anglais est illustrée ci-dessus._

## 🌐 Prise en charge des langues {#language-support}

AdvantageScope est désormais disponible en **14 langues** dans l'application de bureau, le site de documentation, les applications mobiles et AdvantageScope Lite : anglais (États-Unis), espagnol (Amérique latine), français, néerlandais, portugais (Brésil), roumain, turc, russe, kazakh, hébreu, arabe, hindi, chinois simplifié et chinois traditionnel.

:::info
Les traductions sont un travail en cours réalisé avec l'aide de l'intelligence artificielle et de contributeurs de la communauté, et **peuvent contenir des tournures maladroites ou des imprécisions**. Merci aux équipes qui ont déjà aidé à relire et améliorer ces traductions ! Consultez la page 🌐 [Prise en charge des langues](/overview/language-support) pour en savoir plus sur notre processus de traduction et sur la façon d'envoyer des commentaires.
:::

<img src="/img/whats-new/multi-language-1.webp" alt="Onglet graphique linéaire en chinois simplifié" />

## 📖 Nouveaux tutoriels et documentation {#new-tutorials-and-documentation}

La documentation a été enrichie avec une nouvelle [série de tutoriels](/category/tutorials) en trois parties conçue pour aider les équipes à démarrer avec WPILib 2027 et AdvantageScope :

1. **👋 [Bonjour, télémétrie !](/tutorials/hello-telemetry) :** Configurer `DataLogManager` et l'API `Telemetry`, se connecter en direct et analyser les données avec des graphiques linéaires, des tableaux et des statistiques.
2. **🤖 [Sur le terrain : visualisation du robot](/tutorials/to-the-field) :** Publier des poses 2D/3D, des trajectoires et des objets `Mechanism2d` sur des terrains FRC et FTC.
3. **🕹️ [Prendre le contrôle : DS et manettes](/tutorials/taking-control) :** Diffuser les diagnostics en direct de la console de pilotage, synchroniser les journaux du robot et de la DS, afficher la sortie console et visualiser les entrées des manettes.

Les exemples de code dans toute la documentation ont également été mis à jour pour couvrir l'API de télémétrie de WPILib dans plusieurs langages.

<img src="/img/tutorials/to-the-field-4.webp" alt="Visualisation du terrain 3D tirée du tutoriel Sur le terrain" />

_L'interface en anglais est illustrée ci-dessus._

## 📱 AdvantageTune {#advantagetune}

AdvantageTune est une nouvelle application autonome pour iPhone et iPad qui offre une expérience de réglage mobile légère en complément d'AdvantageScope. Vous pouvez consulter et modifier en direct des rubriques [NetworkTables](https://docs.wpilib.org/fr/stable/docs/software/networktables/index.html) (y compris les types primitifs, les tableaux, les structs WPILib et les Protobufs) directement depuis votre téléphone, permettant à chacun de participer facilement au réglage du code du robot.

AdvantageTune et AdvantageScope simplifient tous deux l'exportation des valeurs réglées vers le code du robot grâce à des boutons permettant d'enregistrer toutes les valeurs réglées dans une liste partageable ([documentation](/overview/live-sources/tuning-mode)).

[<img src="/img/app-store_fr.svg" alt="App Store" />](https://apps.apple.com/ca/app/advantagetune/id6811453643?l=fr)

<div className="image-gallery">
  <img src="/img/whats-new/advantagetune-1.webp" alt="Vue de navigation d'AdvantageTune" />
  <img src="/img/whats-new/advantagetune-2.webp" alt="Modification de rubriques dans AdvantageTune" />
  <img src="/img/whats-new/advantagetune-3.webp" alt="Modification de structs dans AdvantageTune" />
  <img src="/img/whats-new/advantagetune-4.webp" alt="Liste des valeurs réglées dans AdvantageTune" />
  <img src="/img/whats-new/advantagetune-5.webp" alt="Recherche et filtrage dans AdvantageTune" />
</div>

_L'interface en anglais est illustrée ci-dessus._

## 🪐 Journalisation universelle WPILOG {#wpilog-universal-logging}

Avec la [journalisation universelle](/more-features/universal-logging), un seul fichier WPILOG peut désormais servir de conteneur universel pour plusieurs flux et formats de journaux, y compris les journaux d'appareils spécifiques aux fabricants, les données CSV et les fichiers WPILOG enfants. La journalisation universelle remplace URCL par une approche flexible et indépendante des fabricants : les données de chaque source sont automatiquement synchronisées et fusionnées dans une seule arborescence unifiée dans la barre latérale. Consultez la [documentation de la journalisation universelle](/more-features/universal-logging#experimental-vendor-logging) pour plus de détails sur la capture des journaux de fabricants dans WPILib (Java, C++ et Python) et AdvantageKit.

<img src="/img/more-features/universal-logging-1.webp" alt="Un fichier WPILOG affichant plusieurs journaux de fabricants dans la barre latérale" />

_L'interface en anglais est illustrée ci-dessus._

## 🗺️ Améliorations des onglets de terrain {#field-tab-improvements}

Plusieurs améliorations ergonomiques ont été ajoutées aux onglets 🗺️ [Terrain 2D](/tab-reference/2d-field) et 👀 [Terrain 3D](/tab-reference/3d-field) :

- Déplacez et zoomez sur le terrain 2D, ou faites un clic droit pour verrouiller la caméra afin qu'elle suive la position et la rotation du robot ([documentation](/tab-reference/2d-field#camera-controls)).
- Ajout de lignes de grille de dalles sur les terrains FTC 2D et 3D pour faciliter le repérage spatial.
- AdvantageScope mémorise désormais si un terrain FRC ou FTC a été utilisé en dernier lors de l'ouverture de nouveaux onglets de terrain 2D ou 3D.

<img src="/img/tab-reference/2d-field-1.webp" alt="Vue d'ensemble de l'onglet Terrain 2D" />

_L'interface en anglais est illustrée ci-dessus._

## 📉 Améliorations du graphique linéaire {#line-graph-improvements}

Le 📉 [Graphique linéaire](/tab-reference/line-graph) et la chronologie bénéficient de plusieurs améliorations visuelles pour une analyse plus claire :

- L'activation de « Afficher le mode du robot » affiche désormais une barre codée par couleur pour les périodes autonome, téléopérée, utilitaire et désactivée.
- Les graphiques en points adaptent automatiquement la taille des points pour une meilleure visibilité à tout niveau de zoom.
- Des info-bulles utiles apparaissent sur le graphique linéaire et la chronologie pour guider les nouveaux utilisateurs sur les gestes de défilement et de zoom.
- Amélioration du rendu et de la lisibilité des grandes valeurs d'horodatage sur les axes de la chronologie et du graphique linéaire.

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="Superposition du mode du robot codée par couleur sur le graphique linéaire" />

_L'interface en anglais est illustrée ci-dessus._

## 🤝 Améliorations d'accessibilité {#accessibility-enhancements}

AdvantageScope 2027 inclut plusieurs mises à jour pour rendre l'application plus accessible :

- Ajout de la navigation au clavier par tabulation pour toutes les entrées et d'info-bulles descriptives pour tous les contrôles de l'application.
- AdvantageScope respecte désormais les paramètres du système d'exploitation visant à réduire la transparence et les animations.
- Les indicateurs booléens dans la barre latérale distinguent désormais les états sans dépendre uniquement de la couleur.

## 🥔 Nouveaux types d'unités {#new-unit-types}

Les [graphiques avec unités](/tab-reference/line-graph/units) d'AdvantageScope ont été enrichis avec de nouveaux types d'unités et d'options d'analyse :

- Puissance (watts, chevaux-vapeur, etc.)
- Rapports (sans dimension, pourcentage)
- Température en Kelvin
- Énergie de pomme de terre
- Orthographes d'unités en anglais britannique (par exemple `metres`)
- Suffixes pour la bibliothèque d'unités de WPILib

## 🧱 Améliorations de la stabilité {#stability-improvements}

Cette version comprend de nombreuses corrections de bogues, optimisations de performances et améliorations de stabilité dans toute l'application. La liste complète se trouve dans le [journal des modifications](https://github.com/Mechanical-Advantage/AdvantageScope/releases), avec les points forts ci-dessous :

- Les versions officielles pour Windows sont désormais signées numériquement, réduisant la fréquence des avertissements SmartScreen lors de l'installation.
- Amélioration significative des performances de chargement et de tracé des journaux, en particulier avec les journaux Hoot (`.hoot`).
- Amélioration de l'algorithme de synchronisation des horodatages multi-journaux lors de l'alignement de journaux provenant de plusieurs sources.
- Amélioration de la fiabilité de la connexion pour les [Diagnostics Phoenix](/overview/live-sources/phoenix-diagnostics).
- Correction de problèmes d'interface avec la barre de menus sur les fenêtres détachées et la fenêtre contextuelle d'enregistrement dans [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- Amélioration du texte et de la formulation de l'interface dans toute l'application pour plus de clarté.
