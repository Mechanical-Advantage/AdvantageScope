# ⚙️ Aangepaste assets {#custom-assets}

AdvantageScope gebruikt een standaardset van platte veldafbeeldingen, veldmodellen, robotmodellen en joystickconfiguraties. Eenvoudige assets (bijv. evergreen-velden) zijn inbegrepen in de initiële installatie. Gedetailleerde assets (bijv. seizoensgebonden velden) worden automatisch op de achtergrond gedownload wanneer AdvantageScope is verbonden met internet. Om de status van deze downloads te controleren, klik je op `App`/`AdvantageScope` > `Downloadstatus asset...`.

De set met assets kan worden aangepast om desgewenst meer opties toe te voegen. Om de map met gebruikersassets te openen, klik je op `App`/`AdvantageScope` > `Assetsmap tonen`. De verwachte formaten voor de assets worden hieronder gedefinieerd. Zie de standaardset van [gedetailleerde assets](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) en [meegeleverde assets](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) ter referentie.

:::tip
Om assets vanaf een alternatieve locatie te laden, klik je op `App`/`AdvantageScope` > `Aangepaste assetsmap gebruiken`. De geselecteerde map moet de _hoofdmap_ zijn waarin meerdere assets in afzonderlijke submappen kunnen worden geplaatst. Met deze functie kunnen aangepaste assets onder versiebeheer worden opgeslagen naast robotcode.
:::

## Algemeen formaat {#general-format}

Alle assets worden opgeslagen in mappen met de naamconventie "TYPE_NAAM". De NAAM die voor de map wordt gebruikt, wordt niet weergegeven door AdvantageScope. De mogelijke assettypen zijn:

- "Field2d"
- "Field3d"
- "Robot"
- "Joystick"

:::info
Voorbeelden van mapnamen zijn "Field2d_2023Field", "Joystick_OperatorButtons" of "Robot_Dozer".
:::

Deze map moet een bestand met de naam "config.json" en een of meer assetbestanden bevatten, zoals hieronder beschreven. Het configuratiebestand bevat altijd de naam van de asset zoals deze door AdvantageScope moet worden weergegeven. Deze naam moet uniek zijn voor elk assettype. Assets kunnen optioneel ook een "locales"-object bevatten dat taalcodes (bijv. "en-US", "es-419", "fr") koppelt aan vertaalde namen. De "name" op het hoofdniveau wordt behandeld als de standaardnaam als de geselecteerde taal niet wordt vermeld of "locales" wordt weggelaten.

```json
{
  "name": string, // Unieke standaardnaam, vereist voor alle assettypen
  "locales": { [locale: string]: string } // Optionele gelokaliseerde namen die taalcodes (bijv. "en-US", "fr") koppelen aan vertalingen
  ... // Type-afhankelijke configuratie, hieronder beschreven
}
```

## 3D-robotmodellen {#3d-robot-models}

### Videohandleiding {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Overzicht {#overview}

Er moet een model in de map worden opgenomen met de naam "model.glb". CAD-bestanden moeten worden geconverteerd naar glTF; zie [deze pagina](gltf-convert) voor details. Het configuratiebestand moet de volgende opmaak hebben:

```json
{
  "name": string // Unieke naam, vereist voor alle assettypen
  "locales": { [locale: string]: string } // Optionele vertalingen voor assetnaam
  "isFTC": boolean // Of het model bedoeld is voor gebruik op FTC-velden in plaats van FRC-velden (standaard "false")
  "disableSimplification": boolean // Of modelvereenvoudiging moet worden uitgeschakeld, optioneel
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Reeks rotaties langs de x-, y- en z-assen
  "position": [number, number, number] // Positie-offset in meters, toegepast na rotatie
  "cameras": [ // Vaste cameraposities, kan leeg zijn
    {
      "name": string // Cameranaam
      "locales": { [locale: string]: string } // Optionele vertalingen voor cameranaam
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Reeks rotaties langs de x-, y- en z-assen
      "position": [number, number, number] // Positie-offset in meters ten opzichte van de robot, toegepast na rotatie
      "resolution": [number, number] // Resolutie in pixels, gebruikt om de vaste beeldverhouding in te stellen
      "fov": number // Horizontaal gezichtsveld in graden
    }
  ],
  "components": [...] // Zie "Scharnierende componenten"
}
```

De eenvoudigste manier om de juiste positie- en rotatiewaarden te bepalen is door vallen en opstaan. We raden aan de rotatie vóór de positie aan te passen, aangezien de transformaties in deze volgorde worden toegepast.

:::info
AdvantageScope vereenvoudigt modelgeometrie automatisch om de prestaties te verbeteren, waarbij het detailniveau afhangt van de geselecteerde [weergavemodus](/tab-reference/3d-field#rendering-modes). In gevallen waarin modelvereenvoudiging ongewenste effecten oplevert bij aangepaste assets, kunnen twee oplossingen worden gebruikt:

- Om automatische verwijdering van een specifieke mesh uit te schakelen, neem je de string `NOSIMPLIFY` op in de mesh-naam.
- Om modelvereenvoudiging voor een heel robotmodel uit te schakelen, stel je de optie `disableSimplification` in de configuratie in op `true`.

:::

### Scharnierende componenten {#articulated-components}

:::warning
Het opzetten van scharnierende componenten kan complex en tijdrovend zijn. Overweeg AdvantageScope's 3D [`Mechanism2d`-ondersteuning](/tab-reference/3d-field#2d-mechanisms) te gebruiken, die een meer gestroomlijnde aanpak biedt om **mechanismen op het 3D-veld te visualiseren**.
:::

Robotmodellen kunnen scharnierende componenten bevatten voor het visualiseren van mechanismedata (zie [hier](/tab-reference/3d-field) voor details). Het basis-glTF-model mag geen componenten bevatten; elk component moet vervolgens als een afzonderlijk glTF-model worden geëxporteerd. Componentmodellen volgen de naamconventie "model_INDEX.glb", dus het eerste scharnierende component zou "model_0.glb" zijn.

Componentconfiguratie wordt opgegeven in het configuratiebestand van de robot. Onder de sleutel "components" moet een array van componenten worden opgegeven. Wanneer door de gebruiker in AdvantageScope geen componentposes worden opgegeven, worden de componentmodellen gepositioneerd met behulp van de standaard robotrotaties en -positie (zie hierboven). Wanneer er wel componentposes worden opgegeven door de gebruiker, worden in plaats daarvan de "nul"-rotaties en -positie toegepast om elk component naar de oorsprong van de robot te brengen. De poses van de gebruiker worden vervolgens toegepast om elk component naar de juiste locatie op de robot te verplaatsen.

:::tip
Bij het positioneren van 3D-componenten ten opzichte van de robot komt de oorsprong van het coördinatenstelsel overeen met de gepubliceerde pose van de robot. Merk op dat deze pose doorgaans een hoogte van nul gebruikt, wat het vloervlak is en NIET de bodemplaat van de robot (voor typische 2D-robotbewegingen).
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Reeks rotaties langs de x-, y- en z-assen
    "zeroedPosition": [number, number, number] // Positie-offset in meters ten opzichte van de robot, toegepast na rotatie
  }
]
```

#### Installatieproces {#setup-process}

Om de posities van de scharnierende componenten te kalibreren, bevelen we het volgende proces aan:

1. Exporteer het basismodel en de componenten in hun correcte “standaard” posities. Dit is hoe ze gerenderd moeten worden als er geen componentposes worden opgegeven in AdvantageScope.

2. Publiceer een nul-2D-pose vanuit de robotcode en selecteer deze vervolgens als de robotpose in AdvantageScope. Schakel over naar het "Assen" 3D-veld, dat de veldoorsprong toont.

3. Pas de algehele rotaties van de robot (niet de componenten) aan totdat de volledige robot correct is georiënteerd. Pas vervolgens de algehele positie aan om de volledige robot naar de oorsprong te brengen. De componenten moeten gedurende dit hele proces in dezelfde standaardposities gerenderd blijven.

4. Publiceer een array van nul-3D-poses vanuit de robotcode die overeenkomt met het aantal componenten in het model, en selecteer deze vervolgens als de set componentposes in AdvantageScope.

5. Pas voor elk component de rotaties aan, gevolgd door de posities, totdat ze zijn uitgelijnd met de oorsprong. Een armsegment zou bijvoorbeeld worden uitgelijnd met het scharnierpunt op de oorsprong terwijl het naar voren langs de X-as wijst.

6. Publiceer de echte componentposes vanuit de robotcode, die gebaseerd zullen zijn op de nieuw gedefinieerde oorsprongen voor elk component. De pose voor een armsegment zou bijvoorbeeld worden gepositioneerd bij het gewricht van de arm, wijzend in de richting van het segment.

## Joysticks {#joysticks}

Er moet een afbeelding in de map worden opgenomen met de naam "image.png". Het configuratiebestand moet de volgende opmaak hebben:

```json
{
  "name": string // Unieke naam, vereist voor alle assettypen
  "locales": { [locale: string]: string } // Optionele vertalingen voor assetnaam
  "components": [...] // Array van componentconfiguraties, zie hieronder
}
```

:::info
Knoppen, joysticks en aswaarden ondersteunen zowel [SDL](https://www.libsdl.org)-koppelingen (gebruikt door het huidige FIRST Driver Station) als NI-koppelingen (gebruikt door het oude NI FRC Driver Station). Er moet ten minste één set koppelingen worden opgegeven voor elk component.

Voor NI-koppelingen is AdvantageScope achterwaarts compatibel met de oude configuratiesleutels zonder prefix (bijv. `sourceIndex`). **Alle nieuwe joysticks moeten expliciete SDL-koppelingen gebruiken (bijv. `sdlSourceIndex`) voor compatibiliteit met het huidige FIRST Driver Station.**
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
  "sdlSourcePov": string // Optioneel, kan "up", "right", "down" of "left" zijn. Indien opgegeven, is "sdlSourceIndex" de index van de te lezen POV.

  // Alternatieve koppelingen voor het NI Driver Station (optioneel)
  "niSourceIndex": number
  "niSourcePov": string
}
```

### Twee-assige joystick {#two-axis-joystick}

```json
{
  "type": "joystick" // Een joystick die in twee dimensies beweegt
  "isYellow": boolean
  "centerPx": [number, number]
  "radiusPx": number
  "sdlXSourceIndex": number
  "sdlXSourceInverted": boolean // Niet geïnverteerd: rechts = positief
  "sdlYSourceIndex": number
  "sdlYSourceInverted": boolean // Niet geïnverteerd: omhoog = positief
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

Er moet een afbeelding in de map worden opgenomen met de naam "image.png". Deze moet zo worden georiënteerd dat de rode alliantie zich aan de linkerkant bevindt. Het configuratiebestand moet de volgende opmaak hebben:

```json
{
  "name": string // Unieke naam, vereist voor alle assettypen
  "locales": { [locale: string]: string } // Optionele vertalingen voor assetnaam
  "isFTC": boolean // Of dit een FTC-veld is in plaats van een FRC-veld
  "coordinateSystem": // Het standaard te gebruiken coördinatenstelsel (zie hieronder)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC traditioneel
      "center-red"       // Systemcore
  "useGrid": boolean // Of rasterlijnen moeten worden weergegeven als dit een FTC-veld is (standaard "true")
  "sourceUrl": string // Link naar het oorspronkelijke bestand, optioneel
  "topLeft": [number, number] // Pixelcoördinaat (oorsprong linksboven)
  "bottomRight": [number, number] // Pixelcoördinaat (oorsprong linksboven)
  "widthInches": number // Echte breedte van het veld (lange zijde)
  "heightInches": number // Echte hoogte van het veld (korte zijde)
}
```

## 3D-veldmodellen {#3d-field-models}

Er moet een model in de map worden opgenomen met de naam "model.glb". Nadat alle rotaties zijn toegepast, moet het veld zo worden georiënteerd dat de rode alliantie zich aan de linkerkant bevindt. CAD-bestanden moeten worden geconverteerd naar glTF; zie [deze pagina](gltf-convert) voor details. Modellen van speelstukken volgen de naamconventie "model_INDEX.glb" op basis van de volgorde waarin ze voorkomen in de "gamePieces"-array. AprilTags die hier worden gedeclareerd, worden altijd gepositioneerd met behulp van een [midden/rood](/more-features/coordinate-systems#center-red)-coördinatenstelsel, ongeacht andere configuratieopties.

Het configuratiebestand moet de volgende opmaak hebben:

```json
{
  "name": string // Unieke naam, vereist voor alle assettypen
  "locales": { [locale: string]: string } // Optionele vertalingen voor assetnaam
  "isFTC": boolean // Of dit een FTC-veld is in plaats van een FRC-veld
  "coordinateSystem": // Het standaard te gebruiken coördinatenstelsel (zie hieronder)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC traditioneel
      "center-red"       // Systemcore
  "useGrid": boolean // Of rasterlijnen moeten worden weergegeven als dit een FTC-veld is (standaard "true")
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Reeks rotaties langs de x-, y- en z-assen
  "widthInches": number // Echte breedte van het veld (lange zijde)
  "heightInches": number // Echte hoogte van het veld (korte zijde)
  "defaultOrigin": "auto" | "blue" | "red" // Standaardlocatie oorsprong, "auto" indien niet gespecificeerd
  "driverStations": [
    [number, number] // Driver Station-posities (X & Y in meters relatief ten opzichte van het midden van het veld)
    ...              // Voor FRC, 6 elementen in volgorde [B1, B2, B3, R1, R2, R3]. Voor FTC, 4 elementen in volgorde [BL, BR, RL, RR].
  ]
  "gamePieces": [ // Lijst van typen speelstukken
    {
      "name": string // Naam speelstuk
      "locales": { [locale: string]: string } // Optionele vertalingen voor naam speelstuk
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Reeks rotaties langs de x-, y- en z-assen
      "position": [number, number, number] // Positie-offset in meters, toegepast na rotatie
      "stagedObjects": string[] // Namen van klaargezette speelstukobjecten, te verbergen als poses van de gebruiker worden verstrekt
    },
    ...
  ],
  "aprilTags": [ // Lijst van aanvullende AprilTag-modellen (indien geen onderdeel van veldmodel)
    "variant": string // Formaat als "FAMILY-SIZEin" waarbij "FAMILY" "36h11" of "16h5" is en "SIZE" de lengte van het zwarte gedeelte is
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // Reeks rotaties langs de x-, y- en z-assen
    "position": [number, number, number] // Positie-offset in meters, toegepast na rotatie
  ]
}
```
