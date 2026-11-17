# AdvantageScope XR {#advantagescope-xr}

AdvantageScope XR donne vie à l'onglet 👀 [Terrain 3D](/tab-reference/3d-field) en réalité augmentée et ouvre de nouvelles façons d'analyser vos données. Observez une routine autonome simulée à taille réelle, préparez votre stratégie de match avec un terrain miniature sur une table, ou superposez des données de diagnostic directement sur votre vrai robot! La vidéo ci-dessous présente plusieurs cas d'utilisation :

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/gWPhQyB66DQ" title="AdvantageScope XR: Feature Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Prérequis {#requirements}

- **Hôte :** l'application de bureau AdvantageScope sur Windows, macOS ou Linux (v4.1.0 ou plus récent). Les pare-feu de l'ordinateur doivent être [désactivés](https://docs.wpilib.org/fr/stable/docs/networking/networking-introduction/windows-firewall-configuration.html#disabling-windows-firewall).
- **Client :** un iPhone ou un iPad sous iOS/iPadOS 16 ou plus récent. Aucune application n'est requise au préalable.
- **Réseau :** les deux appareils doivent être sur le même réseau (Wi-Fi, partage de connexion USB, etc.). Sous réserve du point suivant, ce réseau n'a pas besoin d'accès à Internet.
- **Internet :** si vous n'avez pas utilisé AdvantageScope XR récemment, l'appareil mobile doit disposer d'une connexion Internet (données cellulaires, par exemple). Pour vous affranchir de cette contrainte, consultez la section [Utilisation hors ligne](#offline-usage) ci-dessous.

:::tip
AdvantageScope XR fonctionne sur de nombreux modèles d'iPhone et d'iPad, mais le suivi est plus stable sur les appareils dotés d'un **capteur LiDAR**, comme les iPhone Pro (à partir de l'iPhone 12 Pro) et les iPad Pro (printemps 2020 ou plus récents).
:::

<details>
<summary>Qu'en est-il des autres plateformes?</summary>

AdvantageScope XR est uniquement pris en charge sur iOS et iPadOS, et nous n'avons pas prévu dans l'immédiat de prendre en charge d'autres plateformes. L'application cliente repose sur une intégration poussée avec les API natives pour la réalité augmentée, l'enregistrement vidéo, le rendu web, etc. iOS et iPadOS sont prioritaires pour plusieurs raisons :

- **Homogénéité :** L'application AdvantageScope XR est très exigeante en ressources. Contrairement aux appareils Android dont la puissance et les capacités varient énormément, les iPhone et iPad offrent un environnement matériel et logiciel cohérent d'une génération à l'autre. Tous les appareils iOS et iPadOS récents ont la puissance nécessaire pour faire tourner AdvantageScope XR, et les modèles les plus récents apportent des atouts supplémentaires comme le LiDAR.
- **Accessibilité :** l'iPhone reste le téléphone le plus répandu chez les élèves aux États-Unis ou le plus facile à emprunter dans une équipe, et il est bien plus accessible qu'un casque de réalité virtuelle ou mixte. Privilégier iOS permet donc au plus grand nombre d'utiliser AdvantageScope XR facilement.
- **Prise en charge des tablettes :** sur une tablette, l'écran plus grand permet à plusieurs personnes de suivre la scène en même temps. L'iPad étant la tablette la plus répandue dans le monde, la prise en charge d'iPadOS rend cette expérience collective aussi accessible que possible.

</details>

## Configuration {#setup}

1. Sur l'ordinateur hôte, **cliquez sur le bouton « XR »** dans n'importe quel onglet Terrain 3D. Une seule session hôte XR peut être active à la fois : cliquer sur ce bouton mettra fin à toute autre session en cours.

<img src="/img/tab-reference/3d-field/xr-1.webp" alt="Bouton XR" height="450" />

_L'interface en anglais est illustrée ci-dessus._

2. La **fenêtre des contrôles XR** s'ouvre avec un code QR et des [options](#options) pour personnaliser l'expérience en réalité augmentée. Pour arrêter la session XR et déconnecter les appareils clients, fermez simplement cette fenêtre.

<img src="/img/tab-reference/3d-field/xr-2.webp" alt="Fenêtre XR" height="350" />

_L'interface en anglais est illustrée ci-dessus._

3. Scannez le code QR avec l'**application Appareil photo** intégrée de votre iPhone ou iPad. Aucune installation d'application n'est nécessaire.
4. Touchez « AdvantageScope XR », puis « Ouvrir » pour **lancer l'expérience** et vous connecter à l'hôte. Si l'appareil vous le demande, autorisez l'accès à l'**appareil photo et au réseau local**.
5. Suivez les instructions à l'écran pour **étalonner et positionner le modèle du terrain**.
6. Pilotez ensuite la scène comme d'habitude depuis l'ordinateur hôte, que ce soit pour **lire un journal ou diffuser des données en direct**. L'état du terrain s'actualise en temps réel sur l'appareil mobile.
7. Pour **enregistrer une vidéo** rapidement, touchez l'icône d'enregistrement en haut de l'écran. Touchez-la de nouveau pour arrêter, puis modifiez et enregistrez votre séquence.

:::warning
Les cartes thermiques et les vitesses des modules Swerve ne sont pas encore disponibles dans XR. Tous les autres types d'objets sont pris en charge.
:::

:::tip
AdvantageScope XR demande beaucoup de ressources et peut ralentir selon la complexité de la scène 3D. N'hésitez pas à utiliser des modèles de robot plus simples ou à limiter le nombre d'objets affichés.
:::

## Options {#options}

La fenêtre des contrôles XR propose plusieurs réglages pour adapter l'affichage en réalité augmentée :

- **Étalonnage :**
  - Choisissez _Miniature_ pour afficher le terrain à échelle réduite, idéal sur une table.
  - Choisissez _Taille réelle_ pour afficher le terrain à l'échelle 1:1, calé sur une vraie balustrade du terrain. Le choix entre _Alliance bleue_ et _Alliance rouge_ détermine le côté utilisé pour l'étalonnage, mais le terrain complet reste affiché dans les deux cas.
- **Diffusion en continu :**
  - Choisissez _Fluide_ lorsque vous pouvez accepter un léger délai en échange d'un flux plus régulier, par exemple pour simuler des routines autonomes ou relire un journal.
  - Choisissez _Faible latence_ pour les usages en temps réel où une légère gigue est acceptable, comme superposer des données sur un vrai robot ou piloter un robot simulé en téléopéré.
- **Afficher le sol :** affiche le tapis ou les dalles de sol sous le terrain au lieu de le superposer sur une surface réelle.
- **Afficher le terrain :** affiche le modèle du terrain, y compris la balustrade et les éléments propres au jeu. Les [objets d'éléments de jeu](/tab-reference/3d-field#game-piece-objects) personnalisés restent toujours visibles.
- **Afficher les robots :** affiche les modèles de robots. Vous pouvez désactiver cette option lorsque vous superposez des données (comme des cibles de vision ou des mécanismes 2D) sur un vrai robot.

## Utilisation hors ligne {#offline-usage}

AdvantageScope XR n'a pas besoin d'Internet pour fonctionner. Pour garantir son accès hors ligne, téléchargez l'application AdvantageScope XR sur l'App Store via le lien ci-dessous. Pour vous connecter ensuite à l'application de bureau, scannez le code QR avec l'appareil photo iOS ou touchez le bouton « Scanner » directement dans l'application AdvantageScope XR.

[<img src="/img/tab-reference/3d-field/app-store.svg" alt="App Store" />](https://apps.apple.com/us/app/advantagescope-xr/id6739718081)

:::note
Même sans connexion Internet, l'ordinateur hôte et l'appareil client **doivent être connectés au même réseau** (réseau du robot, routeur Wi-Fi dédié ou partage de connexion USB).
:::
