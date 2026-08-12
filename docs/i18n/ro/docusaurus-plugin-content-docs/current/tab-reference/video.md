---
sidebar_position: 7
---

# 🎬 Video {#video}

Fila video permite ca datele de log să fie comparate alăturat cu un videoclip al meciului înregistrat separat. Pașii de mai jos arată cum se încarcă un videoclip și cum se sincronizează cu logul.

## Încărcarea videoclipului {#loading-the-video}

AdvantageScope oferă trei opțiuni pentru încărcarea unui videoclip:

1. **Fișier local:** Dați clic pe pictograma fișier gri, apoi alegeți fișierul video de încărcat. Majoritatea formatelor video comune sunt suportate.
2. **YouTube:** Copiați un link YouTube în clipboard, apoi dați clic pe pictograma clipboard roșie. După câteva secunde, videoclipul va începe să se descarce.
3. **The Blue Alliance:** Dați clic pe pictograma albastră TBA pentru a încărca automat videoclipul meciului pe baza fișierului log. Dacă sunt disponibile mai multe videoclipuri, alegeți videoclipul de descărcat din meniul pop-up. Această caracteristică necesită o cheie API pentru TBA, care ar trebui obținută de la [thebluealliance.com/account](https://www.thebluealliance.com/account) și copiată în pagina de preferințe AdvantageScope la „Cheie API TBA”.

<img src="/img/tab-reference/video-1.png" alt="Selector de sursă" />

După alegerea unui videoclip, cronologia din dreapta jos începe să devină albastră pentru a indica cadrele care au fost salvate în cache (acest pas este necesar pentru o redare fluidă). Această caracteristică este destinată doar videoclipurilor de lungimea unui meci, din cauza conversiei cadrelor necesare.

:::warning
Descărcarea videoclipurilor YouTube și TBA poate eșua în mod neașteptat din cauza modificărilor de pe serverele YouTube. În caz de probleme, încercați actualizarea AdvantageScope sau utilizarea unui fișier video local în schimb.
:::

:::info
AdvantageScope necesită [FFmpeg](https://ffmpeg.org) pentru procesarea fișierelor video. Dacă o copie validă a FFmpeg nu este găsită în PATH-ul sistemului dumneavoastră, AdvantageScope va solicita descărcarea FFmpeg de pe internet când încărcați un videoclip pentru prima dată. Instalarea automată FFmpeg este suportată doar pe Windows și macOS; utilizatorii Linux pot avea nevoie să instaleze manual FFmpeg și să îl adauge la PATH-ul sistemului.
:::

## Navigarea în videoclip {#navigating-the-video}

Când un videoclip este încărcat inițial și nu a fost încă sincronizat cu datele de log, controalele de redare pentru videoclip și log sunt încă independente. Utilizați cronologia și butoanele din dreapta jos pentru a controla redarea video. Următoarele scurtături de tastatură sunt de asemenea suportate:

- / = comută redarea
- → = avansează cu un cadru
- ← = derulează înapoi cu un cadru
- \> = sari înainte cinci secunde
- < = sari înapoi cinci secunde

<img src="/img/tab-reference/video-2.png" alt="Comenzi video" />

## Sincronizare automată {#automatic-synchronization}

Majoritatea videoclipurilor de meci vor fi sincronizate automat cu logul la scurt timp după ce cadrele pentru perioada autonomă a meciului sunt încărcate. Nu este necesară nicio acțiune; dacă sincronizarea reușește, controalele video vor fi blocate automat (consultați „Redare” mai jos).

:::warning
Sincronizarea automată funcționează numai pe videoclipurile de meci care includ suprapuneri de scor și poate să nu reușească în toate cazurile. Dacă controalele video nu sunt blocate automat după încărcarea tuturor cadrelor, este necesară o sincronizare manuală.
:::

## Sincronizare manuală {#manual-synchronization}

Mai întâi, utilizați controalele video pentru a naviga la o locație cunoscută din meci, cum ar fi începutul perioadei autonome. Apoi, selectați timpul din fișierul log care se aliniază cu cadrul curent al videoclipului.

:::tip
Cursorul de pe cronologie se fixează (snaps) la începutul și sfârșitul perioadelor de meci, făcând mai ușoară selectarea precisă a începutului meciului.
:::

Odată ce videoclipul și logul sunt aliniate, dați clic pe pictograma lacăt de lângă cronologia video (sau apăsați **↑ sau ↓**). Controalele video sunt acum dezactivate. Dați clic pe pictograma lacăt din nou pentru a debloca redarea video.

<img src="/img/tab-reference/video-3.png" alt="Buton de blocare" />

## Redare {#playback}

Odată blocată, redarea video rămâne aliniată cu timpul selectat în log. Rețineți că redarea sunetului nu este suportată, deoarece videoclipul original este convertit într-o reprezentare cadru cu cadru pentru a suporta sincronizarea cu logul.

<details>
<summary>Controale cronologie</summary>

Cronologia este utilizată pentru a controla redarea și vizualizarea. Dând clic pe cronologie se selectează un timp, iar dând clic dreapta se deselectează. Timpul selectat este sincronizat în toate filele, făcând ușoară găsirea rapidă a acestei locații în alte vizualizări.

Secțiunile galbene indică momentul în care robotul este în modul autonom, secțiunile albastre indică momentul în care robotul este în modul teleoperat, iar secțiunile gri indică momentul în care robotul este în modul utilitar.

Pentru a mări, plasați cursorul peste cronologie și derulați în sus sau în jos. Un interval poate fi de asemenea selectat prin clic și tragere în timp ce țineți apăsată tasta `Shift`. Mutați-vă la stânga și la dreapta prin derulare orizontală (pe dispozitivele suportate) sau prin clic și tragere pe cronologie. Când sunteți conectat live, derularea spre stânga deblochează timpul curent, iar derularea până la capăt în dreapta blochează din nou timpul curent. Apăsați `Ctrl+\` pentru a mări la perioada în care robotul este activat.

<img src="/img/tab-reference/timeline.png" alt="Cronologie" />

</details>

:::tip
Dacă se dorește, FOV-ul camerei poate fi ajustat în vizualizarea terenului 3D pentru a se potrivi cu aspectul videoclipului. Pentru detalii, consultați „Opțiuni cameră” pe pagina 👀 [Teren 3D](/tab-reference/3d-field).
:::

<img src="/img/tab-reference/video-4.png" alt="Instantaneu video cu odometrie" />
