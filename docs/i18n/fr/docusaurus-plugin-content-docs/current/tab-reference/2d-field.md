---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 Terrain 2D {#2d-field}

L'onglet Terrain 2D affiche votre robot en vue de dessus, directement sur le plan du terrain. Vous pouvez aussi y superposer d'autres données, comme l'état du suivi par vision ou des poses de référence.

<img src="/img/tab-reference/2d-field-1.webp" alt="Aperçu de l'onglet Terrain 2D" />

_L'interface en anglais est illustrée ci-dessus._

<details>
<summary>Contrôles de la chronologie</summary>

La chronologie sert à piloter la lecture et la visualisation. Cliquez dessus pour sélectionner un instant précis, et faites un clic droit pour le désélectionner. L'instant choisi est synchronisé dans tous les onglets, ce qui vous permet de retrouver facilement ce moment dans d'autres vues.

Les zones jaunes correspondent au mode autonome, les zones bleues au mode téléopéré et les zones grises au mode utilitaire.

Pour zoomer, placez le curseur sur la chronologie et utilisez la molette vers le haut ou vers le bas. Vous pouvez aussi sélectionner une plage en cliquant et en faisant glisser tout en maintenant la touche `Shift` enfoncée. Déplacez-vous vers la gauche ou la droite par défilement horizontal (sur les appareils compatibles) ou en cliquant-glissant sur la chronologie. Lors d'une connexion en direct, faire défiler vers la gauche déverrouille le suivi de l'instant actuel, et revenir complètement à droite le verrouille à nouveau. Appuyez sur `Ctrl+\` pour zoomer sur la période où le robot est activé.

<img src="/img/tab-reference/timeline.webp" alt="Chronologie" />

</details>

## Contrôles de la caméra {#camera-controls}

Utilisez la molette sur le terrain pour zoomer ou dézoomer, et cliquez-glissez pour vous déplacer sur la vue. Faites un clic droit n'importe où sur le terrain pour ouvrir le menu de la caméra :

- **Déverrouillé** : vous contrôlez manuellement le déplacement et le zoom.
- **Verrouillé sur le robot** : la caméra suit automatiquement les déplacements du robot.
- **Verrouillé sur le robot et la rotation** : la caméra suit automatiquement la position et l'orientation du robot.

Même dans les modes verrouillés, vous pouvez toujours déplacer librement la caméra pour vous éloigner du robot. Les boutons d'orientation du panneau de contrôle permettent de faire pivoter le terrain dans n'importe quel mode.

## Ajout d'objets {#adding-objects}

Pour commencer, faites glisser un champ dans la section « Poses ». Vous pouvez supprimer un objet avec le bouton `X`, ou le masquer temporairement en cliquant sur l'icône d'œil ou en double-cliquant sur son nom. Pour tout effacer d'un coup, cliquez sur la corbeille à côté du titre de la section, puis sur `Tout effacer`. Vous pouvez aussi réorganiser les objets dans la liste par glisser-déposer.

**Pour personnaliser un objet, cliquez sur son icône colorée ou faites un clic droit sur le nom du champ.** AdvantageScope propose de nombreux types d'objets, souvent personnalisables (par exemple pour changer leur couleur). Certains objets doivent obligatoirement être ajoutés comme enfants d'un objet existant.

:::tip
Cliquez sur l'icône `?` pour consulter la liste complète des types d'objets pris en charge, les types de données compatibles et savoir lesquels doivent être ajoutés en tant qu'enfants.
:::

<img src="/img/tab-reference/2d-field-2.webp" alt="Terrain 2D avec objets" />

## Format des données {#data-format}

Publiez vos données géométriques sous forme de _struct_ ou de _protobuf_ encodés en octets. Plusieurs types géométriques 2D et 3D sont pris en charge, notamment `Pose2d`, `Pose3d`, `Translation2d` et `Translation3d`.

De nombreuses bibliothèques gèrent le format _struct_, dont WPILib et AdvantageKit. L'exemple ci-dessous montre comment enregistrer des poses 2D.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::math::Pose2d poseA;
wpi::math::Pose2d poseB;

wpi::telemetry::Log("MyPose", poseA);
wpi::telemetry::Log("MyPoseArray", std::vector{poseA, poseB});
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
from wpimath import Pose2d
import telemetry

pose_a = Pose2d()
pose_b = Pose2d()

telemetry.log("MyPose", pose_a)
telemetry.log("MyPoseArray", [pose_a, pose_b], element_type=Pose2d)
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose2d[] {poseA, poseB});
```

</TabItem>
<TabItem value="ftcdashboard" label="FTC Dashboard">

```java
// Ce protocole ne prend pas en charge le format struct moderne, mais les valeurs
// de pose peuvent être publiées à l'aide de champs distincts portant les
// suffixes "x", "y" et "heading" (comme ci-dessous) :
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // Pouces
packet.put("Pose y", 2.8); // Pouces
packet.put("Pose heading", 3.14); // Radians

// Sinon, les caps peuvent être publiés en degrés
packet.put("Pose heading (deg)", 180.0); // Degrés

// Ajoutez d'autres valeurs de télémétrie ici...

FtcDashboard.getInstance().sendTelemetryPacket(packet)

// Vous pouvez aussi utiliser MultipleTelemetry et la télémétrie standard du SDK :
// Pendant l'initialisation de l'OpMode :
telemetry = new MultipleTelemetry(telemetry,FtcDashboard.getInstance().getTelemetry());

// Pendant la boucle :
telemetry.addData("Pose x", 6.3); // Pouces
telemetry.addData("Pose y", 2.8); // Pouces
telemetry.addData("Pose heading", 3.14); // Radians

// ou...
telemetry.addData("Pose heading (deg)", 180.0); // Degrés

// Ajoutez d'autres valeurs de télémétrie ici...
telemetry.update();
```

</TabItem>
</Tabs>

## Configuration {#configuration}

- **Terrain :** l'image du terrain à afficher. Tous les jeux FRC et FTC récents sont inclus. Pour ajouter une image personnalisée, consultez la page [Ressources personnalisées](/more-features/custom-assets).
- **Orientation :** l'orientation du terrain dans le volet de visualisation.
- **Taille :** la longueur du côté du robot (30, 27 ou 24 pouces en FRC; 18, 16 ou 14 pouces en FTC).

:::info
Vous pouvez personnaliser le système de coordonnées utilisé dans cet onglet. Consultez la page [Systèmes de coordonnées](/more-features/coordinate-systems) pour en savoir plus.
:::
