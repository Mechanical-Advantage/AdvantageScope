# 🛜 Live-bronnen {#live-sources}

Alle visualisaties in AdvantageScope zijn ontworpen om naast logbestanden ook live-data van een robot of simulator te ontvangen. Deze sectie beschrijft hoe je verbinding maakt met realtime databronnen. De volgende bronnen van live-data worden ondersteund door AdvantageScope:

- **NetworkTables:** Dit is het primaire netwerkprotocol van WPILib. Zie de [WPILib-documentatie](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html) voor meer details.
- **NetworkTables (AdvantageKit):** Deze modus is ontworpen voor gebruik met robotcode die AdvantageKit uitvoert, welke publiceert naar de `AdvantageKit`-tabel in NetworkTables.
- **Systemcore-diagnostiek:** Deze modus maakt verbinding met de ingebouwde NetworkTables-server die wordt gebruikt door het Systemcore-besturingssysteem, welke diagnostische data zoals de robotstatus en apparaat-IO bevat.
- **Phoenix-diagnostiek:** Deze modus gebruikt HTTP om verbinding te maken met een Phoenix-[diagnoseserver](https://pro.docs.ctr-electronics.com/en/latest/docs/troubleshooting/running-diagnostics.html), wat datastreaming mogelijk maakt van CTRE CAN-apparaten met [Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/). Dit is vergelijkbaar met de [plotfunctie](https://pro.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) in Phoenix Tuner. Zie [deze pagina](/overview/live-sources/phoenix-diagnostics) voor meer informatie.
- **RLOG-server:** Dit protocol wordt ondersteund door AdvantageKit als een alternatief voor NetworkTables. De verbinding wordt standaard geïnitieerd op poort 5800.
- **FTC Dashboard:** Deze modus integreert met FTC-robots die data publiceren naar [FTC Dashboard](https://acmerobotics.github.io/ftc-dashboard).

:::info
AdvantageScope kan verbinding maken met het FIRST Driver Station om diagnostische data te bekijken wanneer het op hetzelfde apparaat draait als de DS-applicatie. Er is geen configuratie vereist (zie de onderstaande instructies).
:::

## De verbinding starten {#starting-the-connection}

Volg deze stappen om de live-verbinding te starten:

- **Robot:** Klik op `Bestand` > `Verbinden met robot` > `Standaard` of een specifieke live-bron
- **Simulator:** Klik op `Bestand` > `Verbinden met simulator` > `Standaard` of een specifieke live-bron
- **Driver Station:** Klik op `Bestand` > `Verbinden met Driver Station`

De titelbalk van het venster toont het IP-adres en de tekst "Zoeken" totdat het doelwit is verbonden. AdvantageScope probeert na een verbroken verbinding automatisch opnieuw verbinding te maken met dezelfde instellingen.

## Live-data bekijken {#viewing-live-data}

Wanneer er verbinding is met een live-bron, vergrendelt AdvantageScope standaard alle tabbladen op de huidige tijd. Weergaven zoals de 📉 [Lijngrafiek](/tab-reference/line-graph) en 🔢 [Tabel](/tab-reference/table) scrollen automatisch mee, en weergaven zoals het veld en de joysticks tonen de huidige waarden van elk veld. Als je op de rode pijlknop in de navigatiebalk klikt, schakel je deze vergrendeling in of uit, waardoor het bekijken en herhalen van data uit het verleden mogelijk wordt.

<img src="/img/overview/live-sources/open-live-1.webp" alt="Knop voor vergrendelen/ontgrendelen van live-weergave" />

:::tip
Naar links scrollen in de lijngrafiek of tijdlijn ontgrendelt van de huidige tijd, en helemaal naar rechts scrollen vergrendelt weer op de huidige tijd.
:::

## Configuratie {#configuration}

Open het voorkeurenvenster door te klikken op `App` > `Voorkeuren tonen...` (Windows/Linux) of `AdvantageScope` > `Instellingen...` (macOS).

<img src="/img/prefs_nl.webp" alt="Diagram van voorkeuren" height="450" />

### Robotadres {#robot-address}

Voer het robotadres in met behulp van een hostnaam (bijv. `robot.local`) of IP-adres (bijv. `10.TE.AM.2`) zoals beschreven in de [WPILib-documentatie](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/ip-configurations.html#te-am-ip-notation). Wanneer je verbinding maakt met Systemcore via USB of het ingebouwde wifi-toegangspunt, klik je op `Bestand` > `Systemcore USB-adres gebruiken`/`Systemcore wifiadres gebruiken` om tijdelijk het juiste statische IP-adres te gebruiken.

### Live-modus {#live-mode}

Wanneer NetworkTables wordt gebruikt als de live-bron, kunnen de volgende live-modi worden geselecteerd:

- **Lage bandbreedte (standaard):** AdvantageScope vraagt alleen data op van de server voor velden die actief worden gebruikt. Data die is gepubliceerd voordat een veld werd geselecteerd, is niet beschikbaar. Deze modus wordt **ten zeerste aanbevolen** wanneer de app wordt uitgevoerd in een omgeving met beperkte netwerkbandbreedte, of wanneer er een groot aantal velden wordt gepubliceerd.
- **Logging:** AdvantageScope vraagt data op voor alle velden, ongeacht of ze actief worden gebruikt. Dit betekent dat velden met terugwerkende kracht kunnen worden bekeken door de stroom van live-data te pauzeren (zie hieronder). Deze modus is vaak nuttig tijdens het ontwikkelen, maar **mag NIET worden gebruikt wanneer de bandbreedte beperkt is**.

### Live-data verwijderen {#discard-live-data}

Tijdens een live-verbinding wordt data lokaal opgeslagen om herhaling van eerdere data mogelijk te maken (zie "Live-data bekijken" hieronder). Om zeer hoog geheugengebruik te voorkomen, wordt data standaard na 20 minuten verwijderd. Er kan een kortere periode worden geselecteerd om het geheugengebruik te verminderen, of er kan voor "Nooit" worden gekozen om live-data oneindig te bewaren.
