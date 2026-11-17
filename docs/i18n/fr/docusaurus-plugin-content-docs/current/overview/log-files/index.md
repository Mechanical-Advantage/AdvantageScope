# 📂 Fichiers journaux {#log-files}

## Formats pris en charge {#supported-formats}

- **WPILOG (.wpilog)** : produit par l'[enregistreur de données intégré](https://docs.wpilib.org/fr/stable/docs/software/telemetry/datalog.html) de WPILib et par AdvantageKit. Vous pouvez aussi utiliser [URCL](/more-features/urcl) pour enregistrer les signaux des contrôleurs de moteur REV dans un fichier WPILOG.
- **Hoot (.hoot)** : produit par le [*Signal Logger*](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) de Phoenix 6 (CTRE).
- **REVLOG (.revlog)** : produit par le [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) de REV Robotics.
- **Road Runner (.log)** : produit par la bibliothèque [Road Runner](https://github.com/acmerobotics/road-runner) pour FTC.
- **CSV (.csv)** : valeurs séparées par des virgules, au même format que celui [exporté](/overview/log-files/export) par AdvantageScope en mode « CSV (Tableau) » ou « CSV (Liste) ». Voir [ci-dessous](#csv-formatting) pour plus de détails.
- **Journaux de la console de pilotage NI (.dslog et .dsevents)** : ancien format produit par la [console de pilotage FRC](https://docs.wpilib.org/fr/stable/docs/software/driverstation/driver-station.html) de NI (2010-2026). Lorsque vous ouvrez l'un des deux fichiers, AdvantageScope recherche automatiquement le fichier complémentaire.
- **RLOG (.rlog)** : ancien format produit par AdvantageKit 2022.

:::info
Pour ouvrir des fichiers Hoot, vous devez d'abord accepter le [contrat de licence utilisateur final](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt) de CTRE. AdvantageScope vous le demandera automatiquement lors de la première ouverture d'un fichier Hoot.
:::

## Ouvrir des journaux {#opening-logs}

Dans la barre de menus, cliquez sur `Fichier` > `Ouvrir un ou plusieurs journaux...` puis sélectionnez un ou plusieurs fichiers sur votre ordinateur. Vous pouvez aussi glisser-déposer un fichier directement sur l'icône ou la fenêtre d'AdvantageScope.

:::info
Si vous ouvrez plusieurs fichiers en même temps, leurs horodatages sont automatiquement alignés pour faciliter la comparaison entre différentes sources. Consultez la page [Horodatages](/more-features/timestamps) pour en savoir plus sur les options d'affichage.
:::

<img src="/img/overview/log-files/open-file-1.webp" alt="Ouverture d'un journal enregistré" />

_L'interface en anglais est illustrée ci-dessus._

## Ajouter de nouveaux journaux {#adding-new-logs}

Une fois un fichier journal ouvert, vous pouvez facilement en ajouter d'autres à la même session. Leurs horodatages seront automatiquement recalés sur les données déjà affichées.

Dans la barre de menus, cliquez sur `Fichier` > `Ajouter de nouveaux journaux...`, puis choisissez un ou plusieurs fichiers à ajouter. Les champs de chaque journal seront regroupés dans des tables nommées `Log0`, `Log1`, etc.

## Télécharger depuis le robot {#downloading-from-the-robot}

<details>
<summary>Configuration</summary>

Ouvrez les préférences via `App` > `Afficher les préférences...` (Windows/Linux) ou `AdvantageScope` > `Paramètres...` (macOS), puis renseignez l'adresse du robot et le chemin du dossier des journaux.

<img src="/img/prefs_fr.webp" alt="Fenêtre des préférences" height="450" />
</details>

Cliquez sur `Fichier` > `Télécharger les journaux...` pour ouvrir la fenêtre de téléchargement (prise en charge sur Systemcore et roboRIO). Une fois la connexion établie, les fichiers disponibles s'affichent du plus récent au plus ancien. Sélectionnez un ou plusieurs fichiers ou dossiers (Maj-clic pour une plage, ou **cmd/ctrl + A** pour tout sélectionner), puis cliquez sur la flèche ↓ pour choisir où les enregistrer.

:::tip
Lors d'un téléchargement groupé, AdvantageScope ignore automatiquement les fichiers déjà présents dans le dossier de destination.
:::

<img src="/img/overview/log-files/open-file-2.webp" alt="Téléchargement des fichiers journaux" height="350" />

_L'interface en anglais est illustrée ci-dessus._

## Format CSV {#csv-formatting}

Les en-têtes de colonnes CSV doivent suivre le modèle « Timestamp, Key, Value » ou « Timestamp, (Key), (Key), etc. ». Les horodatages sont exprimés en secondes. Voici le format attendu pour les types de valeurs courants. Notez qu'exporter puis réimporter un journal en CSV entraîne une _perte d'information_, car ce format ne gère pas les types complexes.

- **Booléens :** `true` ou `false`
- **Chaînes de caractères :** `"(valeur)"`
  - Exemple : `"Bonjour le monde"`
- **Tableaux :** `[(valeur); (valeur); (valeur)]`
  - Exemple : `[1; 2; 3]`
- **Octets :** hexadécimal, séparés par `-`
  - Exemple : `4d-41-36-33-32-38`
