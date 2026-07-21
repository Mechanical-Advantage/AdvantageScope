# 🛜 Sources en direct

Toutes les visualisations dans AdvantageScope sont conçues pour recevoir des données en direct d'un robot ou d'un simulateur en plus des fichiers journaux. Cette section décrit comment se connecter à des sources de données en temps réel. Les sources de données en direct suivantes sont prises en charge par AdvantageScope :

- **NetworkTables :** Il s'agit du protocole réseau principal de WPILib. Consultez la [documentation WPILib](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html) pour plus de détails.
- **NetworkTables (AdvantageKit) :** Ce mode est conçu pour une utilisation avec le code robot exécutant AdvantageKit, qui publie dans la table `AdvantageKit` dans NetworkTables.
- **Diagnostics Systemcore :** Ce mode se connecte au serveur NetworkTables intégré utilisé par le système d'exploitation Systemcore, qui comprend des données de diagnostic telles que l'état du robot et les E/S d'appareils.
- **Diagnostics Phoenix :** Ce mode utilise HTTP pour se connecter à un serveur de [diagnostics](https://pro.docs.ctr-electronics.com/en/latest/docs/troubleshooting/running-diagnostics.html) Phoenix, qui permet la diffusion de données à partir d'appareils CAN CTRE avec [Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/). Cela est similaire à la [fonctionnalité de tracé](https://pro.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) dans Phoenix Tuner. Consultez [cette page](/overview/live-sources/phoenix-diagnostics) pour plus d'informations.
- **Serveur RLOG :** Ce protocole est pris en charge par AdvantageKit comme alternative à NetworkTables. La connexion est initialisée sur le port 5800 par défaut.
- **FTC Dashboard :** Ce mode s'intègre aux robots FTC publiant des données sur [FTC Dashboard](https://acmerobotics.github.io/ftc-dashboard).

:::info
AdvantageScope peut se connecter à la console de pilotage FIRST pour afficher des données de diagnostic lorsqu'elle s'exécute sur le même appareil que l'application DS. Aucune configuration n'est requise (consultez les instructions ci-dessous).
:::

## Démarrage de la connexion

Pour démarrer la connexion en direct, suivez ces étapes :

- **Robot :** Cliquez sur `Fichier` > `Se connecter au robot` > `Par défaut` ou une source en direct spécifique
- **Simulateur :** Cliquez sur `Fichier` > `Se connecter au simulateur` > `Par défaut` ou une source en direct spécifique
- **Console de pilotage :** Cliquez sur `Fichier` > `Se connecter à la console de pilotage`

Le titre de la fenêtre affiche l'adresse IP et le texte « Recherche » jusqu'à ce que la cible soit connectée. AdvantageScope tente de se reconnecter automatiquement en utilisant les mêmes paramètres après une déconnexion.

## Visualisation des données en direct

Lorsqu'elle est connectée à une source en direct, AdvantageScope verrouille tous les onglets à l'heure actuelle par défaut. Les vues comme le 📉 [Graphique linéaire](/tab-reference/line-graph) et le 🔢 [Tableau](/tab-reference/table) défilent automatiquement, et les vues comme le terrain et les manettes affichent les valeurs actuelles de chaque champ. Cliquer sur le bouton fléché rouge dans la barre de navigation bascule ce verrouillage, permettant la visualisation et la relecture des données passées.

<img src="/img/overview/live-sources/open-live-1.png" alt="Bouton de verrouillage/déverrouillage en direct" />

:::tip
Faire défiler vers la gauche dans le graphique linéaire ou la chronologie déverrouille de l'heure actuelle, et faire défiler jusqu'à la droite verrouille à nouveau à l'heure actuelle.
:::

## Configuration

Ouvrez la fenêtre des préférences en cliquant sur `Application` > `Afficher les préférences...` (Windows/Linux) ou `AdvantageScope` > `Paramètres...` (macOS).

<img src="/img/prefs.png" alt="Schéma des préférences" height="350" />

### Adresse du robot

Saisissez l'adresse du robot en utilisant une adresse IP 10.TE.AM.2 comme décrit dans la [documentation WPILib](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/ip-configurations.html#te-am-ip-notation). Lors de la connexion à Systemcore via USB ou le point d'accès Wi-Fi intégré, cliquez sur `Fichier` > `Utiliser l'adresse USB Systemcore`/`Utiliser l'adresse Wi-Fi Systemcore` pour utiliser temporairement l'adresse IP statique correcte.

### Mode en direct

Lorsque NetworkTables est utilisé comme source en direct, les modes en direct suivants peuvent être sélectionnés :

- **Faible bande passante (Par défaut) :** AdvantageScope demande uniquement des données au serveur pour les champs qui sont activement utilisés. Les données publiées avant la sélection d'un champ ne seront pas disponibles. Ce mode est **fortement recommandé** lors de l'exécution dans un environnement avec une bande passante réseau limitée, ou lorsqu'un grand nombre de champs sont publiés.
- **Journalisation :** AdvantageScope demande des données pour tous les champs, qu me qu'ils soient activement utilisés ou non. Cela signifie que les champs peuvent être visualisés rétroactivement en mettant en pause le flux de données en direct (voir ci-dessous). Ce mode est souvent utile pendant le développement mais **ne doit PAS être utilisé lorsque la bande passante est limitée**.

### Ignorer les données en direct

Pendant une connexion en direct, les données sont stockées localement pour permettre la relecture des données passées (voir « Visualisation des données en direct » ci-dessous). Pour éviter une utilisation très élevée de la mémoire, les données sont ignorées après 20 minutes par défaut. Une période plus courte peut être sélectionnée pour réduire l'utilisation de la mémoire, ou « Jamais » peut être sélectionné pour stocker les données en direct indéfiniment.
