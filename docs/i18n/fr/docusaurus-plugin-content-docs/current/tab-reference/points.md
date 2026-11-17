---
sidebar_position: 11
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📍 Points {#points}

L'onglet Points affiche une visualisation 2D de points arbitraires. C'est un outil très polyvalent qui permet de créer des visualisations sur mesure pour vos données ou *pipelines* de vision, l'état de vos mécanismes, et bien plus.

<img src="/img/tab-reference/points-1.webp" alt="Exemple d'onglet Points" />

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

**Pour personnaliser une source, cliquez sur son icône colorée ou faites un clic droit sur son nom.** Vous pourrez ainsi modifier son symbole, sa couleur et sa taille.

:::tip
Pour consulter la liste complète des types de sources et des formats de données pris en charge, cliquez sur l'icône `?`.
:::

## Format des données {#data-format}

Les coordonnées des points doivent être publiées au format struct ou protobuf encodé en octets, avec le type `Translation2d[]`. De nombreuses bibliothèques prennent ce format en charge, notamment WPILib et AdvantageKit. L'exemple ci-dessous montre comment enregistrer des points en Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Telemetry.log("MyTranslations",
  new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
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

## Configuration {#configuration}

Les options suivantes sont disponibles :

- **Dimensions :** la taille de la zone d'affichage, exprimée dans la même unité que les points publiés. Pour des données de vision, il s'agit de la résolution de la caméra.
- **Orientation :** le système de coordonnées à utiliser (sens des axes X et Y).
- **Origine :** la position de l'origine dans le système de coordonnées.
