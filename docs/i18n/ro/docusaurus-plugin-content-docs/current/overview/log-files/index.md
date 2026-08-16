# 📂 Fișiere de log {#log-files}

## Formate suportate {#supported-formats}

- **WPILOG (.wpilog)** - Produs de [înregistrarea de date integrată](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) din WPILib și AdvantageKit. [URCL](/more-features/urcl) poate fi utilizat pentru a captura semnale de la motoarele REV într-un fișier WPILOG.
- **Hoot (.hoot)** - Produs de [înregistratorul de semnale](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) Phoenix 6 de la CTRE.
- **REVLOG (.revlog)** - Produs de [`StatusLogger`](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger) de la REV Robotics.
- **Road Runner (.log)** - Produs de biblioteca [Road Runner](https://github.com/acmerobotics/road-runner) pentru FTC.
- **CSV (.csv)** - Valori separate prin virgulă, care se potrivesc cu formatul [exportat](/overview/log-files/export) de AdvantageScope în modurile „CSV (tabel)” sau „CSV (listă)”. Consultați [aici](#csv-formatting) pentru detalii.
- **Loguri NI Driver Station (.dslog și .dsevents)** - Moștenit, produse de [FRC Driver Station](https://docs.wpilib.org/en/stable/docs/software/driverstation/driver-station.html) de la NI (2010-2026). AdvantageScope caută automat fișierul log corespunzător la deschiderea oricărui tip de log.
- **RLOG (.rlog)** - Moștenit, produs de AdvantageKit 2022.

:::info
Fișierele log Hoot pot fi deschise numai după ce sunteți de acord cu [acordul de licență pentru utilizatorul final](https://raw.githubusercontent.com/CrossTheRoadElec/Phoenix-Releases/refs/heads/master/CTRE_LICENSE.txt) de la CTRE. AdvantageScope afișează o solicitare pentru a confirma acordul cu acești termeni când deschideți un fișier log Hoot pentru prima dată.
:::

## Deschiderea logurilor {#opening-logs}

În bara de meniu, dați clic pe `Fișier` > `Deschidere log(uri)...`, apoi alegeți unul sau mai multe fișiere log de pe discul local. Tragerea unui fișier log din managerul de fișiere al sistemului pe pictograma sau fereastra AdvantageScope determină de asemenea deschiderea acestuia.

:::info
Dacă sunt deschise mai multe fișiere simultan, marcajele de timp vor fi aliniate automat. Acest lucru permite compararea ușoară a fișierelor log din mai multe surse.
:::

<img src="/img/overview/log-files/open-file-1.webp" alt="Deschiderea unui log salvat" />

## Adăugarea de loguri noi {#adding-new-logs}

După deschiderea unui fișier log, loguri suplimentare pot fi adăugate cu ușurință în vizualizare. Marcajele de timp vor fi realiniate automat pentru a se sincroniza cu datele existente.

În bara de meniu, dați clic pe `Fișier` > `Adaugă log(uri) noi...`, apoi alegeți unul sau mai multe fișiere log pentru a le adăuga la vizualizarea curentă. Câmpurile din fiecare log vor fi înregistrate în tabele denumite `Log0`, `Log1` etc.

## Descărcarea de pe robot {#downloading-from-the-robot}

<details>
<summary>Configurare</summary>

Deschideți fereastra de preferințe dând clic pe `Aplicație` > `Afișează preferințele...` (Windows/Linux) sau `AdvantageScope` > `Setări...` (macOS). Actualizați adresa robotului și folderul de loguri.

<img src="/img/prefs_ro.webp" alt="Diagramă de preferințe" height="350" />
</details>

Dați clic pe `Fișier` > `Descărcare loguri...` pentru a deschide fereastra de descărcare. Odată conectat la robot, logurile disponibile sunt afișate cu cele mai noi în partea de sus. Selectați unul sau mai multe fișiere log de descărcat (shift-clic pentru a selecta un interval sau **cmd/ctrl + A** pentru a selecta tot). Apoi dați clic pe simbolul ↓ și selectați o locație de salvare.

:::info
[Înregistratorul de semnale](https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/api-usage/signal-logging.html) de la CTRE utilizează un format nestandardizat care grupează logurile în subfoldere. Selectați unul sau mai multe foldere din listă pentru a descărca fișierele log ca un grup.
:::

:::tip
La descărcarea mai multor fișiere, AdvantageScope omite orice fișiere care există deja în folderul de destinație.
:::

<img src="/img/overview/log-files/open-file-2.webp" alt="Descărcarea fișierelor log" height="350" />

## Formatarea CSV {#csv-formatting}

Numele coloanelor CSV trebuie să fie fie „Timestamp, Key, Value”, fie „Timestamp, (Key), (Key), etc”. Valorile marcajelor de timp sunt în secunde. Lista de mai jos arată formatul așteptat al tipurilor comune de valori. Rețineți că exportul și reimportul datelor de log ca CSV este _cu pierderi_, deoarece CSV nu suportă tipuri complexe de câmpuri.

- **Booleene:** `true` sau `false`
- **Șiruri de caractere (Strings):** `"(valoare)"`
  - Exemplu: `"Salutare lume"`
- **Tablouri (Arrays):** `[(valoare); (valoare); (valoare)]`
  - Exemplu: `[1; 2; 3]`
- **Octeți (Bytes):** hexazecimal, separați prin `-`
  - Exemplu: `4d-41-36-33-32-38`
