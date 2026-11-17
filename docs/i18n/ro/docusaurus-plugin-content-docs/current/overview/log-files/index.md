# 📂 Fișiere de log {#log-files}

## Formate suportate {#supported-formats}

- **WPILOG (.wpilog)** - Produs de [înregistrarea de date integrată](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) din WPILib și AdvantageKit. [URCL](/more-features/urcl) poate fi folosit pentru a captura semnale de la controllerele de motoare REV într-un fișier WPILOG.
- **Hoot (.hoot)** - Produs de [înregistratorul de semnale](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) Phoenix 6 de la CTRE.
- **REVLOG (.revlog)** - Produs de [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) de la REV Robotics.
- **Road Runner (.log)** - Produs de biblioteca [Road Runner](https://github.com/acmerobotics/road-runner) pentru FTC.
- **CSV (.csv)** - Valori separate prin virgulă, care corespund formatului [exportat](/overview/log-files/export) de AdvantageScope în modurile „CSV (tabel)” sau „CSV (listă)”. Consultă [secțiunea de mai jos](#csv-formatting) pentru detalii.
- **Loguri NI Driver Station (.dslog și .dsevents)** - Format vechi (legacy), produs de [FRC Driver Station](https://docs.wpilib.org/en/stable/docs/software/driverstation/driver-station.html) de la NI (2010-2026). AdvantageScope caută automat fișierul log corespunzător la deschiderea oricărui tip de log.
- **RLOG (.rlog)** - Format vechi (legacy), produs de AdvantageKit 2022.

:::info
Fișierele log Hoot pot fi deschise numai după ce ești de acord cu [acordul de licență pentru utilizatorul final](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt) de la CTRE. AdvantageScope afișează o fereastră de confirmare pentru acești termeni când deschizi un fișier log Hoot pentru prima dată.
:::

## Deschiderea logurilor {#opening-logs}

În bara de meniu, dă clic pe `Fișier` > `Deschidere log(uri)...`, apoi alege unul sau mai multe fișiere log de pe discul local. De asemenea, poți trage un fișier log din managerul de fișiere pe pictograma sau fereastra AdvantageScope pentru a-l deschide.

:::info
Dacă sunt deschise mai multe fișiere simultan, marcajele de timp vor fi aliniate automat. Acest lucru permite compararea ușoară a fișierelor log din mai multe surse. Consultă pagina despre [Marcaje de timp](/more-features/timestamps) pentru detalii despre opțiunile de afișare a marcajelor de timp.
:::

<img src="/img/overview/log-files/open-file-1.webp" alt="Deschiderea unui log salvat" />

_Mai sus este prezentată interfața în limba engleză._

## Adăugarea de loguri noi {#adding-new-logs}

După deschiderea unui fișier log, poți adăuga cu ușurință loguri suplimentare în vizualizare. Marcajele de timp vor fi realiniate automat pentru a se sincroniza cu datele existente.

În bara de meniu, dă clic pe `Fișier` > `Adaugă log(uri) noi...`, apoi alege unul sau mai multe fișiere log pentru a le adăuga la vizualizarea curentă. Câmpurile din fiecare log vor fi înregistrate în tabele denumite `Log0`, `Log1` etc.

## Descărcarea de pe robot {#downloading-from-the-robot}

<details>
<summary>Configurare</summary>

Deschide fereastra de preferințe dând clic pe `Aplicație` > `Afișează preferințele...` (Windows/Linux) sau `AdvantageScope` > `Setări...` (macOS). Actualizează adresa robotului și folderul de loguri.

<img src="/img/prefs_ro.webp" alt="Diagramă de preferințe" height="450" />
</details>

Dă clic pe `Fișier` > `Descărcare loguri...` pentru a deschide fereastra de descărcare. Descărcarea logurilor este suportată pe Systemcore și roboRIO. Odată conectat la robot, logurile disponibile sunt afișate cu cele mai noi în partea de sus. Selectează unul sau mai multe fișiere sau foldere de log de descărcat (shift-clic pentru a selecta un interval sau **cmd/ctrl + A** pentru a selecta tot). Apoi dă clic pe simbolul ↓ și selectează o locație de salvare.

:::tip
La descărcarea mai multor fișiere, AdvantageScope omite fișierele care există deja în folderul de destinație.
:::

<img src="/img/overview/log-files/open-file-2.webp" alt="Descărcarea fișierelor log" height="350" />

_Mai sus este prezentată interfața în limba engleză._

## Formatarea CSV {#csv-formatting}

Numele coloanelor CSV trebuie să fie fie „Timestamp, Key, Value”, fie „Timestamp, (Key), (Key), etc”. Valorile marcajelor de timp sunt în secunde. Lista de mai jos arată formatul așteptat al tipurilor comune de valori. Reține că exportul și reimportul datelor de log ca CSV este _cu pierderi_, deoarece CSV nu suportă tipuri complexe de câmpuri.

- **Booleene:** `true` sau `false`
- **Șiruri de caractere (Strings):** `"(valoare)"`
  - Exemplu: `"Salutare lume"`
- **Tablouri (Arrays):** `[(valoare); (valoare); (valoare)]`
  - Exemplu: `[1; 2; 3]`
- **Octeți (Bytes):** hexazecimal, separați prin `-`
  - Exemplu: `4d-41-36-33-32-38`
