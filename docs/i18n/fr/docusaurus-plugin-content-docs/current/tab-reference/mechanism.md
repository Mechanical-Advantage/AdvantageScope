---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ Mécanisme {#mechanism}

L'onglet Mécanisme affiche un mécanisme articulé créé à partir d'un ou plusieurs objets [Mechanism2d](https://docs.wpilib.org/fr/stable/docs/software/dashboards/glass/mech2d-widget.html).

<img src="/img/tab-reference/mechanism-1.webp" alt="Aperçu de l'onglet Mécanisme" />

_L'interface en anglais est illustrée ci-dessus._

<details>
<summary>Contrôles de la chronologie</summary>

La chronologie sert à piloter la lecture et la visualisation. Cliquez dessus pour sélectionner un instant précis, et faites un clic droit pour le désélectionner. L'instant choisi est synchronisé dans tous les onglets, ce qui vous permet de retrouver facilement ce moment dans d'autres vues.

Les zones jaunes correspondent au mode autonome, les zones bleues au mode téléopéré et les zones grises au mode utilitaire.

Pour zoomer, placez le curseur sur la chronologie et utilisez la molette vers le haut ou vers le bas. Vous pouvez aussi sélectionner une plage en cliquant et en faisant glisser tout en maintenant la touche `Shift` enfoncée. Déplacez-vous vers la gauche ou la droite par défilement horizontal (sur les appareils compatibles) ou en cliquant-glissant sur la chronologie. Lors d'une connexion en direct, faire défiler vers la gauche déverrouille le suivi de l'instant actuel, et revenir complètement à droite le verrouille à nouveau. Appuyez sur `Ctrl+\` pour zoomer sur la période où le robot est activé.

<img src="/img/tab-reference/timeline.webp" alt="Chronologie" />

</details>

## Ajout de mécanismes {#adding-mechanisms}

Pour commencer, faites glisser un champ `Mechanism2d` dans le panneau de contrôle. Vous pouvez supprimer un mécanisme avec le bouton `X`, ou le masquer temporairement en cliquant sur l'icône d'œil ou en double-cliquant sur son nom. Pour tout effacer d'un coup, cliquez sur la corbeille à côté du titre de la section, puis sur `Tout effacer`. Vous pouvez aussi réorganiser les mécanismes dans la liste par glisser-déposer.

## Publication de données {#publishing-data}

Pour publier des données de mécanisme, enregistrez périodiquement un objet `Mechanism2d` (voir ci-dessous). Attention : cet appel n'enregistre que l'état actuel du `Mechanism2d`, il faut donc l'exécuter à chaque cycle de boucle après avoir mis à jour le mécanisme.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);

periodic() {
  Telemetry.log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::Mechanism2d mechanism{3, 3};

void Periodic() {
  wpi::telemetry::Log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import wpilib
import telemetry

mechanism = wpilib.Mechanism2d(3, 3)

def periodic():
    telemetry.log("MyMechanism", mechanism)
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);

periodic() {
  Logger.recordOutput("MyMechanism", mechanism);
}
```

:::tip
Avec AdvantageKit, l'annotation [@AutoLogOutput](https://docs.advantagekit.org/data-flow/recording-outputs/annotation-logging) permet d'enregistrer automatiquement l'état du mécanisme à chaque cycle sans avoir à appeler `Logger.recordOutput`.
:::

</TabItem>
</Tabs>
