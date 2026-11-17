# 🛜 Live-bronnen {#live-sources}

Alle visualisaties in AdvantageScope werken niet alleen met logbestanden, maar kunnen ook live-data van een robot of simulator tonen. Hieronder lees je hoe je verbinding maakt met realtime databronnen. AdvantageScope ondersteunt de volgende live-bronnen:

- **NetworkTables:** Het primaire netwerkprotocol van WPILib. Zie de [WPILib-documentatie](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html) voor meer informatie.
- **NetworkTables (AdvantageKit):** Bedoeld voor robotcode die AdvantageKit gebruikt; die publiceert naar de `AdvantageKit`-tabel in NetworkTables.
- **Systemcore-diagnostiek:** Maakt verbinding met de ingebouwde NetworkTables-server van het Systemcore-besturingssysteem, die diagnostische data zoals de robotstatus en apparaat-IO aanbiedt.
- **Phoenix-diagnostiek:** Gebruikt HTTP om verbinding te maken met een Phoenix-[diagnoseserver](https://pro.docs.ctr-electronics.com/en/latest/docs/troubleshooting/running-diagnostics.html), zodat je data kunt streamen van CTRE CAN-apparaten met [Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/). Dit lijkt op de [plotfunctie](https://pro.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) in Phoenix Tuner. Zie [deze pagina](/overview/live-sources/phoenix-diagnostics) voor meer informatie.
- **RLOG-server:** Een protocol dat door AdvantageKit wordt ondersteund als alternatief voor NetworkTables. De verbinding wordt standaard opgezet via poort 5800.
- **FTC Dashboard:** Werkt samen met FTC-robots die data publiceren naar [FTC Dashboard](https://acmerobotics.github.io/ftc-dashboard).

:::info
Draait AdvantageScope op hetzelfde apparaat als de FIRST Driver Station-app? Dan kun je rechtstreeks verbinding maken met het Driver Station om diagnostische data te bekijken, zonder dat je iets hoeft in te stellen (zie de stappen hieronder).
:::

## De verbinding starten {#starting-the-connection}

Volg deze stappen om een live-verbinding te starten:

- **Robot:** Klik op `Bestand` > `Verbinden met robot` > `Standaard` of kies een specifieke live-bron
- **Simulator:** Klik op `Bestand` > `Verbinden met simulator` > `Standaard` of kies een specifieke live-bron
- **Driver Station:** Klik op `Bestand` > `Verbinden met Driver Station`

In de titelbalk van het venster staan het IP-adres en de tekst "Zoeken" totdat de verbinding is gelegd. Valt de verbinding weg, dan probeert AdvantageScope automatisch opnieuw te verbinden met dezelfde instellingen.

## Live-data bekijken {#viewing-live-data}

Zodra je verbonden bent met een live-bron, vergrendelt AdvantageScope standaard alle tabbladen op het huidige tijdstip. Weergaven zoals de 📉 [Lijngrafiek](/tab-reference/line-graph) en 🔢 [Tabel](/tab-reference/table) scrollen automatisch mee, terwijl het veld en de joysticks steeds de nieuwste waarden tonen. Klik op de rode pijlknop in de navigatiebalk om deze vergrendeling aan of uit te zetten, zodat je ook eerdere data kunt terugkijken en afspelen.

<img src="/img/overview/live-sources/open-live-1.webp" alt="Knop voor vergrendelen/ontgrendelen van live-weergave" />

:::tip
Scroll je in de lijngrafiek of tijdlijn naar links, dan laat je het huidige tijdstip los. Scroll je weer helemaal naar rechts, dan vergrendelt de weergave opnieuw op de live-tijd.
:::

## Configuratie {#configuration}

Open het voorkeurenvenster via `App` > `Voorkeuren tonen...` (Windows/Linux) of `AdvantageScope` > `Instellingen...` (macOS).

<img src="/img/prefs_nl.webp" alt="Overzicht van de voorkeuren" height="450" />

### Robotadres {#robot-address}

Vul het robotadres in als hostnaam (bijv. `robot.local`) of IP-adres (bijv. `10.TE.AM.2`), zoals beschreven in de [WPILib-documentatie](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/ip-configurations.html#te-am-ip-notation). Maak je verbinding met Systemcore via USB of het ingebouwde wifitoegangspunt? Klik dan op `Bestand` > `Systemcore USB-adres gebruiken`/`Systemcore wifiadres gebruiken` om tijdelijk het juiste statische IP-adres te gebruiken.

### Live-modus {#live-mode}

Wanneer je NetworkTables als live-bron gebruikt, kun je kiezen uit deze twee modi:

- **Lage bandbreedte (standaard):** AdvantageScope vraagt alleen data op voor velden die je actief gebruikt. Data die is gepubliceerd voordat je een veld selecteerde, is niet beschikbaar. Deze modus is **sterk aan te raden** bij een beperkte netwerkbandbreedte of als je robot erg veel velden publiceert.
- **Logging:** AdvantageScope vraagt data op voor alle velden, of je ze nu actief gebruikt of niet. Zo kun je velden met terugwerkende kracht bekijken door de live-stream te pauzeren (zie hierboven). Dat is handig tijdens het ontwikkelen, maar **gebruik deze modus NIET als de bandbreedte beperkt is**.

### Live-data verwijderen {#discard-live-data}

Tijdens een live-verbinding bewaart AdvantageScope data lokaal, zodat je eerdere momenten kunt terugkijken (zie "Live-data bekijken" hierboven). Om te voorkomen dat het geheugengebruik te hoog oploopt, wordt data standaard na 20 minuten verwijderd. Je kunt een kortere periode kiezen om geheugen te besparen, of "Nooit" selecteren om live-data onbeperkt te bewaren.
