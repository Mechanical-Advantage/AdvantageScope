---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🌐 Taalondersteuning {#language-support}

AdvantageScope ondersteunt meerdere talen zodat teams over de hele wereld de software in hun eigen taal kunnen gebruiken. De volgende talen zijn beschikbaar in de documentatie, de desktopapp, de mobiele apps (AdvantageScope XR en AdvantageTune) en AdvantageScope Lite (op Systemcore en in het FIRST Driver Station):

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

Bedankt aan FRC Team 6907 The G.O.A.T. voor hun hulp bij het controleren en verbeteren van de vertalingen van AdvantageScope!

## Configuratie {#configuration}

Om de taal in AdvantageScope aan te passen, open je het voorkeurenvenster via `App` > `Voorkeuren tonen...` (Windows/Linux) of `AdvantageScope` > `Instellingen...` (macOS). Bij "Taal 🌐" kies je een van de ondersteunde talen, of je kiest "Systeemstandaard" om automatisch de taal van je besturingssysteem te volgen.

<img src="/img/prefs_nl.webp" alt="Overzicht van de voorkeuren" height="450" />

## Logsleutels {#logging-keys}

Alle formaten die AdvantageScope ondersteunt, bieden volledige Unicode-ondersteuning voor logsleutels. Je kunt je data dus gewoon loggen in je eigen taal — inclusief accenten, speciale tekens en niet-Latijnse schriften — en AdvantageScope legt alles netjes vast en toont het zoals bedoeld.

Hier zie je een voorbeeld van het loggen van een string met een Nederlandstalige sleutel:

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Telemetry.log("Aandrijving/Geïntegreerde snelheid vóór", "Efficiënt");
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::telemetry::Log("Aandrijving/Geïntegreerde snelheid vóór", "Efficiënt");
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import telemetry

telemetry.log("Aandrijving/Geïntegreerde snelheid vóór", "Efficiënt")
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("Aandrijving/Geïntegreerde snelheid vóór", "Efficiënt");
```

</TabItem>
</Tabs>

:::tip Ondersteuning voor eenheden
Bekijk de pagina over [ondersteuning voor eenheden](/tab-reference/line-graph/units) voor meer informatie over het meesturen van eenheidsmetadata. Eenheidsnamen moet je wel altijd opgeven met SI-symbolen of in het Engels (Amerikaanse of Britse spelling), welke taal je ook hebt geselecteerd in AdvantageScope.
:::

## Ontwikkeling {#development}

De vertalingen van AdvantageScope ontstaan door een combinatie van kunstmatige intelligentie en hulp vanuit de community. Omdat AdvantageScope volop in ontwikkeling is, hebben we AI nodig om de app en de documentatie in alle talen synchroon te houden. Zo komen nieuwe functies en updates altijd tegelijk uit, ongeacht welke taal je kiest.

We stemmen het proces zo goed mogelijk af op het jargon en de Engelse termen die teams zelf gebruiken. Toch klinken **AI-vertalingen soms onnatuurlijk of sluipen er foutjes in**. Daarom stellen we jouw feedback enorm op prijs: klik op het paarse pictogram in de app of op de feedbacklink in de titelbalk van de documentatie (als je een andere taal dan Engels gebruikt) om opmerkingen door te geven.
