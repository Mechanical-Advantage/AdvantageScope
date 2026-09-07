---
sidebar_position: 3
---

# NetworkTables-data publiceren {#publishing-networktables-data}

AdvantageScope ondersteunt het opnieuw publiceren van NetworkTables-data die is opgeslagen in een logbestand naar een NetworkTables-server, zoals een simulator of robot. Mogelijke gebruiksscenario's zijn:

- Het herhalen van wedstrijden in simulatie voor foutopsporing.
- Het nabootsen van data van een coprocessor op een echte robot.
- Het debuggen van driver dashboard-applicaties met behulp van realistische wedstrijddata.

Deze functie vereist een logbestand met een volledige registratie van NetworkTables-data, die kan worden gegenereerd met de [ingebouwde datalogger](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) van WPILib. Merk op dat AdvantageKit deze functie niet ondersteunt, omdat het in plaats daarvan een completere deterministische herhaling in simulatie mogelijk maakt.

## Aan de slag {#getting-started}

Om te beginnen met publiceren, moet een logbestand met NetworkTables-data geopend zijn. Volg daarna deze stappen:

- **Publiceren naar robot:** Klik op `Bestand` > `NT-data publiceren` > `Verbinden met robot`.
- **Publiceren naar simulator:** Klik op `Bestand` > `NT-data publiceren` > `Verbinden met simulator`.

Bovenaan het venster wordt de tekst "Zoeken" of "Publiceren" weergegeven om de status van het publiceren van data aan te geven. AdvantageScope probeert na een verbroken verbinding automatisch opnieuw verbinding te maken met dezelfde instellingen.

Alle velden worden gepubliceerd met hun opgeslagen waarden op het _geselecteerde tijdstempel_ dat door veel AdvantageScope-tabbladen wordt gebruikt. Dit maakt realtime netwerkafspelen mogelijk via hetzelfde mechanisme als afspelen binnen AdvantageScope. Zie [App-navigatie](/overview/navigation) voor meer details. Als er geen tijdstempel is geselecteerd, worden velden gepubliceerd met hun opgeslagen waarden op het _aangewezen tijdstempel_.

Om het publiceren te stoppen, klik je op `Bestand` > `NT-data publiceren` > `Publiceren stoppen`.

## Velden filteren {#filtering-fields}

Standaard publiceert AdvantageScope alle NetworkTables-velden die in het logbestand zijn opgeslagen (met uitzondering van door de server gepubliceerde meta-topics). Sommige use cases, zoals het nabootsen van een coprocessor, vereisen het publiceren van slechts een beperkte set velden of subtabellen. Om de set toegestane veldprefixes aan te passen, open je het voorkeurenvenster door te klikken op `App` > `Voorkeuren tonen...` (Windows/Linux) of `AdvantageScope` > `Instellingen...` (macOS).

De optie "NT-publicatieprefixes" stelt de toegestane prefixes in voor velden die naar NetworkTables worden gepubliceerd. Als dit veld leeg wordt gelaten, worden alle velden opgenomen. Anders kan een door komma's gescheiden lijst van prefixes of velden worden opgegeven. Zie de onderstaande voorbeelden:

- "_SmartDashboard_": Alle velden in de tabel "SmartDashboard" opnemen.
- "_SmartDashboard/Auto Selector_": Alleen de tabel "SmartDashboard/Auto Selector" opnemen.
- "_limelight/tx,limelight/ty_": Alleen de velden "limelight/tx" en "limelight/ty" opnemen.

## Beperkingen {#limitations}

:::warning

- Velden worden elke 20 ms gepubliceerd, dus NetworkTables-data die oorspronkelijk met een hogere frequentie werd gepubliceerd, zal samples overslaan.
- De tijdstempels van gepubliceerde samples blijven niet behouden. Dit zou onmogelijk zijn bij het heen en weer scrubben in de tijd of bij het afspelen op verschillende snelheden.
  :::
