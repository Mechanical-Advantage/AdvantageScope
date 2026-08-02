---
sidebar_position: 11
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📍 Puncte {#points}

Fila puncte afișează o vizualizare 2D a unor puncte arbitrare. Acesta este un instrument foarte flexibil, permițând vizualizări personalizate ale datelor/pipeline-urilor de viziune, stărilor mecanismelor etc.

<img src="/img/tab-reference/points-1.png" alt="Point tab example" />

<details>
<summary>Controale cronologie</summary>

Cronologia este utilizată pentru a controla redarea și vizualizarea. Dând clic pe cronologie se selectează un timp, iar dând clic dreapta se deselectează. Timpul selectat este sincronizat în toate filele, făcând ușoară găsirea rapidă a acestei locații în alte vizualizări.

Secțiunile galbene indică momentul în care robotul este în modul autonom, secțiunile albastre indică momentul în care robotul este în modul teleoperat, iar secțiunile gri indică momentul în care robotul este în modul utilitar.

Pentru a mări, plasați cursorul peste cronologie și derulați în sus sau în jos. Un interval poate fi de asemenea selectat prin clic și tragere în timp ce țineți apăsată tasta `Shift`. Mutați-vă la stânga și la dreapta prin derulare orizontală (pe dispozitivele suportate) sau prin clic și tragere pe cronologie. Când sunteți conectat live, derularea spre stânga deblochează timpul curent, iar derularea până la capăt în dreapta blochează din nou timpul curent. Apăsați `Ctrl+\` pentru a mări la perioada în care robotul este activat.

<img src="/img/tab-reference/timeline.png" alt="Timeline" />

</details>

## Adăugarea surselor {#adding-sources}

Pentru a începe, trageți un câmp în secțiunea „Surse”. Ștergeți o sursă folosind butonul X sau ascundeți-o temporar dând clic pe pictograma ochi sau dând dublu clic pe numele câmpului. Pentru a elimina toate obiectele, dați clic pe coșul de gunoi de lângă titlul axei și apoi pe `Șterge tot`. Sursele pot fi reorganizate în listă prin clic și tragere.

**Pentru a personaliza fiecare sursă, dați clic pe pictograma colorată sau dați clic dreapta pe numele câmpului.** Simbolul, culoarea și dimensiunea fiecărei surse pot fi ajustate.

:::tip
Pentru a vedea o listă completă a tipurilor de surse suportate, dați clic pe pictograma `?`. Această listă include de asemenea tipurile de date suportate.
:::

## Formatul datelor {#data-format}

Datele punctelor ar trebui publicate ca o structură codificată pe octeți (byte-encoded struct) sau protobuf, folosind tipul `Translation2d[]`. Multe biblioteci suportă acest format, inclusiv WPILib și AdvantageKit. Codul de exemplu de mai jos arată cum se înregistrează datele de puncte în Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
StructArrayPublisher<Translation2d> publisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyTranslations", Translation2d.struct).publish();

periodic() {
  publisher.set(new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
  publisher.set(
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  );
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Logger.recordOutput("MyTranslations",
  new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
Logger.recordOutput("MyTranslations",
  new Translation2d(0.0, 1.0),
  new Translation2d(2.0, 3.0)
);
```

</TabItem>
</Tabs>

## Configurare {#configuration}

Următoarele opțiuni de configurare sunt disponibile:

- **Dimensiuni:** Dimensiunea zonei de afișare. Aceasta poate utiliza orice unități care se potrivesc cu punctele publicate. Când se afișează date de viziune, aceasta este rezoluția camerei.
- **Orientare:** Sistemul de coordonate de utilizat (orientarea axelor X și Y).
- **Origine:** Poziția originii în sistemul de coordonate.
