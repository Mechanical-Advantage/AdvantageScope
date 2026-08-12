import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 👀 Teren 3D {#3d-field}

Terenul 3D prezintă o vizualizare 3D a robotului și a terenului. Poate fi utilizat cu pose-uri 2D obișnuite, dar este deosebit de util când se lucrează cu calcule 3D (cum ar fi localizarea cu AprilTags). Sunt disponibile mai multe vizualizări de cameră, inclusiv relativă la teren, relativă la robot și fixă. [AdvantageScope XR](advantagescope-xr) permite ca această filă să fie vizualizată folosind realitatea augmentată. Cronologia arată când robotul este activat și poate fi utilizată pentru a naviga prin datele de log.

<img src="/img/tab-reference/3d-field/3d-field-1.webp" alt="Exemplu de filă teren 3D" />

<details>
<summary>Controale cronologie</summary>

Cronologia este utilizată pentru a controla redarea și vizualizarea. Dând clic pe cronologie se selectează un timp, iar dând clic dreapta se deselectează. Timpul selectat este sincronizat în toate filele, făcând ușoară găsirea rapidă a acestei locații în alte vizualizări.

Secțiunile galbene indică momentul în care robotul este în modul autonom, secțiunile albastre indică momentul în care robotul este în modul teleoperat, iar secțiunile gri indică momentul în care robotul este în modul utilitar.

Pentru a mări, plasați cursorul peste cronologie și derulați în sus sau în jos. Un interval poate fi de asemenea selectat prin clic și tragere în timp ce țineți apăsată tasta `Shift`. Mutați-vă la stânga și la dreapta prin derulare orizontală (pe dispozitivele suportate) sau prin clic și tragere pe cronologie. Când sunteți conectat live, derularea spre stânga deblochează timpul curent, iar derularea până la capăt în dreapta blochează din nou timpul curent. Apăsați `Ctrl+\` pentru a mări la perioada în care robotul este activat.

<img src="/img/tab-reference/timeline.webp" alt="Cronologie" />

</details>

:::warning
Modelul terenului FRC 2026 este consecvent cu configurarea AprilTag pentru terenul **sudat** (welded). Diferențele dintre terenurile sudate și AndyMark sunt foarte minore, dar pot exista mici alinieri eronate (~0,5 inchi) la vizualizarea pose-urilor AprilTag bazate pe configurarea terenului AndyMark.
:::

## Adăugarea obiectelor {#adding-objects}

Pentru a începe, trageți un câmp în secțiunea „Pose-uri”. Ștergeți un obiect folosind butonul X sau ascundeți-l temporar dând clic pe pictograma ochi sau dând dublu clic pe numele câmpului. Pentru a elimina toate obiectele, dați clic pe coșul de gunoi de lângă titlul axei și apoi pe `Șterge tot`. Obiectele pot fi reorganizate în listă prin clic și tragere.

**Pentru a personaliza fiecare obiect, dați clic pe pictograma colorată sau dați clic dreapta pe numele câmpului.** AdvantageScope suportă un număr mare de tipuri de obiecte, dintre care multe pot fi personalizate (cum ar fi schimbarea culorilor și a modelelor de roboți). Unele obiecte trebuie adăugate ca obiecte copil la un obiect existent.

:::tip
Pentru a vedea o listă completă a tipurilor de obiecte suportate, dați clic pe pictograma `?`. Această listă include de asemenea tipurile de date suportate și dacă obiectele trebuie adăugate ca obiecte copil.
:::

:::info
AdvantageScope suportă mai multe dimensiuni de AprilTags pentru terenurile FTC. Dimensiunile sunt măsurate ca **lungimea laturii secțiunii negre a AprilTag-ului**, fără a include bordura albă obligatorie.
:::

## Formatul datelor {#data-format}

Datele de geometrie ar trebui publicate ca o structură codificată pe octeți (byte-encoded struct) sau protobuf. Diverse tipuri de geometrie 2D și 3D sunt suportate, inclusiv `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` și multe altele.

Multe biblioteci suportă formatul struct, inclusiv WPILib și AdvantageKit. Codul de exemplu de mai jos arată cum se înregistrează datele de pose 3D în Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

StructPublisher<Pose3d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose3d.struct).publish();
StructArrayPublisher<Pose3d> arrayPublisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyPoseArray", Pose3d.struct).publish();

periodic() {
  publisher.set(poseA);
  arrayPublisher.set(new Pose3d[] {poseA, poseB});
}
```

:::tip
Clasa [`Field2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/field2d-widget.html) din WPILib poate fi utilizată de asemenea pentru a înregistra mai multe seturi de date de pose 2D împreună.
:::

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose3d[] {poseA, poseB});
```

</TabItem>
<TabItem value="ftcdashboard" label="FTC Dashboard">

```java
// This protocol does not support the modern struct format, but pose
// values can be published using separate fields that include the
// suffixes "x", "y", and "heading" (as shown below):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // Inches
packet.put("Pose y", 2.8); // Inches
packet.put("Pose heading", 3.14); // Radians

// Alternatively, headings can be published in degrees
packet.put("Pose heading (deg)", 180.0); // Degrees
```

</TabItem>
</Tabs>

## Mecanisme și componente {#mechanisms-and-components}

Datele mecanismelor pot fi vizualizate folosind mecanisme 2D sau componente 3D articulate.

### Mecanisme 2D {#2d-mechanisms}

Pentru a vizualiza datele mecanismelor înregistrate folosind un [`Mechanism2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html), adăugați câmpul mecanismului la un obiect robot sau fantomă existent. Mecanismul este proiectat pe planul XZ sau YZ al robotului folosind casete simple, așa cum se arată mai jos. Dați clic pe pictograma rotiță sau dați clic dreapta pe numele câmpului pentru a comuta între planurile XZ și YZ. Originea robotului este centrată pe marginea inferioară a mecanismului.

<img src="/img/tab-reference/3d-field/3d-field-2.webp" alt="Mecanism 2D" />

### Componente 3D {#3d-components}

:::warning
Configurarea componentelor 3D poate fi complexă și necesită timp. Luați în considerare utilizarea suportului `Mechanism2d` al AdvantageScope așa cum este descris mai sus, care oferă o abordare mai simplificată pentru vizualizarea mecanismelor pe terenul 3D.
:::

Mecanismele pot fi vizualizate cu componente articulate prin înregistrarea unui set de pose-uri 3D care reprezintă locațiile relative la robot ale fiecărei componente. Adăugați pose-urile la un obiect robot sau fantomă existent și setați tipul obiectului la „Componentă”.

Fiecare componentă poate fi mutată independent (cum ar fi un cărucior de elevator, un braț sau un efector final). Utilizatorii AdvantageKit ar trebui să ia în considerare utilizarea metodei [`generate3dMechanism()`](https://docs.advantagekit.org/data-flow/supported-types#mechanisms-output-only) pentru a converti un Mechanism2d într-un tablou de obiecte Pose3d. Pentru mai multe informații despre configurarea roboților cu componente, consultați [Resurse personalizate](/more-features/custom-assets).

<img src="/img/tab-reference/3d-field/3d-field-3.webp" alt="Mecanism 3D" />

## Obiecte piesă de joc {#game-piece-objects}

Fiecare teren include un set de tipuri de obiecte piese de joc, permițând ca piesele de joc să fie randate în orice poziție pe teren folosind datele publicate de codul robotului. Aceasta are o varietate de aplicații, inclusiv:

- Vizualizarea acțiunilor rutinelor autonome simulate folosind animații simple
- Afișarea locațiilor detectate ale pieselor de joc pe teren
- Indicarea locului în care sunt situate piesele de joc în interiorul unui robot
- Vizualizarea traiectoriilor de lansare pe baza calculelor fizice

Un alt caz simplu de utilizare este afișarea stării pieselor de joc în interiorul robotului pe baza datelor de la senzori. De exemplu, un senzor cu barieră fotoelectrică (beam break) din traseul notei pentru un robot din 2024 ar putea determina apariția unei note (așa cum se arată mai jos).

<details>
<summary>Exemplu de cod</summary>

Proiectul exemplu KitBot 2024 al AdvantageKit include un exemplu simplu de [comandă](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/util/NoteVisualizer.java) care animează o notă ce se deplasează de la robot la difuzor (speaker). Această comandă este incorporată în [secvența standard de lansare](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/subsystems/launcher/Launcher.java#L73), declanșând animația de fiecare dată când o notă este eliberată. [Acest videoclip](https://youtube.com/shorts/-HxfDo9f19U?feature=share) arată cum animațiile pieselor de joc pot fi utilizate pentru a vizualiza rutine autonome pentru mai multe jocuri diferite.

</details>

<img src="/img/tab-reference/3d-field/3d-field-4.webp" alt="Vizualizarea notei KitBot 2024" />

## Opțiuni cameră {#camera-options}

Pentru a comuta modul de cameră selectat, dați clic dreapta pe vizualizarea terenului randat. Modul și poziția camerei sunt controlate independent pentru fiecare fereastră pop-up, permițând crearea ușoară a vizualizărilor cu mai multe camere.

:::info
Dați clic dreapta pe vizualizarea terenului randat și dați clic pe „Setează FOV...” pentru a ajusta FOV-ul camerelor de orbitare și Driver Station.
:::

### Orbitare teren {#orbit-field}

Acesta este modul de cameră implicit, în care camera poate fi mutată liber relativ la teren. **Clic stânga + tragere** rotește camera, iar **clic dreapta + tragere** panoramează camera. **Derulați** pentru a mări și micșora.

:::tip
Camera poate fi de asemenea controlată folosind tastatura. Tastele **WASD** sunt utilizate pentru translație, tastele **IJKL** sunt utilizate pentru rotație, iar tastele **E** și **Q** sunt utilizate pentru translație verticală.
:::

### Orbitare robot {#orbit-robot}

Acest mod are aceleași controale ca modul „Orbitare teren”, dar poziția camerei este blocată relativ la robot. Acest lucru permite cadre de urmărire ale mișcării robotului.

### Driver Station {#driver-station}

Acest mod blochează camera în spatele uneia dintre stațiile de conducere (Driver Station) la înălțimea tipică a ochilor. Fie alegeți manual stația de vizualizat, fie alegeți „Auto” pentru a utiliza alianța și numărul stației stocate în datele de log.

:::warning
Selectarea automată a numărului stației poate fi inexactă la vizualizarea datelor de log produse de AdvantageKit 2023 sau anterior.
:::

### Cameră fixă {#fixed-camera}

Fiecare model de robot este configurat cu un set de camere fixe, cum ar fi camerele de viziune și camerele șoferului. Aceste camere au poziții, raporturi de aspect și FOV-uri fixe. Aceste vizualizări sunt adesea utile pentru a verifica datele de viziune sau pentru a simula o vizualizare a camerei șoferului. În exemplul de mai jos este prezentată o cameră a șoferului.

<img src="/img/tab-reference/3d-field/3d-field-5.webp" alt="Cameră fixă" />

Dacă este furnizată o pose de „Suprascriere cameră”, aceasta înlocuiește pose-urile implicite ale tuturor camerelor fixe, păstrând în același timp FOV-urile și raporturile de aspect configurate. Acest lucru permite codului robotului să furnizeze poziția unei camere mobile, cum ar fi una montată pe o turelă sau pe hota lansatorului.

:::info
În mod consecvent cu alte date de pose, pose-ul de „Suprascriere cameră” trebuie să fie _relativ la teren_, nu relativ la robot.
:::

## Configurare {#configuration}

Modelul terenului poate fi configurat folosind meniul derulant. Toate jocurile recente FRC și FTC sunt suportate. Recomandăm utilizarea terenurilor „Evergreen” pentru dispozitivele cu performanță grafică limitată. Terenurile „Axe” afișează doar axele XYZ la origine cu un contur al terenului pentru scară.

:::info
Sistemul de coordonate utilizat pe această filă este personalizabil. Consultați pagina [sistem de coordonate](/more-features/coordinate-systems) pentru detalii.
:::

### Moduri de randare {#rendering-modes}

Terenul 3D suportă trei moduri de randare:

- **Cinematic:** Randează folosind umbre, iluminare, reflexii și modele 3D de înaltă detaliere pentru un aspect mai realist. Necesită un GPU destul de puternic.
- **Standard (implicit):** Randează cu iluminare minimă și modele 3D simplificate. Rulează bine pe majoritatea dispozitivelor.
- **Consum redus:** Reduce frecvența cadrelor, rezoluția și detaliile modelului pentru a reduce consumul bateriei și a oferi o performanță mai consecventă pe dispozitivele mai slabe.

<img src="/img/tab-reference/3d-field/3d-field-6.webp" alt="Compararea modurilor de randare" />

Pentru a configura modul de randare, deschideți fereastra de preferințe dând clic pe `Aplicație` > `Afișează preferințele...` (Windows/Linux) sau `AdvantageScope` > `Setări...` (macOS). Setarea „Mod 3D (baterie)” poate fi comutată de la valoarea implicită pentru a suprascrie modul de randare utilizat pe un laptop când nu se încarcă. De exemplu, aceasta poate fi utilizată pentru a economisi bateria în timpul competiției.

<img src="/img/prefs_ro.webp" alt="Diagramă de preferințe" height="350" />
