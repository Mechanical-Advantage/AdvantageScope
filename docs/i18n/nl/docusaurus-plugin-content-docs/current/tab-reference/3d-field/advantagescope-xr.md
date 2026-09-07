# AdvantageScope XR {#advantagescope-xr}

AdvantageScope XR brengt de weergave van het 👀 [3D-veld](/tab-reference/3d-field) tot leven in augmented reality, waardoor je data op geheel nieuwe manieren kunt visualiseren. Bekijk een gesimuleerde autonome routine op ware grootte, bekijk wedstrijdstrategie met een tafelmodel van het veld, projecteer diagnostische informatie over een echte robot heen, en nog veel meer! De onderstaande video demonstreert verschillende gebruiksscenario's voor deze functie:

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/gWPhQyB66DQ" title="AdvantageScope XR: Feature Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Vereisten {#requirements}

- **Host:** De AdvantageScope-desktopapplicatie op Windows, macOS of Linux (v4.1.0 of nieuwer). Eventuele firewalls op het apparaat moeten worden [uitgeschakeld](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/windows-firewall-configuration.html#disabling-windows-firewall).
- **Client:** Een iPhone of iPad met iOS/iPadOS 16 of nieuwer. Er is geen app-installatie vereist.
- **Netwerk:** Beide apparaten moeten zijn verbonden met hetzelfde netwerk (wifi, USB-tethering, enz.). Behoudens de onderstaande vereiste hoeft dit netwerk niet met internet te zijn verbonden.
- **Internet:** Als AdvantageScope XR recentelijk niet is gebruikt, moet het mobiele apparaat een internetverbinding hebben (bijv. mobiele data). Om deze vereiste te omzeilen, raadpleeg je het gedeelte over [offline gebruik](#offline-usage) hieronder.

:::tip
AdvantageScope XR wordt ondersteund op veel iPhone- en iPad-modellen, maar is stabieler voor apparaten met een **LiDAR-sensor**. Dit omvat de iPhone Pro (vanaf de iPhone 12 Pro) en de iPad Pro (voorjaar 2020 of nieuwer).
:::

<details>
<summary>Hoe zit het met andere platforms?</summary>

AdvantageScope XR wordt alleen ondersteund op iOS en iPadOS. Er zijn momenteel geen plannen om alternatieve platforms te ondersteunen. De clientapplicatie vereist een nauwe integratie met native API's voor augmented reality, video-opname, web-rendering en meer. iOS en iPadOS krijgen om verschillende redenen prioriteit voor ontwikkeling en ondersteuning:

- **Consistentie:** AdvantageScope XR is een veeleisende applicatie. Terwijl Android-apparaten sterk variëren in rekenkracht en functies, bieden de iPhone en iPad een consistente ontwikkelervaring over verschillende generaties. Alle recente iOS- en iPadOS-apparaten zijn krachtig genoeg om AdvantageScope XR uit te voeren, en nieuwere apparaten ondersteunen extra functies die AdvantageScope kan benutten (zoals LiDAR).

- **Beschikbaarheid:** De iPhone blijft de meest voorkomende smartphone die studenten in de Verenigde Staten waarschijnlijk bezitten of gemakkelijk kunnen lenen van teamgenoten, en is breder beschikbaar dan welk model VR- of mixed reality-headset dan ook. Het ondersteunen van iOS maximaliseert het aantal gebruikers dat eenvoudig toegang heeft tot AdvantageScope XR.

- **Tablet-ondersteuning:** Gebruikers kunnen profiteren van het uitvoeren van AdvantageScope XR op een tablet, aangezien tablets een groter scherm bieden dat voor meerdere mensen tegelijk gemakkelijker te zien is. De iPad is wereldwijd de meest gebruikte tablet, dus door iPadOS te ondersteunen wordt de tabletervaring zo toegankelijk mogelijk gemaakt.

</details>

## Installatie {#setup}

1. Op het hostsysteem **klik je op de knop "XR"** op een willekeurig 3D-veldtabblad. Er kan slechts één XR-hostsessie tegelijk actief zijn, dus als je op deze knop klikt, worden andere actieve sessies onderbroken.

<img src="/img/tab-reference/3d-field/xr-1.webp" alt="XR-knop" height="450" />

_De Engelstalige interface wordt hierboven weergegeven._

2. Het **XR-bedieningsvenster** wordt geopend, met een QR-code en [opties](#options) om de AR-ervaring aan te passen. Om de XR-sessie te annuleren en eventuele clients te ontkoppelen, sluit je het bedieningsvenster.

<img src="/img/tab-reference/3d-field/xr-2.webp" alt="XR-venster" height="350" />

_De Engelstalige interface wordt hierboven weergegeven._

3. Scan de QR-code met de **ingebouwde Camera-app** op het client-apparaat. Er is geen app-installatie vereist.
4. Tik op "AdvantageScope XR" en vervolgens op "Open" om **de ervaring te starten** en verbinding te maken met de host. Geef AdvantageScope XR, indien gevraagd, toegang tot de **camera en het lokale netwerk**.
5. Volg de instructies op het apparaat om **het veldmodel te kalibreren en te positioneren**.
6. Bedien het veldmodel zoals gewoonlijk via het host-apparaat, inclusief **het afspelen van logbestanden en live streaming**. De toestand van het veldmodel wordt live weergegeven op het client-apparaat.
7. Om snel **een video op te nemen**, tik je op het pictogram "Record" bovenaan het scherm. Tik er nogmaals op om de opname te stoppen en bewerk en bewaar de clip vervolgens.

:::warning
Heatmaps en swerve-modulesnelheden zijn nog niet beschikbaar in XR. Alle andere objecttypen worden ondersteund.
:::

:::tip
AdvantageScope XR is een veeleisende applicatie en kan prestatieproblemen vertonen, afhankelijk van de complexiteit van de 3D-scène. Overweeg indien nodig eenvoudigere robotmodellen of minder objecten te gebruiken.
:::

## Opties {#options}

Het XR-bedieningsvenster biedt verschillende opties waarmee kan worden geregeld hoe het model wordt weergegeven in augmented reality:

- **Kalibratie:**
  - Kies _Miniatuur_ om een verkleinde versie van het veld te visualiseren, geschikt voor gebruik op een tafel.
  - Kies _Ware grootte_ om het veld met een nauwkeurige schaal te visualiseren, gepositioneerd op basis van een echte veldbarrière. Schakelen tussen _Blauwe alliantie_ en _Rode alliantie_ bepaalt welke kant van het veld wordt gebruikt voor kalibratie, maar in alle gevallen wordt het volledige veld gevisualiseerd.
- **Streamen:**
  - Kies _Vloeiend_ voor toepassingen waarbij enige latentie acceptabel is in ruil voor betrouwbaardere streaming, zoals het simuleren van autonome routines of het afspelen van logbestanden.
  - Kies _Lage latentie_ voor realtime toepassingen waarbij enige jitter acceptabel is, zoals het projecteren van data op een echte robot of het besturen van een gesimuleerde robot in teleop.
- **Vloer tonen:** Geef het vlakke tapijt-/tegelmodel onder het veld weer in plaats van het over een echt oppervlak te projecteren.
- **Veld tonen:** Geef het veldmodel weer, inclusief de veldbarrière en spelspecifieke elementen. Aangepaste [speelstukobjecten](/tab-reference/3d-field#game-piece-objects) worden altijd weergegeven.
- **Robots tonen:** Geef de robotmodellen weer; kan worden uitgeschakeld bij het projecteren van data op een echte robot (zoals vision-targets of 2D-mechanismen).

## Offline gebruik {#offline-usage}

AdvantageScope XR vereist geen internetverbinding. Om ervoor te zorgen dat de app offline beschikbaar is, download je AdvantageScope XR uit de App Store via de onderstaande link. Om verbinding te maken met de AdvantageScope-desktopapplicatie scan je de QR-code met de iOS Camera-app of tik je op de knop "Scan" in de AdvantageScope XR-app.

[<img src="/img/tab-reference/3d-field/app-store.svg" alt="App Store" />](https://apps.apple.com/us/app/advantagescope-xr/id6739718081)

:::note
Zelfs wanneer de app zonder internetverbinding wordt uitgevoerd, **moeten de host- en client-apparaten verbonden zijn met hetzelfde netwerk** (zoals een robot, een eigen wifinetwerk of via USB-tethering).
:::
