# AdvantageScope XR

AdvantageScope XR donne vie à la vue 👀 [Terrain 3D](/tab-reference/3d-field) en réalité augmentée, vous permettant de visualiser les données de toutes nouvelles manières. Voyez un mode autonome simulé en taille réelle, révisez la stratégie de match avec un modèle de terrain sur table, superposez des informations de diagnostic sur un vrai robot, et bien plus encore! La vidéo ci-dessous démontre plusieurs cas d'utilisation pour cette fonctionnalité :

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/gWPhQyB66DQ" title="AdvantageScope XR: Feature Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Exigences

- **Hôte :** L'application de bureau AdvantageScope sur Windows, macOS ou Linux (v4.1.0 ou version ultérieure). Tous les pare-feu sur l'appareil doivent être [désactivés](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/windows-firewall-configuration.html#disabling-windows-firewall).
- **Client :** Un iPhone ou iPad exécutant iOS/iPadOS 16 ou version ultérieure. Aucune installation d'application n'est requise.
- **Réseau :** Les deux appareils doivent être connectés au même réseau (Wi-Fi, partage de connexion USB, etc.). Sous réserve de la condition ci-dessous, ce réseau n'a pas besoin d'être connecté à Internet.
- **Internet :** Si AdvantageScope XR n'a pas été utilisée récemment, l'appareil mobile doit disposer d'une connexion Internet (par ex., données cellulaires). Pour éliminer cette exigence, consultez la section [utilisation hors ligne](#offline-usage) ci-dessous.

:::tip
AdvantageScope XR est prise en charge sur de nombreux modèles d'iPhone et d'iPad, mais est plus stable pour les appareils équipés d'un **capteur LiDAR**. Cela comprend l'iPhone Pro (à partir de l'iPhone 12 Pro) et l'iPad Pro (printemps 2020 ou version ultérieure).
:::

<details>
<summary>Qu'en est-il des autres plateformes?</summary>

AdvantageScope XR n'est prise en charge que sur iOS et iPadOS. Il n'y a pas de projet immédiat de prise en charge d'autres plateformes. L'application cliente nécessite une intégration étroite avec les API natives pour la réalité augmentée, l'enregistrement vidéo, le rendu web, et plus encore. iOS et iPadOS reçoivent la priorité pour le développement et la prise en charge pour plusieurs raisons :

- **Cohérence :** AdvantageScope XR est une application exigeante. Bien que les appareils Android varient considérablement en termes de puissance de traitement et de fonctionnalités, l'iPhone et l'iPad offrent une expérience de développement cohérente à travers les générations. Tous les appareils iOS et iPadOS récents sont suffisamment puissants pour exécuter AdvantageScope XR, et les appareils plus récents prennent en charge des fonctionnalités supplémentaires qu'AdvantageScope peut utiliser (comme le LiDAR).

- **Disponibilité :** L'iPhone reste le smartphone le plus courant que les étudiants aux États-Unis sont susceptibles de posséder ou d'avoir facilement accessible auprès de leurs pairs, et est plus largement disponible que n'importe quel modèle de casque de RV ou de réalité mixte. La prise en charge d'iOS maximise le nombre d'utilisateurs qui ont un accès facile à AdvantageScope XR.

- **Prise en charge des tablettes :** Les utilisateurs peuvent profiter de l'exécution d'AdvantageScope XR sur une tablette, car les tablettes offrent un écran plus grand qui est plus facile à voir pour plusieurs personnes à la fois. L'iPad est la tablette la plus utilisée dans le monde, donc la prise en charge d'iPadOS rend l'expérience sur tablette aussi accessible que possible.

</details>

## Configuration

1. Sur le système hôte, **cliquez sur le bouton « XR »** sur n'importe quel onglet terrain 3D. Une seule session hôte XR peut être active à la fois, donc cliquer sur ce bouton interrompra toute autre session active.

<img src="/img/tab-reference/3d-field/xr-1.png" alt="Bouton XR" height="450" />

2. La **fenêtre de contrôles XR** s'ouvrira, avec un code QR et des [options](#options) pour personnaliser l'expérience RA. Pour annuler la session XR et déconnecter tous les clients, fermez la fenêtre de contrôles.

<img src="/img/tab-reference/3d-field/xr-2.png" alt="Fenêtre XR" height="350" />

3. Scannez le code QR à l'aide de l'**application appareil photo intégrée** sur l'appareil client. Aucune installation d'application n'est requise.
4. Appuyez sur « AdvantageScope XR » puis sur « Ouvrir » pour **démarrer l'expérience** et vous connecter à l'hôte. Si vous y êtes invité, autorisez AdvantageScope XR à accéder à l'**appareil photo et au réseau local**.
5. Suivez les instructions sur l'appareil pour **étalonner et positionner le modèle de terrain**.
6. Contrôlez le modèle de terrain comme d'habitude en utilisant l'appareil hôte, y compris la **lecture des journaux et la diffusion en direct**. L'état du modèle de terrain est affiché en direct sur l'appareil client.
7. Pour **enregistrer rapidement une vidéo**, appuyez sur l'icône « Enregistrer » en haut de l'écran. Appuyez à nouveau pour arrêter l'enregistrement, puis modifiez et enregistrez le clip.

:::warning
Les cartes thermiques et les vitesses des modules Swerve ne sont pas encore disponibles dans XR. Tous les autres types d'objets sont pris en charge.
:::

:::tip
AdvantageScope XR est une application exigeante et peut rencontrer des problèmes de performances en fonction de la complexité de la scène 3D. Envisagez d'utiliser des modèles de robots plus simples ou moins d'objets si nécessaire.
:::

## Options

La fenêtre de contrôles XR présente plusieurs options qui contrôlent la façon dont le modèle est affiché en réalité augmentée :

- **Étalonnage :**
  - Choisissez _Miniature_ pour visualiser une version à échelle réduite du terrain, adaptée à une utilisation sur table.
  - Choisissez _Taille réelle_ pour visualiser le terrain avec un dimensionnement précis, positionné en fonction d'une vraie balustrade de terrain. Le basculement entre _Alliance bleue_ et _Alliance rouge_ contrôle quel côté du terrain est utilisé pour l'étalonnage, mais le terrain complet est visualisé dans tous les cas.
- **Diffusion en continu :**
  - Choisissez _Fluide_ pour les applications où une certaine latence est acceptable en échange d'une diffusion plus fiable, comme la simulation de routines autonomes ou la lecture de fichiers journaux.
  - Choisissez _Faible latence_ pour les applications en temps réel où une certaine gigue est acceptable, comme la superposition de données sur un vrai robot ou le pilotage d'un robot simulé en téléopéré.
- **Afficher le sol :** Affiche le modèle de tapis/sol plat sous le terrain au lieu de le superposer sur une vraie surface.
- **Afficher le terrain :** Affiche le modèle de terrain, y compris la balustrade du terrain et les éléments spécifiques au jeu. Les [objets d'éléments de pointage](/tab-reference/3d-field#game-piece-objects) personnalisés sont toujours affichés.
- **Afficher les robots :** Affiche les modèles de robot, peut être désactivé lors de la superposition de données sur un vrai robot (comme des cibles de vision ou des mécanismes 2D).

## Utilisation hors ligne {#offline-usage}

AdvantageScope XR ne nécessite pas de connexion Internet. Pour vous assurer que l'application est disponible hors ligne, téléchargez AdvantageScope XR depuis l'App Store en utilisant le lien ci-dessous. Pour vous connecter à l'application de bureau AdvantageScope, scannez le code QR à l'aide de l'application appareil photo iOS ou appuyez sur le bouton « Scanner » dans l'application AdvantageScope XR.

[<img src="/img/tab-reference/3d-field/app-store.svg" alt="App Store" />](https://apps.apple.com/us/app/advantagescope-xr/id6739718081)

:::note
Même lors d'une exécution sans connexion Internet, les appareils hôte et client **doivent être connectés au même réseau** (comme un robot, un réseau Wi-Fi personnalisé ou via le partage de connexion USB).
:::
