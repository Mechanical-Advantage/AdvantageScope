---
sidebar_position: 7
---

# 🎬 Video {#video}

Fila video îți permite să compari datele din log alăturat cu un videoclip al meciului înregistrat separat. Pașii de mai jos arată cum încarci un videoclip și cum îl sincronizezi cu logul.

## Încărcarea videoclipului {#loading-the-video}

AdvantageScope îți oferă trei opțiuni pentru a încărca un videoclip:

1. **Fișier local:** Dă clic pe pictograma gri pentru fișier, apoi alege fișierul video dorit. Majoritatea formatelor video uzuale sunt suportate.
2. **YouTube:** Copiază un link YouTube în clipboard, apoi dă clic pe pictograma roșie pentru clipboard. După câteva secunde, videoclipul va începe să se descarce.
3. **The Blue Alliance:** Dă clic pe pictograma albastră TBA pentru a încărca automat videoclipul meciului pe baza fișierului log. Dacă sunt disponibile mai multe videoclipuri, alege-l pe cel dorit din meniul pop-up. Această funcție necesită o cheie API pentru TBA, pe care o poți obține de la [thebluealliance.com/account](https://www.thebluealliance.com/account) și o poți copia în preferințele AdvantageScope, la „Cheie API TBA”.

<img src="/img/tab-reference/video-1.webp" alt="Selector de sursă" />

După ce alegi un videoclip, cronologia din dreapta jos începe să se coloreze în albastru pentru a indica cadrele salvate în cache (acest pas este necesar pentru o redare fluidă). Această funcție este gândită doar pentru videoclipuri de durata unui meci, din cauza conversiei cadrelor.

:::warning
Descărcarea videoclipurilor de pe YouTube și TBA poate eșua neașteptat din cauza modificărilor de pe serverele YouTube. Dacă întâmpini probleme, încearcă să actualizezi AdvantageScope sau folosește un fișier video local.
:::

:::info
AdvantageScope are nevoie de [FFmpeg](https://ffmpeg.org) pentru a procesa fișierele video. Dacă nu găsește o versiune validă de FFmpeg în PATH-ul sistemului tău, AdvantageScope îți va propune să descarce FFmpeg de pe internet când încarci un videoclip pentru prima dată. Instalarea automată a FFmpeg este suportată doar pe Windows și macOS; pe Linux, poate fi necesar să instalezi manual FFmpeg și să îl adaugi în PATH-ul sistemului.
:::

## Navigarea în videoclip {#navigating-the-video}

Când încarci un videoclip și încă nu l-ai sincronizat cu datele din log, controalele de redare pentru videoclip și log funcționează separat. Folosește cronologia și butoanele din dreapta jos pentru a controla redarea video. Sunt suportate și următoarele scurtături de tastatură:

- / = pornește/oprește redarea
- → = avansează cu un cadru
- ← = mergi înapoi cu un cadru
- \> = sari înainte cinci secunde
- < = sari înapoi cinci secunde

<img src="/img/tab-reference/video-2.webp" alt="Comenzi video" />

## Sincronizare automată {#automatic-synchronization}

Majoritatea videoclipurilor de meci se vor sincroniza automat cu logul la scurt timp după ce se încarcă cadrele pentru perioada autonomă a meciului. Nu trebuie să faci nimic; dacă sincronizarea reușește, controalele video se vor bloca automat (vezi „Redare” mai jos).

:::warning
Sincronizarea automată funcționează doar pentru videoclipurile de meci care includ suprapuneri de scor și s-ar putea să nu reușească în toate cazurile. Dacă controalele video nu se blochează automat după încărcarea tuturor cadrelor, va trebui să faci sincronizarea manual.
:::

## Sincronizare manuală {#manual-synchronization}

Mai întâi, folosește controalele video pentru a naviga la un moment ușor de recunoscut din meci, cum ar fi începutul perioadei autonome. Apoi, selectează în fișierul log momentul de timp care corespunde cadrului curent din videoclip.

:::tip
Cursorul de pe cronologie se fixează (snap) la începutul și sfârșitul perioadelor de meci, ca să poți selecta precis începutul meciului.
:::

După ce ai aliniat videoclipul cu logul, dă clic pe pictograma lacăt de lângă cronologia video (sau apasă **↑ sau ↓**). Controalele video sunt acum dezactivate. Dă clic din nou pe pictograma lacăt pentru a debloca redarea video.

<img src="/img/tab-reference/video-3.webp" alt="Buton de blocare" />

## Redare {#playback}

Odată blocată, redarea video rămâne sincronizată cu timpul selectat în log. Reține că redarea sunetului nu este suportată, deoarece videoclipul original este convertit cadru cu cadru pentru a permite sincronizarea cu logul.

<details>
<summary>Controale cronologie</summary>

Cronologia controlează redarea și vizualizarea. Dacă dai clic pe cronologie, selectezi un moment de timp, iar cu clic dreapta îl deselectezi. Timpul selectat este sincronizat în toate filele, astfel încât să poți găsi rapid același moment și în alte vizualizări.

Secțiunile galbene arată când robotul este în modul autonom, cele albastre când este în modul teleoperat, iar cele gri când este în modul utilitar.

Pentru a mări, plasează cursorul peste cronologie și derulează în sus sau în jos. Poți selecta un interval și prin clic și tragere în timp ce ții apăsată tasta `Shift`. Mută-te la stânga și la dreapta prin derulare orizontală (pe dispozitivele suportate) sau prin clic și tragere pe cronologie. Când ești conectat live, derularea spre stânga deblochează redarea de la timpul curent, iar derularea până la capăt în dreapta o blochează din nou la timpul curent. Apasă `Ctrl+\` pentru a mări la intervalul în care robotul este activat.

<img src="/img/tab-reference/timeline.webp" alt="Cronologie" />

</details>

:::tip
Dacă vrei, poți ajusta FOV-ul camerei în vizualizarea terenului 3D pentru a se potrivi cu aspectul videoclipului. Pentru detalii, vezi „Opțiuni cameră” pe pagina 👀 [Teren 3D](/tab-reference/3d-field).
:::

<img src="/img/tab-reference/video-4.webp" alt="Instantaneu video cu odometrie" />
