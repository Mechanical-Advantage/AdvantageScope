---
sidebar_position: 1
---

# Mod de ajustare

Unele surse live suportă ajustarea în timp real a valorilor numerice și booleene. De exemplu, această caracteristică poate fi utilizată pentru a [ajusta amplificările controllerului](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) când sunteți conectat la o sursă NetworkTables. Rețineți că codul robotului trebuie să suporte primirea amplificărilor prin NetworkTables.

În mod implicit, toate valorile din AdvantageScope sunt doar pentru citire. Pentru a comuta modul de ajustare, **dați clic pe pictograma glisor** din dreapta bării de căutare când sunteți conectat la o sursă live suportată. Când pictograma este mov, modul de ajustare este activ și editarea câmpurilor este activată.

- Pentru a edita un **câmp numeric**, introduceți o valoare nouă folosind caseta de text din dreapta câmpului în bara laterală. Valoarea este publicată după ce caseta este deselectată sau este apăsată tasta „Enter”. Lăsați caseta de text necompletată pentru a utiliza valoarea publicată de robot.
- Pentru a comuta un **câmp boolean**, dați clic pe cercul roșu sau verde din dreapta câmpului în bara laterală.

:::warning
Această caracteristică nu este destinată controlului robotului pe teren. Intrările în stil panou de bord (dashboard), cum ar fi opțiunile de selecție (choosers), butoanele de declanșare etc. nu sunt suportate.
:::

## Ajustarea cu AdvantageKit

Câmpurile publicate de AdvantageKit în subtabelul `AdvantageKit` sunt doar pentru ieșire și nu pot fi editate. Cu toate acestea, utilizatorii pot publica câmpuri din codul utilizatorului care pot fi ajustate din AdvantageScope. **Orice câmpuri publicate în tabelul „/Tuning” pe NetworkTables vor apărea sub tabelul „Tuning” când se utilizează sursa live „NetworkTables (AdvantageKit)”.**

De exemplu, un număr ajustabil poate fi publicat folosind clasa [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs):

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
Subtabelul `NetworkInputs` **nu poate fi editat**, deoarece este utilizat de AdvantageKit pentru a înregistra valori de rețea pentru logare și reluare. Utilizați tabelul `Tuning` pentru a interacționa cu intrările de rețea în timp real.
:::
