# ⚙️ Aangepaste assets {#custom-assets}

AdvantageScope gebruikt standaard een set platte veldafbeeldingen, 3D-veldmodellen, robotmodellen en joystickindelingen. Eenvoudige assets (zoals "Permanent"-velden) zitten al bij de installatie inbegrepen. Gedetailleerde assets (zoals seizoensgebonden velden) downloadt AdvantageScope automatisch op de achtergrond zodra je internet hebt. De voortgang bekijk je via `App`/`AdvantageScope` > `Downloadstatus van assets...`.

Wil je zelf extra opties toevoegen? Open dan de gebruikersmap voor assets via `App`/`AdvantageScope` > `Assetsmap tonen`. Hieronder lees je welk formaat AdvantageScope verwacht. Kijk voor voorbeelden ook eens naar de standaardset met [gedetailleerde assets](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) en de [meegeleverde assets](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets).

:::tip
Wil je assets uit een andere map laden? Klik dan op `App`/`AdvantageScope` > `Aangepaste assetsmap gebruiken`. Kies de _hoofdmap_ waarin de losse assetmappen als submappen staan. Zo kun je eigen assets bijvoorbeeld direct onder versiebeheer opslaan naast je robotcode.
:::

## Algemeen formaat {#general-format}

Elke asset staat in een eigen map met de naamconventie "TYPE_NAAM". De NAAM van de map wordt verder niet in AdvantageScope getoond. Dit zijn de mogelijke assettypen:

- "Field2d"
- "Field3d"
- "Robot"
- "Joystick"

:::info
Voorbeelden van mapnamen zijn "Field2d_2023Field", "Joystick_OperatorButtons" of "Robot_Dozer".
:::

In de map moeten een bestand met de naam "config.json" en een of meer assetbestanden staan, zoals hieronder beschreven. In het configuratiebestand staat altijd de weergavenaam van de asset, die binnen elk assettype uniek moet zijn. Optioneel kun je een "locales"-object toevoegen dat taalcodes (zoals "es-419", "fr" of "zh-CN") koppelt aan vertaalde namen. Als de gekozen taal er niet bij staat of "locales" ontbreekt, gebruikt AdvantageScope de "name" op het hoofdniveau.

```json
{
  "name": string, // Unieke standaardnaam, verplicht voor alle assettypen
  "locales": { [locale: string]: string } // Optionele vertalingen die taalcodes (bijv. "es-419", "fr") koppelen aan namen
  ... // Configuratie afhankelijk van het type, hieronder beschreven
}
```

## 3D-robotmodellen {#3d-robot-models}

### Videohandleiding {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Overzicht {#overview}

In de map moet een modelbestand met de naam "model.glb" staan. CAD-bestanden moet je eerst omzetten naar glTF; op [deze pagina](gltf-convert) lees je hoe dat werkt. Het configuratiebestand heeft de volgende structuur:

```json
{
  "name": string // Unieke naam, verplicht voor alle assettypen
  "locales": { [locale: string]: string } // Optionele vertalingen voor de assetnaam
  "isFTC": boolean // Of het model bedoeld is voor FTC-velden in plaats van FRC-velden (standaard "false")
  "disableSimplification": boolean // Of modelvereenvoudiging moet worden uitgeschakeld (optioneel)
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Reeks rotaties rond de x-, y- en z-as
  "position": [number, number, number] // Positie-offset in meters, toegepast na rotatie
  "cameras": [ // Vaste cameraposities (mag leeg zijn)
    {
      "name": string // Cameranaam
      "locales": { [locale: string]: string } // Optionele vertalingen voor de cameranaam
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Reeks rotaties rond de x-, y- en z-as
      "position": [number, number, number] // Positie-offset in meters ten opzichte van de robot, toegepast na rotatie
      "resolution": [number, number] // Resolutie in pixels voor de vaste beeldverhouding
      "fov": number // Horizontaal gezichtsveld in graden
    }
  ],
  "components": [...] // Zie "Scharnierende componenten"
}
```

De makkelijkste manier om de juiste positie en rotatie te vinden is door het gewoon uit te proberen. Pas eerst de rotatie aan en daarna pas de positie, want AdvantageScope voert de transformaties in die volgorde uit.

:::info
AdvantageScope vereenvoudigt de geometrie van 3D-modellen automatisch voor betere prestaties, afhankelijk van de gekozen [weergavemodus](/tab-reference/3d-field#rendering-modes). Geeft dat bij een eigen model een ongewenst resultaat? Dan heb je twee opties:

- Zet `NOSIMPLIFY` in de naam van een specifieke mesh om te voorkomen dat die automatisch wordt verwijderd.
- Zet de optie `disableSimplification` in het configuratiebestand op `true` om vereenvoudiging voor het hele robotmodel uit te schakelen.
  :::

### Scharnierende componenten {#articulated-components}

:::warning
Het instellen van scharnierende componenten kan best ingewikkeld en tijdrovend zijn. Kijk daarom eerst of AdvantageScope's 3D-ondersteuning voor [`Mechanism2d`](/tab-reference/3d-field#2d-mechanisms) genoeg is; dat is vaak een veel snellere manier om **mechanismen op het 3D-veld te tonen**.
:::

Robotmodellen kunnen scharnierende componenten bevatten om data van mechanismen te visualiseren (zie [hier](/tab-reference/3d-field) voor meer uitleg). Het basismodel in glTF mag geen losse componenten bevatten; elk component exporteer je als een apart glTF-bestand. Componenten krijgen de naam "model_INDEX.glb", dus het eerste component heet "model_0.glb".

De configuratie van de componenten zet je in het configuratiebestand van de robot onder de sleutel "components". Geeft de gebruiker in AdvantageScope geen componentposes op, dan gebruikt AdvantageScope de standaardrotaties en -positie van de robot (zie hierboven). Zodra er wel componentposes worden opgegeven, past AdvantageScope eerst de "zeroed"-rotaties en -positie toe om elk component naar de oorsprong van de robot te verplaatsen, en zet het de componenten daarna met de opgegeven poses op de juiste plek.

:::tip
Als je 3D-componenten ten opzichte van de robot plaatst, komt de oorsprong van het coördinatenstelsel overeen met de gepubliceerde robotpose. Houd er rekening mee dat die pose meestal een hoogte van nul heeft: dat is het vloervlak en NIET de bodemplaat van de robot (bij standaard 2D-bewegingen).
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Reeks rotaties rond de x-, y- en z-as
    "zeroedPosition": [number, number, number] // Positie-offset in meters ten opzichte van de robot, toegepast na rotatie
  }
]
```

#### Instelproces {#setup-process}

Om de posities van scharnierende componenten goed af te stellen, werkt deze volgorde het best:

1. Exporteer het basismodel en alle componenten in hun juiste “standaard” positie. Zo worden ze getekend als er geen componentposes zijn opgegeven in AdvantageScope.

2. Publiceer een 2D-nulpose vanuit je robotcode en selecteer die als robotpose in AdvantageScope. Kies bij het 3D-veld voor "Assen" om de oorsprong van het veld te zien.

3. Stel eerst de algemene rotaties van de robot bij (niet van de componenten) totdat de hele robot goed gedraaid staat. Pas daarna de algemene positie aan om de robot naar de oorsprong te verplaatsen. De componenten blijven tijdens deze stap gewoon in hun standaardpositie staan.

4. Publiceer vanuit je robotcode een array met 3D-nulposes (evenveel als er componenten in het model zitten) en selecteer die als de componentposes in AdvantageScope.

5. Stel voor elk component eerst de rotaties en daarna de positie bij, totdat het netjes op de oorsprong ligt. Een armsegment lijn je bijvoorbeeld zo uit dat het scharnierpunt op de oorsprong ligt en de arm recht vooruit langs de X-as wijst.

6. Publiceer nu de echte componentposes vanuit je robotcode, gemeten vanaf de nieuwe oorsprong van elk component. De pose van een armsegment zet je bijvoorbeeld op het scharnierpunt van de arm, gericht langs het segment.

## Joysticks {#joysticks}

In de map moet een afbeelding met de naam "image.png" staan. Het configuratiebestand heeft de volgende structuur:

```json
{
  "name": string // Unieke naam, verplicht voor alle assettypen
  "locales": { [locale: string]: string } // Optionele vertalingen voor de assetnaam
  "components": [...] // Array met componentconfiguraties, zie hieronder
}
```

:::info
Knoppen, joysticks en aswaarden ondersteunen zowel [SDL](https://www.libsdl.org)-koppelingen (gebruikt door het huidige FIRST Driver Station) als NI-koppelingen (gebruikt door het oude NI FRC Driver Station). Elk component moet minstens één set koppelingen hebben.

Voor NI-koppelingen is AdvantageScope achterwaarts compatibel met de oude sleutels zonder prefix (zoals `sourceIndex`). **Alle nieuwe joysticks moeten expliciete SDL-koppelingen gebruiken (zoals `sdlSourceIndex`) voor compatibiliteit met het huidige FIRST Driver Station.**
:::

### Enkele knop / POV-waarde {#single-button-pov-value}

```json
{
  "type": "button"
  "isYellow": boolean
  "isEllipse": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number
  "sdlSourcePov": string // Optioneel: "up", "right", "down" of "left". Als je dit invult, is "sdlSourceIndex" de index van de POV.

  // Alternatieve koppelingen voor het NI Driver Station (optioneel)
  "niSourceIndex": number
  "niSourcePov": string
}
```

### Twee-assige joystick {#two-axis-joystick}

```json
{
  "type": "joystick" // Een joystick die in twee richtingen beweegt
  "isYellow": boolean
  "centerPx": [number, number]
  "radiusPx": number
  "sdlXSourceIndex": number
  "sdlXSourceInverted": boolean // Niet omgekeerd: rechts = positief
  "sdlYSourceIndex": number
  "sdlYSourceInverted": boolean // Niet omgekeerd: omhoog = positief
  "sdlButtonSourceIndex": number // Optioneel

  // Alternatieve koppelingen voor het NI Driver Station (optioneel)
  "niXSourceIndex": number
  "niXSourceInverted": boolean
  "niYSourceIndex": number
  "niYSourceInverted": boolean
  "niButtonSourceIndex": number
}
```

### Enkele as {#single-axis}

```json
{
  "type": "axis" // Een enkele aswaarde
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
  "sdlSourceRange": [number, number] // Min groter dan max om te inverteren

  // Alternatieve koppelingen voor het NI Driver Station (optioneel)
  "niSourceIndex": number,
  "niSourceRange": [number, number]
}
```

### Touchpad {#touchpad}

```json
{
  "type": "touchpad" // Een touchpad
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
}
```

## Platte veldafbeeldingen {#flat-field-images}

In de map moet een afbeelding met de naam "image.png" staan, gedraaid zodat de rode alliantie links zit. Het configuratiebestand heeft de volgende structuur:

```json
{
  "name": string // Unieke naam, verplicht voor alle assettypen
  "locales": { [locale: string]: string } // Optionele vertalingen voor de assetnaam
  "isFTC": boolean // Of dit een FTC-veld is in plaats van een FRC-veld
  "coordinateSystem": // Het standaard te gebruiken coördinatenstelsel (zie hieronder)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC traditioneel
      "center-red"       // Systemcore
  "useGrid": boolean // Of rasterlijnen moeten worden getoond op een FTC-veld (standaard "true")
  "sourceUrl": string // Link naar het oorspronkelijke bestand (optioneel)
  "topLeft": [number, number] // Pixelcoördinaat (oorsprong linksboven)
  "bottomRight": [number, number] // Pixelcoördinaat (oorsprong linksboven)
  "widthInches": number // Echte breedte van het veld (lange zijde)
  "heightInches": number // Echte hoogte van het veld (korte zijde)
}
```

## 3D-veldmodellen {#3d-field-models}

In de map moet een modelbestand met de naam "model.glb" staan. Nadat alle rotaties zijn toegepast, moet de rode alliantie links zitten. CAD-bestanden moet je eerst omzetten naar glTF; op [deze pagina](gltf-convert) lees je hoe dat werkt. Modellen van speelstukken krijgen de naam "model_INDEX.glb" op basis van hun volgorde in de "gamePieces"-array. AprilTags die je hier opgeeft, worden altijd geplaatst met het coördinatenstelsel [midden/rood](/more-features/coordinate-systems#center-red), ongeacht andere instellingen.

Het configuratiebestand heeft de volgende structuur:

```json
{
  "name": string // Unieke naam, verplicht voor alle assettypen
  "locales": { [locale: string]: string } // Optionele vertalingen voor de assetnaam
  "isFTC": boolean // Of dit een FTC-veld is in plaats van een FRC-veld
  "coordinateSystem": // Het standaard te gebruiken coördinatenstelsel (zie hieronder)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC traditioneel
      "center-red"       // Systemcore
  "useGrid": boolean // Of rasterlijnen moeten worden getoond op een FTC-veld (standaard "true")
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Reeks rotaties rond de x-, y- en z-as
  "widthInches": number // Echte breedte van het veld (lange zijde)
  "heightInches": number // Echte hoogte van het veld (korte zijde)
  "defaultOrigin": "auto" | "blue" | "red" // Standaardlocatie voor de oorsprong, "auto" als niets is opgegeven
  "driverStations": [
    [number, number] // Driver Station-posities (X en Y in meters ten opzichte van het midden van het veld)
    ...              // Voor FRC: 6 elementen in de volgorde [B1, B2, B3, R1, R2, R3]. Voor FTC: 4 elementen in de volgorde [BL, BR, RL, RR].
  ]
  "gamePieces": [ // Lijst met typen speelstukken
    {
      "name": string // Naam van het speelstuk
      "locales": { [locale: string]: string } // Optionele vertalingen voor de naam van het speelstuk
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Reeks rotaties rond de x-, y- en z-as
      "position": [number, number, number] // Positie-offset in meters, toegepast na rotatie
      "stagedObjects": string[] // Namen van vooraf geplaatste speelstukobjecten die worden verborgen zodra er eigen poses zijn opgegeven
    },
    ...
  ],
  "aprilTags": [ // Lijst met extra AprilTag-modellen (als ze geen onderdeel zijn van het veldmodel)
    "variant": string // Formaat "FAMILY-SIZEin", waarbij "FAMILY" "36h11" of "16h5" is en "SIZE" de lengte van het zwarte gedeelte
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Reeks rotaties rond de x-, y- en z-as
    "position": [number, number, number] // Positie-offset in meters, toegepast na rotatie
  ]
}
```
