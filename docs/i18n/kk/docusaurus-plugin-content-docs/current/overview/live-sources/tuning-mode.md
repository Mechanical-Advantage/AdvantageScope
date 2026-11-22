---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Баптау режимі {#tuning-mode}

Кейбір тікелей дереккөздер сандық және булевтік мәндерді тікелей баптауды қолдайды. Мысалы, бұл мүмкіндікті NetworkTables дереккөзіне қосылған кезде [контроллер коэффициенттерін баптау](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) үшін пайдалануға болады. Робот коды NetworkTables арқылы коэффициенттерді қабылдауды қолдауы тиіс екенін ескеріңіз.

Әдепкі бойынша AdvantageScope қолданбасындағы барлық мәндер тек оқуға арналған. Баптау режимін қосу немесе өшіру үшін қолдау көрсетілетін тікелей дереккөзге қосылған кезде іздеу жолағының оң жағындағы **жүгірткі белгішесін басыңыз**. Белгіше күлгін түске боялғанда баптау режимі белсенді болып, өрістерді өңдеу ашылады.

- **Сандық өрісті** өңдеу үшін бүйірлік тақтадағы өрістің оң жағындағы мәтін өрісіне жаңа мән енгізіңіз. Мән енгізу өрісінен фокус алынғаннан кейін немесе «Enter» пернесі басылғанда жарияланады. Робот жариялаған мәнді пайдалану үшін мәтін өрісін бос қалдырыңыз.
- **Булевтік өрісті** ауыстыру үшін бүйірлік тақтадағы өрістің оң жағындағы қызыл немесе жасыл шеңберді басыңыз.
- Барлық жарияланған мәндерді алмасу буферіне көшіру үшін **жүгірткі белгішесін тінтуірдің оң жақ батырмасымен басып**, **«Бапталған мәндерді көшіру»** тармағын таңдаңыз.

:::tip
iPhone және iPad пайдаланушылары үшін **AdvantageTune** — мобильді құрылғылардан NetworkTables мәндерін баптауға арналған AdvantageScope әзірлеушілері жасаған балама нұсқа.

[<img src="/img/app-store_en-US.svg" alt="App Store" />](https://apps.apple.com/kz/app/advantagetune/id6811453643)
:::

## WPILib Tunables {#wpilib-tunables}

WPILib жүйесінде сандар мен булевтік мәндер сияқты мәндерді Tunable API көмегімен баптауға болады, бұл оларды AdvantageScope қолданбасынан нақты уақытта өзгертуге мүмкіндік береді. Бапталатын мәндер бір рет тіркеледі және робот кодында мерзімді түрде оқылуы мүмкін:

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
import org.wpilib.tunable.TunableBoolean;
import org.wpilib.tunable.TunableDouble;
import org.wpilib.tunable.Tunables;

TunableDouble tunableNumber = Tunables.addDouble("MyTunableNumber", 0.0);
TunableBoolean tunableBoolean = Tunables.addBoolean("MyTunableBoolean", false);

// Мәндерді мерзімді түрде оқыңыз
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

// Мәндерді мерзімді түрде оқыңыз
double num = tunableNumber.Get();
bool boolVal = tunableBoolean.Get();
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import tunables

tunable_number = tunables.add_double("MyTunableNumber", 0.0)
tunable_boolean = tunables.add_boolean("MyTunableBoolean", False)

# Мәндерді мерзімді түрде оқыңыз
num = tunable_number.get()
bool_val = tunable_boolean.get()
```

</TabItem>
</Tabs>

## AdvantageKit арқылы баптау {#tuning-with-advantagekit}

AdvantageKit арқылы `AdvantageKit` ішкі кестесіне жарияланған өрістер тек шығысқа арналған және өңделмейді. Дегенмен пайдаланушылар AdvantageScope арқылы баптауға болатын өрістерді өз кодынан жариялай алады. **NetworkTables ішіндегі «/Tuning» кестесіне жарияланған кез келген өріс «NetworkTables (AdvantageKit)» тікелей дереккөзін пайдаланғанда «Tuning» кестесінің астында пайда болады.**

Мысалы, бапталатын санды [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs) класын пайдаланып жариялауға болады:

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
`NetworkInputs` ішкі кестесін **өңдеуге болмайды**, өйткені оны AdvantageKit журналдау және қайта ойнату үшін желілік мәндерді жазуға пайдаланады. Нақты уақытта желілік енгізулермен өзара әрекеттесу үшін `Tuning` кестесін пайдаланыңыз.
:::
