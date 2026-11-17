---
sidebar_position: 8
---

# 🎮 Joysticks {#joysticks}

Op het tabblad **Joysticks** zie je wat er op maximaal zes aangesloten controllers gebeurt. In het voorbeeld hieronder zie je een indeling met twee Xbox-controllers en een generieke joystick. Elke knop licht op zodra hij wordt ingedrukt, en ook de standen van de sticks en andere assen worden getoond.

<img src="/img/tab-reference/joysticks-1.webp" alt="Overzicht van tabblad Joysticks" />

_De Engelstalige interface wordt hierboven weergegeven._

<details>
<summary>Tijdlijnbesturing</summary>

Met de tijdlijn bestuur je het afspelen en de weergave van je logdata. Klik op de tijdlijn om een tijdstip te kiezen, en klik met de rechtermuisknop om de selectie weer op te heffen. Het gekozen tijdstip wordt op alle tabbladen tegelijk bijgewerkt, zodat je precies datzelfde moment makkelijk in andere weergaven terugvindt.

De kleuren geven de status van de robot aan: geel is autonoom, blauw is teleop en grijs is de utility-modus.

Om in of uit te zoomen, houd je de muisaanwijzer boven de tijdlijn en scrol je omhoog of omlaag. Je kunt ook een specifiek tijdsbereik kiezen door `Shift` ingedrukt te houden terwijl je klikt en sleept. Naar links en rechts bewegen doe je door horizontaal te scrollen (als je apparaat dat ondersteunt) of door op de tijdlijn te klikken en te slepen. Bij een live-verbinding koppel je de tijdlijn los van de huidige tijd door naar links te scrollen; scrol je helemaal naar rechts, dan springt hij weer mee met realtime. Druk op `Ctrl+\` om direct in te zoomen op de periode waarin de robot ingeschakeld was.

<img src="/img/tab-reference/timeline.webp" alt="Tijdlijn" />

</details>

## Bedieningspaneel {#control-pane}

Kies de juiste joysticktypen in de tabel onderaan het tabblad. De joystick-ID's lopen van 0 tot en met 5 en komen overeen met de ID's in het Driver Station en WPILib. Meer uitleg over joysticks vind je in de [WPILib-documentatie](https://docs.wpilib.org/en/stable/docs/software/basic-programming/joystick.html).

AdvantageScope heeft standaard een aantal bekende joysticks ingebouwd, plus een "Generieke joystick" die alle knoppen, assen en POV's in een overzichtelijk raster toont (zoals hierboven). Wil je een eigen controllerindeling toevoegen? Kijk dan bij [Aangepaste assets](/more-features/custom-assets).

:::warning
**Joystickdata is NIET beschikbaar via een NetworkTables-verbinding met standaard WPILib.** Wel ondersteund zijn WPILib-logbestanden (als [joysticklogging is ingeschakeld](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html#logging-joystick-data)), AdvantageKit-logs en AdvantageKit-streaming.
:::
