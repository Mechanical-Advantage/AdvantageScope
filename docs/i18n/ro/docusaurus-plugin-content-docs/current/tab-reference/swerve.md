---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 Swerve

Fila swerve afișează starea a patru module swerve, inclusiv vectorii de viteză, pozițiile de repaus, rotația robotului și vitezele șasiului.

<img src="/img/tab-reference/swerve-1.png" alt="Overview of swerve tab" />

<details>
<summary>Controale cronologie</summary>

Cronologia este utilizată pentru a controla redarea și vizualizarea. Dând clic pe cronologie se selectează un timp, iar dând clic dreapta se deselectează. Timpul selectat este sincronizat în toate filele, făcând ușoară găsirea rapidă a acestei locații în alte vizualizări.

Secțiunile galbene indică momentul în care robotul este în modul autonom, secțiunile albastre indică momentul în care robotul este în modul teleoperat, iar secțiunile gri indică momentul în care robotul este în modul utilitar.

Pentru a mări, plasați cursorul peste cronologie și derulați în sus sau în jos. Un interval poate fi de asemenea selectat prin clic și tragere în timp ce țineți apăsată tasta `Shift`. Mutați-vă la stânga și la dreapta prin derulare orizontală (pe dispozitivele suportate) sau prin clic și tragere pe cronologie. Când sunteți conectat live, derularea spre stânga deblochează timpul curent, iar derularea până la capăt în dreapta blochează din nou timpul curent. Apăsați `Ctrl+\` pentru a mări la perioada în care robotul este activat.

<img src="/img/tab-reference/timeline.png" alt="Timeline" />

</details>

## Adăugarea surselor

Pentru a începe, trageți un câmp în secțiunea „Surse”. Ștergeți o sursă folosind butonul X sau ascundeți-o temporar dând clic pe pictograma ochi sau dând dublu clic pe numele câmpului. Pentru a elimina toate sursele, dați clic pe coșul de gunoi de lângă titlul axei și apoi pe `Șterge tot`. Sursele pot fi reorganizate în listă prin clic și tragere.

**Pentru a personaliza fiecare sursă, dați clic pe pictograma colorată sau dați clic dreapta pe numele câmpului.** AdvantageScope suportă trei tipuri de surse:

- **Vitezele modulelor:** Un set de stări pentru patru module swerve, afișate ca vectori pe diagramă.
- **Vitezele robotului:** Viteze liniare și unghiulare afișate în centrul diagramei.
- **Rotație:** Poziția unghiulară utilizată pentru a roti diagrama.

## Formatul datelor

Datele ar trebui publicate ca o structură codificată pe octeți (byte-encoded struct) sau protobuf, folosind tipurile `SwerveModuleState[]`, `ChassisSpeeds`, `Rotation2d` sau `Rotation3d`.

Multe biblioteci suportă formatul struct, inclusiv WPILib și AdvantageKit. Codul de exemplu de mai jos arată cum se înregistrează stările modulelor swerve în Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
SwerveModuleState[] states = new SwerveModuleState[] {
  new SwerveModuleState(),
  new SwerveModuleState(),
  new SwerveModuleState(),
  new SwerveModuleState()
}

StructArrayPublisher<SwerveModuleState> publisher = NetworkTableInstance.getDefault()
.getStructArrayTopic("MyStates", SwerveModuleState.struct).publish();

periodic() {
  publisher.set(states);
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleState[] states = new SwerveModuleState[] {
  new SwerveModuleState(),
  new SwerveModuleState(),
  new SwerveModuleState(),
  new SwerveModuleState()
}

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

## Configurare

Următoarele opțiuni de configurare sunt disponibile:

- **Viteză maximă (m/s):** Viteza maximă realizabilă a modulelor, utilizată pentru a ajusta dimensiunea vectorilor.
- **Dimensiune cadru (m):** Distanțele dintre modulele swerve stânga-dreapta și față-spate. Modifică raportul de aspect al diagramei robotului.
- **Orientare:** Ajustează direcția în care este îndreptată diagrama robotului. Această opțiune este adesea utilă pentru alinierea cu datele de pose sau videoclipurile meciurilor.

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
