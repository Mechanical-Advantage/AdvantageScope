# 📉 Lijngrafiek {#line-graph}

De lijngrafiek is de standaardweergave in AdvantageScope. Je kunt er zowel continue (numerieke) als discrete velden mee bekijken.

<img src="/img/tab-reference/line-graph/line-graph-1.webp" alt="Lijngrafiek-demo" />

_De Engelstalige interface wordt hierboven weergegeven._

## Weergavepaneel {#viewer-pane}

Zet je cursor op de hoofdgrafiek en scrol omhoog of omlaag om in en uit te zoomen. Je kunt ook een specifiek bereik selecteren door te klikken en te slepen terwijl je `Shift` ingedrukt houdt. Naar links en rechts bewegen doe je door horizontaal te scrollen (als je apparaat dat ondersteunt) of door op de grafiek te klikken en te slepen. Ben je live verbonden? Zodra je naar links scrolt, laat de grafiek de huidige tijd los; scrol je weer helemaal naar rechts, dan klikt de weergave vanzelf weer vast op de huidige tijd.

Klik op de grafiek om een tijdstip te selecteren, en klik met de rechtermuisknop om de selectie weer op te heffen. In de legenda zie je van elk veld de waarde op dat moment. Het geselecteerde tijdstip wordt gesynchroniseerd over alle tabbladen, zodat je hetzelfde moment makkelijk terugvindt in andere weergaven.

:::tip
Het tijdsverschil (delta) tussen het geselecteerde tijdstip en de plek van je cursor verschijnt als overlay op de grafiek. Zo meet je heel makkelijk hoe lang iets duurt. De weergave van tijdstempels pas je aan via de voorkeur voor [Tijdstempels](/more-features/timestamps).
:::

## Bedieningspaneel {#control-pane}

Sleep een veld naar een van de drie secties (links, rechts of discreet) om te beginnen. Met het kruisje verwijder je een veld weer, en met het oogpictogram (of door te dubbelklikken op de veldnaam) verberg je het tijdelijk. Wil je alle velden tegelijk weghalen? Klik dan op de drie stippen naast de astitel en kies `Alles wissen`. De volgorde van de velden pas je aan door ze te verslepen.

De kleur en lijnstijl van elk veld stel je in door op het gekleurde pictogram te klikken of met de rechtermuisknop op de veldnaam te klikken. Data uit de [persistent alerts](https://docs.wpilib.org/en/latest/docs/software/telemetry/persistent-alerts.html)-API van WPILib visualiseer je door de waarschuwingsgroep toe te voegen als discreet veld. Hieronder zie je hoe dat eruitziet.

<img src="/img/tab-reference/line-graph/line-graph-2.webp" alt="Visualisatie van waarschuwingen" />

:::tip
Wil je de robotmodus (autonoom, tele-operated of utility) als achtergrondlaag over de grafiek heen zien? Klik dan op de drie stippen naast "Discrete velden" en kies "Robotmodus tonen".

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="Overlay robotmodus" />

_De Engelstalige interface wordt hierboven weergegeven._
:::

### Assen aanpassen {#adjusting-axes}

Standaard past elke as het bereik automatisch aan op de zichtbare data. Wil je dat uitzetten en het bereik vastzetten op het huidige minimum en maximum? Klik dan op de drie stippen naast de astitel en kies `As vergrendelen`. Om zelf waarden in te vullen, kies je `Bereik bewerken` en typ je het gewenste bereik in.

<img src="/img/tab-reference/line-graph/line-graph-4.webp" alt="Asbereik bewerken" height="250" />

_De Engelstalige interface wordt hierboven weergegeven._

### Integratie en differentiatie {#integration-and-differentiation}

AdvantageScope kan waarden automatisch voor je integreren of differentiëren, waarbij het tijdsverschil altijd in seconden wordt gerekend. Klik op de drie stippen naast de astitel en kies `Differentiëren` of `Integreren`.

:::info
Afgeleiden worden berekend met [eindige differenties](https://en.wikipedia.org/wiki/Finite_difference) tussen opeenvolgende meetpunten. Integralen worden berekend via [trapeziumintegratie](https://nl.wikipedia.org/wiki/Trapeziumregel).
:::
