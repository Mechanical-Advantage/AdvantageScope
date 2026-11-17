---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 Swerve {#swerve}

L'onglet Swerve affiche l'état des quatre modules *swerve* : vecteurs de vitesse, positions au repos, rotation du robot et vitesses du châssis.

<img src="/img/tab-reference/swerve-1.webp" alt="Aperçu de l'onglet Swerve" />

_L'interface en anglais est illustrée ci-dessus._

<details>
<summary>Contrôles de la chronologie</summary>

La chronologie sert à piloter la lecture et la visualisation. Cliquer dessus sélectionne un instant précis, et un clic droit le désélectionne. Comme l'heure sélectionnée est synchronisée entre tous les onglets, vous pouvez retrouver ce même moment en un coup d'œil dans les autres vues.

Les zones jaunes indiquent les phases en mode autonome, les zones bleues le mode téléopéré, et les zones grises le mode utilitaire.

Pour zoomer, placez le curseur sur la chronologie et faites défiler vers le haut ou vers le bas. Vous pouvez aussi sélectionner une plage en cliquant et en faisant glisser tout en maintenant la touche `Shift` enfoncée. Pour vous déplacer vers la gauche ou la droite, faites défiler horizontalement (sur les appareils compatibles) ou cliquez et faites glisser sur la chronologie. En mode en direct, faire défiler vers la gauche déverrouille la vue de l'heure actuelle, tandis que faire défiler complètement vers la droite la verrouille à nouveau. Appuyez sur `Ctrl+\` pour zoomer sur la période où le robot est activé.

<img src="/img/tab-reference/timeline.webp" alt="Chronologie" />

</details>

## Ajout de sources {#adding-sources}

Pour commencer, faites glisser un champ vers la section « Sources ». Vous pouvez supprimer une source avec le bouton X, ou la masquer temporairement en cliquant sur l'icône d'œil ou en double-cliquant sur son nom. Pour tout retirer, cliquez sur la corbeille à côté du titre de la section, puis sur `Tout effacer`. Vous pouvez également réorganiser les sources dans la liste par glisser-déposer.

**Pour personnaliser une source, cliquez sur son icône colorée ou faites un clic droit sur son nom.** AdvantageScope prend en charge trois types de sources :

- **Vitesses des modules :** un ensemble de quatre états de modules _swerve_, représentés par des vecteurs sur le schéma.
- **Vitesses du robot :** les vitesses linéaire et angulaire affichées au centre du schéma.
- **Rotation :** l'angle utilisé pour orienter le schéma.

## Format des données {#data-format}

Les données doivent être publiées au format struct ou protobuf encodé en octets, à l'aide des types `SwerveModuleVelocity[]`, `ChassisVelocities`, `Rotation2d` ou `Rotation3d`.

De nombreuses bibliothèques prennent en charge le format struct, notamment WPILib et AdvantageKit. L'exemple ci-dessous montre comment enregistrer les états des modules _swerve_ en Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Telemetry.log("MyStates", states);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

:::note
En 2027, cette structure de données a été renommée de `SwerveModuleState` en `SwerveModuleVelocity`.
Pour les fichiers journaux créés avant WPILib 2027 et Systemcore, l'ancien type `SwerveModuleState` reste pris en charge pour la visualisation.
:::

## Configuration {#configuration}

Les options suivantes sont disponibles :

- **Vitesse max :** la vitesse maximale que peuvent atteindre les modules, utilisée pour mettre à l'échelle la longueur des vecteurs.
- **Taille du châssis :** la distance entre les modules gauche/droite et avant/arrière, qui ajuste les proportions du schéma du robot.
- **Orientation :** modifie la direction vers laquelle pointe le schéma du robot, pratique pour l'aligner avec vos données de pose ou la vidéo d'un match.

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
