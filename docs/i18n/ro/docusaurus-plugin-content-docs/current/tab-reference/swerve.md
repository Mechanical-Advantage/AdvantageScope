---
sidebar_position: 9
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🦀 Swerve {#swerve}

Fila swerve afișează starea celor patru module swerve, inclusiv vectorii de viteză, pozițiile de repaus, rotația robotului și vitezele șasiului.

<img src="/img/tab-reference/swerve-1.webp" alt="Prezentare generală a filei swerve" />

_Interfața în limba engleză este ilustrată mai sus._

<details>
<summary>Controale cronologie</summary>

Cronologia controlează redarea și vizualizarea. Dacă dai clic pe cronologie, selectezi un moment de timp, iar cu clic dreapta îl deselectezi. Timpul selectat este sincronizat în toate filele, astfel încât să poți găsi rapid același moment și în alte vizualizări.

Secțiunile galbene arată când robotul este în modul autonom, cele albastre când este în modul teleoperat, iar cele gri când este în modul utilitar.

Pentru a mări, plasează cursorul peste cronologie și derulează în sus sau în jos. Poți selecta un interval și prin clic și tragere în timp ce ții apăsată tasta `Shift`. Mută-te la stânga și la dreapta prin derulare orizontală (pe dispozitivele suportate) sau prin clic și tragere pe cronologie. Când ești conectat live, derularea spre stânga deblochează redarea de la timpul curent, iar derularea până la capăt în dreapta o blochează din nou la timpul curent. Apasă `Ctrl+\` pentru a mări la intervalul în care robotul este activat.

<img src="/img/tab-reference/timeline.webp" alt="Cronologie" />

</details>

## Adăugarea surselor {#adding-sources}

Pentru a începe, trage un câmp în secțiunea „Surse”. Șterge o sursă folosind butonul X sau ascunde-o temporar dând clic pe pictograma ochi ori dublu clic pe numele câmpului. Pentru a elimina toate sursele, dă clic pe coșul de gunoi de lângă titlul secțiunii și apoi pe `Șterge tot`. Poți reorganiza sursele în listă prin clic și tragere.

**Pentru a personaliza fiecare sursă, dă clic pe pictograma colorată sau clic dreapta pe numele câmpului.** AdvantageScope suportă trei tipuri de surse:

- **Vitezele modulelor:** Un set de stări pentru patru module swerve, afișate ca vectori pe diagramă.
- **Vitezele robotului:** Viteze liniare și unghiulare afișate în centrul diagramei.
- **Rotație:** Poziția unghiulară folosită pentru a roti diagrama.

## Formatul datelor {#data-format}

Datele trebuie publicate ca structură codificată pe octeți (byte-encoded struct) sau protobuf, folosind tipurile `SwerveModuleVelocity[]`, `ChassisVelocities`, `Rotation2d` sau `Rotation3d`.

Multe biblioteci suportă formatul struct, inclusiv WPILib și AdvantageKit. Codul de exemplu de mai jos arată cum poți înregistra stările modulelor swerve în Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

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
