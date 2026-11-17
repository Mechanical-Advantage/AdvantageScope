---
sidebar_position: 3
---

# NetworkTables-data publiceren {#publishing-networktables-data}

AdvantageScope kan NetworkTables-data uit een logbestand opnieuw publiceren naar een NetworkTables-server, zoals een simulator of een echte robot. Dat is bijvoorbeeld handig om:

- Wedstrijden na te spelen in een simulator om bugs op te sporen.
- Data van een coprocessor na te bootsen op een echte robot.
- Dashboard-applicaties voor bestuurders te testen met realistische wedstrijddata.

Hiervoor heb je een logbestand nodig waarin alle NetworkTables-data is vastgelegd, bijvoorbeeld met de [ingebouwde datalogger](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) van WPILib. Let op: AdvantageKit ondersteunt deze functie niet, omdat het in plaats daarvan volledige deterministische replay in simulatie mogelijk maakt.

## Aan de slag {#getting-started}

Om te kunnen publiceren moet er een logbestand met NetworkTables-data geopend zijn. Volg daarna deze stappen:

- **Publiceren naar robot:** Klik op `Bestand` > `NT-data publiceren` > `Verbinden met robot`.
- **Publiceren naar simulator:** Klik op `Bestand` > `NT-data publiceren` > `Verbinden met simulator`.

Bovenaan het venster staat "Zoeken" of "Publiceren" om de status aan te geven. Valt de verbinding weg, dan probeert AdvantageScope automatisch opnieuw te verbinden met dezelfde instellingen.

Alle velden worden gepubliceerd met hun opgeslagen waarde op het _geselecteerde tijdstempel_ dat veel tabbladen in AdvantageScope gebruiken. Zo kun je data realtime over het netwerk afspelen op precies dezelfde manier als in AdvantageScope zelf (zie [App-navigatie](/overview/navigation) voor meer uitleg). Is er geen tijdstempel geselecteerd, dan gebruikt AdvantageScope de opgeslagen waarden op het _aangewezen tijdstempel_.

Wil je stoppen met publiceren? Klik dan op `Bestand` > `NT-data publiceren` > `Publiceren stoppen`.

## Velden filteren {#filtering-fields}

Standaard publiceert AdvantageScope alle NetworkTables-velden uit het logbestand (behalve meta-topics die door de server zijn gepubliceerd). Soms wil je maar een beperkte set velden of subtabellen doorsturen, bijvoorbeeld wanneer je een coprocessor nabootst. Open hiervoor het voorkeurenvenster via `App` > `Voorkeuren tonen...` (Windows/Linux) of `AdvantageScope` > `Instellingen...` (macOS).

Met de optie "NT-publicatieprefixes" stel je in welke prefixes naar NetworkTables mogen worden gepubliceerd. Laat je dit veld leeg, dan wordt alles meegenomen. Anders vul je een door komma's gescheiden lijst met prefixes of velden in, zoals in deze voorbeelden:

- "_Telemetry_": Alle velden in de tabel "Telemetry" opnemen.
- "_Telemetry/Drive_": Alleen de tabel "Telemetry/Drive" opnemen.
- "_limelight/tx,limelight/ty_": Alleen de velden "limelight/tx" en "limelight/ty" opnemen.

## Beperkingen {#limitations}

:::warning

- Velden worden elke 20 ms gepubliceerd. NetworkTables-data die oorspronkelijk vaker werd verstuurd, slaat dus samples over.
- De tijdstempels van gepubliceerde samples blijven niet behouden. Dat is ook niet mogelijk wanneer je heen en weer spoelt in de tijd of op een andere snelheid afspeelt.
  :::
