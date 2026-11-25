---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Mode de réglage {#tuning-mode}

Certaines sources en direct permettent de modifier des valeurs numériques et booléennes en temps réel. Vous pouvez par exemple vous en servir pour [régler les gains d'un contrôleur](https://docs.wpilib.org/fr/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) via NetworkTables (à condition que le code du robot soit prévu pour recevoir ces gains par NetworkTables).

Par défaut, toutes les valeurs affichées dans AdvantageScope sont en lecture seule. Pour passer en mode de réglage, **cliquez sur l'icône de curseurs** à droite de la barre de recherche lorsque vous êtes connecté à une source compatible. Quand l'icône devient violette, le mode de réglage est actif et vous pouvez modifier les champs.

- Pour modifier un **champ numérique**, saisissez une nouvelle valeur dans la zone de texte à droite du champ dans la barre latérale. La valeur est envoyée dès que vous quittez le champ ou appuyez sur « Entrée ». Laissez le champ vide pour revenir à la valeur publiée par le robot.
- Pour basculer un **champ booléen**, cliquez sur le cercle rouge ou vert à droite du champ dans la barre latérale.
- Pour copier toutes les valeurs modifiées dans le presse-papiers, **faites un clic droit sur l'icône de curseurs** et choisissez **« Copier les valeurs réglées »**.

:::tip
Pour les utilisateurs d'iPhone et d'iPad, **AdvantageTune** est une alternative créée par les développeurs d'AdvantageScope pour régler les valeurs NetworkTables depuis un appareil mobile.

[<img src="/img/app-store_fr.svg" alt="App Store" />](https://apps.apple.com/ca/app/advantagetune/id6811453643?l=fr)
:::

## Tunables WPILib {#wpilib-tunables}

Dans WPILib, des valeurs telles que les nombres et les booléens peuvent être configurées à l'aide de l'API Tunable, ce qui permet de les ajuster en temps réel depuis AdvantageScope. Les valeurs réglables sont enregistrées une fois et peuvent être lues périodiquement dans le code du robot :

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
import org.wpilib.tunable.TunableBoolean;
import org.wpilib.tunable.TunableDouble;
import org.wpilib.tunable.Tunables;

TunableDouble tunableNumber = Tunables.addDouble("MyTunableNumber", 0.0);
TunableBoolean tunableBoolean = Tunables.addBoolean("MyTunableBoolean", false);

// Lire les valeurs périodiquement
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

// Lire les valeurs périodiquement
double num = tunableNumber.Get();
bool boolVal = tunableBoolean.Get();
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import tunables

tunable_number = tunables.add_double("MyTunableNumber", 0.0)
tunable_boolean = tunables.add_boolean("MyTunableBoolean", False)

# Lire les valeurs périodiquement
num = tunable_number.get()
bool_val = tunable_boolean.get()
```

</TabItem>
</Tabs>

## Régler des valeurs avec AdvantageKit {#tuning-with-advantagekit}

Les champs publiés par AdvantageKit dans la sous-table `AdvantageKit` sont en lecture seule. Vous pouvez toutefois exposer vos propres champs réglables depuis votre code robot. **Tous les champs publiés dans la table « /Tuning » de NetworkTables apparaîtront dans la table « Tuning » lorsque vous utilisez la source en direct « NetworkTables (AdvantageKit) ».**

Par exemple, vous pouvez créer un nombre réglable avec la classe [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs) :

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::note
Notez que les clés doivent inclure le slash initial (par exemple `/Tuning/MyTunableNumber`, et non `Tuning/MyTunableNumber`).
:::

:::warning
La sous-table `NetworkInputs` **ne peut pas être modifiée**, car AdvantageKit l'utilise pour enregistrer les entrées réseau en vue de la journalisation et de la relecture. Utilisez toujours la table `Tuning` pour ajuster des paramètres en temps réel.
:::
