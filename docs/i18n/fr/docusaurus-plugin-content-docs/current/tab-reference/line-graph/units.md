# Prise en charge des unités

L'onglet graphique linéaire prend en compte les unités, ce qui signifie que les valeurs numériques peuvent être facilement converties entre des types d'unités compatibles. Lorsque les informations d'unité sont disponibles, toutes les valeurs numériques sont également étiquetées avec précision lorsqu'elles sont affichées dans les axes ou les légendes. Voir [ici](#supported-formats) pour plus d'informations sur la publication des informations d'unité. AdvantageScope fournit plusieurs outils pour convertir rapidement entre les unités :

- Lors de l'ajout de **champs sur le même axe avec des types d'unités compatibles**, AdvantageScope convertit automatiquement les deux champs dans la même unité. Cela se reflète dans l'étiquetage de l'axe Y et de la légende.
- Cliquez sur les trois points près du titre de l'axe pour **passer rapidement à d'autres unités**. Cette liste comprend les unités les plus courantes qui sont compatibles avec les champs sélectionnés.
- Activez l'**intégration ou la différenciation** ([docs](/tab-reference/line-graph/#integration--differentiation)) pour voir les unités intégrales ou dérivées précises. L'unité de base peut être ajustée à l'aide du menu pour prendre en charge le filtrage dans des unités non natives.

<img src="/img/tab-reference/line-graph/units-1.png" alt="Graphiques avec unités" />

## Formats pris en charge {#supported-formats}

AdvantageScope prend en charge plusieurs méthodes pour fournir des informations d'unité sur chaque champ. La plupart des unités courantes sont prises en charge; pour une liste complète, consultez le menu surgissant lors de la configuration de la [conversion manuelle](#manual-conversion).

Pour (2) et (3), les types d'unités sont analysés à l'aide de chaînes. AdvantageScope prend en charge plusieurs noms pour chaque unité, y compris les abréviations courantes (par ex. `ft` et `feet` sont tous deux acceptés). Notez que les noms d'unités doivent être fournis à l'aide de symboles SI ou de l'anglais américain, quelle que soit la langue sélectionnée dans AdvantageScope. Si un nom d'unité n'est pas analysé comme prévu, veuillez [ouvrir un problème](https://github.com/Mechanical-Advantage/AdvantageScope/issues).

:::tip
Vous ne savez pas si les unités sont correctement analysées? Vérifiez si un type d'unité est affiché sur l'axe Y lors de l'ajout d'un champ au graphique linéaire.
:::

### 🥇 Unités de structure

AdvantageScope utilise automatiquement les unités natives pour les types de données structurées courants comme `Rotation2d` et `Translation3d`. La publication de valeurs applicables à l'aide de ces formats est **toujours le meilleur moyen de publier des données** et garantit une compatibilité maximale lors de la visualisation des données géométriques.

### 🥈 Métadonnées de champ

Les formats WPILOG et NetworkTables prennent en charge la publication de « métadonnées » supplémentaires pour chaque champ. AdvantageScope recherche les champs JSON nommés « unit » ou « units » contenant un nom de chaîne pour le type d'unité (en utilisant des espaces, camel-case, pascal-case ou snake-case). Pour vérifier les métadonnées de chaque champ, survolez le nom du champ dans la barre latérale.

:::tip
AdvantageKit inclut la prise en charge des métadonnées d'unité lors de l'enregistrement des entrées et des sorties, y compris la journalisation des annotations. Consultez la documentation [ici](https://docs.advantagekit.org/data-flow/supported-types#units) pour plus de détails.
:::

### 🥉 Nommage des champs

En cas de repli, AdvantageScope tente de déterminer le type d'unité correct en analysant le nom de chaque champ. **Le type d'unité doit être inclus en tant que suffixe.** AdvantageScope prend en charge une variété de schémas de nommage. Certaines options valides sont énumérées ci-dessous :

- **Camel/pascal-case**, comme `PositionMeters`, `velocityRadPerSec` et `TimestampS`
- **Snake-case**, comme `position_meters`, `velocity_rad_per_sec` et `timestamp_s`
- **Séparateurs d'espaces**, comme `position meters`, `velocity rad per sec` et `timestamp s`

Le nommage n'est _pas_ sensible à la casse lors de l'utilisation du snake-case ou des séparateurs d'espaces.

:::tip
Si les unités sont mal analysées, cliquez sur `Unités manuelles` > `Désactiver les unités automatiques` pour ignorer les informations d'unité. La conversion manuelle peut ensuite être utilisée pour passer à d'autres unités.
:::

## Conversion manuelle {#manual-conversion}

Lorsque les métadonnées d'unité ne sont pas disponibles ou sont inexactes, les axes peuvent également être configurés manuellement pour convertir entre les unités (or ignorer complètement les métadonnées d'unité).

Pour configurer la conversion manuelle, cliquez sur les trois points près du titre de l'axe, puis sur `Unités manuelles` > `Modifier la conversion...`. Sélectionnez le type d'unité, l'unité source et l'unité de destination. Chaque valeur est également multipliée par le « Facteur supplémentaire », permettant des conversions personnalisées (comme les rapports de démultiplication, les conversions angulaires en linéaires, ou d'autres unités non fournies par AdvantageScope). Le facteur peut également être saisi à l'aide d'une expression mathématique telle que `1.5*pi`.

:::tip
Pour activer ou désactiver rapidement la conversion d'unités, cliquez sur les trois points près du titre de l'axe et choisissez `Préréglages récents` ou `Réinitialiser les unités`.
:::

<img src="/img/tab-reference/line-graph/units-2.png" alt="Modification de la conversion d'unités" height="250" />
