# ⚙️ Resurse personalizate {#custom-assets}

AdvantageScope folosește un set implicit de imagini plate de teren, modele de teren, modele de roboți și configurații de joystick-uri. Resursele simple (de ex., terenurile evergreen) sunt incluse direct la instalare. Resursele detaliate (de ex., terenurile specifice fiecărui sezon) se descarcă automat în fundal atunci când AdvantageScope are conexiune la internet. Pentru a verifica starea acestor descărcări, dă clic pe `Aplicație`/`AdvantageScope` > `Stare descărcare resursă...`.

Dacă vrei să adaugi mai multe opțiuni, poți personaliza setul de resurse. Pentru a deschide folderul cu resurse al utilizatorului, dă clic pe `Aplicație`/`AdvantageScope` > `Afișează folderul cu resurse`. Mai jos găsești formatele acceptate pentru fiecare tip de resursă. Consultă setul implicit de [resurse detaliate](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) și [resurse incluse](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) ca referință.

:::tip
Pentru a încărca resurse dintr-o locație alternativă, dă clic pe `Aplicație`/`AdvantageScope` > `Utilizează folderul cu resurse personalizate`. Folderul selectat trebuie să fie _folderul părinte_, în care poți pune mai multe resurse în subfoldere separate. Astfel, poți salva resursele personalizate sub controlul versiunilor, alături de codul robotului.
:::

## Format general {#general-format}

Toate resursele sunt stocate în foldere denumite după formatul „TIP_NUME”. Partea „NUME” din numele folderului nu este afișată în AdvantageScope. Tipurile posibile de resurse sunt:

- "Field2d"
- "Field3d"
- "Robot"
- "Joystick"

:::info
Exemple de nume de foldere: „Field2d_2023Field”, „Joystick_OperatorButtons” sau „Robot_Dozer”.
:::

Fiecare folder trebuie să conțină un fișier numit „config.json” și unul sau mai multe fișiere de resurse, conform descrierii de mai jos. Fișierul de configurare include întotdeauna numele resursei afișat în AdvantageScope, care trebuie să fie unic pentru fiecare tip de resursă. Opțional, resursele pot include un obiect „locales” care mapează codurile de limbă (de ex., „es-419”, „fr”, „zh-CN”) la nume traduse. Câmpul „name” de la nivelul principal este folosit ca nume implicit dacă limba selectată nu apare în „locales” sau dacă „locales” lipsește.

```json
{
  "name": string, // Nume implicit unic, obligatoriu pentru toate tipurile de resurse
  "locales": { [locale: string]: string } // Nume traduse opționale care mapează codurile de limbă (de ex. „en-US”, „fr”) la traduceri
  ... // Configurație dependentă de tip, descrisă mai jos
}
```

## Modele de roboți 3D {#3d-robot-models}

### Tutorial video {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Prezentare generală {#overview}

Folderul trebuie să conțină un model numit „model.glb”. Fișierele CAD trebuie convertite în glTF; consultă [această pagină](gltf-convert) pentru detalii. Fișierul de configurare trebuie să respecte următorul format:

```json
{
  "name": string // Unique name, required for all asset types
  "locales": { [locale: string]: string } // Traduceri opționale pentru numele resursei
  "isFTC": boolean // Whether the model is intended for use on FTC fields instead of FRC fields (default "false")
  "disableSimplification": boolean // Whether to disable model simplification, optional
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
  "position": [number, number, number] // Position offset in meters, applied after rotation
  "cameras": [ // Fixed camera positions, can be empty
    {
      "name": string // Camera name
      "locales": { [locale: string]: string } // Traduceri opționale pentru numele camerei
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Sequence of rotations along the x, y, and z axes
      "position": [number, number, number] // Position offset in meters relative to the robot, applied after rotation
      "resolution": [number, number] // Resolution in pixels, used to set the fixed aspect ratio
      "fov": number // Horizontal field of view in degrees
    }
  ],
  "components": [...] // See "Articulated Components"
}
```

Cel mai simplu mod de a găsi valorile potrivite pentru poziție și rotație este prin încercare și eroare. Îți recomandăm să ajustezi mai întâi rotația și apoi poziția, deoarece transformările se aplică în această ordine.

:::info
AdvantageScope simplifică automat geometria modelului pentru a îmbunătăți performanța, iar nivelul de detaliu depinde de [modul de randare](/tab-reference/3d-field#rendering-modes) selectat. Dacă simplificarea modelului produce efecte nedorite la resursele personalizate, ai două soluții:

- Pentru a dezactiva eliminarea automată a unei anumite rețele (mesh), include șirul `NOSIMPLIFY` în numele rețelei.
- Pentru a dezactiva simplificarea modelului pentru un întreg robot, setează opțiunea `disableSimplification` din configurație la `true`.

:::

### Componente articulate {#articulated-components}

:::warning
Configurarea componentelor articulate poate fi complexă și consumatoare de timp. Ia în considerare folosirea suportului [3D `Mechanism2d`](/tab-reference/3d-field#2d-mechanisms) din AdvantageScope, care oferă o abordare mult mai simplă pentru **vizualizarea mecanismelor pe terenul 3D**.
:::

Modelele de roboți pot conține componente articulate pentru vizualizarea datelor mecanismelor (vezi [această pagină](/tab-reference/3d-field) pentru detalii). Modelul glTF de bază nu trebuie să includă componentele; fiecare componentă se exportă separat ca model glTF. Modelele componentelor urmează convenția de denumire „model_INDEX.glb”, astfel încât prima componentă articulată va fi „model_0.glb”.

Configurarea componentelor se face în fișierul de configurare al robotului, furnizând un tablou (array) sub cheia „components”. Dacă nu furnizezi pose-uri pentru componente în AdvantageScope, modelele acestora vor fi poziționate folosind rotațiile și poziția implicite ale robotului (vezi mai sus). Dacă furnizezi pose-uri pentru componente, se aplică mai întâi rotațiile și poziția „aduse la zero” (zeroed) pentru a aduce fiecare componentă în originea robotului, apoi se aplică pose-urile tale pentru a muta fiecare componentă la locul ei pe robot.

:::tip
Când poziționezi componente 3D relativ la robot, originea sistemului de coordonate corespunde pose-ului publicat al robotului. Reține că acest pose are de obicei înălțimea zero, adică planul podelei, și NU placa de bază (bellypan) a robotului (pentru mișcarea 2D obișnuită a robotului).
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

Pentru a calibra pozițiile componentelor articulate, îți recomandăm să urmezi acești pași:

1. Exportă modelul de bază și componentele în pozițiile lor „implicite” corecte. Așa vor fi randate dacă nu furnizezi pose-uri pentru componente în AdvantageScope.

2. Publică un pose 2D adus la zero din codul robotului, apoi selectează-l ca pose al robotului în AdvantageScope. Comută la terenul 3D „Axe”, care arată originea terenului.

3. Ajustează rotațiile generale ale robotului (nu ale componentelor) până când întregul robot este orientat corect. Apoi, ajustează poziția generală pentru a aduce întregul robot în origine. Componentele ar trebui să rămână randate în aceleași poziții implicite pe tot parcursul acestui pas.

4. Publică un tablou de pose-uri 3D aduse la zero din codul robotului, corespunzător numărului de componente din model, apoi selectează-l ca set de pose-uri ale componentelor în AdvantageScope.

5. Ajustează rotațiile, urmate de poziții, pentru fiecare componentă până când acestea sunt aliniate la origine. De exemplu, un segment de braț va fi aliniat cu pivotul în origine și îndreptat înainte, de-a lungul axei X.

6. Publică pose-urile reale ale componentelor din codul robotului, care se vor baza pe originile nou definite pentru fiecare componentă. De exemplu, pose-ul pentru un segment de braț va fi poziționat la articulația brațului și orientat în direcția segmentului.

## Joystick-uri {#joysticks}

Folderul trebuie să conțină o imagine numită „image.png”. Fișierul de configurare trebuie să respecte următorul format:

```json
{
  "name": string // Unique name, required for all asset types
  "locales": { [locale: string]: string } // Traduceri opționale pentru numele resursei
  "components": [...] // Array of component configurations, see below
}
```

:::info
Butoanele, joystick-urile și valorile axelor suportă atât legături [SDL](https://www.libsdl.org) (folosite de actualul FIRST Driver Station), cât și legături NI (folosite de vechiul NI FRC Driver Station). Trebuie să furnizezi cel puțin un set de legături pentru fiecare componentă.

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

Folderul trebuie să conțină o imagine numită „image.png”, orientată cu alianța roșie în stânga. Fișierul de configurare trebuie să respecte următorul format:

```json
{
  "name": string // Unique name, required for all asset types
  "locales": { [locale: string]: string } // Traduceri opționale pentru numele resursei
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

Folderul trebuie să conțină un model numit „model.glb”. După aplicarea tuturor rotațiilor, terenul trebuie să fie orientat cu alianța roșie în stânga. Fișierele CAD trebuie convertite în glTF; consultă [această pagină](gltf-convert) pentru detalii. Modelele pieselor de joc urmează convenția de denumire „model_INDEX.glb”, în ordinea în care apar în tabloul „gamePieces”. AprilTag-urile declarate aici sunt întotdeauna poziționate folosind sistemul de coordonate [centru/roșu](/more-features/coordinate-systems#center-red), indiferent de orice alte opțiuni de configurare.

Fișierul de configurare trebuie să respecte următorul format:

```json
{
  "name": string // Unique name, required for all asset types
  "locales": { [locale: string]: string } // Traduceri opționale pentru numele resursei
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
      "locales": { [locale: string]: string } // Traduceri opționale pentru numele piesei de joc
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
