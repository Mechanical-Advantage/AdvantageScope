---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 2D-veld {#2d-field}

Het tabblad 2D-veld toont een 2D-visualisatie van de robot over een kaart van het veld heen. Het kan ook extra data tonen zoals de status van vision-targeting en referentieposes.

<img src="/img/tab-reference/2d-field-1.webp" alt="Overzicht van tabblad 2D-veld" />

_De Engelstalige interface wordt hierboven weergegeven._

<details>
<summary>Tijdlijnbesturing</summary>

De tijdlijn wordt gebruikt om het afspelen en de visualisatie te regelen. Als je op de tijdlijn klikt, selecteer je een tijdstip, en als je met de rechtermuisknop klikt, deselecteer je dit weer. Het geselecteerde tijdstip wordt gesynchroniseerd over alle tabbladen, waardoor het eenvoudig is om deze positie snel terug te vinden in andere weergaven.

Gele gedeelten geven aan wanneer de robot autonoom is, blauwe gedeelten geven aan wanneer de robot tele-operated is en grijze gedeelten geven aan wanneer de robot in de utility-modus staat.

Om te zoomen, plaats je de cursor op de tijdlijn en scrol je omhoog of omlaag. Er kan ook een bereik worden geselecteerd door te klikken en te slepen terwijl je `Shift` ingedrukt houdt. Beweeg naar links en rechts door horizontaal te scrollen (op ondersteunde apparaten), of door op de tijdlijn te klikken en te slepen. Wanneer er live verbinding is, ontgrendelt naar links scrollen van de huidige tijd, en helemaal naar rechts scrollen vergrendelt weer op de huidige tijd. Druk op `Ctrl+\` om in te zoomen op de periode waarin de robot is ingeschakeld.

<img src="/img/tab-reference/timeline.webp" alt="Tijdlijn" />

</details>

## Objecten toevoegen {#adding-objects}

Om te beginnen sleep je een veld naar de sectie "Poses". Verwijder een object met de X-knop, of verberg het tijdelijk door op het oogpictogram te klikken of te dubbelklikken op de veldnaam. Om alle objecten te verwijderen, klik je op de prullenbak naast de astitel en vervolgens op `Alles wissen`. Objecten kunnen in de lijst opnieuw worden gerangschikt door te klikken en te slepen.

**Om elk object aan te passen, klik je op het gekleurde pictogram of klik je met de rechtermuisknop op de veldnaam.** AdvantageScope ondersteunt een groot aantal objecttypen, waarvan er vele kunnen worden aangepast (zoals het wijzigen van kleuren). Sommige objecten moeten als onderliggende elementen aan een bestaand object worden toegevoegd.

:::tip
Klik op het `?`-pictogram om een volledige lijst van ondersteunde objecttypen te zien. Deze lijst bevat ook de ondersteunde datatypen en geeft aan of de objecten als onderliggend element moeten worden toegevoegd.
:::

<img src="/img/tab-reference/2d-field-2.webp" alt="2D-veld met objecten" />

## Dataformaat {#data-format}

Geometriedata moet worden gepubliceerd als een byte-gecodeerde struct of protobuf. Verschillende 2D- en 3D-geometrietypen worden ondersteund, waaronder `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` en meer.

Veel bibliotheken ondersteunen het struct-formaat, waaronder WPILib en AdvantageKit. De onderstaande voorbeeldcode laat zien hoe je 2D-posedata logt in Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

StructPublisher<Pose2d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose2d.struct).publish();
StructArrayPublisher<Pose2d> arrayPublisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyPoseArray", Pose2d.struct).publish();

periodic() {
  publisher.set(poseA);
  arrayPublisher.set(new Pose2d[] {poseA, poseB});
}
```

:::tip
De [`Field2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/field2d-widget.html)-klasse van WPILib kan ook worden gebruikt om meerdere sets 2D-posedata samen te loggen.
:::

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
// Dit protocol ondersteunt het moderne struct-formaat niet, maar pose-
// waarden kunnen worden gepubliceerd met behulp van afzonderlijke velden
// die de achtervoegsels "x", "y" en "heading" bevatten (zoals hieronder weergegeven):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // Inches
packet.put("Pose y", 2.8); // Inches
packet.put("Pose heading", 3.14); // Radialen

// Als alternatief kunnen headings worden gepubliceerd in graden
packet.put("Pose heading (deg)", 180.0); // Graden

// Voeg hier andere telemetriewaarden toe...

FtcDashboard.getInstance().sendTelemetryPacket(packet)

// Gebruik als alternatief MultipleTelemetry en de standaard SDK-telemetrie:
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

- **Veld:** De te gebruiken veldafbeelding. Alle recente FRC- en FTC-spellen worden ondersteund. Zie [Aangepaste assets](/more-features/custom-assets) om een aangepaste veldafbeelding toe te voegen.
- **Oriëntatie:** De oriëntatie van de veldafbeelding in het weergavepaneel.
- **Grootte:** De zijlengte van de robot (30/27/24 inch voor FRC, 18/16/14 inch voor FTC).

:::info
Het coördinatenstelsel dat op dit tabblad wordt gebruikt, kan worden aangepast. Zie de pagina [Coördinatenstelsels](/more-features/coordinate-systems) voor details.
:::
