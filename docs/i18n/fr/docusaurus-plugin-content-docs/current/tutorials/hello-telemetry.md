---
sidebar_position: 1
---

# 👋 Bonjour, télémétrie !

Bienvenue dans AdvantageScope ! La télémétrie et la journalisation des données sont des outils puissants qui vous aident à mieux comprendre le code de votre robot, à diagnostiquer les problèmes et à mettre en œuvre des solutions sur le terrain comme en dehors. Ces tutoriels sont conçus pour vous aider à démarrer avec la télémétrie afin de profiter pleinement de toutes les fonctionnalités d'AdvantageScope.

Dans ce tutoriel, vous apprendrez à :

- Configurer la télémétrie de base du robot dans un projet Java WPILib.
- Vous connecter aux flux de données en direct dans AdvantageScope.
- Enregistrer des données dans des fichiers journaux pour les consulter plus tard.
- Visualiser des données de télémétrie avec AdvantageScope.

:::tip Vous cherchez autre chose ?

- **Équipes FTC :** Si vous utilisez le système de contrôle FIRST Tech Challenge actuel, consultez le guide ✴️ [Compatibilité FTC](/more-features/ftc-compatibility).
- **Interface web :** Une version navigateur d'AdvantageScope est disponible directement dans la FIRST Driver Station et l'interface web de Systemcore. Consultez 💡 [AdvantageScope Lite](/more-features/advantagescope-lite) pour plus de détails.
- **AdvantageKit :** Un framework de journalisation avancé conçu pour le rejeu déterministe en simulation. Consultez la [documentation](https://docs.advantagekit.org) pour plus de détails. Nous vous recommandons de commencer par l'API de télémétrie intégrée de WPILib, décrite ci-dessous.
  :::

## 1. Créer un nouveau projet WPILib

Pour commencer, créez un nouveau projet Java WPILib dans VS Code :

1. Ouvrez VS Code.
2. Cliquez sur l'icône WPILib en haut à droite (ou appuyez sur `Ctrl+Maj+P` / `Cmd+Maj+P` et tapez **WPILib: Create a new project**).
3. Sélectionnez **Template** > **Java** > **Command v3 Robot** (ou **Command v2 Robot**).
4. Choisissez un dossier, nommez votre projet (par exemple `HelloTelemetry`) et saisissez votre numéro d'équipe.
5. Cochez **Enable Desktop Support** puis cliquez sur **Create Project**.

<img src="/img/tutorials/hello-telemetry-1.webp" alt="Création d'un nouveau projet Java WPILib dans VS Code à l'aide du créateur de projet WPILib." />

_L'interface en anglais est illustrée ci-dessus._

## 2. Initialiser la journalisation des données

WPILib fournit une journalisation intégrée via `DataLogManager`. Une fois démarré, il enregistre automatiquement toute la télémétrie, les entrées NetworkTables et les entrées de la console de pilotage dans des fichiers `.wpilog`.

:::info Recommandation
Bien que les journaux puissent être enregistrés sur le stockage interne de Systemcore, la mémoire flash interne est limitée. Nous vous recommandons vivement de brancher une **clé USB standard formatée en FAT32** sur l'un des ports USB de Systemcore. `DataLogManager` détectera la clé et écrira automatiquement tous les journaux directement dessus.
:::

Ouvrez `src/main/java/first/robot/Robot.java` et initialisez `DataLogManager` dans le constructeur `Robot()` :

```java
public class Robot extends OpModeRobot {
  // ...

  public Robot() {
    // Démarre DataLogManager pour enregistrer toute la télémétrie dans un fichier .wpilog sur la clé USB
    DataLogManager.start();

    // Enregistre également les données de la console de pilotage (manettes, OpMode, état d'activation)
    DriverStation.startDataLog(DataLogManager.getLog());
  }

  // ...
}
```

## 3. Publier des données de télémétrie

La classe `Telemetry` de WPILib vous permet de publier des données en une seule ligne de code, en organisant les champs dans des tables hiérarchiques. Cette API prend en charge un grand nombre de types de données, notamment les valeurs numériques, les booléens, les chaînes de caractères, les tableaux et les [types géométriques](https://docs.wpilib.org/fr/stable/docs/software/advanced-controls/geometry/index.html) de WPILib.

:::info
La classe `Telemetry` de WPILib est différente de la classe `Telemetry` du SDK FTC. La classe `Telemetry` de WPILib envoie des informations du programme du robot vers des tableaux de bord, des outils de débogage ou des fichiers journaux. Pour mettre à jour l'affichage intégré de la Driver Station, utilisez la classe `DriverStationDisplay` de WPILib.
:::

Mettez à jour `src/main/java/first/robot/ExampleTeleop.java` :

```java
@Teleop
public class ExampleTeleop implements OpMode {
  // ...

  @Override
  public void periodic() {
    double currentTime = Timer.getTimestamp();
    double sineWave = Math.sin(currentTime * 2.0);

    // Publie les valeurs de télémétrie à l'aide de l'API Telemetry
    Telemetry.log("Time", currentTime);
    Telemetry.log("SineWave/Value", sineWave);
    Telemetry.log("SineWave/Low", sineWave < 0.5);
  }
}
```

Déployez le code sur votre robot (ou exécutez `WPILib: Simulate Robot Code` depuis VS Code). En simulation, cliquez sur `Teleoperated` > `ExampleTeleop` > `Enable`.

<img src="/img/tutorials/hello-telemetry-2.webp" alt="Activation de l'OpMode ExampleTeleop dans l'interface du simulateur." height="200" />

_L'interface en anglais est illustrée ci-dessus._

:::tip
De nouvelles données de télémétrie ne sont publiées que lorsque `Telemetry.log` est appelé. Les méthodes périodiques de la classe `Robot`, des OpModes, des sous-systèmes et des mécanismes peuvent être actives dans différentes conditions ; consultez attentivement la documentation de l'API avant de choisir où placer vos appels de journalisation.
:::

## 4. Connecter AdvantageScope en direct

Lancez l'application de bureau AdvantageScope. Dans le menu supérieur, sélectionnez `Fichier` > `Se connecter au robot` > `NetworkTables` (ou `Fichier` > `Se connecter au simulateur` en simulation). Une fois connecté, la barre latérale gauche se remplit avec les champs publiés sous `NT:/Telemetry`.

:::tip Raccourcis clavier
Appuyez sur `Ctrl+K` / `Cmd+K` pour vous connecter rapidement au robot, ou sur `Ctrl+Maj+K` / `Cmd+Maj+K` pour vous connecter au simulateur.
:::

<img src="/img/tutorials/hello-telemetry-3.webp" alt="AdvantageScope connecté au flux en direct du robot avec les champs listés dans l'arborescence de la barre latérale." />

_L'interface en anglais est illustrée ci-dessus._

## 5. Visualiser les données de télémétrie

### Graphique linéaire

Le 📉 [Graphique linéaire](/tab-reference/line-graph) est l'onglet par défaut dans AdvantageScope et permet de tracer en temps réel des valeurs numériques et discrètes.

1. Regardez dans la barre latérale gauche sous `Telemetry` > `SineWave`.
2. Faites glisser `Value` vers la zone « Axe gauche » du panneau de contrôle.
3. Faites glisser `Low` vers la zone « Champs discrets » du panneau de contrôle.
4. Cliquez sur les trois points à côté de « Champs discrets », puis sur « Afficher le mode du robot ».

Vous verrez l'onde sinusoïdale et l'état du robot se mettre à jour en temps réel à mesure que les données arrivent !

:::info Interagir avec le graphique

- **Pause / Défilement :** Faites défiler horizontalement ou cliquez et faites glisser sur le graphique pour consulter les données passées. La flèche rouge en haut à droite indique que le défilement automatique en direct est en pause. Cliquez sur la flèche ou appuyez sur `L` pour activer/désactiver le défilement automatique.
- **Zoom :** Faites défiler vers le haut/bas sur le graphique, ou maintenez `Maj` enfoncé tout en faisant glisser pour zoomer sur une plage de temps précise.
- **Inspecter les valeurs :** Cliquez n'importe où sur le graphique pour placer un curseur temporel et voir les valeurs exactes dans la légende.
  :::

<img src="/img/tutorials/hello-telemetry-4.webp" alt="Graphique linéaire traçant le signal d'onde sinusoïdale." />

_L'interface en anglais est illustrée ci-dessus._

### Tableau

L'onglet 🔢 [Tableau](/tab-reference/table) affiche une feuille de calcul chronologique des changements d'état et de valeur, idéale pour diagnostiquer les transitions et les séquences d'événements.

1. Cliquez sur le bouton **+** dans la barre d'onglets supérieure et choisissez **Tableau**.
2. Depuis la barre latérale, faites glisser `NT:/Telemetry/SineWave/Value` et `NT:/Telemetry/Low` dans la vue du tableau.
3. Une nouvelle ligne est ajoutée automatiquement chaque fois qu'un des champs affichés change de valeur.
4. Cliquez sur n'importe quelle ligne pour positionner immédiatement tous les onglets ouverts à cet instant précis !

:::tip
Les onglets peuvent être réorganisés et renommés à l'aide de la barre d'onglets. Cliquez sur le bouton de fenêtre dans la barre de titre pour ouvrir un onglet dans une fenêtre détachée et afficher plusieurs onglets côte à côte.
:::

<img src="/img/tutorials/hello-telemetry-5.webp" alt="Onglet Tableau affichant les données de l'onde sinusoïdale." />

_L'interface en anglais est illustrée ci-dessus._

### Statistiques

L'onglet 📊 [Statistiques](/tab-reference/statistics) affiche un histogramme des valeurs numériques, offrant une vue détaillée des données d'un ou plusieurs champs.

1. Cliquez sur le bouton **+** dans la barre d'onglets supérieure et choisissez **Statistiques**.
2. Depuis la barre latérale, faites glisser `NT:/Telemetry/SineWave/Value` dans la section « Mesures ».
3. Définissez « Plage de données » sur `-1` et `1`, et définissez « Taille du pas » sur `0,1`.
4. Consultez les données à l'aide de l'histogramme et des statistiques récapitulatives.
5. Faites défiler la chronologie en haut pour ajuster la plage de données à inclure.

<img src="/img/tutorials/hello-telemetry-6.webp" alt="Onglet Statistiques affichant les données de l'onde sinusoïdale." />

_L'interface en anglais est illustrée ci-dessus._

## 6. Télécharger et ouvrir des fichiers journaux

Après des tests ou un match, vous pouvez télécharger les fichiers `.wpilog` depuis le robot pour analyser les données a posteriori :

1. Dans la barre de menus, sélectionnez `Fichier` > `Télécharger les journaux...`.
2. AdvantageScope se connecte au robot et liste tous les fichiers journaux enregistrés (les plus récents en haut).
3. Sélectionnez le ou les fichiers journaux que vous souhaitez inspecter, cliquez sur l'icône de téléchargement (↓) et choisissez un dossier sur votre ordinateur.
4. Ouvrez le fichier téléchargé via `Fichier` > `Ouvrir un ou plusieurs journaux...` ou en faisant glisser le fichier `.wpilog` directement dans AdvantageScope.

<img src="/img/overview/log-files/open-file-2.webp" alt="La fenêtre de téléchargement affichant les fichiers WPILOG disponibles sur le stockage du robot." height="350" />

_L'interface en anglais est illustrée ci-dessus._

## Et ensuite ?

Maintenant que la télémétrie et la journalisation de base fonctionnent, passez au niveau supérieur :

- **🤖 [Sur le terrain : visualisation du robot](/tutorials/to-the-field) :** Apprenez à visualiser les positions 2D/3D du robot, les trajectoires et les mécanismes sur des modèles de terrain FRC et FTC.
- **[Présentation](/category/overview) :** Un guide complet sur la gestion des fichiers, les raccourcis de navigation et les options de diffusion en direct.
- **[Prise en charge des unités](/tab-reference/line-graph/units) :** Comment intégrer des métadonnées d'unité dans vos journaux pour une visualisation plus précise.
- **💬 [Console](/tab-reference/console) :** Visualisez les journaux texte enregistrés par `DataLogManager` de WPILib.
- **🔍 [Métadonnées](/tab-reference/metadata) :** Enregistrez des informations supplémentaires pour identifier et classer vos fichiers journaux.
- **[Epilogue](https://docs.wpilib.org/fr/stable/docs/software/telemetry/robot-telemetry-with-annotations.html) :** Enregistrez de la télémétrie en Java à l'aide d'annotations.
