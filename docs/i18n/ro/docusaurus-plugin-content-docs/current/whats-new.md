---
title: Ce este nou în 2027?
sidebar_position: 2
---

#

<img src="/img/whats-new/banner-2027-ltr-light.webp" className="light-only" />
<img src="/img/whats-new/banner-2027-ltr-dark.webp" className="dark-only" />

Versiunea 2027 a AdvantageScope este acum disponibilă, aducând suport complet pentru Systemcore alături de peste **100 de funcționalități și actualizări noi** în întreaga aplicație. Consultă [documentația de instalare](/overview/installation) și [jurnalul complet de modificări](https://github.com/Mechanical-Advantage/AdvantageScope/releases) pentru detalii. Această pagină evidențiază principalele adăugiri și îmbunătățiri din această versiune.

**Apreciem feedback-ul tău! Comentariile, solicitările de funcționalități și raportările de erori sunt binevenite pe [pagina de probleme](https://github.com/Mechanical-Advantage/AdvantageScope/issues).**

<img src="/img/screenshot-light.webp" className="light-only" />
<img src="/img/screenshot-dark.webp" className="dark-only" />

## 🍋‍🟩 Compatibilitate cu Systemcore {#systemcore-compatibility}

AdvantageScope 2027 este construit pentru o funcționare fluidă cu noul controller de robot Systemcore și WPILib 2027:

- Adresa implicită a robotului este acum `robot.local`, permițându-ți să te conectezi live sau să descarci loguri fără a configura un număr de echipă. Adresele USB și Wi-Fi ale Systemcore pot fi, de asemenea, selectate din bara de meniu.
- [Descărcarea logurilor](/overview/log-files#downloading-from-the-robot) suportă acum SFTP pentru Systemcore alături de descărcările clasice de loguri roboRIO.
- A fost adăugat sistemul de coordonate [Centru/roșu](/more-features/coordinate-systems#center-red) folosit de terenurile FRC începând cu 2027 și terenurile FTC începând cu 2027-2028.
- A fost adăugat suport pentru API-urile `Telemetry` și `Tunables` din WPILib 2027, culori de alertă actualizate și o nouă [preferință de afișare a marcajului de timp](/more-features/timestamps) pentru a menține marcajele de timp Systemcore ușor de citit.
- Un nou mod live [Diagnostice Systemcore](/overview/live-sources) se conectează direct la serverul NetworkTables integrat al Systemcore pentru a monitoriza starea robotului și I/O-ul hardware fără a necesita cod de utilizator.

## 💡 AdvantageScope Lite {#advantagescope-lite}

[AdvantageScope Lite](/more-features/advantagescope-lite) aduce instrumentele de vizualizare și analiză ale AdvantageScope direct în browserul tău web. Este accesibil atât din interfața web Systemcore, cât și din interiorul FIRST Driver Station, **fără a necesita instalare**.

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/lHsak9Mmx2M" title="Demonstrație AdvantageScope Lite" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 🎮 FIRST Driver Station {#first-driver-station}

AdvantageScope se integrează strâns cu noua [FIRST Driver Station](https://docs.wpilib.org/en/latest/docs/software/firstdriverstation) pentru a simplifica diagnosticarea meciurilor:

- [AdvantageScope Lite](/more-features/advantagescope-lite) este accesibil direct din meniul de setări al FIRST Driver Station pentru a analiza fișierele WPILOG produse de DS.
- Folosește aplicația desktop pentru a transmite în timp real starea meciului, metricile de comunicare, tensiunea bateriei și intrările de la joystick-uri dintr-un Driver Station local fără nicio configurare.
- Deschiderea unui fișier `.wpilog` al Driver Station pe desktop îți propune să deschizi o fereastră dedicată preconfigurată cu file pentru ieșirea din consolă, metrici de comunicare, alimentare, utilizare CPU și joystick-uri ([documentație](/overview/log-files#driver-station-layout)). Acest aranjament este folosit implicit și în AdvantageScope Lite pentru Driver Station.
- Vizualizează logurile de consolă ale Driver Station pe fila 💬 [Consolă](/tab-reference/console) cu evidențiere automată a avertismentelor/erorilor și suport complet pentru [secvențele escape ANSI](/tab-reference/console#ansi-formatting) (culori și stiluri de text).

<img src="/img/tutorials/taking-control-1.webp" alt="Deschiderea AdvantageScope Lite din FIRST Driver Station" />

_Mai sus este prezentată interfața în limba engleză._

## 🌐 Suport lingvistic {#language-support}

AdvantageScope este acum disponibil în **14 limbi** în aplicația desktop, site-ul de documentație, aplicațiile mobile și AdvantageScope Lite: engleză (SUA), spaniolă (America Latină), franceză, olandeză, portugheză (Brazilia), română, turcă, rusă, kazahă, ebraică, arabă, hindi, chineză simplificată și chineză tradițională.

:::info
Traducerile sunt un proces continuu realizat cu sprijinul inteligenței artificiale și al contribuitorilor din comunitate și **pot include formulări nenaturale sau inexactități**. Mulțumim echipelor care au ajutat deja la revizuirea și îmbunătățirea acestor traduceri! Consultă pagina 🌐 [Suport lingvistic](/overview/language-support) pentru detalii despre procesul nostru de traducere și cum poți trimite feedback.
:::

<img src="/img/whats-new/multi-language-1.webp" alt="Fila Grafic liniar în chineză simplificată" />

## 📖 Tutoriale și documentație noi {#new-tutorials-and-documentation}

Documentația a fost extinsă cu o nouă [serie de tutoriale](/category/tutorials) în trei părți, concepută pentru a ajuta echipele să înceapă cu WPILib 2027 și AdvantageScope:

1. **👋 [Salut, telemetrie!](/tutorials/hello-telemetry):** Configurarea `DataLogManager` și a API-ului `Telemetry`, conectarea live și analizarea datelor cu grafice liniare, tabele și statistici.
2. **🤖 [Pe teren: vizualizarea robotului](/tutorials/to-the-field):** Publicarea pose-urilor 2D/3D, a traiectoriilor și a obiectelor `Mechanism2d` pe terenurile FRC și FTC.
3. **🕹️ [Preluarea controlului: DS și joystick-uri](/tutorials/taking-control):** Transmiterea diagnosticelor live ale Driver Station, sincronizarea logurilor robotului și ale DS, vizualizarea ieșirii din consolă și vizualizarea intrărilor de la controllere.

Exemplele de cod din întreaga documentație au fost, de asemenea, actualizate cu acoperire completă pentru API-ul `Telemetry` al WPILib în mai multe limbaje de programare.

<img src="/img/tutorials/to-the-field-4.webp" alt="Vizualizare teren 3D din tutorialul Pe teren" />

_Mai sus este prezentată interfața în limba engleză._

## 📱 AdvantageTune {#advantagetune}

AdvantageTune este o nouă aplicație independentă pentru iPhone și iPad care oferă o experiență ușoară de ajustare mobilă pentru a completa AdvantageScope. Poți vizualiza și modifica topicuri [NetworkTables](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html) live (inclusiv primitive, tablouri, structuri WPILib și Protobuf-uri) direct de pe telefon, făcând ușor pentru toată lumea să participe la ajustarea codului robotului.

Atât AdvantageTune, cât și AdvantageScope simplifică procesul de exportare a valorilor ajustate înapoi în codul robotului, cu butoane pentru a salva toate valorile ajustate într-un fișier text pentru partajare ușoară ([documentație](/overview/live-sources/tuning-mode)).

[<img src="/img/app-store_ro.svg" alt="App Store" />](https://apps.apple.com/ro/app/advantagetune/id6811453643?l=ro)

<div className="image-gallery">
  <img src="/img/whats-new/advantagetune-1.webp" alt="Vizualizare de navigare AdvantageTune" />
  <img src="/img/whats-new/advantagetune-2.webp" alt="Editare topicuri în AdvantageTune" />
  <img src="/img/whats-new/advantagetune-3.webp" alt="Editare structuri în AdvantageTune" />
  <img src="/img/whats-new/advantagetune-4.webp" alt="Lista valorilor ajustate în AdvantageTune" />
  <img src="/img/whats-new/advantagetune-5.webp" alt="Căutare și filtrare în AdvantageTune" />
</div>

_Mai sus este prezentată interfața în limba engleză._

## 🪐 Jurnalizare universală WPILOG {#wpilog-universal-logging}

Cu [jurnalizarea universală](/more-features/universal-logging), un singur fișier WPILOG poate servi acum drept container universal pentru mai multe fluxuri și formate de log, inclusiv loguri ale dispozitivelor specifice producătorilor, date CSV și fișiere WPILOG secundare. Jurnalizarea universală înlocuiește URCL cu o abordare flexibilă, independentă de producător: datele din fiecare sursă sunt sincronizate automat și îmbinate într-un singur arbore unificat în bara laterală. Consultă [documentația de jurnalizare universală](/more-features/universal-logging#experimental-vendor-logging) pentru detalii despre capturarea logurilor producătorilor în AdvantageKit și WPILib (în curând).

<img src="/img/more-features/universal-logging-1.webp" alt="Un fișier WPILOG care afișează mai multe loguri ale producătorilor în bara laterală" />

_Mai sus este prezentată interfața în limba engleză._

## 🗺️ Îmbunătățiri ale filelor de teren {#field-tab-improvements}

Câteva îmbunătățiri de utilizare au fost adăugate filelor 🗺️ [Teren 2D](/tab-reference/2d-field) și 👀 [Teren 3D](/tab-reference/3d-field):

- Deplasează și fă zoom pe terenul 2D sau dă clic dreapta pentru a bloca camera să urmărească poziția și rotația robotului ([documentație](/tab-reference/2d-field#camera-controls)).
- A fost adăugată o opțiune pentru estomparea fantomelor 2D și 3D atunci când câmpurile nu s-au actualizat recent (util pentru randarea pose-urilor de viziune).
- Au fost adăugate linii de grilă pentru plăcile terenurilor FTC 2D și 3D pentru o referință spațială mai ușoară.
- AdvantageScope reține acum dacă a fost folosit ultima dată un teren FRC sau FTC la deschiderea de noi file de teren 2D sau 3D.

<img src="/img/tab-reference/2d-field-1.webp" alt="Prezentare generală a filei Teren 2D" />

_Mai sus este prezentată interfața în limba engleză._

## 📉 Îmbunătățiri ale graficului liniar {#line-graph-improvements}

📉 [Graficul liniar](/tab-reference/line-graph) și axa timpului includ câteva rafinări vizuale pentru o analiză mai clară:

- Activarea „Afișează modul robotului” afișează acum o bară codificată pe culori pentru perioadele autonom, teleoperat, utilitar și dezactivat.
- Graficele de tip puncte scalează automat dimensiunea punctelor pentru o vizibilitate mai bună la orice nivel de zoom.
- Sugestii utile apar pe graficul liniar și pe axa timpului pentru a ghida utilizatorii noi privind gesturile de derulare și zoom.
- S-au îmbunătățit randarea și lizibilitatea valorilor mari ale marcajelor de timp pe axa timpului și pe axele graficului liniar.

<img src="/img/tab-reference/line-graph/line-graph-3.webp" alt="Suprapunerea modului robotului codificată pe culori pe graficul liniar" />

_Mai sus este prezentată interfața în limba engleză._

## 🤝 Îmbunătățiri de accesibilitate {#accessibility-enhancements}

AdvantageScope 2027 include câteva actualizări pentru a face aplicația mai accesibilă:

- Au fost adăugate navigarea cu tasta Tab pentru toate câmpurile de intrare și sugestii descriptive (tooltips) pentru toate controalele din aplicație.
- AdvantageScope respectă acum setările sistemului de operare pentru „reducerea transparenței” și „reducerea mișcării”.
- Indicatorii booleeni din bara laterală disting acum stările fără a se baza exclusiv pe culoare.

## 🥔 Tipuri noi de unități {#new-unit-types}

[Graficele bazate pe unități](/tab-reference/line-graph/units) din AdvantageScope au fost extinse cu tipuri suplimentare de unități și opțiuni de analiză:

- Putere (wați, cai putere etc.)
- Rapoarte (adimensional, procent)
- Temperatură în Kelvin
- Energie de cartof
- Ortografii ale unităților în engleza britanică (de ex. `metres`)
- Sufixe pentru biblioteca de unități a WPILib

## 🧱 Îmbunătățiri de stabilitate {#stability-improvements}

Această versiune include numeroase remedieri de erori, optimizări de performanță și îmbunătățiri de stabilitate în întreaga aplicație. Lista completă poate fi găsită în [jurnalul de modificări](https://github.com/Mechanical-Advantage/AdvantageScope/releases), cu câteva puncte importante mai jos:

- Versiunile oficiale pentru Windows sunt acum semnate digital, reducând frecvența avertismentelor SmartScreen în timpul instalării.
- Performanța de încărcare și trasare a logurilor a fost îmbunătățită semnificativ, în special la lucrul cu loguri Hoot (`.hoot`) și tablouri mari de structuri.
- A fost remediată gestionarea marcajelor de timp la vizualizarea logurilor AdvantageKit împreună cu surse de date de înaltă frecvență.
- A fost îmbunătățit algoritmul de sincronizare a marcajelor de timp pentru mai multe loguri la alinierea logurilor din surse multiple.
- A fost îmbunătățită fiabilitatea conexiunii pentru [Diagnostice Phoenix](/overview/live-sources/phoenix-diagnostics).
- Au fost remediate problemele de interfață cu bara de meniu pe ferestrele detașate și fereastra pop-up de înregistrare în [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- Textele și formulările din interfață au fost rafinate în întreaga aplicație pentru mai multă claritate.
