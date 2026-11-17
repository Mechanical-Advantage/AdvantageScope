# Exportarea datelor de log {#exporting-log-data}

AdvantageScope include un sistem flexibil pentru exportul datelor de log sub formă de fișier CSV, WPILOG sau MCAP. Funcțiile de export funcționează atât la vizualizarea unui fișier log, cât și când ești conectat la o sursă de date în timp real. Printre cazurile posibile de utilizare se numără:

- Conversia unui fișier WPILOG în CSV sau MCAP pentru analiză în alte aplicații.
- Exportarea unui fișier WPILOG pe baza datelor NetworkTables, pentru acces ulterior.
- Salvarea unui fișier WPILOG cu un număr limitat de câmpuri (și valorile duplicate eliminate) pentru a reduce dimensiunea fișierului.

Pentru a vedea opțiunile de export, dă clic pe `Fișier` > `Exportă datele...`.

<img src="/img/overview/log-files/export-1.webp" alt="Opțiuni de export" />

_Interfața în limba engleză este ilustrată mai sus._

:::tip
Pe lângă exportul complet de log descris aici, fila 💬 [Consolă](/tab-reference/console) permite exportul datelor din consolă într-un fișier text.
:::

:::warning
**Exportarea datelor pentru SysId**

Nu recomandăm folosirea acestei funcționalități pentru a exporta date de log **generate în simulare** pentru utilizare în [SysId](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/system-identification/introduction.html), deoarece SysId necesită date suplimentare despre marcajele de timp incompatibile cu opțiunile implicite de export ale AdvantageScope. Reține că datele de log **generate _în afara_ simulării** pot fi exportate pentru utilizare în SysId cu o pierdere minimă de date (deși precizia maximă se obține folosind direct logul de date _original_ în SysId).

_Acest avertisment **nu se aplică** logurilor produse de AdvantageKit, care pot fi exportate fără pierderi de date selectând opțiunea „Cicluri AdvantageKit”. Consultă [această pagină](https://docs.advantagekit.org/data-flow/sysid-compatibility) pentru detalii._
:::

## Opțiuni {#options}

La export sunt disponibile următoarele opțiuni:

- **Format:** Setează formatul general al fișierului exportat. Consultă opțiunile de mai jos.
  - _CSV (tabel):_ Valori separate prin virgulă, unde fiecare rând reprezintă un marcaj de timp distinct și fiecare coloană reprezintă un câmp (plus o coloană pentru valoarea marcajului de timp). Fiecare rând poate reprezenta o valoare în mai multe câmpuri.
  - _CSV (listă):_ Valori separate prin virgulă, unde fiecare rând reprezintă o valoare într-un singur câmp, cu coloane pentru marcajul de timp, cheie și valoare.
  - _WPILOG:_ Fișier standard WPILOG care poate fi redeschis în AdvantageScope.
  - _MCAP:_ Fișier standard [MCAP](https://mcap.dev) care poate fi deschis în [Foxglove](https://foxglove.dev).
- **Marcaje de timp:** Doar pentru „CSV (tabel)”. Setează metoda de creare a rândurilor noi. Consultă opțiunile de mai jos.
  - _Toate modificările:_ Creează rânduri/intrări noi doar când valorile câmpurilor se actualizează. Minimizează dimensiunea fișierului exportat.
  - _Perioadă fixă:_ Creează rânduri/intrări noi la un interval fix, util pentru loguri fără sincronizare a marcajelor de timp (când multe câmpuri sunt înregistrate cu marcaje de timp similare, dar nu identice). Reține că toate valorile sunt incluse, indiferent dacă a existat o modificare între punctele de eșantionare.
  - _Cicluri AdvantageKit:_ Creează un rând nou / o intrare nouă pentru fiecare ciclu de buclă sincronizat AdvantageKit. Reține că toate valorile sunt incluse, indiferent dacă a existat o modificare între ciclurile de buclă.
- **Perioadă (ms):** Doar când este selectată opțiunea „Perioadă fixă”. Setează perioada în milisecunde între fiecare eșantion. De obicei, aceasta ar trebui să corespundă cu perioada ciclului de buclă al codului robotului.
- **Prefixuri:** Dacă este lăsat necompletat, include toate câmpurile. În caz contrar, include doar câmpurile care se potrivesc cu prefixurile furnizate (separate prin virgulă). Consultă exemplele de mai jos.
  - „_/DriverStation/Joystick0_”: Include toate câmpurile care încep cu „/DriverStation/Joystick0” (date de la primul joystick).
  - „_Flywheels,DS:enabled_”: Include toate câmpurile care încep cu „/Flywheels” sau „DS:enabled” (toate datele de la flywheel, plus starea activată a robotului).
  - „_Drive/LeftPosition,Drive/RightPosition_”: Include doar câmpurile „/Drive/LeftPosition” și „/Drive/RightPosition”.
- **Set de câmpuri:** Consultă opțiunile de mai jos. Câmpurile generate sunt create de AdvantageScope pentru a descompune tipurile complexe și sunt afișate cu text gri în bara laterală. Aceasta include componentele individuale ale array-urilor, struct-urilor și altor scheme.
  - _Inclusiv cele generate:_ Exportă toate câmpurile vizualizabile, ceea ce include câmpurile generate. Recomandat dacă datele exportate vor fi deschise într-o aplicație incapabilă să parseze tipuri complexe.
  - _Doar originale:_ Exportă doar câmpurile care au fost prezente în fișierul log original, ceea ce exclude câmpurile generate. Recomandat dacă datele exportate vor fi deschise în AdvantageScope sau într-o altă aplicație capabilă să parseze tipuri complexe.

Un exemplu de fișier CSV exportat din AdvantageScope este prezentat mai jos, în formatul „CSV (tabel)” cu marcajele de timp setate la „Toate modificările”:

<img src="/img/overview/log-files/export-2.webp" alt="Tabel CSV" />
