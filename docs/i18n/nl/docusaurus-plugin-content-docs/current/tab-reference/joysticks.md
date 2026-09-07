---
sidebar_position: 8
---

# 🎮 Joysticks {#joysticks}

Het tabblad joysticks toont de status van maximaal zes aangesloten controllers. De onderstaande afbeelding toont een voorbeeldindeling met twee Xbox-controllers en een generieke joystick. Elke knop licht op wanneer deze wordt ingedrukt, en de statussen van joysticks en andere assen worden weergegeven.

<img src="/img/tab-reference/joysticks-1.webp" alt="Overzicht van tabblad joysticks" />

_De Engelstalige interface wordt hierboven weergegeven._

<details>
<summary>Tijdlijnbesturing</summary>

De tijdlijn wordt gebruikt om het afspelen en de visualisatie te regelen. Als je op de tijdlijn klikt, selecteer je een tijdstip, en als je met de rechtermuisknop klikt, deselecteer je dit weer. Het geselecteerde tijdstip wordt gesynchroniseerd over alle tabbladen, waardoor het eenvoudig is om deze positie snel terug te vinden in andere weergaven.

Gele gedeelten geven aan wanneer de robot autonoom is, blauwe gedeelten geven aan wanneer de robot tele-operated is en grijze gedeelten geven aan wanneer de robot in de utility-modus staat.

Om te zoomen, plaats je de cursor op de tijdlijn en scrol je omhoog of omlaag. Er kan ook een bereik worden geselecteerd door te klikken en te slepen terwijl je `Shift` ingedrukt houdt. Beweeg naar links en rechts door horizontaal te scrollen (op ondersteunde apparaten), of door op de tijdlijn te klikken en te slepen. Wanneer er live verbinding is, ontgrendelt naar links scrollen van de huidige tijd, en helemaal naar rechts scrollen vergrendelt weer op de huidige tijd. Druk op `Ctrl+\` om in te zoomen op de periode waarin de robot is ingeschakeld.

<img src="/img/tab-reference/timeline.webp" alt="Tijdlijn" />

</details>

## Bedieningspaneel {#control-pane}

Selecteer de joysticktypen in de tabel onderaan het tabblad. Joystick-ID's variëren van 0 tot 5 en komen overeen met de ID's in het Driver Station en WPILib. Meer informatie over joysticks is te vinden in de [WPILib-documentatie](https://docs.wpilib.org/en/stable/docs/software/basic-programming/joystick.html).

AdvantageScope bevat een set gangbare joysticks, waaronder een "Generieke joystick" met alle knoppen, assen en POV's in rasterformaat (hierboven te zien). Zie [Aangepaste assets](/more-features/custom-assets) om een aangepaste joystick toe te voegen.

:::warning
**Joystickdata is NIET beschikbaar via een NetworkTables-verbinding met standaard WPILib.** WPILib-logbestanden (met [joysticklogging ingeschakeld](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html#logging-joystick-data)), AdvantageKit-logs en AdvantageKit-streaming worden ondersteund.
:::
