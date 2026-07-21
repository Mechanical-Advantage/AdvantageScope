---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ Mécanisme

L'onglet mécanisme affiche un mécanisme articulé créé avec un ou plusieurs objets [Mechanism2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html).

<img src="/img/tab-reference/mechanism-1.png" alt="Aperçu de l'onglet mécanisme" />

<details>
<summary>Contrôles de la chronologie</summary>

La chronologie est utilisée pour contrôler la lecture et la visualisation. Cliquer sur la chronologie sélectionne un moment, et faire un clic droit le désélectionne. L'heure sélectionnée est synchronisée sur tous les onglets, ce qui permet de trouver rapidement cet emplacement dans d'autres vues.

Les sections jaunes indiquent quand le robot est en mode autonome, les sections bleues indiquent quand le robot est en mode téléopéré et les sections grises indiquent quand le robot est en mode utilitaire.

Pour zoomer, placez le curseur sur la chronologie et faites défiler vers le haut ou vers le bas. Une plage peut également être sélectionnée en cliquant et en faisant glisser tout en maintenant la touche `Shift` enfoncée. Déplacez-vous vers la gauche et la droite en faisant défiler horizontalement (sur les appareils pris en charge), ou en cliquant et en faisant glisser sur la chronologie. Lors d'une connexion en direct, le défilement vers la gauche déverrouille à partir de l'heure actuelle, et le défilement tout à fait vers la droite verrouille à nouveau à l'heure actuelle. Appuyez sur `Ctrl+\` pour zoomer sur la période où le robot est activé.

<img src="/img/tab-reference/timeline.png" alt="Chronologie" />

</details>

## Ajout de mécanismes

Pour commencer, faites glisser un `Mechanism2d` vers le panneau de contrôle. Supprimez un mécanisme à l'aide du bouton X, ou masquez-le temporairement en cliquant sur l'icône de l'œil ou en double-cliquant sur le nom du champ. Pour supprimer tous les mécanismes, cliquez sur la corbeille près du titre de l'axe, puis sur `Tout effacer`. Les mécanismes peuvent être réorganisés dans la liste en les faisant glisser.

## Publication de données

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

Pour publier des données de mécanisme à l'aide de WPILib, envoyez un objet `Mechanism2d` à NetworkTables (illustré ci-dessous). Si la journalisation des données est activée, les mécanismes peuvent également être visualisés sur la base du fichier WPILOG généré.

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);
SmartDashboard.putData("MyMechanism", mechanism);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

Pour publier des données de mécanisme à l'aide d'AdvantageKit, enregistrez un `Mechanism2d` en tant que champ de sortie (illustré ci-dessous). Notez que cet appel enregistre uniquement l'état actuel du `Mechanism2d`, il doit donc être appelé à chaque cycle de boucle après la mise à jour de l'objet.

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);
Logger.recordOutput("MyMechanism", mechanism);
```

</TabItem>
</Tabs>
