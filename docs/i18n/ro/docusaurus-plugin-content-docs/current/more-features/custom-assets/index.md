# ⚙️ Resurse personalizate {#custom-assets}

AdvantageScope utilizează un set implicit de imagini plate ale terenului, modele ale terenului, modele ale robotului și configurații de joystick-uri. Resursele simple (de ex. terenurile evergreen) sunt incluse în instalarea inițială. Resursele detaliate (de ex. terenurile specifice sezonului) sunt descărcate automat în fundal când AdvantageScope este conectat la internet. Pentru a verifica starea acestor descărcări, dați clic pe `Aplicație`/`AdvantageScope` > `Stare descărcare resursă...`.

Setul de resurse poate fi personalizat pentru a adăuga mai multe opțiuni dacă se dorește. Pentru a deschide folderul cu resurse al utilizatorului, dați clic pe `Aplicație`/`AdvantageScope` > `Afișează folderul cu resurse`. Formatele așteptate pentru resurse sunt definite mai jos. Consultați setul implicit de [resurse detaliate](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) și [resurse incluse](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) pentru referință.

:::tip
Pentru a încărca resurse dintr-o locație alternativă, dați clic pe `Aplicație`/`AdvantageScope` > `Utilizează folderul cu resurse personalizate`. Folderul selectat ar trebui să fie _folderul părinte_ în care pot fi plasate mai multe resurse în subfoldere separate. Această caracteristică permite ca resursele personalizate să fie stocate sub controlul versiunilor alături de codul robotului.
:::

## Format general {#general-format}

Toate resursele sunt stocate în foldere cu convenția de denumire „TIP_NUME”. NUMELE utilizat pentru folder nu este afișat de AdvantageScope. Tipurile posibile de resurse sunt:

- "Field2d"
- "Field3d"
- "Robot"
- "Joystick"

:::info
Exemple de nume de foldere ar fi „Field2d_2023Field”, „Joystick_OperatorButtons” sau „Robot_Dozer”.
:::

Acest folder ar trebui să conțină un fișier numit „config.json” și unul sau mai multe fișiere de resurse, așa cum este descris mai jos. Fișierul de configurare include întotdeauna numele resursei care urmează să fie afișat de AdvantageScope. Acest nume trebuie să fie unic pentru fiecare tip de resursă.

```json
{
  "name": string // Unique name, required for all asset types
  ... // Type-dependent configuration, described below
}
```

## Modele de roboți 3D {#3d-robot-models}

### Tutorial video {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Prezentare generală {#overview}

Un model trebuie să fie inclus în folder cu numele „model.glb”. Fișierele CAD trebuie convertite în glTF; consultați [această pagină](gltf-convert) pentru detalii. Fișierul de configurare trebuie să fie în următorul format:

```json
{
  "name": string // Unique name, required for all asset types
  "isFTC": boolean // Whether the model is intended for use on FTC fields instead of FRC fields (default "false")
  "disableSimplification": boolean // Whether to disable model simplification, optional
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
  "position": [number, number, number] // Position offset in meters, applied after rotation
  "cameras": [ // Fixed camera positions, can be empty
    {
      "name": string // Camera name
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
      "position": [number, number, number] // Position offset in meters relative to the robot, applied after rotation
      "resolution": [number, number] // Resolution in pixels, used to set the fixed aspect ratio
      "fov": number // Horizontal field of view in degrees
    }
  ],
  "components": [...] // See "Articulated Components"
}
```

Cea mai simplă cale de a determina valorile adecvate pentru poziție și rotație este prin încercare și eroare. Recomandăm ajustarea rotației înainte de poziție, deoarece transformările sunt aplicate în această ordine.

:::info
AdvantageScope simplifică automat geometria modelului pentru a îmbunătăți performanța, unde nivelul de detaliu depinde de [modul de randare](/tab-reference/3d-field#rendering-modes) selectat. În cazurile în care simplificarea modelului produce efecte nedorite cu resurse personalizate, pot fi utilizate două soluții:

- Pentru a dezactiva eliminarea automată a unei anumite rețele (mesh), includeți șirul `NOSIMPLIFY` în numele rețelei.
- Pentru a dezactiva simplificarea modelului pentru un întreg model de robot, setați opțiunea `disableSimplification` din configurație la `true`.

:::

### Componente articulate {#articulated-components}

:::warning
Configurarea componentelor articulate poate fi complexă și necesită timp. Luați în considerare utilizarea suportului [3D `Mechanism2d`](/tab-reference/3d-field#2d-mechanisms) al AdvantageScope, care oferă o abordare mai simplificată pentru **vizualizarea mecanismelor pe terenul 3D**.
:::

Modelele de roboți pot conține componente articulate pentru vizualizarea datelor mecanismelor (consultați [aici](/tab-reference/3d-field) pentru detalii). Modelul de bază glTF nu ar trebui să conțină componente, apoi fiecare componentă ar trebui exportată ca un model glTF separat. Modelele componentelor urmează convenția de denumire „model_INDEX.glb”, astfel încât prima componentă articulată ar fi „model_0.glb”.

Configurarea componentelor este furnizată în fișierul de configurare al robotului. Un tablou de componente ar trebui furnizat sub cheia „components”. Când nu sunt furnizate pose-uri de componente de către utilizator în AdvantageScope, modelele componentelor vor fi poziționate folosind rotațiile și poziția implicite ale robotului (consultați mai sus). Când sunt furnizate pose-uri de componente de către utilizator, rotațiile și poziția „aduse la zero” (zeroed) sunt aplicate în schimb pentru a aduce fiecare componentă la originea robotului. Pose-urile utilizatorului sunt apoi aplicate pentru a muta fiecare componentă la locația corectă pe robot.

:::tip
La poziționarea componentelor 3D relativ la robot, originea sistemului de coordonate se potrivește cu pose-ul publicat al robotului. Rețineți că acest pose utilizează în general o înălțime egală cu zero, care este planul podelei și NU placa de bază a robotului (pentru mișcarea 2D tipică a robotului).
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
    "zeroedPosition": [number, number, number] // Position offset in meters relative to the robot, applied after rotation
  }
]
```

#### Procesul de configurare {#setup-process}

Pentru a calibra pozițiile componentelor articulate, recomandăm următorul proces:

1. Exportați modelul de bază și componentele în pozițiile lor „implicite” corecte. Acesta este modul în care ar trebui randate dacă nu sunt furnizate pose-uri de componente în AdvantageScope.

2. Publicați un pose 2D adus la zero din codul robotului, apoi selectați-l ca pose al robotului în AdvantageScope. Comutați la terenul 3D „Axe”, care arată originea terenului.

3. Ajustați rotațiile generale ale robotului (nu ale componentelor) până când întregul robot este orientat corect. Apoi, ajustați poziția generală pentru a aduce întregul robot la origine. Componentele ar trebui să fie randate în aceleași poziții implicite pe parcursul acestui proces.

4. Publicați un tablou de pose-uri 3D aduse la zero din codul robotului care să se potrivească cu numărul de componente din model, apoi selectați-l ca set de pose-uri ale componentelor în AdvantageScope.

5. Ajustați rotațiile, urmate de poziții, pentru fiecare componentă până când acestea sunt aliniate la origine. De exemplu, un segment de braț ar fi aliniat cu pivotul la origine în timp ce este îndreptat înainte de-a lungul axei X.

6. Publicați pose-urile reale ale componentelor din codul robotului, care se vor baza pe originile nou definite pentru fiecare componentă. De exemplu, pose-ul pentru un segment de braț ar fi poziționat la articulația brațului îndreptat în direcția segmentului.

## Joystick-uri {#joysticks}

O imagine trebuie inclusă în folder cu numele „image.webp”. Fișierul de configurare trebuie să fie în următorul format:

```json
{
  "name": string // Unique name, required for all asset types
  "components": [...] // Array of component configurations, see below
}
```

:::info
Butoanele, joystick-urile și valorile axelor suportă atât legături [SDL](https://www.libsdl.org) (utilizate de actualul FIRST Driver Station), cât și legături NI (utilizate de vechiul NI FRC Driver Station). Cel puțin un set de legături trebuie furnizat pentru fiecare componentă.

Pentru legăturile NI, AdvantageScope este compatibil retroactiv cu vechile chei de configurare fără prefix (de ex. `sourceIndex`). **Toate joystick-urile noi ar trebui să utilizeze legături explicite SDL (de ex. `sdlSourceIndex`) pentru compatibilitate cu actualul FIRST Driver Station.**
:::

### Buton unic / valoare POV {#single-button-pov-value}

```json
{
  "type": "button"
  "isYellow": boolean
  "isEllipse": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number
  "sdlSourcePov": string // Optional, can be "up", "right", "down", or "left". If provided, the "sdlSourceIndex" will be the index of the POV to read.

  // Alternative bindings for the NI Driver Station (optional)
  "niSourceIndex": number
  "niSourcePov": string
}
```

### Joystick cu două axe {#two-axis-joystick}

```json
{
  "type": "joystick" // A joystick that moves in two dimensions
  "isYellow": boolean
  "centerPx": [number, number]
  "radiusPx": number
  "sdlXSourceIndex": number
  "sdlXSourceInverted": boolean // Not inverted: right = positive
  "sdlYSourceIndex": number
  "sdlYSourceInverted": boolean // Not inverted: up = positive
  "sdlButtonSourceIndex": number // Optional

  // Alternative bindings for the NI Driver Station (optional)
  "niXSourceIndex": number
  "niXSourceInverted": boolean
  "niYSourceIndex": number
  "niYSourceInverted": boolean
  "niButtonSourceIndex": number
}
```

### Axă unică {#single-axis}

```json
{
  "type": "axis" // A single axis value
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
  "sdlSourceRange": [number, number] // Min greater than max to invert

  // Alternative bindings for the NI Driver Station (optional)
  "niSourceIndex": number,
  "niSourceRange": [number, number]
}
```

### Touchpad {#touchpad}

```json
{
  "type": "touchpad" // A touchpad
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
}
```

## Imagini plate de teren {#flat-field-images}

O imagine trebuie inclusă în folder cu numele „image.webp”. Aceasta ar trebui orientată cu alianța roșie în stânga. Fișierul de configurare trebuie să fie în următorul format:

```json
{
  "name": string // Unique name, required for all asset types
  "isFTC": boolean // Whether this is an FTC field instead of an FRC field
  "coordinateSystem": // The default coordinate system to use (see below)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC traditional
      "center-red"       // Systemcore
  "useGrid": boolean // Whether to render grid lines if this field is an FTC one (default "true")
  "sourceUrl": string // Link to the original file, optional
  "topLeft": [number, number] // Pixel coordinate (origin at upper left)
  "bottomRight": [number, number] // Pixel coordinate (origin at upper left)
  "widthInches": number // Real width of the field (long side)
  "heightInches": number // Real height of the field (short side)
}
```

## Modele de teren 3D {#3d-field-models}

Un model trebuie inclus în folder cu numele „model.glb”. După aplicarea tuturor rotațiilor, terenul ar trebui să fie orientat cu alianța roșie în stânga. Fișierele CAD trebuie convertite în glTF; consultați [această pagină](gltf-convert) pentru detalii. Modelele pieselor de joc urmează convenția de denumire „model_INDEX.glb” pe baza ordinii în care apar în tabloul „gamePieces”. AprilTag-urile declarate aici sunt întotdeauna poziționate folosind un sistem de coordonate [centru/roșu](/more-features/coordinate-systems#center-red), indiferent de orice alte opțiuni de configurare.

Fișierul de configurare trebuie să fie în următorul format:

```json
{
  "name": string // Unique name, required for all asset types
  "isFTC": boolean // Whether this is an FTC field instead of an FRC field
  "coordinateSystem": // The default coordinate system to use (see below)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC traditional
      "center-red"       // Systemcore
  "useGrid": boolean // Whether to render grid lines if this field is an FTC one (default "true")
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
  "widthInches": number // Real width of the field (long side)
  "heightInches": number // Real height of the field (short side)
  "defaultOrigin": "auto" | "blue" | "red" // Default origin location, "auto" if unspecified
  "driverStations": [
    [number, number] // Driver station positions (X & Y in meters relative to the center of the field)
    ...              // For FRC, 6 elements ordered [B1, B2, B3, R1, R2, R3]. For FTC, 4 elements ordered [BL, BR, RL, RR].
  ]
  "gamePieces": [ // List of game piece types
    {
      "name": string // Game piece name
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
      "position": [number, number, number] // Position offset in meters, applied after rotation
      "stagedObjects": string[] // Names of staged game piece objects, to hide if user poses are supplied
    },
    ...
  ],
  "aprilTags": [ // List of supplemental AprilTag models (if not part of field model)
    "variant": string // Format as "FAMILY-SIZEin" where "FAMILY" is "36h11" or "16h5" and "SIZE" is the length of the black section
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
    "position": [number, number, number] // Position offset in meters, applied after rotation
  ]
}
```
