# 📉 Lijngrafiek {#line-graph}

De lijngrafiek is de standaardweergave in AdvantageScope. Het ondersteunt zowel continue (numerieke) als discrete velden.

<img src="/img/tab-reference/line-graph/line-graph-1.webp" alt="Lijngrafiek-demo" />

_De Engelstalige interface wordt hierboven weergegeven._

## Weergavepaneel {#viewer-pane}

Om te zoomen, plaats je de cursor op de hoofdgrafiek en scrol je omhoog of omlaag. Een bereik kan ook worden geselecteerd door te klikken en te slepen terwijl je `Shift` ingedrukt houdt. Beweeg naar links en rechts door horizontaal te scrollen (op ondersteunde apparaten), of door op de grafiek te klikken en te slepen. Wanneer er live verbinding is, ontgrendelt naar links scrollen van de huidige tijd, en helemaal naar rechts scrollen vergrendelt weer op de huidige tijd.

Als je op de grafiek klikt, selecteer je een tijdstip, en als je met de rechtermuisknop klikt, deselecteer je dit weer. De waarde van elk veld op dat tijdstip wordt weergegeven in de legenda. Het geselecteerde tijdstip wordt gesynchroniseerd over alle tabbladen, waardoor het eenvoudig is om deze positie snel terug te vinden in andere weergaven.

:::tip
Het verschil (delta) tussen het geselecteerde en aangewezen tijdstip wordt weergegeven als een overlay op de grafiek, waardoor tijdsbereiken eenvoudig kunnen worden gemeten. Tijdstempels zijn opgemaakt volgens de voorkeur voor [Tijdstempels](/more-features/timestamps).
:::

## Bedieningspaneel {#control-pane}

Om te beginnen sleep je een veld naar een van de drie secties (links, rechts of discreet). Verwijder een veld met de X-knop, of verberg het tijdelijk door op het oogpictogram te klikken of te dubbelklikken op de veldnaam. Om alle velden te verwijderen, klik je op de drie stippen naast de astitel en vervolgens op `Alles wissen`. Velden kunnen in de lijst opnieuw worden gerangschikt door te klikken en te slepen.

De kleur en lijnstijl van elk veld kunnen worden aangepast door op het gekleurde pictogram te klikken of met de rechtermuisknop op de veldnaam te klikken. Data van de [persistent alerts](https://docs.wpilib.org/en/latest/docs/software/telemetry/persistent-alerts.html)-API van WPILib kan worden gevisualiseerd door de waarschuwingsgroep toe te voegen als een discreet veld. Hieronder wordt een voorbeeldvisualisatie getoond.

<img src="/img/tab-reference/line-graph/line-graph-2.webp" alt="Visualisatie van waarschuwingen" />

:::tip
Om de robotmodus (autonoom, tele-operated of utility) over de grafiek te projecteren, klik je op de drie stippen naast "Discrete velden" en klik je op "Robotmodus tonen".

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="Overlay robotmodus" />

_De Engelstalige interface wordt hierboven weergegeven._
:::

### Assen aanpassen {#adjusting-axes}

Standaard past elke as zijn bereik aan op basis van de zichtbare data. Om automatisch schalen uit te schakelen en het bereik te vergrendelen op het huidige minimum en maximum, klik je op de drie stippen naast de astitel en vervolgens op `As vergrendelen`. Om het bereik handmatig aan te passen, kies je `Bereik bewerken` en voer je de gewenste waarden in.

<img src="/img/tab-reference/line-graph/line-graph-4.webp" alt="Asbereik bewerken" height="250" />

_De Engelstalige interface wordt hierboven weergegeven._

### Integratie en differentiatie {#integration-and-differentiation}

Waarden kunnen automatisch worden geïntegreerd of gedifferentieerd door AdvantageScope. Deltatijd wordt altijd gemeten in seconden. Klik op de drie stippen naast de astitel en selecteer vervolgens `Differentiëren` of `Integreren`.

:::info
Afgeleiden worden berekend met behulp van het [eindige differentie](https://en.wikipedia.org/wiki/Finite_difference)-algoritme van aangrenzende meetpunten. Integralen worden berekend met behulp van [trapeziumintegratie](https://nl.wikipedia.org/wiki/Trapeziumregel).
:::
