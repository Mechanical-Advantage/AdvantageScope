import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 👀 Teren 3D {#3d-field}

Fila teren 3D îți arată o vizualizare 3D a robotului și a terenului. O poți folosi cu pose-uri 2D obișnuite, dar este utilă mai ales când lucrezi cu calcule 3D (cum ar fi localizarea cu AprilTags). Ai la dispoziție mai multe moduri de cameră, inclusiv relativă la teren, relativă la robot și fixă. Cu [AdvantageScope XR](advantagescope-xr), poți vizualiza această filă și în realitate augmentată. Cronologia arată când robotul este activat și te ajută să navighezi prin datele din log.

<img src="/img/tab-reference/3d-field/3d-field-1.webp" alt="Exemplu de filă teren 3D" />

_Mai sus este prezentată interfața în limba engleză._

<details>
<summary>Controale cronologie</summary>

Cronologia controlează redarea și vizualizarea. Fă clic pe cronologie pentru a selecta un moment, iar clic dreapta pentru a-l deselecta. Momentul selectat este sincronizat în toate filele, astfel încât poți găsi rapid aceeași poziție și în alte vizualizări.

Secțiunile galbene arată când robotul este în autonom, cele albastre când este în teleoperat, iar cele gri când este în modul utilitar.

Pentru a face zoom, pune cursorul peste cronologie și derulează în sus sau în jos. Poți selecta și un interval făcând clic și trăgând în timp ce ții apăsată tasta `Shift`. Mută-te la stânga și la dreapta prin derulare orizontală (pe dispozitivele suportate) sau făcând clic și trăgând pe cronologie. Când ești conectat live, derularea spre stânga deblochează cronologia de la momentul curent, iar derularea până la capăt în dreapta o blochează din nou pe momentul curent. Apasă `Ctrl+\` pentru a face zoom pe perioada în care robotul este activat.

<img src="/img/tab-reference/timeline.webp" alt="Cronologie" />

</details>

:::warning Teren FTC 2026-2027
Modelul terenului FTC 2026-2027 nu include AprilTag-uri integrate, deoarece pozițiile tag-urilor de pe structură (hive) se pot schimba în timpul meciului. Echipele pot publica un `Pose3d[]` și `number[]` pentru a adăuga obiecte AprilTag dinamice pe teren. Dimensiunea corectă a AprilTag-ului pentru acest teren este **3,25 in**.
:::

:::warning Teren FRC 2026
Modelul terenului FRC 2026 respectă layout-ul AprilTag pentru terenul **sudat** (welded). Diferențele dintre terenurile sudate și cele AndyMark sunt foarte mici, dar pot apărea decalaje minore (~0,5 inch) atunci când vizualizezi pose-uri AprilTag bazate pe layout-ul terenului AndyMark.
:::

## Adăugarea obiectelor {#adding-objects}

Pentru a începe, trage un câmp în secțiunea „Pose-uri”. Șterge un obiect folosind butonul X sau ascunde-l temporar făcând clic pe pictograma ochi ori dublu clic pe numele câmpului. Pentru a elimina toate obiectele, fă clic pe coșul de gunoi de lângă titlul axei și apoi pe `Elimină tot`. Poți reorganiza obiectele în listă făcând clic și trăgând.

**Pentru a personaliza un element, fă clic pe pictograma colorată sau clic dreapta pe numele câmpului.** AdvantageScope suportă o gamă largă de tipuri de obiecte, iar multe dintre ele pot fi personalizate (de exemplu, poți schimba culorile și modelele de robot). Unele trebuie adăugate ca elemente copil ale unui obiect existent.

:::tip
Pentru a vedea lista completă a tipurilor suportate, fă clic pe pictograma `?`. Lista include și tipurile de date suportate, precum și dacă trebuie adăugate ca elemente copil.
:::

:::info
AdvantageScope suportă mai multe dimensiuni de AprilTags pentru terenurile FTC. Dimensiunile se măsoară ca **lungimea laturii secțiunii negre a AprilTag-ului**, fără a include bordura albă obligatorie.
:::

## Formatul datelor {#data-format}

Datele de geometrie trebuie publicate ca structură codificată pe octeți (byte-encoded struct) sau protobuf. Sunt suportate diverse tipuri de geometrie 2D și 3D, inclusiv `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` și altele.

Multe biblioteci suportă formatul struct, inclusiv WPILib și AdvantageKit. Codul de exemplu de mai jos arată cum se înregistrează datele de pose 3D.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose3d[] {poseA, poseB});
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::math::Pose3d poseA;
wpi::math::Pose3d poseB;

wpi::telemetry::Log("MyPose", poseA);
wpi::telemetry::Log("MyPoseArray", std::vector{poseA, poseB});
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
from wpimath import Pose3d
import telemetry

pose_a = Pose3d()
pose_b = Pose3d()

telemetry.log("MyPose", pose_a)
telemetry.log("MyPoseArray", [pose_a, pose_b], element_type=Pose3d)
```

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

Pentru a vizualiza datele mecanismelor înregistrate cu un [`Mechanism2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html), adaugă câmpul mecanismului la un obiect robot sau fantomă existent. Mecanismul este proiectat pe planul XZ sau YZ al robotului folosind forme simple, ca în imaginea de mai jos. Fă clic pe pictograma rotiță sau clic dreapta pe numele câmpului pentru a comuta între planurile XZ și YZ. Originea robotului este centrată pe marginea inferioară a mecanismului.

<img src="/img/tab-reference/3d-field/3d-field-2.webp" alt="Mecanism 2D" />

### Componente 3D {#3d-components}

:::warning
Configurarea componentelor 3D poate fi complexă și consumatoare de timp. Poți folosi în schimb suportul `Mechanism2d` din AdvantageScope descris mai sus, care oferă o variantă mult mai simplă de a vizualiza mecanismele pe terenul 3D.
:::

Mecanismele pot fi vizualizate cu componente articulate prin înregistrarea unui set de pose-uri 3D care reprezintă pozițiile fiecărei componente relativ la robot. Adaugă pose-urile la un obiect robot sau fantomă existent și setează tipul obiectului la „Componentă”.

Fiecare componentă poate fi mișcată independent (cum ar fi un cărucior de elevator, un braț sau un efector final). Dacă folosești AdvantageKit, merită să iei în considerare metoda [`generate3dMechanism()`](https://docs.advantagekit.org/data-flow/supported-types#mechanisms-output-only) pentru a converti un `Mechanism2d` într-un tablou de obiecte `Pose3d`. Pentru mai multe informații despre configurarea roboților cu componente, consultă [Resurse personalizate](/more-features/custom-assets).

<img src="/img/tab-reference/3d-field/3d-field-3.webp" alt="Mecanism 3D" />

## Obiecte piesă de joc {#game-piece-objects}

Fiecare teren include un set de tipuri de obiecte piese de joc, astfel încât piesele de joc să poată fi randate oriunde pe teren pe baza datelor publicate de codul robotului. Aceasta are multe utilizări, printre care:

- Vizualizarea acțiunilor din rutinele autonome simulate cu animații simple
- Afișarea pozițiilor detectate ale pieselor de joc pe teren
- Indicarea locului în care se află piesele de joc în interiorul robotului
- Vizualizarea traiectoriilor de lansare pe baza calculelor fizice

Un alt caz simplu de utilizare este afișarea stării pieselor de joc din interiorul robotului pe baza datelor de la senzori. De exemplu, un senzor cu barieră fotoelectrică (beam break) de pe traseul notei la un robot din 2024 poate face ca o notă să apară în vizualizare (ca mai jos).

<details>
<summary>Exemplu de cod</summary>

Proiectul exemplu KitBot 2024 din AdvantageKit include o [comandă](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/util/NoteVisualizer.java) simplă care animează o notă ce se deplasează de la robot către Speaker. Această comandă este integrată în [secvența standard de lansare](https://github.com/Mechanical-Advantage/AdvantageKit/blob/18a0219f60108e3dc1e8512d59fcba0e657770af/example_projects/kitbot_2024/src/main/java/frc/robot/subsystems/launcher/Launcher.java#L73), declanșând animația de fiecare dată când o notă este lansată. [Acest videoclip](https://youtube.com/shorts/-HxfDo9f19U?feature=share) arată cum pot fi folosite animațiile pieselor de joc pentru a vizualiza rutine autonome în mai multe jocuri diferite.

</details>

<img src="/img/tab-reference/3d-field/3d-field-4.webp" alt="Vizualizarea notei KitBot 2024" />

## Opțiuni cameră {#camera-options}

Pentru a schimba modul camerei, fă clic dreapta pe vizualizarea 3D a terenului. Modul și poziția camerei sunt controlate independent pentru fiecare fereastră pop-up, așa că poți crea ușor vizualizări din mai multe unghiuri.

:::info
Fă clic dreapta pe vizualizarea 3D a terenului și alege „Setează FOV” pentru a ajusta FOV-ul camerelor de orbitare și Driver Station.
:::

### Orbitare teren {#orbit-field}

Acesta este modul implicit, în care poți mișca liber camera față de teren. **Clic stânga + tragere** rotește camera, iar **clic dreapta + tragere** o deplasează (pan). **Derulează** pentru a mări și micșora.

:::tip
Poți controla camera și din tastatură: tastele **WASD** o deplasează, **IJKL** o rotesc, iar **E** și **Q** o mișcă pe verticală.
:::

### Orbitare robot {#orbit-robot}

Acest mod are aceleași comenzi ca „Orbitare teren”, dar poziția camerei este blocată relativ la robot, ceea ce îți permite să îl urmărești în mișcare.

### Driver Station {#driver-station}

Acest mod blochează camera în spatele uneia dintre pozițiile Driver Station, la înălțimea tipică a ochilor. Poți alege manual stația dorită sau poți selecta „Auto” pentru a folosi alianța și numărul stației salvate în datele de log.

:::warning
Selectarea automată a numărului stației poate fi inexactă pentru logurile generate cu AdvantageKit 2023 sau o versiune anterioară.
:::

### Cameră fixă {#fixed-camera}

Fiecare model de robot este configurat cu un set de camere fixe, cum ar fi camerele de vision și camerele de driver. Aceste camere au poziții, raporturi de aspect și FOV-uri fixe și sunt foarte utile pentru a verifica datele de vision sau a simula perspectiva driverului. În exemplul de mai jos este prezentată o cameră de driver.

<img src="/img/tab-reference/3d-field/3d-field-5.webp" alt="Cameră fixă" />

Dacă furnizezi un pose de „Suprascriere cameră”, acesta înlocuiește pose-urile implicite ale tuturor camerelor fixe, păstrând în același timp FOV-urile și raporturile de aspect configurate. Astfel, codul robotului poate trimite poziția unei camere mobile, cum ar fi una montată pe o turelă sau pe hood-ul lansatorului.

:::info
La fel ca în cazul celorlalte date de pose, pose-ul de „Suprascriere cameră” trebuie să fie _relativ la teren_, nu relativ la robot.
:::

## Configurare {#configuration}

Poți selecta modelul terenului din meniul derulant. Toate jocurile recente FRC și FTC sunt suportate. Pentru dispozitivele cu performanță grafică limitată, îți recomandăm terenurile „Permanent”. Terenurile „Axe” afișează doar axele XYZ la origine, împreună cu un contur al terenului pentru scară.

:::info
Sistemul de coordonate folosit în această filă poate fi personalizat. Consultă pagina [Sisteme de coordonate](/more-features/coordinate-systems) pentru detalii.
:::

### Moduri de randare {#rendering-modes}

Terenul 3D suportă trei moduri de randare:

- **Cinematic (Stânga):** Randează cu umbre, iluminare, reflexii și modele 3D foarte detaliate pentru un aspect mai realist. Necesită un GPU destul de puternic.
- **Standard (Centru):** Modul implicit; randează cu iluminare minimă și modele 3D simplificate. Rulează bine pe majoritatea dispozitivelor.
- **Consum redus (Dreapta):** Scade frecvența cadrelor, rezoluția și nivelul de detaliu al modelelor pentru a economisi bateria și a oferi o performanță mai constantă pe dispozitivele mai slabe.

<img src="/img/tab-reference/3d-field/3d-field-6.webp" alt="Compararea modurilor de randare" />

Pentru a configura modul de randare, deschide fereastra de preferințe făcând clic pe `Aplicație` > `Afișează preferințele...` (Windows/Linux) sau `AdvantageScope` > `Setări...` (macOS). Setarea „Mod 3D (baterie)” poate fi modificată față de valoarea implicită pentru a suprascrie modul de randare folosit pe un laptop când nu este la încărcat — util, de exemplu, ca să economisești bateria la competiții.

<img src="/img/prefs_ro.webp" alt="Diagramă de preferințe" height="450" />
