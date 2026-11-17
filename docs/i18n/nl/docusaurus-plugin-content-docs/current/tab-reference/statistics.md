---
sidebar_position: 6
---

# 📊 Statistieken {#statistics}

Met het tabblad Statistieken duik je dieper in je numerieke velden: je kijkt naar algemene trends in plaats van veranderingen over de tijd. Je gekozen velden worden geanalyseerd met een histogram en allerlei standaard statistische meetwaarden.

<img src="/img/tab-reference/statistics-1.webp" alt="Overzicht van tabblad Statistieken" />

_De Engelstalige interface wordt hierboven weergegeven._

## Bedieningspaneel {#control-pane}

Sleep een veld naar de sectie "Metingen" om te beginnen. Met het kruisje verwijder je een veld, en met het oogpictogram (of door te dubbelklikken op de veldnaam) verberg je het tijdelijk. Wil je alle velden tegelijk weghalen? Klik dan op de prullenbak naast de titel en kies `Alles wissen`. De volgorde van de velden pas je aan door ze te verslepen.

Wil je twee velden met elkaar vergelijken? Zet dan één veld in de modus "Referentie" en sleep andere velden eronder als subvelden. Die subvelden kun je vervolgens schakelen tussen "Relatieve fout" en "Absolute fout".

:::info
Je past de kleur van elk veld aan door op het gekleurde pictogram te klikken of met de rechtermuisknop op de veldnaam te klikken.
:::

### Configuratie {#configuration}

Met **Tijdsbereik** kies je welk deel van het logbestand wordt geanalyseerd:

- _Zichtbaar bereik:_ Analyseert het stuk dat op dat moment zichtbaar is op de tijdlijn.
- _Volledig logbestand:_ Analyseert het hele logbestand.
- _Ingeschakeld:_ Analyseert alleen de momenten waarop de robot is ingeschakeld.
- _Auto:_ Analyseert alleen de autonome periode.
- _Teleop:_ Analyseert alleen de teleop-periode.
- _Live: 30 seconden:_ Analyseert de laatste 30 seconden (bij een live-verbinding).
- _Live: 10 seconden:_ Analyseert de laatste 10 seconden (bij een live-verbinding).

Met **Databereik** stel je de minimum- en maximumwaarde voor het histogram in. Waarden buiten dit bereik zie je niet in de grafiek, maar ze tellen nog wel gewoon mee voor de statistische meetwaarden.

Met **Stapgrootte** bepaal je hoe breed elke klasse (staaf) van het histogram is. Een kleinere stapgrootte geeft een gedetailleerder beeld, maar laat ook meer ruis zien.

## Weergavepaneel {#viewer-pane}

### Histogram {#histogram}

Het histogram laat zien hoeveel meetpunten er binnen het opgegeven bereik in elke klasse vallen. Let op: data buiten dat bereik wordt weggelaten (en dus niet in een aparte restklasse gezet).

### Statistische meetwaarden {#statistical-measures}

In de tabel zie je per veld alle berekende statistische meetwaarden. Hieronder staat wat elke waarde betekent.

#### Samenvatting {#summary}

- **Aantal:** Het totaal aantal discrete meetpunten.
- **Min:** De laagste waarde in de data.
- **Max:** De hoogste waarde in de data.

#### Midden {#center}

- [**Gemiddelde:**](https://nl.wikipedia.org/wiki/Rekenkundig_gemiddelde) Het gewone rekenkundig gemiddelde van de data.
- [**Mediaan:**](<https://nl.wikipedia.org/wiki/Mediaan_(statistiek)>) De middelste waarde als je alle data op volgorde zet (het 50e percentiel).
- [**Modus:**](<https://nl.wikipedia.org/wiki/Modus_(statistiek)>) De waarde die het vaakst voorkomt.
- [**Meetkundig gemiddelde:**](https://nl.wikipedia.org/wiki/Meetkundig_gemiddelde) Een centrummaat die wordt berekend met het product van de waarden in plaats van de som. Handig bij _exponentiële groei_, zoals procentuele veranderingen tussen cycli.
- [**Harmonisch gemiddelde:**](https://nl.wikipedia.org/wiki/Harmonisch_gemiddelde) Een centrummaat op basis van het omgekeerde van de waarden. Handig bij het meten van _snelheden of verhoudingen_.
- [**Kwadratisch gemiddelde:**](https://nl.wikipedia.org/wiki/Effectieve_waarde) Een centrummaat op basis van de kwadraten van de waarden. Handig bij data met zowel _positieve als negatieve waarden_, zoals een heen-en-weergaande beweging.

#### Spreiding {#spread}

- [**Standaardafwijking:**](https://nl.wikipedia.org/wiki/Standaardafwijking) De meest gebruikte maat voor spreiding; hoe lager dit getal, hoe dichter de waarden bij elkaar liggen. Bij normaal verdeelde data valt ongeveer 68% binnen één standaardafwijking van het gemiddelde.
- [**Mediane absolute afwijking:**](https://en.wikipedia.org/wiki/Median_absolute_deviation) De mediaan van de absolute afwijkingen ten opzichte van de mediaan. Deze maat is minder gevoelig voor uitschieters dan de standaardafwijking.
- [**Interkwartielafstand:**](https://nl.wikipedia.org/wiki/Interkwartielafstand) Het verschil tussen het derde en het eerste kwartiel (het 75e en 25e percentiel). Ook deze maat heeft minder last van uitschieters dan de standaardafwijking.
- [**Scheefheid:**](https://en.wikipedia.org/wiki/Skewness) Geeft aan hoe asymmetrisch de verdeling is. Een negatieve waarde betekent een uitloper naar links, een positieve waarde een uitloper naar rechts, en nul wijst op een symmetrische verdeling.

#### Percentielen {#percentiles}

[Percentielen](https://nl.wikipedia.org/wiki/Percentiel) geven de waarde aan waaronder een bepaald percentage van alle meetpunten ligt. Zo valt 10% van de waarden onder het 10e percentiel. Een paar bekende percentielen hebben ook een eigen naam:

- 25e percentiel = 1e kwartiel (Q1)
- 50e percentiel = 2e kwartiel (Q2) = mediaan
- 75e percentiel = 3e kwartiel (Q3)
