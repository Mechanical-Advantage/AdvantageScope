---
sidebar_position: 6
---

# 📊 Statistiques {#statistics}

L'onglet Statistiques propose une analyse statistique approfondie des champs numériques, en étudiant les tendances globales plutôt que l'évolution au fil du temps. Les champs sélectionnés sont analysés à l'aide d'un histogramme et de plusieurs indicateurs statistiques courants.

<img src="/img/tab-reference/statistics-1.webp" alt="Aperçu de l'onglet Statistiques" />

_L'interface en anglais est illustrée ci-dessus._

## Panneau de contrôle {#control-pane}

Pour commencer, faites glisser un champ vers la section « Mesures ». Vous pouvez supprimer un champ avec le bouton X, ou le masquer temporairement en cliquant sur l'icône d'œil ou en double-cliquant sur son nom. Pour tout retirer, cliquez sur la corbeille à côté du titre de la section, puis sur `Tout effacer`. Vous pouvez également réorganiser les champs dans la liste par glisser-déposer.

Pour comparer des champs entre eux, passez l'un d'eux en mode « Référence » et ajoutez d'autres champs comme enfants. Chaque enfant peut ensuite basculer entre les modes « Erreur relative » et « Erreur absolue ».

:::info
Vous pouvez personnaliser la couleur de chaque champ en cliquant sur son icône colorée ou en faisant un clic droit sur son nom.
:::

### Configuration {#configuration}

L'option **Plage de temps** détermine quelles portions du journal sont prises en compte dans l'analyse :

- _Plage visible :_ analyse uniquement la plage de temps affichée sur la chronologie.
- _Journal complet :_ analyse l'intégralité du fichier journal.
- _Activé :_ analyse les intervalles où le robot est activé.
- _Auto :_ analyse les intervalles où le robot est en mode autonome.
- _Téléopéré :_ analyse les intervalles où le robot est en mode téléopéré.
- _En direct : 30 secondes :_ analyse les 30 dernières secondes (en connexion en direct).
- _En direct : 10 secondes :_ analyse les 10 dernières secondes (en connexion en direct).

L'option **Plage de données** définit les bornes minimale et maximale affichées sur l'histogramme. Les valeurs hors de cette plage ne sont pas tracées, mais restent incluses dans le calcul des indicateurs statistiques.

L'option **Taille du pas** règle la largeur de chaque barre de l'histogramme. Un pas plus petit donne un graphique plus fin, mais fait aussi ressortir davantage le bruit.

## Volet de visualisation {#viewer-pane}

### Histogramme {#histogram}

L'histogramme indique le nombre d'échantillons contenus dans chaque intervalle à l'intérieur de la plage choisie. Notez que les données situées hors de cette plage sont ignorées (plutôt que regroupées dans une barre séparée).

### Mesures statistiques {#statistical-measures}

Le tableau des mesures statistiques présente les valeurs calculées pour chacun des champs sélectionnés. Voici le détail de chaque indicateur.

#### Résumé {#summary}

- **Nombre :** le nombre total d'échantillons discrets enregistrés.
- **Min :** la plus petite valeur observée.
- **Max :** la plus grande valeur observée.

#### Centre {#center}

- [**Moyenne :**](https://fr.wikipedia.org/wiki/Moyenne_arithm%C3%A9tique) la moyenne arithmétique (moyenne classique) des données.
- [**Médiane :**](<https://fr.wikipedia.org/wiki/M%C3%A9diane_(statistiques)>) la valeur « du milieu », soit le 50e centile.
- [**Mode :**](<https://fr.wikipedia.org/wiki/Mode_(statistiques)>) la valeur la plus fréquente dans les données.
- [**Moyenne géométrique :**](https://fr.wikipedia.org/wiki/Moyenne_g%C3%A9om%C3%A9trique) un indicateur calculé à partir du produit des valeurs plutôt que de leur somme, utile pour les _taux de croissance exponentiels_ (comme une variation en pourcentage d'un cycle à l'autre).
- [**Moyenne harmonique :**](https://fr.wikipedia.org/wiki/Moyenne_harmonique) un indicateur calculé à partir de la somme des inverses des valeurs, adapté aux _taux et aux vitesses_.
- [**Moyenne quadratique :**](https://fr.wikipedia.org/wiki/Moyenne_quadratique) un indicateur calculé à partir des carrés des valeurs, utile pour des grandeurs comportant des _valeurs positives et négatives_, comme un mouvement oscillant.

#### Dispersion {#spread}

- [**Écart-type :**](https://fr.wikipedia.org/wiki/%C3%89cart_type) la mesure de dispersion la plus répandue (plus elle est faible, moins les valeurs varient). Pour une loi normale, environ 68 % des données se trouvent à moins d'un écart-type de la moyenne.
- [**Écart absolu médian :**](https://fr.wikipedia.org/wiki/%C3%89cart_absolu_m%C3%A9dian) la médiane des écarts absolus par rapport à la médiane, moins sensible aux valeurs aberrantes que l'écart-type.
- [**Écart interquartile :**](https://fr.wikipedia.org/wiki/%C3%89cart_interquartile) la différence entre le troisième et le premier quartile (75e et 25e centiles), également plus robuste face aux valeurs aberrantes que l'écart-type.
- [**Asymétrie :**](<https://fr.wikipedia.org/wiki/Asym%C3%A9trie_(statistiques)>) une mesure du décalage de la distribution. Une valeur négative indique une queue vers la gauche, une valeur positive une queue vers la droite, et une valeur proche de zéro une distribution symétrique.

#### Centiles {#percentiles}

Les [centiles](https://fr.wikipedia.org/wiki/Centile) indiquent le seuil sous lequel se situe un certain pourcentage des données. Par exemple, 10 % des valeurs sont inférieures au 10e centile. Certains centiles portent un nom particulier :

- 25e centile = 1er quartile (Q1)
- 50e centile = 2e quartile (Q2) = médiane
- 75e centile = 3e quartile (Q3)
