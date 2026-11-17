---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 Teren 2D {#2d-field}

Fila teren 2D îți arată o vizualizare 2D a robotului suprapusă pe o hartă a terenului. Poate afișa și date suplimentare, cum ar fi starea țintirii vizuale și pose-uri de referință.

<img src="/img/tab-reference/2d-field-1.webp" alt="Prezentare generală a filei teren 2D" />

_Mai sus este prezentată interfața în limba engleză._

<details>
<summary>Controale cronologie</summary>

Cronologia controlează redarea și vizualizarea. Fă clic pe cronologie pentru a selecta un moment, iar clic dreapta pentru a-l deselecta. Momentul selectat este sincronizat în toate filele, astfel încât poți găsi rapid aceeași poziție și în alte vizualizări.

Secțiunile galbene arată când robotul este în autonom, cele albastre când este în teleoperat, iar cele gri când este în modul utilitar.

Pentru a face zoom, pune cursorul peste cronologie și derulează în sus sau în jos. Poți selecta și un interval făcând clic și trăgând în timp ce ții apăsată tasta `Shift`. Mută-te la stânga și la dreapta prin derulare orizontală (pe dispozitivele suportate) sau făcând clic și trăgând pe cronologie. Când ești conectat live, derularea spre stânga deblochează cronologia de la momentul curent, iar derularea până la capăt în dreapta o blochează din nou pe momentul curent. Apasă `Ctrl+\` pentru a face zoom pe perioada în care robotul este activat.

<img src="/img/tab-reference/timeline.webp" alt="Cronologie" />

</details>

## Comenzi cameră {#camera-controls}

Derulează în sus și în jos peste teren pentru a mări sau micșora. Fă clic și trage pentru a te deplasa pe teren. Fă clic dreapta oriunde pe teren pentru a deschide meniul camerei, unde ai următoarele opțiuni:

- **Deblocat**: Deplasarea și zoomul sunt manuale.
- **Blocat pe robot**: Camera se deplasează automat pentru a urmări robotul.
- **Blocat pe robot și rotație**: Camera se deplasează și se rotește automat pentru a urmări robotul și orientarea acestuia.

În oricare dintre modurile blocate, poți muta liber camera departe de robot. Butoanele de orientare din panoul de control pot fi folosite pentru a roti camera în orice mod.

## Adăugarea obiectelor {#adding-objects}

Pentru a începe, trage un câmp în secțiunea „Pose-uri”. Șterge un obiect folosind butonul X sau ascunde-l temporar făcând clic pe pictograma ochi ori dublu clic pe numele câmpului. Pentru a elimina toate obiectele, fă clic pe coșul de gunoi de lângă titlul axei și apoi pe `Șterge tot`. Poți reorganiza obiectele în listă făcând clic și trăgând.

**Pentru a personaliza un element, fă clic pe pictograma colorată sau clic dreapta pe numele câmpului.** AdvantageScope suportă o gamă largă de tipuri de obiecte, iar multe dintre ele pot fi personalizate (de exemplu, poți schimba culorile). Unele trebuie adăugate ca elemente copil ale unui obiect existent.

:::tip
Pentru a vedea lista completă a tipurilor suportate, fă clic pe pictograma `?`. Lista include și tipurile de date suportate, precum și dacă trebuie adăugate ca elemente copil.
:::

<img src="/img/tab-reference/2d-field-2.webp" alt="Teren 2D cu obiecte" />

## Formatul datelor {#data-format}

Datele de geometrie trebuie publicate ca structură codificată pe octeți (byte-encoded struct) sau protobuf. Sunt suportate diverse tipuri de geometrie 2D și 3D, inclusiv `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` și altele.

Multe biblioteci suportă formatul struct, inclusiv WPILib și AdvantageKit. Codul de exemplu de mai jos arată cum se înregistrează datele de pose 2D în Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

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

## Configurare {#configuration}

- **Teren:** Imaginea terenului pe care vrei să o folosești. Toate jocurile recente FRC și FTC sunt suportate. Pentru a adăuga o imagine de teren personalizată, consultă [Resurse personalizate](/more-features/custom-assets).
- **Orientare:** Orientarea imaginii terenului în panoul de vizualizare.
- **Dimensiune:** Lungimea laturii robotului (30/27/24 inch pentru FRC, 18/16/14 inch pentru FTC).

:::info
Sistemul de coordonate folosit în această filă poate fi personalizat. Consultă pagina [Sisteme de coordonate](/more-features/coordinate-systems) pentru detalii.
:::
