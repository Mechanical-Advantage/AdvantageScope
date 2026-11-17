# ⚙️ Ressources personnalisées {#custom-assets}

AdvantageScope intègre par défaut un ensemble d'images de terrain 2D, de modèles de terrain 3D, de modèles de robots et de configurations de manettes. Les ressources simples (comme les terrains génériques) sont incluses dès l'installation. Les ressources détaillées (comme les terrains propres à chaque saison) sont téléchargées automatiquement en arrière-plan dès qu'AdvantageScope est connecté à Internet. Pour suivre l'avancement de ces téléchargements, cliquez sur `App`/`AdvantageScope` > `État de téléchargement des ressources...`.

Vous pouvez également personnaliser cet ensemble de ressources en ajoutant les vôtres. Pour ouvrir le dossier des ressources utilisateur, cliquez sur `App`/`AdvantageScope` > `Afficher le dossier des ressources`. Les formats attendus sont décrits ci-dessous. Pour vous inspirer, vous pouvez consulter les [ressources détaillées](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) et les [ressources intégrées](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) fournies par défaut.

:::tip
Pour charger des ressources depuis un autre emplacement, cliquez sur `App`/`AdvantageScope` > `Utiliser un dossier de ressources personnalisé`. Vous devez sélectionner le _dossier parent_ contenant les différents sous-dossiers de ressources. Cette option est idéale pour versionner vos ressources personnalisées avec Git, directement aux côtés du code du robot.
:::

## Format général {#general-format}

Chaque ressource est rangée dans un dossier nommé selon le modèle « TYPE_NOM » (`TYPE_NAME`). Le nom utilisé pour le dossier n'est pas affiché dans AdvantageScope. Les types de ressources possibles sont :

- « Field2d »
- « Field3d »
- « Robot »
- « Joystick »

:::info
Exemples de noms de dossiers : « Field2d_2023Field », « Joystick_OperatorButtons » ou « Robot_Dozer ».
:::

Ce dossier doit contenir un fichier nommé « config.json » ainsi qu'un ou plusieurs fichiers de ressources, comme expliqué ci-dessous. Le fichier de configuration indique toujours le nom de la ressource tel qu'il apparaîtra dans AdvantageScope; ce nom doit être unique pour chaque type de ressource. Vous pouvez aussi ajouter un objet optionnel « locales » associant des codes de langue (par ex. « es-419 », « fr », « zh-CN ») à des noms traduits. Si la langue sélectionnée n'est pas définie ou si « locales » est absent, AdvantageScope utilisera le champ « name » racine par défaut.

```json
{
  "name": string, // Nom par défaut unique, requis pour tous les types de ressources
  "locales": { [locale: string]: string } // Noms localisés facultatifs associant des codes de langue (p. ex. "es-419", "fr") aux traductions
  ... // Configuration propre au type de ressource, décrite ci-dessous
}
```

## Modèles 3D de robot {#3d-robot-models}

### Tutoriel vidéo {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Aperçu {#overview}

Le dossier doit contenir un modèle nommé « model.glb ». Les fichiers CAO doivent d'abord être convertis en glTF (voir [cette page](gltf-convert) pour la marche à suivre). Le fichier de configuration doit respecter le format suivant :

```json
{
  "name": string // Nom unique, requis pour tous les types de ressources
  "locales": { [locale: string]: string } // Traductions facultatives pour le nom de la ressource
  "isFTC": boolean // Indique si le modèle est prévu pour les terrains FTC plutôt que FRC ("false" par défaut)
  "disableSimplification": boolean // Indique s'il faut désactiver la simplification du modèle (facultatif)
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Séquence de rotations autour des axes x, y et z
  "position": [number, number, number] // Décalage de position en mètres, appliqué après rotation
  "cameras": [ // Positions de caméras fixes (peut être vide)
    {
      "name": string // Nom de la caméra
      "locales": { [locale: string]: string } // Traductions facultatives pour le nom de la caméra
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Séquence de rotations autour des axes x, y et z
      "position": [number, number, number] // Décalage de position en mètres par rapport au robot, appliqué après rotation
      "resolution": [number, number] // Résolution en pixels, utilisée pour fixer le rapport d'aspect
      "fov": number // Champ de vision horizontal en degrés
    }
  ],
  "components": [...] // Voir « Composants articulés »
}
```

La méthode la plus simple pour trouver les bonnes valeurs de position et de rotation consiste à procéder par essais et erreurs. Nous vous conseillons de régler d'abord la rotation, puis la position, car les transformations sont appliquées dans cet ordre.

:::info
AdvantageScope simplifie automatiquement la géométrie des modèles pour améliorer les performances, avec un niveau de détail adapté au [mode de rendu](/tab-reference/3d-field#rendering-modes) choisi. Si cette simplification altère l'apparence d'une ressource personnalisée, deux options s'offrent à vous :

- Pour empêcher la suppression automatique d'un maillage (_mesh_) précis, ajoutez `NOSIMPLIFY` dans son nom.
- Pour désactiver la simplification sur l'ensemble du modèle de robot, définissez l'option `disableSimplification` sur `true` dans la configuration.

:::

### Composants articulés {#articulated-components}

:::warning
Configurer des composants articulés peut être long et complexe. Pensez d'abord à utiliser la prise en charge 3D de [`Mechanism2d`](/tab-reference/3d-field#2d-mechanisms) dans AdvantageScope, qui offre une approche beaucoup plus simple pour **visualiser des mécanismes sur le terrain 3D**.
:::

Les modèles de robots peuvent inclure des composants articulés pour animer les données de vos mécanismes (voir [cette page](/tab-reference/3d-field) pour plus de détails). Le modèle glTF de base ne doit contenir aucun composant mobile; exportez ensuite chaque composant dans un fichier glTF séparé. Ces fichiers suivent la convention de nommage « model_INDEX.glb » (le premier composant s'appellera donc « model_0.glb »).

La configuration des composants se fait dans le fichier `config.json` du robot, sous la clé « components » sous forme de tableau. Si aucune pose de composant n'est fournie dans AdvantageScope, les composants sont placés avec les rotations et la position par défaut du robot (voir ci-dessus). Dès que vous fournissez des poses de composants, AdvantageScope applique plutôt les valeurs « zeroed » (`zeroedRotations` et `zeroedPosition`) pour ramener chaque composant à l'origine du robot, puis applique vos poses pour les placer au bon endroit.

:::tip
Lorsque vous positionnez des composants 3D par rapport au robot, l'origine du système de coordonnées correspond à la pose publiée du robot. Gardez en tête que cette pose a généralement une hauteur nulle, ce qui correspond au plan du sol et NON au dessous du châssis (_bellypan_) pour un déplacement 2D classique.
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Séquence de rotations autour des axes x, y et z
    "zeroedPosition": [number, number, number] // Décalage de position en mètres par rapport au robot, appliqué après rotation
  }
]
```

#### Procédure de configuration {#setup-process}

Pour calibrer la position des composants articulés, nous vous recommandons de suivre ces étapes :

1. Exportez le modèle de base et les composants dans leurs positions « par défaut » correctes. C'est ainsi qu'ils s'afficheront si aucune pose de composant n'est fournie dans AdvantageScope.

2. Publiez une pose 2D mise à zéro depuis le code du robot, puis sélectionnez-la comme pose du robot dans AdvantageScope. Passez ensuite sur le terrain 3D « Axes », qui affiche l'origine du terrain.

3. Ajustez d'abord les rotations globales du robot (sans toucher aux composants) jusqu'à ce qu'il soit bien orienté, puis ajustez sa position globale pour le placer sur l'origine. Les composants doivent rester dans leur position par défaut tout au long de cette étape.

4. Publiez depuis le code du robot un tableau de poses 3D mises à zéro (avec autant d'éléments que de composants dans le modèle), puis sélectionnez-le comme poses des composants dans AdvantageScope.

5. Pour chaque composant, ajustez d'abord les rotations puis la position jusqu'à l'aligner sur l'origine. Par exemple, un segment de bras doit avoir son pivot à l'origine tout en pointant vers l'avant le long de l'axe X.

6. Publiez enfin les vraies poses des composants depuis le code du robot, calculées par rapport aux nouvelles origines que vous venez de définir. Par exemple, la pose d'un segment de bras sera placée au niveau de son articulation et orientée dans la direction du segment.

## Manettes {#joysticks}

Le dossier doit contenir une image nommée « image.png ». Le fichier de configuration doit respecter le format suivant :

```json
{
  "name": string // Nom unique, requis pour tous les types de ressources
  "locales": { [locale: string]: string } // Traductions facultatives pour le nom de la ressource
  "components": [...] // Tableau de configurations de composants, voir ci-dessous
}
```

:::info
Les boutons, joysticks et axes prennent en charge à la fois les liaisons [SDL](https://www.libsdl.org) (utilisées par la console de pilotage FIRST actuelle) et les liaisons NI (utilisées par l'ancienne console de pilotage FRC NI). Vous devez fournir au moins un jeu de liaisons pour chaque composant.

Pour les liaisons NI, AdvantageScope reste rétrocompatible avec les anciennes clés sans préfixe (par ex. `sourceIndex`). **Pour toute nouvelle manette, utilisez des liaisons SDL explicites (par ex. `sdlSourceIndex`) afin d'assurer la compatibilité avec la console de pilotage FIRST actuelle.**
:::

### Bouton unique / Valeur POV {#single-button-pov-value}

```json
{
  "type": "button"
  "isYellow": boolean
  "isEllipse": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number
  "sdlSourcePov": string // Facultatif : "up", "right", "down" ou "left". Si défini, "sdlSourceIndex" correspond à l'index du POV à lire.

  // Liaisons alternatives pour la console de pilotage NI (facultatif)
  "niSourceIndex": number
  "niSourcePov": string
}
```

### Joystick à deux axes {#two-axis-joystick}

```json
{
  "type": "joystick" // Un joystick qui se déplace sur deux axes
  "isYellow": boolean
  "centerPx": [number, number]
  "radiusPx": number
  "sdlXSourceIndex": number
  "sdlXSourceInverted": boolean // Non inversé : droite = positif
  "sdlYSourceIndex": number
  "sdlYSourceInverted": boolean // Non inversé : haut = positif
  "sdlButtonSourceIndex": number // Facultatif

  // Liaisons alternatives pour la console de pilotage NI (facultatif)
  "niXSourceIndex": number
  "niXSourceInverted": boolean
  "niYSourceIndex": number
  "niYSourceInverted": boolean
  "niButtonSourceIndex": number
}
```

### Axe unique {#single-axis}

```json
{
  "type": "axis" // Une valeur d'axe unique
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
  "sdlSourceRange": [number, number] // Min supérieur à max pour inverser

  // Liaisons alternatives pour la console de pilotage NI (facultatif)
  "niSourceIndex": number,
  "niSourceRange": [number, number]
}
```

### Pavé tactile {#touchpad}

```json
{
  "type": "touchpad" // Un pavé tactile
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
}
```

## Images de terrain plates {#flat-field-images}

Le dossier doit contenir une image nommée « image.png », orientée avec l'alliance rouge à gauche. Le fichier de configuration doit respecter le format suivant :

```json
{
  "name": string // Nom unique, requis pour tous les types de ressources
  "locales": { [locale: string]: string } // Traductions facultatives pour le nom de la ressource
  "isFTC": boolean // Indique s'il s'agit d'un terrain FTC plutôt que FRC
  "coordinateSystem": // Système de coordonnées par défaut (voir ci-dessous)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC traditionnel
      "center-red"       // Systemcore
  "useGrid": boolean // Indique s'il faut afficher la grille s'il s'agit d'un terrain FTC ("true" par défaut)
  "sourceUrl": string // Lien vers le fichier d'origine (facultatif)
  "topLeft": [number, number] // Coordonnées en pixels (origine en haut à gauche)
  "bottomRight": [number, number] // Coordonnées en pixels (origine en haut à gauche)
  "widthInches": number // Largeur réelle du terrain (grand côté)
  "heightInches": number // Hauteur réelle du terrain (petit côté)
}
```

## Modèles 3D de terrain {#3d-field-models}

Le dossier doit contenir un modèle nommé « model.glb ». Une fois toutes les rotations appliquées, le terrain doit être orienté avec l'alliance rouge à gauche. Les fichiers CAO doivent être convertis en glTF (voir [cette page](gltf-convert) pour plus de détails). Les modèles d'éléments de jeu suivent la convention de nommage « model_INDEX.glb » selon leur ordre dans le tableau « gamePieces ». Les AprilTags déclarés ici sont toujours positionnés dans un système de coordonnées [centre/rouge](/more-features/coordinate-systems#center-red), quelles que soient les autres options de configuration.

Le fichier de configuration doit respecter le format suivant :

```json
{
  "name": string // Nom unique, requis pour tous les types de ressources
  "locales": { [locale: string]: string } // Traductions facultatives pour le nom de la ressource
  "isFTC": boolean // Indique s'il s'agit d'un terrain FTC plutôt que FRC
  "coordinateSystem": // Système de coordonnées par défaut (voir ci-dessous)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC traditionnel
      "center-red"       // Systemcore
  "useGrid": boolean // Indique s'il faut afficher la grille s'il s'agit d'un terrain FTC ("true" par défaut)
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Séquence de rotations autour des axes x, y et z
  "widthInches": number // Largeur réelle du terrain (grand côté)
  "heightInches": number // Hauteur réelle du terrain (petit côté)
  "defaultOrigin": "auto" | "blue" | "red" // Emplacement de l'origine par défaut ("auto" si non précisé)
  "driverStations": [
    [number, number] // Positions des postes de pilotage (X et Y en mètres par rapport au centre du terrain)
    ...              // Pour la FRC : 6 éléments dans l'ordre [B1, B2, B3, R1, R2, R3]. Pour la FTC : 4 éléments dans l'ordre [BL, BR, RL, RR].
  ]
  "gamePieces": [ // Liste des types d'éléments de jeu
    {
      "name": string // Nom de l'élément de jeu
      "locales": { [locale: string]: string } // Traductions facultatives pour le nom de l'élément de jeu
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Séquence de rotations autour des axes x, y et z
      "position": [number, number, number] // Décalage de position en mètres, appliqué après rotation
      "stagedObjects": string[] // Noms des objets d'éléments de jeu pré-placés, à masquer si des poses utilisateur sont fournies
    },
    ...
  ],
  "aprilTags": [ // Liste des modèles AprilTag supplémentaires (s'ils ne font pas partie du modèle de terrain)
    "variant": string // Format "FAMILY-SIZEin" où "FAMILY" vaut "36h11" ou "16h5" et "SIZE" est la longueur de la bordure noire
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Séquence de rotations autour des axes x, y et z
    "position": [number, number, number] // Décalage de position en mètres, appliqué après rotation
  ]
}
```
