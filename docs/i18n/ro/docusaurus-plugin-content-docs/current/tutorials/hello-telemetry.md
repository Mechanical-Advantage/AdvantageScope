---
sidebar_position: 1
---

# 👋 Salut, telemetrie!

Bine ai venit în AdvantageScope! Telemetria și jurnalizarea datelor sunt capabilități puternice care îți pot îmbunătăți capacitatea de a înțelege codul robotului, de a diagnostica problemele și de a implementa soluții pe teren și în afara lui. Aceste tutoriale sunt concepute să te ajute să începi cu telemetria, astfel încât să poți profita de toate capabilitățile AdvantageScope.

În acest tutorial vei învăța cum să:

- Configurezi telemetria de bază a robotului într-un proiect Java WPILib.
- Te conectezi la fluxurile de date live în AdvantageScope.
- Înregistrezi date în fișiere log pentru acces ulterior.
- Vizualizezi datele de telemetrie folosind AdvantageScope.

:::tip Cauți altceva?

- **Echipe FTC:** Dacă folosești sistemul de control existent FIRST Tech Challenge, consultă ghidul ✴️ [Compatibilitate FTC](/more-features/ftc-compatibility).
- **Interfață web:** O versiune de AdvantageScope pentru browser este disponibilă direct în FIRST Driver Station și în interfața web Systemcore. Consultă 💡 [AdvantageScope Lite](/more-features/advantagescope-lite) pentru detalii.
- **AdvantageKit:** Un framework avansat de jurnalizare conceput pentru reluare deterministă în simulare. Consultă [documentația](https://docs.advantagekit.org) pentru detalii. Recomandăm să începi cu API-ul de telemetrie integrat al WPILib, descris mai jos.
  :::

## 1. Creează un proiect WPILib nou

Pentru a începe, creează un proiect Java WPILib nou în VS Code:

1. Deschide VS Code.
2. Dă clic pe pictograma WPILib din dreapta sus (sau apasă `Ctrl+Shift+P` / `Cmd+Shift+P` și tastează **WPILib: Create a new project**).
3. Selectează **Template** > **Java** > **Command v3 Robot** (sau **Command v2 Robot**).
4. Alege un folder, denumește proiectul (de ex. `HelloTelemetry`) și introdu numărul echipei tale.
5. Bifează **Enable Desktop Support** și dă clic pe **Create Project**.

<img src="/img/tutorials/hello-telemetry-1.webp" alt="Crearea unui proiect Java WPILib nou în VS Code folosind WPILib Project Creator." />

_Mai sus este prezentată interfața în limba engleză._

## 2. Inițializează înregistrarea datelor

WPILib oferă înregistrare de date integrată prin `DataLogManager`. Când este pornit, înregistrează automat toată telemetria, intrările NetworkTables și intrările Driver Station în fișiere `.wpilog`.

:::info Recomandare
Deși logurile pot fi salvate în memoria internă a Systemcore, memoria flash internă este limitată. Recomandăm cu tărie să conectezi o **unitate flash USB standard formatată FAT32** într-unul dintre porturile USB ale Systemcore. `DataLogManager` va detecta unitatea și va scrie automat toate logurile direct pe unitatea USB.
:::

Deschide `src/main/java/first/robot/Robot.java` și inițializează `DataLogManager` în constructorul `Robot()`:

```java
public class Robot extends OpModeRobot {
  // ...

  public Robot() {
    // Pornește DataLogManager pentru a înregistra toată telemetria într-un fișier .wpilog pe stick-ul USB
    DataLogManager.start();

    // Înregistrează și datele Driver Station (joystick-uri, OpMode, stare de activare)
    DriverStation.startDataLog(DataLogManager.getLog());
  }

  // ...
}
```

## 3. Publică date de telemetrie

Clasa `Telemetry` din WPILib îți permite să publici date cu o singură linie de cod, organizând câmpurile în tabele ierarhice. Acest API suportă o gamă largă de tipuri de date, inclusiv valori numerice, booleene, șiruri de caractere, tablouri și [tipuri geometrice](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/geometry/index.html) din WPILib.

:::info
Clasa `Telemetry` din WPILib este diferită de clasa `Telemetry` din SDK-ul FTC. Clasa `Telemetry` din WPILib trimite informații din programul robotului către tablouri de bord, instrumente de depanare sau fișiere log. Pentru a actualiza afișajul integrat al Driver Station, folosește clasa `DriverStationDisplay` din WPILib.
:::

Actualizează `src/main/java/first/robot/ExampleTeleop.java`:

```java
@Teleop
public class ExampleTeleop implements OpMode {
  // ...

  @Override
  public void periodic() {
    double currentTime = Timer.getTimestamp();
    double sineWave = Math.sin(currentTime * 2.0);

    // Publică valori de telemetrie folosind API-ul Telemetry
    Telemetry.log("Time", currentTime);
    Telemetry.log("SineWave/Value", sineWave);
    Telemetry.log("SineWave/Low", sineWave < 0.5);
  }
}
```

Încarcă codul pe robot (sau rulează `WPILib: Simulate Robot Code` din VS Code). În simulare, dă clic pe `Teleoperated` > `ExampleTeleop` > `Enable`.

<img src="/img/tutorials/hello-telemetry-2.webp" alt="Activarea OpMode-ului ExampleTeleop în interfața simulatorului." height="200" />

_Mai sus este prezentată interfața în limba engleză._

:::tip
Datele noi de telemetrie sunt publicate doar atunci când este apelat `Telemetry.log`. Metodele periodice din clasa `Robot`, OpMode-uri, subsisteme și mecanisme pot fi active în condiții diferite; verifică cu atenție documentația API atunci când decizi unde să plasezi apelurile de jurnalizare.
:::

## 4. Conectează AdvantageScope live

Lansează aplicația desktop AdvantageScope. În meniul de sus, selectează `Fișier` > `Conectează-te la robot` > `NetworkTables` (sau `Fișier` > `Conectează-te la simulator` dacă simulezi). Odată conectat, bara laterală din stânga se va popula cu câmpurile publicate sub `NT:/Telemetry`.

:::tip Comenzi rapide de la tastatură
Apasă `Ctrl+K` / `Cmd+K` pentru a te conecta rapid la robot, sau `Ctrl+Shift+K` / `Cmd+Shift+K` pentru a te conecta la simulator.
:::

<img src="/img/tutorials/hello-telemetry-3.webp" alt="AdvantageScope conectat la fluxul live al robotului cu câmpurile afișate în arborele din bara laterală." />

_Mai sus este prezentată interfața în limba engleză._

## 5. Vizualizează datele de telemetrie

### Grafic liniar

📉 [Graficul liniar](/tab-reference/line-graph) este fila implicită în AdvantageScope și oferă trasare în timp real a valorilor numerice și discrete.

1. Uită-te în bara laterală din stânga sub `Telemetry` > `SineWave`.
2. Trage `Value` în zona „Axa stângă” din panoul de control.
3. Trage `Low` în zona „Câmpuri discrete” din panoul de control.
4. Dă clic pe cele trei puncte de lângă „Câmpuri discrete” și apoi pe „Afișează modul robotului”.

Vei vedea unda sinusoidală și starea robotului actualizându-se în timp real pe măsură ce sosesc datele!

:::info Interacțiunea cu graficul

- **Pauză / Derulare:** Derulează orizontal sau dă clic și trage pe grafic pentru a vedea datele anterioare. Săgeata roșie din dreapta sus indică faptul că derularea automată live este pusă pe pauză. Dă clic pe săgeată sau apasă `L` pentru a comuta derularea automată live.
- **Zoom:** Derulează sus/jos peste grafic sau ține apăsat `Shift` în timp ce tragi pentru a face zoom pe o fereastră de timp specifică.
- **Inspectarea valorilor:** Dă clic oriunde pe grafic pentru a plasa un cursor de timp și a vedea valorile exacte în legendă.
  :::

<img src="/img/tutorials/hello-telemetry-4.webp" alt="Grafic liniar care trasează semnalul sinusoidal." />

_Mai sus este prezentată interfața în limba engleză._

### Tabel

Fila 🔢 [Tabel](/tab-reference/table) afișează o foaie de calcul cronologică a schimbărilor de stare și valoare, ideală pentru diagnosticarea tranzițiilor și a secvențelor de evenimente.

1. Dă clic pe butonul **+** din bara de file de sus și alege **Tabel**.
2. Din bara laterală, trage `NT:/Telemetry/SineWave/Value` și `NT:/Telemetry/Low` în vizualizarea de tabel.
3. Un rând nou este adăugat automat ori de câte ori orice câmp afișat își schimbă valoarea.
4. Dă clic pe orice rând pentru a sări imediat cu toate filele deschise la acel moment exact în timp!

:::tip
Filele pot fi rearanjate și redenumite din bara de file. Dă clic pe butonul de fereastră din bara de titlu pentru a deschide o filă într-o fereastră separată și a vizualiza mai multe file una lângă alta.
:::

<img src="/img/tutorials/hello-telemetry-5.webp" alt="Fila Tabel afișând datele undei sinusoidale." />

_Mai sus este prezentată interfața în limba engleză._

### Statistici

Fila 📊 [Statistici](/tab-reference/statistics) afișează o histogramă a valorilor numerice, oferind o privire detaliată asupra datelor din unul sau mai multe câmpuri.

1. Dă clic pe butonul **+** din bara de file de sus și alege **Statistici**.
2. Din bara laterală, trage `NT:/Telemetry/SineWave/Value` în secțiunea „Măsurători”.
3. Setează „Interval date” la `-1` și `1`, și setează „Dimensiune pas” la `0,1`.
4. Vizualizează datele folosind histograma și statisticile sumare.
5. Derulează axa timpului din partea de sus pentru a ajusta intervalul de date inclus.

<img src="/img/tutorials/hello-telemetry-6.webp" alt="Fila Statistici afișând datele undei sinusoidale." />

_Mai sus este prezentată interfața în limba engleză._

## 6. Descarcă și deschide fișiere log

După testare sau după un meci, poți descărca fișierele `.wpilog` de pe robot pentru a analiza datele ulterior:

1. În bara de meniu, selectează `Fișier` > `Descarcă loguri...`.
2. AdvantageScope se conectează la robot și afișează toate fișierele log înregistrate (cele mai noi în partea de sus).
3. Selectează fișierul (fișierele) log pe care dorești să le inspectezi, dă clic pe pictograma de descărcare (↓) și alege un folder pe computer.
4. Deschide fișierul descărcat folosind `Fișier` > `Deschide log(uri)...` sau trăgând fișierul `.wpilog` direct în AdvantageScope.

<img src="/img/overview/log-files/open-file-2.webp" alt="Fereastra de descărcare care afișează fișierele WPILOG disponibile pe stocarea robotului." height="350" />

_Mai sus este prezentată interfața în limba engleză._

## Ce urmează?

Acum că ai telemetria de bază și jurnalizarea funcționale, du vizualizarea la nivelul următor:

- **🤖 [Pe teren: vizualizarea robotului](/tutorials/to-the-field):** Învață cum să vizualizezi pozițiile 2D/3D ale robotului, traiectoriile și mecanismele pe modele de teren FRC și FTC.
- **[Prezentare generală](/category/overview):** Un ghid complet despre gestionarea fișierelor, comenzile rapide de navigare și opțiunile de streaming live.
- **[Suport pentru unități](/tab-reference/line-graph/units):** Cum să integrezi metadate de unități în logurile tale pentru o vizualizare mai precisă.
- **💬 [Consolă](/tab-reference/console):** Vizualizează logurile de text salvate de `DataLogManager` din WPILib.
- **🔍 [Metadate](/tab-reference/metadata):** Salvează informații suplimentare pentru a identifica și clasifica fișierele log.
- **[Epilogue](https://docs.wpilib.org/en/stable/docs/software/telemetry/robot-telemetry-with-annotations.html):** Înregistrează telemetrie în Java folosind adnotări.
