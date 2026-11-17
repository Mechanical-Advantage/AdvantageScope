# 🛜 Sources en direct {#live-sources}

En plus des fichiers journaux, toutes les vues d'AdvantageScope peuvent recevoir des données en direct depuis un robot ou un simulateur. Cette section explique comment vous connecter aux sources en temps réel prises en charge par AdvantageScope :

- **NetworkTables :** le protocole réseau principal de WPILib. Consultez la [documentation WPILib](https://docs.wpilib.org/fr/stable/docs/software/networktables/index.html) pour en savoir plus.
- **NetworkTables (AdvantageKit) :** ce mode est prévu pour le code robot utilisant AdvantageKit, qui publie ses données dans la table `AdvantageKit` de NetworkTables.
- **Diagnostics Systemcore :** ce mode se connecte au serveur NetworkTables intégré au système d'exploitation Systemcore, qui fournit des données de diagnostic comme l'état du robot et les E/S des appareils.
- **Diagnostics Phoenix :** ce mode se connecte en HTTP au [serveur de diagnostic](https://pro.docs.ctr-electronics.com/en/latest/docs/troubleshooting/running-diagnostics.html) Phoenix pour diffuser en direct les données des appareils CAN CTRE sous [Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/), un peu comme l'[outil de tracé](https://pro.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) de Phoenix Tuner. Consultez [cette page](/overview/live-sources/phoenix-diagnostics) pour plus de détails.
- **Serveur RLOG :** une alternative à NetworkTables prise en charge par AdvantageKit. La connexion s'établit par défaut sur le port 5800.
- **FTC Dashboard :** ce mode s'adresse aux robots FTC qui publient leurs données sur [FTC Dashboard](https://acmerobotics.github.io/ftc-dashboard).

:::info
AdvantageScope peut se connecter à la console de pilotage FIRST (DS) pour afficher ses données de diagnostic lorsqu'elle tourne sur le même ordinateur que la DS. Aucune configuration n'est nécessaire (voir la marche à suivre ci-dessous).
:::

## Démarrer la connexion {#starting-the-connection}

Pour lancer une connexion en direct, suivez ces étapes :

- **Robot :** cliquez sur `Fichier` > `Se connecter au robot` > `Par défaut` ou choisissez une source en direct précise.
- **Simulateur :** cliquez sur `Fichier` > `Se connecter au simulateur` > `Par défaut` ou choisissez une source en direct précise.
- **Console de pilotage :** cliquez sur `Fichier` > `Se connecter à la console de pilotage`.

Tant que la connexion n'est pas établie, la barre de titre affiche l'adresse IP et la mention « Recherche ». En cas de coupure, AdvantageScope tente automatiquement de se reconnecter avec les mêmes paramètres.

## Consulter les données en direct {#viewing-live-data}

Par défaut, lorsqu'AdvantageScope est connecté à une source en direct, tous les onglets restent calés sur l'instant présent. Les vues comme 📉 [Graphique linéaire](/tab-reference/line-graph) et 🔢 [Tableau](/tab-reference/table) défilent automatiquement, tandis que le terrain ou les manettes affichent les valeurs actuelles de chaque champ. Cliquez sur la flèche rouge dans la barre de navigation pour activer ou désactiver ce verrouillage et revenir en arrière dans les données.

<img src="/img/overview/live-sources/open-live-1.webp" alt="Bouton de verrouillage/déverrouillage en direct" />

:::tip
Faites défiler vers la gauche dans le graphique linéaire ou la chronologie pour déverrouiller la vue de l'instant présent, puis tout à droite pour la verrouiller à nouveau.
:::

## Configuration {#configuration}

Ouvrez les préférences en cliquant sur `App` > `Afficher les préférences...` (Windows/Linux) ou `AdvantageScope` > `Paramètres...` (macOS).

<img src="/img/prefs_fr.webp" alt="Fenêtre des préférences" height="450" />

### Adresse du robot {#robot-address}

Indiquez l'adresse du robot sous forme de nom d'hôte (par exemple `robot.local`) ou d'adresse IP (par exemple `10.TE.AM.2`), selon la notation décrite dans la [documentation WPILib](https://docs.wpilib.org/fr/stable/docs/networking/networking-introduction/ip-configurations.html#te-am-ip-notation). Si vous vous connectez à Systemcore par USB ou via son point d'accès Wi-Fi intégré, cliquez sur `Fichier` > `Utiliser l'adresse USB Systemcore` ou `Utiliser l'adresse Wi-Fi Systemcore` pour appliquer temporairement la bonne adresse IP statique.

### Mode en direct {#live-mode}

Lorsque vous utilisez NetworkTables comme source en direct, deux modes sont disponibles :

- **Faible bande passante (par défaut) :** AdvantageScope ne demande au serveur que les champs actuellement utilisés dans vos onglets. Les données publiées avant la sélection d'un champ ne sont donc pas récupérées. Ce mode est **vivement recommandé** si la bande passante réseau est limitée ou si votre robot publie un grand nombre de champs.
- **Journalisation :** AdvantageScope récupère tous les champs, qu'ils soient affichés ou non. Vous pouvez ainsi mettre le flux en pause pour inspecter rétroactivement n'importe quel champ. Ce mode est pratique pendant le développement, mais **il ne faut PAS l'utiliser lorsque la bande passante est limitée**.

### Ignorer les données en direct {#discard-live-data}

Pendant une connexion en direct, AdvantageScope conserve les données en mémoire pour vous permettre de remonter dans le temps (voir « Consulter les données en direct » ci-dessus). Pour éviter une consommation excessive de mémoire, les données plus anciennes que 20 minutes sont supprimées par défaut. Vous pouvez réduire cette durée pour économiser la mémoire, ou choisir « Jamais » pour tout conserver indéfiniment.
