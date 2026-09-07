---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 Taalondersteuning {#language-support}

AdvantageScope ondersteunt meerdere talen om een gelokaliseerde ervaring te bieden voor teams over de hele wereld. De volgende talen zijn momenteel beschikbaar:

- Engels (VS)
- Spaans (Latijns-Amerika)
- Frans
- Nederlands
- Portugees (Brazilië)
- Roemeens
- Turks
- Russisch
- Kazachs
- Hebreeuws
- Arabisch
- Hindi
- Vereenvoudigd Chinees
- Traditioneel Chinees

## Configuratie {#configuration}

Om de weergavetaal in AdvantageScope te wijzigen, open je het voorkeurenvenster door te klikken op `App` > `Voorkeuren tonen...` (Windows/Linux) of `AdvantageScope` > `Instellingen...` (macOS). Onder de instelling "Taal" kun je kiezen uit de lijst met ondersteunde talen of "Systeemstandaard" selecteren om automatisch de taal van je besturingssysteem over te nemen.

<img src="/img/prefs_nl.webp" alt="Diagram van voorkeuren" height="450" />

## Logsleutels {#logging-keys}

Alle door AdvantageScope ondersteunde formaten bieden volledige Unicode-compatibiliteit bij het definiëren van logsleutels. Dit betekent dat je data kunt loggen in je moedertaal (inclusief accenten, speciale tekens en niet-Latijnse alfabetten) en dat dit correct wordt geregistreerd en weergegeven in AdvantageScope.

Hier is een voorbeeld van het loggen van een string met een Nederlandstalige sleutel:

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SmartDashboard.putString("Aandrijving/Geïntegreerde snelheid vóór", "Efficiënt");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("Aandrijving/Geïntegreerde snelheid vóór", "Efficiënt");
```

</TabItem>
</Tabs>

:::tip Ondersteuning voor eenheden
Zie de pagina over [ondersteuning voor eenheden](/tab-reference/line-graph/units) voor meer details over het doorgeven van eenheidsmetadata. Eenheidsnamen moeten worden opgegeven met behulp van SI-symbolen of in het Engels (Amerikaanse of Britse spelling), ongeacht de geselecteerde taal in AdvantageScope.
:::

## Ontwikkeling {#development}

De lokalisatie van AdvantageScope wordt aangedreven door een combinatie van kunstmatige intelligentie en samenwerking met de community. Omdat AdvantageScope een snel evoluerend project is, is het gebruik van AI essentieel om de vertaalde app en documentatie in alle talen synchroon te houden. Dit betekent dat nieuwe functies en updates altijd gelijktijdig beschikbaar zijn, ongeacht de taal die je selecteert.

Om de hoogste kwaliteit van vertalingen te garanderen, vertrouwt ons proces op uitgebreid referentiemateriaal van moedertaalsprekers in de FIRST-community om gedetailleerde woordenlijsten en richtlijnen voor elke taal op te stellen. Dit helpt de vertalingen aan te sluiten bij de specifieke woordenschat, leenwoorden en transliteraties waarmee lokale teams vertrouwd zijn.

De basisvertalingen worden iteratief gegenereerd met behulp van AI met menselijk toezicht op cruciale keuzes (zoals vertalingen van FIRST-vaktermen). Deze vertalingen worden vervolgens beoordeeld en verfijnd door moedertaalsprekers uit de FIRST-community om de nauwkeurigheid van de resulterende tekst te waarborgen. Gebruikers kunnen ook feedback geven over vertalingen door op het paarse pictogram in de app te klikken (wanneer geconfigureerd voor een andere taal dan het Engels).
