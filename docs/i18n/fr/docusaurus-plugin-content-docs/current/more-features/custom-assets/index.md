# ⚙️ Ressources personnalisées

AdvantageScope utilise un ensemble par défaut d'images de terrain plates, de modèles de terrain, de modèles de robots et de configurations de manettes. Les ressources simples (par ex. les terrains evergreen) sont incluses dans l'installation initiale. Les ressources détaillées (par ex. les terrains spécifiques à la saison) sont téléchargées automatiquement en arrière-plan lorsque AdvantageScope est connectée à Internet. Pour vérifier l'état de ces téléchargements, cliquez sur `Application`/`AdvantageScope` > `État de téléchargement des ressources...`.

L'ensemble de ressources peut être personnalisé pour ajouter plus d'options si vous le souhaitez. Pour ouvrir le dossier des ressources de l'utilisateur, cliquez sur `Application`/`AdvantageScope` > `Afficher le dossier des ressources`. Les formats attendus pour les ressources sont définis ci-dessous. Consultez l'ensemble par défaut de [ressources détaillées](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) et de [ressources intégrées](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) pour référence.

:::tip
Pour charger des ressources depuis un autre emplacement, cliquez sur `Application`/`AdvantageScope` > `Utiliser un dossier de ressources personnalisé`. Le dossier sélectionné doit être le _dossier parent_ dans lequel plusieurs ressources dans des sous-dossiers distincts pourraient être placées. Cette fonctionnalité permet de stocker des ressources personnalisées sous contrôle de version aux côtés du code robot.
:::

## Format général

Toutes les ressources sont stockées dans des dossiers avec la convention de nommage « TYPE_NAME ». Le NAME utilisé pour le dossier n'est pas affiché par AdvantageScope. Les types de ressources possibles sont :

- « Field2d »
- « Field3d »
- « Robot »
- « Joystick »

:::info
Des exemples de noms de dossiers seraient « Field2d_2023Field », « Joystick_OperatorButtons » ou « Robot_Dozer ».
:::

Ce dossier doit contenir un fichier nommé « config.json » et un ou plusieurs fichiers de ressources, comme décrit ci-dessous. Le fichier de configuration comprend toujours le nom de la ressource à afficher par AdvantageScope. Ce nom doit être unique pour chaque type de ressource.

```json
{
  "name": string // Nom unique, requis pour tous les types de ressources
  ... // Configuration dépendante du type, décrite ci-dessous
}
```

## Modèles 3D de robot

### Tutoriel vidéo

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Aperçu

Un modèle doit être inclus dans le dossier avec le nom « model.glb ». Les fichiers CAO doivent être convertis en glTF; voir [cette page](gltf-convert) pour plus de détails. Le fichier de configuration doit être au format suivant :

```json
{
  "name": string // Nom unique, requis pour tous les types de ressources
  "isFTC": boolean // Indique si le modèle est destiné à être utilisé sur des terrains FTC au lieu de terrains FRC ("false" par défaut)
  "disableSimplification": boolean // Indique s'il faut désactiver la simplification du modèle, facultatif
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Séquence de rotations le long des axes x, y et z
  "position": [number, number, number] // Décalage de position en mètres, appliqué après rotation
  "cameras": [ // Positions de caméras fixes, peut être vide
    {
      "name": string // Nom de la caméra
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Séquence de rotations le long des axes x, y et z
      "position": [number, number, number] // Décalage de position en mètres par rapport au robot, appliqué après rotation
      "resolution": [number, number] // Résolution en pixels, utilisée pour définir le rapport d'aspect fixe
      "fov": number // Champ de vision horizontal en degrés
    }
  ],
  "components": [...] // Voir « Composants articulés »
}
```

La façon la plus simple de déterminer les valeurs de position et de rotation appropriées est par essais et erreurs. Nous recommandons d'ajuster la rotation avant la position car les transformations sont appliquées dans cet ordre.

:::info
AdvantageScope simplifie automatiquement la géométrie du modèle pour améliorer les performances, où le niveau de détail dépend du [mode de rendu](/tab-reference/3d-field#rendering-modes) sélectionné. Dans les cas où la simplification du modèle produit des effets indésirables avec des ressources personnalisées, deux solutions peuvent être utilisées :

- Pour désactiver la suppression automatique d'un maillage particulier, incluez la chaîne `NOSIMPLIFY` dans le nom du maillage.
- Pour désactiver la simplification du modèle pour l'ensemble d'un modèle de robot, définissez l'option `disableSimplification` dans la configuration sur `true`.

:::

### Composants articulés

:::warning
La configuration des composants articulés peut être complexe et prendre du temps. Envisagez d'utiliser la prise en charge de `Mechanism2d` 3D d'AdvantageScope [/tab-reference/3d-field#2d-mechanisms], qui offre une approche plus simple pour **visualiser les mécanismes sur le terrain 3D**.
:::

Les modèles de robots peuvent contenir des composants articulés pour visualiser les données de mécanisme (voir [ici](/tab-reference/3d-field) pour plus de détails). Le modèle glTF de base ne doit contenir aucun composant, puis chaque composant doit être exporté sous forme de modèle glTF distinct. Les modèles de composants suivent la convention de nommage « model_INDEX.glb », de sorte que le premier composant articulé serait « model_0.glb ».

La configuration des composants est fournie dans le fichier de configuration du robot. Un tableau de composants doit être fourni sous la clé « components ». Lorsque le composant ne fournit pas de poses dans AdvantageScope, les modèles de composants seront positionnés en utilisant les rotations et la position par défaut du robot (voir ci-dessus). Lorsque des poses de composants sont fournies par l'utilisateur, les rotations et la position « zéro » sont appliquées à la place pour amener chaque composant à l'origine du robot. Les poses de l'utilisateur sont ensuite appliquées pour déplacer chaque composant vers le bon emplacement sur le robot.

:::tip
Lors du positionnement des composants 3D par rapport au robot, l'origine du système de coordonnées correspond à la pose publiée du robot. Notez que cette pose utilise généralement une hauteur de zéro, qui est le plan du sol et NON le fond du châssis du robot (pour le mouvement de robot 2D typique).
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Séquence de rotations le long des axes x, y et z
    "zeroedPosition": [number, number, number] // Décalage de position en mètres par rapport au robot, appliqué après rotation
  }
]
```

#### Procédure de configuration

Pour étalonner les positions des composants articulés, nous recommandons la procédure suivante :

1. Exportez le modèle de base et les composants dans leurs positions « par défaut » correctes. C'est ainsi qu'ils doivent être rendus si aucune pose de composant n'est fournie dans AdvantageScope.

2. Publiez une pose 2D mise à zéro à partir du code robot, puis sélectionnez-la comme pose du robot dans AdvantageScope. Basculez vers le terrain 3D « Axes », qui montre l'origine du terrain.

3. Ajustez les rotations globales du robot (pas des composants) jusqu'à ce que le robot complet soit orienté correctement. Ensuite, ajustez la position globale pour amener le robot complet à l'origine. Les composants doivent être rendus dans les mêmes positions par défaut tout au long de ce processus.

4. Publiez un tableau de poses 3D mises à zéro à partir du code robot correspondant au nombre de composants dans le modèle, puis sélectionnez-le comme ensemble de poses de composants dans AdvantageScope.

5. Ajustez les rotations, suivies des positions, pour chaque composant jusqu'à ce qu'ils soient alignés sur l'origine. Par exemple, un segment de bras serait aligné avec le pivot à l'origine tout en étant pointé vers l'avant le long de l'axe X.

6. Publiez les vraies poses de composants à partir du code robot, qui seront basées sur les origines nouvellement définies pour chaque composant. Par exemple, la pose d'un segment de bras serait positionnée au niveau de l'articulation du bras, pointée dans la direction du segment.

## Manettes

Une image doit être incluse dans le dossier avec le nom « image.png ». Le fichier de configuration doit être au format suivant :

```json
{
  "name": string // Nom unique, requis pour tous les types de ressources
  "components": [...] // Tableau de configurations de composants, voir ci-dessous
}
```

:::info
Les boutons, joysticks et valeurs d'axes prennent en charge les liaisons [SDL](https://www.libsdl.org) (utilisées par la console de pilotage FIRST actuelle) et les liaisons NI (utilisées par l'ancienne console de pilotage FRC NI). Au moins un ensemble de liaisons doit être fourni pour chaque composant.

Pour les liaisons NI, AdvantageScope est rétrocompatible avec les anciennes clés de configuration sans préfixe (par ex. `sourceIndex`). **Toutes les nouvelles manettes doivent utiliser des liaisons SDL explicites (par ex. `sdlSourceIndex`) pour la compatibilité avec la console de pilotage FIRST actuelle.**
:::

### Bouton unique / Valeur POV

```json
{
  "type": "button"
  "isYellow": boolean
  "isEllipse": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number
  "sdlSourcePov": string // Facultatif, peut être "up", "right", "down" ou "left". Si fourni, "sdlSourceIndex" sera l'index du POV à lire.

  // Liaison alternative pour la console de pilotage NI (facultatif)
  "niSourceIndex": number
  "niSourcePov": string
}
```

### Manette à deux axes

```json
{
  "type": "joystick" // Une manette qui se déplace dans deux dimensions
  "isYellow": boolean
  "centerPx": [number, number]
  "radiusPx": number
  "sdlXSourceIndex": number
  "sdlXSourceInverted": boolean // Non inversé : droite = positif
  "sdlYSourceIndex": number
  "sdlYSourceInverted": boolean // Non inversé : haut = positif
  "sdlButtonSourceIndex": number // Facultatif

  // Liaison alternative pour la console de pilotage NI (facultatif)
  "niXSourceIndex": number
  "niXSourceInverted": boolean
  "niYSourceIndex": number
  "niYSourceInverted": boolean
  "niButtonSourceIndex": number
}
```

### Axe unique

```json
{
  "type": "axis" // Une valeur d'axe unique
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
  "sdlSourceRange": [number, number] // Min supérieur à max pour inverser

  // Liaison alternative pour la console de pilotage NI (facultatif)
  "niSourceIndex": number,
  "niSourceRange": [number, number]
}
```

### Pavé tactile

```json
{
  "type": "touchpad" // Un pavé tactile
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
}
```

## Images de terrain plates

Une image doit être incluse dans le dossier avec le nom « image.png ». Elle doit être orientée avec l'alliance rouge sur la gauche. Le fichier de configuration doit être au format suivant :

```json
{
  "name": string // Nom unique, requis pour tous les types de ressources
  "isFTC": boolean // Indique s'il s'agit d'un terrain FTC au lieu d'un terrain FRC
  "coordinateSystem": // Le système de coordonnées par défaut à utiliser (voir ci-dessous)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC traditionnel
      "center-red"       // Systemcore
  "useGrid": boolean // Indique s'il faut afficher la grille s'il s'agit d'un terrain FTC ("true" par défaut)
  "sourceUrl": string // Lien vers le fichier d'origine, facultatif
  "topLeft": [number, number] // Coordonnée en pixels (origine en haut à gauche)
  "bottomRight": [number, number] // Coordonnée en pixels (origine en haut à gauche)
  "widthInches": number // Largeur réelle du terrain (grand côté)
  "heightInches": number // Hauteur réelle du terrain (petit côté)
}
```

## Modèles 3D de terrain

Un modèle doit être inclus dans le dossier avec le nom « model.glb ». Une fois toutes les rotations appliquées, le terrain doit être orienté avec l'alliance rouge sur la gauche. Les fichiers CAO doivent être convertis en glTF; voir [cette page](gltf-convert) pour plus de détails. Les modèles d'éléments de pointage suivent la convention de nommage « model_INDEX.glb » basée sur l'ordre dans lequel ils apparaissent dans le tableau « gamePieces ». Les AprilTags déclarés ici sont toujours positionnés en utilisant un système de coordonnées [centre/rouge](/more-features/coordinate-systems#centerred-systemcore), quelles que soient les autres options de configuration.

Le fichier de configuration doit être au format suivant :

```json
{
  "name": string // Nom unique, requis pour tous les types de ressources
  "isFTC": boolean // Indique s'il s'agit d'un terrain FTC au lieu d'un terrain FRC
  "coordinateSystem": // Le système de coordonnées par défaut à utiliser (voir ci-dessous)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC traditionnel
      "center-red"       // Systemcore
  "useGrid": boolean // Indique s'il faut afficher la grille s'il s'agit d'un terrain FTC ("true" par défaut)
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Séquence de rotations le long des axes x, y et z
  "widthInches": number // Largeur réelle du terrain (grand côté)
  "heightInches": number // Hauteur réelle du terrain (petit côté)
  "defaultOrigin": "auto" | "blue" | "red" // Emplacement d'origine par défaut, "auto" si non spécifié
  "driverStations": [
    [number, number] // Positions des postes de pilotage (X et Y en mètres par rapport au centre du terrain)
    ...              // Pour la FRC, 6 éléments ordonnés [B1, B2, B3, R1, R2, R3]. Pour le FTC, 4 éléments ordonnés [BL, BR, RL, RR].
  ]
  "gamePieces": [ // Liste des types d'éléments de pointage
    {
      "name": string // Nom de l'élément de pointage
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Séquence de rotations le long des axes x, y et z
      "position": [number, number, number] // Décalage de position en mètres, appliqué après rotation
      "stagedObjects": string[] // Noms des objets d'éléments de pointage placés, à masquer si des poses utilisateur sont fournies
    },
    ...
  ],
  "aprilTags": [ // Liste des modèles AprilTag supplémentaires (si non inclus dans le modèle de terrain)
    "variant": string // Format sous la forme "FAMILY-SIZEin" où "FAMILY" est "36h11" ou "16h5" et "SIZE" est la longueur de la section noire
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Séquence de rotations le long des axes x, y et z
    "position": [number, number, number] // Décalage de position en mètres, appliqué après rotation
  ]
}
```
