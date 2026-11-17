import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 👀 Terrain 3D {#3d-field}

L'onglet Terrain 3D affiche votre robot et le terrain en trois dimensions. Il fonctionne avec des poses 2D classiques, mais il prend tout son sens pour les calculs en 3D, comme la localisation par AprilTags. Vous disposez de plusieurs modes de caméra (relatif au terrain, relatif au robot ou fixe), et [AdvantageScope XR](advantagescope-xr) vous permet même d'afficher la scène en réalité augmentée. La chronologie indique quand le robot est activé et sert à naviguer dans le journal.

<img src="/img/tab-reference/3d-field/3d-field-1.webp" alt="Exemple d'onglet Terrain 3D" />

_L'interface en anglais est illustrée ci-dessus._

<details>
<summary>Contrôles de la chronologie</summary>

La chronologie sert à piloter la lecture et la visualisation. Cliquez dessus pour sélectionner un instant précis, et faites un clic droit pour le désélectionner. L'instant choisi est synchronisé dans tous les onglets, ce qui vous permet de retrouver facilement ce moment dans d'autres vues.

Les zones jaunes correspondent au mode autonome, les zones bleues au mode téléopéré et les zones grises au mode utilitaire.

Pour zoomer, placez le curseur sur la chronologie et utilisez la molette vers le haut ou vers le bas. Vous pouvez aussi sélectionner une plage en cliquant et en faisant glisser tout en maintenant la touche `Shift` enfoncée. Déplacez-vous vers la gauche ou la droite par défilement horizontal (sur les appareils compatibles) ou en cliquant-glissant sur la chronologie. Lors d'une connexion en direct, faire défiler vers la gauche déverrouille le suivi de l'instant actuel, et revenir complètement à droite le verrouille à nouveau. Appuyez sur `Ctrl+\` pour zoomer sur la période où le robot est activé.

<img src="/img/tab-reference/timeline.webp" alt="Chronologie" />

</details>

:::warning Terrain FTC 2026-2027
Le modèle du terrain FTC 2026-2027 n'inclut pas d'AprilTags fixes, car leur position sur la structure (*hive*) peut changer en cours de match. Vous pouvez publier un `Pose3d[]` et un `number[]` pour afficher dynamiquement des objets AprilTag sur le terrain. La taille d'AprilTag à utiliser pour ce terrain est de **3,25 po**.
:::

:::warning Terrain FRC 2026
Le modèle du terrain FRC 2026 reprend la disposition des AprilTags du terrain **soudé** (*welded*). Les différences avec le terrain AndyMark sont minimes, mais vous remarquerez peut-être de légers décalages (environ 0,5 pouce) en visualisant des poses d'AprilTags basées sur la disposition AndyMark.
:::

## Ajout d'objets {#adding-objects}

Pour commencer, faites glisser un champ dans la section « Poses ». Vous pouvez supprimer un objet avec le bouton `X`, ou le masquer temporairement en cliquant sur l'icône d'œil ou en double-cliquant sur son nom. Pour tout effacer d'un coup, cliquez sur la corbeille à côté du titre de la section, puis sur `Tout effacer`. Vous pouvez aussi réorganiser les objets dans la liste par glisser-déposer.

**Pour personnaliser un objet, cliquez sur son icône colorée ou faites un clic droit sur le nom du champ.** AdvantageScope propose de nombreux types d'objets, souvent personnalisables (par exemple pour changer leur couleur ou le modèle du robot). Certains objets doivent obligatoirement être ajoutés comme enfants d'un objet existant.

:::tip
Cliquez sur l'icône `?` pour consulter la liste complète des types d'objets pris en charge, les types de données compatibles et savoir lesquels doivent être ajoutés en tant qu'enfants.
:::

:::info
AdvantageScope prend en charge plusieurs tailles d'AprilTags pour les terrains FTC. Cette taille correspond à la **longueur du côté du carré noir de l'AprilTag**, sans compter la bordure blanche obligatoire.
:::

## Format des données {#data-format}

Publiez vos données géométriques sous forme de *struct* ou de *protobuf* encodés en octets. Plusieurs types géométriques 2D et 3D sont pris en charge, notamment `Pose2d`, `Pose3d`, `Translation2d` et `Translation3d`.

De nombreuses bibliothèques gèrent le format *struct*, dont WPILib et AdvantageKit. L'exemple ci-dessous montre comment enregistrer des poses 3D en Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose3d[] {poseA, poseB});
```

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

## Mécanismes et composants {#mechanisms-and-components}

Vous pouvez visualiser vos mécanismes à l'aide de mécanismes 2D ou de composants 3D articulés.

### Mécanismes 2D {#2d-mechanisms}

Pour afficher un mécanisme enregistré avec [`Mechanism2d`](https://docs.wpilib.org/fr/stable/docs/software/dashboards/glass/mech2d-widget.html), glissez le champ du mécanisme sur un objet robot ou fantôme existant. Le mécanisme est alors projeté sous forme de boîtes simples sur le plan XZ ou YZ du robot, comme ci-dessous. Cliquez sur l'icône d'engrenage ou faites un clic droit sur le nom du champ pour passer du plan XZ au plan YZ. L'origine du robot est centrée sur le bord inférieur du mécanisme.

<img src="/img/tab-reference/3d-field/3d-field-2.webp" alt="Mécanisme 2D" />

### Composants 3D {#3d-components}

:::warning
Configurer des composants 3D peut être long et complexe. Si vous cherchez une solution plus rapide pour afficher vos mécanismes sur le terrain 3D, pensez plutôt à utiliser `Mechanism2d` comme expliqué ci-dessus.
:::

Pour animer des composants articulés, enregistrez une série de poses 3D représentant la position de chaque pièce par rapport au robot. Ajoutez ces poses à un objet robot ou fantôme existant, puis réglez le type d'objet sur « Composant ».

Chaque composant bouge ainsi indépendamment (chariot d'élévateur, bras, pince, etc.). Si vous utilisez AdvantageKit, la méthode [`generate3dMechanism()`](https://docs.advantagekit.org/data-flow/supported-types#mechanisms-output-only) convertit directement un `Mechanism2d` en un tableau de `Pose3d`. Pour savoir comment configurer les modèles de robot avec composants, consultez [Ressources personnalisées](/more-features/custom-assets).

<img src="/img/tab-reference/3d-field/3d-field-3.webp" alt="Mécanisme 3D" />

## Objets d'éléments de jeu {#game-piece-objects}

Chaque terrain propose des objets d'éléments de jeu qui s'affichent à l'endroit exact indiqué par le code du robot. C'est très pratique pour :

- animer simplement le déroulement de routines autonomes en simulation ;
- visualiser les éléments de jeu détectés sur le terrain ;
- indiquer où se trouve un élément de jeu à l'intérieur du robot ;
- tracer des trajectoires de tir calculées par la physique.

Vous pouvez aussi afficher l'état d'un élément de jeu dans le robot à partir d'un capteur. Par exemple, sur un robot 2024, un capteur photoélectrique (*beam break*) dans le convoyeur peut déclencher l'affichage d'une note (comme ci-dessous).

<details>
<summary>Exemple de code</summary>

Le projet d'exemple KitBot 2024 d'AdvantageKit montre comment créer une [commande](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/util/NoteVisualizer.java) qui anime le trajet d'une note du robot jusqu'au haut-parleur. Cette commande est appelée dans la [séquence de tir](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/subsystems/launcher/Launcher.java#L73) standard pour lancer l'animation à chaque tir. [Cette vidéo](https://youtube.com/shorts/-HxfDo9f19U?feature=share) illustre comment ces animations permettent de visualiser des routines autonomes sur plusieurs jeux.

</details>

<img src="/img/tab-reference/3d-field/3d-field-4.webp" alt="Visualisation de la note du KitBot 2024" />

## Options de caméra {#camera-options}

Faites un clic droit sur la vue 3D pour changer de mode de caméra. Chaque fenêtre détachée garde son propre mode et sa propre position de caméra, ce qui permet de créer facilement des vues multi-caméras.

:::info
Faites un clic droit sur la vue 3D et sélectionnez « Définir le champ de vision » pour ajuster l'angle de vue (FOV) des caméras d'orbite et du poste de pilotage.
:::

### Orbiter le terrain {#orbit-field}

C'est le mode par défaut : vous déplacez la caméra librement autour du terrain. Maintenez **clic gauche + glisser** pour pivoter, **clic droit + glisser** pour vous déplacer latéralement, et utilisez la **molette** pour zoomer ou dézoomer.

:::tip
Vous pouvez aussi piloter la caméra au clavier : **WASD** pour vous déplacer horizontalement, **IJKL** pour pivoter, et **E** / **Q** pour monter ou descendre.
:::

### Orbiter le robot {#orbit-robot}

Ce mode reprend les mêmes commandes que « Orbiter le terrain », mais la caméra reste verrouillée sur le robot afin de suivre ses déplacements en continu.

### Poste de pilotage {#driver-station}

Ce mode place la caméra derrière l'un des postes de pilotage, à hauteur d'yeux. Choisissez manuellement un poste ou sélectionnez « Auto » pour utiliser l'alliance et le numéro de poste enregistrés dans le journal.

:::warning
La sélection automatique du numéro de poste peut être inexacte avec les journaux produits par AdvantageKit 2023 ou une version antérieure.
:::

### Caméra fixe {#fixed-camera}

Chaque modèle de robot intègre des caméras fixes (caméras de vision ou de pilotage) avec leur propre position, format d'image et champ de vision. Ces vues sont très utiles pour vérifier la détection par vision ou simuler le point de vue du pilote, comme ci-dessous.

<img src="/img/tab-reference/3d-field/3d-field-5.webp" alt="Caméra fixe" />

Si vous fournissez une pose « Remplacement de la caméra », elle remplace la position par défaut de toutes les caméras fixes tout en conservant leur champ de vision et leur format d'image. Votre code peut ainsi animer une caméra mobile, par exemple montée sur une tourelle ou un capot de lanceur.

:::info
Comme pour les autres données de pose, la pose « Remplacement de la caméra » doit être _relative au terrain_, et non relative au robot.
:::

## Configuration {#configuration}

Choisissez le modèle du terrain dans le menu déroulant. Tous les jeux FRC et FTC récents sont disponibles. Sur un appareil aux performances graphiques modestes, nous vous conseillons d'utiliser les terrains « Evergreen ». Les terrains « Axes » n'affichent que les axes XYZ à l'origine avec un simple contour du terrain pour garder l'échelle.

:::info
Vous pouvez personnaliser le système de coordonnées utilisé dans cet onglet. Consultez la page [Systèmes de coordonnées](/more-features/coordinate-systems) pour en savoir plus.
:::

### Modes de rendu {#rendering-modes}

Le terrain 3D propose trois modes de rendu :

- **Cinématique (à gauche) :** affiche les ombres, l'éclairage avancé, les reflets et des modèles 3D très détaillés pour un rendu réaliste. Demande une carte graphique assez puissante.
- **Standard (au centre) :** le mode par défaut, avec un éclairage minimal et des modèles 3D simplifiés. Fonctionne sans problème sur la plupart des ordinateurs.
- **Basse consommation (à droite) :** réduit la fréquence d'images, la résolution et le niveau de détail afin d'économiser la batterie et d'offrir un affichage plus fluide sur les machines peu puissantes.

<img src="/img/tab-reference/3d-field/3d-field-6.webp" alt="Comparaison des modes de rendu" />

Pour changer le mode de rendu, ouvrez les préférences via `App` > `Afficher les préférences...` (Windows/Linux) ou `AdvantageScope` > `Paramètres...` (macOS). L'option « Mode 3D (batterie) » permet d'imposer un autre mode lorsque votre ordinateur portable n'est pas branché sur secteur, par exemple pour économiser la batterie en compétition.

<img src="/img/prefs_fr.webp" alt="Schéma des préférences" height="450" />
