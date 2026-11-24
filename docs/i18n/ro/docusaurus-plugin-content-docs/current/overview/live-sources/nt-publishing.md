---
sidebar_position: 3
---

# Publicarea datelor NetworkTables {#publishing-networktables-data}

AdvantageScope suportă publicarea datelor NetworkTables stocate într-un fișier log înapoi către un server NetworkTables, cum ar fi un simulator sau un robot. Printre cazurile posibile de utilizare se numără:

- Reluarea meciurilor în simulare pentru depanare.
- Simularea datelor de la un coprocesor pe un robot real.
- Depanarea aplicațiilor de dashboard ale driverului folosind date reale de meci.

Această funcționalitate necesită un fișier log cu o captură completă a datelor NetworkTables, care poate fi generat folosind [înregistratorul de date integrat](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) din WPILib. Reține că AdvantageKit nu suportă această funcționalitate, deoarece oferă în schimb o reluare deterministă mai completă în simulare.

## Ghid de inițiere {#getting-started}

Pentru a începe publicarea, trebuie să ai deschis un fișier log care conține date NetworkTables. Apoi, urmează acești pași:

- **Publicare pe robot:** Dă clic pe `Fișier` > `Publică datele NT` > `Conectare la robot`.
- **Publicare pe simulator:** Dă clic pe `Fișier` > `Publică datele NT` > `Conectare la simulator`.

Partea de sus a ferestrei afișează textul „Se caută” sau „Se publică” pentru a indica starea publicării datelor. AdvantageScope încearcă să se reconecteze automat folosind aceleași setări după o deconectare.

Toate câmpurile vor fi publicate folosind valorile lor stocate la _marcajul de timp selectat_, utilizat de multe file AdvantageScope. Acest lucru permite redarea în rețea în timp real prin același mecanism ca redarea în AdvantageScope. Consultă [Navigarea în aplicație](/overview/navigation) pentru mai multe detalii. Dacă nu este selectat niciun marcaj de timp, câmpurile sunt publicate folosind valorile lor stocate la _marcajul de timp survolat cu cursorul_.

Pentru a opri publicarea, dă clic pe `Fișier` > `Publică datele NT` > `Oprește publicarea`.

## Filtrarea câmpurilor {#filtering-fields}

În mod implicit, AdvantageScope publică toate câmpurile NetworkTables stocate în fișierul log (cu excepția meta-topicurilor publicate de server). Unele cazuri de utilizare, cum ar fi simularea unui coprocesor, necesită publicarea doar a unui set limitat de câmpuri sau subtabele. Pentru a ajusta setul de prefixuri permise, deschide fereastra de preferințe dând clic pe `Aplicație` > `Afișează preferințele...` (Windows/Linux) sau `AdvantageScope` > `Setări...` (macOS).

Opțiunea „Prefixuri publicare NT” setează prefixurile permise pentru câmpurile publicate în NetworkTables. Dacă este lăsată necompletată, vor fi incluse toate câmpurile. În caz contrar, poți furniza o listă de prefixuri sau câmpuri separate prin virgulă. Consultă exemplele de mai jos.

- „_Telemetry_”: Include toate câmpurile din tabelul „Telemetry”.
- „_Telemetry/Drive_”: Include doar tabelul „Telemetry/Drive”.
- „_limelight/tx,limelight/ty_”: Include doar câmpurile „limelight/tx” și „limelight/ty”.

## Limitări {#limitations}

:::warning

- Câmpurile sunt publicate la fiecare 20ms, astfel încât datele NetworkTables publicate inițial la o frecvență mai mare vor omite eșantioane.
- Marcajele de timp ale eșantioanelor publicate nu sunt păstrate. Acest lucru ar fi imposibil la derularea înainte și înapoi în timp sau la redarea la viteze diferite.
  :::
