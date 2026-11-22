---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🪐 Jurnalizare universală cu WPILOG

WPILOG este formatul deschis standard de jurnalizare folosit în întregul ecosistem WPILib. Cu AdvantageScope, WPILOG poate servi drept container universal pentru mai multe fișiere și formate de log. Aceasta înseamnă că un singur fișier `.wpilog` poate conține mai multe fluxuri de date codificate în orice format suportat de AdvantageScope, inclusiv CSV, loguri specifice producătorilor sau fișiere WPILOG suplimentare.

Această funcționalitate este concepută pentru a simplifica diagnosticarea prin colectarea **tuturor datelor de diagnosticare ale unui robot într-un singur fișier log universal**; nu mai este nevoie să descarci, să asociezi sau să sincronizezi mai multe fișiere log dintr-un singur meci, chiar și atunci când colectezi date de la biblioteci terțe sau servicii externe. De exemplu, un singur fișier WPILOG poate conține:

- Telemetrie standard a robotului publicată prin API-ul `Telemetry` din WPILib sau prin NetworkTables.
- Semnale de înaltă frecvență ale dispozitivelor înregistrate de bibliotecile producătorilor.
- Date de stare de la coprocesoare și servicii externe înregistrate în CSV sau WPILOG.
- ...și multe altele!

Toate aceste date apar într-un singur arbore unificat în AdvantageScope, așa cum se arată mai jos cu un WPILOG care conține semnale ale dispozitivelor capturate de mai mulți producători.

:::note
Pe Systemcore, [URCL](https://github.com/Mechanical-Advantage/URCL) a fost înlocuit de [status logger](https://docs.revrobotics.com/revlib/logs)-ul oficial de la REV. Jurnalizarea universală cu AdvantageScope permite status logger-ului oficial să înregistreze datele de la toate dispozitivele REV într-un singur fișier WPILOG (similar cu URCL).
:::

<img src="/img/more-features/universal-logging-1.webp" alt="Un fișier WPILOG care afișează mai multe loguri ale producătorilor în bara laterală." />

_Mai sus este prezentată interfața în limba engleză._

:::tip
Utilizatorii AdvantageKit pot profita și de compresia XZ pentru a reduce semnificativ dimensiunea logurilor terțe stocate într-un WPILOG. Consultă documentația AdvantageKit despre receptorii de date de log pentru detalii.
:::

## Experimental: Jurnalizarea producătorilor {#experimental-vendor-logging}

Multe proiecte de robot generează mai multe fișiere log simultan: un fișier WPILOG standard pentru telemetria WPILib/AdvantageKit alături de fișiere proprietare din bibliotecile producătorilor. Jurnalizarea universală elimină această separare prin încorporarea acelor loguri ale producătorilor direct în `.wpilog`-ul principal. Vezi instrucțiunile de mai jos pentru WPILib și AdvantageKit.

:::warning
Deoarece această abordare nu este suportată oficial de producători, solicitările de suport trebuie adresate pe [pagina de probleme](https://github.com/Mechanical-Advantage/AdvantageScope/issues) a AdvantageScope sau la software@team6328.org. Consultă [Exportarea datelor producătorilor](#exporting-vendor-data) pentru detalii despre exportarea fișierelor log originale pentru diagnosticare.
:::

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

Descarcă clasa [`VendorLogCapture.java`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.java) și plaseaz-o în proiectul tău de robot. Această clasă capturează automat datele din logurile producătorilor în `DataLog`-ul activ și trebuie configurată în constructorul `Robot` așa cum se arată mai jos. Trebuie să selectezi un director adecvat (recomandăm `/home/systemcore/logs/`) pentru stocarea temporară a logurilor producătorilor în timpul capturării. Consultă secțiunea [Cum funcționează](#how-it-works) pentru detalii.

```java
public Robot() {
  // Pornește DataLogManager din WPILib în mod normal
  DataLogManager.start();

  // Activează capturarea logurilor producătorilor dintr-un director temporar
  // Recomandăm stocarea temporară a logurilor producătorilor pe memoria internă
  // chiar și atunci când folosești o unitate USB (logurile producătorilor nu persistă după capturare)
  VendorLogCapture.start(DataLogManager.getLog(), "/home/systemcore/logs/");

  // Pornește logger-ul producătorului DUPĂ ce capturarea logurilor este activată
  // Dacă este configurabil, directorul de ieșire trebuie să coincidă cu calea de mai sus
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

Descarcă fișierele [`VendorLogCapture.hpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.hpp) și [`VendorLogCapture.cpp`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/VendorLogCapture.cpp) și plasează-le în proiectul tău de robot. Această clasă capturează automat datele din logurile producătorilor în `DataLog`-ul activ și trebuie configurată în constructorul `Robot` așa cum se arată mai jos. Trebuie să selectezi un director adecvat (recomandăm `/home/systemcore/logs/`) pentru stocarea temporară a logurilor producătorilor în timpul capturării. Consultă secțiunea [Cum funcționează](#how-it-works) pentru detalii.

```cpp
Robot::Robot() {
  // Pornește DataLogManager din WPILib în mod normal
  wpi::DataLogManager::Start();

  // Activează capturarea logurilor producătorilor dintr-un director temporar
  // Recomandăm stocarea temporară a logurilor producătorilor pe memoria internă
  // chiar și atunci când folosești o unitate USB (logurile producătorilor nu persistă după capturare)
  VendorLogCapture::Start(wpi::DataLogManager::GetLog(), "/home/systemcore/logs/");

  // Pornește logger-ul producătorului DUPĂ ce capturarea logurilor este activată
  // Dacă este configurabil, directorul de ieșire trebuie să coincidă cu calea de mai sus
  VendorLogger::SetPath("/home/systemcore/logs/");
  VendorLogger::Start();
}
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

Descarcă fișierul [`vendor_log_capture.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/vendor_log_capture.py) și plasează-l în proiectul tău de robot. Acest utilitar capturează automat datele din logurile producătorilor în `DataLog`-ul activ și trebuie configurat în `robotInit` așa cum se arată mai jos. Trebuie să selectezi un director adecvat (recomandăm `/home/systemcore/logs/`) pentru stocarea temporară a logurilor producătorilor în timpul capturării. Consultă secțiunea [Cum funcționează](#how-it-works) pentru detalii.

```python
class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # Pornește DataLogManager din WPILib în mod normal
        wpilib.DataLogManager.start()

        # Activează capturarea logurilor producătorilor dintr-un director temporar
        # Recomandăm stocarea temporară a logurilor producătorilor pe memoria internă
        # chiar și atunci când folosești o unitate USB (logurile producătorilor nu persistă după capturare)
        VendorLogCapture.start(wpilib.DataLogManager.get_log(), "/home/systemcore/logs/")

        # Pornește logger-ul producătorului DUPĂ ce capturarea logurilor este activată
        # Dacă este configurabil, directorul de ieșire trebuie să coincidă cu calea de mai sus
        VendorLogger.set_path("/home/systemcore/logs/")
        VendorLogger.start()
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit (În curând)">

Capturarea logurilor producătorilor este integrată în AdvantageKit și poate fi activată așa cum se arată mai jos. Trebuie să selectezi un director adecvat (recomandăm `/home/systemcore/logs/`) pentru stocarea temporară a logurilor producătorilor în timpul capturării. Consultă secțiunea [Cum funcționează](#how-it-works) pentru detalii.

```java
public Robot() {
  // Activează capturarea logurilor producătorilor dintr-un director temporar
  // Recomandăm stocarea temporară a logurilor producătorilor pe memoria internă
  // chiar și atunci când folosești o unitate USB (logurile producătorilor nu persistă după capturare)
  Logger.setVendorLogDirectory("/home/systemcore/logs/");

  // Pornește AdvantageKit în mod normal
  Logger.start();

  // Pornește logger-ul producătorului DUPĂ logger-ul AdvantageKit
  // Dacă este configurabil, directorul de ieșire trebuie să coincidă cu calea de mai sus
  VendorLogger.setPath("/home/systemcore/logs/");
  VendorLogger.start();
}
```

:::info
Indiferent de receptorii de date de log selectați, logurile producătorilor pot fi vizualizate doar prin descărcarea unui fișier WPILOG. Streamingul live nu este suportat din cauza structurii datelor de log capturate.
:::

</TabItem>
</Tabs>

Reține că unele logger-e ale producătorilor încep să scrie date _imediat_ când clasa dispozitivului corespunzător (de ex. `SparkMax`) este instanțiată. Recomandăm să aștepți până la sfârșitul constructorului `Robot` pentru a instanția obiectele hardware, astfel încât să te asiguri că logurile sunt capturate.

### Cum funcționează {#how-it-works}

1. **Capturare:** Programul robotului rulează jurnalizarea standard WPILib alături de logger-ele producătorilor. Un utilitar ușor citește periodic datele noi scrise de logger-ele producătorilor și împachetează blocurile brute direct în fluxul activ `DataLog`.
2. **Stocare:** Întregul log combinat este salvat într-un singur fișier `.wpilog` (de ex. pe o unitate flash USB conectată la Systemcore). Fișierele log temporare ale producătorilor create pe robot nu persistă între reporniri, evitând acumularea în stocare.
3. **Vizualizare:** Când AdvantageScope deschide `.wpilog`, descoperă automat orice intrări de log încorporate, decodifică conținutul lor și îmbină toate câmpurile în arborele din bara laterală alături de telemetria standard.
4. **Extragere:** Dacă trebuie să deschizi un log al unui producător pentru suport sau diagnosticare avansată, fișierele log originale ale producătorilor pot fi extrase fără pierderi din `.wpilog` așa cum este descris în [Exportarea datelor producătorilor](#exporting-vendor-data).

Datele de log externe sunt salvate în formatul WPILOG folosind o intrare brută al cărei șir de tip respectă convenția `log:<format>`. La analizarea unuia dintre aceste câmpuri, AdvantageScope concatenează toate înregistrările binare pentru acea intrare în ordine cronologică și decodifică payload-ul rezultat ca un log independent în formatul specificat. Semnalele decodificate sunt apoi îmbinate în arborele principal de câmpuri și sincronizate automat cu datele existente.

:::tip
Jurnalizarea universală cu WPILOG nu se limitează la logurile producătorilor; orice format de jurnalizare compatibil cu AdvantageScope poate fi încorporat într-un WPILOG folosind aceeași convenție.
:::

### Exportarea datelor producătorilor {#exporting-vendor-data}

Deși datele din logurile producătorilor pot fi explorate direct în AdvantageScope, uneori poate fi necesar să extragi logul original așa cum a fost produs de biblioteca originală (de ex. pentru inspecție în utilitare specifice producătorului).

Pentru a exporta un log secundar individual direct din AdvantageScope, dă clic dreapta pe intrarea logului secundar din bara laterală și selectează **Exportă logul original...**.

Pentru extragere în lot, poți folosi și scriptul Python [`extract_vendor_logs.py`](https://github.com/Mechanical-Advantage/AdvantageScope/blob/main/docs/snippets/extract_vendor_logs.py), care caută într-unul sau mai multe fișiere `.wpilog` sau `.wpilogxz` toate logurile integrate ale producătorilor și le exportă în fișiere separate:

```bash
pip3 install robotpy-wpiutil # Dependență necesară
python3 extract_vendor_logs.py path/to/source.wpilog
```
