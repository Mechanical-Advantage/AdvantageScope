---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 Swerve {#swerve}

Op het tabblad Swerve bekijk je de status van vier swerve-modules, inclusief hun snelheidsvectoren, rustposities, robotrotatie en chassissnelheden.

<img src="/img/tab-reference/swerve-1.webp" alt="Overzicht van tabblad Swerve" />

_De Engelstalige interface wordt hierboven weergegeven._

<details>
<summary>Tijdlijnbesturing</summary>

Met de tijdlijn stuur je het afspelen en de weergave aan. Klik op de tijdlijn om een tijdstip te selecteren, en klik met de rechtermuisknop om de selectie weer op te heffen. Het geselecteerde tijdstip wordt gesynchroniseerd over alle tabbladen, zodat je hetzelfde moment makkelijk terugvindt in andere weergaven.

Gele stukken geven aan wanneer de robot autonoom rijdt, blauwe stukken staan voor tele-operated en grijze stukken voor de utility-modus.

Zet je cursor op de tijdlijn en scrol omhoog of omlaag om in en uit te zoomen. Je kunt ook een bereik selecteren door te klikken en te slepen terwijl je `Shift` ingedrukt houdt. Naar links en rechts bewegen doe je door horizontaal te scrollen (als je apparaat dat ondersteunt) of door op de tijdlijn te klikken en te slepen. Ben je live verbonden? Zodra je naar links scrolt, laat de weergave de huidige tijd los; scrol je weer helemaal naar rechts, dan klikt de weergave vanzelf weer vast op de huidige tijd. Druk op `Ctrl+\` om in te zoomen op de periode waarin de robot is ingeschakeld.

<img src="/img/tab-reference/timeline.webp" alt="Tijdlijn" />

</details>

## Bronnen toevoegen {#adding-sources}

Sleep een veld naar de sectie "Bronnen" om te beginnen. Met het kruisje verwijder je een bron, en met het oogpictogram (of door te dubbelklikken op de veldnaam) verberg je de bron tijdelijk. Wil je alles in één keer weghalen? Klik dan op de prullenbak naast de titel en kies `Alles wissen`. De volgorde van de bronnen pas je aan door ze te verslepen.

**Klik op het gekleurde pictogram of klik met de rechtermuisknop op de veldnaam om een bron aan te passen.** AdvantageScope ondersteunt drie soorten bronnen:

- **Modulesnelheden:** Een set van vier swerve-modulestaten, weergegeven als pijlen (vectoren) in het diagram.
- **Robotsnelheden:** De lineaire snelheid en hoeksnelheid, weergegeven in het midden van het diagram.
- **Rotatie:** De hoek waarmee het hele diagram wordt gedraaid.

## Dataformaat {#data-format}

Log je data als een byte-gecodeerde struct of protobuf van het type `SwerveModuleVelocity[]`, `ChassisVelocities`, `Rotation2d` of `Rotation3d`.

Veel bibliotheken ondersteunen het struct-formaat, waaronder WPILib en AdvantageKit. Hieronder zie je hoe je de status van swerve-modules logt in Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Telemetry.log("MyStates", states);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

:::note
In 2027 is deze datastructuur hernoemd van `SwerveModuleState` naar `SwerveModuleVelocity`.
Heb je oudere logbestanden van vóór WPILib 2027 en Systemcore? Dan worden de oudere `SwerveModuleState`-typen nog steeds ondersteund.
:::

## Configuratie {#configuration}

Je kunt de volgende opties instellen:

- **Max snelheid:** De hoogst haalbare snelheid van de modules; hiermee schaalt de lengte van de pijlen.
- **Framegrootte:** De afstanden tussen de swerve-modules links en rechts, en voor en achter. Dit past de beeldverhouding van het robotdiagram aan.
- **Oriëntatie:** Draait de richting waarin het robotdiagram wijst. Handig om het diagram gelijk te zetten met posedata of wedstrijdvideo's.

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
