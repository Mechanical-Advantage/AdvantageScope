---
sidebar_position: 8
---

# 🎮 Joystick-uri {#joysticks}

Fila joystick-uri îți arată starea a până la șase controllere conectate. Imaginea de mai jos prezintă un exemplu de aranjament, cu două controllere Xbox și un joystick generic. Fiecare buton se aprinde când este apăsat, iar stările joystick-urilor și ale celorlalte axe sunt afișate în timp real.

<img src="/img/tab-reference/joysticks-1.webp" alt="Prezentare generală a filei joystick-uri" />

_Mai sus este prezentată interfața în limba engleză._

<details>
<summary>Controale cronologie</summary>

Cronologia controlează redarea și vizualizarea. Fă clic pe cronologie pentru a selecta un moment, iar clic dreapta pentru a-l deselecta. Momentul selectat este sincronizat în toate filele, astfel încât poți găsi rapid aceeași poziție și în alte vizualizări.

Secțiunile galbene arată când robotul este în autonom, cele albastre când este în teleoperat, iar cele gri când este în modul utilitar.

Pentru a face zoom, pune cursorul peste cronologie și derulează în sus sau în jos. Poți selecta și un interval făcând clic și trăgând în timp ce ții apăsată tasta `Shift`. Mută-te la stânga și la dreapta prin derulare orizontală (pe dispozitivele suportate) sau făcând clic și trăgând pe cronologie. Când ești conectat live, derularea spre stânga deblochează cronologia de la momentul curent, iar derularea până la capăt în dreapta o blochează din nou pe momentul curent. Apasă `Ctrl+\` pentru a face zoom pe perioada în care robotul este activat.

<img src="/img/tab-reference/timeline.webp" alt="Cronologie" />

</details>

## Panoul de control {#control-pane}

Selectează tipurile de joystick-uri din tabelul din partea de jos a filei. ID-urile joystick-urilor merg de la 0 la 5 și corespund cu ID-urile din Driver Station și WPILib. Găsești mai multe informații despre joystick-uri în [documentația WPILib](https://docs.wpilib.org/en/stable/docs/software/basic-programming/joystick.html).

AdvantageScope include un set de joystick-uri comune, inclusiv un „Joystick generic” care afișează toate butoanele, axele și POV-urile într-un format de grilă (vizibil mai sus). Pentru a adăuga un joystick personalizat, consultă [Resurse personalizate](/more-features/custom-assets).

:::warning
**Datele de la joystick-uri NU sunt disponibile printr-o conexiune NetworkTables cu WPILib standard.** Sunt suportate fișierele de log WPILib (cu [logarea datelor de joystick activată](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html#logging-joystick-data)), logurile AdvantageKit, streamingul AdvantageKit și datele FIRST Driver Station.
:::
