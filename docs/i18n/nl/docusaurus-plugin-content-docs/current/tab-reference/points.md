---
sidebar_position: 11
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📍 Punten {#points}

Het tabblad punten toont een 2D-visualisatie van willekeurige punten. Dit is een zeer flexibele tool, die aangepaste visualisaties mogelijk maakt van vision-data/-pipelines, mechanismetoestanden, enz.

<img src="/img/tab-reference/points-1.webp" alt="Voorbeeld van tabblad punten" />

_De Engelstalige interface wordt hierboven weergegeven._

<details>
<summary>Tijdlijnbesturing</summary>

De tijdlijn wordt gebruikt om het afspelen en de visualisatie te regelen. Als je op de tijdlijn klikt, selecteer je een tijdstip, en als je met de rechtermuisknop klikt, deselecteer je dit weer. Het geselecteerde tijdstip wordt gesynchroniseerd over alle tabbladen, waardoor het eenvoudig is om deze positie snel terug te vinden in andere weergaven.

Gele gedeelten geven aan wanneer de robot autonoom is, blauwe gedeelten geven aan wanneer de robot tele-operated is en grijze gedeelten geven aan wanneer de robot in de utility-modus staat.

Om te zoomen, plaats je de cursor op de tijdlijn en scrol je omhoog of omlaag. Er kan ook een bereik worden geselecteerd door te klikken en te slepen terwijl je `Shift` ingedrukt houdt. Beweeg naar links en rechts door horizontaal te scrollen (op ondersteunde apparaten), of door op de tijdlijn te klikken en te slepen. Wanneer er live verbinding is, ontgrendelt naar links scrollen van de huidige tijd, en helemaal naar rechts scrollen vergrendelt weer op de huidige tijd. Druk op `Ctrl+\` om in te zoomen op de periode waarin de robot is ingeschakeld.

<img src="/img/tab-reference/timeline.webp" alt="Tijdlijn" />

</details>

## Bronnen toevoegen {#adding-sources}

Om te beginnen sleep je een veld naar de sectie "Bronnen". Verwijder een bron met de X-knop, of verberg deze tijdelijk door op het oogpictogram te klikken of te dubbelklikken op de veldnaam. Om alle objecten te verwijderen, klik je op de prullenbak naast de astitel en vervolgens op `Alles wissen`. Bronnen kunnen in de lijst opnieuw worden gerangschikt door te klikken en te slepen.

**Om elke bron aan te passen, klik je op het gekleurde pictogram of klik je met de rechtermuisknop op de veldnaam.** Het symbool, de kleur en de grootte van elke bron kunnen worden aangepast.

:::tip
Klik op het `?`-pictogram om een volledige lijst van ondersteunde brontypen te zien. Deze lijst bevat ook de ondersteunde datatypen.
:::

## Dataformaat {#data-format}

Puntendata moet worden gepubliceerd als een byte-gecodeerde struct of protobuf, met behulp van het type `Translation2d[]`. Veel bibliotheken ondersteunen dit formaat, waaronder WPILib en AdvantageKit. De onderstaande voorbeeldcode laat zien hoe je puntendata logt in Java.

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

De volgende configuratieopties zijn beschikbaar:

- **Dimensies:** De grootte van het weergavegebied. Dit kan elke eenheid gebruiken die overeenkomt met de gepubliceerde punten. Bij het weergeven van vision-data is dit de resolutie van de camera.
- **Oriëntatie:** Het te gebruiken coördinatenstelsel (oriëntatie van de X- en Y-as).
- **Oorsprong:** De positie van de oorsprong in het coördinatenstelsel.
