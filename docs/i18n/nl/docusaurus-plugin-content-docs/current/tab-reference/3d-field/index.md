import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 👀 3D-veld {#3d-field}

Op het tabblad **3D-veld** zie je een 3D-weergave van de robot en het veld. Je kunt er gewone 2D-poses in bekijken, maar het is vooral handig voor 3D-berekeningen (zoals lokalisatie met AprilTags). Je kiest uit verschillende camerastandpunten: veldrelatief, robotrelatief of vast. Met [AdvantageScope XR](advantagescope-xr) bekijk je dit tabblad zelfs in augmented reality. De tijdlijn laat zien wanneer de robot ingeschakeld is en helpt je om door de logdata te navigeren.

<img src="/img/tab-reference/3d-field/3d-field-1.webp" alt="Voorbeeld van tabblad 3D-veld" />

_De Engelstalige interface wordt hierboven weergegeven._

<details>
<summary>Tijdlijnbesturing</summary>

Met de tijdlijn bestuur je het afspelen en de weergave van je logdata. Klik op de tijdlijn om een tijdstip te kiezen, en klik met de rechtermuisknop om de selectie weer op te heffen. Het gekozen tijdstip wordt op alle tabbladen tegelijk bijgewerkt, zodat je precies datzelfde moment makkelijk in andere weergaven terugvindt.

De kleuren geven de status van de robot aan: geel is autonoom, blauw is teleop en grijs is de utility-modus.

Om in of uit te zoomen, houd je de muisaanwijzer boven de tijdlijn en scrol je omhoog of omlaag. Je kunt ook een specifiek tijdsbereik kiezen door `Shift` ingedrukt te houden terwijl je klikt en sleept. Naar links en rechts bewegen doe je door horizontaal te scrollen (als je apparaat dat ondersteunt) of door op de tijdlijn te klikken en te slepen. Bij een live-verbinding koppel je de tijdlijn los van de huidige tijd door naar links te scrollen; scrol je helemaal naar rechts, dan springt hij weer mee met realtime. Druk op `Ctrl+\` om direct in te zoomen op de periode waarin de robot ingeschakeld was.

<img src="/img/tab-reference/timeline.webp" alt="Tijdlijn" />

</details>

:::warning FTC 2026-2027-veld
Het FTC-veldmodel voor 2026-2027 heeft geen ingebouwde AprilTags, omdat de tags op de hive tijdens de wedstrijd van plek kunnen veranderen. Teams kunnen een `Pose3d[]` en `number[]` publiceren om dynamische AprilTag-objecten aan het veld toe te voegen. De juiste grootte voor AprilTags op dit veld is **3,25 inch**.
:::

:::warning FRC 2026-veld
Het FRC-veldmodel voor 2026 volgt de AprilTag-indeling van het **gelaste** (*welded*) veld. De verschillen tussen het gelaste veld en het AndyMark-veld zijn heel klein, maar er kan een lichte afwijking (~0,5 inch) optreden als je AprilTag-poses bekijkt die op de AndyMark-indeling zijn gebaseerd.
:::

## Objecten toevoegen {#adding-objects}

Sleep een veld naar de sectie "Poses" om te beginnen. Met de X-knop verwijder je een object, en met het oogpictogram (of door te dubbelklikken op de veldnaam) verberg je het tijdelijk. Wil je alles in één keer weghalen? Klik dan op de prullenbak naast de titel en kies `Alles wissen`. Je kunt de volgorde in de lijst aanpassen door de objecten te verslepen.

**Klik op het gekleurde pictogram of klik met de rechtermuisknop op een veldnaam om het object aan te passen.** AdvantageScope ondersteunt allerlei objecttypen die je naar wens kunt instellen (zoals een andere kleur of een ander robotmodel). Sommige objecten moet je als subobject aan een bestaand object toevoegen.

:::tip
Klik op het `?`-pictogram voor een volledig overzicht van alle ondersteunde objecttypen. Daar zie je ook welke datatypen bij elk type horen en welke objecten je als subobject moet toevoegen.
:::

:::info
AdvantageScope ondersteunt verschillende formaten AprilTags voor FTC-velden. De maat is de **zijlengte van het zwarte gedeelte van de AprilTag**, zonder de verplichte witte rand.
:::

## Dataformaat {#data-format}

Geometriedata publiceer je als een byte-gecodeerde struct of protobuf. Allerlei 2D- en 3D-geometrietypen worden ondersteund, zoals `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` en meer.

Veel bibliotheken ondersteunen het struct-formaat, waaronder WPILib en AdvantageKit. De voorbeeldcode hieronder laat zien hoe je 3D-posedata logt in Java.

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
// Dit protocol ondersteunt het moderne struct-formaat niet, maar je kunt
// posewaarden wel publiceren via losse velden met de achtervoegsels
// "x", "y" en "heading" (zoals hieronder):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // Inches
packet.put("Pose y", 2.8); // Inches
packet.put("Pose heading", 3.14); // Radialen

// Of publiceer de heading in graden:
packet.put("Pose heading (deg)", 180.0); // Graden
```

</TabItem>
</Tabs>

## Mechanismen en componenten {#mechanisms-and-components}

Mechanismedata kun je op twee manieren bekijken: als 2D-mechanisme of met scharnierende 3D-componenten.

### 2D-mechanismen {#2d-mechanisms}

Wil je data uit een [`Mechanism2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html) zichtbaar maken, voeg dan het mechanismeveld toe aan een bestaand robot- of ghost-object. Het mechanisme wordt met eenvoudige balken op het XZ- of YZ-vlak van de robot geprojecteerd, zoals hieronder. Klik op het tandwielpictogram of klik met de rechtermuisknop op de veldnaam om te wisselen tussen het XZ- en YZ-vlak. De oorsprong van de robot ligt precies in het midden van de onderrand van het mechanisme.

<img src="/img/tab-reference/3d-field/3d-field-2.webp" alt="2D-mechanisme" />

### 3D-componenten {#3d-components}

:::warning
Het opzetten van 3D-componenten kan best ingewikkeld zijn en veel tijd kosten. Kijk daarom eerst of de [`Mechanism2d`-ondersteuning](/tab-reference/3d-field#2d-mechanisms) hierboven genoeg voor je is; daarmee zet je mechanismen veel sneller in het 3D-veld.
:::

Je kunt mechanismen ook met scharnierende componenten tonen door een reeks 3D-poses te loggen voor de robotrelatieve posities van elk onderdeel. Voeg die poses toe aan een bestaand robot- of ghost-object en kies "Component" als objecttype.

Elk onderdeel (zoals een liftslede, arm of grijper) beweegt dan los van de rest. Gebruik je AdvantageKit? Kijk dan eens naar de methode [`generate3dMechanism()`](https://docs.advantagekit.org/data-flow/supported-types#mechanisms-output-only) om een `Mechanism2d` om te zetten naar een array van `Pose3d`-objecten. Meer informatie over het instellen van robots met componenten vind je bij [Aangepaste assets](/more-features/custom-assets).

<img src="/img/tab-reference/3d-field/3d-field-3.webp" alt="3D-mechanisme" />

## Speelstukobjecten {#game-piece-objects}

Elk veld heeft eigen objecttypen voor speelstukken, zodat je op basis van je robotcode op elke plek op het veld speelstukken kunt laten zien. Dat komt op allerlei manieren van pas:

- De acties van gesimuleerde autonome routines laten zien met simpele animaties
- De gedetecteerde posities van speelstukken op het veld tonen
- Laten zien waar een speelstuk zich in de robot bevindt
- Schiettrajecten bekijken op basis van natuurkundige berekeningen

Je kunt ook heel simpel op basis van sensordata laten zien of er een speelstuk in de robot zit. Een lichtsluis (*beam break sensor*) in het pad van een note bij een 2024-robot kan bijvoorbeeld een note laten verschijnen (zoals hieronder).

<details>
<summary>Codevoorbeeld</summary>

Het AdvantageKit KitBot 2024-voorbeeldproject bevat een simpel voorbeeld van een [commando](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/util/NoteVisualizer.java) dat een note van de robot naar de speaker animeert. Dit commando zit in de standaard [lanceervolgorde](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/subsystems/launcher/Launcher.java#L73) en start de animatie zodra een note wordt afgevuurd. In [deze video](https://youtube.com/shorts/-HxfDo9f19U?feature=share) zie je hoe je met speelstukanimaties autonome routines voor verschillende spellen in beeld brengt.

</details>

<img src="/img/tab-reference/3d-field/3d-field-4.webp" alt="2024 KitBot note-visualisatie" />

## Camera-opties {#camera-options}

Klik met de rechtermuisknop op het 3D-veld om van cameramodus te wisselen. Elk pop-outvenster heeft zijn eigen cameramodus en -positie, zodat je makkelijk meerdere camerastandpunten tegelijk kunt openen.

:::info
Klik met de rechtermuisknop op het 3D-veld en kies "FOV instellen" om het gezichtsveld (FOV) van de draaiende camera's en de Driver Station-camera aan te passen.
:::

### Rond veld draaien {#orbit-field}

Dit is de standaardmodus, waarin je de camera vrij rondom het veld beweegt. **Linkermuisknop + slepen** draait de camera en **rechtermuisknop + slepen** verschuift de camera (pannen). **Scrol** om in en uit te zoomen.

:::tip
Je kunt de camera ook met het toetsenbord besturen: **WASD** om te verplaatsen, **IJKL** om te draaien en **E** en **Q** om omhoog en omlaag te gaan.
:::

### Rond robot draaien {#orbit-robot}

Deze modus werkt precies zo als "Rond veld draaien", alleen beweegt de camera nu met de robot mee. Zo krijg je mooie volgshots van hoe de robot over het veld rijdt.

### Driver Station {#driver-station}

In deze modus staat de camera achter een van de driver stations op ooghoogte. Kies handmatig een station of selecteer "Auto" om automatisch de alliantie en het stationsnummer uit je logdata te gebruiken.

:::warning
Automatisch het stationsnummer kiezen kan onnauwkeurig zijn bij logs die zijn gemaakt met AdvantageKit 2023 of ouder.
:::

### Vaste camera {#fixed-camera}

Elk robotmodel heeft een aantal vaste camera's, zoals vision- en bestuurderscamera's, met een vaste positie, beeldverhouding en FOV. Daarmee controleer je makkelijk je vision-data of simuleer je wat de bestuurder ziet. Hieronder zie je een voorbeeld van een bestuurderscamera.

<img src="/img/tab-reference/3d-field/3d-field-5.webp" alt="Vaste camera" />

Als je een pose voor "Camera-override" opgeeft, vervangt die de standaardpositie van alle vaste camera's, terwijl hun ingestelde FOV en beeldverhouding gelijk blijven. Zo kan je robotcode de positie van een bewegende camera doorgeven, bijvoorbeeld op een koepel (*turret*) of een verstelbare shooterkap.

:::info
Net als andere posedata moet de pose voor "Camera-override" _veldrelatief_ zijn, en dus niet robotrelatief.
:::

## Configuratie {#configuration}

Via het keuzemenu kies je het veldmodel. Alle recente FRC- en FTC-spellen staan erin. Heeft je laptop beperkte grafische kracht? Gebruik dan de "Evergreen"-velden. De "Assen"-velden tonen alleen de XYZ-assen bij de oorsprong met een omtrek van het veld voor de schaal.

:::info
Je kunt het coördinatenstelsel op dit tabblad zelf instellen. Op de pagina [Coördinatenstelsels](/more-features/coordinate-systems) lees je hoe dat werkt.
:::

### Weergavemodi {#rendering-modes}

Het 3D-veld heeft drie weergavemodi:

- **Filmisch (links):** Renderen met schaduwen, belichting, reflecties en gedetailleerde 3D-modellen voor een realistisch beeld. Hiervoor heb je een redelijk krachtige GPU nodig.
- **Normaal (midden):** De standaardmodus met minimale belichting en eenvoudigere 3D-modellen. Draait soepel op de meeste laptops.
- **Energiezuinig (rechts):** Verlaagt de framerate, resolutie en modeldetails om batterij te sparen en op minder snelle apparaten stabiel te blijven draaien.

<img src="/img/tab-reference/3d-field/3d-field-6.webp" alt="Vergelijking van weergavemodi" />

Om de weergavemodus te kiezen, open je de voorkeuren via `App` > `Voorkeuren tonen...` (Windows/Linux) of `AdvantageScope` > `Instellingen...` (macOS). Met de instelling "3D-modus (batterij)" kun je automatisch een andere modus gebruiken zodra je laptop op de accu draait. Ideaal om tijdens een wedstrijd batterij te sparen.

<img src="/img/prefs_nl.webp" alt="Diagram van voorkeuren" height="450" />
