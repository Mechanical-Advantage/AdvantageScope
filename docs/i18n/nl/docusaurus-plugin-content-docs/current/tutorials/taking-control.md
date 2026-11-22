---
sidebar_position: 3
---

# 🕹️ De controle nemen: DS & joysticks

Inzicht in bestuurdersinvoer en communicatiestatus is cruciaal bij het opsporen van problemen op het veld. AdvantageScope biedt naadloze integratie met het [FIRST Driver Station](https://docs.wpilib.org/en/latest/docs/software/firstdriverstation), zodat je live diagnostiek kunt monitoren, Driver Station-logs kunt inspecteren en controllerinvoer kunt visualiseren.

In deze tutorial leer je hoe je:

- AdvantageScope rechtstreeks opent vanuit het **FIRST Driver Station**.
- Verbindt met live Driver Station-diagnostiek.
- **Robotlogs** vergelijkt en synchroniseert met **Driver Station-logs**.
- Console-uitvoer en foutmeldingen bekijkt op het tabblad **💬 Console**.
- Joystickinvoer en controllerindelingen visualiseert op het tabblad **🎮 Joysticks**.

## 1. AdvantageScope openen vanuit het FIRST Driver Station

💡 [AdvantageScope Lite](/more-features/advantagescope-lite) is rechtstreeks geïntegreerd in het FIRST Driver Station. Je opent het door op het pictogram ⚙️ te klikken en vervolgens "Open Log Viewer in Browser" te kiezen.

<img src="/img/tutorials/taking-control-1.webp" alt="De knop &quot;Open Log Viewer In Browser&quot; in het FIRST Driver Station" />

_Hierboven zie je de Engelstalige interface._

## 2. Live verbinden met het Driver Station

Wanneer AdvantageScope op dezelfde laptop draait als het FIRST Driver Station, kan de desktopapp van AdvantageScope ook live telemetrie en diagnostiek over de status van het Driver Station streamen:

1. Start zowel het FIRST Driver Station als AdvantageScope.
2. Kies in het bovenste menu `Bestand` > `Verbinden met Driver Station`.
3. AdvantageScope maakt verbinding met de lokale Driver Station-service om realtime wedstrijdstatus, batterijspanning, joystickstatussen, enz. te streamen.
4. Open het tabblad 📉 [Lijngrafiek](/tab-reference/line-graph) of 🔢 [Tabel](/tab-reference/table) om live DS-diagnostiek te bekijken.

:::tip
Je kunt ook de sneltoets `Ctrl+Option+Shift+K` (macOS) of `Ctrl+Alt+Shift+K` (Windows/Linux) gebruiken om snel verbinding te maken met het Driver Station als live-bron.
:::

## 3. Driver Station-logs vs. robotlogs

Bij het analyseren van robotgedrag na een wedstrijd of trainingssessie zijn er twee hoofdtypen logs om rekening mee te houden:

| Logtype                 | Bron                            | Vastgelegde data                                                                                                                                          |
| :---------------------- | :------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Robotlogs**           | Systemcore via `DataLogManager` | Hoogfrequente telemetrie (50+ Hz), robotstatus, joystickstatus, sensormetingen, motorstromen, PID-regelaarstatussen, poseschattingen en mechanismedata.   |
| **Driver Station-logs** | Driver Station-laptop           | Netwerk-roundtriptijd (latentie), % pakketverlies, radioping, batterijspanning, CPU-% van de robotcontroller, consoledata, robotstatus en joystickstatus. |

:::important Robotlogs hebben over het algemeen de voorkeur
Omdat **robotlogs** rijke, hoogfrequente telemetrie rechtstreeks bij de bron vastleggen, hebben ze over het algemeen de voorkeur voor het onderzoeken van robotgedrag, regellussen en autonome paden. **DS-logs** leggen echter cruciale externe netwerk- en wedstrijdgebeurtenissen vast die de robot zelf niet kan meten.

Joystickdata wordt in **beide logs** vastgelegd, zoals [hieronder](#6-visualizing-joysticks) getoond.
:::

## 4. Meerdere logs samenvoegen en synchroniseren

Met AdvantageScope kun je logs uit meerdere bronnen openen en synchroniseren op één tijdlijn:

1. Open je robotlogbestand via `Bestand` > `Logbestand(en) openen...` (of sleep het `.wpilog`-bestand rechtstreeks naar AdvantageScope).
2. Selecteer in de menubalk `Bestand` > `Nieuw(e) logbestand(en) toevoegen...` en kies het bijbehorende Driver Station-logbestand.
3. AdvantageScope lijnt beide logs automatisch uit op een gesynchroniseerde tijdlijn! De velden uit elk logbestand worden geordend onder afzonderlijke tabellen (bijv. `Log0` en `Log1`).
4. Je kunt nu robottelemetrie (zoals motorstroom of poseschattingen) rechtstreeks combineren met Driver Station-signalen (zoals pakketverlies of batterijspanning) in de 📉 [Lijngrafiek](/tab-reference/line-graph) om te zien of onverwacht robotgedrag samenviel met een wegvallende radioverbinding of een brownout.

<img src="/img/overview/log-files/open-file-1.webp" alt="Opgeslagen logbestanden openen in AdvantageScope." />

_Hierboven zie je de Engelstalige interface._

## 5. Consoledata bekijken

Op het tabblad 💬 [Console](/tab-reference/console) kun je tekstuitvoer en foutlogs bekijken die door de robot of het Driver Station zijn afgedrukt. Consoledata kan in beide logbestanden worden opgeslagen:

- **Robotlogs:** WPILib's `DataLogManager` legt de console-uitvoer van de robot automatisch vast.
- **Driver Station-logs:** In het DS worden console-uitvoer en systeemgebeurtenisberichten opgeslagen in het veld `DS:/Dscomm/Console`.

Consoledata bekijken:

1. Klik op de knop **+** in de tabbladbalk en kies **Console**.
2. Sleep vanuit de zijbalk het consoleveld (`DS:/Dscomm/Console` of `messages`) naar het hoofdvenster.
3. Elke rij vertegenwoordigt een logbericht met bijbehorende tijdstempel. Klik op een willekeurig bericht om de gesynchroniseerde tijdlijn op alle geopende tabbladen naar dat exacte moment te laten springen!
4. Gebruik het vak "Filteren" (of druk op `Ctrl+F` / `Cmd+F`) om naar specifieke berichten te zoeken, of klik op het kleurenpaletpictogram om markering voor waarschuwingen en fouten aan of uit te zetten.

<img src="/img/tab-reference/console-1.webp" alt="Tabblad Console met logberichten." />

_Hierboven zie je de Engelstalige interface._

## 6. Joysticks visualiseren {#6-visualizing-joysticks}

Het tabblad 🎮 [Joysticks](/tab-reference/joysticks) geeft een realtime visuele weergave van maximaal 6 gamecontrollers, met asbewegingen, triggers, POV-hats en knopdrukken op realistische controllerindelingen. Om ervoor te zorgen dat joystickinvoer wordt vastgelegd in je robotlogbestand, initialiseer je `DriverStation.startDataLog()` in je `Robot`-constructor naast `DataLogManager` zoals getoond in 👋 [Hallo, telemetrie!](/tutorials/hello-telemetry).

1. Klik op de knop **+** in de bovenste tabbladbalk en kies **Joysticks**.
2. Wijs in de tabel onderaan het tabblad elke joystick-ID (0 t/m 5) toe aan de juiste indeling (bijv. **Xbox-controller**, **PS4-controller** of **Generieke joystick**).
3. Terwijl je door een logbestand scrubt of live data streamt vanaf het Driver Station, lichten knoppen op en bewegen analoge sticks synchroon met de acties van de bestuurder!

<img src="/img/tab-reference/joysticks-1.webp" alt="Tabblad Joysticks met actieve knopdrukken en posities van analoge sticks." />

_Hierboven zie je de Engelstalige interface._

## Wat nu?

Gefeliciteerd! Je hebt de basistutorialreeks van AdvantageScope voltooid. Je weet nu hoe je:

- Telemetrie instelt, verbindt met live streams en grafieken/tabellen bekijkt in **👋 [Hallo, telemetrie!](/tutorials/hello-telemetry)**.
- 2D/3D-odometrie, trajecten en mechanismen visualiseert in **🤖 [Het veld op](/tutorials/to-the-field)**.
- Driver Station-diagnostiek streamt, logs uit meerdere bronnen samenvoegt en joystickinvoer afspeelt in **🕹️ [De controle nemen](/tutorials/taking-control)**.

Ontdek meer van AdvantageScope's geavanceerde tools en functies:

- **📂 [Logbestanden](/overview/log-files):** Leer over ondersteunde logformaten, data exporteren en batchdownloads.
- **🛜 [Live-bronnen](/overview/live-sources):** Uitgebreide handleiding voor het verbinden met live-bronnen, inclusief tuning-modus.
- **[Tabbladreferentie](/category/tab-reference):** Naslaggidsen over de functies van elk visualisatietype.
- **[Meer functies](/category/more-features):** Documentatie en theorie over extra functies van AdvantageScope.
