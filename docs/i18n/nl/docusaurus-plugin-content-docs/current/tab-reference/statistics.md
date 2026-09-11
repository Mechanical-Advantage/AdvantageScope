---
sidebar_position: 6
---

# 📊 Statistieken {#statistics}

Het tabblad statistieken maakt diepgaande statistische analyse van numerieke velden mogelijk, waarbij algemene trends worden geanalyseerd in plaats van veranderingen in de loop van de tijd. De geselecteerde velden worden geanalyseerd met behulp van een histogram en een verscheidenheid aan standaard statistische meetwaarden.

<img src="/img/tab-reference/statistics-1.webp" alt="Overzicht van tabblad statistieken" />

_De Engelstalige interface wordt hierboven weergegeven._

## Bedieningspaneel {#control-pane}

Om te beginnen sleep je een veld naar de sectie "Metingen". Verwijder een veld met de X-knop, of verberg het tijdelijk door op het oogpictogram te klikken of te dubbelklikken op de veldnaam. Om alle velden te verwijderen, klik je op de prullenbak naast de astitel en vervolgens op `Alles wissen`. Velden kunnen in de lijst opnieuw worden gerangschikt door te klikken en te slepen.

Om het verschil tussen velden te analyseren, zet je een veld in de "Referentie"-modus en voeg je andere velden toe als onderliggende elementen. Onderliggende elementen kunnen worden geschakeld tussen de modi "Relatieve fout" en "Absolute fout".

:::info
De kleur van elk veld kan worden aangepast door op het gekleurde pictogram te klikken of met de rechtermuisknop op de veldnaam te klikken.
:::

### Configuratie {#configuration}

De optie **Tijdsbereik** selecteert welke delen van het logbestand worden gebruikt voor analyse:

- _Zichtbaar bereik:_ Analyseert het tijdsbereik dat zichtbaar is op de tijdlijn.
- _Volledig logbestand:_ Analyseert het volledige bereik van het logbestand.
- _Ingeschakeld:_ Analyseert tijdsbereiken waarin de robot is ingeschakeld.
- _Auto:_ Analyseert tijdsbereiken waarin de robot autonoom is.
- _Teleop:_ Analyseert tijdsbereiken waarin de robot tele-operated is.
- _Live: 30 seconden:_ Analyseert de meest recente 30 seconden (bij verbinding met een live-bron).
- _Live: 10 seconden:_ Analyseert de meest recente 10 seconden (bij verbinding met een live-bron).

De optie **Databereik** selecteert de minimum- en maximumwaarden die op het histogram moeten worden weergegeven. Data buiten dit bereik wordt niet getoond, maar blijft wel meegenomen worden in de statistische meetwaarden.

De optie **Stapgrootte** selecteert de grootte van elke histogram-klasse. Kleinere waarden leveren gedetailleerdere grafieken op, maar tonen ook meer ruis.

## Weergavepaneel {#viewer-pane}

### Histogram {#histogram}

Het histogram toont het aantal meetpunten dat binnen elke klasse valt, binnen het opgegeven bereik. Merk op dat data buiten het opgegeven bereik wordt genegeerd (in plaats van te worden gegroepeerd in een aparte klasse).

### Statistische meetwaarden {#statistical-measures}

De tabel met statistische meetwaarden toont de berekende waarden van elke meetwaarde voor de opgegeven velden. Meer informatie over elke meetwaarde wordt hieronder gegeven.

#### Samenvatting {#summary}

- **Aantal:** Het aantal gegenereerde discrete meetpunten.
- **Min:** De kleinste waarde in de data.
- **Max:** De grootste waarde in de data.

#### Midden {#center}

- [**Gemiddelde:**](https://nl.wikipedia.org/wiki/Rekenkundig_gemiddelde) Het rekenkundig gemiddelde (eenvoudig gemiddelde) van de data.
- [**Mediaan:**](<https://nl.wikipedia.org/wiki/Mediaan_(statistiek)>) De "middelste" waarde van de data, ofwel het 50e percentiel.
- [**Modus:**](<https://nl.wikipedia.org/wiki/Modus_(statistiek)>) De meest voorkomende waarde in de data.
- [**Meetkundig gemiddelde:**](https://nl.wikipedia.org/wiki/Meetkundig_gemiddelde) Een centrummaat berekend met behulp van het product van de waarden in plaats van de som. Van toepassing bij het meten van _exponentiële groeicijfers_ (zoals procentuele verandering tussen cycli).
- [**Harmonisch gemiddelde:**](https://nl.wikipedia.org/wiki/Harmonisch_gemiddelde) Een centrummaat berekend met behulp van de som van de reciproken van de waarden. Van toepassing bij het meten van _snelheden of verhoudingen_.
- [**Kwadratisch gemiddelde:**](https://nl.wikipedia.org/wiki/Effectieve_waarde) Een centrummaat berekend met behulp van de kwadraten van de waarden. Van toepassing bij het meten van data met zowel _positieve als negatieve waarden_, zoals periodieke beweging.

#### Spreiding {#spread}

- [**Standaardafwijking:**](https://nl.wikipedia.org/wiki/Standaardafwijking) De meest gangbare statistische maat voor variatie, waarbij een lagere waarde duidt op minder variatie. Voor normaal verdeelde data valt ongeveer 68% van de data binnen één standaardafwijking van het gemiddelde.
- [**Mediane absolute afwijking:**](https://en.wikipedia.org/wiki/Median_absolute_deviation) De mediaan van de absolute afwijkingen van de mediaan van de data. Dit is een spreidingsmaat die beter bestand is tegen uitschieters dan de standaardafwijking.
- [**Interkwartielafstand:**](https://nl.wikipedia.org/wiki/Interkwartielafstand) Het verschil tussen het derde en eerste kwartiel (75e percentiel en 25e percentiel), minder beïnvloed door uitschieters dan de standaardafwijking.
- [**Scheefheid:**](https://en.wikipedia.org/wiki/Skewness) Een maat voor de asymmetrie van de data. Een negatieve waarde duidt op een staart naar links, een positieve waarde op een staart naar rechts, en een nulwaarde suggereert een symmetrische verdeling.

#### Percentielen {#percentiles}

De [percentielen](https://nl.wikipedia.org/wiki/Percentiel) meten waarden waaronder het gegeven percentage van andere waarden valt. 10% van de waarden valt bijvoorbeeld onder het 10e percentiel. De volgende percentielen staan ook bekend als:

- 25e percentiel = 1e kwartiel (Q1)
- 50e percentiel = 2e kwartiel (Q2) = mediaan
- 75e percentiel = 3e kwartiel (Q3)
