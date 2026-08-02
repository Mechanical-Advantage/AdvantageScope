---
sidebar_position: 8
---

# 🎮 Joystick-uri {#joysticks}

Fila joystick-uri afișează starea a până la șase controlere conectate. Imaginea de mai jos prezintă un exemplu de aranjament, cu două controlere Xbox și un joystick generic. Fiecare buton este evidențiat când este apăsat, și sunt afișate stările joystick-urilor și ale altor axe.

<img src="/img/tab-reference/joysticks-1.png" alt="Overview of joystick tab" />

<details>
<summary>Controale cronologie</summary>

Cronologia este utilizată pentru a controla redarea și vizualizarea. Dând clic pe cronologie se selectează un timp, iar dând clic dreapta se deselectează. Timpul selectat este sincronizat în toate filele, făcând ușoară găsirea rapidă a acestei locații în alte vizualizări.

Secțiunile galbene indică momentul în care robotul este în modul autonom, secțiunile albastre indică momentul în care robotul este în modul teleoperat, iar secțiunile gri indică momentul în care robotul este în modul utilitar.

Pentru a mări, plasați cursorul peste cronologie și derulați în sus sau în jos. Un interval poate fi de asemenea selectat prin clic și tragere în timp ce țineți apăsată tasta `Shift`. Mutați-vă la stânga și la dreapta prin derulare orizontală (pe dispozitivele suportate) sau prin clic și tragere pe cronologie. Când sunteți conectat live, derularea spre stânga deblochează timpul curent, iar derularea până la capăt în dreapta blochează din nou timpul curent. Apăsați `Ctrl+\` pentru a mări la perioada în care robotul este activat.

<img src="/img/tab-reference/timeline.png" alt="Timeline" />

</details>

## Panoul de control {#control-pane}

Selectați tipurile de joystick-uri din tabelul din partea de jos a filei. ID-urile joystick-urilor variază de la 0 la 5 și se potrivesc cu ID-urile din Driver Station și WPILib. Mai multe informații despre joystick-uri pot fi găsite în [documentația WPILib](https://docs.wpilib.org/en/stable/docs/software/basic-programming/joystick.html).

AdvantageScope include un set de joystick-uri comune, inclusiv un „Joystick generic” cu toate butoanele, axele și POV-urile într-un format de grilă (văzut mai sus). Pentru a adăuga un joystick personalizat, consultați [Resurse personalizate](/more-features/custom-assets).

:::warning
**Datele joystick-urilor NU sunt disponibile printr-o conexiune NetworkTables cu WPILib standard.** Fișierele de log WPILib (cu [înregistrarea datelor de joystick activată](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html#logging-joystick-data)), logurile AdvantageKit și streaming-ul AdvantageKit sunt suportate.
:::
