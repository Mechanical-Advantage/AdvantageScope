---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Mod de ajustare {#tuning-mode}

Unele surse live suportă ajustarea în timp real a valorilor numerice și booleene. De exemplu, această funcționalitate poate fi folosită pentru a [ajusta constantele (gains) controllerului](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) când ești conectat la o sursă NetworkTables. Reține că codul robotului trebuie să suporte primirea acestora prin NetworkTables.

În mod implicit, toate valorile din AdvantageScope sunt doar pentru citire. Pentru a comuta modul de ajustare, **dă clic pe pictograma glisor** din dreapta barei de căutare când ești conectat la o sursă live suportată. Când pictograma este mov, modul de ajustare este activ și editarea câmpurilor este permisă.

- Pentru a edita un **câmp numeric**, introdu o valoare nouă folosind caseta de text din dreapta câmpului în bara laterală. Valoarea este publicată după ce caseta este deselectată sau este apăsată tasta „Enter”. Lasă caseta de text necompletată pentru a folosi valoarea publicată de robot.
- Pentru a comuta un **câmp boolean**, dă clic pe cercul roșu sau verde din dreapta câmpului în bara laterală.
- Pentru a copia toate valorile publicate în clipboard, **dă clic dreapta pe pictograma glisor** și selectează **„Copiază valorile ajustate”**.

:::tip
Pentru utilizatorii de iPhone și iPad, **AdvantageTune** este o opțiune alternativă creată de dezvoltatorii AdvantageScope pentru ajustarea valorilor NetworkTables de pe dispozitive mobile.

[<img src="/img/app-store_ro.svg" alt="App Store" />](https://apps.apple.com/ro/app/advantagetune/id6811453643?l=ro)
:::

## Tunables în WPILib {#wpilib-tunables}

În WPILib, valori precum numerele și booleanii pot fi configurate folosind API-ul Tunable, permițând ajustarea lor din AdvantageScope în timp real. Valorile ajustabile sunt înregistrate o singură dată și pot fi citite periodic în codul robotului:

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
import org.wpilib.tunable.TunableBoolean;
import org.wpilib.tunable.TunableDouble;
import org.wpilib.tunable.Tunables;

TunableDouble tunableNumber = Tunables.addDouble("MyTunableNumber", 0.0);
TunableBoolean tunableBoolean = Tunables.addBoolean("MyTunableBoolean", false);

// Citește valorile periodic
double num = tunableNumber.get();
boolean bool = tunableBoolean.get();
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
#include <wpi/tunables/Tunables.hpp>

wpi::tunables::TunableDouble tunableNumber =
    wpi::tunables::Add<double>("MyTunableNumber", 0.0);
wpi::tunables::TunableBool tunableBoolean =
    wpi::tunables::Add<bool>("MyTunableBoolean", false);

// Citește valorile periodic
double num = tunableNumber.Get();
bool boolVal = tunableBoolean.Get();
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import tunables

tunable_number = tunables.add_double("MyTunableNumber", 0.0)
tunable_boolean = tunables.add_boolean("MyTunableBoolean", False)

# Citește valorile periodic
num = tunable_number.get()
bool_val = tunable_boolean.get()
```

</TabItem>
</Tabs>

## Ajustarea cu AdvantageKit {#tuning-with-advantagekit}

Câmpurile publicate de AdvantageKit în subtabelul `AdvantageKit` sunt doar pentru ieșire și nu pot fi editate. Cu toate acestea, utilizatorii pot publica câmpuri din codul robotului care pot fi ajustate din AdvantageScope. **Orice câmp publicat în tabelul „/Tuning” pe NetworkTables va apărea sub tabelul „Tuning” când folosești sursa live „NetworkTables (AdvantageKit)”.**

De exemplu, un număr ajustabil poate fi publicat folosind clasa [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs):

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
Subtabelul `NetworkInputs` **nu poate fi editat**, deoarece este folosit de AdvantageKit pentru a înregistra valori de rețea pentru logare și reluare. Folosește tabelul `Tuning` pentru a interacționa cu intrările de rețea în timp real.
:::
