---
sidebar_position: 1
---

# Tuning-modus {#tuning-mode}

Bij sommige live-bronnen kun je numerieke en booleaanse waarden live aanpassen (tunen). Dat is bijvoorbeeld handig om [regelaarversterkingen te tunen](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) wanneer je verbonden bent met NetworkTables. Je robotcode moet dan wel ondersteunen dat die waarden via NetworkTables binnenkomen.

Standaard zijn alle waarden in AdvantageScope alleen-lezen. Om de tuning-modus aan of uit te zetten, **klik je op het schuifregelaarpictogram** rechts van de zoekbalk terwijl je verbonden bent met een ondersteunde live-bron. Zodra het pictogram paars is, staat de tuning-modus aan en kun je velden aanpassen.

- Een **numeriek veld** pas je aan door een nieuwe waarde in te vullen in het tekstvak rechts van het veld in de zijbalk. De waarde wordt verstuurd zodra je ergens anders klikt of op Enter drukt. Laat je het tekstvak leeg, dan gebruikt de app weer de waarde die de robot zelf publiceert.
- Een **booleaans veld** schakel je om door op het rode of groene bolletje rechts van het veld in de zijbalk te klikken.
- Wil je alle aangepaste waarden naar het klembord kopiëren? **Klik dan met de rechtermuisknop op het schuifregelaarpictogram** en kies **"Getunede waarden kopiëren"**.

:::warning
Deze functie is niet bedoeld om de robot op het veld te besturen. Dashboard-elementen zoals keuzemenu's en triggerknoppen worden niet ondersteund.
:::

## Tunen met AdvantageKit {#tuning-with-advantagekit}

Velden die AdvantageKit naar de subtabel `AdvantageKit` publiceert, zijn uitsluitend bedoeld als uitvoer en kun je niet aanpassen. Je kunt vanuit je eigen robotcode wel velden publiceren die je in AdvantageScope kunt tunen. **Alle velden die je naar de tabel "/Tuning" in NetworkTables stuurt, verschijnen onder de tabel "Tuning" zodra je de live-bron "NetworkTables (AdvantageKit)" gebruikt.**

Zo publiceer je bijvoorbeeld een instelbaar getal met de klasse [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs):

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
De subtabel `NetworkInputs` **kun je niet bewerken**, omdat AdvantageKit die gebruikt om netwerkwaarden vast te leggen voor logging en replay. Gebruik daarom de tabel `Tuning` als je live netwerkinvoer wilt aanpassen.
:::
