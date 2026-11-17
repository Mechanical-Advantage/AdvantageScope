# Logdata exporteren {#exporting-log-data}

Met AdvantageScope kun je logdata flexibel exporteren als CSV-, WPILOG- of MCAP-bestand. Dat werkt zowel vanuit een geopend logbestand als wanneer je verbonden bent met een live-databron. Je kunt dit bijvoorbeeld gebruiken om:

- Een WPILOG-bestand om te zetten naar CSV of MCAP voor analyse in andere applicaties.
- Een WPILOG-bestand op te slaan op basis van NetworkTables-data, zodat je het later kunt terugkijken.
- Een kleiner WPILOG-bestand op te slaan met een beperkt aantal velden (en zonder dubbele waarden).

Klik op `Bestand` > `Data exporteren...` om de exportopties te openen.

<img src="/img/overview/log-files/export-1.webp" alt="Exportopties" />

_Hierboven zie je de Engelstalige interface._

:::tip
Naast de volledige logexport die hier wordt beschreven, kun je op het tabblad 💬 [Console](/tab-reference/console) ook consoledata exporteren naar een tekstbestand.
:::

:::warning
**Data exporteren voor SysId**

We raden af om deze functie te gebruiken om logdata die **in simulatie is gegenereerd** te exporteren voor [SysId](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/system-identification/introduction.html). SysId heeft namelijk extra tijdstempeldata nodig die niet aansluit bij de standaard exportopties van AdvantageScope. Logdata die **_buiten_ simulatie is opgenomen** kun je wel exporteren voor SysId met minimaal dataverlies (al haal je de hoogste nauwkeurigheid door het _originele_ logbestand rechtstreeks in SysId te laden).

_Deze waarschuwing **geldt niet** voor logs van AdvantageKit: die exporteer je zonder dataverlies door de optie "AdvantageKit-cycli" te kiezen. Zie [deze pagina](https://docs.advantagekit.org/data-flow/sysid-compatibility) voor meer informatie._
:::

## Opties {#options}

Bij het exporteren heb je de volgende opties:

- **Formaat:** Bepaalt het bestandsformaat van de export:
  - _CSV (tabel):_ Kommagescheiden waarden waarbij elke rij één tijdstempel voorstelt en elke kolom een veld (plus een kolom voor het tijdstempel zelf). Eén rij kan dus waarden voor meerdere velden bevatten.
  - _CSV (lijst):_ Kommagescheiden waarden waarbij elke rij een waarde van één enkel veld voorstelt, met kolommen voor tijdstempel, sleutel en waarde.
  - _WPILOG:_ Standaard WPILOG-bestand dat je opnieuw kunt openen in AdvantageScope.
  - _MCAP:_ Standaard [MCAP](https://mcap.dev)-bestand dat je kunt openen in [Foxglove](https://foxglove.dev).
- **Tijdstempels:** Alleen beschikbaar bij "CSV (tabel)". Bepaalt hoe nieuwe rijen worden aangemaakt:
  - _Alle wijzigingen:_ Maakt alleen een nieuwe rij aan wanneer de waarde van een veld verandert. Dit houdt de bestandsgrootte zo klein mogelijk.
  - _Vaste periode:_ Maakt op een vast interval een nieuwe rij aan. Handig voor logs zonder tijdstempelsynchronisatie (waarbij veel velden worden gelogd met vergelijkbare, maar niet exact gelijke tijdstempels). Let op: alle waarden worden bij elk meetpunt meegenomen, ook als er niets is veranderd.
  - _AdvantageKit-cycli:_ Maakt voor elke gesynchroniseerde loop-cyclus van AdvantageKit een nieuwe rij aan. Ook hier worden bij elke cyclus alle waarden meegenomen, ongeacht of ze zijn veranderd.
- **Periode:** Alleen beschikbaar wanneer "Vaste periode" is geselecteerd. Stelt de periode in milliseconden in tussen twee metingen. Meestal laat je dit overeenkomen met de duur van een loop-cyclus in je robotcode.
- **Prefixes:** Laat je dit veld leeg, dan worden alle velden meegenomen. Anders neemt AdvantageScope alleen velden op die overeenkomen met de opgegeven prefixes (gescheiden door komma's). Enkele voorbeelden:
  - "_/DriverStation/Joystick0_": Alle velden opnemen die beginnen met "/DriverStation/Joystick0" (data van de eerste joystick).
  - "_Flywheels,DS:enabled_": Alle velden opnemen die beginnen met "/Flywheels" of "DS:enabled" (alle vliegwieldata plus de ingeschakelde status van de robot).
  - "_Drive/LeftPosition,Drive/RightPosition_": Alleen de velden "/Drive/LeftPosition" en "/Drive/RightPosition" opnemen.
- **Veldset:** Bepaalt welke velden worden meegenomen. Gegenereerde velden worden door AdvantageScope aangemaakt om complexe typen op te splitsen (zoals losse onderdelen van arrays, structs en andere schema's) en staan in grijze tekst in de zijbalk:
  - _Gegenereerde opnemen:_ Exporteert alle zichtbare velden, inclusief gegenereerde velden. Aan te raden als je het bestand opent in een applicatie die geen complexe typen kan uitlezen.
  - _Alleen origineel:_ Exporteert alleen de velden uit het oorspronkelijke logbestand, zonder gegenereerde velden. Aan te raden als je het bestand opent in AdvantageScope of een andere applicatie die wel overweg kan met complexe typen.

Hieronder zie je een voorbeeld van een CSV-bestand dat uit AdvantageScope is geëxporteerd in het formaat "CSV (tabel)" met tijdstempels ingesteld op "Alle wijzigingen":

<img src="/img/overview/log-files/export-2.webp" alt="CSV-tabel" />
