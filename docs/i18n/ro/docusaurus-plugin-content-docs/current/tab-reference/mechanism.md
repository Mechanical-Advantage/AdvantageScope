---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ Mecanism {#mechanism}

Fila mecanism afișează un mecanism articulat creat cu unul sau mai multe obiecte [Mechanism2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html).

<img src="/img/tab-reference/mechanism-1.webp" alt="Prezentare generală a filei mecanism" />

_Mai sus este prezentată interfața în limba engleză._

<details>
<summary>Controale cronologie</summary>

Cronologia controlează redarea și vizualizarea. Fă clic pe cronologie pentru a selecta un moment, iar clic dreapta pentru a-l deselecta. Momentul selectat este sincronizat în toate filele, astfel încât poți găsi rapid aceeași poziție și în alte vizualizări.

Secțiunile galbene arată când robotul este în autonom, cele albastre când este în teleoperat, iar cele gri când este în modul utilitar.

Pentru a face zoom, pune cursorul peste cronologie și derulează în sus sau în jos. Poți selecta și un interval făcând clic și trăgând în timp ce ții apăsată tasta `Shift`. Mută-te la stânga și la dreapta prin derulare orizontală (pe dispozitivele suportate) sau făcând clic și trăgând pe cronologie. Când ești conectat live, derularea spre stânga deblochează cronologia de la momentul curent, iar derularea până la capăt în dreapta o blochează din nou pe momentul curent. Apasă `Ctrl+\` pentru a face zoom pe perioada în care robotul este activat.

<img src="/img/tab-reference/timeline.webp" alt="Cronologie" />

</details>

## Adăugarea mecanismelor {#adding-mechanisms}

Pentru a începe, trage un `Mechanism2d` în panoul de control. Șterge un mecanism folosind butonul X sau ascunde-l temporar făcând clic pe pictograma ochi ori dublu clic pe numele câmpului. Pentru a elimina toate mecanismele, fă clic pe coșul de gunoi de lângă titlul axei și apoi pe `Elimină tot`. Poți reorganiza mecanismele în listă făcând clic și trăgând.

## Publicarea datelor {#publishing-data}

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

Pentru a publica date despre mecanism folosind WPILib, înregistrează periodic un obiect `Mechanism2d` cu `Telemetry` (ca în exemplul de mai jos). Reține că acest apel salvează doar starea curentă a lui `Mechanism2d`, așa că trebuie apelat în fiecare ciclu de buclă după actualizarea obiectului.

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);

periodic() {
  Telemetry.log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

Pentru a publica date despre mecanism folosind AdvantageKit, înregistrează periodic un `Mechanism2d` drept câmp de ieșire (ca în exemplul de mai jos). Reține că acest apel salvează doar starea curentă a lui `Mechanism2d`, așa că trebuie apelat în fiecare ciclu de buclă după actualizarea obiectului.

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);

periodic() {
  Logger.recordOutput("MyMechanism", mechanism);
}
```

:::tip
Poți folosi adnotarea [@AutoLogOutput](https://docs.advantagekit.org/data-flow/recording-outputs/annotation-logging) din AdvantageKit pentru a înregistra automat starea mecanismului în fiecare ciclu de buclă, fără să mai apelezi `Logger.recordOutput`.
:::

</TabItem>
</Tabs>
