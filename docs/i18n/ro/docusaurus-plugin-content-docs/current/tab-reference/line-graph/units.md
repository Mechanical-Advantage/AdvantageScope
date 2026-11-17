# Suport pentru unități {#unit-support}

Fila grafic liniar recunoaște unitățile de măsură, așa că poți converti ușor valorile numerice între tipuri de unități compatibile. Când informațiile despre unități sunt disponibile, toate valorile numerice sunt etichetate precis pe axe și în legende. Vezi secțiunea [de mai jos](#supported-formats) pentru detalii despre publicarea informațiilor despre unități. AdvantageScope îți oferă mai multe instrumente pentru conversii rapide:

- Când adaugi **câmpuri pe aceeași axă cu tipuri de unități compatibile**, AdvantageScope convertește automat ambele câmpuri la aceeași unitate. Acest lucru se reflectă în etichetarea axei Y și a legendei.
- Dă clic pe cele trei puncte de lângă titlul axei pentru a **comuta rapid la unități alternative**. Lista include cele mai comune unități compatibile cu câmpurile selectate.
- Activează **integrarea sau diferențierea** ([documentație](/tab-reference/line-graph/#integration-and-differentiation)) pentru a vedea unitățile exacte ale integralei sau derivatei. Poți ajusta unitatea de bază din meniu pentru a filtra în unități non-native.

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Grafice bazate pe unități" />

_Interfața în limba engleză este ilustrată mai sus._

## Formate suportate {#supported-formats}

AdvantageScope suportă mai multe metode prin care poți furniza informații despre unități pentru fiecare câmp. Majoritatea unităților uzuale sunt suportate; pentru o listă completă, verifică meniul pop-up când configurezi [conversia manuală](#manual-conversion).

Pentru metodele (2) și (3), tipurile de unități sunt parsate din șiruri de caractere. AdvantageScope recunoaște mai multe denumiri pentru fiecare unitate, inclusiv abrevieri comune (de exemplu, atât `ft`, cât și `feet` sunt valide) și atât ortografia americană, cât și cea britanică (de exemplu, `meters` și `metres`). Reține că numele unităților trebuie furnizate folosind simboluri SI sau denumiri în engleză, indiferent de limba selectată în AdvantageScope. Dacă o unitate nu este parsată așa cum te aștepți, te rugăm să [deschizi o problemă](https://github.com/Mechanical-Advantage/AdvantageScope/issues).

:::tip
Nu ești sigur dacă unitățile sunt parsate corect? Verifică dacă pe axa Y apare tipul unității atunci când adaugi un câmp pe graficul liniar.
:::

### 🥇 Unități Struct {#struct-units}

AdvantageScope folosește automat unitățile native pentru tipurile de date structurate comune, cum ar fi `Rotation2d` și `Translation3d`. Publicarea valorilor în aceste formate este **întotdeauna cea mai bună metodă** și asigură compatibilitatea maximă la vizualizarea datelor geometrice.

### 🥈 Metadate câmp {#field-metadata}

Formatele WPILOG și NetworkTables suportă publicarea de „metadate” suplimentare pentru fiecare câmp. AdvantageScope caută câmpuri JSON numite „unit” sau „units” care conțin numele unității ca șir de caractere (folosind spații, camel-case, pascal-case sau snake-case). Pentru a verifica metadatele unui câmp, ține cursorul peste numele câmpului în bara laterală.

:::tip
În WPILib, înregistrarea obiectelor `Measure` cu `Telemetry.log()` atașează automat metadate pentru unități. Poți configura explicit metadatele și folosind `Telemetry.setProperty("fieldName", "unit", "\"volts\"")`.

AdvantageKit suportă, de asemenea, metadate pentru unități la înregistrarea intrărilor și ieșirilor (vezi [aici](https://docs.advantagekit.org/data-flow/supported-types#units) pentru detalii).
:::

### 🥉 Denumirea câmpurilor {#field-naming}

Ca variantă de rezervă (fallback), AdvantageScope încearcă să deducă unitatea corectă parsând numele fiecărui câmp. **Tipul unității trebuie inclus ca sufix.** Sunt suportate mai multe convenții de denumire, printre care:

- **Camel/pascal-case**, cum ar fi `PositionMeters`, `velocityRadPerSec` și `TimestampS`
- **Snake-case**, cum ar fi `position_meters`, `velocity_rad_per_sec` și `timestamp_s`
- **Separatori prin spațiu**, cum ar fi `position meters`, `velocity rad per sec` și `timestamp s`

Denumirea _nu_ ține cont de majuscule/minuscule atunci când folosești snake-case sau separatori prin spațiu.

:::tip
Dacă unitățile sunt parsate greșit, dă clic pe `Unități manuale` > `Dezactivează unitățile automate` pentru a ignora informațiile despre unități. Apoi poți folosi conversia manuală pentru a trece la alte unități.
:::

## Conversie manuală {#manual-conversion}

Când metadatele unităților lipsesc sau sunt inexacte, poți configura manual axele pentru a converti între unități (sau pentru a ignora complet metadatele unităților).

Pentru a configura conversia manuală, dă clic pe cele trei puncte de lângă titlul axei și apoi pe `Unități manuale` > `Editează conversia`. Selectează tipul unității, unitatea sursă și unitatea țintă. Fiecare valoare este înmulțită și cu „Factor suplimentar”, ceea ce îți permite conversii personalizate (precum rapoarte de transmisie, conversii din unghiular în liniar sau alte unități neincluse în AdvantageScope). Poți introduce factorul și ca expresie matematică, de exemplu `1.5*pi`.

:::tip
Pentru a activa sau dezactiva rapid conversia unităților, dă clic pe cele trei puncte de lângă titlul axei și alege `Presetări recente` sau `Resetează unitățile`.
:::

<img src="/img/tab-reference/line-graph/units-2.webp" alt="Editarea conversiei unităților" height="250" />

_Interfața în limba engleză este ilustrată mai sus._
