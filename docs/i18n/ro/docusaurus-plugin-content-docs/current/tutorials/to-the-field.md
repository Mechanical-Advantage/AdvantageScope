---
sidebar_position: 2
---

# 🤖 Pe teren: vizualizarea robotului

Acum că ai telemetria de bază funcțională, este timpul să îți vizualizezi robotul! AdvantageScope oferă vizualizatoare puternice de teren 2D și 3D care aduc la viață odometria, estimările de viziune, traiectoriile și mecanismele articulate pe modele de teren FRC și FTC.

În acest tutorial vei învăța cum să:

- Publici date structurate de pose folosind **API-ul Telemetry**.
- Folosești filele **🗺️ Teren 2D** și **👀 Teren 3D** pentru a vizualiza mișcarea robotului.
- Publici și randezi un mecanism atât în 2D, cât și în 3D.

## 1. Publicarea pose-urilor

În WPILib, obiectele geometrice precum `Pose2d`, `Pose3d` și `Translation2d` sunt folosite pentru a reprezenta locația robotului și a elementelor de pe teren. Cu **API-ul Telemetry**, poți înregistra pose-uri/translații și tablouri (cum ar fi trasee planificate sau ținte vizuale) direct cu un singur apel de metodă:

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

<details>
<summary>Exemplu de OpMode</summary>

Vrei să încerci funcționalitățile de vizualizare ale AdvantageScope fără un proiect complet de robot? Copiază OpMode-ul de mai jos, care publică mai multe pose-uri 2D și 3D în scop demonstrativ pe un model de teren FRC. Consultă 👋 [Salut, telemetrie!](/tutorials/hello-telemetry) pentru detalii despre crearea unui nou proiect WPILib și configurarea lui pentru telemetrie.

```java
@Teleop
public class ExampleTeleop implements OpMode {
  @Override
  public void periodic() {
    double t = Timer.getTimestamp();

    // Generează o traiectorie circulară de conducere ca exemplu
    double x = 2.0 * Math.cos(t * 0.5);
    double y = 2.0 * Math.sin(t * 0.5);
    Rotation2d rotation = Rotation2d.fromRadians(t * 0.5 + Math.PI / 2.0);
    Pose2d robotPose2d = new Pose2d(x, y, rotation);

    // Creează un exemplu de pose 3D (de ex. din localizarea prin viziune sau pitch/roll al giroscopului)
    Pose3d robotPose3d = new Pose3d(x, y, 0.0, new Rotation3d(0.0, 0.0, rotation.getRadians()));

    // Creează un exemplu de traiectorie (un tablou de obiecte Pose2d)
    Pose2d[] trajectory = new Pose2d[] {
        new Pose2d(8.0, 4.0, Rotation2d.ZERO),
        new Pose2d(10.0, 4.0, Rotation2d.ZERO),
        new Pose2d(10.0, 6.0, Rotation2d.CW_PI_2)
    };

    // Înregistrează pose-uri individuale 2D și 3D
    Telemetry.log("Field/RobotPose2d", robotPose2d);
    Telemetry.log("Field/RobotPose3d", robotPose3d);

    // Înregistrează un tablou de pose-uri (de ex. traiectorie sau pose-uri AprilTag)
    Telemetry.log("Field/Trajectory", trajectory);
  }
}
```

</details>

În AdvantageScope, valorile geometrice din bara laterală sunt etichetate cu tipul lor. De asemenea, poți extinde fiecare câmp pentru a examina componentele individuale ale pose-ului, cum ar fi valorile X, Y și rotația:

<img src="/img/tutorials/to-the-field-1.webp" alt="Vizualizarea datelor de pose în bara laterală AdvantageScope." />

_Mai sus este prezentată interfața în limba engleză._

## 2. Vizualizarea datelor 2D

Fila 🗺️ [Teren 2D](/tab-reference/2d-field) afișează o vedere de sus a robotului tău suprapusă pe arena de competiție.

1. În AdvantageScope, dă clic pe butonul **+** din bara de file și selectează **Teren 2D** (sau selectează o filă Teren 2D existentă).
2. Din meniul derulant „Teren” din panoul de control de jos, selectează sezonul curent al jocului sau un teren permanent.
3. În arborele din bara laterală, găsește `NT:/Telemetry/Field/RobotPose2d` și trage-l în lista „Pose-uri” din panoul de control.
4. Robotul tău va apărea pe teren!
5. Dă clic pe pictograma de lângă pose din panoul de control pentru a schimba culoarea robotului.

:::info Controalele camerei

Dă clic dreapta oriunde pe suprafața terenului pentru a alege între **Deblocat**, **Blocat pe robot** (se deplasează odată cu robotul) sau **Blocat pe robot și rotație** (rotește terenul astfel încât robotul să fie mereu orientat în sus). Dă clic pe butoanele de sub „Orientare” pentru a ajusta rotația.
:::

<img src="/img/tutorials/to-the-field-2.webp" alt="Vizualizarea robotului pe terenul FRC 2026." />

_Mai sus este prezentată interfața în limba engleză._

## 3. Schimbarea tipurilor de obiecte

AdvantageScope suportă multe tipuri de obiecte vizuale dincolo de simple pose-uri ale robotului, inclusiv fantome (roboți translucizi), traiectorii, ținte vizuale, hărți termice, AprilTag-uri, piese de joc și multe altele! Pentru a explora ce tipuri de obiecte poate randa AdvantageScope:

1. Dă clic pe pictograma `?` (Ajutor) situată în panoul de control.
2. Se va deschide o fereastră care enumeră toate tipurile vizuale suportate, tipurile de date așteptate (de ex. `Pose2d`, `Pose3d[]`, `Translation2d`) și dacă pot fi adăugate ca elemente independente sau ca elemente secundare atașate unui alt obiect.

Dă clic pe pictograma de lângă fiecare pose din panoul de control pentru a schimba tipul obiectului. Încearcă să schimbi pose-ul robotului într-un alt tip de obiect, cum ar fi o fantomă, o săgeată sau o hartă termică!

<img src="/img/tutorials/to-the-field-3.webp" alt="Fereastra de ajutor integrată pentru terenul 2D." height="500" />

_Mai sus este prezentată interfața în limba engleză._

## 4. Vizualizarea datelor 3D

Fila 👀 [Teren 3D](/tab-reference/3d-field) randează un teren 3D complet cu elemente de joc, iluminare și modele de roboți personalizabile.

1. Dă clic pe **+** în bara de file și selectează **Teren 3D** (sau selectează o filă Teren 3D existentă).
2. Selectează modelul sezonului tău de joc din meniul derulant „Teren”.
3. Trage `NT:/Telemetry/Field/RobotPose3d` sau `NT:/Telemetry/Field/RobotPose2d` în secțiunea „Pose-uri” (pose-urile 2D sunt plasate automat pe podeaua terenului).
4. Trage `NT:/Telemetry/Field/Trajectory` în lista „Pose-uri” și setează-i tipul la **Traiectorie** pentru a randa un traseu ca o panglică pe teren.
5. Dă clic și trage cu **butonul stâng al mouse-ului** pentru a roti camera în jurul terenului. Trage cu **butonul drept al mouse-ului** pentru a deplasa vederea. Derulează pentru a face zoom.
6. Alternativ, folosește **WASD** pentru a te deplasa, **IJKL** pentru a roti și **Q/E** pentru a urca și coborî.
7. Dă clic dreapta în fereastra 3D pentru a comuta între **Orbitare robot**, **Driver Station** (vezi meciul din perspectiva alianței tale) și **Cameră fixă** (vezi din camerele de viziune de pe robot).

<img src="/img/tutorials/to-the-field-4.webp" alt="Fila Teren 3D randând un model 3D de robot care navighează pe teren cu o panglică de traiectorie." />

_Mai sus este prezentată interfața în limba engleză._

## 5. Publicarea datelor mecanismelor

Dacă robotul tău are structuri articulate precum un elevator, un braț sau o încheietură, le poți vizualiza folosind `Mechanism2d` din WPILib. Consultă [documentația](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html) WPILib pentru detalii. Mai jos este prezentat un exemplu pentru un braț cu o singură articulație.

```java
public class ExampleTeleop implements OpMode {
  // Creează o pânză de mecanism 2D (lățime 2 m, înălțime 2 m)
  private final Mechanism2d mechanism = new Mechanism2d(2.0, 2.0);
  private MechanismLigament2d arm;

  public ExampleTeleop(Robot robot) {
    // Creează un braț cu rădăcina la (1 m, 0,5 m)
    MechanismRoot2d root = mechanism.getRoot("ArmRoot", 1.0, 0.5);
    arm = root.append(new MechanismLigament2d("Arm", 0.8, 0.0, 6.0, new Color8Bit(255, 100, 0)));
  }

  @Override
  public void periodic() {
    // Animează unghiul brațului
    double angle = 45.0 + 45.0 * Math.sin(Timer.getTimestamp() * 2.0);
    arm.setAngle(angle);

    // Publică starea mecanismului la fiecare ciclu de buclă
    Telemetry.log("Superstructure/Mechanism", mechanism);
  }
}
```

## 6. Vizualizarea mecanismelor în 2D

Fila ⚙️ [Mecanism](/tab-reference/mechanism) poate fi folosită pentru a vizualiza mecanismele în 2D.

1. Dă clic pe **+** în bara de file și selectează **Mecanism**.
2. Trage `NT:/Telemetry/Superstructure/Mechanism` în panoul de control. Vei vedea brațul 2D animat mișcându-se în timp real.

<img src="/img/tutorials/to-the-field-5.webp" alt="Fila Mecanism afișând o vizualizare 2D a unui braț articulat." />

_Mai sus este prezentată interfața în limba engleză._

## 7. Vizualizarea mecanismelor în 3D

Poți proiecta același `Mechanism2d` direct pe robotul tău în fila Teren 3D!

1. Pe fila Teren 3D, asigură-te că pose-ul robotului tău este adăugat în lista „Pose-uri”.
2. Trage `NT:/Telemetry/Superstructure/Mechanism` **peste intrarea pose-ului robotului** din lista de obiecte (ca obiect secundar).
3. Mecanismul 2D este proiectat în spațiul 3D pe șasiul robotului! Dă clic pe pictograma rotiță dințată de lângă mecanism pentru a comuta între planurile **XZ** (profil lateral) și **YZ** (profil frontal).

<img src="/img/tutorials/to-the-field-6.webp" alt="Fila Teren 3D afișând un mecanism proiectat pe un model 3D de robot." />

_Mai sus este prezentată interfața în limba engleză._

## Ce urmează?

Acum că poți vizualiza mișcarea și mecanismele robotului în 2D și 3D:

- **🕹️ [Preluarea controlului: DS și joystick-uri](/tutorials/taking-control):** Învață cum să te integrezi cu FIRST Driver Station, să lucrezi cu logurile DS și să vizualizezi intrările de la controllere.
- **👀 [Teren 3D](/tab-reference/3d-field):** Un ghid complet al filei Teren 3D, inclusiv vizualizarea pieselor de joc, opțiunile camerei și modurile de randare.
- **[AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr):** Adu vizualizarea terenului 3D la viață în realitate augmentată pe iPhone și iPad.
- **🎬 [Video](/tab-reference/video):** Compară vizualizarea terenului alături de filmări reale ale meciurilor.
- **🦀 [Swerve](/tab-reference/swerve):** Vizualizează starea mecanismelor de tracțiune swerve, inclusiv suprapuneri pe terenurile 2D și 3D.
- **⚙️ [Resurse personalizate](/more-features/custom-assets):** Adaugă modele CAD personalizate, mecanisme articulate și imagini/modele de teren.
