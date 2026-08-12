---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 2D-поле {#2d-field}

Вкладка 2D-поля показывает 2D-визуализацию робота, наложенную на карту поля. Она также может показывать дополнительные данные, такие как статус целеуказания зрения и эталонные позы.

<img src="/img/tab-reference/2d-field-1.png" alt="Обзор вкладки 2D поля" />

<details>
<summary>Элементы управления шкалой времени</summary>

Шкала времени используется для управления воспроизведением и визуализацией. Щелчок по шкале времени выбирает время, а щелчок правой кнопкой мыши отменяет его выбор. Выбранное время синхронизируется на всех вкладках, что позволяет легко найти это место в других видах.

Желтые секции указывают, когда робот находится в автономном режиме, синие секции указывают, когда робот находится в телеуправляемом режиме, а серые секции указывают, когда робот находится в служебном режиме.

Чтобы изменить масштаб, поместите курсор на шкалу времени и прокрутите вверх или вниз. Диапазон также можно выбрать щелчком и перетаскиванием с удержанием `Shift`. Перемещайтесь влево и вправо путем горизонтальной прокрутки (на поддерживаемых устройствах) или путем щелчка и перетаскивания на шкале времени. При подключении в реальном времени прокрутка влево отвязывает от текущего времени, а прокрутка до упора вправо снова привязывает к текущему времени. Нажмите `Ctrl+\`, чтобы масштабировать до периода, когда робот включен.

<img src="/img/tab-reference/timeline.png" alt="Временная шкала" />

</details>

## Добавление объектов {#adding-objects}

Чтобы начать работу, перетащите поле в раздел «Позы». Удалите объект с помощью кнопки X или временно скройте его, нажав иконку глаза или дважды щелкнув имя поля. Чтобы удалить все объекты, нажмите на мусорную корзину рядом с заголовком оси, а затем `Очистить все`. Объекты можно переупорядочивать в списке путем щелчка и перетаскивания.

**Чтобы настроить каждый объект, нажмите на цветную иконку или щелкните правой кнопкой мыши по имени поля.** AdvantageScope поддерживает большое количество типов объектов, многие из которых можно настраивать (например, менять цвета). Некоторые объекты должны быть добавлены как дочерние элементы к существующему объекту.

:::tip
Чтобы увидеть полный список поддерживаемых типов объектов, нажмите иконку `?`. Этот список также включает поддерживаемые типы данных и то, должны ли объекты добавляться как дочерние элементы.
:::

<img src="/img/tab-reference/2d-field-2.png" alt="2D поле с объектами" />

## Формат данных {#data-format}

Данные геометрии должны публиковаться в виде закодированных в байты структур (struct) или protobuf. Поддерживаются различные 2D- и 3D-типы геометрии, включая `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` и другие.

Многие библиотеки поддерживают формат struct, включая WPILib и AdvantageKit. Пример кода ниже показывает, как логировать данные 2D-позы на Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

StructPublisher<Pose2d> publisher = NetworkTableInstance.getDefault()
  .getStructTopic("MyPose", Pose2d.struct).publish();
StructArrayPublisher<Pose2d> arrayPublisher = NetworkTableInstance.getDefault()
  .getStructArrayTopic("MyPoseArray", Pose2d.struct).publish();

periodic() {
  publisher.set(poseA);
  arrayPublisher.set(new Pose2d[] {poseA, poseB});
}
```

:::tip
Класс WPILib [`Field2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/field2d-widget.html) также может использоваться для совместного логирования нескольких наборов данных 2D-поз.
:::

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose2d[] {poseA, poseB});
```

</TabItem>
<TabItem value="ftcdashboard" label="FTC Dashboard">

```java
// Этот протокол не поддерживает современный формат struct, но значения
// позы могут публиковаться с использованием отдельных полей, включающих
// суффиксы "x", "y" и "heading" (как показано ниже):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // Дюймы
packet.put("Pose y", 2.8); // Дюймы
packet.put("Pose heading", 3.14); // Радианы

// Альтернативно, направления могут публиковаться в градусах
packet.put("Pose heading (deg)", 180.0); // Градусы

// Добавьте сюда другие телеметрические значения...

FtcDashboard.getInstance().sendTelemetryPacket(packet)

// Или используйте MultipleTelemetry и стандартную телеметрию SDK:
// Во время инициализации OpMode:
telemetry = new MultipleTelemetry(telemetry,FtcDashboard.getInstance().getTelemetry());

// Во время цикла (Loop):
telemetry.addData("Pose x", 6.3); // Дюймы
telemetry.addData("Pose y", 2.8); // Дюймы
telemetry.addData("Pose heading", 3.14); // Радианы

// или...
telemetry.addData("Pose heading (deg)", 180.0); // Градусы

// Добавьте сюда другие телеметрические значения...
telemetry.update();
```

</TabItem>
</Tabs>

## Конфигурация {#configuration}

- **Поле:** Изображение поля для использования. Поддерживаются все недавние игры FRC и FTC. Чтобы добавить пользовательское изображение поля, смотрите [Пользовательские ресурсы](/more-features/custom-assets).
- **Ориентация:** Ориентация изображения поля на панели просмотра.
- **Размер:** Длина стороны робота (30/27/24 дюймов для FRC, 18/16/14 дюймов для FTC).

:::info
Система координат, используемая на этой вкладке, настраивается. Смотрите страницу [системы координат](/more-features/coordinate-systems) для получения подробной информации.
:::
