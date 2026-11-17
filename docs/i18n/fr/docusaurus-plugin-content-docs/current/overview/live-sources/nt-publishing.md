---
sidebar_position: 3
---

# Publication de données NetworkTables {#publishing-networktables-data}

AdvantageScope peut republier les données NetworkTables enregistrées dans un fichier journal vers un serveur NetworkTables (un simulateur ou un robot, par exemple). Cela est particulièrement utile pour :

- Rejouer un match en simulation afin de déboguer un problème.
- Simuler les données d'un coprocesseur sur un vrai robot.
- Tester un tableau de bord de pilotage avec des données de match réalistes.

Pour utiliser cette fonctionnalité, votre fichier journal doit contenir une capture complète des données NetworkTables, par exemple générée par l'[enregistreur de données intégré](https://docs.wpilib.org/fr/stable/docs/software/telemetry/datalog.html) de WPILib. Notez qu'AdvantageKit ne prend pas en charge cette fonction, car il propose à la place une relecture déterministe complète en simulation.

## Prise en main {#getting-started}

Commencez par ouvrir un fichier journal contenant des données NetworkTables, puis choisissez une option :

- **Publier vers le robot :** cliquez sur `Fichier` > `Publier les données NT` > `Se connecter au robot`.
- **Publier vers le simulateur :** cliquez sur `Fichier` > `Publier les données NT` > `Se connecter au simulateur`.

En haut de la fenêtre, la mention « Recherche » ou « Publication » indique l'état de la diffusion. En cas de déconnexion, AdvantageScope tente automatiquement de se reconnecter avec les mêmes paramètres.

Chaque champ est publié avec la valeur qu'il avait à l'_horodatage sélectionné_ (utilisé dans la plupart des onglets d'AdvantageScope). Vous pouvez ainsi rejouer un match sur le réseau en temps réel avec les mêmes commandes de lecture que dans l'application (voir [Navigation dans l'application](/overview/navigation)). Si aucun horodatage n'est sélectionné, les valeurs publiées correspondent à l'_horodatage survolé_.

Pour arrêter la publication, cliquez sur `Fichier` > `Publier les données NT` > `Arrêter la publication`.

## Filtrer les champs {#filtering-fields}

Par défaut, AdvantageScope publie tous les champs NetworkTables présents dans le fichier journal (à l'exception des méta-sujets générés par le serveur). Dans certains cas, comme pour simuler un coprocesseur, vous voudrez n'en publier qu'une partie. Pour définir les préfixes autorisés, ouvrez les préférences via `App` > `Afficher les préférences...` (Windows/Linux) ou `AdvantageScope` > `Paramètres...` (macOS).

Le champ « Préfixes de publication NT » permet de filtrer les données envoyées sur NetworkTables. Laissez-le vide pour tout publier, ou saisissez une liste de préfixes ou de champs séparés par des virgules. Exemples :

- « *Telemetry* » : inclut tous les champs de la table « Telemetry ».
- « *Telemetry/Drive* » : inclut uniquement la sous-table « Telemetry/Drive ».
- « *limelight/tx,limelight/ty* » : inclut uniquement les champs « limelight/tx » et « limelight/ty ».

## Limites {#limitations}

:::warning

- Les champs sont publiés toutes les 20 ms; les données NetworkTables enregistrées à une fréquence supérieure perdront des échantillons.
- Les horodatages d'origine des échantillons ne sont pas conservés, ce qui serait impossible lors des retours en arrière ou des changements de vitesse de lecture.
  :::
