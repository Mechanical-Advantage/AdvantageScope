---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ Mecanism {#mechanism}

Fila mecanism afișează un mecanism articulat creat cu unul sau mai multe obiecte [Mechanism2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html).

<img src="/img/tab-reference/mechanism-1.webp" alt="Prezentare generală a filei mecanism" />

_Interfața în limba engleză este ilustrată mai sus._

<details>
<summary>Controale cronologie</summary>

Cronologia este utilizată pentru a controla redarea și vizualizarea. Dând clic pe cronologie se selectează un timp, iar dând clic dreapta se deselectează. Timpul selectat este sincronizat în toate filele, făcând ușoară găsirea rapidă a acestei locații în alte vizualizări.

Secțiunile galbene indică momentul în care robotul este în modul autonom, secțiunile albastre indică momentul în care robotul este în modul teleoperat, iar secțiunile gri indică momentul în care robotul este în modul utilitar.

Pentru a mări, plasați cursorul peste cronologie și derulați în sus sau în jos. Un interval poate fi de asemenea selectat prin clic și tragere în timp ce țineți apăsată tasta `Shift`. Mutați-vă la stânga și la dreapta prin derulare orizontală (pe dispozitivele suportate) sau prin clic și tragere pe cronologie. Când sunteți conectat live, derularea spre stânga deblochează timpul curent, iar derularea până la capăt în dreapta blochează din nou timpul curent. Apăsați `Ctrl+\` pentru a mări la perioada în care robotul este activat.

<img src="/img/tab-reference/timeline.webp" alt="Cronologie" />

</details>

## Adăugarea mecanismelor {#adding-mechanisms}

Pentru a începe, trageți un `Mechanism2d` în panoul de control. Ștergeți un mecanism folosind butonul X sau ascundeți-l temporar dând clic pe pictograma ochi sau dând dublu clic pe numele câmpului. Pentru a elimina toate mecanismele, dați clic pe coșul de gunoi de lângă titlul axei și apoi pe `Șterge tot`. Mecanismele pot fi reorganizate în listă prin clic și tragere.

## Publicarea datelor {#publishing-data}

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

Pentru a publica date despre mecanism folosind WPILib, trimiteți un obiect `Mechanism2d` în NetworkTables (arătat mai jos). Dacă înregistrarea datelor este activată, mecanismele pot fi vizualizate de asemenea pe baza fișierului WPILOG generat.

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);
SmartDashboard.putData("MyMechanism", mechanism);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

Pentru a publica date despre mecanism folosind AdvantageKit, înregistrați un `Mechanism2d` ca un câmp de ieșire (arătat mai jos). Rețineți că acest apel înregistrează doar starea curentă a `Mechanism2d`, astfel încât trebuie apelat în fiecare ciclu de buclă după ce obiectul este actualizat.

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);
Logger.recordOutput("MyMechanism", mechanism);
```

</TabItem>
</Tabs>
