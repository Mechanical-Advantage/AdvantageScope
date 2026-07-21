---
sidebar_position: 6
---

# 📊 Statistiques

L'onglet statistiques permet une analyse statistique approfondie des champs numériques, en analysant les tendances globales plutôt que les changements au fil du temps. Les champs sélectionnés sont analysés à l'aide d'un histogramme et d'une variété de mesures statistiques standard.

<img src="/img/tab-reference/statistics-1.png" alt="Aperçu de l'onglet statistiques" />

## Panneau de contrôle

Pour commencer, faites glisser un champ vers la section « Mesures ». Supprimez un champ à l'aide du bouton X, ou masquez-le temporairement en cliquant sur l'icône de l'œil ou en double-cliquant sur le nom du champ. Pour supprimer tous les champs, cliquez sur les trois points près du titre de l'axe, puis sur `Tout effacer`. Les champs peuvent être réorganisés dans la liste en les faisant glisser.

Pour analyser la différence entre les champs, basculez un champ en mode « Référence » et ajoutez d'autres champs supplémentaires en tant qu'enfants. Les enfants peuvent être basculés entre les modes « Erreur relative » et « Erreur absolue ».

:::info
La couleur de chaque champ peut être personnalisée en cliquant sur l'icône colorée ou en faisant un clic droit sur le nom du champ.
:::

### Configuration

L'option **Plage de temps** sélectionne les parties du journal utilisées pour l'analyse :

- _Plage visible :_ Analyse la plage de temps visible sur la chronologie.
- _Journal complet :_ Analyse la plage complète du fichier journal.
- _Activé :_ Analyse les plages de temps où le robot est activé.
- _Auto :_ Analyse les plages de temps où le robot est en mode autonome.
- _Téléopéré :_ Analyse les plages de temps où le robot est en mode téléopéré.
- _En direct : 30 secondes :_ Analyse les 30 secondes les plus récentes (lors d'une connexion à une source en direct).
- _En direct : 10 secondes :_ Analyse les 10 secondes les plus récentes (lors d'une connexion à une source en direct).

L'option **Plage de données** sélectionne les valeurs minimale et maximale à afficher sur l'histogramme. Les données en dehors de cette plage ne sont pas affichées, mais elles continuent d'être utilisées pour les mesures statistiques.

L'option **Taille du pas** sélectionne la taille de chaque intervalle de l'histogramme. Des valeurs plus petites produisent des graphiques plus détaillés, mais révèlent également plus de bruit.

## Volet de visualisation

### Histogramme

L'histogramme montre le nombre d'échantillons qui tombent dans chaque intervalle, dans la plage spécifique. Notez que les données en dehors de la plage spécifiée sont ignorées (plutôt que d'être regroupées dans un intervalle séparé).

### Mesures statistiques

Le tableau des mesures statistiques montre les valeurs calculées de chaque mesure pour les champs fournis. Plus d'informations sur chaque mesure sont fournies ci-dessous.

#### Résumé

- **Nombre :** Le nombre d'échantillons discrets générés.
- **Min :** La plus petite valeur dans les données.
- **Max :** La plus grande valeur dans les données.

#### Centre

- [**Moyenne :**](https://en.wikipedia.org/wiki/Arithmetic_mean) La moyenne arithmétique (moyenne simple) des données.
- [**Médiane :**](https://en.wikipedia.org/wiki/Median) La valeur « du milieu » des données, ou le 50e centile.
- [**Mode :**](<https://en.wikipedia.org/wiki/Mode_(statistics)>) La valeur la plus courante dans les données.
- [**Moyenne géométrique :**](https://en.wikipedia.org/wiki/Geometric_mean) Une mesure du centre calculée en utilisant le produit des valeurs plutôt que la somme. Applicable lors de la mesure des _taux de croissance exponentiels_ (comme le pourcentage de changement entre les cycles).
- [**Moyenne harmonique :**](https://en.wikipedia.org/wiki/Harmonic_mean) Une mesure du centre calculée en utilisant la somme des inverses des valeurs. Applicable lors de la mesure de _taux ou de vitesses_.
- [**Moyenne quadratique :**](https://en.wikipedia.org/wiki/Root_mean_square) Une mesure du centre calculée en utilisant les carrés des valeurs. Applicable lors de la mesure de données avec des _valeurs positives et négatives_, comme un mouvement périodique.

#### Écart

- [**Écart-type :**](https://en.wikipedia.org/wiki/Standard_deviation) La mesure statistique de variation la plus courante, où une valeur plus faible indique moins de variation. 68 % des données se situent à moins d'un écart-type de la moyenne.
- [**Écart absolu moyen :**](https://en.wikipedia.org/wiki/Average_absolute_deviation) La distance moyenne entre chaque valeur et la moyenne. Il s'agit d'une alternative à l'écart-type.
- [**Écart interquartile :**](https://en.wikipedia.org/wiki/Interquartile_range) La différence entre le troisième et le premier quartile (75e centile et 25e centile), moins affectée par les valeurs aberrantes que l'écart-type ou l'écart absolu moyen.
- [**Asymétrie :**](https://en.wikipedia.org/wiki/Skewness) Une mesure de l'asymétrie des données. Une valeur négative indique une queue vers la gauche, une valeur positive indique une queue vers la droite, et une valeur nulle suggère une distribution symétrique.

#### Centiles

Les [centiles](https://en.wikipedia.org/wiki/Percentile) mesurent les valeurs en dessous desquelles se situent le pourcentage donné d'autres valeurs. Par exemple, 10 % des valeurs se situent en dessous du 10e centile. Les centiles suivants sont également connus sous le nom de :

- 25e centile = 1er quartile (Q1)
- 50e centile = 2e quartile (Q2) = médiane
- 75e centile = 3e quartile (Q3)
