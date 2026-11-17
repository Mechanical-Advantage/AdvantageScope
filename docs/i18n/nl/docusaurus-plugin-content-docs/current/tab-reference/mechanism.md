---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ Mechanisme {#mechanism}

Op het tabblad **Mechanisme** bekijk je een scharnierend mechanisme dat is opgebouwd uit een of meer [Mechanism2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html)-objecten.

<img src="/img/tab-reference/mechanism-1.webp" alt="Overzicht van tabblad Mechanisme" />

_De Engelstalige interface wordt hierboven weergegeven._

<details>
<summary>Tijdlijnbesturing</summary>

Met de tijdlijn bestuur je het afspelen en de weergave van je logdata. Klik op de tijdlijn om een tijdstip te kiezen, en klik met de rechtermuisknop om de selectie weer op te heffen. Het gekozen tijdstip wordt op alle tabbladen tegelijk bijgewerkt, zodat je precies datzelfde moment makkelijk in andere weergaven terugvindt.

De kleuren geven de status van de robot aan: geel is autonoom, blauw is teleop en grijs is de utility-modus.

Om in of uit te zoomen, houd je de muisaanwijzer boven de tijdlijn en scrol je omhoog of omlaag. Je kunt ook een specifiek tijdsbereik kiezen door `Shift` ingedrukt te houden terwijl je klikt en sleept. Naar links en rechts bewegen doe je door horizontaal te scrollen (als je apparaat dat ondersteunt) of door op de tijdlijn te klikken en te slepen. Bij een live-verbinding koppel je de tijdlijn los van de huidige tijd door naar links te scrollen; scrol je helemaal naar rechts, dan springt hij weer mee met realtime. Druk op `Ctrl+\` om direct in te zoomen op de periode waarin de robot ingeschakeld was.

<img src="/img/tab-reference/timeline.webp" alt="Tijdlijn" />

</details>

## Mechanismen toevoegen {#adding-mechanisms}

Sleep een `Mechanism2d`-veld naar het bedieningspaneel om te beginnen. Met de X-knop verwijder je een mechanisme, en met het oogpictogram (of door te dubbelklikken op de veldnaam) verberg je het tijdelijk. Wil je alles in één keer weghalen? Klik dan op de prullenbak naast de titel en kies `Alles wissen`. Je kunt de volgorde in de lijst aanpassen door de mechanismen te verslepen.

## Data publiceren {#publishing-data}

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

Wil je mechanismedata publiceren met WPILib, log dan periodiek een `Mechanism2d`-object via `Telemetry` (zoals hieronder). Let op: deze aanroep legt alleen de status van dat moment vast. Roep hem dus elke loopcyclus aan nadat het object is bijgewerkt.

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);

periodic() {
  Telemetry.log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

Wil je mechanismedata publiceren met AdvantageKit, sla dan periodiek een `Mechanism2d` op als uitvoerveld (zoals hieronder). Let op: deze aanroep legt alleen de status van dat moment vast. Roep hem dus elke loopcyclus aan nadat het object is bijgewerkt.

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);

periodic() {
  Logger.recordOutput("MyMechanism", mechanism);
}
```

:::tip
Met de annotatie [@AutoLogOutput](https://docs.advantagekit.org/data-flow/recording-outputs/annotation-logging) van AdvantageKit logt hij de status van het mechanisme automatisch elke loopcyclus, zonder dat je zelf `Logger.recordOutput` hoeft aan te roepen.
:::

</TabItem>
</Tabs>
