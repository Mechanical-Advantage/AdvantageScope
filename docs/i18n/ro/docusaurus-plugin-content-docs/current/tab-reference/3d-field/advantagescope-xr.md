# AdvantageScope XR {#advantagescope-xr}

AdvantageScope XR aduce la viață vizualizarea 👀 [Teren 3D](/tab-reference/3d-field) în realitate augmentată, ca să poți analiza datele în moduri complet noi. Vezi o simulare a autonomului în mărime naturală, analizează strategia de meci cu un model de teren pe masă, suprapune informații de diagnosticare peste un robot real și multe altele! Videoclipul de mai jos îți arată câteva moduri în care poți folosi această funcție:

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/gWPhQyB66DQ" title="AdvantageScope XR: Feature Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Cerințe {#requirements}

- **Gazdă (Host):** Aplicația desktop AdvantageScope pe Windows, macOS sau Linux (v4.1.0 sau mai recentă). Orice firewall de pe dispozitiv trebuie să fie [dezactivat](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/windows-firewall-configuration.html#disabling-windows-firewall) sau configurat pentru a permite conexiuni de intrare pe portul TCP 56328.
- **Client:** Un iPhone sau iPad cu iOS/iPadOS 16 sau mai recent. Nu trebuie să instalezi nicio aplicație.
- **Rețea:** Ambele dispozitive trebuie să fie conectate la aceeași rețea (Wi-Fi, partajare internet prin USB etc.). Cu excepția situației de mai jos, această rețea nu are nevoie de conexiune la internet.
- **Internet:** Dacă AdvantageScope XR nu a fost folosit recent, dispozitivul mobil trebuie să aibă conexiune la internet (de ex., date mobile). Pentru a elimina această cerință, consultă secțiunea [Utilizare offline](#offline-usage) de mai jos.

:::tip
AdvantageScope XR funcționează pe multe modele de iPhone și iPad, dar este mai stabil pe dispozitivele cu **senzor LiDAR** — adică iPhone Pro (începând cu iPhone 12 Pro) și iPad Pro (primăvara anului 2020 sau mai recent).
:::

<details>
<summary>Dar alte platforme?</summary>

AdvantageScope XR este suportat doar pe iOS și iPadOS și nu există planuri imediate pentru alte platforme. Aplicația client are nevoie de o integrare strânsă cu API-urile native pentru realitate augmentată, înregistrare video, randare web și altele. iOS și iPadOS au prioritate din câteva motive:

- **Consistență:** AdvantageScope XR consumă multe resurse. În timp ce dispozitivele Android variază enorm ca putere de procesare și funcții, iPhone și iPad oferă o experiență de dezvoltare consecventă de la o generație la alta. Toate dispozitivele iOS și iPadOS recente sunt suficient de puternice pentru a rula AdvantageScope XR, iar cele mai noi oferă funcții extra pe care AdvantageScope le poate folosi (cum ar fi LiDAR).

- **Disponibilitate:** iPhone rămâne cel mai răspândit smartphone pe care elevii din Statele Unite îl au sau îl pot împrumuta ușor de la colegi și este mult mai accesibil decât orice cască VR sau de realitate mixtă. Suportul pentru iOS maximizează numărul de utilizatori care pot accesa ușor AdvantageScope XR.

- **Suport pentru tablete:** Poți rula AdvantageScope XR și pe o tabletă, deoarece ecranul mai mare le permite mai multor persoane să urmărească vizualizarea în același timp. iPad este cea mai folosită tabletă la nivel mondial, așa că suportul pentru iPadOS face experiența pe tabletă cât mai accesibilă.

</details>

## Configurare {#setup}

1. Pe sistemul gazdă, **fă clic pe butonul „XR”** din orice filă de teren 3D. Doar o singură sesiune gazdă XR poate fi activă la un moment dat, așa că, dacă apeși acest buton, orice altă sesiune activă va fi întreruptă.

<img src="/img/tab-reference/3d-field/xr-1.webp" alt="Buton XR" height="450" />

_Mai sus este prezentată interfața în limba engleză._

2. Se va deschide fereastra de **controale XR**, cu un cod QR și [opțiuni](#options) pentru a personaliza experiența AR. Pentru a opri sesiunea XR și a deconecta clienții, închide fereastra de controale.

<img src="/img/tab-reference/3d-field/xr-2.webp" alt="Fereastră XR" height="350" />

_Mai sus este prezentată interfața în limba engleză._

3. Scanează codul QR folosind **aplicația de cameră integrată** pe dispozitivul client. Nu trebuie să instalezi nicio aplicație.
4. Atinge „AdvantageScope XR” și apoi „Open” pentru a **porni vizualizarea AR** și a te conecta la gazdă. Dacă ți se solicită, permite aplicației AdvantageScope XR să acceseze **camera și rețeaua locală**.
5. Urmează instrucțiunile de pe ecran pentru a **calibra și poziționa modelul terenului**.
6. Controlează modelul terenului ca de obicei de pe dispozitivul gazdă, inclusiv **redarea logurilor și streamingul live**. Starea modelului terenului se actualizează live pe dispozitivul client.
7. Pentru a **înregistra rapid un videoclip**, atinge pictograma „Record” din partea de sus a ecranului. Atinge-o din nou pentru a opri înregistrarea, apoi editează și salvează clipul.

:::warning
Hărțile termice și vitezele modulelor swerve nu sunt încă disponibile în XR. Toate celelalte tipuri de obiecte sunt suportate.
:::

:::tip
AdvantageScope XR consumă multe resurse și poate avea probleme de performanță în funcție de complexitatea scenei 3D. Dacă este nevoie, folosește modele de robot mai simple sau mai puține obiecte.
:::

## Opțiuni {#options}

Fereastra de controale XR îți oferă câteva opțiuni pentru a controla modul în care modelul este afișat în realitatea augmentată:

- **Calibrare:**
  - Alege _Miniatură_ pentru a vizualiza o versiune la scară redusă a terenului, potrivită pentru masă.
  - Alege _Mărime naturală_ pentru a vizualiza terenul la scară reală, poziționat pe baza unei bariere reale a terenului. Comutarea între _Alianța albastră_ și _Alianța roșie_ stabilește ce parte a terenului este folosită pentru calibrare, dar întregul teren este afișat în ambele cazuri.
- **Streaming:**
  - Alege _Fluid_ când poți accepta o ușoară latență în schimbul unui streaming mai stabil, cum ar fi simularea rutinelor autonome sau redarea fișierelor log.
  - Alege _Latență scăzută_ pentru aplicații în timp real unde un ușor jitter este acceptabil, cum ar fi suprapunerea datelor peste un robot real sau conducerea unui robot simulat în teleop.
- **Afișare podea:** Afișează modelul plat de covor/podea sub teren în loc să îl suprapună pe o suprafață reală.
- **Afișare teren:** Afișează modelul terenului, inclusiv bariera terenului și elementele specifice jocului. Obiectele [piesă de joc](/tab-reference/3d-field#game-piece-objects) personalizate sunt afișate întotdeauna.
- **Afișare roboți:** Afișează modelele roboților; poate fi dezactivat atunci când suprapui date peste un robot real (cum ar fi ținte vizuale sau mecanisme 2D).

## Utilizare offline {#offline-usage}

AdvantageScope XR nu are nevoie de conexiune la internet. Pentru a te asigura că aplicația este disponibilă offline, descarcă AdvantageScope XR din App Store folosind linkul de mai jos. Pentru a te conecta la aplicația desktop AdvantageScope, scanează codul QR cu aplicația de cameră iOS sau atinge butonul „Scan” din aplicația AdvantageScope XR.

[<img src="/img/app-store_ro.svg" alt="App Store" />](https://apps.apple.com/ro/app/advantagescope-xr/id6739718081?l=ro)

:::note
Chiar și atunci când rulează fără conexiune la internet, dispozitivele gazdă și client **trebuie să fie conectate la aceeași rețea** (cum ar fi rețeaua unui robot, o rețea Wi-Fi dedicată sau prin partajare internet USB).
:::
