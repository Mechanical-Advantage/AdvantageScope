---
sidebar_position: 11
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📍 Points

L'onglet points montre une visualisation 2D de points arbitraires. Il s'agit d'un outil très flexible, permettant des visualisations personnalisées de données/pipelines de vision, d'états de mécanismes, etc.

<img src="/img/tab-reference/points-1.png" alt="Exemple d'onglet points" />

<details>
<summary>Contrôles de la chronologie</summary>

La chronologie est utilisée pour contrôler la lecture et la visualisation. Cliquer sur la chronologie sélectionne un moment, et faire un clic droit le désélectionne. L'heure sélectionnée est synchronisée sur tous les onglets, ce qui permet de trouver rapidement cet emplacement dans d'autres vues.

Les sections jaunes indiquent quand le robot est en mode autonome, les sections bleues indiquent quand le robot est en mode téléopéré et les sections grises indiquent quand le robot est en mode utilitaire.

Pour zoomer, placez le curseur sur la chronologie et faites défiler vers le haut ou vers le bas. Une plage peut également être sélectionnée en cliquant et en faisant glisser tout en maintenant la touche `Shift` enfoncée. Déplacez-vous vers la gauche et la droite en faisant défiler horizontalement (sur les appareils pris en charge), ou en cliquant et en faisant glisser sur la chronologie. Lors d'une connexion en direct, le défilement vers la gauche déverrouille à partir de l'heure actuelle, et le défilement tout à fait vers la droite verrouille à nouveau à l'heure actuelle. Appuyez sur `Ctrl+\` pour zoomer sur la période où le robot est activé.

<img src="/img/tab-reference/timeline.png" alt="Chronologie" />

</details>

## Ajout de sources

Pour commencer, faites glisser un champ vers la section « Sources ». Supprimez une source à l'aide du bouton X, ou masquez-la temporairement en cliquant sur l'icône de l'œil ou en double-cliquant sur le nom du champ. Pour supprimer tous les objets, cliquez sur la corbeille près du titre de l'axe, puis sur `Tout effacer`. Les sources peuvent être réorganisées dans la liste en les faisant glisser.

**Pour personnaliser chaque source, cliquez sur l'icône colorée ou faites un clic droit sur le nom du champ.** Le symbole, la couleur et la taille de chaque source peuvent être ajustés.

:::tip
Pour voir une liste complète des types de sources pris en charge, cliquez sur l'icône `?`. Cette liste comprend également les types de données pris en charge.
:::

## Format des données

Les données de points doivent être publiées sous forme de struct ou protobuf codé en octets, en utilisant le type `Translation2d[]`. De nombreuses bibliothèques prennent en charge ce format, notamment WPILib et AdvantageKit. L'exemple de code ci-dessous montre comment enregistrer des données de points en Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
StructArrayPublisher<Translation2d> publisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyTranslations", Translation2d.struct).publish();

periodic() {
  publisher.set(new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
  publisher.set(
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  );
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("MyTranslations",
  new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
Logger.recordOutput("MyTranslations",
  new Translation2d(0.0, 1.0),
  new Translation2d(2.0, 3.0)
);
```

</TabItem>
</Tabs>

## Configuration

Les options de configuration suivantes sont disponibles :

- **Dimensions :** La taille de la zone d'affichage. Cela peut utiliser n'importe quelle unité correspondant aux points publiés. Lors de l'affichage des données de vision, il s'agit de la résolution de la caméra.
- **Orientation :** Le système de coordonnées à utiliser (orientation des axes X et Y).
- **Origine :** La position de l'origine dans le système de coordonnées.
