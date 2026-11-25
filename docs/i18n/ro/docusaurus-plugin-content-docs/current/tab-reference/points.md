---
sidebar_position: 11
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📍 Puncte {#points}

Fila puncte afișează o vizualizare 2D a unor puncte arbitrare. Este un instrument foarte flexibil, cu care poți crea vizualizări personalizate pentru date sau pipeline-uri de viziune, stări ale mecanismelor etc.

<img src="/img/tab-reference/points-1.webp" alt="Exemplu de filă puncte" />

_Mai sus este prezentată interfața în limba engleză._

<details>
<summary>Controale cronologie</summary>

Cronologia controlează redarea și vizualizarea. Fă clic pe cronologie pentru a selecta un moment, iar clic dreapta pentru a-l deselecta. Momentul selectat este sincronizat în toate filele, astfel încât poți găsi rapid aceeași poziție și în alte vizualizări.

Secțiunile galbene arată când robotul este în autonom, cele albastre când este în teleoperat, iar cele gri când este în modul utilitar.

Pentru a face zoom, pune cursorul peste cronologie și derulează în sus sau în jos. Poți selecta și un interval făcând clic și trăgând în timp ce ții apăsată tasta `Shift`. Mută-te la stânga și la dreapta prin derulare orizontală (pe dispozitivele suportate) sau făcând clic și trăgând pe cronologie. Când ești conectat live, derularea spre stânga deblochează cronologia de la momentul curent, iar derularea până la capăt în dreapta o blochează din nou pe momentul curent. Apasă `Ctrl+\` pentru a face zoom pe perioada în care robotul este activat.

<img src="/img/tab-reference/timeline.webp" alt="Cronologie" />

</details>

## Adăugarea surselor {#adding-sources}

Pentru a începe, trage un câmp în secțiunea „Surse”. Șterge o sursă folosind butonul X sau ascunde-o temporar dând clic pe pictograma ochi ori dublu clic pe numele câmpului. Pentru a elimina toate obiectele, dă clic pe coșul de gunoi de lângă titlul secțiunii și apoi pe `Elimină tot`. Poți reorganiza sursele în listă prin clic și tragere.

**Pentru a personaliza fiecare sursă, dă clic pe pictograma colorată sau clic dreapta pe numele câmpului.** Poți ajusta simbolul, culoarea și dimensiunea fiecărei surse.

:::tip
Pentru a vedea o listă completă a tipurilor de surse suportate, dă clic pe pictograma `?`. Lista include și tipurile de date suportate.
:::

## Formatul datelor {#data-format}

Datele punctelor trebuie publicate ca structură codificată pe octeți (byte-encoded struct) sau protobuf, folosind tipul `Translation2d[]`. Multe biblioteci suportă acest format, inclusiv WPILib și AdvantageKit. Codul de exemplu de mai jos arată cum poți înregistra datele de puncte.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Telemetry.log("MyTranslations",
  new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::telemetry::Log("MyTranslations", std::vector{
  wpi::math::Translation2d{0_m, 1_m},
  wpi::math::Translation2d{2_m, 3_m}
});
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
from wpimath import Translation2d
import telemetry

telemetry.log(
    "MyTranslations",
    [
        Translation2d(0.0, 1.0),
        Translation2d(2.0, 3.0),
    ],
    element_type=Translation2d,
)
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

Sunt disponibile următoarele opțiuni de configurare:

- **Dimensiuni:** Dimensiunea zonei de afișare. Poți folosi orice unități care corespund punctelor publicate. Când afișezi date de viziune, aceasta este rezoluția camerei.
- **Orientare:** Sistemul de coordonate folosit (orientarea axelor X și Y).
- **Origine:** Poziția originii în sistemul de coordonate.
