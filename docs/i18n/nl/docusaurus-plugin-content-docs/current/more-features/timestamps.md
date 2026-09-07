---
sidebar_position: 5
---

# ⏱️ Tijdstempels {#timestamps}

AdvantageScope ondersteunt aanpasbare weergaveopties voor tijdstempels in alle weergaven, inclusief de tijdlijn, de 📉 [Lijngrafiek](/tab-reference/line-graph), de 🔢 [Tabel](/tab-reference/table) en de 💬 [Console](/tab-reference/console).

## Weergavemodi {#display-modes}

De weergavemodus voor tijdstempels kan worden geconfigureerd in het voorkeurenvenster:

- **Begin bij nul (standaard):** Verschuift alle tijdstempels zodat de vroegste data in het logbestand begint bij nul (`+0,0s`). Tijdstempels die in deze modus worden weergegeven, worden voorafgegaan door een `+`-symbool om de verstreken tijd vanaf het begin van de data aan te geven.
- **Origineel:** Geeft tijdstempels weer met hun oorspronkelijke numerieke waarden zoals vastgelegd in het logbestand, overeenkomend met de exacte waarden die door de robotcode worden gebruikt.

:::info
Vanaf WPILib 2027 worden tijdstempels gemeten aan de hand van de tijd sinds het opstarten van het apparaat op Systemcore en in simulatie. Omdat ruwe tijdstempels kunnen beginnen bij willekeurige grote getallen, wordt **Begin bij nul** aangeboden als een meer intuïtieve visualisatieoptie.
:::

## Synchronisatie van meerdere logbestanden {#multi-log-synchronization}

Wanneer [meerdere logbestanden tegelijkertijd worden geopend](/overview/log-files/#opening-logs), synchroniseert en lijnt AdvantageScope hun tijdstempels uit. In de modus **Begin bij nul** wordt het nulpunt ingesteld op het vroegste tijdstempel van alle geladen bestanden. In de modus **Origineel** worden tijdstempels weergegeven met behulp van de tijdbasis van het eerst geopende logbestand, waarbij eventuele extra logbestanden worden verschoven om ermee uit te lijnen.

## Aanpassing {#customization}

Om de weergavemodus voor tijdstempels te wijzigen, open je het voorkeurenvenster door te klikken op `App` > `Voorkeuren tonen...` (Windows/Linux) of `AdvantageScope` > `Instellingen...` (macOS), of door op `Ctrl+,` / `Cmd+,` te drukken. Wijzig de instelling **Tijdstempels** naar de gewenste optie.

<img src="/img/prefs_nl.webp" alt="Diagram van voorkeuren" height="450" />
