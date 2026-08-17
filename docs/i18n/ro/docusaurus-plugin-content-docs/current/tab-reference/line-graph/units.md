# Suport pentru unități {#unit-support}

Fila grafic liniar este conștientă de unități, ceea ce înseamnă că valorile numerice pot fi ușor convertite între tipuri de unități compatibile. Când informațiile despre unități sunt disponibile, toate valorile numerice sunt de asemenea etichetate cu precizie la afișarea pe axe sau în legende. Consultați [aici](#supported-formats) pentru mai multe informații despre publicarea informațiilor despre unități. AdvantageScope oferă mai multe instrumente pentru a converti rapid între unități:

- Când adăugați **câmpuri pe aceeași axă cu tipuri de unități compatibile**, AdvantageScope convertește automat ambele câmpuri la aceeași unitate. Acest lucru se reflectă în etichetarea axei Y și a legendei.
- Dați clic pe cele trei puncte de lângă titlul axei pentru a **comuta rapid la unități alternative**. Această listă include cele mai comune unități care sunt compatibile cu câmpurile selectate.
- Activați **integrarea sau diferențierea** ([docs](/tab-reference/line-graph/#integration-and-differentiation)) pentru a vedea unitățile exacte ale integralei sau derivatei. Unitatea de bază poate fi ajustată folosind meniul pentru a suporta filtrarea în unități non-native.

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Grafice bazate pe unități" />

_Interfața în limba engleză este ilustrată mai sus._

## Formate suportate {#supported-formats}

AdvantageScope suportă mai multe metode de furnizare a informațiilor despre unități pentru fiecare câmp. Majoritatea unităților comune sunt suportate; pentru o listă completă, verificați meniul pop-up la configurarea [conversiei manuale](#manual-conversion).

Pentru (2) și (3), tipurile de unități sunt parsate folosind șiruri de caractere. AdvantageScope suportă mai multe nume pentru fiecare unitate, inclusiv abrevieri comune (de exemplu, `ft` și `feet` sunt ambele OK) și atât ortografierea americană, cât și cea britanică (de exemplu, `meters` și `metres`). Reține că numele unităților trebuie furnizate folosind simboluri SI sau engleză, indiferent de limba selectată în AdvantageScope. Dacă un nume de unitate nu este parsat așa cum te aștepți, te rugăm să [deschizi o problemă](https://github.com/Mechanical-Advantage/AdvantageScope/issues).

:::tip
Nu sunteți sigur dacă unitățile sunt parsează corect? Verificați dacă un tip de unitate este afișat pe axa Y când adăugați un câmp la graficul liniar.
:::

### 🥇 Unități Struct {#struct-units}

AdvantageScope utilizează automat unitățile native pentru tipurile de date structurate comune, cum ar fi `Rotation2d` și `Translation3d`. Publicarea valorilor aplicabile folosind aceste formate este **întotdeauna cea mai bună cale de a publica date** și asigură compatibilitatea maximă la vizualizarea datelor de geometrie.

### 🥈 Metadate câmp {#field-metadata}

Formatele WPILOG și NetworkTables suportă publicarea de „metadate” suplimentare pentru fiecare câmp. AdvantageScope caută câmpuri JSON numite „unit” sau „units” care conțin un nume de șir pentru tipul de unitate (folosind spații, camel-case, pascal-case sau snake-case). Pentru a verifica metadatele pentru fiecare câmp, treceți cursorul peste numele câmpului în bara laterală.

:::tip
AdvantageKit include suport pentru metadatele unităților la înregistrarea intrărilor și ieșirilor, inclusiv înregistrarea adnotărilor. Consultați documentația [aici](https://docs.advantagekit.org/data-flow/supported-types#units) pentru detalii.
:::

### 🥉 Denumirea câmpurilor {#field-naming}

Ca o rezervă (fallback), AdvantageScope încearcă să determine tipul corect de unitate prin parsarea numelui fiecărui câmp. **Tipul unității trebuie inclus ca sufix.** AdvantageScope suportă o varietate de scheme de denumire. Câteva opțiuni valide sunt enumerate mai jos:

- **Camel/pascal-case**, cum ar fi `PositionMeters`, `velocityRadPerSec` și `TimestampS`
- **Snake-case**, cum ar fi `position_meters`, `velocity_rad_per_sec` și `timestamp_s`
- **Separatori prin spațiu**, cum ar fi `position meters`, `velocity rad per sec` și `timestamp s`

Denumirea _nu_ este sensibilă la majuscule/minuscule când se utilizează snake-case sau separatori prin spațiu.

:::tip
Dacă unitățile sunt parsate incorect, dați clic pe `Unități manuale` > `Dezactivează unitățile automate` pentru a ignora informațiile despre unități. Conversia manuală poate fi apoi utilizată pentru a comuta la unități alternative.
:::

## Conversie manuală {#manual-conversion}

Când metadatele unităților nu sunt disponibile sau sunt inexacte, axele pot fi de asemenea configurate manual pentru a converti între unități (sau pentru a ignora complet metadatele unităților).

Pentru a configura conversia manuală, dați clic pe cele trei puncte de lângă titlul axei și apoi pe `Unități manuale` > `Editează conversia`. Selectați tipul unității, unitatea sursă și unitatea țintă. Fiecare valoare este de asemenea multiplicată cu „Factorul suplimentar”, permițând conversii personalizate (cum ar fi rapoarte de transmisie, conversii de la unghiular la liniar sau alte unități nefurnizate de AdvantageScope). Factorul poate fi de asemenea introdus folosind o expresie matematică, cum ar fi `1.5*pi`.

:::tip
Pentru a activa sau dezactiva rapid conversia unităților, dați clic pe cele trei puncte de lângă titlul axei și alegeți `Presetări recente` sau `Resetează unitățile`.
:::

<img src="/img/tab-reference/line-graph/units-2.webp" alt="Editarea conversiei unităților" height="250" />

_Interfața în limba engleză este ilustrată mai sus._
