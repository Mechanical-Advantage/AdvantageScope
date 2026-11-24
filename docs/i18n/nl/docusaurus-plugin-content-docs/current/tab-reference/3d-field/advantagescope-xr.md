# AdvantageScope XR {#advantagescope-xr}

AdvantageScope XR brengt het 👀 [3D-veld](/tab-reference/3d-field) tot leven in augmented reality, zodat je data op een heel nieuwe manier kunt bekijken. Bekijk een gesimuleerde autonome routine op ware grootte, bespreek de wedstrijdstrategie rond een tafelmodel van het veld, projecteer diagnostische gegevens direct over je echte robot heen en nog veel meer! In de video hieronder zie je een aantal voorbeelden van wat je ermee kunt:

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/gWPhQyB66DQ" title="AdvantageScope XR: Feature Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Vereisten {#requirements}

- **Host:** De desktopversie van AdvantageScope op Windows, macOS of Linux (v4.1.0 of nieuwer). Eventuele firewalls op het apparaat moet je [uitschakelen](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/windows-firewall-configuration.html#disabling-windows-firewall).
- **Client:** Een iPhone of iPad met iOS/iPadOS 16 of nieuwer. Je hoeft geen app te installeren.
- **Netwerk:** Beide apparaten moeten op hetzelfde netwerk zitten (wifi, USB-tethering, enz.). Behalve voor de voorwaarde hieronder hoeft dit netwerk geen internetverbinding te hebben.
- **Internet:** Heb je AdvantageScope XR al een tijdje niet gebruikt, dan heeft het mobiele apparaat even internet nodig (bijvoorbeeld via mobiele data). Wil je dat vermijden? Lees dan het stukje over [offline gebruik](#offline-usage) hieronder.

:::tip
AdvantageScope XR werkt op veel iPhone- en iPad-modellen, maar draait het stabielst op apparaten met een **LiDAR-sensor**. Dat zijn de iPhone Pro (vanaf de iPhone 12 Pro) en de iPad Pro (voorjaar 2020 of nieuwer).
:::

<details>
<summary>Hoe zit het met andere platforms?</summary>

AdvantageScope XR werkt alleen op iOS en iPadOS en er zijn op korte termijn geen plannen voor andere platforms. De client moet namelijk nauw samenwerken met ingebouwde functies voor augmented reality, video-opname, webrendering en meer. iOS en iPadOS krijgen om een paar redenen voorrang:

- **Consistentie:** AdvantageScope XR vraagt veel van een apparaat. Android-telefoons verschillen enorm in rekenkracht en mogelijkheden, terwijl iPhones en iPads generatie na generatie heel voorspelbaar presteren. Alle recente iOS- en iPadOS-apparaten zijn snel genoeg voor AdvantageScope XR, en nieuwere modellen bieden extra hardware zoals LiDAR die de app goed kan gebruiken.

- **Beschikbaarheid:** De iPhone is in de VS nog steeds de meest gebruikte smartphone onder scholieren en studenten, en is veel makkelijker te regelen dan een VR- of mixed-reality-headset. Door voor iOS te kiezen kunnen zo veel mogelijk teams meteen met AdvantageScope XR aan de slag.

- **Tabletondersteuning:** Op een tablet komt AdvantageScope XR extra goed tot zijn recht, omdat je op een groter scherm makkelijk met meerdere mensen tegelijk meekijkt. De iPad is wereldwijd de populairste tablet, dus ondersteuning voor iPadOS maakt die ervaring zo toegankelijk mogelijk.

</details>

## Installatie {#setup}

1. Klik op de hostcomputer op de knop **"XR"** in een 3D-veldtabblad. Er kan maar één XR-sessie tegelijk draaien; klik je hierop, dan worden andere actieve sessies gestopt.

<img src="/img/tab-reference/3d-field/xr-1.webp" alt="XR-knop" height="450" />

_De Engelstalige interface wordt hierboven weergegeven._

2. Het venster **XR-bediening** opent met een QR-code en [opties](#options) om de AR-weergave aan te passen. Sluit dit venster als je de XR-sessie wilt stoppen en alle verbonden apparaten wilt loskoppelen.

<img src="/img/tab-reference/3d-field/xr-2.webp" alt="XR-venster" height="350" />

_De Engelstalige interface wordt hierboven weergegeven._

3. Scan de QR-code met de **standaard Camera-app** op je iPhone of iPad. Je hoeft geen aparte app te installeren.
4. Tik op "AdvantageScope XR" en daarna op "Open" om **de weergave te starten** en verbinding te maken met de host. Geef AdvantageScope XR toestemming voor **de camera en het lokale netwerk** als daarom wordt gevraagd.
5. Volg de instructies op je scherm om **het veldmodel te kalibreren en op zijn plek te zetten**.
6. Bedien het veldmodel gewoon vanaf de hostcomputer, zowel bij **het afspelen van logs als bij live streaming**. Alles wat je doet, zie je direct op het mobiele apparaat.
7. Wil je snel **een video opnemen**? Tik dan op het opnamepictogram boven in het scherm. Tik er nog een keer op om de opname te stoppen; daarna kun je de clip bijsnijden en opslaan.

:::warning
Heatmaps en swerve-modulesnelheden zijn nog niet beschikbaar in XR. Alle andere objecttypen werken wel.
:::

:::tip
AdvantageScope XR is zwaar voor je hardware. Bij heel complexe 3D-scènes kunnen de prestaties teruglopen. Kies in dat geval een eenvoudiger robotmodel of zet wat objecten uit.
:::

## Opties {#options}

In het venster XR-bediening vind je verschillende opties voor de weergave in augmented reality:

- **Kalibratie:**
  - Kies _Miniatuur_ voor een verkleind veldmodel dat op een tafel past.
  - Kies _Ware grootte_ om het veld op echte schaal te tonen, uitgelijnd langs een echte veldbarrière. Met _Blauwe alliantie_ en _Rode alliantie_ kies je welke kant van het veld je gebruikt voor de kalibratie; je ziet daarna altijd het hele veld.
- **Streamen:**
  - Kies _Vloeiend_ als een kleine vertraging niet erg is in ruil voor een stabielere stream, bijvoorbeeld bij het simuleren van autonome routines of het terugkijken van logs.
  - Kies _Lage latentie_ voor realtime toepassingen waarbij een beetje schokkerigheid niet erg is, zoals data over een echte robot heen projecteren of een gesimuleerde robot besturen in teleop.
- **Vloer tonen:** Toont het vlakke tapijt- of tegelmodel onder het veld in plaats van de echte vloer erdoorheen te laten zien.
- **Veld tonen:** Toont het veldmodel, inclusief de veldbarrière en spelspecifieke elementen. Aangepaste [speelstukobjecten](/tab-reference/3d-field#game-piece-objects) blijven altijd zichtbaar.
- **Robots tonen:** Toont de robotmodellen. Dit kun je uitzetten als je data (zoals vision-targets of 2D-mechanismen) over een echte robot heen projecteert.

## Offline gebruik {#offline-usage}

AdvantageScope XR heeft geen internetverbinding nodig. Wil je zeker weten dat de app altijd offline beschikbaar is, download AdvantageScope XR dan vooraf uit de App Store via de link hieronder. Om verbinding te maken met de desktopapp van AdvantageScope scan je de QR-code met de Camera-app van iOS, of tik je op de knop "Scan" in de AdvantageScope XR-app.

[<img src="/img/tab-reference/3d-field/app-store.svg" alt="App Store" />](https://apps.apple.com/us/app/advantagescope-xr/id6739718081)

:::note
Ook zonder internetverbinding **moeten de host en het mobiele apparaat op hetzelfde netwerk zitten** (bijvoorbeeld dat van de robot, een eigen wifinetwerk of via USB-tethering).
:::
