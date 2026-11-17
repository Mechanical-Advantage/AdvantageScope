# Prise en charge des unités {#unit-support}

L'onglet Graphique linéaire gère nativement les unités, ce qui vous permet de convertir facilement des valeurs numériques entre des unités compatibles. Dès que les informations d'unité sont disponibles, toutes les valeurs numériques sont étiquetées avec précision sur les axes et dans les légendes (consultez [cette section](#supported-formats) pour savoir comment les publier). AdvantageScope propose plusieurs outils pour passer rapidement d'une unité à l'autre :

- Lorsque vous placez sur le même axe des **champs dont les unités sont compatibles**, AdvantageScope les convertit automatiquement vers une unité commune, et met à jour l'axe Y ainsi que la légende.
- Cliquez sur les trois points à côté du titre de l'axe pour **basculer rapidement vers d'autres unités**. Ce menu propose les unités les plus courantes compatibles avec les champs affichés.
- Activez l'**intégration ou la différenciation** ([documentation](/tab-reference/line-graph/#integration-and-differentiation)) pour obtenir directement les unités de l'intégrale ou de la dérivée correspondantes. Vous pouvez également ajuster l'unité de base dans le menu afin d'appliquer ces filtres dans l'unité de votre choix.

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Graphiques avec unités" />

_L'interface en anglais est illustrée ci-dessus._

## Formats pris en charge {#supported-formats}

AdvantageScope propose plusieurs façons d'associer une unité à chaque champ. La grande majorité des unités courantes sont reconnues; pour voir la liste complète, ouvrez le menu déroulant lors de la configuration d'une [conversion manuelle](#manual-conversion).

Pour les méthodes (2) et (3), AdvantageScope analyse des chaînes de caractères pour identifier l'unité. Plusieurs variantes sont acceptées pour chaque unité, y compris les abréviations usuelles (par ex. `ft` et `feet`) ainsi que les orthographes américaine et britannique (par ex. `meters` et `metres`). Attention : les noms d'unités doivent toujours être écrits avec des symboles SI ou en anglais, quelle que soit la langue choisie dans AdvantageScope. Si une unité n'est pas reconnue comme prévu, n'hésitez pas à [ouvrir un ticket (*issue*)](https://github.com/Mechanical-Advantage/AdvantageScope/issues).

:::tip
Vous voulez vérifier si vos unités sont bien reconnues? Regardez simplement si une unité s'affiche sur l'axe Y lorsque vous ajoutez le champ au graphique linéaire.
:::

### 🥇 Unités de structure {#struct-units}

AdvantageScope applique automatiquement les unités natives des types de données structurés courants comme `Rotation2d` et `Translation3d`. Publier vos données sous ces formats reste **toujours la meilleure approche**, car cela garantit une compatibilité optimale pour visualiser des grandeurs géométriques.

### 🥈 Métadonnées de champ {#field-metadata}

Les formats WPILOG et NetworkTables permettent d'associer des « métadonnées » à chaque champ. AdvantageScope recherche un champ JSON nommé `unit` ou `units` contenant le nom de l'unité sous forme de chaîne (avec des espaces, en *camelCase*, *PascalCase* ou *snake_case*). Pour consulter les métadonnées d'un champ, survolez son nom dans la barre latérale.

:::tip
Dans WPILib, enregistrer des objets `Measure` avec `Telemetry.log()` ajoute automatiquement les métadonnées d'unité. Vous pouvez aussi les définir explicitement via `Telemetry.setProperty("fieldName", "unit", "\"volts\"")`.

AdvantageKit prend également en charge les métadonnées d'unité lors de l'enregistrement des entrées et des sorties (voir [la documentation AdvantageKit](https://docs.advantagekit.org/data-flow/supported-types#units) pour plus de détails).
:::

### 🥉 Nommage des champs {#field-naming}

À défaut, AdvantageScope tente de déduire l'unité en analysant le nom du champ. **Le nom de l'unité doit apparaître en suffixe.** Plusieurs conventions de nommage sont acceptées, notamment :

- **CamelCase / PascalCase** : `PositionMeters`, `velocityRadPerSec`, `TimestampS`
- **Snake_case** : `position_meters`, `velocity_rad_per_sec`, `timestamp_s`
- **Séparateurs par espaces** : `position meters`, `velocity rad per sec`, `timestamp s`

La casse n'est _pas_ prise en compte avec le *snake_case* ni avec les séparateurs par espaces.

:::tip
Si une unité est mal interprétée, cliquez sur `Unités manuelles` > `Désactiver les unités automatiques` pour l'ignorer. Vous pourrez ensuite utiliser la conversion manuelle pour choisir l'unité souhaitée.
:::

## Conversion manuelle {#manual-conversion}

Lorsque les métadonnées d'unité sont absentes ou erronées, vous pouvez configurer manuellement la conversion d'un axe (ou ignorer complètement les métadonnées).

Pour cela, cliquez sur les trois points à côté du titre de l'axe, puis sur `Unités manuelles` > `Modifier la conversion`. Choisissez le type d'unité, l'unité source et l'unité de destination. Chaque valeur est également multipliée par le « Facteur supplémentaire », ce qui permet des conversions sur mesure (rapports de réduction, passage d'un angle à une distance linéaire ou unités absentes d'AdvantageScope). Ce facteur accepte aussi des expressions mathématiques comme `1.5*pi`.

:::tip
Pour activer ou désactiver rapidement une conversion d'unités, cliquez sur les trois points à côté du titre de l'axe et choisissez `Préréglages récents` ou `Réinitialiser les unités`.
:::

<img src="/img/tab-reference/line-graph/units-2.webp" alt="Édition de la conversion d'unités" height="250" />

_L'interface en anglais est illustrée ci-dessus._
