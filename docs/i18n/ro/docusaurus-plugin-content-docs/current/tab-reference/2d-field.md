---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 Teren 2D

Fila teren 2D prezintă o vizualizare 2D a robotului suprapusă pe o hartă a terenului. De asemenea, poate afișa date suplimentare, cum ar fi starea țintirii vizuale și pose-uri de referință.

<img src="/img/tab-reference/2d-field-1.png" alt="Overview of 2D field tab" />

<details>
<summary>Controale cronologie</summary>

Cronologia este utilizată pentru a controla redarea și vizualizarea. Dând clic pe cronologie se selectează un timp, iar dând clic dreapta se deselectează. Timpul selectat este sincronizat în toate filele, făcând ușoară găsirea rapidă a acestei locații în alte vizualizări.

Secțiunile galbene indică momentul în care robotul este în modul autonom, secțiunile albastre indică momentul în care robotul este în modul teleoperat, iar secțiunile gri indică momentul în care robotul este în modul utilitar.

Pentru a mări, plasați cursorul peste cronologie și derulați în sus sau în jos. Un interval poate fi de asemenea selectat prin clic și tragere în timp ce țineți apăsată tasta `Shift`. Mutați-vă la stânga și la dreapta prin derulare orizontală (pe dispozitivele suportate) sau prin clic și tragere pe cronologie. Când sunteți conectat live, derularea spre stânga deblochează timpul curent, iar derularea până la capăt în dreapta blochează din nou timpul curent. Apăsați `Ctrl+\` pentru a mări la perioada în care robotul este activat.

<img src="/img/tab-reference/timeline.png" alt="Timeline" />

</details>

## Adăugarea obiectelor

Pentru a începe, trageți un câmp în secțiunea „Pose-uri”. Ștergeți un obiect folosind butonul X sau ascundeți-l temporar dând clic pe pictograma ochi sau dând dublu clic pe numele câmpului. Pentru a elimina toate obiectele, dați clic pe coșul de gunoi de lângă titlul axei și apoi pe `Șterge tot`. Obiectele pot fi reorganizate în listă prin clic și tragere.

**Pentru a personaliza fiecare obiect, dați clic pe pictograma colorată sau dați clic dreapta pe numele câmpului.** AdvantageScope suportă un număr mare de tipuri de obiecte, dintre care multe pot fi personalizate (cum ar fi schimbarea culorilor). Unele obiecte trebuie adăugate ca obiecte copil la un obiect existent.

:::tip
Pentru a vedea o listă completă a tipurilor de obiecte suportate, dați clic pe pictograma `?`. Această listă include de asemenea tipurile de date suportate și dacă obiectele trebuie adăugate ca obiecte copil.
:::

<img src="/img/tab-reference/2d-field-2.png" alt="2D field with objects" />

## Formatul datelor

Datele de geometrie ar trebui publicate ca o structură codificată pe octeți (byte-encoded struct) sau protobuf. Diverse tipuri de geometrie 2D și 3D sunt suportate, inclusiv `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` și multe altele.

Multe biblioteci suportă formatul struct, inclusiv WPILib și AdvantageKit. Codul de exemplu de mai jos arată cum se înregistrează datele de pose 2D în Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

StructPublisher<Pose2d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose2d.struct).publish();
StructArrayPublisher<Pose2d> arrayPublisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyPoseArray", Pose2d.struct).publish();

periodic() {
  publisher.set(poseA);
  arrayPublisher.set(new Pose2d[] {poseA, poseB});
}
```

:::tip
Clasa [`Field2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/field2d-widget.html) din WPILib poate fi utilizată de asemenea pentru a înregistra mai multe seturi de date de pose 2D împreună.
:::

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose2d[] {poseA, poseB});
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

// Add other telemetry values here...

FtcDashboard.getInstance().sendTelemetryPacket(packet)

// Alternately, use MultipleTelemetry and the standard SDK telemetry:
// During OpMode Init:
telemetry = new MultipleTelemetry(telemetry,FtcDashboard.getInstance().getTelemetry());

// During Loop:
telemetry.addData("Pose x", 6.3); // Inches
telemetry.addData("Pose y", 2.8); // Inches
telemetry.addData("Pose heading", 3.14); // Radians

// or...
telemetry.addData("Pose heading (deg)", 180.0); // Degrees

// Add other telemetry values here...
telemetry.update();
```

</TabItem>
</Tabs>

## Configurare

- **Teren:** Imaginea terenului de utilizat. Toate jocurile recente FRC și FTC sunt suportate. Pentru a adăuga o imagine de teren personalizată, consultați [Resurse personalizate](/more-features/custom-assets).
- **Orientare:** Orientarea imaginii terenului în panoul de vizualizare.
- **Dimensiune:** Lungimea laturii robotului (30/27/24 inches pentru FRC, 18/16/14 inches pentru FTC).

:::info
Sistemul de coordonate utilizat pe această filă este personalizabil. Consultați pagina [sistem de coordonate](/more-features/coordinate-systems) pentru detalii.
:::
