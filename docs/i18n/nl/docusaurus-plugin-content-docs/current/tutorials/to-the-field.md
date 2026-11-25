---
sidebar_position: 2
---

# 🤖 Het veld op: robotvisualisatie

Nu je basistelemetrie werkt, is het tijd om je robot te visualiseren! AdvantageScope biedt krachtige 2D- en 3D-veldweergaven die odometrie, visionschattingen, trajecten en scharnierende mechanismen tot leven brengen op FRC- en FTC-veldmodellen.

In deze tutorial leer je hoe je:

- Gestructureerde posedata publiceert met de **Telemetry-API**.
- De tabbladen **🗺️ 2D-veld** en **👀 3D-veld** gebruikt om robotbewegingen te visualiseren.
- Een mechanisme publiceert en weergeeft in zowel 2D als 3D.

## 1. Poses publiceren

In WPILib worden geometrie-objecten zoals `Pose2d`, `Pose3d` en `Translation2d` gebruikt om de locatie van de robot en veldelementen weer te geven. Met de **Telemetry-API** kun je poses/translaties en arrays (zoals geplande paden of vision-targets) rechtstreeks met één methodeaanroep loggen:

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

<details>
<summary>Voorbeeld-OpMode</summary>

Wil je de visualisatiefuncties van AdvantageScope uitproberen zonder een volledig robotproject? Kopieer de onderstaande OpMode, die verschillende 2D- en 3D-poses publiceert ter demonstratie op een FRC-veldmodel. Zie 👋 [Hallo, telemetrie!](/tutorials/hello-telemetry) voor details over het aanmaken van een nieuw WPILib-project en het configureren voor telemetrie.

```java
@Teleop
public class ExampleTeleop implements OpMode {
  @Override
  public void periodic() {
    double t = Timer.getTimestamp();

    // Genereer een cirkelvormig voorbeeldrijtraject
    double x = 2.0 * Math.cos(t * 0.5);
    double y = 2.0 * Math.sin(t * 0.5);
    Rotation2d rotation = Rotation2d.fromRadians(t * 0.5 + Math.PI / 2.0);
    Pose2d robotPose2d = new Pose2d(x, y, rotation);

    // Maak een voorbeeld van een 3D-pose (bijv. uit visionlokalisatie of gyro pitch/roll)
    Pose3d robotPose3d = new Pose3d(x, y, 0.0, new Rotation3d(0.0, 0.0, rotation.getRadians()));

    // Maak een voorbeeldtraject (een array van Pose2d-objecten)
    Pose2d[] trajectory = new Pose2d[] {
        new Pose2d(8.0, 4.0, Rotation2d.ZERO),
        new Pose2d(10.0, 4.0, Rotation2d.ZERO),
        new Pose2d(10.0, 6.0, Rotation2d.CW_PI_2)
    };

    // Log afzonderlijke 2D- en 3D-poses
    Telemetry.log("Field/RobotPose2d", robotPose2d);
    Telemetry.log("Field/RobotPose3d", robotPose3d);

    // Log een array van poses (bijv. traject of AprilTag-poses)
    Telemetry.log("Field/Trajectory", trajectory);
  }
}
```

</details>

In AdvantageScope worden geometriewaarden in de zijbalk gelabeld met hun type. Je kunt elk veld ook uitklappen om de afzonderlijke onderdelen van de pose te bekijken, zoals de X-, Y- en rotatiewaarden:

<img src="/img/tutorials/to-the-field-1.webp" alt="Posedata bekijken in de zijbalk van AdvantageScope." />

_Hierboven zie je de Engelstalige interface._

## 2. 2D-data visualiseren

Het tabblad 🗺️ [2D-veld](/tab-reference/2d-field) toont een bovenaanzicht van je robot op het wedstrijdveld.

1. Klik in AdvantageScope op de knop **+** in de tabbladbalk en kies **2D-veld** (of selecteer een bestaand 2D-veldtabblad).
2. Selecteer het huidige wedstrijdseizoen of een vast veld in het keuzemenu "Veld" in het onderste bedieningspaneel.
3. Zoek in de zijbalkboom `NT:/Telemetry/Field/RobotPose2d` en sleep dit naar de lijst "Poses" in het bedieningspaneel.
4. Je robot verschijnt op het veld!
5. Klik op het pictogram naast de pose in het bedieningspaneel om de kleur van de robot te wijzigen.

:::info Camerabediening

Klik met de rechtermuisknop ergens op het veldcanvas om te kiezen tussen **Ontgrendeld**, **Vergrendeld op robot** (pant mee met de robot) of **Vergrendeld op robot en rotatie** (roteert het veld zodat je robot altijd omhoog wijst). Klik op de knoppen onder "Oriëntatie" om de rotatie aan te passen.
:::

<img src="/img/tutorials/to-the-field-2.webp" alt="Robotvisualisatie op het FRC-veld van 2026." />

_Hierboven zie je de Engelstalige interface._

## 3. Objecttypen wisselen

AdvantageScope ondersteunt veel meer visuele objecttypen dan alleen eenvoudige robotposes, waaronder ghosts (doorkijkrobots), trajecten, vision-targets, heatmaps, AprilTags, speelstukken en meer! Om te ontdekken welke objecttypen AdvantageScope kan weergeven:

1. Klik op het pictogram `?` (Help) in het bedieningspaneel.
2. Er opent een venster met alle ondersteunde visuele typen, de verwachte datatypen (bijv. `Pose2d`, `Pose3d[]`, `Translation2d`) en of ze als zelfstandig item of als onderliggend item aan een ander object kunnen worden toegevoegd.

Klik op het pictogram naast elke pose in het bedieningspaneel om het objecttype te wijzigen. Probeer de robotpose eens te veranderen in een ander objecttype zoals een ghost, pijl of heatmap!

<img src="/img/tutorials/to-the-field-3.webp" alt="Ingebouwd helpvenster voor het 2D-veld." height="500" />

_Hierboven zie je de Engelstalige interface._

## 4. 3D-data visualiseren

Het tabblad 👀 [3D-veld](/tab-reference/3d-field) rendert een volledig 3D-veld inclusief spelelementen, belichting en aanpasbare robotmodellen.

1. Klik op **+** in de tabbladbalk en kies **3D-veld** (of selecteer een bestaand 3D-veldtabblad).
2. Selecteer het model van je wedstrijdseizoen in het keuzemenu "Veld".
3. Sleep `NT:/Telemetry/Field/RobotPose3d` of `NT:/Telemetry/Field/RobotPose2d` naar de sectie "Poses" (2D-poses worden automatisch op de veldvloer geplaatst).
4. Sleep `NT:/Telemetry/Field/Trajectory` naar de lijst "Poses" en stel het type in op **Traject** om een pad als een lint over het veld weer te geven.
5. Klik en sleep met de **linkermuisknop** om de camera rond het veld te draaien. Sleep met de **rechtermuisknop** om te pannen. Scroll om te zoomen.
6. Gebruik anders **WASD** om te verplaatsen, **IJKL** om te draaien en **Q/E** om omhoog en omlaag te bewegen.
7. Klik met de rechtermuisknop in de 3D-weergave om te schakelen tussen **Rond robot draaien**, **Driver Station** (bekijk de wedstrijd vanuit het perspectief van jouw alliantie) en **Vaste camera** (bekijk vanuit visioncamera's op de robot).

<img src="/img/tutorials/to-the-field-4.webp" alt="Tabblad 3D-veld dat een 3D-robotmodel toont dat over het veld rijdt met een trajectlint." />

_Hierboven zie je de Engelstalige interface._

## 5. Mechanismedata publiceren

Als je robot scharnierende constructies heeft zoals een lift, arm of pols, kun je die visualiseren met WPILib's `Mechanism2d`. Zie de WPILib-[documentatie](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html) voor details. Hieronder staat een voorbeeld voor een arm met één scharnierpunt.

```java
public class ExampleTeleop implements OpMode {
  // Maak een 2D-mechanismecanvas (breedte 2 m, hoogte 2 m)
  private final Mechanism2d mechanism = new Mechanism2d(2.0, 2.0);
  private MechanismLigament2d arm;

  public ExampleTeleop(Robot robot) {
    // Maak een arm met wortel op (1 m, 0,5 m)
    MechanismRoot2d root = mechanism.getRoot("ArmRoot", 1.0, 0.5);
    arm = root.append(new MechanismLigament2d("Arm", 0.8, 0.0, 6.0, new Color8Bit(255, 100, 0)));
  }

  @Override
  public void periodic() {
    // Animeer de armhoek
    double angle = 45.0 + 45.0 * Math.sin(Timer.getTimestamp() * 2.0);
    arm.setAngle(angle);

    // Publiceer de mechanismestatus elke loopcyclus
    Telemetry.log("Superstructure/Mechanism", mechanism);
  }
}
```

## 6. Mechanismen in 2D visualiseren

Het tabblad ⚙️ [Mechanisme](/tab-reference/mechanism) kan worden gebruikt om mechanismen in 2D te visualiseren.

1. Klik op **+** in de tabbladbalk en kies **Mechanisme**.
2. Sleep `NT:/Telemetry/Superstructure/Mechanism` naar het bedieningspaneel. Je ziet de geanimeerde 2D-arm in realtime bewegen.

<img src="/img/tutorials/to-the-field-5.webp" alt="Het tabblad Mechanisme met een 2D-visualisatie van een scharnierende arm." />

_Hierboven zie je de Engelstalige interface._

## 7. Mechanismen in 3D visualiseren

Je kunt ditzelfde `Mechanism2d`-object rechtstreeks op je robot projecteren in het tabblad 3D-veld!

1. Zorg ervoor dat je robotpose is toegevoegd aan de lijst "Poses" op het tabblad 3D-veld.
2. Sleep `NT:/Telemetry/Superstructure/Mechanism` **op het item van de robotpose** in de objectenlijst (als onderliggend object).
3. Het 2D-mechanisme wordt in de 3D-ruimte op het robotchassis geprojecteerd! Klik op het tandwielpictogram naast het mechanisme om te wisselen tussen de vlakken **XZ** (zijaanzicht) en **YZ** (vooraanzicht).

<img src="/img/tutorials/to-the-field-6.webp" alt="Tabblad 3D-veld met een mechanisme geprojecteerd op een 3D-robotmodel." />

_Hierboven zie je de Engelstalige interface._

## Wat nu?

Nu je de bewegingen en mechanismen van je robot in 2D en 3D kunt visualiseren:

- **🕹️ [De controle nemen: DS & joysticks](/tutorials/taking-control):** Leer hoe je integreert met het FIRST Driver Station, werkt met DS-logs en controllerinvoer visualiseert.
- **👀 [3D-veld](/tab-reference/3d-field):** Een uitgebreide handleiding voor het tabblad 3D-veld, inclusief visualisatie van speelstukken, cameraopties en rendermodi.
- **[AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr):** Breng de 3D-veldweergave tot leven in augmented reality op iPhone en iPad.
- **🎬 [Video](/tab-reference/video):** Vergelijk je veldvisualisatie naast elkaar met echte wedstrijdbeelden.
- **🦀 [Swerve](/tab-reference/swerve):** Visualiseer de status van swerve-aandrijfmechanismen, inclusief overlays op de 2D- en 3D-velden.
- **⚙️ [Aangepaste assets](/more-features/custom-assets):** Voeg aangepaste CAD-modellen, scharnierende mechanismen en veldafbeeldingen/-modellen toe.
