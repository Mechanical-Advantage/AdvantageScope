---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🪐 Journalisation universelle avec WPILOG

WPILOG est le format de journalisation ouvert standard utilisé dans tout l'écosystème WPILib. Avec AdvantageScope, WPILOG peut servir de conteneur universel pour plusieurs fichiers et formats de journaux. Cela signifie qu'un seul fichier `.wpilog` peut contenir plusieurs flux de données encodés dans n'importe quel format pris en charge par AdvantageScope, y compris CSV, des journaux spécifiques aux fabricants ou d'autres fichiers WPILOG.

Cette fonctionnalité est conçue pour simplifier les diagnostics en rassemblant **toutes les données de diagnostic d'un robot dans un seul fichier journal universel** : plus besoin de télécharger, d'associer ou de synchroniser plusieurs fichiers journaux pour un même match, même lors de la collecte de données provenant de bibliothèques tierces ou de services externes. Par exemple, un seul fichier WPILOG peut contenir :

- La télémétrie standard du robot publiée via l'API `Telemetry` de WPILib ou NetworkTables.
- Des signaux d'appareils à haute fréquence enregistrés par des bibliothèques de fabricants.
- Des données d'état provenant de coprocesseurs et de services externes enregistrées au format CSV ou WPILOG.
- Et bien plus encore !

Toutes ces données apparaissent dans une seule arborescence unifiée dans AdvantageScope, comme illustré ci-dessous avec un WPILOG contenant des signaux d'appareils capturés par plusieurs fabricants.

:::note
Sur Systemcore, [URCL](https://github.com/Mechanical-Advantage/URCL) a été remplacé par le [journaliseur d'état](https://docs.revrobotics.com/revlib/logs) officiel de REV. La journalisation universelle avec AdvantageScope permet au journaliseur d'état officiel d'enregistrer les données de tous les appareils REV dans un seul fichier WPILOG (de manière similaire à URCL).
:::

<img src="/img/more-features/universal-logging-1.webp" alt="Un fichier WPILOG affichant plusieurs journaux de fabricants dans la barre latérale." />

_L'interface en anglais est illustrée ci-dessus._

:::tip
Les utilisateurs d'AdvantageKit peuvent également profiter de la compression XZ pour réduire considérablement la taille des journaux tiers stockés dans un WPILOG. Consultez la documentation d'AdvantageKit sur les récepteurs de données de journal pour plus de détails.
:::

## Expérimental : Journalisation des fabricants {#experimental-vendor-logging}

De nombreux projets de robot génèrent plusieurs fichiers journaux simultanément : un fichier WPILOG standard pour la télémétrie WPILib/AdvantageKit ainsi que des fichiers propriétaires provenant de bibliothèques de fabricants. La journalisation universelle élimine cette séparation en intégrant ces journaux de fabricants directement dans le `.wpilog` principal. Consultez les instructions ci-dessous pour WPILib et AdvantageKit.

:::warning
Comme cette approche n'est pas officiellement prise en charge par les fabricants, les demandes d'assistance doivent être adressées à la [page des problèmes](https://github.com/Mechanical-Advantage/AdvantageScope/issues) d'AdvantageScope ou à software@team6328.org. Consultez [Exporter les données des fabricants](#exporting-vendor-data) pour savoir comment exporter les fichiers journaux d'origine à des fins de diagnostic.
:::

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

Téléchargez la classe [`VendorLogCapture.java`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.java) et placez-la dans votre projet de robot. Cette classe capture automatiquement les données des journaux de fabricants dans le `DataLog` actif et doit être configurée dans votre constructeur `Robot` comme indiqué ci-dessous. Vous devez choisir un répertoire approprié (nous recommandons `/home/systemcore/logs/`) pour stocker temporairement les journaux de fabricants pendant la capture. Consultez la section [Fonctionnement](#how-it-works) pour plus de détails.

```java
public Robot() {
  // Démarre DataLogManager de WPILib normalement
  DataLogManager.start();

  // Active la capture des journaux de fabricants depuis un répertoire temporaire
  // Nous recommandons de stocker temporairement les journaux de fabricants sur le stockage interne
  // même lors de l'utilisation d'une clé USB (les journaux de fabricants ne persistent pas après capture)
  VendorLogCapture.start(DataLogManager.getLog(), "/home/systemcore/logs/");

  // Démarre le journaliseur du fabricant APRÈS l'activation de la capture
  // S'il est configurable, le répertoire de sortie doit correspondre au chemin ci-dessus
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

Téléchargez les fichiers [`VendorLogCapture.hpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.hpp) et [`VendorLogCapture.cpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.cpp) et placez-les dans votre projet de robot. Cette classe capture automatiquement les données des journaux de fabricants dans le `DataLog` actif et doit être configurée dans votre constructeur `Robot` comme indiqué ci-dessous. Vous devez choisir un répertoire approprié (nous recommandons `/home/systemcore/logs/`) pour stocker temporairement les journaux de fabricants pendant la capture. Consultez la section [Fonctionnement](#how-it-works) pour plus de détails.

```cpp
Robot::Robot() {
  // Démarre DataLogManager de WPILib normalement
  wpi::DataLogManager::Start();

  // Active la capture des journaux de fabricants depuis un répertoire temporaire
  // Nous recommandons de stocker temporairement les journaux de fabricants sur le stockage interne
  // même lors de l'utilisation d'une clé USB (les journaux de fabricants ne persistent pas après capture)
  VendorLogCapture::Start(wpi::DataLogManager::GetLog(), "/home/systemcore/logs/");

  // Démarre le journaliseur du fabricant APRÈS l'activation de la capture
  // S'il est configurable, le répertoire de sortie doit correspondre au chemin ci-dessus
  VendorLogger::SetPath("/home/systemcore/logs/");
  VendorLogger::Start();
}
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

Téléchargez le fichier [`vendor_log_capture.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/vendor_log_capture.py) et placez-le dans votre projet de robot. Cet utilitaire capture automatiquement les données des journaux de fabricants dans le `DataLog` actif et doit être configuré dans `robotInit` comme indiqué ci-dessous. Vous devez choisir un répertoire approprié (nous recommandons `/home/systemcore/logs/`) pour stocker temporairement les journaux de fabricants pendant la capture. Consultez la section [Fonctionnement](#how-it-works) pour plus de détails.

```python
class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # Démarre DataLogManager de WPILib normalement
        wpilib.DataLogManager.start()

        # Active la capture des journaux de fabricants depuis un répertoire temporaire
        # Nous recommandons de stocker temporairement les journaux de fabricants sur le stockage interne
        # même lors de l'utilisation d'une clé USB (les journaux de fabricants ne persistent pas après capture)
        VendorLogCapture.start(wpilib.DataLogManager.get_log(), "/home/systemcore/logs/")

        # Démarre le journaliseur du fabricant APRÈS l'activation de la capture
        # S'il est configurable, le répertoire de sortie doit correspondre au chemin ci-dessus
        VendorLogger.set_path("/home/systemcore/logs/")
        VendorLogger.start()
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit (Bientôt disponible)">

La capture des journaux de fabricants est intégrée à AdvantageKit et peut être activée comme indiqué ci-dessous. Vous devez choisir un répertoire approprié (nous recommandons `/home/systemcore/logs/`) pour stocker temporairement les journaux de fabricants pendant la capture. Consultez la section [Fonctionnement](#how-it-works) pour plus de détails.

```java
public Robot() {
  // Active la capture des journaux de fabricants depuis un répertoire temporaire
  // Nous recommandons de stocker temporairement les journaux de fabricants sur le stockage interne
  // même lors de l'utilisation d'une clé USB (les journaux de fabricants ne persistent pas après capture)
  Logger.setVendorLogDirectory("/home/systemcore/logs/");

  // Démarre AdvantageKit normalement
  Logger.start();

  // Démarre le journaliseur du fabricant APRÈS le journaliseur AdvantageKit
  // S'il est configurable, le répertoire de sortie doit correspondre au chemin ci-dessus
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

:::info
Quels que soient les récepteurs de données de journal sélectionnés, les journaux de fabricants ne peuvent être consultés qu'en téléchargeant un fichier WPILOG. La diffusion en direct n'est pas prise en charge en raison de la structure des données capturées.
:::

</TabItem>
</Tabs>

Notez que certains journaliseurs de fabricants commencent à écrire des données _immédiatement_ lors de l'instanciation de la classe d'appareil correspondante (par exemple `SparkMax`). Nous recommandons d'attendre la fin du constructeur `Robot` pour instancier les objets matériels afin de garantir la capture des journaux.

### Fonctionnement {#how-it-works}

1. **Capture :** Le programme du robot exécute la journalisation standard WPILib en parallèle des journaliseurs de fabricants. Un utilitaire léger lit périodiquement les nouvelles données écrites par les journaliseurs de fabricants et empaquette les blocs bruts directement dans le flux `DataLog` actif.
2. **Stockage :** L'ensemble du journal combiné est enregistré dans un seul fichier `.wpilog` (par exemple sur une clé USB connectée à Systemcore). Les fichiers journaux temporaires des fabricants créés sur le robot ne persistent pas après un redémarrage, évitant ainsi de saturer le stockage.
3. **Visualisation :** Lorsque AdvantageScope ouvre le `.wpilog`, il détecte automatiquement toute entrée de journal intégrée, décode son contenu et fusionne tous les champs dans l'arborescence de la barre latérale avec la télémétrie standard.
4. **Extraction :** Si vous devez ouvrir un journal de fabricant pour obtenir de l'aide ou effectuer un diagnostic avancé, les fichiers journaux d'origine peuvent être extraits sans perte depuis le `.wpilog` comme décrit dans [Exporter les données des fabricants](#exporting-vendor-data).

Les données de journaux externes sont enregistrées au format WPILOG à l'aide d'une entrée brute dont le type suit la convention `log:<format>`. Lors de l'analyse d'un de ces champs, AdvantageScope concatène tous les enregistrements binaires de cette entrée dans l'ordre chronologique et décode la charge utile obtenue comme un journal autonome au format spécifié. Les signaux décodés sont ensuite fusionnés dans l'arborescence principale des champs et automatiquement synchronisés avec les données existantes.

:::tip
La journalisation universelle avec WPILOG ne se limite pas aux journaux de fabricants : tout format de journalisation compatible avec AdvantageScope peut être intégré dans un WPILOG selon la même convention.
:::

### Exporter les données des fabricants {#exporting-vendor-data}

Bien que les données des journaux de fabricants puissent être consultées directement dans AdvantageScope, il peut parfois être nécessaire d'extraire le journal d'origine tel qu'il a été produit par la bibliothèque initiale (par exemple pour l'inspecter dans des utilitaires propres au fabricant).

Pour exporter un journal enfant individuel directement depuis AdvantageScope, faites un clic droit sur l'entrée du journal enfant dans la barre latérale et sélectionnez **Exporter le journal d'origine...**.

Pour une extraction par lots, vous pouvez également utiliser le script Python [`extract_vendor_logs.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/extract_vendor_logs.py), qui recherche dans un ou plusieurs fichiers `.wpilog` ou `.wpilogxz` tous les journaux de fabricants intégrés et les exporte dans des fichiers séparés :

```bash
pip3 install robotpy-wpiutil # Dépendance requise
python3 extract_vendor_logs.py path/to/source.wpilog
```
