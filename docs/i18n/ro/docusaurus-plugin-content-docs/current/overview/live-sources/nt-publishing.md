---
sidebar_position: 3
---

# Publicarea datelor NetworkTables

AdvantageScope suportă publicarea datelor NetworkTables stocate într-un fișier log înapoi către un server NetworkTables, cum ar fi un simulator sau un robot. Cazurile posibile de utilizare includ:

- Reușita reluării meciurilor în simulare pentru depanare.
- Imitarea datelor de la un coprocesor pe un robot real.
- Depanarea aplicațiilor de pe panoul de bord al șoferului (dashboard) folosind date reale de meci.

Această caracteristică necesită un fișier log cu o captură completă a datelor NetworkTables, care poate fi generată folosind [înregistratorul integrat de date](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) al WPILib. Rețineți că AdvantageKit nu suportă această caracteristică, deoarece activează în schimb o reluare deterministă mai completă în simulare.

## Ghid de inițiere

Pentru a începe publicarea, trebuie deschis un fișier log care conține date NetworkTables. Apoi, urmați acești pași:

- **Publicare pe robot:** Dă clic pe `Fișier` > `Publică datele NT` > `Conectare la robot`.
- **Publicare pe simulator:** Dă clic pe `Fișier` > `Publică datele NT` > `Conectare la simulator`.

Partea superioară a ferestrei afișează textul „Se caută” sau „Se publică” pentru a indica starea publicării datelor. AdvantageScope încearcă să se reconecteze automat folosind aceleași setări după o deconectare.

Toate câmpurile vor fi publicate folosind valorile lor stocate la _marcajul de timp selectat_ utilizat de multe file AdvantageScope. Acest lucru permite redarea în rețea în timp real prin același mecanism ca redarea în cadrul AdvantageScope. Consultați [Navigarea în aplicație](/overview/navigation) pentru mai multe detalii. Dacă nu este selectat niciun marcaj de timp, câmpurile sunt publicate folosind valorile lor stocate la _marcajul de timp survolat cu cursorul_.

Pentru a opri publicarea, dați clic pe `Fișier` > `Publică datele NT` > `Oprește publicarea`.

## Filtrarea câmpurilor

În mod implicit, AdvantageScope publică toate câmpurile NetworkTables stocate în fișierul log (cu excepția meta-topicurilor publicate de server). Unele cazuri de utilizare, cum ar fi imitarea unui coprocesor, necesită publicarea doar a unui set limitat de câmpuri sau subtabele. Pentru a ajusta setul de prefixuri de câmp permise, deschideți fereastra de preferințe dând clic pe `Aplicație` > `Afișează preferințele...` (Windows/Linux) sau `AdvantageScope` > `Setări...` (macOS).

Opțiunea „Prefixuri publicare NT” setează prefixurile permise pentru câmpurile publicate în NetworkTables. Dacă este lăsată necompletată, vor fi incluse toate câmpurile. În caz contrar, poate fi furnizată o listă de prefixuri sau câmpuri separate prin virgulă. Consultați exemplele de mai jos.

- „_SmartDashboard_”: Include toate câmpurile din tabelul „SmartDashboard”.
- „_SmartDashboard/Auto Selector_”: Include doar tabelul „SmartDashboard/Auto Selector”.
- „_limelight/tx,limelight/ty_”: Include doar câmpurile „limelight/tx” și „limelight/ty”.

## Limitări

:::warning

- Câmpurile sunt publicate la fiecare 20ms, astfel încât datele NetworkTables publicate inițial la o frecvență mai mare vor omite eșantioane.
- Marcajele de timp ale eșantioanelor publicate nu sunt păstrate. Acest lucru ar fi imposibil la derularea înainte și înapoi în timp sau la redarea la viteze diferite.
  :::
