---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 Terrain 2D

L'onglet terrain 2D montre une visualisation 2D du robot superposée sur une carte du terrain. Il peut également afficher des données supplémentaires telles que l'état de ciblage de vision et les poses de référence.

<img src="/img/tab-reference/2d-field-1.png" alt="Aperçu de l'onglet terrain 2D" />

<details>
<summary>Contrôles de la chronologie</summary>

La chronologie est utilisée pour contrôler la lecture et la visualisation. Cliquer sur la chronologie sélectionne un moment, et faire un clic droit le désélectionne. L'heure sélectionnée est synchronisée sur tous les onglets, ce qui permet de trouver rapidement cet emplacement dans d'autres vues.

Les sections jaunes indiquent quand le robot est en mode autonome, les sections bleues indiquent quand le robot est en mode téléopéré et les sections grises indiquent quand le robot est en mode utilitaire.

Pour zoomer, placez le curseur sur la chronologie et faites défiler vers le haut ou vers le bas. Une plage peut également être sélectionnée en cliquant et en faisant glisser tout en maintenant la touche `Shift` enfoncée. Déplacez-vous vers la gauche et la droite en faisant défiler horizontalement (sur les appareils pris en charge), ou en cliquant et en faisant glisser sur la chronologie. Lors d'une connexion en direct, le défilement vers la gauche déverrouille à partir de l'heure actuelle, et le défilement tout à fait vers la droite verrouille à nouveau à l'heure actuelle. Appuyez sur `Ctrl+\` pour zoomer sur la période où le robot est activé.

<img src="/img/tab-reference/timeline.png" alt="Chronologie" />

</details>

## Ajout d'objets

Pour commencer, faites glisser un champ vers la section « Poses ». Supprimez un objet à l'aide du bouton X, ou masquez-le temporairement en cliquant sur l'icône de l'œil ou en double-cliquant sur le nom du champ. Pour supprimer tous les objets, cliquez sur la corbeille près du titre de l'axe, puis sur `Tout effacer`. Les objets peuvent être réorganisés dans la liste en les faisant glisser.

**Pour personnaliser chaque objet, cliquez sur l'icône colorée ou faites un clic droit sur le nom du champ.** AdvantageScope prend en charge un grand nombre de types d'objets, dont beaucoup peuvent être personnalisés (comme la modification des couleurs). Certains objets doivent être ajoutés en tant qu'enfants à un objet existant.

:::tip
Pour voir une liste complète des types d'objets pris en charge, cliquez sur l'icône `?`. Cette liste comprend également les types de données pris en charge et indique si les objets doivent être ajoutés en tant qu'enfants.
:::

<img src="/img/tab-reference/2d-field-2.png" alt="Terrain 2D avec objets" />

## Format des données

Les données de géométrie doivent être publiées sous forme de struct ou protobuf codé en octets. Divers types de géométrie 2D et 3D sont pris en charge, notamment `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d`, et plus encore.

De nombreuses bibliothèques prennent en charge le format struct, notamment WPILib et AdvantageKit. L'exemple de code ci-dessous montre comment enregistrer des données de pose 2D en Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

StructPublisher<Pose2d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose2d.struct).publish();
StructArrayPublisher<Pose2d> arrayPublisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyPoseArray", Pose2d.struct).publish();

periodic() {
  publisher.set(poseA);
  arrayPublisher.set(new Pose2d[] {poseA, poseB});
}
```

:::tip
La classe [`Field2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/field2d-widget.html) de WPILib peut également être utilisée pour enregistrer plusieurs ensembles de données de pose 2D ensemble.
:::

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
// This protocol does not support the modern struct format, but pose
// values can be published using separate fields that include the
// suffixes "x", "y", and "heading" (as shown below):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // Inches
packet.put("Pose y", 2.8); // Inches
packet.put("Pose heading", 3.14); // Radians

// Alternatively, headings can be published in degrees
packet.put("Pose heading (deg)", 180.0); // Degrees

// Add other telemetry values here...

FtcDashboard.getInstance().sendTelemetryPacket(packet)

// Alternately, use MultipleTelemetry and the standard SDK telemetry:
// During OpMode Init:
telemetry = new MultipleTelemetry(telemetry,FtcDashboard.getInstance().getTelemetry());

// During Loop:
telemetry.addData("Pose x", 6.3); // Inches
telemetry.addData("Pose y", 2.8); // Inches
telemetry.addData("Pose heading", 3.14); // Radians

// or...
telemetry.addData("Pose heading (deg)", 180.0); // Degrees

// Add other telemetry values here...
telemetry.update();
```

</TabItem>
</Tabs>

## Configuration

- **Terrain :** L'image du terrain à utiliser. Tous les jeux FRC et FTC récents sont pris en charge. Pour ajouter une image de terrain personnalisée, voir [Ressources personnalisées](/more-features/custom-assets).
- **Orientation :** L'orientation de l'image du terrain dans le volet de visualisation.
- **Taille :** La longueur de côté du robot (30/27/24 pouces pour la FRC, 18/16/14 pouces pour le FTC).

:::info
Le système de coordonnées utilisé sur cet onglet est personnalisable. Consultez la page [système de coordonnées](/more-features/coordinate-systems) pour plus de détails.
:::
