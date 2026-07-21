# 📂 Fichiers journaux

## Formats pris en charge

- **WPILOG (.wpilog)** - Produit par la [journalisation intégrée](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) de WPILib et AdvantageKit. [URCL](/more-features/urcl) peut être utilisé pour capturer les signaux des contrôleurs de moteur REV dans un fichier WPILOG.
- **Journaux de la console de pilotage (.dslog et .dsevents)** - Produits par la [console de pilotage FRC](https://docs.wpilib.org/en/stable/docs/software/driverstation/driver-station.html). AdvantageScope recherche automatiquement le fichier journal correspondant lors de l'ouverture de l'un ou l'autre type de journal.
- **Hoot (.hoot)** - Produit par le [signal logger](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) de Phoenix 6 de CTRE.
- **REVLOG (.revlog)** - Produit par le [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) de REV Robotics.
- **Road Runner (.log)** - Produit par la bibliothèque [Road Runner](https://github.com/acmerobotics/road-runner) pour FTC.
- **CSV (.csv)** - Valeurs séparées par des virgules, correspondant au format [exporté](/overview/log-files/export) par AdvantageScope dans les modes « CSV (Tableau) » ou « CSV (Liste) ». Voir [ici](#csv-formatting) pour plus de détails.
- **RLOG (.rlog)** - Hérité, produit par AdvantageKit 2022.

:::info
Les fichiers journaux Hoot ne peuvent être ouverts qu'après avoir accepté le [contrat de licence utilisateur final](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt) de CTRE. AdvantageScope affiche une invite pour confirmer l'acceptation de ces conditions lors de l'ouverture d'un fichier journal Hoot pour la première fois.
:::

## Ouverture de journaux

Dans la barre de menu, cliquez sur `Fichier` > `Ouvrir un ou plusieurs journaux...`, puis choisissez un ou plusieurs fichiers journaux sur le disque local. Faire glisser un fichier journal depuis le navigateur de fichiers du système vers l'icône ou la fenêtre d'AdvantageScope provoque également son ouverture.

:::info
Si plusieurs fichiers sont ouverts simultanément, les horodatages seront alignés automatiquement. Cela permet une comparaison facile des fichiers journaux provenant de plusieurs sources.
:::

<img src="/img/overview/log-files/open-file-1.png" alt="Ouverture d'un journal enregistré" />

## Ajout de nouveaux journaux

Après avoir ouvert un fichier journal, des journaux supplémentaires peuvent être facilement ajoutés à la visualisation. Les horodatages seront réalignés automatiquement pour se synchroniser avec les données existantes.

Dans la barre de menu, cliquez sur `Fichier` > `Ajouter de nouveaux journaux...`, puis choisissez un ou plusieurs fichiers journaux à ajouter à la visualisation actuelle. Les champs de chaque journal seront enregistrés dans des tableaux nommés `Log0`, `Log1`, etc.

## Téléchargement depuis le robot {#downloading-from-the-robot}

<details>
<summary>Configuration</summary>

Ouvrez la fenêtre des préférences en cliquant sur `Application` > `Afficher les préférences...` (Windows/Linux) ou `AdvantageScope` > `Paramètres...` (macOS). Mettez à jour l'adresse du robot et le dossier des journaux.

<img src="/img/prefs.png" alt="Schéma des préférences" height="350" />
</details>

Cliquez sur `Fichier` > `Télécharger les journaux...` pour ouvrir la fenêtre de téléchargement. Une fois connecté au robot, les journaux disponibles sont affichés avec le plus récent en haut. Sélectionnez un ou plusieurs fichiers journaux à télécharger (Maj-clic pour sélectionner une plage ou **cmd/ctrl + A** pour tout sélectionner). Cliquez ensuite sur le symbole ↓ et sélectionnez un emplacement d'enregistrement.

:::info
Le [signal logger](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) de CTRE utilise un format non standard qui regroupe les journaux dans des sous-dossiers. Sélectionnez un ou plusieurs dossiers dans la liste pour télécharger les fichiers journaux sous forme de groupe.
:::

:::tip
Lors du téléchargement de plusieurs fichiers, AdvantageScope ignore ceux qui existent déjà dans le dossier de destination.
:::

<img src="/img/overview/log-files/open-file-2.png" alt="Téléchargement de fichiers journaux" height="350" />

## Formatage CSV {#csv-formatting}

Les noms de colonnes CSV doivent être soit « Timestamp, Key, Value » soit « Timestamp, (Key), (Key), etc. ». Les valeurs d'horodatage sont en secondes. La liste ci-dessous montre le format attendu des types de valeurs courants. Notez que l'exportation et la réimportation de données de journal sous forme de CSV entraînent une _perte de données_, car le format CSV ne prend pas en charge les types de champs complexes.

- **Booléens :** `true` ou `false`
- **Chaînes de caractères :** `"(valeur)"`
  - Exemple : `"Bonjour le monde"`
- **Tableaux :** `[(valeur); (valeur); (valeur)]`
  - Exemple : `[1; 2; 3]`
- **Octets :** hexadécimal, séparés par `-`
  - Exemple : `4d-41-36-33-32-38`
