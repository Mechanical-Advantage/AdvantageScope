---
sidebar_position: 11
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📍 Punten {#points}

Het tabblad Punten geeft willekeurige punten weer in 2D. Het is een heel flexibel hulpmiddel om bijvoorbeeld vision-data en -pipelines of de status van een mechanisme overzichtelijk in beeld te brengen.

<img src="/img/tab-reference/points-1.webp" alt="Voorbeeld van tabblad Punten" />

_De Engelstalige interface wordt hierboven weergegeven._

<details>
<summary>Tijdlijnbesturing</summary>

Met de tijdlijn stuur je het afspelen en de weergave aan. Klik op de tijdlijn om een tijdstip te selecteren, en klik met de rechtermuisknop om de selectie weer op te heffen. Het geselecteerde tijdstip wordt gesynchroniseerd over alle tabbladen, zodat je hetzelfde moment makkelijk terugvindt in andere weergaven.

Gele stukken geven aan wanneer de robot autonoom rijdt, blauwe stukken staan voor teleop en grijze stukken voor de utility-modus.

Zet je cursor op de tijdlijn en scrol omhoog of omlaag om in en uit te zoomen. Je kunt ook een bereik selecteren door te klikken en te slepen terwijl je `Shift` ingedrukt houdt. Naar links en rechts bewegen doe je door horizontaal te scrollen (als je apparaat dat ondersteunt) of door op de tijdlijn te klikken en te slepen. Ben je live verbonden? Zodra je naar links scrolt, laat de weergave de huidige tijd los; scrol je weer helemaal naar rechts, dan klikt de weergave vanzelf weer vast op de huidige tijd. Druk op `Ctrl+\` om in te zoomen op de periode waarin de robot is ingeschakeld.

<img src="/img/tab-reference/timeline.webp" alt="Tijdlijn" />

</details>

## Bronnen toevoegen {#adding-sources}

Sleep een veld naar de sectie "Bronnen" om te beginnen. Met het kruisje verwijder je een bron, en met het oogpictogram (of door te dubbelklikken op de veldnaam) verberg je de bron tijdelijk. Wil je alles in één keer weghalen? Klik dan op de prullenbak naast de titel en kies `Alles wissen`. De volgorde van de bronnen pas je aan door ze te verslepen.

**Klik op het gekleurde pictogram of klik met de rechtermuisknop op de veldnaam om een bron aan te passen.** Je kunt voor elke bron het symbool, de kleur en de grootte instellen.

:::tip
Klik op het `?`-pictogram voor een volledig overzicht van alle ondersteunde brontypen en datatypen.
:::

## Dataformaat {#data-format}

Log puntendata als een byte-gecodeerde struct of protobuf van het type `Translation2d[]`. Veel bibliotheken ondersteunen dit formaat, waaronder WPILib en AdvantageKit. Hieronder zie je hoe je puntendata logt in Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Telemetry.log("MyTranslations",
  new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("MyTranslations",
  new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
Logger.recordOutput("MyTranslations",
  new Translation2d(0.0, 1.0),
  new Translation2d(2.0, 3.0)
);
```

</TabItem>
</Tabs>

## Configuratie {#configuration}

Je kunt de volgende opties instellen:

- **Afmetingen:** De grootte van het weergavegebied, in dezelfde eenheid als je gelogde punten. Gebruik je vision-data, vul dan de resolutie van de camera in.
- **Oriëntatie:** Het coördinatenstelsel dat wordt gebruikt (de richting van de X- en Y-as).
- **Oorsprong:** De plek van de oorsprong binnen het coördinatenstelsel.
