---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 Swerve {#swerve}

Fila swerve afișează starea celor patru module swerve, inclusiv vectorii de viteză, pozițiile de repaus, rotația robotului și vitezele șasiului.

<img src="/img/tab-reference/swerve-1.webp" alt="Prezentare generală a filei swerve" />

_Mai sus este prezentată interfața în limba engleză._

<details>
<summary>Controale cronologie</summary>

Cronologia controlează redarea și vizualizarea. Fă clic pe cronologie pentru a selecta un moment, iar clic dreapta pentru a-l deselecta. Momentul selectat este sincronizat în toate filele, astfel încât poți găsi rapid aceeași poziție și în alte vizualizări.

Secțiunile galbene arată când robotul este în autonom, cele albastre când este în teleoperat, iar cele gri când este în modul utilitar.

Pentru a face zoom, pune cursorul peste cronologie și derulează în sus sau în jos. Poți selecta și un interval făcând clic și trăgând în timp ce ții apăsată tasta `Shift`. Mută-te la stânga și la dreapta prin derulare orizontală (pe dispozitivele suportate) sau făcând clic și trăgând pe cronologie. Când ești conectat live, derularea spre stânga deblochează cronologia de la momentul curent, iar derularea până la capăt în dreapta o blochează din nou pe momentul curent. Apasă `Ctrl+\` pentru a face zoom pe perioada în care robotul este activat.

<img src="/img/tab-reference/timeline.webp" alt="Cronologie" />

</details>

## Adăugarea surselor {#adding-sources}

Pentru a începe, trage un câmp în secțiunea „Surse”. Șterge o sursă folosind butonul X sau ascunde-o temporar dând clic pe pictograma ochi ori dublu clic pe numele câmpului. Pentru a elimina toate sursele, dă clic pe coșul de gunoi de lângă titlul secțiunii și apoi pe `Elimină tot`. Poți reorganiza sursele în listă prin clic și tragere.

**Pentru a personaliza fiecare sursă, dă clic pe pictograma colorată sau clic dreapta pe numele câmpului.** AdvantageScope suportă trei tipuri de surse:

- **Vitezele modulelor:** Un set de stări pentru patru module swerve, afișate ca vectori pe diagramă.
- **Vitezele robotului:** Viteze liniare și unghiulare afișate în centrul diagramei.
- **Rotație:** Poziția unghiulară folosită pentru a roti diagrama.

:::tip
Stările modulelor swerve pot fi vizualizate și pe filele 🗺️ [Teren 2D](/tab-reference/2d-field) și 👀 [Teren 3D](/tab-reference/3d-field).
:::

## Formatul datelor {#data-format}

Datele trebuie publicate ca structură codificată pe octeți (byte-encoded struct) sau protobuf, folosind tipurile `SwerveModuleVelocity[]`, `ChassisVelocities`, `Rotation2d` sau `Rotation3d`.

Multe biblioteci suportă formatul struct, inclusiv WPILib și AdvantageKit. Codul de exemplu de mai jos arată cum poți înregistra stările modulelor swerve.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Telemetry.log("MyStates", states);
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
std::array<wpi::math::SwerveModuleVelocity, 4> states{
  wpi::math::SwerveModuleVelocity{},
  wpi::math::SwerveModuleVelocity{},
  wpi::math::SwerveModuleVelocity{},
  wpi::math::SwerveModuleVelocity{}
};

wpi::telemetry::Log("MyStates", states);
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
from wpimath import SwerveModuleVelocity
import telemetry

states = [
    SwerveModuleVelocity(),
    SwerveModuleVelocity(),
    SwerveModuleVelocity(),
    SwerveModuleVelocity(),
]

telemetry.log("MyStates", states, element_type=SwerveModuleVelocity)
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
SwerveModuleVelocity[] states = new SwerveModuleVelocity[] {
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity(),
  new SwerveModuleVelocity()
};

Logger.recordOutput("MyStates", states);
```

</TabItem>
</Tabs>

:::note
În 2027, această structură de date a fost redenumită din `SwerveModuleState` în `SwerveModuleVelocity`.
Pentru fișierele log create înainte de WPILib 2027 și Systemcore, tipurile vechi `SwerveModuleState` sunt încă suportate pentru vizualizare.
:::

## Configurare {#configuration}

Sunt disponibile următoarele opțiuni de configurare:

- **Viteză maximă (m/s):** Viteza maximă pe care o pot atinge modulele, folosită pentru a scala dimensiunea vectorilor.
- **Dimensiune cadru (m):** Distanțele dintre modulele swerve stânga-dreapta și față-spate. Modifică raportul de aspect al diagramei robotului.
- **Orientare:** Ajustează direcția în care este îndreptată diagrama robotului. Această opțiune este adesea utilă pentru alinierea cu datele de pose sau cu videoclipurile meciurilor.

:::note
[🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
:::
