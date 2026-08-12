---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🗺 2D алаңы {#2d-field}

2D алаңы қойындысы алаң картасының үстіне салынған роботтың 2D визуализациясын көрсетеді. Ол сонымен қатар камера арқылы нысанаға алу күйі мен анықтамалық позалар сияқты қосымша деректерді көрсете алады.

<img src="/img/tab-reference/2d-field-1.webp" alt="2D алаң қойындысының шолуы" />

<details>
<summary>Хронологияны басқару элементтері</summary>

Хронология ойнату мен визуализацияны басқару үшін пайдаланылады. Хронологияны басу уақытты таңдайды, ал оң жақпен басу оны таңдаудан бас тартады. Таңдалған уақыт барлық қойындыларда синхрондалады, бұл басқа көріністерде осы орынды жылдам табуды жеңілдетеді.

Сары бөлімдер роботтың автономды режимін, көк бөлімдер телеоперация режимін, ал сұр бөлімдер утилита режимін көрсетеді.

Масштабтау үшін меңзерді хронологияның үстіне қойып, жоғары немесе төмен айналдырыңыз. `Shift` пернесін басып тұрып басу және сүйреу арқылы ауқымды да таңдауға болады. Көлденең айналдыру арқылы (қолдау көрсетілетін құрылғыларда) немесе хронологияны басып сүйреу арқылы солға және оңға жылжытыңыз. Тікелей қосылған кезде, солға айналдыру ағымдағы уақыттан құлыпты ашады, ал оңға қарай соңына дейін айналдыру қайтадан ағымдағы уақытқа құлыптайды. Робот қосылған кезеңге масштабтау үшін `Ctrl+\` басыңыз.

<img src="/img/tab-reference/timeline.webp" alt="Уақыт шкаласы" />

</details>

## Нысандарды қосу {#adding-objects}

Жұмысты бастау үшін өрісті «Позалар» бөліміне сүйреңіз. Нысанды X түймесін пайдаланып жойыңыз немесе көз белгішесін басу не өріс атауын екі рет басу арқылы уақытша жасырыңыз. Барлық нысандарды жою үшін ось тақырыбының жанындағы себетті басып, содан кейін `Барлығын тазарту` тармағын таңдаңыз. Нысандарды басып сүйреу арқылы тізімде қайта орналастыруға болады.

**Әрбір нысанды баптау үшін түсті белгішені басыңыз немесе өріс атауын оң жақпен басыңыз.** AdvantageScope нысан түрлерінің үлкен санын қолдайды, олардың көбін баптауға болады (мысалы, түстерін өзгерту). Кейбір нысандар бұрыннан бар нысанға еншілес элемент ретінде қосылуы керек.

:::tip
Қолдау көрсетілетін нысан түрлерінің толық тізімін көру үшін `?` белгішесін басыңыз. Бұл тізім сонымен қатар қолдау көрсетілетін деректер түрлерін және нысандардың еншілес элемент ретінде қосылуы қажеттілігін қамтиды.
:::

<img src="/img/tab-reference/2d-field-2.webp" alt="Объектілері бар 2D алаң" />

## Деректер пішімі {#data-format}

Геометрия деректері байтпен кодталған struct немесе protobuf түрінде жариялануы керек. Әртүрлі 2D және 3D геометрия түрлеріне қолдау көрсетіледі, соның ішінде `Pose2d`, `Pose3d`, `Translation2d`, `Translation3d` және т.б.

Көптеген кітапханалар struct пішімін қолдайды, соның ішінде WPILib және AdvantageKit. Төмендегі мысал коды Java тілінде 2D поза деректерін журналындауды көрсетеді.

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
WPILib кітапханасының [`Field2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/field2d-widget.html) класы 2D поза деректерінің бірнеше жиынтығын бірге журналындау үшін де пайдаланылуы мүмкін.
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
// Бұл хаттама заманауи struct пішімін қолдамайды, бірақ поза
// мәндерін "x", "y" және "heading" жұрнақтары бар бөлек
// өрістер арқылы жариялауға болады (төменде көрсетілгендей):
TelemetryPacket packet = new TelemetryPacket();
packet.put("Pose x", 6.3); // Дюйм
packet.put("Pose y", 2.8); // Дюйм
packet.put("Pose heading", 3.14); // Радиан

// Балама ретінде, бағыттарды градуспен де жариялауға болады
packet.put("Pose heading (deg)", 180.0); // Градус

// Басқа телеметрия мәндерін осында қосыңыз...

FtcDashboard.getInstance().sendTelemetryPacket(packet)

// Балама ретінде, MultipleTelemetry және стандартты SDK телеметриясын пайдаланыңыз:
// OpMode Init кезінде:
telemetry = new MultipleTelemetry(telemetry,FtcDashboard.getInstance().getTelemetry());

// Loop кезінде:
telemetry.addData("Pose x", 6.3); // Дюйм
telemetry.addData("Pose y", 2.8); // Дюйм
telemetry.addData("Pose heading", 3.14); // Радиан

// немесе...
telemetry.addData("Pose heading (deg)", 180.0); // Градус

// Басқа телеметрия мәндерін осында қосыңыз...
telemetry.update();
```

</TabItem>
</Tabs>

## Конфигурация {#configuration}

- **Алаң:** Пайдаланылатын алаң кескіні. Соңғы FRC және FTC ойындарының барлығына қолдау көрсетіледі. Таңдамалы алаң кескінін қосу үшін [Таңдамалы активтер](/more-features/custom-assets) бөлімін қараңыз.
- **Бағдар:** Қарау тақтасындағы алаң кескінінің бағдары.
- **Өлшемі:** Роботтың қабырға ұзындығы (FRC үшін 30/27/24 дюйм, FTC үшін 18/16/14 дюйм).

:::info
Бұл қойындыда пайдаланылатын координаттар жүйесін баптауға болады. Толық мәліметтерді [координаттар жүйесі](/more-features/coordinate-systems) бетінен қараңыз.
:::
