---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Режим настройки {#tuning-mode}

Некоторые источники реального времени поддерживают изменение числовых и логических значений на лету. Например, эту функцию можно использовать для [настройки коэффициентов регулятора](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) при подключении к источнику NetworkTables. Обратите внимание, что код робота должен поддерживать получение коэффициентов через NetworkTables.

По умолчанию все значения в AdvantageScope предназначены только для чтения. Чтобы переключить режим настройки, **нажмите иконку ползунка** справа от строки поиска при подключении к поддерживаемому источнику в реальном времени. Когда иконка фиолетовая, режим настройки активен и редактирование полей включено.

- Чтобы отредактировать **числовое поле**, введите новое значение в текстовое поле справа от поля на боковой панели. Значение публикуется после снятия фокуса с поля ввода или нажатия клавиши «Enter». Оставьте текстовое поле пустым, чтобы использовать значение, опубликованное роботом.
- Чтобы переключить **логическое поле**, нажмите на красный или зелёный круг справа от поля на боковой панели.
- Чтобы скопировать все опубликованные значения в буфер обмена, **нажмите правой кнопкой мыши на иконку ползунка** и выберите **«Скопировать настроенные значения»**.

:::tip
Для пользователей iPhone и iPad **AdvantageTune** — это альтернативный вариант, созданный разработчиками AdvantageScope для настройки значений NetworkTables с мобильных устройств.

[<img src="/img/app-store_ru.svg" alt="App Store" />](https://apps.apple.com/kz/app/advantagetune/id6811453643?l=ru)
:::

## Tunables в WPILib {#wpilib-tunables}

В WPILib такие значения, как числа и логические значения, можно настроить с помощью API Tunable, что позволяет изменять их из AdvantageScope в реальном времени. Настраиваемые значения регистрируются один раз и могут периодически считываться в коде робота:

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
import org.wpilib.tunable.TunableBoolean;
import org.wpilib.tunable.TunableDouble;
import org.wpilib.tunable.Tunables;

TunableDouble tunableNumber = Tunables.addDouble("MyTunableNumber", 0.0);
TunableBoolean tunableBoolean = Tunables.addBoolean("MyTunableBoolean", false);

// Периодически считывайте значения
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

// Периодически считывайте значения
double num = tunableNumber.Get();
bool boolVal = tunableBoolean.Get();
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import tunables

tunable_number = tunables.add_double("MyTunableNumber", 0.0)
tunable_boolean = tunables.add_boolean("MyTunableBoolean", False)

# Периодически считывайте значения
num = tunable_number.get()
bool_val = tunable_boolean.get()
```

</TabItem>
</Tabs>

## Настройка с AdvantageKit {#tuning-with-advantagekit}

Поля, опубликованные AdvantageKit в подтаблицу `AdvantageKit`, предназначены только для вывода и не могут редактироваться. Однако пользователи могут публиковать из пользовательского кода поля, которые можно настраивать в AdvantageScope. **Любые поля, опубликованные в таблицу `/Tuning` в NetworkTables, будут отображаться в таблице `Tuning` при использовании источника реального времени «NetworkTables (AdvantageKit)».**

Например, настраиваемое число можно опубликовать с помощью класса [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs):

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::note
Обратите внимание, что ключи должны начинаться с ведущего слеша (например, `/Tuning/MyTunableNumber`, а не `Tuning/MyTunableNumber`).
:::

:::warning
Подтаблица `NetworkInputs` **не может редактироваться**, так как она используется AdvantageKit для записи сетевых значений для логирования и воспроизведения. Для взаимодействия с сетевыми входными параметрами в реальном времени используйте таблицу `Tuning`.
:::
