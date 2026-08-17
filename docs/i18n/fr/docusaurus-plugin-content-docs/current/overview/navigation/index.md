# 🧭 Navigation dans l'application {#app-navigation}

La capture d'écran ci-dessous montre les éléments importants de la fenêtre principale d'AdvantageScope. L'apparence exacte diffère selon les systèmes d'exploitation.

<img src="/img/overview/navigation/navigation-1.webp" alt="Schéma de navigation" />

_L'interface en anglais est illustrée ci-dessus._

- La section rouge est la [barre latérale](#sidebar), qui liste les champs disponibles.
- La section marron est la [barre d'onglets](#tab-bar), qui contrôle l'application et sert à basculer entre les vues.
- La section bleue est le [volet de visualisation](#viewer-pane), qui affiche les données.
- La section verte est le [panneau de contrôle](#control-pane), qui est utilisé pour ajuster la visualisation.

:::tip
Pour visualiser plusieurs fichiers journaux simultanément, cliquez sur `Fichier` > `Nouvelle fenêtre`.
:::

## Barre latérale {#sidebar}

À gauche se trouve la barre latérale avec la liste des tables et des champs disponibles. Les champs sélectionnables sont affichés en _italique_ et les tables intégrées (provenant de WPILib ou d'AdvantageKit) sont <u>soulignées</u>. Cliquez sur la flèche pour développer les tables imbriquées. **Faites glisser un champ unique** pour le sélectionner ou **maintenez la touche cmd/ctrl** enfoncée pour sélectionner une collection de champs en cliquant sur chacun d'eux. Commencez à faire glisser la collection de champs pour terminer la sélection.

Pour rechercher un champ, commencez à taper dans la zone de recherche. Une liste déroulante de champs s'affichera, puis le champ sélectionné sera mis en surbrillance dans la barre latérale et amené dans la vue.

:::info
Cliquez et faites glisser sur le bord droit pour redimensionner ou masquer la barre latérale. Double-cliquez pour activer ou désactiver la visibilité de la barre latérale.
:::

## Barre d'onglets {#tab-bar}

Utilisez la barre d'onglets (bleue) pour basculer entre les différentes vues. Cette documentation est disponible à tout moment en cliquant sur l'icône 📖 à gauche. Pour exporter la disposition actuelle de l'onglet (et les paramètres associés), cliquez sur `Fichier` > `Exporter la disposition...` Pour importer une disposition à partir d'un fichier, cliquez sur `Fichier` > `Importer la disposition...`

:::info
Les onglets peuvent être réorganisés en les faisant glisser, ou renommés en faisant un clic droit et en sélectionnant `Renommer...`
:::

Les boutons de navigation (verts) en haut gèrent les onglets et contrôlent la lecture.

- **Bouton Plus :** Ouvre un menu déroulant pour créer un nouvel onglet.
- **Bouton Fenêtre :** Crée une nouvelle fenêtre détachée avec l'onglet. Cette fonctionnalité peut être utilisée pour visualiser simultanément des données provenant de plusieurs onglets.
- **Bouton X :** Ferme l'onglet actuel.
- **Bouton Lecture :** Démarre et arrête la lecture en temps réel. _Faites un clic droit pour modifier la vitesse de lecture ou activer la lecture en boucle._

## Volet de visualisation {#viewer-pane}

Le volet de visualisation est l'endroit où les données sont présentées pour chaque type d'onglet. Consultez la documentation de référence des onglets pour plus de détails sur le volet de visualisation de chaque onglet. Cette vue peut être déplacée vers une fenêtre distincte en cliquant sur le bouton de détachement dans la barre d'onglets.

## Panneau de contrôle {#control-pane}

Le panneau de contrôle est utilisé pour sélectionner des champs à visualiser et gérer d'autres options. Consultez la documentation de référence des onglets pour plus de détails sur les options disponibles pour chaque onglet.

:::info
Cliquez et faites glisser sur le bord supérieur pour redimensionner ou masquer le panneau de contrôle. Double-cliquez pour activer ou désactiver la visibilité du panneau de contrôle.
:::
