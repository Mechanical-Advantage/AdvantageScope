---
sidebar_position: 10
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ⚙️ Механизм {#mechanism}

Механизм қойындысы бір немесе бірнеше [Mechanism2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html) нысандары арқылы жасалған топсалы механизмді көрсетеді.

<img src="/img/tab-reference/mechanism-1.webp" alt="Механизм қойындысына шолу" />

_Жоғарыда ағылшын тіліндегі интерфейс көрсетілген._

<details>
<summary>Хронологияны басқару элементтері</summary>

Хронология ойнату мен визуализацияны басқаруға арналған. Хронологияны шертсеңіз, уақыт таңдалады, ал тінтуірдің оң жақ батырмасын бассаңыз, таңдау алынып тасталады. Таңдалған уақыт барлық қойындыларда синхрондалады, сондықтан бұл сәтті басқа көріністерден жылдам табу оңай.

Сары бөліктер роботтың автономды режимде, көк бөліктер телеоперация режимінде, ал сұр бөліктер утилита режимінде болған уақытын көрсетеді.

Масштабтау үшін меңзерді хронологияның үстіне апарып, тінтуір дөңгелегін жоғары немесе төмен айналдырыңыз. Сондай-ақ `Shift` пернесін басып тұрып, шертіп сүйреу арқылы уақыт ауқымын таңдауға болады. Солға және оңға жылжу үшін көлденең айналдырыңыз (қолдау көрсетілетін құрылғыларда) немесе хронологияны басып сүйреңіз. Тікелей қосылым кезінде солға қарай айналдыру ағымдағы уақытқа бекітуді ашады, ал оңға қарай соңына дейін айналдыру қайтадан ағымдағы уақытқа бекітеді. Робот қосулы болған кезеңді масштабтау үшін `Ctrl+\` пернелер тіркесімін басыңыз.

<img src="/img/tab-reference/timeline.webp" alt="Хронология" />

</details>

## Механизмдерді қосу {#adding-mechanisms}

Жұмысты бастау үшін `Mechanism2d` өрісін басқару тақтасына сүйреп апарыңыз. Механизмді жою үшін «X» батырмасын басыңыз, ал уақытша жасыру үшін көз белгішесін басыңыз немесе өріс атауын екі рет шертіңіз. Барлық механизмдерді өшіру үшін ось тақырыбының жанындағы себет белгішесін басып, «Барлығын тазарту» пәрменін таңдаңыз. Тізімдегі механизмдердің ретін басып сүйреу арқылы өзгертуге болады.

## Деректерді жариялау {#publishing-data}

Механизм деректерін жариялау үшін `Mechanism2d` нысанын жүйелі түрде журналдаңыз (төменде көрсетілген). Бұл шақыру `Mechanism2d` нысанының тек ағымдағы күйін жазып алатынын ескеріңіз, сондықтан оны нысан жаңартылғаннан кейін әрбір цикл сайын шақыру қажет.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

```java
Mechanism2d mechanism = new Mechanism2d(3, 3);

periodic() {
  Telemetry.log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

```cpp
wpi::Mechanism2d mechanism{3, 3};

void Periodic() {
  wpi::telemetry::Log("MyMechanism", mechanism);
}
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

```python
import wpilib
import telemetry

mechanism = wpilib.Mechanism2d(3, 3)

def periodic():
    telemetry.log("MyMechanism", mechanism)
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
LoggedMechanism2d mechanism = new LoggedMechanism2d(3, 3);

periodic() {
  Logger.recordOutput("MyMechanism", mechanism);
}
```

:::tip
`Logger.recordOutput` әдісін шақырмай-ақ, механизм күйін әрбір цикл сайын автоматты түрде журналдау үшін AdvantageKit кітапханасының [@AutoLogOutput](https://docs.advantagekit.org/data-flow/recording-outputs/annotation-logging) аннотациясын пайдалануға болады.
:::

</TabItem>
</Tabs>
