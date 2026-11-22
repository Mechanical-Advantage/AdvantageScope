---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 2D-veld {#2d-field}

Op het tabblad **2D-veld** zie je een bovenaanzicht van het veld met daarop de positie van je robot. Daarnaast kun je er extra gegevens op tonen, zoals vision-targets en referentieposes.

<img src="/img/tab-reference/2d-field-1.webp" alt="Overzicht van tabblad 2D-veld" />

_De Engelstalige interface wordt hierboven weergegeven._

<details>
<summary>Tijdlijnbesturing</summary>

Met de tijdlijn bestuur je het afspelen en de weergave van je logdata. Klik op de tijdlijn om een tijdstip te kiezen, en klik met de rechtermuisknop om de selectie weer op te heffen. Het gekozen tijdstip wordt op alle tabbladen tegelijk bijgewerkt, zodat je precies datzelfde moment makkelijk in andere weergaven terugvindt.

De kleuren geven de status van de robot aan: geel is autonoom, blauw is teleop en grijs is de utility-modus.

Om in of uit te zoomen, houd je de muisaanwijzer boven de tijdlijn en scrol je omhoog of omlaag. Je kunt ook een specifiek tijdsbereik kiezen door `Shift` ingedrukt te houden terwijl je klikt en sleept. Naar links en rechts bewegen doe je door horizontaal te scrollen (als je apparaat dat ondersteunt) of door op de tijdlijn te klikken en te slepen. Bij een live-verbinding koppel je de tijdlijn los van de huidige tijd door naar links te scrollen; scrol je helemaal naar rechts, dan springt hij weer mee met realtime. Druk op `Ctrl+\` om direct in te zoomen op de periode waarin de robot ingeschakeld was.

<img src="/img/tab-reference/timeline.webp" alt="Tijdlijn" />

</details>

## Camerabediening {#camera-controls}

Scrol omhoog of omlaag boven het veld om in en uit te zoomen. Klik en sleep om het veld te verschuiven (pannen). Klik met de rechtermuisknop ergens op het veld om het cameramenu te openen met deze opties:

- **Ontgrendeld**: Je verschuift de camera en zoomt handmatig.
- **Vergrendeld op robot**: De camera beweegt automatisch mee om de robot te volgen.
- **Vergrendeld op robot en rotatie**: De camera beweegt én draait automatisch mee met de robot en zijn oriëntatie.

Ook in de vergrendelde modi kun je de camera vrij van de robot wegslepen. Met de oriëntatieknoppen in het bedieningspaneel draai je de camera in elke modus.

## Objecten toevoegen {#adding-objects}

Sleep een veld naar de sectie "Poses" om te beginnen. Met de X-knop verwijder je een object, en met het oogpictogram (of door te dubbelklikken op de veldnaam) verberg je het tijdelijk. Wil je alles in één keer weghalen? Klik dan op de prullenbak naast de titel en kies `Alles wissen`. Je kunt de volgorde in de lijst aanpassen door de objecten te verslepen.

**Klik op het gekleurde pictogram of klik met de rechtermuisknop op een veldnaam om het object aan te passen.** AdvantageScope ondersteunt allerlei objecttypen die je naar wens kunt instellen (zoals een andere kleur). Sommige objecten moet je als subobject aan een bestaand object toevoegen.

:::tip
Klik op het `?`-pictogram voor een volledig overzicht van alle ondersteunde objecttypen. Daar zie je ook welke datatypen bij elk type horen en welke objecten je als subobject moet toevoegen.
:::

<img src="/img/tab-reference/2d-field-2.webp" alt="2D-veld met objecten" />

## Dataformaat {#data-format}

Geometriedata publiceer je als een byte-gecodeerde struct of protobuf. Allerlei 2D- en 3D-geometrietypen worden ondersteund, zoals `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` en meer.

Veel bibliotheken ondersteunen het struct-formaat, waaronder WPILib en AdvantageKit. De voorbeeldcode hieronder laat zien hoe je 2D-posedata logt.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::math::Pose2d poseA;
wpi::math::Pose2d poseB;

wpi::telemetry::Log("MyPose", poseA);
wpi::telemetry::Log("MyPoseArray", std::vector{poseA, poseB});
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
from wpimath import Pose2d
import telemetry

pose_a = Pose2d()
pose_b = Pose2d()

telemetry.log("MyPose", pose_a)
telemetry.log("MyPoseArray", [pose_a, pose_b], element_type=Pose2d)
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose2d[] {poseA, poseB});
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

// Voeg hier andere telemetriewaarden toe...

FtcDashboard.getInstance().sendTelemetryPacket(packet)

// Gebruik anders MultipleTelemetry en de standaard SDK-telemetrie:
// Tijdens OpMode Init:
telemetry = new MultipleTelemetry(telemetry,FtcDashboard.getInstance().getTelemetry());

// Tijdens Loop:
telemetry.addData("Pose x", 6.3); // Inches
telemetry.addData("Pose y", 2.8); // Inches
telemetry.addData("Pose heading", 3.14); // Radialen

// of...
telemetry.addData("Pose heading (deg)", 180.0); // Graden

// Voeg hier andere telemetriewaarden toe...
telemetry.update();
```

</TabItem>
</Tabs>

## Configuratie {#configuration}

- **Veld:** De veldafbeelding die je wilt gebruiken. Alle recente FRC- en FTC-spellen worden ondersteund. Wil je een eigen veldafbeelding toevoegen? Kijk dan bij [Aangepaste assets](/more-features/custom-assets).
- **Oriëntatie:** Hoe de veldafbeelding in het weergavepaneel is gedraaid.
- **Grootte:** De zijlengte van de robot (30, 27 of 24 inch voor FRC; 18, 16 of 14 inch voor FTC).

:::info
Je kunt het coördinatenstelsel op dit tabblad zelf instellen. Op de pagina [Coördinatenstelsels](/more-features/coordinate-systems) lees je hoe dat werkt.
:::
