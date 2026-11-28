# Exportation de données de journal {#exporting-log-data}

AdvantageScope propose un outil souple pour exporter vos données de journal au format CSV, WPILOG ou MCAP. L'exportation fonctionne aussi bien à partir d'un fichier journal ouvert qu'en direct depuis une source connectée. Elle sert notamment à :

- Convertir un fichier WPILOG en CSV ou MCAP pour l'analyser dans d'autres logiciels.
- Exporter au format WPILOG des données reçues via NetworkTables pour les consulter plus tard.
- Alléger un fichier WPILOG en ne conservant que certains champs et en supprimant les valeurs en double.

Pour ouvrir la fenêtre d'exportation, cliquez sur `Fichier` > `Exporter les données...`.

<img src="/img/overview/log-files/export-1.webp" alt="Options d'exportation" />

_L'interface en anglais est illustrée ci-dessus._

:::tip
En plus de l'exportation complète décrite ici, l'onglet 💬 [Console](/tab-reference/console) permet d'exporter les messages de la console dans un fichier texte.
:::

:::warning
**Exporter des données pour SysId**

Nous déconseillons d'utiliser cette fonction pour exporter vers [SysId](https://docs.wpilib.org/fr/stable/docs/software/advanced-controls/system-identification/introduction.html) des données **générées en simulation**, car SysId a besoin d'informations d'horodatage supplémentaires incompatibles avec les options d'exportation par défaut d'AdvantageScope. En revanche, les données **enregistrées _hors_ simulation** peuvent être exportées pour SysId avec une perte minimale (même si vous obtiendrez la meilleure précision en ouvrant directement le fichier journal _d'origine_ dans SysId).

_Cet avertissement **ne concerne pas** les journaux produits par AdvantageKit, qui s'exportent sans aucune perte en choisissant l'option « Cycles AdvantageKit ». Consultez [cette page](https://docs.advantagekit.org/data-flow/sysid-compatibility) pour en savoir plus._
:::

## Options {#options}

Les options suivantes sont disponibles lors de l'exportation :

- **Format :** choisit le format du fichier exporté.
  - _CSV (Tableau) :_ valeurs séparées par des virgules où chaque ligne correspond à un horodatage et chaque colonne à un champ (en plus de la colonne d'horodatage). Une même ligne peut donc regrouper les valeurs de plusieurs champs.
  - _CSV (Liste) :_ valeurs séparées par des virgules où chaque ligne contient une seule mesure, avec trois colonnes : horodatage, clé et valeur.
  - _WPILOG :_ fichier WPILOG standard, directement réouvrable dans AdvantageScope.
  - _MCAP :_ fichier [MCAP](https://mcap.dev) standard compatible avec [Foxglove](https://foxglove.dev).
- **Horodatages :** disponible uniquement pour « CSV (Tableau) ». Définit quand créer une nouvelle ligne dans le tableau.
  - _Tous les changements :_ n'ajoute une ligne que lorsqu'au moins un champ change de valeur, ce qui réduit au maximum la taille du fichier.
  - _Période fixe :_ crée une ligne à intervalle régulier. C'est utile pour les journaux dont les horodatages ne sont pas synchronisés (lorsque plusieurs champs sont enregistrés à des instants très proches mais pas identiques). Toutes les valeurs sont écrites à chaque pas, qu'elles aient changé ou non.
  - _Cycles AdvantageKit :_ crée une ligne pour chaque cycle de boucle synchronisé d'AdvantageKit. Toutes les valeurs sont incluses, même si elles n'ont pas changé d'un cycle à l'autre.
- **Période :** disponible uniquement lorsque « Période fixe » est sélectionné. Définit l'intervalle en millisecondes entre chaque échantillon. En général, choisissez la durée d'un cycle de boucle de votre code robot.
- **Préfixes :** laissez ce champ vide pour exporter tous les champs, ou indiquez une liste de préfixes séparés par des virgules pour filtrer l'exportation. Exemples :
  - « _/DriverStation/Joystick0_ » : inclut tous les champs commençant par « /DriverStation/Joystick0 » (les données de la première manette).
  - « _Flywheels,DS:enabled_ » : inclut tous les champs commençant par « /Flywheels » ou « DS:enabled » (toutes les données du lanceur ainsi que l'état d'activation du robot).
  - « _Drive/LeftPosition,Drive/RightPosition_ » : inclut uniquement les champs « /Drive/LeftPosition » et « /Drive/RightPosition ».
- **Ensemble de champs :** permet d'inclure ou non les champs générés par AdvantageScope (affichés en gris dans la barre latérale) qui décomposent les types complexes comme les tableaux, les structures (_structs_) et d'autres schémas.
  - _Inclure les champs générés :_ exporte tous les champs visibles, y compris les champs générés. C'est le meilleur choix si vous ouvrez le fichier dans un logiciel qui ne sait pas lire les types complexes.
  - _Originaux uniquement :_ exporte uniquement les champs présents dans le journal d'origine, sans les champs générés. Recommandé si vous comptez rouvrir le fichier dans AdvantageScope ou un autre outil gérant les types complexes.

Voici un exemple de fichier CSV exporté depuis AdvantageScope au format « CSV (Tableau) » avec l'option « Tous les changements » :

<img src="/img/overview/log-files/export-2.webp" alt="Tableau CSV" />
