---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 📝 Неофициальный логгер, совместимый с REV {#unofficial-rev-compatible-logger}

:::info
Новинка 2026 года: REVLib включает официальное решение для логирования для сохранения данных от Spark Max и Spark Flex в CAN-лог REV (`.revlog`). Подробности см. [здесь](https://codedocs.revrobotics.com/java/com/revrobotics/util/statuslogger). Эти файлы можно открывать напрямую в AdvantageScope, но их нельзя точно синхронизировать с другими источниками данных.

_Неофициальный_ логгер, совместимый с REV (URCL) от AdvantageScope, также останется доступным командам в 2026 году для обеспечения плавного перехода и сохранения функционального паритета с предыдущими сезонами. Позже мы поделимся более подробной информацией о вариантах логирования в 2027 году и далее.
:::

URCL (**U**nofficial **R**EV-**C**ompatible **L**ogger) — это библиотека логирования, доступная для Java, C++ и Python, которая автоматически записывает данные со Spark Max и Spark Flex. Это позволяет строить графики в реальном времени и логировать все устройства аналогично [функции построения графиков Tuner X](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) и [сигнальному логгеру Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html) от CTRE.

После настройки периодические кадры CAN со всех устройств Spark Max и Spark Flex публикуются в NetworkTables или DataLog. При использовании NetworkTables для записи данных в файл лога можно использовать [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) от WPILib. Эти кадры можно просматривать в AdvantageScope (см. [Управление файлами логов](/overview/log-files) и [Подключение к источникам в реальном времени](/overview/live-sources)).

- **Все сигналы** захватываются автоматически, **без ручной настройки для новых устройств**.
- **Каждый кадр захватывается**, даже если период фрейма статуса быстрее цикла робота.
- Кадры логируются с **метками времени, основанными на времени приема CAN (CAN RX)**, что обеспечивает более точную характеристику ускорения с помощью [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) по сравнению с традиционным логированием в пользовательском коде (см. «Использование SysId» ниже).
- Логирование **высокоэффективно**; операции выполняются в отдельном потоке и занимают менее 80 мкс за периодический цикл 20 мс, даже при логировании большого количества устройств.
- **Все функции REVLib остаются незатронутыми.**

:::info
Поскольку эта библиотека не является официальным инструментом REV, запросы в службу поддержки следует направлять на [страницу проблем](https://github.com/Mechanical-Advantage/URCL/issues) URCL или по адресу software@team6328.org, а не контактам поддержки REV.
:::

## Настройка {#setup}

Установите vendordep URCL, следуя инструкциям по установке [сторонних библиотек](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html) с использованием менеджера зависимостей в VSCode. Альтернативно вы можете использовать следующий URL-адрес JSON поставщика:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL публикует данные в NetworkTables по умолчанию, откуда они могут быть сохранены в файл лога путем включения DataLogManager от WPILib. Альтернативно URCL может логировать непосредственно в DataLog. Логгер следует запускать в `robotInit`, как показано ниже.

<Tabs>
<TabItem value="java" label="Java" default>

```java
public Robot() {
  // При публикации в NetworkTables и DataLog
  DataLogManager.start();
  URCL.start();

  // При логировании только в DataLog
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="C++">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

Robot::Robot() {
  // При публикации в NetworkTables и DataLog
  frc::DataLogManager::Start();
  URCL::Start();

  // При логировании только в DataLog
  URCL::Start(frc::DataLogManager::GetLog());
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import urcl
import wpilib

class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # При публикации в NetworkTables и DataLog
        wpilib.DataLogManager.start()
        urcl.start()

        # При логировании только в DataLog
        urcl.start(wpilib.DataLogManager.getLog())
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
public Robot() {
  // ...
  Logger.registerURCL(URCL.startExternal());
  Logger.start();
}
```

:::warning
Совместимость URCL с AdvantageKit предоставляется только для удобства; данные, записанные в лог, НЕДОСТУПНЫ в режиме повтора. **Контроллеры двигателей REV всё ещё должны быть частью реализации вводов-выводов (IO) с определенными вводами для поддержки повтора**.
:::

</TabItem>
</Tabs>

Чтобы облегчить идентификацию устройств в логе, CAN ID можно назначить псевдонимы, передав объект map методу `start()` или `startExternal()`. Ключами являются CAN ID, а значениями — строки с именами для использования в логе. Любые устройства, которым не назначен псевдоним, будут логироваться с использованием их имен по умолчанию.

:::warning
Чтобы минимизировать использование шины CAN, большинство фреймов статуса для устройств Spark **отключены по умолчанию**, пока не будет вызван соответствующий метод-геттер. Любые данные, включенные в эти отключенные фреймы статуса, будут недоступны в логе URCL.

Для получения более подробной информации ознакомьтесь с [документацией REVLib](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods). Мы рекомендуем использовать [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) при настройке Spark для ручного включения любых сигналов, которые вы хотите включить в файл лога.
:::

## Использование SysId {#sysid-usage}

1. После настройки URCL, как показано выше, настройте процедуру SysId, используя `null` для потребителя логов механизма. Пример показан ниже для Java. Эта конфигурация может быть выполнена внутри класса подсистемы.

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

```java
// Создание процедуры SysId
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // Нет потребителя логов, так как данные записываются URCL
    subsystem
  )
);

// Методы ниже возвращают объекты Command
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
// Создание процедуры SysId
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(
    null, null, null,
    (state) -> Logger.recordOutput("SysIdTestState", state.toString())
  ),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // Нет потребителя логов, так как данные записываются URCL
    subsystem
  )
);

// Методы ниже возвращают объекты Command
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);
```

</TabItem>
</Tabs>

2. Запустите процедуру SysId на роботе. Команды SysId могут быть настроены как автопрограммы или привязаны к триггеру кнопки.

3. Скачайте файл лога и откройте его в AdvantageScope. В панели меню перейдите в **Файл > Экспортировать данные...**. Установите формат в «WPILOG», а набор полей в «Включить сгенерированные». Нажмите иконку сохранения и выберите место для сохранения лога.

:::warning
Файл лога с робота должен быть открыт и экспортирован AdvantageScope _перед его открытием с помощью анализатора SysId_. Это необходимо для преобразования данных CAN, записанных URCL, в формат, совместимый с SysId.
:::

4. Откройте анализатор SysId, выполнив поиск «WPILib: Start Tool» в палитре команд VSCode и выбрав «SysId» (или используя ярлык на рабочем столе в Windows). Откройте экспортированный файл лога, нажав «Open data log file...»

5. Выберите следующие поля ниже, чтобы выполнить анализ с использованием энкодера по умолчанию. Также можно использовать данные позиции и скорости от вторичных энкодеров (альтернативных, внешних, аналоговых, абсолютных и т. д.).

   - Позиция = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Скорость = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Напряжение = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
Коэффициенты, созданные SysId, будут использовать единицы, которые настроен сообщать Spark Max/Flex (с использованием [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) и [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>)). По умолчанию это обороты и об/мин (RPM) без применения передаточного отношения. Если единицы, используемые при записи данных, не соответствуют желаемым единицам, масштаб можно настроить в SysId во время анализа.
:::
