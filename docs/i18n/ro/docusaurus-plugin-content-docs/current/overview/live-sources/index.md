# 🛜 Surse în timp real {#live-sources}

Toate vizualizările din AdvantageScope sunt concepute pentru a primi date în timp real de la un robot sau simulator, în plus față de fișierele de log. Această secțiune descrie modul de conectare la sursele de date în timp real. Următoarele surse de date live sunt suportate de AdvantageScope:

- **NetworkTables:** Acesta este protocolul principal de rețea al WPILib. Consultați [documentația WPILib](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html) pentru mai multe detalii.
- **NetworkTables (AdvantageKit):** Acest mod este conceput pentru utilizarea cu codul de robot care rulează AdvantageKit, care publică în tabelul `AdvantageKit` din NetworkTables.
- **Diagnostice Systemcore:** Acest mod se conectează la serverul NetworkTables integrat utilizat de sistemul de operare Systemcore, care include date de diagnosticare precum starea robotului și I/O dispozitivelor.
- **Diagnostice Phoenix:** Acest mod folosește HTTP pentru a se conecta la un [server de diagnosticare](https://pro.docs.ctr-electronics.com/en/latest/docs/troubleshooting/running-diagnostics.html) Phoenix, care permite streaming de date de la dispozitivele CTRE CAN cu [Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/). Acest lucru este similar cu [funcția de reprezentare grafică](https://pro.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) din Phoenix Tuner. Consultați [această pagină](/overview/live-sources/phoenix-diagnostics) pentru mai multe informații.
- **Server RLOG:** Acest protocol este suportat de AdvantageKit ca o alternativă la NetworkTables. Conexiunea este inițiată pe portul 5800 în mod implicit.
- **FTC Dashboard:** Acest mod se integrează cu roboții FTC care publică date în [FTC Dashboard](https://acmerobotics.github.io/ftc-dashboard).

:::info
AdvantageScope se poate conecta la Driver Station-ul FIRST pentru a vizualiza date de diagnosticare când rulează pe același dispozitiv cu aplicația DS. Nu este necesară nicio configurare (consultați instrucțiunile de mai jos).
:::

## Pornirea conexiunii {#starting-the-connection}

Pentru a porni conexiunea live, urmați acești pași:

- **Robot:** Dă clic pe `Fișier` > `Conectare la robot` > `Implicit` sau o sursă live specifică
- **Simulator:** Dă clic pe `Fișier` > `Conectare la simulator` > `Implicit` sau o sursă live specifică
- **Driver Station:** Dă clic pe `Fișier` > `Conectare la Driver Station`

Titlul ferestrei afișează adresa IP și textul „Se caută” până când ținta este conectată. AdvantageScope încearcă să se reconecteze automat folosind aceleași setări după o deconectare.

## Vizualizarea datelor live {#viewing-live-data}

Când este conectat la o sursă live, AdvantageScope blochează toate filele la timpul curent în mod implicit. Vizualizările precum 📉 [Grafic liniar](/tab-reference/line-graph) și 🔢 [Tabel](/tab-reference/table) se derulează automat, iar vizualizările precum terenul și joystick-urile afișează valorile curente ale fiecărui câmp. Dând clic pe butonul săgeată roșie din bara de navigare, se comută acest blocaj, permițând vizualizarea și reluarea datelor anterioare.

<img src="/img/overview/live-sources/open-live-1.webp" alt="Buton de blocare/deblocare live" />

:::tip
Derularea spre stânga în graficul liniar sau cronologie deblochează timpul curent, iar derularea până la capăt în dreapta blochează din nou timpul curent.
:::

## Configurare {#configuration}

Deschideți fereastra de preferințe dând clic pe `Aplicație` > `Afișează preferințele...` (Windows/Linux) sau `AdvantageScope` > `Setări...` (macOS).

<img src="/img/prefs_ro.webp" alt="Diagramă de preferințe" height="450" />

### Adresă robot {#robot-address}

Introduceți adresa robotului folosind un hostname (de ex. `robot.local`) sau o adresă IP (de ex. `10.TE.AM.2`), așa cum este descris în [documentația WPILib](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/ip-configurations.html#te-am-ip-notation). Când vă conectați la Systemcore prin USB sau prin punctul de acces Wi-Fi integrat, dați clic pe `Fișier` > `Utilizează adresa USB Systemcore`/`Utilizează adresa Wi-Fi Systemcore` pentru a utiliza temporar adresa IP statică corectă.

### Mod live {#live-mode}

Când NetworkTables este utilizat ca sursă live, pot fi selectate următoarele moduri live:

- **Lățime de bandă redusă (implicit):** AdvantageScope solicită date de la server doar pentru câmpurile care sunt utilizate activ. Datele publicate înainte ca un câmp să fie selectat nu vor fi disponibile. Acest mod este **puternic recomandat** când rulați într-un mediu cu lățime de bandă de rețea limitată sau când este publicat un număr mare de câmpuri.
- **Înregistrare:** AdvantageScope solicită date pentru toate câmpurile, indiferent dacă sunt utilizate activ sau nu. Aceasta înseamnă că câmpurile pot fi vizualizate retroactiv prin punerea pe pauză a fluxului de date live (consultați mai jos). Acest mod este adesea util în timpul dezvoltării, dar **NU ar trebui utilizat când lățimea de bandă este limitată**.

### Renunțare la datele live {#discard-live-data}

În timpul unei conexiuni live, datele sunt stocate local pentru a permite reluarea datelor anterioare (consultați „Vizualizarea datelor live” mai jos). Pentru a evita o utilizare foarte mare a memoriei, datele sunt șterse după 20 de minute în mod implicit. Poate fi selectată o perioadă mai scurtă pentru a reduce utilizarea memoriei sau poate fi selectat „Niciodată” pentru a stoca datele live nedefinit.
