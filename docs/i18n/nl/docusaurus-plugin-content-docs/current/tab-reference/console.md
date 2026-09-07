---
sidebar_position: 5
---

# 💬 Console {#console}

De consoleweergave is ontworpen om één enkel stringveld met consoledata te bekijken. Enkele voorgestelde velden worden hieronder vermeld:

- **DS:/Dscomm/Console** - Opgeslagen door het FIRST Driver Station.
- **messages** - Opgeslagen door de ingebouwde logging van WPILib op basis van aanroepen van de methode [`DataLogManager.log`](<https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/wpilibj/DataLogManager.html#log(java.lang.String)>).
- **/RealOutputs/Console** - Automatisch opgeslagen door AdvantageKit tijdens de werking van de robot (gebruik `System.out.println` zoals gebruikelijk).
- **/ReplayOutputs/Console** - Automatisch opgeslagen door AdvantageKit tijdens het herhalen van logs (gebruik `System.out.println` zoals gebruikelijk).

Sleep het gewenste veld naar de hoofdweergave om te beginnen. Elke rij vertegenwoordigt een update van het veld. Voor WPILib-logs wordt voor elke opgeslagen regel een nieuwe rij aangemaakt. Voor AdvantageKit-logs wordt voor elke loop-cyclus een nieuwe rij aangemaakt.

<img src="/img/tab-reference/console-1.webp" alt="Consoleweergave" />

_De Engelstalige interface wordt hierboven weergegeven._

:::info
Klik op het kleurenpaletpictogram om markering voor waarschuwings- en foutmeldingen in of uit te schakelen. Voor WPILib- en AdvantageKit-logs worden berichten gemarkeerd als ze de tekst "warning" of "error" bevatten.
:::

De bedieningselementen zijn vergelijkbaar met het tabblad 🔢 [Tabel](../tab-reference/table). Het geselecteerde tijdstip wordt gesynchroniseerd over alle tabbladen. Klik op een rij om deze te selecteren, of beweeg de muis over een rij voor een voorvertoning in eventuele zichtbare pop-upvensters. Als je op de knop ↓ klikt, spring je naar het geselecteerde tijdstip (of het tijdstip dat in het vak is ingevoerd). Tijdstempels en invoervelden voor verspringen zijn opgemaakt volgens de voorkeur voor [Tijdstempels](/more-features/timestamps).

Voer tekst in het invoerveld "Filteren" in om alleen rijen weer te geven die de filtertekst bevatten. Druk op `Ctrl+F` om snel het invoerveld "Filteren" te selecteren. Voeg een "!" toe aan het begin van de filtertekst om overeenkomende berichten uit de hoofdweergave _uit te sluiten_.

## ANSI-opmaak

De consolerenderer ondersteunt opmaak- en kleurcodes met behulp van standaard ANSI-escape-sequenties:

- **Tekststijlen:** Vet, gedimd, cursief en onderstreept
- **Voorgrond- en achtergrondkleuren:** Standaard 16 kleuren (standaard en hoge intensiteit)
- **8-bits en 24-bits kleuren:** 256-kleuren opzoektabel en 24-bits RGB
- **Selectieve resets:** Het resetten van specifieke stijlen of kleuren met behoud van andere

:::tip
Klik op het opslaan-pictogram om de consoledata te exporteren naar een tekstbestand.
:::
