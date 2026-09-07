import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 👀 3D-veld {#3d-field}

Het 3D-veld toont een 3D-visualisatie van de robot en het veld. Het kan worden gebruikt met gewone 2D-poses, maar is vooral nuttig bij het werken met 3D-berekeningen (zoals lokalisatie met AprilTags). Er zijn meerdere cameraweergaven beschikbaar, waaronder veldrelatief, robotrelatief en vast. Met [AdvantageScope XR](advantagescope-xr) kan dit tabblad worden gevisualiseerd met augmented reality. De tijdlijn toont wanneer de robot is ingeschakeld en kan worden gebruikt om door de logdata te navigeren.

<img src="/img/tab-reference/3d-field/3d-field-1.webp" alt="Voorbeeld van tabblad 3D-veld" />

_De Engelstalige interface wordt hierboven weergegeven._

<details>
<summary>Tijdlijnbesturing</summary>

De tijdlijn wordt gebruikt om het afspelen en de visualisatie te regelen. Als je op de tijdlijn klikt, selecteer je een tijdstip, en als je met de rechtermuisknop klikt, deselecteer je dit weer. Het geselecteerde tijdstip wordt gesynchroniseerd over alle tabbladen, waardoor het eenvoudig is om deze positie snel terug te vinden in andere weergaven.

Gele gedeelten geven aan wanneer de robot autonoom is, blauwe gedeelten geven aan wanneer de robot tele-operated is en grijze gedeelten geven aan wanneer de robot in de utility-modus staat.

Om te zoomen, plaats je de cursor op de tijdlijn en scrol je omhoog of omlaag. Er kan ook een bereik worden geselecteerd door te klikken en te slepen terwijl je `Shift` ingedrukt houdt. Beweeg naar links en rechts door horizontaal te scrollen (op ondersteunde apparaten), of door op de tijdlijn te klikken en te slepen. Wanneer er live verbinding is, ontgrendelt naar links scrollen van de huidige tijd, en helemaal naar rechts scrollen vergrendelt weer op de huidige tijd. Druk op `Ctrl+\` om in te zoomen op de periode waarin de robot is ingeschakeld.

<img src="/img/tab-reference/timeline.webp" alt="Tijdlijn" />

</details>

:::warning
Het 2026 FRC-veldmodel komt overeen met de AprilTag-indeling voor het **gelaste** veld. De verschillen tussen de gelaste en AndyMark-velden zijn zeer klein, maar er kunnen kleine afwijkingen (~0,5 inch) optreden bij het visualiseren van AprilTag-poses op basis van de AndyMark-veldindeling.
:::

## Objecten toevoegen {#adding-objects}

Om te beginnen sleep je een veld naar de sectie "Poses". Verwijder een object met de X-knop, of verberg het tijdelijk door op het oogpictogram te klikken of te dubbelklikken op de veldnaam. Om alle objecten te verwijderen, klik je op de prullenbak naast de astitel en vervolgens op `Alles wissen`. Objecten kunnen in de lijst opnieuw worden gerangschikt door te klikken en te slepen.

**Om elk object aan te passen, klik je op het gekleurde pictogram of klik je met de rechtermuisknop op de veldnaam.** AdvantageScope ondersteunt een groot aantal objecttypen, waarvan er vele kunnen worden aangepast (zoals het wijzigen van kleuren en robotmodellen). Sommige objecten moeten als onderliggende elementen aan een bestaand object worden toegevoegd.

:::tip
Klik op het `?`-pictogram om een volledige lijst van ondersteunde objecttypen te zien. Deze lijst bevat ook de ondersteunde datatypen en geeft aan of de objecten als onderliggend element moeten worden toegevoegd.
:::

:::info
AdvantageScope ondersteunt verschillende formaten AprilTags voor FTC-velden. Formaten worden gemeten als de **zijlengte van het zwarte gedeelte van de AprilTag**, exclusief de vereiste witte rand.
:::

## Dataformaat {#data-format}

Geometriedata moet worden gepubliceerd als een byte-gecodeerde struct of protobuf. Verschillende 2D- en 3D-geometrietypen worden ondersteund, waaronder `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` en meer.

Veel bibliotheken ondersteunen het struct-formaat, waaronder WPILib en AdvantageKit. De onderstaande voorbeeldcode laat zien hoe je 3D-posedata logt in Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose3d[] {poseA, poseB});
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose3d[] {poseA, poseB});
```

</TabItem>
<TabItem value="ftcdashboard" label="FTC Dashboard">

```java
// Dit protocol ondersteunt het moderne struct-formaat niet, maar pose-
// waarden kunnen worden gepubliceerd met behulp van afzonderlijke velden
// die de achtervoegsels "x", "y" en "heading" bevatten (zoals hieronder weergegeven):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // Inches
packet.put("Pose y", 2.8); // Inches
packet.put("Pose heading", 3.14); // Radialen

// Als alternatief kunnen headings worden gepubliceerd in graden
packet.put("Pose heading (deg)", 180.0); // Graden
```

</TabItem>
</Tabs>

## Mechanismen en componenten {#mechanisms-and-components}

Mechanismedata kan worden gevisualiseerd met behulp van 2D-mechanismen of scharnierende 3D-componenten.

### 2D-mechanismen {#2d-mechanisms}

Om mechanismedata te visualiseren die is gelogd met behulp van een [`Mechanism2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html), voeg je het mechanismeveld toe aan een bestaand robot- of ghost-object. Het mechanisme wordt op het XZ- of YZ-vlak van de robot geprojecteerd met behulp van eenvoudige blokken, zoals hieronder weergegeven. Klik op het tandwielpictogram of klik met de rechtermuisknop op de veldnaam om te schakelen tussen de XZ- en YZ-vlakken. De oorsprong van de robot is gecentreerd op de onderrand van het mechanisme.

<img src="/img/tab-reference/3d-field/3d-field-2.webp" alt="2D-mechanisme" />

### 3D-componenten {#3d-components}

:::warning
Het opzetten van 3D-componenten kan complex en tijdrovend zijn. Overweeg AdvantageScope's `Mechanism2d`-ondersteuning te gebruiken zoals hierboven beschreven, die een meer gestroomlijnde aanpak biedt om mechanismen op het 3D-veld te visualiseren.
:::

Mechanismen kunnen worden gevisualiseerd met scharnierende componenten door een reeks 3D-poses te loggen die de robotrelatieve locaties van elk component vertegenwoordigen. Voeg de poses toe aan een bestaand robot- of ghost-object en stel het objecttype in op "Component".

Elk component kan onafhankelijk worden bewogen (zoals een liftslede, arm of eindeffector). AdvantageKit-gebruikers kunnen overwegen de methode [`generate3dMechanism()`](https://docs.advantagekit.org/data-flow/supported-types#mechanisms-output-only) te gebruiken om een Mechanism2d om te zetten in een array van Pose3d-objecten. Zie [Aangepaste assets](/more-features/custom-assets) voor meer informatie over het configureren van robots met componenten.

<img src="/img/tab-reference/3d-field/3d-field-3.webp" alt="3D-mechanisme" />

## Speelstukobjecten {#game-piece-objects}

Elk veld bevat een set objecttypen voor speelstukken, waardoor speelstukken op elke positie op het veld kunnen worden gerenderd met behulp van data die door de robotcode is gepubliceerd. Dit kent verschillende toepassingen, waaronder:

- Het visualiseren van de acties van gesimuleerde autonome routines met behulp van eenvoudige animaties
- Het tonen van de gedetecteerde locaties van speelstukken op het veld
- Aangeven waar speelstukken zich binnen een robot bevinden
- Het bekijken van schiettrajecten op basis van natuurkundige berekeningen

Een ander eenvoudig gebruiksscenario is het tonen van de status van speelstukken binnen de robot op basis van sensordata. Een lichtsluis-sensor (beam break sensor) in het pad van de note van een 2024-robot zou er bijvoorbeeld voor kunnen zorgen dat er een note verschijnt (zoals hieronder weergegeven).

<details>
<summary>Codevoorbeeld</summary>

Het AdvantageKit KitBot 2024-voorbeeldproject bevat een eenvoudig voorbeeld van een [commando](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/util/NoteVisualizer.java) dat een note animeert die van de robot naar de speaker beweegt. Dit commando is opgenomen in de standaard [lanceervolgorde](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/subsystems/launcher/Launcher.java#L73), waardoor de animatie wordt geactiveerd zodra er een note wordt losgelaten. [Deze video](https://youtube.com/shorts/-HxfDo9f19U?feature=share) laat zien hoe animaties van speelstukken kunnen worden gebruikt om autonome routines voor verschillende spellen te visualiseren.

</details>

<img src="/img/tab-reference/3d-field/3d-field-4.webp" alt="2024 KitBot note-visualisatie" />

## Camera-opties {#camera-options}

Klik met de rechtermuisknop op de gerenderde veldweergave om van cameramodus te wisselen. De cameramodus en -positie worden voor elk pop-upvenster onafhankelijk geregeld, waardoor eenvoudig weergaven met meerdere camera's kunnen worden gemaakt.

:::info
Klik met de rechtermuisknop op de gerenderde veldweergave en klik op "FOV instellen" om het gezichtsveld (FOV) van de draaiende en Driver Station-camera's aan te passen.
:::

### Rond veld draaien {#orbit-field}

Dit is de standaard cameramodus, waarbij de camera vrij kan worden bewogen ten opzichte van het veld. **Linkermuisknop + slepen** roteert de camera en **rechtermuisknop + slepen** pant de camera. **Scrol** om in en uit te zoomen.

:::tip
De camera kan ook worden bediend met het toetsenbord. De **WASD**-toetsen worden gebruikt om te verplaatsen, de **IJKL**-toetsen om te roteren, en de **E**- en **Q**-toetsen om verticaal te verplaatsen.
:::

### Rond robot draaien {#orbit-robot}

Deze modus heeft dezelfde bedieningselementen als de modus "Rond veld draaien", maar de positie van de camera is vergrendeld ten opzichte van de robot. Dit maakt volgopnamen ("tracking shots") van de beweging van de robot mogelijk.

### Driver Station {#driver-station}

Deze modus vergrendelt de camera achter een van de driver stations op typische ooghoogte. Kies handmatig het te bekijken station of kies "Auto" om de in de logdata opgeslagen alliantie en het stationsnummer te gebruiken.

:::warning
Automatische selectie van het stationsnummer kan onnauwkeurig zijn bij het bekijken van logdata die is gegenereerd door AdvantageKit 2023 of ouder.
:::

### Vaste camera {#fixed-camera}

Elk robotmodel is geconfigureerd met een set vaste camera's, zoals vision- en bestuurderscamera's. Deze camera's hebben vaste posities, beeldverhoudingen en FOV's. Deze weergaven zijn vaak nuttig om vision-data te controleren of om het beeld van een bestuurderscamera te simuleren. In het onderstaande voorbeeld wordt een bestuurderscamera getoond.

<img src="/img/tab-reference/3d-field/3d-field-5.webp" alt="Vaste camera" />

Als er een pose voor "Camera-override" wordt opgegeven, vervangt deze de standaardposes van alle vaste camera's, terwijl hun geconfigureerde FOV's en beeldverhoudingen behouden blijven. Hierdoor kan de robotcode de positie van een bewegende camera leveren, zoals een camera die op een koepel (turret) of shooter-kap is gemonteerd.

:::info
In overeenstemming met andere posedata moet de "Camera-override"-pose _veldrelatief_ zijn, en niet robotrelatief.
:::

## Configuratie {#configuration}

Het veldmodel kan worden geconfigureerd via het vervolgkeuzemenu. Alle recente FRC- en FTC-spellen worden ondersteund. We raden aan de "Evergreen"-velden te gebruiken voor apparaten met beperkte grafische prestaties. De "Assen"-velden tonen alleen XYZ-assen bij de oorsprong met een veldomtrek voor de schaal.

:::info
Het coördinatenstelsel dat op dit tabblad wordt gebruikt, kan worden aangepast. Zie de pagina [Coördinatenstelsels](/more-features/coordinate-systems) voor details.
:::

### Weergavemodi {#rendering-modes}

Het 3D-veld ondersteunt drie weergavemodi:

- **Filmisch (links):** Renderen met schaduwen, verlichting, reflecties en zeer gedetailleerde 3D-modellen voor een realistischer uiterlijk. Vereist een behoorlijk krachtige GPU.
- **Normaal (midden):** Standaard, renderen met minimale verlichting en vereenvoudigde 3D-modellen. Draait goed op de meeste apparaten.
- **Energiezuinig (rechts):** Verlaag de framesnelheid, resolutie en modeldetails om het batterijverbruik te verminderen en consistentere prestaties te leveren op minder krachtige apparaten.

<img src="/img/tab-reference/3d-field/3d-field-6.webp" alt="Vergelijking van weergavemodi" />

Om de weergavemodus te configureren, open je het voorkeurenvenster door te klikken op `App` > `Voorkeuren tonen...` (Windows/Linux) of `AdvantageScope` > `Instellingen...` (macOS). De instelling "3D-modus (batterij)" kan worden gewijzigd ten opzichte van de standaardinstelling om de weergavemodus te overschrijven die op een laptop wordt gebruikt wanneer deze niet oplaadt. Dit kan bijvoorbeeld worden gebruikt om batterij te sparen tijdens wedstrijden.

<img src="/img/prefs_nl.webp" alt="Diagram van voorkeuren" height="450" />
