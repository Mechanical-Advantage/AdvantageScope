# 📉 Graphique linéaire

Le graphique linéaire est la vue par défaut dans AdvantageScope. Il prend en charge les champs continus (numériques) et discrets.

<img src="/img/tab-reference/line-graph/line-graph-1.png" alt="Démonstration du graphique linéaire" />

## Volet de visualisation

Pour zoomer, placez le curseur sur le graphique principal et faites défiler vers le haut ou vers le bas. Une plage peut également être sélectionnée en cliquant et en faisant glisser tout en maintenant la touche `Shift` enfoncée. Déplacez-vous vers la gauche et la droite en faisant défiler horizontalement (sur les appareils pris en charge), ou en cliquant et en faisant glisser sur le graphique. Lors d'une connexion en direct, le défilement vers la gauche déverrouille à partir de l'heure actuelle, et le défilement tout à fait vers la droite verrouille à nouveau à l'heure actuelle.

Cliquer sur le graphique sélectionne un moment, et faire un clic droit le désélectionne. La valeur de chaque champ à ce moment est affichée dans la légende. L'heure sélectionnée est synchronisée sur tous les onglets, ce qui permet de trouver rapidement cet emplacement dans d'autres vues.

:::tip
Le delta entre l'heure sélectionnée et l'heure survolée est affiché sous forme de superposition sur le graphique, ce qui permet de mesurer facilement les plages de temps.
:::

## Panneau de contrôle

Pour commencer, faites glisser un champ vers l'une des trois sections (gauche, droite ou discret). Supprimez un champ à l'aide du bouton X, ou masquez-le temporairement en cliquant sur l'icône de l'œil ou en double-cliquant sur le nom du champ. Pour tout effacer, cliquez sur les trois points près du titre de l'axe, puis sur `Tout effacer`. Les champs peuvent être réorganisés dans la liste en les faisant glisser.

La couleur et le style de ligne de chaque champ peuvent être personnalisés en cliquant sur l'icône colorée ou en faisant un clic droit sur le nom du champ. Les données de l'API d'alertes persistantes de WPILib [persistent alerts](https://docs.wpilib.org/en/latest/docs/software/telemetry/persistent-alerts.html) peuvent être visualisées en ajoutant le groupe d'alertes en tant que champ discret. Un exemple de visualisation est illustré ci-dessous.

<img src="/img/tab-reference/line-graph/line-graph-2.png" alt="Visualisation des alertes" />

:::tip
Pour superposer le mode du robot (autonome, téléopéré ou utilitaire), cliquez sur les trois points à côté de « Champs discrets » et cliquez sur « Afficher le mode du robot ».

<img src="/img/tab-reference/line-graph/line-graph-3.png" alt="Superposition du mode robot" />
:::

### Réglage des axes {#adjusting-axes}

Par défaut, chaque axe ajuste sa plage en fonction des données visibles. Pour désactiver l'ajustement automatique de la plage et verrouiller la plage à ses valeurs minimale et maximale actuelles, cliquez sur les trois points près du titre de l'axe, puis sur `Verrouiller l'axe`. Pour ajuster manuellement la plage, choisissez `Modifier la plage...` et saisissez les valeurs souhaitées.

<img src="/img/tab-reference/line-graph/line-graph-4.png" alt="Modification de la plage de l'axe" height="250" />

### Intégration et différenciation {#integration--differentiation}

Les valeurs peuvent être automatiquement intégrées ou différenciées par AdvantageScope. Le delta de temps est toujours mesuré en secondes. Cliquez sur les trois points près du titre de l'axe puis sélectionnez `Différencier` ou `Intégrer`.

:::info
Les dérivées sont calculées en utilisant la [différence finie](https://en.wikipedia.org/wiki/Finite_difference) d'échantillons adjacents. Les intégrales sont calculées en utilisant l'[intégration trapézoïdale](https://en.wikipedia.org/wiki/Trapezoidal_rule).
:::
