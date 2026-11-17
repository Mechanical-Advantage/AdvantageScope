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

Cronologia controlează redarea și vizualizarea. Dacă dai clic pe cronologie, selectezi un moment de timp, iar cu clic dreapta îl deselectezi. Timpul selectat este sincronizat în toate filele, astfel încât să poți găsi rapid același moment și în alte vizualizări.

Secțiunile galbene arată când robotul este în modul autonom, cele albastre când este în modul teleoperat, iar cele gri când este în modul utilitar.

Pentru a mări, plasează cursorul peste cronologie și derulează în sus sau în jos. Poți selecta un interval și prin clic și tragere în timp ce ții apăsată tasta `Shift`. Mută-te la stânga și la dreapta prin derulare orizontală (pe dispozitivele suportate) sau prin clic și tragere pe cronologie. Când ești conectat live, derularea spre stânga deblochează redarea de la timpul curent, iar derularea până la capăt în dreapta o blochează din nou la timpul curent. Apasă `Ctrl+\` pentru a mări la intervalul în care robotul este activat.

<img src="/img/tab-reference/timeline.webp" alt="Cronologie" />

</details>

## Adăugarea surselor {#adding-sources}

Pentru a începe, trage un câmp în secțiunea „Surse”. Șterge o sursă folosind butonul X sau ascunde-o temporar dând clic pe pictograma ochi ori dublu clic pe numele câmpului. Pentru a elimina toate obiectele, dă clic pe coșul de gunoi de lângă titlul secțiunii și apoi pe `Șterge tot`. Poți reorganiza sursele în listă prin clic și tragere.

**Pentru a personaliza fiecare sursă, dă clic pe pictograma colorată sau clic dreapta pe numele câmpului.** Poți ajusta simbolul, culoarea și dimensiunea fiecărei surse.

:::tip
Pentru a vedea o listă completă a tipurilor de surse suportate, dă clic pe pictograma `?`. Lista include și tipurile de date suportate.
:::

## Formatul datelor {#data-format}

Datele punctelor trebuie publicate ca structură codificată pe octeți (byte-encoded struct) sau protobuf, folosind tipul `Translation2d[]`. Multe biblioteci suportă acest format, inclusiv WPILib și AdvantageKit. Codul de exemplu de mai jos arată cum poți înregistra datele de puncte în Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Telemetry.log("MyTranslations",
  new Translation2d[] {
    new Translation2d(0.0, 1.0),
    new Translation2d(2.0, 3.0)
  });
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
