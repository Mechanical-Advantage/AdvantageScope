---
sidebar_position: 1
---

# ✴️ Совместимость с FTC {#ftc-compatibility}

AdvantageScope включает функции, обеспечивающие удобную работу с существующей системой управления FIRST Tech Challenge, одновременно подготавливая переход на [Systemcore](https://community.firstinspires.org/march-updates-on-the-future-robot-controller) в будущих сезонах. Все возможности AdvantageScope будут официально поддерживаться в FTC после перехода на Systemcore, начиная с сезона 2027-2028 годов.

## Поля и роботы {#fields-and-robots}

Поля и 3D-модели роботов FTC полностью поддерживаются «из коробки».

- **Модели полей и роботов:** Выбирайте поля и модели роботов FTC на вкладках 🗺️ [2D поле](/tab-reference/2d-field) и 👀 [3D поле](/tab-reference/3d-field) непосредственно из выпадающих списков. Все поля совместимы с [AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr).
- **Системы координат:** Настройте [систему координат](/more-features/coordinate-systems) для совместимости со [стандартными координатами FTC](https://ftc-docs.firstinspires.org/en/latest/game_specific_resources/field_coordinate_system/field-coordinate-system.html) на любом поле. Эта система координат используется на полях FTC по умолчанию.

<div className="image-gallery">
  <img src="/img/more-features/ftc-compatibility/ftc-1.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-2.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-3.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-4.webp" />
  <img src="/img/more-features/ftc-compatibility/ftc-5.webp" />
</div>

## Поддерживаемые форматы {#supported-formats}

AdvantageScope включает встроенную поддержку формата потоковой передачи данных в реальном времени **FTC Dashboard** и файлов `.log` **Road Runner**, в дополнение к форматам, совместимым с WPILib, таким как WPILOG и NetworkTables.

Несколько сторонних библиотек телеметрии и логирования FTC выводят данные в форматах, совместимых с AdvantageScope. Разработчики AdvantageScope не рекламируют и не рекомендуют конкретное решение для логирования FTC; при использовании некоторых решений для логирования Вы можете столкнуться с ограниченными возможностями.

Ниже приведен список, служащий отправной точкой, но он не является исчерпывающим:

- [**Road Runner**](https://rr.brott.dev/docs/v1-0/installation/): Генерирует файлы логов для отладки логики планирования траекторий.
- [**FTC Dashboard**](https://acmerobotics.github.io/ftc-dashboard/): Передает телеметрию в реальном времени, совместимую как с собственной панелью управления, так и с AdvantageScope.
- [**FateWeaver**](https://github.com/HermesFTC/FateWeaver): Позволяет настраивать запись данных в несколько форматов, включая файлы логов и потоковую передачу в реальном времени.
- [**Koala Log**](https://github.com/Koala-Log/Koala-Log): Сохраняет данные в формате WPILOG с использованием аннотаций.
- **PsiKit**: Фреймворк логирования и повторного воспроизведения (replay) для FTC, вдохновленный AdvantageKit.

:::warning
Командам необходимо строго соблюдать правило R704 во время соревнований. Сторонние сервисы телеметрии, такие как FTC Dashboard, запрещены при подключении по Wi-Fi на соревнованиях.
:::

### AdvantageScope Lite для FTC {#advantagescope-lite-for-ftc}

Доступен неофициальный дистрибутив AdvantageScope Lite, оптимизированный для FTC: [**AdvantageScope Lite for REV Control System**](https://github.com/j5155/AdvantageScope-Lite-FTC). Этот дистрибутив является неофициальным и не поддерживается разработчиками AdvantageScope.

В то время как стандартный [AdvantageScope Lite](/more-features/advantagescope-lite) — это веб-приложение, предназначенное для использования на Systemcore и FIRST Driver Station, неофициальный дистрибутив для FTC был специально модифицирован для использования непосредственно в существующей системе управления FTC. Он изначально поддерживает просмотр данных в реальном времени по протоколу FTC Dashboard без необходимости установки дополнительного программного обеспечения.
