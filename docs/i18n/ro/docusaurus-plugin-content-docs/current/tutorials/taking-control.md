---
sidebar_position: 3
---

# 🕹️ Preluarea controlului: DS și joystick-uri

Înțelegerea intrărilor de la driver și a stării comunicației este esențială la depanarea problemelor de pe teren. AdvantageScope oferă integrare perfectă cu [FIRST Driver Station](https://docs.wpilib.org/en/latest/docs/software/firstdriverstation), permițându-ți să monitorizezi diagnosticele live, să inspectezi logurile Driver Station și să vizualizezi intrările de la controllere.

În acest tutorial vei învăța cum să:

- Accesezi AdvantageScope direct din **FIRST Driver Station**.
- Te conectezi la diagnosticele live ale Driver Station.
- Compari și sincronizezi **logurile de pe robot** cu **logurile Driver Station**.
- Vizualizezi ieșirea din consolă și mesajele de eroare în fila **💬 Consolă**.
- Vizualizezi intrările joystick-urilor și aranjamentele controllerelor în fila **🎮 Joystick-uri**.

## 1. Accesarea AdvantageScope din FIRST Driver Station

💡 [AdvantageScope Lite](/more-features/advantagescope-lite) este integrat direct în FIRST Driver Station. Poate fi accesat dând clic pe pictograma ⚙️ și apoi pe „Open Log Viewer in Browser”.

<img src="/img/tutorials/taking-control-1.webp" alt="Butonul „Open Log Viewer In Browser” din FIRST Driver Station" />

_Mai sus este prezentată interfața în limba engleză._

## 2. Conectarea live la Driver Station

Când rulează pe același laptop ca FIRST Driver Station, aplicația desktop AdvantageScope poate transmite, de asemenea, telemetrie și diagnostice live despre starea Driver Station:

1. Lansează atât FIRST Driver Station, cât și AdvantageScope.
2. În meniul de sus, selectează `Fișier` > `Conectează-te la Driver Station`.
3. AdvantageScope se va conecta la serviciul local Driver Station pentru a transmite în timp real starea meciului, tensiunea bateriei, stările joystick-urilor etc.
4. Deschide fila 📉 [Grafic liniar](/tab-reference/line-graph) sau 🔢 [Tabel](/tab-reference/table) pentru a vizualiza diagnosticele live ale DS.

:::tip
Poți folosi și comanda rapidă de la tastatură `Ctrl+Option+Shift+K` (macOS) sau `Ctrl+Alt+Shift+K` (Windows/Linux) pentru a te conecta rapid la Driver Station ca sursă live.
:::

## 3. Logurile Driver Station vs. logurile de pe robot

Când diagnostichezi comportamentul robotului după un meci sau o sesiune de antrenament, există două tipuri principale de loguri de luat în considerare:

| Tip de log                | Sursă                            | Date înregistrate                                                                                                                                                                          |
| :------------------------ | :------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loguri de pe robot**    | Systemcore prin `DataLogManager` | Telemetrie de înaltă frecvență (50+ Hz), starea robotului, starea joystick-urilor, măsurători ale senzorilor, curenți ai motoarelor, stări PID, estimări de pose și date ale mecanismelor. |
| **Loguri Driver Station** | Laptopul Driver Station          | Timp dus-întors în rețea (latență), % pierdere de pachete, ping radio, tensiune baterie, % CPU controller robot, date consolă, starea robotului și starea joystick-urilor.                 |

:::important Logurile de pe robot sunt în general preferate
Deoarece **logurile de pe robot** înregistrează telemetrie bogată și de înaltă frecvență direct la sursă, acestea sunt în general preferate pentru investigarea comportamentului robotului, a buclelor de control și a traseelor autonome. Totuși, **logurile DS** surprind evenimente externe critice de rețea și de meci pe care robotul nu le poate măsura singur.

Datele joystick-urilor sunt capturate în **ambele loguri**, așa cum se arată [mai jos](#6-visualizing-joysticks).
:::

## 4. Îmbinarea și sincronizarea mai multor loguri

AdvantageScope îți permite să deschizi și să sincronizezi loguri din mai multe surse pe o singură axă a timpului:

1. Deschide fișierul log de pe robot folosind `Fișier` > `Deschide log(uri)...` (sau trage fișierul `.wpilog` direct în AdvantageScope).
2. În bara de meniu, selectează `Fișier` > `Adaugă log(uri) noi...` și selectează logul Driver Station corespunzător.
3. AdvantageScope va alinia automat ambele loguri pe o axă a timpului sincronizată! Câmpurile din fiecare log sunt organizate în tabele distincte (de ex. `Log0` și `Log1`).
4. Acum poți suprapune telemetria de pe robot (cum ar fi curentul motorului sau estimările de pose) direct peste semnalele Driver Station (cum ar fi pierderea de pachete sau tensiunea bateriei) în 📉 [Graficul liniar](/tab-reference/line-graph) pentru a vedea dacă un comportament neașteptat al robotului a coincis cu o cădere a radioului sau o scădere de tensiune (brownout).

<img src="/img/overview/log-files/open-file-1.webp" alt="Deschiderea fișierelor log salvate în AdvantageScope." />

_Mai sus este prezentată interfața în limba engleză._

## 5. Vizualizarea datelor din consolă

Fila 💬 [Consolă](/tab-reference/console) îți permite să vizualizezi ieșirea text și logurile de erori afișate de robot sau de Driver Station. Datele de consolă pot fi salvate în oricare dintre fișierele log:

- **Loguri de pe robot:** `DataLogManager` din WPILib înregistrează automat ieșirea din consolă a robotului.
- **Loguri Driver Station:** În DS, ieșirea din consolă și mesajele de evenimente de sistem sunt salvate în câmpul `DS:/Dscomm/Console`.

Pentru a vizualiza datele din consolă:

1. Dă clic pe butonul **+** din bara de file și selectează **Consolă**.
2. Din bara laterală, trage câmpul de consolă (`DS:/Dscomm/Console` sau `messages`) în vizualizarea principală.
3. Fiecare rând reprezintă un mesaj de log cu marcajul său de timp. Dă clic pe orice mesaj pentru a sări cu axa timpului sincronizată în toate filele deschise la acel moment exact!
4. Folosește caseta „Filtru” (sau apasă `Ctrl+F` / `Cmd+F`) pentru a căuta mesaje specifice sau dă clic pe pictograma paletă de culori pentru a comuta evidențierea avertismentelor și erorilor.

<img src="/img/tab-reference/console-1.webp" alt="Fila Consolă afișând mesaje de log." />

_Mai sus este prezentată interfața în limba engleză._

## 6. Vizualizarea joystick-urilor {#6-visualizing-joysticks}

Fila 🎮 [Joystick-uri](/tab-reference/joysticks) oferă o reprezentare vizuală în timp real pentru până la 6 controllere de joc, afișând mișcările axelor, triggerele, POV-urile și apăsările de butoane pe aranjamente realiste de controllere. Pentru a te asigura că intrările joystick-urilor sunt înregistrate în fișierul log al robotului, inițializează `DriverStation.startDataLog()` în constructorul `Robot` alături de `DataLogManager`, așa cum este prezentat în 👋 [Salut, telemetrie!](/tutorials/hello-telemetry).

1. Dă clic pe butonul **+** din bara de file de sus și selectează **Joystick-uri**.
2. În tabelul din partea de jos a filei, asociază fiecare ID de joystick (de la 0 la 5) cu aranjamentul corespunzător (de ex. **Controller Xbox**, **Controller PS4** sau **Joystick generic**).
3. Pe măsură ce derulezi un fișier log sau transmiți date live de la Driver Station, butoanele se vor aprinde și stick-urile analogice se vor mișca sincronizat cu acțiunile driverului!

<img src="/img/tab-reference/joysticks-1.webp" alt="Fila Joystick-uri afișând apăsările active ale butoanelor și pozițiile stick-urilor analogice." />

_Mai sus este prezentată interfața în limba engleză._

## Ce urmează?

Felicitări! Ai finalizat seria principală de tutoriale AdvantageScope. Acum știi cum să:

- Configurezi telemetria, să te conectezi la fluxuri live și să vizualizezi grafice/tabele în **👋 [Salut, telemetrie!](/tutorials/hello-telemetry)**.
- Vizualizezi odometria 2D/3D, traiectoriile și mecanismele în **🤖 [Pe teren](/tutorials/to-the-field)**.
- Transmiți diagnosticele Driver Station, să îmbini loguri din surse multiple și să redai intrările joystick-urilor în **🕹️ [Preluarea controlului](/tutorials/taking-control)**.

Continuă să explorezi instrumentele și funcționalitățile avansate ale AdvantageScope:

- **📂 [Fișiere de log](/overview/log-files):** Află despre formatele de log suportate, exportarea datelor și descărcările în lot.
- **🛜 [Surse în timp real](/overview/live-sources):** Ghid detaliat despre conectarea la surse live, inclusiv modul de ajustare.
- **[Referință file](/category/tab-reference):** Ghiduri de referință privind funcționalitățile fiecărui tip de vizualizare.
- **[Alte funcționalități](/category/more-features):** Documentație și teorie despre funcționalitățile suplimentare ale AdvantageScope.
