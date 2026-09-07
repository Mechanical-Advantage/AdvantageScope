# Logdata exporteren {#exporting-log-data}

AdvantageScope bevat een flexibel systeem voor het exporteren van logdata als CSV-, WPILOG- of MCAP-bestand. De exportfuncties werken bij het bekijken van een logbestand of bij het verbinden met een live-databron. Mogelijke gebruiksscenario's zijn:

- Een WPILOG-bestand converteren naar CSV of MCAP voor analyse in andere applicaties.
- Een WPILOG-bestand exporteren op basis van NetworkTables-data, voor latere toegang.
- Een WPILOG opslaan met een beperkt aantal velden (en dubbele waarden verwijderd) om de bestandsgrootte te verkleinen.

Om de opties voor exporteren te bekijken, klik je op `Bestand` > `Data exporteren...`.

<img src="/img/overview/log-files/export-1.webp" alt="Exportopties" />

_De Engelstalige interface wordt hierboven weergegeven._

:::tip
Naast de hier beschreven volledige logexport, maakt het tabblad 💬 [Console](/tab-reference/console) het mogelijk om consoledata te exporteren naar een tekstbestand.
:::

:::warning
**Data exporteren voor SysId**

We raden af om deze functie te gebruiken om logdata te exporteren die **in simulatie is gegenereerd** voor gebruik in [SysId](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/system-identification/introduction.html), aangezien SysId aanvullende tijdstempeldata vereist die niet consistent is met de standaard exportopties van AdvantageScope. Merk op dat logdata die **_buiten_ simulatie is gegenereerd** kan worden geëxporteerd voor gebruik in SysId met minimaal dataverlies (hoewel maximale nauwkeurigheid kan worden bereikt door het _originele_ datalogbestand rechtstreeks in SysId te gebruiken).

_Deze waarschuwing is **niet van toepassing** op logs die zijn geproduceerd door AdvantageKit, welke zonder dataverlies kunnen worden geëxporteerd door de optie "AdvantageKit-cycli" te selecteren. Zie [deze pagina](https://docs.advantagekit.org/data-flow/sysid-compatibility) voor details._
:::

## Opties {#options}

De volgende opties zijn beschikbaar bij het exporteren:

- **Formaat:** Stelt het algemene formaat van het geëxporteerde bestand in. Zie de onderstaande opties.
  - _CSV (tabel):_ Kommagescheiden waarden, waarbij elke rij een uniek tijdstempel vertegenwoordigt en elke kolom een veld vertegenwoordigt (plus een kolom voor de tijdstempelwaarde). Elke rij kan een waarde in meerdere velden vertegenwoordigen.
  - _CSV (lijst):_ Kommagescheiden waarden, waarbij elke rij een waarde in één veld vertegenwoordigt met kolommen voor tijdstempel, sleutel en waarde.
  - _WPILOG:_ Standaard WPILOG-bestand dat opnieuw kan worden geopend in AdvantageScope.
  - _MCAP:_ Standaard [MCAP](https://mcap.dev)-bestand dat kan worden geopend in [Foxglove](https://foxglove.dev).
- **Tijdstempels:** Alleen voor "CSV (tabel)". Bepaalt de methode voor het aanmaken van nieuwe rijen. Zie de onderstaande opties.
  - _Alle wijzigingen:_ Alleen nieuwe rijen/vermeldingen aanmaken wanneer de waarden van de velden worden bijgewerkt. Minimaliseert de bestandsgrootte van de export.
  - _Vaste periode:_ Nieuwe rijen/vermeldingen met een vast interval aanmaken, nuttig voor logs zonder tijdstempelsynchronisatie (wanneer veel velden worden gelogd met vergelijkbare, maar niet identieke tijdstempels). Merk op dat alle waarden worden opgenomen, ongeacht of er een verandering was tussen bemonsteringspunten.
  - _AdvantageKit-cycli:_ Maak een nieuwe rij/vermelding aan voor elke door AdvantageKit gesynchroniseerde loop-cyclus. Merk op dat alle waarden worden opgenomen, ongeacht of er een verandering was tussen loop-cycli.
- **Periode:** Alleen wanneer "Vaste periode" is geselecteerd. Stelt de periode in milliseconden in tussen elke meting. Doorgaans moet dit overeenkomen met de looptijd van de loop-cyclus van de robotcode.
- **Prefixes:** Indien leeg, worden alle velden opgenomen. Neem anders alleen velden op die overeenkomen met de opgegeven prefixes (gescheiden door komma's). Zie de onderstaande voorbeelden.
  - "_/DriverStation/Joystick0_": Neem alle velden op die beginnen met "/DriverStation/Joystick0" (data van de eerste joystick).
  - "_Flywheels,DS:enabled_": Neem alle velden op die beginnen met "/Flywheels" of "DS:enabled" (alle data van het vliegwiel, plus de ingeschakelde status van de robot).
  - "_Drive/LeftPosition,Drive/RightPosition_": Neem alleen de velden "/Drive/LeftPosition" en "/Drive/RightPosition" op.
- **Veldset:** Zie de onderstaande opties. Gegenereerde velden worden door AdvantageScope gemaakt om complexe typen op te splitsen, en worden met grijze tekst weergegeven in de zijbalk. Dit omvat de afzonderlijke componenten van arrays, structs en andere schema's.
  - _Gegenereerde opnemen:_ Exporteer alle zichtbare velden, inclusief gegenereerde velden. Aanbevolen als de geëxporteerde data wordt geopend in een applicatie die niet in staat is om complexe typen te parseren.
  - _Alleen origineel:_ Exporteer alleen velden die aanwezig waren in het oorspronkelijke logbestand, met uitzondering van gegenereerde velden. Aanbevolen als de geëxporteerde data wordt geopend in AdvantageScope of een andere applicatie die in staat is om complexe typen te parseren.

Hieronder wordt een voorbeeld van een CSV-bestand getoond dat is geëxporteerd uit AdvantageScope, in het formaat "CSV (tabel)" met tijdstempels ingesteld op "Alle wijzigingen":

<img src="/img/overview/log-files/export-2.webp" alt="CSV-tabel" />
