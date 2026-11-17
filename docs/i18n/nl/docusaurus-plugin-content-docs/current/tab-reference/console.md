---
sidebar_position: 5
---

# 💬 Console {#console}

Op het tabblad **Console** bekijk je één stringveld met consolemeldingen. Hieronder staan een paar handige velden om te gebruiken:

- **DS:/Dscomm/Console** - Opgeslagen door het FIRST Driver Station.
- **messages** - Opgeslagen door de ingebouwde logging van WPILib via [`DataLogManager.log`](<https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/wpilibj/DataLogManager.html#log(java.lang.String)>).
- **/RealOutputs/Console** - Automatisch opgeslagen door AdvantageKit terwijl de robot draait (gebruik gewoon `System.out.println`).
- **/ReplayOutputs/Console** - Automatisch opgeslagen door AdvantageKit tijdens het opnieuw afspelen van logs (gebruik gewoon `System.out.println`).

Sleep het gewenste veld naar het hoofdvenster om te beginnen. Elke rij laat een update van dat veld zien: bij WPILib-logs is dat elke opgeslagen regel, bij AdvantageKit-logs elke loopcyclus.

<img src="/img/tab-reference/console-1.webp" alt="Consoleweergave" />

_De Engelstalige interface wordt hierboven weergegeven._

:::info
Klik op het kleurenpaletpictogram om waarschuwingen en foutmeldingen wel of niet te markeren. Bij WPILib- en AdvantageKit-logs worden meldingen gemarkeerd zodra ze de tekst "warning" of "error" bevatten.
:::

De bediening werkt grotendeels hetzelfde als op het tabblad 🔢 [Tabel](../tab-reference/table). Het gekozen tijdstip wordt op alle tabbladen tegelijk bijgewerkt. Klik op een rij om dat moment te kiezen, of beweeg er met je muis overheen voor een voorvertoning in eventuele pop-outvensters. Met de knop ↓ spring je naar het gekozen tijdstip (of het tijdstip dat je in het vak hebt ingetypt). De weergave van tijdstempels en invoerwaarden volgt je instelling bij [Tijdstempels](/more-features/timestamps).

Typ tekst in het invoerveld "Filteren" om alleen rijen te tonen die die tekst bevatten. Met `Ctrl+F` spring je meteen naar dat filtervak. Zet een "!" voor je zoektekst om overeenkomende meldingen juist _weg te filteren_.

## ANSI-opmaak

De consoleweergave ondersteunt opmaak- en kleurcodes via standaard ANSI-escapesequenties:

- **Tekststijlen:** Vet, gedimd, cursief en onderstreept
- **Voor- en achtergrondkleuren:** De standaard 16 kleuren (normaal en hoge intensiteit)
- **8-bits en 24-bits kleuren:** Het 256-kleurenpalet en 24-bits RGB
- **Selectieve resets:** Specifieke stijlen of kleuren resetten terwijl de rest behouden blijft

:::tip
Klik op het opslaan-pictogram om de consolemeldingen als tekstbestand te exporteren.
:::
