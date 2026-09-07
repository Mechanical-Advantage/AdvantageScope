---
sidebar_position: 1
---

# Tuning-modus {#tuning-mode}

Sommige live-bronnen ondersteunen live tunen van numerieke en booleaanse waarden. Deze functie kan bijvoorbeeld worden gebruikt om [regelaarversterkingen te tunen](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) wanneer verbinding is gemaakt met een NetworkTables-bron. Merk op dat de robotcode het ontvangen van versterkingen via NetworkTables moet ondersteunen.

Standaard zijn alle waarden in AdvantageScope alleen-lezen. Om de tuning-modus in of uit te schakelen, **klik je op het schuifregelaarpictogram** rechts van de zoekbalk wanneer er verbinding is met een ondersteunde live-bron. Wanneer het pictogram paars is, is de tuning-modus actief en kunnen velden worden bewerkt.

- Om een **numeriek veld** te bewerken, voer je een nieuwe waarde in via het tekstvak rechts van het veld in de zijbalk. De waarde wordt gepubliceerd nadat de invoer is gedeselecteerd of op de "Enter"-toets wordt gedrukt. Laat het tekstvak leeg om de door de robot gepubliceerde waarde te gebruiken.
- Om een **booleaans veld** om te schakelen, klik je op het rode of groene cirkeltje rechts van het veld in de zijbalk.

:::warning
Deze functie is niet bedoeld voor het besturen van de robot op het veld. Dashboard-achtige invoerelementen zoals keuzemenu's, triggerknoppen, enz. worden niet ondersteund.
:::

## Tunen met AdvantageKit {#tuning-with-advantagekit}

Velden die door AdvantageKit worden gepubliceerd naar de subtabel `AdvantageKit` zijn alleen-uitvoer en kunnen niet worden bewerkt. Gebruikers kunnen echter velden publiceren vanuit gebruikerscode die vanuit AdvantageScope kunnen worden getuned. **Alle velden die worden gepubliceerd naar de tabel "/Tuning" op NetworkTables verschijnen onder de tabel "Tuning" wanneer de live-bron "NetworkTables (AdvantageKit)" wordt gebruikt.**

Een instelbaar getal kan bijvoorbeeld worden gepubliceerd met behulp van de klasse [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs):

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
De subtabel `NetworkInputs` **kan niet worden bewerkt**, aangezien deze door AdvantageKit wordt gebruikt om netwerkwaarden vast te leggen voor logging en herhaling. Gebruik de tabel `Tuning` om in realtime met netwerkinvoer te communiceren.
:::
