# 🛜 Surse în timp real {#live-sources}

Toate vizualizările din AdvantageScope sunt concepute pentru a primi date în timp real de la un robot sau simulator, pe lângă fișierele log. Această secțiune descrie modul de conectare la sursele de date în timp real. AdvantageScope suportă următoarele surse de date live:

- **NetworkTables:** Acesta este protocolul principal de rețea al WPILib. Consultă [documentația WPILib](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html) pentru mai multe detalii.
- **NetworkTables (AdvantageKit):** Acest mod este conceput pentru codul de robot care rulează AdvantageKit și publică în tabelul `AdvantageKit` din NetworkTables.
- **Diagnostice Systemcore:** Acest mod se conectează la serverul NetworkTables integrat folosit de sistemul de operare Systemcore, care include date de diagnosticare precum starea robotului și I/O dispozitivelor.
- **Diagnostice Phoenix:** Acest mod folosește HTTP pentru a se conecta la un [server de diagnosticare](https://pro.docs.ctr-electronics.com/en/latest/docs/troubleshooting/running-diagnostics.html) Phoenix, permițând streamingul de date de la dispozitivele CTRE CAN cu [Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/). Este similar cu [funcția de reprezentare grafică](https://pro.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) din Phoenix Tuner. Consultă [această pagină](/overview/live-sources/phoenix-diagnostics) pentru mai multe informații.
- **Server RLOG:** Acest protocol este suportat de AdvantageKit ca alternativă la NetworkTables. Conexiunea este inițiată implicit pe portul 5800.
- **FTC Dashboard:** Acest mod se integrează cu roboții FTC care publică date în [FTC Dashboard](https://acmerobotics.github.io/ftc-dashboard).

:::info
AdvantageScope se poate conecta la FIRST Driver Station pentru a vizualiza date de diagnosticare atunci când rulează pe același dispozitiv cu aplicația DS. Nu este necesară nicio configurare (consultă instrucțiunile de mai jos).
:::

## Pornirea conexiunii {#starting-the-connection}

Pentru a porni conexiunea live, urmează acești pași:

- **Robot:** Dă clic pe `Fișier` > `Conectare la robot` > `Implicit` sau o sursă live specifică
- **Simulator:** Dă clic pe `Fișier` > `Conectare la simulator` > `Implicit` sau o sursă live specifică
- **Driver Station:** Dă clic pe `Fișier` > `Conectare la Driver Station`

Titlul ferestrei afișează adresa IP și textul „Se caută” până când ținta este conectată. AdvantageScope încearcă să se reconecteze automat folosind aceleași setări după o deconectare.

## Vizualizarea datelor live {#viewing-live-data}

Când este conectat la o sursă live, AdvantageScope blochează implicit toate filele la timpul curent. Vizualizările precum 📉 [Grafic liniar](/tab-reference/line-graph) și 🔢 [Tabel](/tab-reference/table) se derulează automat, iar vizualizările precum terenul și joystick-urile afișează valorile curente ale fiecărui câmp. Dacă dai clic pe butonul cu săgeată roșie din bara de navigare, poți comuta această blocare, permițând vizualizarea și reluarea datelor anterioare.

<img src="/img/overview/live-sources/open-live-1.webp" alt="Buton de blocare/deblocare live" />

:::tip
Derularea spre stânga în graficul liniar sau pe axa timpului deblochează timpul curent, iar derularea până la capăt în dreapta îl blochează din nou.
:::

## Configurare {#configuration}

Deschide fereastra de preferințe dând clic pe `Aplicație` > `Afișează preferințele...` (Windows/Linux) sau `AdvantageScope` > `Setări...` (macOS).

<img src="/img/prefs_ro.webp" alt="Diagramă de preferințe" height="450" />

### Adresă robot {#robot-address}

Introdu adresa robotului folosind un hostname (de ex. `robot.local`) sau o adresă IP (de ex. `10.TE.AM.2`), așa cum este descris în [documentația WPILib](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/ip-configurations.html#te-am-ip-notation). Când te conectezi la Systemcore prin USB sau prin punctul de acces Wi-Fi integrat, dă clic pe `Fișier` > `Utilizează adresa USB Systemcore`/`Utilizează adresa Wi-Fi Systemcore` pentru a folosi temporar adresa IP statică corectă.

### Mod live {#live-mode}

Când NetworkTables este folosit ca sursă live, poți selecta următoarele moduri live:

- **Lățime de bandă redusă (implicit):** AdvantageScope solicită date de la server doar pentru câmpurile care sunt utilizate activ. Datele publicate înainte ca un câmp să fie selectat nu vor fi disponibile. Acest mod este **puternic recomandat** când rulezi într-un mediu cu lățime de bandă de rețea limitată sau când este publicat un număr mare de câmpuri.
- **Înregistrare:** AdvantageScope solicită date pentru toate câmpurile, indiferent dacă sunt utilizate activ sau nu. Asta înseamnă că aceste câmpuri pot fi vizualizate retroactiv punând pe pauză fluxul de date live (vezi mai sus). Acest mod este adesea util în timpul dezvoltării, dar **NU ar trebui folosit când lățimea de bandă este limitată**.

### Renunțare la datele live {#discard-live-data}

În timpul unei conexiuni live, datele sunt stocate local pentru a permite reluarea datelor anterioare (consultă „Vizualizarea datelor live”). Pentru a evita un consum foarte mare de memorie, datele sunt șterse implicit după 20 de minute. Poți selecta o perioadă mai scurtă pentru a reduce utilizarea memoriei sau poți alege „Niciodată” pentru a păstra datele live pe termen nelimitat.
