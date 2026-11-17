# 📉 Graphique linéaire {#line-graph}

Le graphique linéaire est la vue par défaut dans AdvantageScope. Il prend en charge à la fois les champs continus (numériques) et les champs discrets.

<img src="/img/tab-reference/line-graph/line-graph-1.webp" alt="Démonstration du graphique linéaire" />

_L'interface en anglais est illustrée ci-dessus._

## Volet de visualisation {#viewer-pane}

Pour zoomer, placez le curseur sur le graphique principal et faites défiler vers le haut ou vers le bas. Vous pouvez aussi sélectionner une plage en cliquant et en faisant glisser tout en maintenant la touche `Shift` enfoncée. Pour vous déplacer vers la gauche ou la droite, faites défiler horizontalement (sur les appareils compatibles) ou cliquez et faites glisser sur le graphique. En mode en direct, faire défiler vers la gauche déverrouille la vue de l'heure actuelle, tandis que faire défiler complètement vers la droite la verrouille à nouveau.

Cliquer sur le graphique sélectionne un instant précis, et un clic droit le désélectionne. La valeur de chaque champ à cet instant s'affiche dans la légende. Comme l'heure sélectionnée est synchronisée entre tous les onglets, vous pouvez retrouver ce même moment en un coup d'œil dans les autres vues.

:::tip
L'écart entre l'instant sélectionné et celui survolé s'affiche en superposition sur le graphique, ce qui facilite la mesure des durées. Le format des horodatages dépend de la préférence [Horodatages](/more-features/timestamps).
:::

## Panneau de contrôle {#control-pane}

Pour commencer, faites glisser un champ vers l'une des trois sections (axe gauche, axe droit ou champs discrets). Vous pouvez supprimer un champ avec le bouton X, ou le masquer temporairement en cliquant sur l'icône d'œil ou en double-cliquant sur son nom. Pour tout retirer, cliquez sur les trois points à côté du titre de l'axe, puis sur `Tout effacer`. Vous pouvez également réorganiser les champs dans la liste par glisser-déposer.

Personnalisez la couleur et le style de ligne de chaque champ en cliquant sur l'icône colorée ou en faisant un clic droit sur son nom. Pour visualiser les données de l'API d'alertes persistantes de WPILib ([persistent alerts](https://docs.wpilib.org/fr/latest/docs/software/telemetry/persistent-alerts.html)), ajoutez le groupe d'alertes en tant que champ discret. Voici un exemple d'affichage ci-dessous.

<img src="/img/tab-reference/line-graph/line-graph-2.webp" alt="Visualisation des alertes" />

:::tip
Pour superposer le mode du robot (autonome, téléopéré ou utilitaire), cliquez sur les trois points à côté de « Champs discrets », puis sur `Afficher le mode du robot`.

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="Superposition du mode robot" />

_L'interface en anglais est illustrée ci-dessus._
:::

### Réglage des axes {#adjusting-axes}

Par défaut, chaque axe adapte son échelle aux données visibles. Pour désactiver cette mise à l'échelle automatique et figer l'axe sur ses bornes minimale et maximale actuelles, cliquez sur les trois points à côté du titre de l'axe, puis sur `Verrouiller l'axe`. Pour définir l'échelle manuellement, choisissez `Modifier la plage` et saisissez les valeurs souhaitées.

<img src="/img/tab-reference/line-graph/line-graph-4.webp" alt="Édition de la plage de l'axe" height="250" />

_L'interface en anglais est illustrée ci-dessus._

### Intégration et différenciation {#integration-and-differentiation}

AdvantageScope peut calculer automatiquement l'intégrale ou la dérivée de vos valeurs, le pas de temps étant toujours mesuré en secondes. Cliquez sur les trois points à côté du titre de l'axe, puis sélectionnez `Différencier` ou `Intégrer`.

:::info
Les dérivées sont calculées par [différence finie](https://fr.wikipedia.org/wiki/Diff%C3%A9rence_finie) entre échantillons adjacents, et les intégrales par la [méthode des trapèzes](https://fr.wikipedia.org/wiki/M%C3%A9thode_des_trap%C3%A8zes).
:::
