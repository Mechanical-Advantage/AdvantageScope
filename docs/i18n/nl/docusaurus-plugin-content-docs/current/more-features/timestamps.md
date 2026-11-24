---
sidebar_position: 5
---

# ⏱️ Tijdstempels {#timestamps}

In AdvantageScope kun je zelf kiezen hoe tijdstempels worden weergegeven in alle weergaven, zoals de tijdlijn, de 📉 [Lijngrafiek](/tab-reference/line-graph), de 🔢 [Tabel](/tab-reference/table) en de 💬 [Console](/tab-reference/console).

## Weergavemodi {#display-modes}

Je stelt de weergavemodus voor tijdstempels in bij de voorkeuren:

- **Begin bij nul (standaard):** Verschuift alle tijdstempels zodat het allereerste datapunt in het logbestand op nul begint (`+0,0 s`). Tijdstempels in deze modus krijgen een `+`-teken ervoor om aan te geven hoeveel tijd er sinds de start van de data is verstreken.
- **Origineel:** Toont de oorspronkelijke getallen uit het logbestand, precies zoals je robotcode ze heeft opgeslagen.

:::info
Vanaf WPILib 2027 meten tijdstempels op Systemcore en in simulatie de tijd sinds het opstarten van het apparaat. Omdat de ruwe waarden dan bij een willekeurig groot getal kunnen beginnen, is **Begin bij nul** een stuk overzichtelijker.
:::

## Meerdere logbestanden synchroniseren {#multi-log-synchronization}

Als je [meerdere logbestanden tegelijk opent](/overview/log-files/#opening-logs), zet AdvantageScope de tijdstempels automatisch gelijk. In de modus **Begin bij nul** ligt het nulpunt bij het vroegste tijdstempel uit alle geopende bestanden. In de modus **Origineel** gebruikt AdvantageScope de tijdbasis van het eerst geopende logbestand en schuift alle andere bestanden daarop aan.

## Aanpassen {#customization}

Open het voorkeurenvenster via `App` > `Voorkeuren tonen...` (Windows/Linux) of `AdvantageScope` > `Instellingen...` (macOS), of druk op `Ctrl+,` / `Cmd+,`. Kies daar bij **Tijdstempels** de optie die je wilt.

<img src="/img/prefs_nl.webp" alt="Overzicht van de voorkeuren" height="450" />
