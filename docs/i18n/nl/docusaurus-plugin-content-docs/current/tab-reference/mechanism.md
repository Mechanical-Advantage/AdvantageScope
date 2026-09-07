---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ Mechanisme {#mechanism}

Het tabblad mechanisme toont een geleed mechanisme dat is gemaakt met een of meer [Mechanism2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html)-objecten.

<img src="/img/tab-reference/mechanism-1.webp" alt="Overzicht van tabblad mechanisme" />

_De Engelstalige interface wordt hierboven weergegeven._

<details>
<summary>Tijdlijnbesturing</summary>

De tijdlijn wordt gebruikt om het afspelen en de visualisatie te regelen. Als je op de tijdlijn klikt, selecteer je een tijdstip, en als je met de rechtermuisknop klikt, deselecteer je dit weer. Het geselecteerde tijdstip wordt gesynchroniseerd over alle tabbladen, waardoor het eenvoudig is om deze positie snel terug te vinden in andere weergaven.

Gele gedeelten geven aan wanneer de robot autonoom is, blauwe gedeelten geven aan wanneer de robot tele-operated is en grijze gedeelten geven aan wanneer de robot in de utility-modus staat.

Om te zoomen, plaats je de cursor op de tijdlijn en scrol je omhoog of omlaag. Er kan ook een bereik worden geselecteerd door te klikken en te slepen terwijl je `Shift` ingedrukt houdt. Beweeg naar links en rechts door horizontaal te scrollen (op ondersteunde apparaten), of door op de tijdlijn te klikken en te slepen. Wanneer er live verbinding is, ontgrendelt naar links scrollen van de huidige tijd, en helemaal naar rechts scrollen vergrendelt weer op de huidige tijd. Druk op `Ctrl+\` om in te zoomen op de periode waarin de robot is ingeschakeld.

<img src="/img/tab-reference/timeline.webp" alt="Tijdlijn" />

</details>

## Mechanismen toevoegen {#adding-mechanisms}

Om te beginnen sleep je een `Mechanism2d` naar het bedieningspaneel. Verwijder een mechanisme met de X-knop, of verberg het tijdelijk door op het oogpictogram te klikken of te dubbelklikken op de veldnaam. Om alle mechanismen te verwijderen, klik je op de prullenbak naast de astitel en vervolgens op `Alles wissen`. Mechanismen kunnen in de lijst opnieuw worden gerangschikt door te klikken en te slepen.

## Data publiceren {#publishing-data}

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

Om mechanismedata te publiceren met behulp van WPILib, log je een `Mechanism2d`-object periodiek met behulp van `Telemetry` (hieronder weergegeven). Merk op dat deze aanroep alleen de huidige status van de `Mechanism2d` vastlegt, dus deze moet elke loop-cyclus worden aangeroepen nadat het object is bijgewerkt.

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);

periodic() {
  Telemetry.log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

Om mechanismedata te publiceren met behulp van AdvantageKit, registreer je een `Mechanism2d` periodiek als een uitvoerveld (hieronder weergegeven). Merk op dat deze aanroep alleen de huidige status van de `Mechanism2d` vastlegt, dus deze moet elke loop-cyclus worden aangeroepen nadat het object is bijgewerkt.

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);

periodic() {
  Logger.recordOutput("MyMechanism", mechanism);
}
```

:::tip
De [@AutoLogOutput](https://docs.advantagekit.org/data-flow/recording-outputs/annotation-logging)-annotatie van AdvantageKit kan worden gebruikt om de status van het mechanisme automatisch elke loop-cyclus te loggen zonder `Logger.recordOutput` aan te roepen.
:::

</TabItem>
</Tabs>
