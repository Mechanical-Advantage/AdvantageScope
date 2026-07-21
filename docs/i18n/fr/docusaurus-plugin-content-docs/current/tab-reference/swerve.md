---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 Swerve

L'onglet Swerve montre l'état de quatre modules Swerve, y compris les vecteurs de vitesse, les positions au repos, la rotation du robot et les vitesses du châssis.

<img src="/img/tab-reference/swerve-1.png" alt="Aperçu de l'onglet Swerve" />

<details>
<summary>Contrôles de la chronologie</summary>

La chronologie est utilisée pour contrôler la lecture et la visualisation. Cliquer sur la chronologie sélectionne un moment, et faire un clic droit le désélectionne. L'heure sélectionnée est synchronisée sur tous les onglets, ce qui permet de trouver rapidement cet emplacement dans d'autres vues.

Les sections jaunes indiquent quand le robot est en mode autonome, les sections bleues indiquent quand le robot est en mode téléopéré et les sections grises indiquent quand le robot est en mode utilitaire.

Pour zoomer, placez le curseur sur la chronologie et faites défiler vers le haut ou vers le bas. Une plage peut également être sélectionnée en cliquant et en faisant glisser tout en maintenant la touche `Shift` enfoncée. Déplacez-vous vers la gauche et la droite en faisant défiler horizontalement (sur les appareils pris en charge), ou en cliquant et en faisant glisser sur la chronologie. Lors d'une connexion en direct, le défilement vers la gauche déverrouille à partir de l'heure actuelle, et le défilement tout à fait vers la droite verrouille à nouveau à l'heure actuelle. Appuyez sur `Ctrl+\` pour zoomer sur la période où le robot est activé.

<img src="/img/tab-reference/timeline.png" alt="Chronologie" />

</details>

## Ajout de sources

Pour commencer, faites glisser un champ vers la section « Sources ». Supprimez une source à l'aide du bouton X, ou masquez-la temporairement en cliquant sur l'icône de l'œil ou en double-cliquant sur le nom du champ. Pour supprimer toutes les sources, cliquez sur la corbeille près du titre de l'axe, puis sur `Tout effacer`. Les sources peuvent être réorganisées dans la liste en les faisant glisser.

**Pour personnaliser chaque source, cliquez sur l'icône colorée ou faites un clic droit sur le nom du champ.** AdvantageScope prend en charge trois types de sources :

- **Vitesses des modules :** Un ensemble de quatre états de modules Swerve, affichés sous forme de vecteurs sur le schéma.
- **Vitesses du robot :** Les vitesses linéaires et angulaires affichées au centre du schéma.
- **Rotation :** La position angulaire utilisée pour faire pivoter le schéma.

## Format des données

Data should be published as a byte-encoded struct or protobuf, using the `SwerveModuleVelocity[]`, `ChassisVelocities`, `Rotation2d`, or `Rotation3d` types.

De nombreuses bibliothèques prennent en charge le format struct, notamment WPILib et AdvantageKit. L'exemple de code ci-dessous montre comment enregistrer les états des modules Swerve en Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
}

StructArrayPublisher<SwerveModuleVelocity> publisher = NetworkTableInstance.getDefault()
.getStructArrayTopic("MyStates", SwerveModuleVelocity.struct).publish();

periodic() {
  publisher.set(states);
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
}

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

## Configuration

Les options de configuration suivantes sont disponibles :

- **Vitesse max :** La vitesse maximale atteignable par les modules, utilisée pour ajuster la taille des vecteurs.
- **Taille du châssis :** Les distances entre les modules Swerve gauche-droite et avant-arrière. Modifie le rapport d'aspect du schéma du robot.
- **Orientation :** Ajuste la direction dans laquelle le schéma du robot est pointé. Cette option est souvent utile pour s'aligner avec les données de pose ou les vidéos de match.

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
