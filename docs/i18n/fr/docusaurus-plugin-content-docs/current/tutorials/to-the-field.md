---
sidebar_position: 2
---

# 🤖 Sur le terrain : visualisation du robot

Maintenant que votre télémétrie de base fonctionne, il est temps de visualiser votre robot ! AdvantageScope propose de puissants visualiseurs de terrain 2D et 3D qui donnent vie à l'odométrie, aux estimations de vision, aux trajectoires et aux mécanismes articulés sur des modèles de terrain FRC et FTC.

Dans ce tutoriel, vous apprendrez à :

- Publier des données de pose structurées à l'aide de l'**API Telemetry**.
- Utiliser les onglets **🗺️ Terrain 2D** et **👀 Terrain 3D** pour visualiser les déplacements du robot.
- Publier et afficher un mécanisme en 2D et en 3D.

## 1. Publier des poses

Dans WPILib, les objets géométriques tels que `Pose2d`, `Pose3d` et `Translation2d` servent à représenter la position du robot et des éléments du terrain. Avec l'**API Telemetry**, vous pouvez enregistrer directement des poses/translations ainsi que des tableaux (comme des trajectoires planifiées ou des cibles de vision) en un seul appel de méthode :

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

<details>
<summary>Exemple d'OpMode</summary>

Vous souhaitez essayer les fonctionnalités de visualisation d'AdvantageScope sans projet de robot complet ? Copiez l'OpMode ci-dessous, qui publie plusieurs poses 2D et 3D à titre de démonstration sur un modèle de terrain FRC. Consultez 👋 [Bonjour, télémétrie !](/tutorials/hello-telemetry) pour savoir comment créer un nouveau projet WPILib et le configurer pour la télémétrie.

```java
@Teleop
public class ExampleTeleop implements OpMode {
  @Override
  public void periodic() {
    double t = Timer.getTimestamp();

    // Génère un exemple de trajectoire circulaire
    double x = 2.0 * Math.cos(t * 0.5);
    double y = 2.0 * Math.sin(t * 0.5);
    Rotation2d rotation = Rotation2d.fromRadians(t * 0.5 + Math.PI / 2.0);
    Pose2d robotPose2d = new Pose2d(x, y, rotation);

    // Crée un exemple de pose 3D (par ex. localisation par vision ou tangage/roulis du gyroscope)
    Pose3d robotPose3d = new Pose3d(x, y, 0.0, new Rotation3d(0.0, 0.0, rotation.getRadians()));

    // Crée un exemple de trajectoire (un tableau d'objets Pose2d)
    Pose2d[] trajectory = new Pose2d[] {
        new Pose2d(8.0, 4.0, Rotation2d.ZERO),
        new Pose2d(10.0, 4.0, Rotation2d.ZERO),
        new Pose2d(10.0, 6.0, Rotation2d.CW_PI_2)
    };

    // Enregistre des poses 2D et 3D individuelles
    Telemetry.log("Field/RobotPose2d", robotPose2d);
    Telemetry.log("Field/RobotPose3d", robotPose3d);

    // Enregistre un tableau de poses (par ex. trajectoire ou poses AprilTag)
    Telemetry.log("Field/Trajectory", trajectory);
  }
}
```

</details>

Dans AdvantageScope, les valeurs géométriques dans la barre latérale sont étiquetées avec leur type. Vous pouvez également développer chaque champ pour examiner les composantes individuelles de la pose, telles que les valeurs X, Y et de rotation :

<img src="/img/tutorials/to-the-field-1.webp" alt="Visualisation des données de pose dans la barre latérale d'AdvantageScope." />

_L'interface en anglais est illustrée ci-dessus._

## 2. Visualiser les données en 2D

L'onglet 🗺️ [Terrain 2D](/tab-reference/2d-field) affiche une vue de dessus de votre robot superposée sur le terrain de compétition.

1. Dans AdvantageScope, cliquez sur le bouton **+** dans la barre d'onglets et sélectionnez **Terrain 2D** (ou sélectionnez un onglet Terrain 2D existant).
2. Dans la liste déroulante « Terrain » du panneau de contrôle inférieur, sélectionnez la saison de jeu actuelle ou un terrain permanent.
3. Dans l'arborescence de la barre latérale, repérez `NT:/Telemetry/Field/RobotPose2d` et faites-le glisser dans la liste « Poses » du panneau de contrôle.
4. Votre robot apparaît sur le terrain !
5. Cliquez sur l'icône à côté de la pose dans le panneau de contrôle pour changer la couleur du robot.

:::info Contrôles de la caméra

Faites un clic droit n'importe où sur le terrain pour choisir entre **Déverrouillé**, **Verrouillé sur le robot** (suit le robot) ou **Verrouillé sur le robot et la rotation** (fait pivoter le terrain pour que votre robot pointe toujours vers le haut). Cliquez sur les boutons sous « Orientation » pour ajuster la rotation.
:::

<img src="/img/tutorials/to-the-field-2.webp" alt="Visualisation du robot sur le terrain FRC 2026." />

_L'interface en anglais est illustrée ci-dessus._

## 3. Changer le type d'objet

AdvantageScope prend en charge de nombreux types d'objets visuels au-delà des simples poses de robot, notamment les fantômes (robots translucides), les trajectoires, les cibles de vision, les cartes thermiques, les AprilTags, les éléments de jeu et bien plus encore ! Pour découvrir quels types d'objets AdvantageScope peut afficher :

1. Cliquez sur l'icône `?` (Aide) située dans le panneau de contrôle.
2. Une fenêtre s'ouvre avec la liste de tous les types visuels pris en charge, les types de données attendus (par exemple `Pose2d`, `Pose3d[]`, `Translation2d`) et s'ils peuvent être ajoutés en tant qu'éléments autonomes ou en tant qu'éléments enfants attachés à un autre objet.

Cliquez sur l'icône à côté de chaque pose dans le panneau de contrôle pour changer le type d'objet. Essayez de remplacer la pose du robot par un autre type d'objet comme un fantôme, une flèche ou une carte thermique !

<img src="/img/tutorials/to-the-field-3.webp" alt="Fenêtre d'aide intégrée pour le terrain 2D." height="500" />

_L'interface en anglais est illustrée ci-dessus._

## 4. Visualiser les données en 3D

L'onglet 👀 [Terrain 3D](/tab-reference/3d-field) affiche un terrain en 3D complet avec des éléments de jeu, des éclairages et des modèles de robot personnalisables.

1. Cliquez sur **+** dans la barre d'onglets et sélectionnez **Terrain 3D** (ou sélectionnez un onglet Terrain 3D existant).
2. Sélectionnez le modèle de votre saison de jeu dans la liste déroulante « Terrain ».
3. Faites glisser `NT:/Telemetry/Field/RobotPose3d` ou `NT:/Telemetry/Field/RobotPose2d` dans la section « Poses » (les poses 2D sont automatiquement placées sur le sol du terrain).
4. Faites glisser `NT:/Telemetry/Field/Trajectory` dans la liste « Poses » et définissez son type sur **Trajectoire** pour afficher un chemin sous forme de ruban sur le terrain.
5. Cliquez et faites glisser avec le **bouton gauche de la souris** pour faire pivoter la caméra autour du terrain. Faites glisser avec le **bouton droit de la souris** pour déplacer la vue. Utilisez la molette pour zoomer.
6. Vous pouvez également utiliser **WASD** pour vous déplacer, **IJKL** pour pivoter et **Q/E** pour monter et descendre.
7. Faites un clic droit dans la vue 3D pour basculer entre **Orbiter autour du robot**, **Console de pilotage** (voir le match depuis le point de vue de votre alliance) et **Caméra fixe** (voir depuis les caméras de vision embarquées sur le robot).

<img src="/img/tutorials/to-the-field-4.webp" alt="Onglet Terrain 3D affichant un modèle de robot 3D naviguant sur le terrain avec un ruban de trajectoire." />

_L'interface en anglais est illustrée ci-dessus._

## 5. Publier des données de mécanisme

Si votre robot dispose de structures articulées comme un élévateur, un bras ou un poignet, vous pouvez les visualiser à l'aide de `Mechanism2d` de WPILib. Consultez la [documentation](https://docs.wpilib.org/fr/stable/docs/software/dashboards/glass/mech2d-widget.html) WPILib pour plus de détails. Voici un exemple pour un bras à une seule articulation.

```java
public class ExampleTeleop implements OpMode {
  // Crée un canevas de mécanisme 2D (largeur 2 m, hauteur 2 m)
  private final Mechanism2d mechanism = new Mechanism2d(2.0, 2.0);
  private MechanismLigament2d arm;

  public ExampleTeleop(Robot robot) {
    // Crée un bras ancré en (1 m, 0,5 m)
    MechanismRoot2d root = mechanism.getRoot("ArmRoot", 1.0, 0.5);
    arm = root.append(new MechanismLigament2d("Arm", 0.8, 0.0, 6.0, new Color8Bit(255, 100, 0)));
  }

  @Override
  public void periodic() {
    // Anime l'angle du bras
    double angle = 45.0 + 45.0 * Math.sin(Timer.getTimestamp() * 2.0);
    arm.setAngle(angle);

    // Publie l'état du mécanisme à chaque cycle de boucle
    Telemetry.log("Superstructure/Mechanism", mechanism);
  }
}
```

## 6. Visualiser les mécanismes en 2D

L'onglet ⚙️ [Mécanisme](/tab-reference/mechanism) permet de visualiser les mécanismes en 2D.

1. Cliquez sur **+** dans la barre d'onglets et sélectionnez **Mécanisme**.
2. Faites glisser `NT:/Telemetry/Superstructure/Mechanism` dans le panneau de contrôle. Vous verrez le bras 2D animé bouger en temps réel.

<img src="/img/tutorials/to-the-field-5.webp" alt="L'onglet Mécanisme affichant la visualisation d'un bras articulé en 2D." />

_L'interface en anglais est illustrée ci-dessus._

## 7. Visualiser les mécanismes en 3D

Vous pouvez projeter ce même `Mechanism2d` directement sur votre robot dans l'onglet Terrain 3D !

1. Dans l'onglet Terrain 3D, assurez-vous que la pose de votre robot est ajoutée à la liste « Poses ».
2. Faites glisser `NT:/Telemetry/Superstructure/Mechanism` **sur l'entrée de la pose du robot** dans la liste d'objets (en tant qu'objet enfant).
3. Le mécanisme 2D est projeté dans l'espace 3D sur le châssis du robot ! Cliquez sur l'icône d'engrenage à côté du mécanisme pour basculer entre les plans **XZ** (profil latéral) et **YZ** (profil frontal).

<img src="/img/tutorials/to-the-field-6.webp" alt="Onglet Terrain 3D affichant un mécanisme projeté sur un modèle de robot 3D." />

_L'interface en anglais est illustrée ci-dessus._

## Et ensuite ?

Maintenant que vous savez visualiser les déplacements et les mécanismes de votre robot en 2D et 3D :

- **🕹️ [Prendre le contrôle : DS et manettes](/tutorials/taking-control) :** Apprenez à intégrer la FIRST Driver Station, à exploiter les journaux de la DS et à visualiser les entrées des manettes.
- **👀 [Terrain 3D](/tab-reference/3d-field) :** Un guide complet sur l'onglet Terrain 3D, incluant la visualisation des éléments de jeu, les options de caméra et les modes de rendu.
- **[AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr) :** Donnez vie à la vue Terrain 3D en réalité augmentée sur iPhone et iPad.
- **🎬 [Vidéo](/tab-reference/video) :** Comparez votre visualisation du terrain côte à côte avec des séquences de match réelles.
- **🦀 [Swerve](/tab-reference/swerve) :** Visualisez l'état des mécanismes swerve, y compris les superpositions sur les terrains 2D et 3D.
- **⚙️ [Ressources personnalisées](/more-features/custom-assets) :** Ajoutez des modèles CAO personnalisés, des mécanismes articulés et des images/modèles de terrain.
