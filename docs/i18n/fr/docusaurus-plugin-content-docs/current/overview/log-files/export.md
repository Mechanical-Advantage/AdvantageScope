# Exportation de données de journal

AdvantageScope comprend un système flexible pour exporter des données de journal sous forme de fichier CSV, WPILOG ou MCAP. Les fonctions d'exportation fonctionnent lors de la visualisation d'un fichier journal ou lors de la connexion à une source de données en direct. Les cas d'utilisation possibles incluent :

- La conversion d'un fichier WPILOG en CSV ou MCAP pour analyse dans d'autres applications.
- L'exportation d'un fichier WPILOG basé sur les données NetworkTables, pour un accès ultérieur.
- L'enregistrement d'un WPILOG avec un nombre limité de champs (et la suppression des valeurs en double) pour réduire la taille du fichier.

Pour afficher les options d'exportation, cliquez sur `Fichier` > `Exporter les données...`.

<img src="/img/overview/log-files/export-1.png" alt="Options d'exportation" height="250" />

:::tip
En plus de l'exportation complète du journal décrite ici, l'onglet 💬 [Console](/tab-reference/console) permet d'exporter les données de la console vers un fichier texte.
:::

:::warning
**Exportation de données pour SysId**

Nous ne recommandons pas d'utiliser cette fonctionnalité pour exporter des données de journal **générées en simulation** pour une utilisation dans [SysId](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/system-identification/introduction.html), car SysId nécessite des données d'horodatage supplémentaires incompatibles avec les options d'exportation par défaut d'AdvantageScope. Notez que les données de journal **générées _en dehors_ de la simulation** peuvent être exportées pour une utilisation dans SysId avec une perte de données minimale (bien qu'une précision maximale puisse être obtenue en utilisant directement le journal de données _original_ dans SysId).

_Cet avertissement **ne s'applique pas** aux journaux produits par AdvantageKit, qui peuvent être exportés sans aucune perte de données en sélectionnant l'option « Cycles AdvantageKit ». Consultez [cette page](https://docs.advantagekit.org/data-flow/sysid-compatibility) pour plus de détails._
:::

## Options

Les options suivantes sont fournies lors de l'exportation :

- **Format :** Définit le format général du fichier exporté. Voir les options ci-dessous.
  - _CSV (Tableau) :_ Valeurs séparées par des virgules, où chaque ligne représente un horodatage distinct et chaque colonne représente un champ (plus une colonne pour la valeur d'horodatage). Chaque ligne peut représenter une valeur dans plusieurs champs.
  - _CSV (Liste) :_ Valeurs séparées par des virgules, où chaque ligne représente une valeur dans un seul champ avec des colonnes pour l'horodatage, la clé et la valeur.
  - _WPILOG :_ Fichier WPILOG standard qui peut être rouvert dans AdvantageScope.
  - _MCAP :_ Fichier [MCAP](https://mcap.dev) standard qui peut être ouvert dans [Foxglove](https://foxglove.dev).
- **Horodatages :** Uniquement pour « CSV (Tableau) ». Définit la méthode de création de nouvelles lignes. Voir les options ci-dessous.
  - _Tous les changements :_ Crée de nouvelles lignes/entrées uniquement lorsque les valeurs des champs sont mises à jour. Minimise la taille de fichier de l'exportation.
  - _Période fixe :_ Crée de nouvelles lignes/entrées à un intervalle fixe, utile pour les journaux sans synchronisation d'horodatage (lorsque de nombreux champs sont enregistrés avec des horodatages similaires, mais non identiques). Notez que toutes les valeurs sont incluses, qu'il y ait eu ou non un changement entre les points d'échantillonnage.
  - _Cycles AdvantageKit :_ Crée une nouvelle ligne/entrée pour chaque cycle de boucle synchronisé d'AdvantageKit. Notez que toutes les valeurs sont incluses, qu'il y ait eu ou non un changement entre les cycles de boucle.
- **Période :** Uniquement lorsque « Période fixe » est sélectionné. Définit la période en millisecondes entre chaque échantillon. En règle générale, cela doit correspondre à la période de cycle de boucle du code robot.
- **Préfixes :** Si vide, inclut tous les champs. Sinon, n'inclut que les champs qui correspondent aux préfixes fournis (séparés par des virgules). Voir les exemples ci-dessous.
  - « _/DriverStation/Joystick0_ » : Inclut tous les champs commençant par « /DriverStation/Joystick0 » (données de la première manette).
  - « _Flywheels,DS:enabled_ » : Inclut tous les champs commençant par « /Flywheels » ou « DS:enabled » (toutes les données du volant d'inertie, plus l'état d'activation du robot).
  - « _Drive/LeftPosition,Drive/RightPosition_ » : N'inclut que les champs « /Drive/LeftPosition » et « /Drive/RightPosition ».
- **Ensemble de champs :** Voir les options ci-dessous. Les champs générés sont créés par AdvantageScope pour décomposer des types complexes et sont affichés avec un texte gris dans la barre latérale. Cela comprend les composants individuels des tableaux, structs et autres schémas.
  - _Inclure les champs générés :_ Exporte tous les champs visualisables, ce qui inclut les champs générés. Recommandé si les données exportées seront ouvertes dans une application non capable d'analyser des types complexes.
  - _Originaux uniquement :_ Exporte uniquement les champs qui étaient présents dans le fichier journal d'origine, ce qui exclut les champs générés. Recommandé si les données exportées seront ouvertes dans AdvantageScope ou une autre application capable d'analyser des types complexes.

Un exemple de fichier CSV exporté depuis AdvantageScope est illustré ci-dessous, au format « CSV (Tableau) » avec des horodatages définis sur « Tous les changements » :

<img src="/img/overview/log-files/export-2.png" alt="Tableau CSV" />
