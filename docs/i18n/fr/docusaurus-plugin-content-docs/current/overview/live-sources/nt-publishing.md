---
sidebar_position: 3
---

# Publication de données NetworkTables

AdvantageScope prend en charge la publication de données NetworkTables stockées dans un fichier journal vers un serveur NetworkTables tel qu'un simulateur ou un robot. Les cas d'utilisation possibles incluent :

- La relecture de matchs en simulation pour le débogage.
- L'imitation de données à partir d'un coprocesseur sur un vrai robot.
- Le débogage d'applications de tableau de bord de pilotage à l'aide de données de match réalistes.

Cette fonctionnalité nécessite un fichier journal avec une capture complète des données NetworkTables, qui peut être généré à l'aide de l'[enregistreur de données intégré](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) de WPILib. Notez qu'AdvantageKit ne prend pas en charge cette fonctionnalité, car il permet à la place une relecture déterministe plus complète en simulation.

## Prise en main

Pour commencer la publication, un fichier journal contenant des données NetworkTables doit être ouvert. Ensuite, suivez ces étapes :

- **Publier sur le robot :** Cliquez sur `Fichier` > `Publier les données NT` > `Se connecter au robot`.
- **Publier sur le simulateur :** Cliquez sur `Fichier` > `Publier les données NT` > `Se connecter au simulateur`.

Le haut de la fenêtre affiche le texte « Recherche » ou « Publication » pour indiquer l'état de la publication des données. AdvantageScope tente de se reconnecter automatiquement en utilisant les mêmes paramètres après une déconnexion.

Tous les champs seront publiés en utilisant leurs valeurs stockées à l'_horodatage sélectionné_ utilisé par de nombreux onglets d'AdvantageScope. Cela permet une lecture réseau en temps réel via le même mécanisme que la lecture au sein d'AdvantageScope. Consultez [Navigation dans l'application](/overview/navigation) pour plus de détails. Si aucun horodatage n'est sélectionné, les champs sont publiés en utilisant leurs valeurs stockées à l'_horodatage survolé_.

Pour arrêter la publication, cliquez sur `Fichier` > `Publier les données NT` > `Arrêter la publication`.

## Filtrage des champs

Par défaut, AdvantageScope publie tous les champs NetworkTables stockés dans le fichier journal (à l'exception des métas-sujets publiés par le serveur). Certains cas d'utilisation, comme l'imitation d'un coprocesseur, nécessitent uniquement la publication d'un ensemble limité de champs ou sous-tables. Pour ajuster l'ensemble des préfixes de champ autorisés, ouvrez la fenêtre des préférences en cliquant sur `Application` > `Afficher les préférences...` (Windows/Linux) ou `AdvantageScope` > `Paramètres...` (macOS).

L'option « Préfixes de publication NT » définit les préfixes autorisés pour les champs publiés sur NetworkTables. Si cette option est laissée vide, tous les champs seront inclus. Sinon, une liste de préfixes ou de champs séparés par des virgules peut être fournie. Voir les exemples ci-dessous.

- « _SmartDashboard_ » : Inclut tous les champs de la table « SmartDashboard ».
- « _SmartDashboard/Auto Selector_ » : Inclut uniquement la table « SmartDashboard/Auto Selector ».
- « _limelight/tx,limelight/ty_ » : Inclut uniquement les champs « limelight/tx » et « limelight/ty ».

## Limitations

:::warning

- Les champs sont publiés toutes les 20 ms, de sorte que les données NetworkTables publiées à l'origine à une fréquence plus élevée ignoreront des échantillons.
- Les horodatages des échantillons publiés ne sont pas conservés. Cela serait impossible lors du balayage d'avant en arrière dans le temps ou de la lecture à différentes vitesses.
:::
