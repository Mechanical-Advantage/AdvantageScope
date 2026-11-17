# 🧭 Navigarea în aplicație {#app-navigation}

Captura de ecran de mai jos prezintă elementele importante ale ferestrei principale AdvantageScope. Aspectul exact diferă de la un sistem de operare la altul.

<img src="/img/overview/navigation/navigation-1.webp" alt="Diagramă de navigare" />

_Interfața în limba engleză este ilustrată mai sus._

- Secțiunea roșie este [bara laterală](#sidebar), care listează câmpurile disponibile.
- Secțiunea maro este [bara de file](#tab-bar), care controlează aplicația și este utilizată pentru comutarea între vizualizări.
- Secțiunea albastră este [panoul de vizualizare](#viewer-pane), care afișează datele.
- Secțiunea verde este [panoul de control](#control-pane), care este utilizat pentru a ajusta vizualizarea.

:::tip
Pentru a vizualiza mai multe fișiere log simultan, dă clic pe `Fișier` > `Fereastră nouă`.
:::

## Bara laterală {#sidebar}

În stânga se află bara laterală cu lista de tabele și câmpuri disponibile. Câmpurile selectabile sunt afișate cu _italic_, iar tabelele integrate (din WPILib sau AdvantageKit) sunt <u>subliniate</u>. Dă clic pe săgeată pentru a extinde tabelele imbricate. **Trage un singur câmp** pentru a-l selecta sau **ține apăsat cmd/ctrl** pentru a selecta mai multe câmpuri dând clic pe fiecare. Începe să tragi colecția de câmpuri pentru a finaliza selecția.

Pentru a căuta un câmp, începe să tastezi în caseta de căutare. Se va afișa un meniu derulant cu câmpuri, iar câmpul selectat va fi evidențiat în bara laterală și adus în zona vizibilă.

:::info
Dă clic și trage de marginea din dreapta pentru a redimensiona sau ascunde bara laterală. Dă dublu clic pentru a comuta vizibilitatea barei laterale.
:::

## Bara de file {#tab-bar}

Folosește bara de file (albastră) pentru a comuta între diferite vizualizări. Această documentație este disponibilă în orice moment dând clic pe pictograma 📖 din stânga. Pentru a exporta aranjamentul curent al filelor (și setările asociate), dă clic pe `Fișier` > `Exportă aranjamentul...` Pentru a importa un aranjament dintr-un fișier, dă clic pe `Fișier` > `Importă aranjamentul...`

:::info
Filele pot fi reorganizate prin clic și tragere sau redenumite prin clic dreapta și selectarea opțiunii `Redenumește fila`.
:::

Butoanele de navigare (verzi) din partea de sus gestionează filele și controlează redarea.

- **Butonul Plus**: Deschide un meniu derulant pentru a crea o filă nouă.
- **Butonul Fereastră:** Creează o fereastră nouă detașată cu fila respectivă. Această funcționalitate poate fi folosită pentru a vizualiza date din mai multe file simultan.
- **Butonul X:** Închide fila curentă.
- **Butonul Redare:** Pornește și oprește redarea în timp real. _Dă clic dreapta pentru a schimba viteza de redare sau pentru a activa redarea în buclă._

## Panoul de vizualizare {#viewer-pane}

Panoul de vizualizare este locul unde sunt prezentate datele pentru fiecare tip de filă. Consultă documentația de referință a filelor pentru detalii despre panoul de vizualizare al fiecărei file. Această vizualizare poate fi mutată într-o fereastră separată dând clic pe butonul de detașare din bara de file.

## Panoul de control {#control-pane}

Panoul de control este folosit pentru a selecta câmpuri pentru vizualizare și pentru a gestiona alte opțiuni. Consultă documentația de referință a filelor pentru detalii despre opțiunile disponibile pentru fiecare filă.

:::info
Dă clic și trage de marginea de sus pentru a redimensiona sau ascunde panoul de control. Dă dublu clic pentru a comuta vizibilitatea panoului de control.
:::
