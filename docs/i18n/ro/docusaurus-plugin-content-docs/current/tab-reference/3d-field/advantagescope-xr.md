# AdvantageScope XR {#advantagescope-xr}

AdvantageScope XR aduce la viață vizualizarea 👀 [Teren 3D](/tab-reference/3d-field) în realitate augmentată, permițându-vă să vizualizați datele în moduri complet noi. Vedeți o simulare a autonomului în mărime naturală, revizuiți strategia de meci cu un model de teren de masă, suprapuneți informații de diagnosticare pe un robot real și multe altele! Videoclipul de mai jos demonstrează mai multe cazuri de utilizare pentru această caracteristică:

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/gWPhQyB66DQ" title="AdvantageScope XR: Feature Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Cerințe {#requirements}

- **Gazdă (Host):** Aplicația desktop AdvantageScope pe Windows, macOS sau Linux (v4.1.0 sau mai recentă). Orice firewall-uri de pe dispozitiv ar trebui să fie [dezactivate](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/windows-firewall-configuration.html#disabling-windows-firewall).
- **Client:** Un iPhone sau iPad care rulează iOS/iPadOS 16 sau mai recent. Nu este necesară instalarea unei aplicații.
- **Rețea:** Ambele dispozitive trebuie să fie conectate la aceeași rețea (Wi-Fi, partajare internet prin USB etc.). Sub rezerva cerinței de mai jos, această rețea nu trebuie să fie conectată la internet.
- **Internet:** Dacă AdvantageScope XR nu a fost utilizat recent, dispozitivul mobil trebuie să aibă o conexiune la internet (de ex. date mobile). Pentru a elimina această cerință, consultați secțiunea [utilizare offline](#offline-usage) de mai jos.

:::tip
AdvantageScope XR este suportat pe multe modele de iPhone și iPad, dar este mai stabil pentru dispozitivele cu un **senzor LiDAR**. Aceasta include iPhone Pro (începând cu iPhone 12 Pro) și iPad Pro (primăvara anului 2020 sau mai recent).
:::

<details>
<summary>Cum rămâne cu alte platforme?</summary>

AdvantageScope XR este suportat doar pe iOS și iPadOS. Nu există planuri imediate de a suporta platforme alternative. Aplicația client necesită o integrare strânsă cu API-urile native pentru realitate augmentată, înregistrare video, randare web și altele. iOS și iPadOS primesc prioritate pentru dezvoltare și suport din mai multe motive:

- **Consistență:** AdvantageScope XR este o aplicație solicitantă. În timp ce dispozitivele Android variază pe scară largă în ceea ce privește puterea de procesare și caracteristicile, iPhone și iPad oferă o experiență de dezvoltare consecventă între generații. Toate dispozitivele recente iOS și iPadOS sunt suficient de puternice pentru a rula AdvantageScope XR, iar dispozitivele mai noi suportă caracteristici suplimentare pe care AdvantageScope le poate utiliza (cum ar fi LiDAR).

- **Disponibilitate:** iPhone rămâne cel mai comun smartphone pe care elevii din Statele Unite sunt susceptibili să îl dețină sau să îl aibă ușor accesibil de la colegi și este mai larg disponibil decât orice model de cască VR sau de realitate mixtă. Suportarea iOS maximizează numărul de utilizatori care au acces ușor la AdvantageScope XR.

- **Suport pentru tablete:** Utilizatorii pot profita de rularea AdvantageScope XR pe o tabletă, deoarece tabletele oferă un afișaj mai mare care este mai ușor de văzut de către mai multe persoane simultan. iPad este cea mai frecvent utilizată tabletă la nivel mondial, astfel încât suportarea iPadOS face experiența pe tabletă cât mai accesibilă posibil.

</details>

## Configurare {#setup}

1. Pe sistemul gazdă, **dați clic pe butonul „XR”** pe orice filă de teren 3D. Doar o singură sesiune gazdă XR poate fi activă în același timp, astfel încât dând clic pe acest buton se vor întrerupe orice alte sesiuni active.

<img src="/img/tab-reference/3d-field/xr-1.webp" alt="Buton XR" />

2. Fereastra de **controale XR** se va deschide, având un cod QR și [opțiuni](#options) pentru a personaliza experiența AR. Pentru a anula sesiunea XR și a deconecta orice clienți, închideți fereastra de controale.

<img src="/img/tab-reference/3d-field/xr-2.webp" alt="Fereastră XR" />

3. Scanați codul QR folosind **aplicația de cameră integrată** pe dispozitivul client. Nu este necesară instalarea unei aplicații.
4. Atingeți „AdvantageScope XR” și apoi „Open” pentru a **începe experiența** și a vă conecta la gazdă. Dacă vi se solicită, permiteți AdvantageScope XR să acceseze **camera și rețeaua locală**.
5. Urmați instrucțiunile de pe dispozitiv pentru a **calibra și poziționa modelul terenului**.
6. Controlați modelul terenului ca de obicei folosind dispozitivul gazdă, inclusiv **redarea logurilor și streamingul live**. Starea modelului terenului este afișată live pe dispozitivul client.
7. Pentru a **înregistra rapid un videoclip**, atingeți pictograma „Record” din partea de sus a ecranului. Atingeți din nou pentru a opri înregistrarea, apoi editați și salvați clipul.

:::warning
Hărțile termice și vitezele modulelor swerve nu sunt disponibile încă în XR. Toate celelalte tipuri de obiecte sunt suportate.
:::

:::tip
AdvantageScope XR este o aplicație solicitantă și poate întâmpina probleme de performanță în funcție de complexitatea scenei 3D. Luați în considerare utilizarea unor modele de robot mai simple sau a mai puține obiecte dacă este necesar.
:::

## Opțiuni {#options}

Fereastra de controale XR prezintă câteva opțiuni care controlează modul în care modelul este afișat în realitatea augmentată:

- **Calibrare:**
  - Alegeți _Miniatură_ pentru a vizualiza o versiune la scară redusă a terenului, potrivită pentru utilizare pe masă.
  - Alegeți _Mărime naturală_ pentru a vizualiza terenul la o scară exactă, poziționat pe baza unei barierii reale a terenului. Comutarea între _Alianța albastră_ și _Alianța roșie_ controlează care parte a terenului este utilizată pentru calibrare, dar terenul complet este vizualizat în toate cazurile.
- **Streaming:**
  - Alegeți _Fluid_ pentru aplicații unde o anumită latență este acceptabilă în schimbul unui streaming mai fiabil, cum ar fi simularea rutinelor autonome sau redarea fișierelor log.
  - Alegeți _Latență scăzută_ pentru aplicații în timp real unde o anumită fluctuație (jitter) este acceptabilă, cum ar fi suprapunerea datelor pe un robot real sau conducerea unui robot simulat în teleop.
- **Afișare podea:** Afișează modelul plat de covor/podea sub teren în loc să suprapună pe o suprafață reală.
- **Afișare teren:** Afișează modelul terenului, inclusiv bariera terenului și elementele specifice jocului. Obiectele [piesă de joc](/tab-reference/3d-field#game-piece-objects) personalizate sunt afișate întotdeauna.
- **Afișare roboți:** Afișează modelele roboților, poate fi dezactivat la suprapunerea datelor pe un robot real (cum ar fi țintele vizuale sau mecanismele 2D).

## Utilizare offline {#offline-usage}

AdvantageScope XR nu necesită o conexiune la internet. Pentru a vă asigura că aplicația este disponibilă offline, descărcați AdvantageScope XR din App Store folosind linkul de mai jos. Pentru a vă conecta la aplicația desktop AdvantageScope, scanați codul QR folosind aplicația de cameră iOS sau atingeți butonul „Scan” în aplicația AdvantageScope XR.

<img src="/img/tab-reference/3d-field/app-store.svg" alt="App Store" />

:::note
Chiar și când rulează fără o conexiune la internet, dispozitivele gazdă și client **trebuie să fie conectate la aceeași rețea** (cum ar fi un robot, o rețea Wi-Fi personalizată sau prin partajare internet USB).
:::
