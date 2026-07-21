import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 👀 Terrain 3D

Le terrain 3D montre une visualisation 3D du robot et du terrain. Il peut être utilisé avec des poses 2D régulières, mais il est particulièrement utile lors du travail avec des calculs 3D (comme la localisation avec AprilTags). Plusieurs vues de caméra sont disponibles, y compris relatives au terrain, relatives au robot et fixes. [AdvantageScope XR](advantagescope-xr) permet de visualiser cet onglet à l'aide de la réalité augmentée. La chronologie indique quand le robot est activé et peut être utilisée pour naviguer dans les données du journal.

<img src="/img/tab-reference/3d-field/3d-field-1.png" alt="Exemple d'onglet terrain 3D" />

<details>
<summary>Contrôles de la chronologie</summary>

La chronologie est utilisée pour contrôler la lecture et la visualisation. Cliquer sur la chronologie sélectionne un moment, et faire un clic droit le désélectionne. L'heure sélectionnée est synchronisée sur tous les onglets, ce qui permet de trouver rapidement cet emplacement dans d'autres vues.

Les sections jaunes indiquent quand le robot est en mode autonome, les sections bleues indiquent quand le robot est en mode téléopéré et les sections grises indiquent quand le robot est en mode utilitaire.

Pour zoomer, placez le curseur sur la chronologie et faites défiler vers le haut ou vers le bas. Une plage peut également être sélectionnée en cliquant et en faisant glisser tout en maintenant la touche `Shift` enfoncée. Déplacez-vous vers la gauche et la droite en faisant défiler horizontalement (sur les appareils pris en charge), ou en cliquant et en faisant glisser sur la chronologie. Lors d'une connexion en direct, le défilement vers la gauche déverrouille à partir de l'heure actuelle, et le défilement tout à fait vers la droite verrouille à nouveau à l'heure actuelle. Appuyez sur `Ctrl+\` pour zoomer sur la période où le robot est activé.

<img src="/img/tab-reference/timeline.png" alt="Chronologie" />

</details>

:::warning
Le modèle de terrain FRC 2026 est cohérent avec la disposition d'AprilTag pour le terrain **soudé**. Les différences entre les terrains soudés et AndyMark sont très mineures, mais il peut y avoir de légers désalignements (~0,5 pouce) lors de la visualisation des poses d'AprilTag basées sur la disposition du terrain AndyMark.
:::

## Ajout d'objets

Pour commencer, faites glisser un champ vers la section « Poses ». Supprimez un objet à l'aide du bouton X, ou masquez-le temporairement en cliquant sur l'icône de l'œil ou en double-cliquant sur le nom du champ. Pour supprimer tous les objets, cliquez sur la corbeille près du titre de l'axe, puis sur `Tout effacer`. Les objets peuvent être réorganisés dans la liste en les faisant glisser.

**Pour personnaliser chaque objet, cliquez sur l'icône colorée ou faites un clic droit sur le nom du champ.** AdvantageScope prend en charge un grand nombre de types d'objets, dont beaucoup peuvent être personnalisés (comme la modification des couleurs et des modèles de robots). Certains objets doivent être ajoutés en tant qu'enfants à un objet existant.

:::tip
Pour voir une liste complète des types d'objets pris en charge, cliquez sur l'icône `?`. Cette liste comprend également les types de données pris en charge et indique si les objets doivent être ajoutés en tant qu'enfants.
:::

:::info
AdvantageScope prend en charge plusieurs tailles d'AprilTags pour les terrains FTC. Les tailles sont mesurées en tant que **longueur de côté de la section noire de l'AprilTag**, sans inclure la bordure blanche requise.
:::

## Format des données

Les données de géométrie doivent être publiées sous forme de struct ou protobuf codé en octets. Divers types de géométrie 2D et 3D sont pris en charge, notamment `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d`, et plus encore.

De nombreuses bibliothèques prennent en charge le format struct, notamment WPILib et AdvantageKit. L'exemple de code ci-dessous montre comment enregistrer des données de pose 3D en Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

StructPublisher<Pose3d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose3d.struct).publish();
StructArrayPublisher<Pose3d> arrayPublisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyPoseArray", Pose3d.struct).publish();

periodic() {
  publisher.set(poseA);
  arrayPublisher.set(new Pose3d[] {poseA, poseB});
}
```

:::tip
La classe [`Field2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/field2d-widget.html) de WPILib peut également être utilisée pour enregistrer plusieurs ensembles de données de pose 2D ensemble.
:::

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose3d[] {poseA, poseB});
```

</TabItem>
<TabItem value="ftcdashboard" label="FTC Dashboard">

```java
// This protocol does not support the modern struct format, but pose
// values can be published using separate fields that include the
// suffixes "x", "y", and "heading" (as shown below):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // Inches
packet.put("Pose y", 2.8); // Inches
packet.put("Pose heading", 3.14); // Radians

// Alternatively, headings can be published in degrees
packet.put("Pose heading (deg)", 180.0); // Degrees
```

</TabItem>
</Tabs>

## Mécanismes et composants

Les données de mécanisme peuvent être visualisées à l'aide de mécanismes 2D ou de composants 3D articulés.

### Mécanismes 2D {#2d-mechanisms}

Pour visualiser des données de mécanisme enregistrées à l'aide d'un [`Mechanism2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html), ajoutez le champ de mécanisme à un objet robot ou fantôme existant. Le mécanisme est projeté sur le plan XZ ou YZ du robot à l'aide de simples boîtes, comme illustré ci-dessous. Cliquez sur l'icône d'engrenage ou faites un clic droit sur le nom du champ pour basculer entre les plans XZ et YZ. L'origine du robot est centrée sur le bord inférieur du mécanisme.

<img src="/img/tab-reference/3d-field/3d-field-2.png" alt="Mécanisme 2D" />

### Composants 3D

:::warning
La configuration des composants 3D peut être complexe et prendre du temps. Envisagez d'utiliser la prise en charge de `Mechanism2d` d'AdvantageScope comme décrit ci-dessus, qui offre une approche plus simple pour visualiser les mécanismes sur le terrain 3D.
:::

Les mécanismes peuvent être visualisés avec des composants articulés en enregistrant un ensemble de poses 3D qui représentent les emplacements relatifs au robot de chaque composant. Ajoutez les poses à un objet robot ou fantôme existant et définissez le type d'objet sur « Composant ».

Chaque composant peut être déplacé indépendamment (comme un chariot d'élévateur, un bras ou un effecteur terminal). Les utilisateurs d'AdvantageKit doivent envisager d'utiliser la méthode [`generate3dMechanism()`](https://docs.advantagekit.org/data-flow/supported-types#mechanisms-output-only) pour convertir un Mechanism2d en un tableau d'objets Pose3d. Pour plus d'informations sur la configuration des robots avec des composants, voir [Ressources personnalisées](/more-features/custom-assets).

<img src="/img/tab-reference/3d-field/3d-field-3.png" alt="Mécanisme 3D" />

## Objets d'éléments de pointage {#game-piece-objects}

Chaque terrain comprend un ensemble de types d'objets d'éléments de pointage, permettant de rendre des éléments de pointage à n'importe quelle position sur le terrain à l'aide de données publiées par le code robot. Cela présente une variété d'applications, notamment :

- La visualisation des actions des routines autonomes simulées à l'aide d'animations simples
- L'affichage des emplacements détectés des éléments de pointage sur le terrain
- L'indication de l'emplacement des éléments de pointage dans un robot
- La visualisation des trajectoires de tir basées sur des calculs physiques

Un autre cas d'utilisation simple consiste à afficher l'état des éléments de pointage dans le robot en fonction des données de capteur. Par exemple, un capteur de coupure de faisceau dans le chemin des notes pour un robot 2024 pourrait faire apparaître une note (comme illustré ci-dessous).

<details>
<summary>Exemple de code</summary>

Le projet d'exemple KitBot 2024 d'AdvantageKit comprend un exemple simple d'une [commande](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/util/NoteVisualizer.java) qui anime une note se déplaçant du robot vers le haut-parleur. Cette commande est intégrée dans la [séquence de lancement](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/subsystems/launcher/Launcher.java#L73) standard, déclenchant l'animation chaque fois qu'une note est relâchée. [Cette vidéo](https://youtube.com/shorts/-HxfDo9f19U?feature=share) montre comment les animations d'éléments de pointage peuvent être utilisées pour visualiser des routines autonomes pour plusieurs jeux différents.

</details>

<img src="/img/tab-reference/3d-field/3d-field-4.png" alt="Visualisation de note KitBot 2024" />

## Options de caméra

Pour changer le mode de caméra sélectionné, faites un clic droit sur la vue du terrain rendu. Le mode et la position de la caméra sont contrôlés indépendamment pour chaque fenêtre détachée, permettant la création facile de vues multi-caméras.

:::info
Faites un clic droit sur la vue du terrain rendu et cliquez sur « Définir le champ de vision... » pour ajuster le champ de vision des caméras d'orbite et du poste de pilotage.
:::

### Orbiter le terrain

Il s'agit du mode de caméra par défaut, où la caméra peut être déplacée librement par rapport au terrain. **Clic gauche + glisser** fait pivoter la caméra, et **clic droit + glisser** déplace la caméra. **Faites défiler** pour zoomer avant et arrière.

:::tip
La caméra peut également être contrôlée à l'aide du clavier. Les touches **WASD** sont utilisées pour les déplacements horizontaux, les touches **IJKL** sont utilisées pour pivoter, et les touches **E** et **Q** sont utilisées pour les déplacements verticaux.
:::

### Orbiter le robot

Ce mode possède les mêmes contrôles que le mode « Orbiter le terrain », mais la position de la caméra est verrouillée par rapport au robot. Cela permet des prises de vue de « suivi » du mouvement du robot.

### Poste de pilotage

Ce mode verrouille la caméra derrière l'un des postes de pilotage à hauteur d'yeux typique. Choisissez manuellement le poste à visualiser ou choisissez « Auto » pour utiliser l'alliance et le numéro de poste stockés dans les données du journal.

:::warning
La sélection automatique du numéro de poste peut être inexacte lors de la visualisation de données de journal produites par AdvantageKit 2023 ou version antérieure.
:::

### Caméra fixe

Chaque modèle de robot est configuré avec un ensemble de caméras fixes, comme les caméras de vision et les caméras de pilotage. Ces caméras ont des positions, des rapports d'aspect et des champs de vision fixes. Ces vues sont souvent utiles pour vérifier les données de vision ou pour simuler une vue de caméra de pilotage. Dans l'exemple ci-dessous, une caméra de pilotage est illustrée.

<img src="/img/tab-reference/3d-field/3d-field-5.png" alt="Caméra fixe" />

Si une pose de « Remplacement de la caméra » est fournie, elle remplace les poses par défaut de toutes les caméras fixes tout en conservant leurs champs de vision et rapports d'aspect configurés. Cela permet au code robot de fournir la position d'une caméra mobile, comme une caméra montée sur une tourelle ou un capot de lanceur.

:::info
En cohérence avec d'autres données de pose, la pose de « Remplacement de la caméra » doit être _relative au terrain_, et non relative au robot.
:::

## Configuration

Le modèle de terrain peut être configuré à l'aide du menu déroulant. Tous les jeux FRC et FTC récents sont pris en charge. Nous recommandons d'utiliser les terrains « Evergreen » pour les appareils ayant des performances graphiques limitées. Les terrains « Axes » affichent uniquement les axes XYZ à l'origine avec un contour de terrain pour l'échelle.

:::info
Le système de coordonnées utilisé sur cet onglet est personnalisable. Consultez la page [système de coordonnées](/more-features/coordinate-systems) pour plus de détails.
:::

### Modes de rendu {#rendering-modes}

Le terrain 3D prend en charge trois modes de rendu :

- **Cinématique :** Rendu avec ombres, éclairage, réflexions et modèles 3D hautement détaillés pour un aspect plus réaliste. Nécessite un GPU assez puissant.
- **Standard (Par défaut) :** Rendu avec un éclairage minimal et des modèles 3D simplifiés. S'exécute bien sur la plupart des appareils.
- **Basse consommation :** Diminue la fréquence d'images, la résolution et les détails du modèle pour réduire la consommation de la batterie et offrir des performances plus cohérentes sur les appareils bas de gamme.

<img src="/img/tab-reference/3d-field/3d-field-6.png" alt="Comparaison des modes de rendu" />

Pour configurer le mode de rendu, ouvrez la fenêtre des préférences en appuyant sur `Application` > `Afficher les préférences...` (Windows/Linux) ou `AdvantageScope` > `Paramètres...` (macOS). Le paramètre « Mode 3D (batterie) » peut être remplacé de la valeur par défaut pour ignorer le mode de rendu utilisé sur un ordinateur portable lorsqu'il n'est pas en charge. Par exemple, cela peut être utilisé pour préserver la batterie lors d'une compétition.

<img src="/img/prefs.png" alt="Schéma des préférences" height="350" />
