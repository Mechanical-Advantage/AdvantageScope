---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 Swerve {#swerve}

Het tabblad swerve toont de status van vier swerve-modules, inclusief de snelheidsvectoren, rustposities, robotrotatie en chassissnelheden.

<img src="/img/tab-reference/swerve-1.webp" alt="Overzicht van tabblad swerve" />

_De Engelstalige interface wordt hierboven weergegeven._

<details>
<summary>Tijdlijnbesturing</summary>

De tijdlijn wordt gebruikt om het afspelen en de visualisatie te regelen. Als je op de tijdlijn klikt, selecteer je een tijdstip, en als je met de rechtermuisknop klikt, deselecteer je dit weer. Het geselecteerde tijdstip wordt gesynchroniseerd over alle tabbladen, waardoor het eenvoudig is om deze positie snel terug te vinden in andere weergaven.

Gele gedeelten geven aan wanneer de robot autonoom is, blauwe gedeelten geven aan wanneer de robot tele-operated is en grijze gedeelten geven aan wanneer de robot in de utility-modus staat.

Om te zoomen, plaats je de cursor op de tijdlijn en scrol je omhoog of omlaag. Er kan ook een bereik worden geselecteerd door te klikken en te slepen terwijl je `Shift` ingedrukt houdt. Beweeg naar links en rechts door horizontaal te scrollen (op ondersteunde apparaten), of door op de tijdlijn te klikken en te slepen. Wanneer er live verbinding is, ontgrendelt naar links scrollen van de huidige tijd, en helemaal naar rechts scrollen vergrendelt weer op de huidige tijd. Druk op `Ctrl+\` om in te zoomen op de periode waarin de robot is ingeschakeld.

<img src="/img/tab-reference/timeline.webp" alt="Tijdlijn" />

</details>

## Bronnen toevoegen {#adding-sources}

Om te beginnen sleep je een veld naar de sectie "Bronnen". Verwijder een bron met de X-knop, of verberg deze tijdelijk door op het oogpictogram te klikken of te dubbelklikken op de veldnaam. Om alle bronnen te verwijderen, klik je op de prullenbak naast de astitel en vervolgens op `Alles wissen`. Bronnen kunnen in de lijst opnieuw worden gerangschikt door te klikken en te slepen.

**Om elke bron aan te passen, klik je op het gekleurde pictogram of klik je met de rechtermuisknop op de veldnaam.** AdvantageScope ondersteunt drie brontypen:

- **Modulesnelheden:** Een set van vier swerve-modulestatussen, weergegeven als vectoren op het diagram.
- **Robotsnelheden:** Lineaire en hoeksnelheden weergegeven in het midden van het diagram.
- **Rotatie:** Hoekpositie die wordt gebruikt om het diagram te roteren.

## Dataformaat {#data-format}

Data moet worden gepubliceerd als een byte-gecodeerde struct of protobuf, met behulp van de typen `SwerveModuleVelocity[]`, `ChassisVelocities`, `Rotation2d` of `Rotation3d`.

Veel bibliotheken ondersteunen het struct-formaat, waaronder WPILib en AdvantageKit. De onderstaande voorbeeldcode laat zien hoe je de status van swerve-modules logt in Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
}

StructArrayPublisher<SwerveModuleVelocity> publisher = NetworkTableInstance.getDefault()
.getStructArrayTopic("MyStates", SwerveModuleVelocity.struct).publish();

periodic() {
  publisher.set(states);
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
}

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

:::note
In 2027 werd deze datastructuur hernoemd van `SwerveModuleState` naar `SwerveModuleVelocity`.
Voor logbestanden die zijn gemaakt vóór WPILib 2027 en Systemcore worden legacy `SwerveModuleState`-typen nog steeds ondersteund voor visualisatie.
:::

## Configuratie {#configuration}

De volgende configuratieopties zijn beschikbaar:

- **Max snelheid:** De maximaal haalbare snelheid van de modules, gebruikt om de grootte van de vectoren aan te passen.
- **Framegrootte:** De afstanden tussen de links-rechts en voor-achter swerve-modules. Wijzigt de beeldverhouding van het robotdiagram.
- **Oriëntatie:** Past de richting aan waarin het robotdiagram wijst. Deze optie is vaak nuttig om uit te lijnen met pose-data of wedstrijdvideo's.

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
