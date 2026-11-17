# Ondersteuning voor eenheden {#unit-support}

Het tabblad Lijngrafiek is eenheidsbewust: numerieke waarden worden automatisch herkend en je kunt ze moeiteloos omrekenen tussen compatibele eenheden. Als eenheidsinformatie beschikbaar is, verschijnen de juiste eenheden direct op de assen en in de legenda. Kijk [hier](#supported-formats) om te zien hoe je eenheden meestuurt in je logs. AdvantageScope biedt een aantal handige manieren om met eenheden te werken:

- Zet je **velden met compatibele eenheden op dezelfde as**, dan rekent AdvantageScope ze automatisch om naar dezelfde eenheid. Je ziet dat meteen terug op de Y-as en in de legenda.
- Klik op de drie stippen naast de astitel om **snel naar een andere eenheid te schakelen**. Je krijgt daar een lijst met de meest gebruikte compatibele eenheden.
- Zet **integratie of differentiatie** aan ([documentatie](/tab-reference/line-graph/#integration-and-differentiation)) om meteen de bijbehorende integraal- of afgeleide-eenheden te zien. Via het menu kun je de basiseenheid aanpassen, zodat je ook in niet-standaard eenheden kunt filteren.

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Eenheidsbewuste grafieken" />

_De Engelstalige interface wordt hierboven weergegeven._

## Ondersteunde formaten {#supported-formats}

Je kunt op verschillende manieren eenheidsinformatie meegeven aan een veld. De meeste gangbare eenheden worden ondersteund; de volledige lijst vind je in het pop-upmenu bij [handmatige conversie](#manual-conversion).

Bij optie (2) en (3) leest AdvantageScope de eenheid uit een tekststring. Voor elke eenheid worden meerdere schrijfwijzen ondersteund, zoals gangbare afkortingen (`ft` en `feet` werken allebei) en zowel Amerikaanse als Britse spelling (`meters` en `metres`). Let op: eenheidsnamen moet je altijd opgeven met SI-symbolen of in het Engels, ook als AdvantageScope op Nederlands staat ingesteld. Wordt een eenheidsnaam niet herkend? [Open dan een issue](https://github.com/Mechanical-Advantage/AdvantageScope/issues).

:::tip
Twijfel je of een eenheid goed wordt herkend? Sleep het veld naar de lijngrafiek en kijk of het eenheidstype op de Y-as verschijnt.
:::

### 🥇 Struct-eenheden {#struct-units}

Voor veelgebruikte gestructureerde datatypen zoals `Rotation2d` en `Translation3d` gebruikt AdvantageScope automatisch de ingebouwde eenheden. Dit is **altijd de beste manier om data te loggen**, omdat je geometriedata dan overal zonder extra instellingen goed wordt weergegeven.

### 🥈 Veldmetadata {#field-metadata}

In WPILOG- en NetworkTables-bestanden kun je extra metadata per veld meesturen. AdvantageScope zoekt naar JSON-velden met de naam "unit" of "units" en leest daar de naam van de eenheid uit (met spaties, camelCase, PascalCase of snake_case). Beweeg je muis over een veldnaam in de zijbalk om de metadata van dat veld te bekijken.

:::tip
Log je in WPILib een `Measure`-object met `Telemetry.log()`, dan wordt de eenheidsmetadata automatisch toegevoegd. Je kunt de metadata ook zelf instellen via `Telemetry.setProperty("fieldName", "unit", "\"volts\"")`.

Ook AdvantageKit ondersteunt eenheidsmetadata bij het loggen van inputs en outputs (zie [deze pagina](https://docs.advantagekit.org/data-flow/supported-types#units) voor meer details).
:::

### 🥉 Veldnaamgeving {#field-naming}

Als er geen struct of metadata is, probeert AdvantageScope de eenheid uit de veldnaam zelf te halen. **De eenheid moet dan als achtervoegsel aan het einde van de naam staan.** Verschillende schrijfwijzen worden herkend:

- **Camel/PascalCase**, zoals `PositionMeters`, `velocityRadPerSec` en `TimestampS`
- **Snake_case**, zoals `position_meters`, `velocity_rad_per_sec` en `timestamp_s`
- **Met spaties**, zoals `position meters`, `velocity rad per sec` en `timestamp s`

Bij snake_case en spaties maakt het _niet_ uit of je hoofdletters of kleine letters gebruikt.

:::tip
Wordt een eenheid verkeerd herkend? Klik dan op `Handmatige eenheden` > `Automatische eenheden uitschakelen` om de automatische herkenning te negeren. Daarna kun je zelf een handmatige conversie instellen.
:::

## Handmatige conversie {#manual-conversion}

Ontbreekt de eenheidsmetadata of klopt deze niet, dan kun je een as handmatig instellen om waarden om te rekenen (of de metadata helemaal te negeren).

Klik hiervoor op de drie stippen naast de astitel en kies `Handmatige eenheden` > `Conversie bewerken`. Kies het eenheidstype, de broneenheid en de doeleenheid. Elke waarde wordt daarnaast vermenigvuldigd met de "Extra factor". Daarmee maak je eigen omrekeningen, bijvoorbeeld voor overbrengingsverhoudingen, van hoek naar afstand of naar eenheden die niet in de lijst staan. Je mag bij de factor ook een wiskundige uitdrukking invullen, zoals `1.5*pi`.

:::tip
Wil je snel wisselen of de conversie uitzetten? Klik op de drie stippen naast de astitel en kies `Recente voorinstellingen` of `Eenheden resetten`.
:::

<img src="/img/tab-reference/line-graph/units-2.webp" alt="Eenheidsconversie bewerken" height="250" />

_De Engelstalige interface wordt hierboven weergegeven._
